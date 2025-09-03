import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreateAttendanceInput, AttendanceStatus, ApprovalStatus } from './dto/create-attendance.input';
import { UpdateAttendanceInput } from './dto/update-attendance.input';
import { Attendance } from './entities/attendance.entity';
import { AttendanceMapper } from './mappers/attendance.mapper';
import { ResourceType } from '../common/rbac/permission.types';

@Injectable()
export class AttendanceService extends BaseService<Attendance, CreateAttendanceInput, UpdateAttendanceInput> {
  protected readonly resourceType = ResourceType.ATTENDANCE;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, AttendanceService.name);
  }

  protected mapToDomain(prismaEntity: any): Attendance | null {
    return AttendanceMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreateAttendanceInput, currentUserId: string): Promise<Attendance> {
    const attendanceData = {
      date: new Date(data.date),
      checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
      checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      hoursWorked: data.hoursWorked,
      breakTime: data.breakTime,
      status: data.status,
      workLocation: data.workLocation,
      notes: data.notes,
      reasonForAbsence: data.reasonForAbsence,
      isOvertime: data.isOvertime || false,
      overtimeHours: data.overtimeHours,
      isHoliday: data.isHoliday || false,
      isWeekend: data.isWeekend || false,
      latitude: data.latitude,
      longitude: data.longitude,
      ipAddress: data.ipAddress,
      employeeId: data.employeeId,
      approvedById: data.approvedById,
      approvalStatus: data.approvalStatus || ApprovalStatus.PENDING,
      createdById: currentUserId,
    };

    const created = await this.prisma.attendance.create({
      data: attendanceData,
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(created)!;
  }

  protected async performUpdate(id: string, data: UpdateAttendanceInput, currentUserId: string): Promise<Attendance> {
    const updateData: any = {};

    if (data.date) updateData.date = new Date(data.date);
    if (data.checkIn) updateData.checkIn = new Date(data.checkIn);
    if (data.checkOut) updateData.checkOut = new Date(data.checkOut);
    if (data.hoursWorked !== undefined) updateData.hoursWorked = data.hoursWorked;
    if (data.breakTime !== undefined) updateData.breakTime = data.breakTime;
    if (data.status) updateData.status = data.status;
    if (data.workLocation !== undefined) updateData.workLocation = data.workLocation;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.reasonForAbsence !== undefined) updateData.reasonForAbsence = data.reasonForAbsence;
    if (data.isOvertime !== undefined) updateData.isOvertime = data.isOvertime;
    if (data.overtimeHours !== undefined) updateData.overtimeHours = data.overtimeHours;
    if (data.isHoliday !== undefined) updateData.isHoliday = data.isHoliday;
    if (data.isWeekend !== undefined) updateData.isWeekend = data.isWeekend;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.ipAddress !== undefined) updateData.ipAddress = data.ipAddress;
    if (data.employeeId) updateData.employeeId = data.employeeId;
    if (data.approvedById !== undefined) updateData.approvedById = data.approvedById;
    if (data.approvalStatus) updateData.approvalStatus = data.approvalStatus;

    updateData.updatedAt = new Date();

    const updated = await this.prisma.attendance.update({
      where: { id },
      data: updateData,
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(updated)!;
  }

  protected async performFindMany(options: any): Promise<Attendance[]> {
    const { where, orderBy, take, skip } = options;
    
    const whereClause = {
      ...where,
      deletedAt: null,
    };

    const data = await this.prisma.attendance.findMany({
      where: whereClause,
      orderBy: orderBy || { date: 'desc' },
      take,
      skip,
      include: this.getIncludeRelations(),
    });

    return AttendanceMapper.toDomainArray(data);
  }

  protected async performFindUnique(id: string): Promise<Attendance | null> {
    const result = await this.prisma.attendance.findUnique({
      where: { id },
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.attendance.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.attendance.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    const { where } = options;
    
    const whereClause = {
      ...where,
      deletedAt: null,
    };

    return await this.prisma.attendance.count({
      where: whereClause,
    });
  }

  // HR-specific attendance methods

  async checkIn(
    employeeId: string,
    location?: { latitude?: number; longitude?: number },
    workLocation?: string,
    notes?: string,
    userId: string = 'system',
  ): Promise<Attendance> {
    // Check if employee already has attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
        deletedAt: null,
      },
    });

    if (existingAttendance) {
      // Update existing attendance with check-in
      const updated = await this.prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkIn: new Date(),
          latitude: location?.latitude,
          longitude: location?.longitude,
          workLocation,
          notes,
          status: AttendanceStatus.PRESENT,
          updatedAt: new Date(),
        },
        include: this.getIncludeRelations(),
      });

      return this.mapToDomain(updated)!;
    }

    // Create new attendance record
    const createInput: CreateAttendanceInput = {
      date: today.toISOString(),
      checkIn: new Date().toISOString(),
      status: AttendanceStatus.PRESENT,
      employeeId,
      workLocation,
      notes,
      latitude: location?.latitude,
      longitude: location?.longitude,
    };

    return await this.create(createInput, userId);
  }

  async checkOut(
    attendanceId: string,
    location?: { latitude?: number; longitude?: number },
    notes?: string,
    userId: string = 'system',
  ): Promise<Attendance> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    const checkOutTime = new Date();
    let hoursWorked = 0;

    if (attendance.checkIn) {
      const checkInTime = new Date(attendance.checkIn);
      let calculatedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      // Subtract break time if any
      if (attendance.breakTime && typeof attendance.breakTime === 'number') {
        const breakInHours = attendance.breakTime / 60; // breakTime is in minutes
        calculatedHours = calculatedHours - breakInHours;
      }
      hoursWorked = calculatedHours;
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOut: checkOutTime,
        hoursWorked,
        latitude: location?.latitude,
        longitude: location?.longitude,
        notes: notes || attendance.notes,
        updatedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(updated)!;
  }

  async findByEmployee(
    employeeId: string,
    userId: string,
    dateRange?: { startDate?: Date; endDate?: Date },
    pagination?: { page?: number; limit?: number },
  ): Promise<Attendance[]> {
    const where: any = {
      employeeId,
      deletedAt: null,
    };

    if (dateRange) {
      where.date = {};
      if (dateRange.startDate) {
        where.date.gte = dateRange.startDate;
      }
      if (dateRange.endDate) {
        where.date.lte = dateRange.endDate;
      }
    }

    const result = await this.findAll(userId, pagination, { where });
    return result.data;
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    userId: string,
    employeeId?: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<Attendance[]> {
    const where: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const result = await this.findAll(userId, pagination, { where });
    return result.data;
  }

  async findByStatus(
    status: AttendanceStatus,
    userId: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<Attendance[]> {
    const where = {
      status,
      deletedAt: null,
    };

    const result = await this.findAll(userId, pagination, { where });
    return result.data;
  }

  async findPendingApprovals(
    userId: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<Attendance[]> {
    const where = {
      approvalStatus: ApprovalStatus.PENDING,
      deletedAt: null,
    };

    const result = await this.findAll(userId, pagination, { where });
    return result.data;
  }

  async findTodayAttendance(
    employeeId: string,
    userId: string,
  ): Promise<Attendance | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: tomorrow,
        },
        deletedAt: null,
      },
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(attendance);
  }

  async approveAttendance(
    attendanceId: string,
    approved: boolean,
    userId: string,
    notes?: string,
  ): Promise<Attendance> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        approvalStatus: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
        approvedById: userId,
        approvedAt: new Date(),
        notes: notes || attendance.notes,
        updatedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(updated)!;
  }

  async requestOvertime(
    attendanceId: string,
    overtimeHours: number,
    reason: string,
    userId: string,
  ): Promise<Attendance> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        isOvertime: true,
        overtimeHours,
        notes: reason,
        approvalStatus: ApprovalStatus.PENDING,
        updatedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(updated)!;
  }

  async markAsAbsent(
    employeeId: string,
    date: Date,
    reason?: string,
    userId: string = 'system',
  ): Promise<Attendance> {
    const createInput: CreateAttendanceInput = {
      date: date.toISOString(),
      status: AttendanceStatus.ABSENT,
      employeeId,
      reasonForAbsence: reason,
    };

    return await this.create(createInput, userId);
  }

  async markAsLate(
    employeeId: string,
    checkInTime: Date,
    workLocation?: string,
    userId: string = 'system',
  ): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const createInput: CreateAttendanceInput = {
      date: today.toISOString(),
      checkIn: checkInTime.toISOString(),
      status: AttendanceStatus.LATE,
      employeeId,
      workLocation,
    };

    return await this.create(createInput, userId);
  }

  async getAttendanceSummary(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    halfDays: number;
    workFromHomeDays: number;
    totalHours: number;
    overtimeHours: number;
  }> {
    const attendances = await this.findByEmployee(
      employeeId,
      userId,
      { startDate, endDate },
    );

    const summary = {
      totalDays: attendances.length,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      workFromHomeDays: 0,
      totalHours: 0,
      overtimeHours: 0,
    };

    attendances.forEach(attendance => {
      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          summary.presentDays++;
          break;
        case AttendanceStatus.ABSENT:
          summary.absentDays++;
          break;
        case AttendanceStatus.LATE:
          summary.lateDays++;
          break;
        case AttendanceStatus.HALF_DAY:
          summary.halfDays++;
          break;
        case AttendanceStatus.WORK_FROM_HOME:
          summary.workFromHomeDays++;
          break;
      }

      if (attendance.hoursWorked) {
        summary.totalHours += attendance.hoursWorked;
      }

      if (attendance.overtimeHours) {
        summary.overtimeHours += attendance.overtimeHours;
      }
    });

    return summary;
  }

  private getIncludeRelations() {
    return {
      employee: true,
      approvedBy: true,
      createdBy: true,
    };
  }
}
