import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedFile, FileUploadResult } from './interfaces/upload.interface';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    this.logger.log('Cloudinary service initialized');
  }

  private validateConfig(): void {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Cloudinary configuration is incomplete. Please check your environment variables.',
      );
    }
  }

  async uploadFile(
    file: UploadedFile,
    folder: string,
    fileName?: string,
  ): Promise<FileUploadResult> {
    this.validateConfig();

    try {
      // This is a placeholder implementation
      // In a real implementation, you would use the actual Cloudinary SDK
      const mockUrl = `https://res.cloudinary.com/${this.configService.get('CLOUDINARY_CLOUD_NAME')}/image/upload/v1234567890/${folder}/${fileName || 'file'}.jpg`;
      
      this.logger.log(`File uploaded to folder: ${folder}`);
      
      return {
        url: mockUrl,
        publicId: `${folder}/${fileName || 'file'}`,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new InternalServerErrorException(
        `File upload failed: ${error.message}`,
      );
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    this.validateConfig();

    try {
      // This is a placeholder implementation
      this.logger.log(`File deleted: ${publicId}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  // CRM-specific upload methods
  async uploadUserAvatar(file: UploadedFile, userId: string): Promise<FileUploadResult> {
    const folder = `crm/users/${userId}`;
    return this.uploadFile(file, folder, `avatar_${userId}`);
  }

  async uploadCompanyLogo(file: UploadedFile, companyId: string): Promise<FileUploadResult> {
    const folder = `crm/companies/${companyId}`;
    return this.uploadFile(file, folder, `logo_${companyId}`);
  }

  async uploadContactPhoto(file: UploadedFile, contactId: string): Promise<FileUploadResult> {
    const folder = `crm/contacts/${contactId}`;
    return this.uploadFile(file, folder, `photo_${contactId}`);
  }

  async uploadProjectDocument(
    file: UploadedFile,
    projectId: string,
    documentName?: string,
  ): Promise<FileUploadResult> {
    const folder = `crm/projects/${projectId}/documents`;
    const fileName = documentName || `doc_${Date.now()}`;
    return this.uploadFile(file, folder, fileName);
  }

  async uploadInvoiceDocument(file: UploadedFile, invoiceId: string): Promise<FileUploadResult> {
    const folder = `crm/invoices/${invoiceId}`;
    return this.uploadFile(file, folder, `invoice_${invoiceId}`);
  }

  async uploadEmployeeDocument(
    file: UploadedFile,
    employeeId: string,
    documentType: string,
  ): Promise<FileUploadResult> {
    const folder = `crm/employees/${employeeId}/${documentType}`;
    const fileName = `${documentType}_${employeeId}_${Date.now()}`;
    return this.uploadFile(file, folder, fileName);
  }

  async uploadActivityAttachment(file: UploadedFile, activityId: string): Promise<FileUploadResult> {
    const folder = `crm/activities/${activityId}`;
    const fileName = `attachment_${Date.now()}`;
    return this.uploadFile(file, folder, fileName);
  }

  async uploadGenericFile(
    file: UploadedFile,
    folder: string,
    fileName?: string,
  ): Promise<FileUploadResult> {
    return this.uploadFile(file, `crm/${folder}`, fileName);
  }

  // Utility method to extract public ID from Cloudinary URL
  extractPublicId(cloudinaryUrl: string): string {
    try {
      const parts = cloudinaryUrl.split('/');
      const filename = parts[parts.length - 1];
      return filename.split('.')[0]; // Remove file extension
    } catch (error) {
      this.logger.error(`Failed to extract public ID from URL: ${cloudinaryUrl}`);
      throw new InternalServerErrorException('Invalid Cloudinary URL');
    }
  }
}
