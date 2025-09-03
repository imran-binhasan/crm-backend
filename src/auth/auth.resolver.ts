import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { ChangePasswordInput, RefreshTokenInput } from './dto/auth-extra.input';
import { AuthResponse } from './dto/auth-response.dto';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args('refreshTokenInput') refreshTokenInput: RefreshTokenInput,
  ): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Args('changePasswordInput') changePasswordInput: ChangePasswordInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.authService.changePassword(user.id, changePasswordInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User): Promise<boolean> {
    return this.authService.logout(user.id);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.authService.getCurrentUserProfile(user.id);
  }

  @Query(() => String, { name: 'myPermissions' })
  @UseGuards(JwtAuthGuard)
  async getCurrentUserPermissions(@CurrentUser() user: User): Promise<string> {
    const permissions = await this.authService.getCurrentUserPermissions(user.id);
    return JSON.stringify(permissions);
  }
}
