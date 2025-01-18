import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, ParseUUIDPipe, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  // @ts-ignore
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Query('questionId', new ParseUUIDPipe({ optional: true })) questionId: string, @Query('testId', new ParseUUIDPipe({ optional: true })) testId: string) {
    return this.storageService.uploadFile(file, req, questionId, testId);
  }

  @Post('upload-webcam')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadWebcam(@UploadedFile() file: Express.Multer.File, @Req() req: Request & { student: { id: string } }, @Query('testId', new ParseUUIDPipe({ optional: true })) testId: string) {
    return this.storageService.uploadFile(file, req, null, testId, req.student.id);
  }
}
