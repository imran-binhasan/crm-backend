import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { UploadService } from './upload.service';
import { User } from '../users/entities/user.entity';
import { FileUploadInput, FileUploadResponse, DeleteFileInput } from './dto/upload.dto';

@Resolver()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Mutation(() => String, { 
    name: 'uploadFile',
    description: 'Upload a file for a specific entity. Returns upload instructions.' 
  })
  @RequireResource(ResourceType.USER, ActionType.UPDATE) // Basic permission check
  async uploadFile(
    @Args('uploadInput') uploadInput: FileUploadInput,
    @CurrentUser() user: User,
  ): Promise<string> {
    // This is a placeholder mutation since GraphQL doesn't handle file uploads directly
    // In a real implementation, you would use Apollo Upload Scalar or similar
    const instructions = {
      message: 'To upload files, use the REST endpoint',
      endpoint: `/api/upload/${uploadInput.entityType}/${uploadInput.entityId}`,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer <your-jwt-token>',
        'Content-Type': 'multipart/form-data',
      },
      formData: {
        file: '<file-to-upload>',
        subType: uploadInput.subType || '',
        fileName: uploadInput.fileName || '',
      },
    };

    return JSON.stringify(instructions, null, 2);
  }

  @Mutation(() => Boolean, { name: 'deleteFile' })
  @RequireResource(ResourceType.USER, ActionType.DELETE) // Basic permission check
  async deleteFile(
    @Args('deleteInput') deleteInput: DeleteFileInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    try {
      await this.uploadService.deleteFile(deleteInput.publicId);
      return true;
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }
}
