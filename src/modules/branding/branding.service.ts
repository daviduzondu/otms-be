import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { StorageService } from '../storage/storage.service';
import { Request } from 'express';
import BrandingDto from './dto/branding.dto';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

@Injectable()
export class BrandingService {
  constructor(
    @InjectKysesly() private readonly db: Database,
    @Inject(forwardRef(() => StorageService))
    private storageService: StorageService,
  ) {}

  async addBranding(teacherId: string, file: Express.Multer.File, req: Request, payload: BrandingDto) {
    const { data: media } = await this.storageService.uploadFile(file, req);

    const data = await this.db
      .insertInto('branding')
      .values({
        mediaId: media.id,
        addedBy: teacherId,
        ...payload,
      })
      .returningAll()
      .onConflict((oc) =>
        oc.columns(['addedBy']).doUpdateSet({
          mediaId: media.id,
          addedBy: teacherId,
          ...payload,
        }),
      )
      .executeTakeFirst();

    return {
      message: 'Branding updated successfully',
      data: { ...data, media: { ...media, url: media.path } },
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

    await this.db
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
      .executeTakeFirst();

    return {
      message: 'Branding retrieved successfully',
      data: data ?? null,
    };
  }

  async removeBranding(uploader: string) {
    await this.db.transaction().execute(async (trx) => {
      const { mediaId } = await trx.selectFrom('branding').where('addedBy', '=', uploader).select('mediaId').executeTakeFirst();
      await trx.deleteFrom('branding').where('addedBy', '=', uploader).execute();
      await trx.deleteFrom('media').where('id', '=', mediaId).execute();
    });

    return {
      message: 'Branding removed successfully',
    };
  }
}
