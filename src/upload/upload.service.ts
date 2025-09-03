import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import {
  UploadedFile,
  FileUploadResult,
  FileUploadOptions,
  UploadEntityType,
  EntityUploadConfig,
} from './interfaces/upload.interface';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  // File size limits (in bytes)
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images

  // Allowed MIME types
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadFile(
    file: UploadedFile,
    config: EntityUploadConfig,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(file, options);

      // Route to appropriate upload method based on entity type
      switch (config.entityType) {
        case UploadEntityType.USER:
          return this.uploadUserFile(file, config);
        case UploadEntityType.COMPANY:
          return this.uploadCompanyFile(file, config);
        case UploadEntityType.CONTACT:
          return this.uploadContactFile(file, config);
        case UploadEntityType.PROJECT:
          return this.uploadProjectFile(file, config);
        case UploadEntityType.INVOICE:
          return this.uploadInvoiceFile(file, config);
        case UploadEntityType.EMPLOYEE:
          return this.uploadEmployeeFile(file, config);
        case UploadEntityType.ACTIVITY:
          return this.uploadActivityFile(file, config);
        default:
          throw new BadRequestException('Unsupported entity type');
      }
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw error;
    }
  }

  private async uploadUserFile(
    file: UploadedFile,
    config: EntityUploadConfig,
  ): Promise<FileUploadResult> {
    if (config.subType === 'avatar') {
      this.validateImageFile(file);
      return this.cloudinaryService.uploadUserAvatar(file, config.entityId);
    }
    throw new BadRequestException('Invalid subType for user upload');
  }

  private async uploadCompanyFile(
    file: UploadedFile,
    config: EntityUploadConfig,
  ): Promise<FileUploadResult> {
    if (config.subType === 'logo') {
      this.validateImageFile(file);
      return this.cloudinaryService.uploadCompanyLogo(file, config.entityId);
    }
    throw new BadRequestException('Invalid subType for company upload');
  }

  private async uploadContactFile(
    file: UploadedFile,
    config: EntityUploadConfig,
  ): Promise<FileUploadResult> {
    if (config.subType === 'photo') {
      this.validateImageFile(file);
      return this.cloudinaryService.uploadContactPhoto(file, config.entityId);
    }
    throw new BadRequestException('Invalid subType for contact upload');
  }

  private async uploadProjectFile(
    file: UploadedFile,
    config: EntityUploadConfig,
  ): Promise<FileUploadResult> {
    if (config.subType === 'document') {
      this.validateDocumentFile(file);
      return this.cloudinaryService.uploadProjectDocument(
        file,
        config.entityId,
        file.originalname,
      );
    }
    throw new BadRequestException('Invalid subType for project upload');
  }

  private async uploadInvoiceFile(
    file: UploadedFile,
    config: EntityUploadConfig,
  ): Promise<FileUploadResult> {
    if (config.subType === 'document') {
      this.validateDocumentFile(file);
      return this.cloudinaryService.uploadInvoiceDocument(file, config.entityId);
    }
    throw new BadRequestException('Invalid subType for invoice upload');
  }

  private async uploadEmployeeFile(
    file: UploadedFile,
    config: EntityUploadConfig,
  ): Promise<FileUploadResult> {
    if (config.subType && ['resume', 'contract', 'id_document'].includes(config.subType)) {
      this.validateDocumentFile(file);
      return this.cloudinaryService.uploadEmployeeDocument(
        file,
        config.entityId,
        config.subType,
      );
    }
    throw new BadRequestException('Invalid subType for employee upload');
  }

  private async uploadActivityFile(
    file: UploadedFile,
    config: EntityUploadConfig,
  ): Promise<FileUploadResult> {
    if (config.subType === 'attachment') {
      this.validateFile(file); // Allow both images and documents
      return this.cloudinaryService.uploadActivityAttachment(file, config.entityId);
    }
    throw new BadRequestException('Invalid subType for activity upload');
  }

  async deleteFile(publicId: string): Promise<void> {
    return this.cloudinaryService.deleteFile(publicId);
  }

  private validateFile(file: UploadedFile, options?: FileUploadOptions): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    const maxSize = options?.maxSize || this.MAX_FILE_SIZE;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`,
      );
    }

    if (options?.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private validateImageFile(file: UploadedFile): void {
    this.validateFile(file, {
      maxSize: this.MAX_IMAGE_SIZE,
      allowedMimeTypes: this.ALLOWED_IMAGE_TYPES,
    });
  }

  private validateDocumentFile(file: UploadedFile): void {
    const allowedTypes = [...this.ALLOWED_DOCUMENT_TYPES, ...this.ALLOWED_IMAGE_TYPES];
    this.validateFile(file, {
      maxSize: this.MAX_FILE_SIZE,
      allowedMimeTypes: allowedTypes,
    });
  }

  // Utility method to get upload configuration for different entities
  getUploadConfig(entityType: UploadEntityType, entityId: string, subType?: string): EntityUploadConfig {
    return {
      entityType,
      entityId,
      subType,
    };
  }
}
