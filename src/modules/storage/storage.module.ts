import { forwardRef, HttpStatus, Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CustomException } from '../../exceptions/custom.exception';
import { FirebaseStorageEngine } from './engine/firebase-storage.engine';
import { FirebaseService } from '../firebase/firebase.service';
import { ConfigService } from '@nestjs/config';
import { BrandingController } from '../branding/branding.controller';
import { BrandingModule } from '../branding/branding.module';

@Module({
  imports: [
    forwardRef(()=>BrandingModule),
    MulterModule.registerAsync({
      imports: [],
      inject: [FirebaseService, ConfigService], // Inject FirebaseService into the MulterModule
      useFactory: (firebaseService: FirebaseService, configService: ConfigService) => ({
        limits: {
          fileSize: 1024 * 2 * 1024, // 2MB limit
        },
        storage:
          configService.get('STORAGE_MODE') === 'remote'
            ? new FirebaseStorageEngine(firebaseService, { destination: 'uploads' })
            : diskStorage({
                destination: 'uploads',
                filename: (req, file, cb) => {
                  const filename = `${Date.now()}-${file.originalname}`;
                  if (!['image/jpeg', 'image/jpg', 'image/png', 'audio/mpeg', 'video/mp4'].includes(file.mimetype)) cb(new CustomException('File type not supported', HttpStatus.UNPROCESSABLE_ENTITY), null);
                  else cb(null, filename);
                },
              }),
      }),
    }),
  ],
  controllers: [StorageController, BrandingController],
  providers: [StorageService],
  exports: [StorageService]
})
export class StorageModule {}
