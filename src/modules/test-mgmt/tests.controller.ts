import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateTestDto } from './dto/create-test.dto';
import { Request } from 'express';
import { TestService } from './tests.service';
import CheckOwnership from '../../decorators/check-ownership.decorator';
import { OwnerGuard } from '../../guards/owner.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('tests')
export class TestsController {
  constructor(private readonly testService: TestService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTests(@Req() req: Request) {
    return await this.testService.getAllTests(req);
  }

  @Get(':id')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['params', 'id'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
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
