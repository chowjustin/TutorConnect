import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { S3Service } from '../s3/s3.service';
import { UploadService } from './upload.service';
import {
  imageFileFilter,
  materialFileFilter,
  multerLimits,
  multerStorage,
  objectKey,
} from './multer.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly s3: S3Service,
  ) {}

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('profile-picture', {
      storage: multerStorage,
      fileFilter: imageFileFilter,
      limits: multerLimits,
    }),
  )
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { sub: string } },
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.uploadService.saveProfilePicture(req.user.sub, file, req);
  }

  /**
   * Generic verification document upload (KTP, ijazah). Returns
   * { file_url, path } so the client can attach paths to POST /tutors/verification.
   */
  @Post('verification-doc')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('verification-doc', {
      storage: multerStorage,
      fileFilter: materialFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadVerificationDoc(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const key = objectKey('verification', file.originalname);
    await this.s3.putObject(key, file.buffer, file.mimetype);
    return this.uploadService.buildFileInfo(req, 'verification', key);
  }

  @Get('material/:materialId')
  @UseGuards(JwtAuthGuard)
  async downloadMaterial(
    @Param('materialId') materialId: string,
    @Req() req: Request & { user: { sub: string } },
  ): Promise<StreamableFile> {
    const material = await this.uploadService.getMaterial(
      materialId,
      req.user.sub,
    );
    const { stream, contentType } = await this.s3.getObject(material.fileUrl);
    return new StreamableFile(stream, {
      type: contentType,
      disposition: `attachment; filename="${encodeURIComponent(material.title)}"`,
    });
  }
}
