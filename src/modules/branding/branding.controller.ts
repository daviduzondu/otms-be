import { Body, Controller, Delete, Get, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import BrandingDto from './dto/branding.dto';
import { Request } from 'express';
import { BrandingService } from './branding.service';

@Controller('branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  async createBranding(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: BrandingDto,
    @Req()
    req: Request & {
      user: { id: string };
    },
  ) {
    return await this.brandingService.addBranding(req.user.id, file, req, body);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async removeBranding(
    @Req()
    req: Request & {
      user: { id: string };
    },
  ) {
    return await this.brandingService.removeBranding(req.user.id);
  }

  @Put('edit')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  async editBranding(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: BrandingDto,
    @Req()
    req: Request & {
      user: { id: string };
    },
  ) {
    return await this.brandingService.updateBranding(req.user.id, file, req, body);
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
