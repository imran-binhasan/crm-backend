export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface FileUploadResult {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface FileUploadOptions {
  folder?: string;
  fileName?: string;
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  quality?: string;
  overwrite?: boolean;
}

export enum UploadEntityType {
  USER = 'user',
  COMPANY = 'company',
  CONTACT = 'contact',
  PROJECT = 'project',
  INVOICE = 'invoice',
  EMPLOYEE = 'employee',
  ACTIVITY = 'activity',
}

export interface EntityUploadConfig {
  entityType: UploadEntityType;
  entityId: string;
  subType?: string; // e.g., 'avatar', 'logo', 'document'
}
