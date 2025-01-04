import {
  Controller, FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe, ParseUUIDPipe,
  Post, Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {Request} from 'express';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}


  @Post("upload")
  @UseGuards(JwtAuthGuard)
  // @ts-ignore
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Query("questionId", new ParseUUIDPipe({optional: true})) questionId: string) {
    return this.storageService.uploadFile(file, req, questionId);
  }
}
