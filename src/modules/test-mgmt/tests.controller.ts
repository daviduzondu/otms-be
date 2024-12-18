import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateTestDto } from './dto/create-test.dto';
import { Request } from 'express';
import { TestService } from './tests.service';
import CheckOwnership from '../../decorators/check-ownership.decorator';
import { OwnerGuard } from '../../guards/owner.guard';
import { SendTestInvitationMailDto } from './dto/send-test.dto';
import { AddParticipantDto, RemoveParticipantDto } from './dto/participant.dto';
import { AccessTokenGuard } from '../../guards/access-token.guard';

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

  @Post(':id/participants/add')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['params', 'id'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async addParticipant(@Body() payload: AddParticipantDto) {
    return await this.testService.addParticipant(payload);
  }

  @Post(':id/participants/remove')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['params', 'id'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async removeParticipant(@Body() payload: RemoveParticipantDto) {
    return await this.testService.removeParticipant(payload);
  }

  @Delete(':id')
  async softDeleteTest() {}

  @Put(':id')
  async editTest() {}

  @Get(':id/question/:questionId')
  @UseGuards(AccessTokenGuard)
  async fetchQuestion(
    @Param('id', ParseUUIDPipe) testId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Req()
    req: Request & {
      student: { id: string };
    },
  ) {
    return await this.testService.fetchQuestion(testId, questionId, req.student.id);
  }

  @Get('take/:accessCode')
  async takeTest(@Param('accessCode') accessCode: string) {
    return await this.testService.takeTest(accessCode);
  }

  @Post(':id/question/:questionId/submit')
  @UseGuards(AccessTokenGuard)
  async submitAnswer(
    @Param('id', ParseUUIDPipe) testId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() payload: { answer: string },
    @Req()
    req: Request & {
      student: { id: string };
    },
  ) {
    return await this.testService.submitAnswer(testId, req.student.id, questionId, payload.answer);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createTest(@Body() createTestDto: CreateTestDto, @Req() req: Request) {
    return await this.testService.createNewTest(createTestDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-test')
  async sendTestInvitation(@Body() payload: SendTestInvitationMailDto, @Req() req: Request) {
    return await this.testService.sendTestInvitationMail(req, payload);
  }

  async getPrintsVersion() {}
}
