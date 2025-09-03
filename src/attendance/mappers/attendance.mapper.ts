import { Injectable } from '@nestjs/common';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceStatus, ApprovalStatus } from '../dto/create-attendance.input';

@Injectable()
export class AttendanceMapper {
  static toDomain(prismaAttendance: any): Attendance | null {
    if (!prismaAttendance) return null;

    const attendance = new Attendance();
    attendance.id = prismaAttendance.id;
    attendance.date = prismaAttendance.date;
    attendance.checkIn = prismaAttendance.checkIn || null;
    attendance.checkOut = prismaAttendance.checkOut || null;
    attendance.hoursWorked = prismaAttendance.hoursWorked || null;
    attendance.breakTime = prismaAttendance.breakTime || null;
    attendance.status = prismaAttendance.status as AttendanceStatus;
    attendance.workLocation = prismaAttendance.workLocation || null;
    attendance.notes = prismaAttendance.notes || null;
    attendance.reasonForAbsence = prismaAttendance.reasonForAbsence || null;
    attendance.isOvertime = prismaAttendance.isOvertime || false;
    attendance.overtimeHours = prismaAttendance.overtimeHours || null;
    attendance.isHoliday = prismaAttendance.isHoliday || false;
    attendance.isWeekend = prismaAttendance.isWeekend || false;
    attendance.latitude = prismaAttendance.latitude || null;
    attendance.longitude = prismaAttendance.longitude || null;
    attendance.ipAddress = prismaAttendance.ipAddress || null;
    attendance.employeeId = prismaAttendance.employeeId;
    attendance.approvedById = prismaAttendance.approvedById || null;
    attendance.approvedAt = prismaAttendance.approvedAt || null;
    attendance.approvalStatus = prismaAttendance.approvalStatus as ApprovalStatus;
    attendance.createdById = prismaAttendance.createdById || null;
    attendance.createdAt = prismaAttendance.createdAt;
    attendance.updatedAt = prismaAttendance.updatedAt;
    attendance.deletedAt = prismaAttendance.deletedAt || null;

    // Handle relations
    if (prismaAttendance.employee) {
      attendance.employee = prismaAttendance.employee;
    }
    if (prismaAttendance.approvedBy) {
      attendance.approvedBy = prismaAttendance.approvedBy;
    }
    if (prismaAttendance.createdBy) {
      attendance.createdBy = prismaAttendance.createdBy;
    }

    return attendance;
  }

  static toDomainArray(prismaAttendances: any[]): Attendance[] {
    if (!prismaAttendances || !Array.isArray(prismaAttendances)) return [];
    return prismaAttendances.map(attendance => AttendanceMapper.toDomain(attendance)).filter(Boolean) as Attendance[];
  }
}
