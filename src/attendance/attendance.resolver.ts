import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceInput, AttendanceStatus } from './dto/create-attendance.input';
import { UpdateAttendanceInput } from './dto/update-attendance.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Attendance)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AttendanceResolver {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.CREATE)
  async createAttendance(
    @Args('createAttendanceInput') createAttendanceInput: CreateAttendanceInput,
    @CurrentUser() user: User,
  ): Promise<Attendance> {
    return this.attendanceService.create(createAttendanceInput, user.id);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.CREATE)
  async checkIn(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('latitude', { type: () => Number, nullable: true }) latitude?: number,
    @Args('longitude', { type: () => Number, nullable: true }) longitude?: number,
    @Args('workLocation', { type: () => String, nullable: true }) workLocation?: string,
    @Args('notes', { type: () => String, nullable: true }) notes?: string,
    @CurrentUser() user?: User,
  ): Promise<Attendance> {
    return this.attendanceService.checkIn(
      employeeId,
      { latitude, longitude },
      workLocation,
      notes,
      user!.id,
    );
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.UPDATE)
  async checkOut(
    @Args('attendanceId', { type: () => ID }) attendanceId: string,
    @Args('latitude', { type: () => Number, nullable: true }) latitude?: number,
    @Args('longitude', { type: () => Number, nullable: true }) longitude?: number,
    @Args('notes', { type: () => String, nullable: true }) notes?: string,
    @CurrentUser() user?: User,
  ): Promise<Attendance> {
    return this.attendanceService.checkOut(
      attendanceId,
      { latitude, longitude },
      notes,
      user!.id,
    );
  }

  @Query(() => [Attendance], { name: 'attendance' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Attendance[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const result = await this.attendanceService.findAll(user!.id, pagination);
    return result.data;
  }

  @Query(() => Attendance, { name: 'attendanceById' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Attendance> {
    return this.attendanceService.findOne(id, user.id);
  }

  @Query(() => [Attendance], { name: 'attendanceByEmployee' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findByEmployee(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Attendance[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.attendanceService.findByEmployee(
      employeeId, 
      user!.id, 
      { startDate, endDate },
      pagination,
    );
  }

  @Query(() => [Attendance], { name: 'attendanceByDateRange' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findByDateRange(
    @Args('startDate', { type: () => Date }) startDate: Date,
    @Args('endDate', { type: () => Date }) endDate: Date,
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Attendance[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.attendanceService.findByDateRange(
      startDate,
      endDate,
      user!.id,
      employeeId,
      pagination,
    );
  }

  @Query(() => [Attendance], { name: 'attendanceByStatus' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findByStatus(
    @Args('status', { type: () => AttendanceStatus }) status: AttendanceStatus,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Attendance[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.attendanceService.findByStatus(status, user!.id, pagination);
  }

  @Query(() => [Attendance], { name: 'pendingAttendanceApprovals' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findPendingApprovals(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Attendance[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.attendanceService.findPendingApprovals(user!.id, pagination);
  }

  @Query(() => Attendance, { name: 'todayAttendance', nullable: true })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findTodayAttendance(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @CurrentUser() user: User,
  ): Promise<Attendance | null> {
    return this.attendanceService.findTodayAttendance(employeeId, user.id);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.UPDATE)
  async updateAttendance(
    @Args('updateAttendanceInput') updateAttendanceInput: UpdateAttendanceInput,
    @CurrentUser() user: User,
  ): Promise<Attendance> {
    return this.attendanceService.update(updateAttendanceInput.id, updateAttendanceInput, user.id);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.UPDATE)
  async approveAttendance(
    @Args('attendanceId', { type: () => ID }) attendanceId: string,
    @Args('approved', { type: () => Boolean }) approved: boolean,
    @Args('notes', { type: () => String, nullable: true }) notes?: string,
    @CurrentUser() user?: User,
  ): Promise<Attendance> {
    return this.attendanceService.approveAttendance(
      attendanceId,
      approved,
      user!.id,
      notes,
    );
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.CREATE)
  async markAsAbsent(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date', { type: () => Date }) date: Date,
    @Args('reason', { type: () => String, nullable: true }) reason?: string,
    @CurrentUser() user?: User,
  ): Promise<Attendance> {
    return this.attendanceService.markAsAbsent(employeeId, date, reason, user!.id);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.CREATE)
  async markAsLate(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('checkInTime', { type: () => Date }) checkInTime: Date,
    @Args('workLocation', { type: () => String, nullable: true }) workLocation?: string,
    @CurrentUser() user?: User,
  ): Promise<Attendance> {
    return this.attendanceService.markAsLate(employeeId, checkInTime, workLocation, user!.id);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.UPDATE)
  async requestOvertime(
    @Args('attendanceId', { type: () => ID }) attendanceId: string,
    @Args('overtimeHours', { type: () => Number }) overtimeHours: number,
    @Args('reason', { type: () => String }) reason: string,
    @CurrentUser() user: User,
  ): Promise<Attendance> {
    return this.attendanceService.requestOvertime(
      attendanceId,
      overtimeHours,
      reason,
      user.id,
    );
  }

  @Query(() => String, { name: 'attendanceSummary' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async getAttendanceSummary(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('startDate', { type: () => Date }) startDate: Date,
    @Args('endDate', { type: () => Date }) endDate: Date,
    @CurrentUser() user: User,
  ): Promise<string> {
    const summary = await this.attendanceService.getAttendanceSummary(
      employeeId,
      startDate,
      endDate,
      user.id,
    );
    return JSON.stringify(summary);
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.DELETE)
  async removeAttendance(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.attendanceService.remove(id, user.id);
    return true;
  }
}
