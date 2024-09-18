import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateTestDto } from './dto/create-test.dto';
import { Request } from 'express';
import { TestsService } from './tests.service';

@Controller('tests')
export class TestsController {
  constructor(private readonly testService: TestsService) {}
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTest(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return await this.testService.getTest(id, req);
  }

  @Delete(':id')
  async softDeleteTest() {}

  @Put(':id')
  async editTest() {}

  @Get('take/:code')
  async takeTest() {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createTest(@Body() createTestDto: CreateTestDto, @Req() req: Request) {
    return await this.testService.createNewTest(createTestDto, req);
  }

  async getPrintsVersion() {}
}
