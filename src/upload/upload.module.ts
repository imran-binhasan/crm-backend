import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './upload.service';
import { CloudinaryService } from './cloudinary.service';
import { UploadResolver } from './upload.resolver';
import { UploadController } from './upload.controller';

@Module({
  imports: [ConfigModule],
  providers: [UploadService, CloudinaryService, UploadResolver],
  controllers: [UploadController],
  exports: [UploadService, CloudinaryService],
})
export class UploadModule {}
