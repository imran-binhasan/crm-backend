import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
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
  async checkIn(
    @Args('createAttendanceDto') createAttendanceDto: CreateAttendanceDto,
    @CurrentUser() user: User,
  ): Promise<Attendance> {
    return this.attendanceService.checkIn(createAttendanceDto, user.id);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.UPDATE)
  async checkOut(
    @Args('attendanceId', { type: () => ID }) attendanceId: string,
    @Args('latitude', { type: () => Number, nullable: true }) latitude?: number,
    @Args('longitude', { type: () => Number, nullable: true }) longitude?: number,
    @CurrentUser() user?: User,
  ): Promise<Attendance> {
    return this.attendanceService.checkOut(attendanceId, user.id, { latitude, longitude });
  }

  @Query(() => [Attendance], { name: 'attendance' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findAll(@CurrentUser() user: User): Promise<Attendance[]> {
    return this.attendanceService.findAll(user.id);
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
    @CurrentUser() user?: User,
  ): Promise<Attendance[]> {
    return this.attendanceService.findByEmployee(employeeId, user.id, { startDate, endDate });
  }

  @Query(() => [Attendance], { name: 'attendanceByDateRange' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findByDateRange(
    @Args('startDate', { type: () => Date }) startDate: Date,
    @Args('endDate', { type: () => Date }) endDate: Date,
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @CurrentUser() user?: User,
  ): Promise<Attendance[]> {
    return this.attendanceService.findByDateRange(startDate, endDate, user.id, employeeId);
  }

  @Query(() => [Attendance], { name: 'pendingAttendanceApprovals' })
  @RequireResource(ResourceType.ATTENDANCE, ActionType.READ)
  async findPendingApprovals(@CurrentUser() user: User): Promise<Attendance[]> {
    return this.attendanceService.findPendingApprovals(user.id);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.UPDATE)
  async updateAttendance(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateAttendanceDto') updateAttendanceDto: UpdateAttendanceDto,
    @CurrentUser() user: User,
  ): Promise<Attendance> {
    return this.attendanceService.update(id, updateAttendanceDto, user.id);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.UPDATE)
  async approveAttendance(
    @Args('attendanceId', { type: () => ID }) attendanceId: string,
    @Args('approved', { type: () => Boolean }) approved: boolean,
    @Args('notes', { type: () => String, nullable: true }) notes?: string,
    @CurrentUser() user?: User,
  ): Promise<Attendance> {
    return this.attendanceService.approveAttendance(attendanceId, approved, user.id, notes);
  }

  @Mutation(() => Attendance)
  @RequireResource(ResourceType.ATTENDANCE, ActionType.UPDATE)
  async requestOvertime(
    @Args('attendanceId', { type: () => ID }) attendanceId: string,
    @Args('overtimeHours', { type: () => Number }) overtimeHours: number,
    @Args('reason', { type: () => String }) reason: string,
    @CurrentUser() user: User,
  ): Promise<Attendance> {
    return this.attendanceService.requestOvertime(attendanceId, overtimeHours, reason, user.id);
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
