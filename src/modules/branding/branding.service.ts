import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { StorageService } from '../storage/storage.service';
import { Request } from 'express';
import BrandingDto from './dto/branding.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

@Injectable()
export class BrandingService {
  constructor(
    @InjectKysesly() private readonly db: Database,
    @Inject(forwardRef(() => StorageService))
    private storageService: StorageService,
  ) {}

  async addBranding(teacherId: string, file: Express.Multer.File, req: Request, payload: BrandingDto) {
    const {
      data: { id },
    } = await this.storageService.uploadFile(file, req);

    const data = await this.db
      .insertInto('branding')
      .values({
        mediaId: id,
        addedBy: teacherId,
        ...payload,
      })
      .returningAll()
      .onConflict((oc) =>
        oc.columns(['addedBy']).doUpdateSet({
          mediaId: id,
          addedBy: teacherId,
          ...payload,
        }),
      )
      .executeTakeFirst();

    return {
      message: 'Branding updated successfully',
      data,
    };
  }

  async updateBranding(teacherId: string, file: Express.Multer.File, req: Request, payload: BrandingDto) {
    let mediaId: string;
    if (file) {
      const {
        data: { id },
      } = await this.storageService.uploadFile(file, req);
      mediaId = id;
    }

    for (const key in payload) {
      if (payload[key] === undefined) {
        payload[key] = null;
      }
    }

    const data = await this.db
      .updateTable('branding')
      .set({
        mediaId: mediaId ? mediaId : undefined,
        ...payload,
      })
      .where('addedBy', '=', teacherId)
      .returningAll()
      .executeTakeFirst();

    return await this.getBranding(teacherId);
  }

  async getBranding(uploader: string) {
    const data = await this.db
      .selectFrom('branding')
      .where('branding.addedBy', '=', uploader)
      .select((eb) => ['branding.id', 'branding.field1', 'branding.field2', 'branding.field3', jsonObjectFrom(eb.selectFrom('media').where('media.uploader', '=', uploader).whereRef('media.id', '=', 'branding.mediaId').select(['id', 'url']).limit(1)).as('media')])
      .executeTakeFirstOrThrow(() => {
        throw new CustomException(`Branding not found for: ${uploader}`, HttpStatus.NOT_FOUND);
      });

    return {
      message: 'Branding retrieved successfully',
      data,
    };
  }
}
