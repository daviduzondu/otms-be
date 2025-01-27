import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('branding')
export class BrandingController {
  @Post("upload")
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadBranding(@UploadedFile() file: Express.Multer.File, @Body() body: any,
  ) {
    return {
      message: 'It fucking works',
      data: {
        file,
        body,
      },
    };
  }
}
