import { forwardRef, Module } from '@nestjs/common';
import { BrandingController } from './branding.controller';
import { BrandingService } from './branding.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports:[forwardRef(()=>StorageModule)],
  controllers: [BrandingController],
  providers: [BrandingService],
  exports: [BrandingService]
})
export class BrandingModule {}
