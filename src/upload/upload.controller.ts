import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UploadService } from './upload.service';
import { UploadEntityType } from './interfaces/upload.interface';

@Controller('api/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post(':entityType/:entityId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body('subType') subType?: string,
    @Body('fileName') fileName?: string,
    @UploadedFile() file?: any,
    @CurrentUser() user?: User,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Validate entity type
      if (!Object.values(UploadEntityType).includes(entityType as UploadEntityType)) {
        throw new BadRequestException('Invalid entity type');
      }

      // Convert Express.Multer.File to our UploadedFile interface
      const uploadedFile = {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      };

      const config = this.uploadService.getUploadConfig(
        entityType as UploadEntityType,
        entityId,
        subType,
      );

      const result = await this.uploadService.uploadFile(uploadedFile, config);

      this.logger.log(
        `File uploaded successfully by user ${user?.id} for ${entityType}:${entityId}`,
      );

      return {
        success: true,
        data: result,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Delete('file/:publicId')
  async deleteFile(
    @Param('publicId') publicId: string,
    @CurrentUser() user: User,
  ) {
    try {
      await this.uploadService.deleteFile(publicId);

      this.logger.log(`File deleted successfully by user ${user.id}: ${publicId}`);

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  // Entity-specific upload endpoints for better UX
  @Post('user/:userId/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: any,
    @CurrentUser() user: User,
  ) {
    const uploadedFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    const config = this.uploadService.getUploadConfig(
      UploadEntityType.USER,
      userId,
      'avatar',
    );

    const result = await this.uploadService.uploadFile(uploadedFile, config);
    return { success: true, data: result };
  }

  @Post('company/:companyId/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanyLogo(
    @Param('companyId') companyId: string,
    @UploadedFile() file: any,
    @CurrentUser() user: User,
  ) {
    const uploadedFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    const config = this.uploadService.getUploadConfig(
      UploadEntityType.COMPANY,
      companyId,
      'logo',
    );

    const result = await this.uploadService.uploadFile(uploadedFile, config);
    return { success: true, data: result };
  }

  @Post('project/:projectId/document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProjectDocument(
    @Param('projectId') projectId: string,
    @UploadedFile() file: any,
    @CurrentUser() user: User,
  ) {
    const uploadedFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    const config = this.uploadService.getUploadConfig(
      UploadEntityType.PROJECT,
      projectId,
      'document',
    );

    const result = await this.uploadService.uploadFile(uploadedFile, config);
    return { success: true, data: result };
  }
}
