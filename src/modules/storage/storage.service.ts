import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import {Request} from 'express'
import { MediaType } from '../kysesly/kysesly-types/enums';

@Injectable()
export class StorageService {
  constructor(
    @InjectKysesly() private db: Database,
  ) {}

  private mimeTypeMap(mimetype: string): MediaType {
    // Map MIME types to MediaType enum values
    if (mimetype.startsWith('image/')) {
      return MediaType.image;
    } else if (mimetype.startsWith('video/')) {
      return MediaType.video;
    } else if (mimetype === 'application/pdf') {
      return MediaType.pdf;
    } else if (mimetype.startsWith('audio/')) {
      return MediaType.audio;
    } else {
      throw new Error('Unsupported file type');
    }
  }
  async uploadFile(file: Express.Multer.File, req: Request) {
    await this.db.insertInto('media').values({url: file.path, type: this.mimeTypeMap(file.mimetype), uploader: (req as any).user.id}).execute();
    return { message: 'File uploaded successfully', data: {path: file.path.startsWith("https")? file.path: path.join(`${req.protocol}://${req.get('host')}`, file.path) }};
  }
}
