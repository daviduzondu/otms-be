import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import BrandingDto from './dto/branding.dto';
import { Request } from 'express';
import { BrandingService } from './branding.service';

@Controller('branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  async uploadBranding(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: BrandingDto,
    @Req()
    req: Request & {
      user: { id: string };
    },
  ) {
    return await this.brandingService.addBranding(req.user.id, file, req, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBranding(
    @Req()
    req: Request & {
      user: { id: string };
    },
  ) {
    return await this.brandingService.getBranding(req.user.id);
  }
}
