import { HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import { InjectKysesly }  from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import {Request} from 'express'
import { MediaType } from '../kysesly/kysesly-types/enums';
import { ConfigService } from '@nestjs/config';
import { CustomException } from '../../exceptions/custom.exception';

@Injectable()
export class StorageService {
  constructor(
    @InjectKysesly() private db: Database,
    private readonly configService: ConfigService,
  ) {}

  private mimeTypeMap(mimetype: string): MediaType {
    // Map MIME types to MediaType enum values
    if (mimetype.startsWith('image/')) {
      return MediaType.image;
    } else if (mimetype.startsWith('video/')) {
      return MediaType.video;
    } else if (mimetype.startsWith('audio/')) {
      return MediaType.audio;
    } else {
      throw new Error('Unsupported file type');
    }
  }
  async uploadFile(file: Express.Multer.File, req: Request, questionId: string, testId?: string, studentId?: string) {
    const existingAttempt = await this.db.selectFrom('test_attempts').innerJoin('questions', 'questions.testId', 'test_attempts.testId') .selectAll().where('questions.id', '=', questionId).executeTakeFirst();
    if (existingAttempt) {
      throw new CustomException('You cannot make any changes because one or more students have attempted this test', HttpStatus.CONFLICT);
    }

    const { id: mediaId, type, url  } = await this.db
      .insertInto('media')
      .values({ studentId: studentId ? studentId : null, testId: testId ? testId : null,  url: this.configService.get('STORAGE_MODE') === 'local' ? new URL(path.join(`${req.protocol}://${req.get('host')}`, file.path)).toString() : file.path, type: this.mimeTypeMap(file.mimetype), uploader: studentId ? null : (req as any).user.id })
      .returning(['id', 'type', 'url'])
      .executeTakeFirst();

    if (questionId) await this.db.updateTable('questions').set('mediaId', mediaId).where('questions.id', '=', questionId).execute();
    return { message: 'File uploaded successfully', data: {path: url , id:mediaId, type }};
  }
}
