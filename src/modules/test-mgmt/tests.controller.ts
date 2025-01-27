import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateTestDto, EditTestDto } from './dto/createTestDto';
import { Request } from 'express';
import { TestService } from './tests.service';
import CheckOwnership from '../../decorators/check-ownership.decorator';
import { OwnerGuard } from '../../guards/owner.guard';
import { SendTestInvitationMailDto, SendTestResults, SendTestTokenDto } from './dto/mail-test.dto';
import { AddParticipantDto, RemoveParticipantDto } from './dto/participant.dto';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { UpdateScoreDto } from './dto/update-score.dto';
import { RevokeTestDto } from './dto/revoke-test.dto';

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

  @Patch(':id/revoke')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['params', 'id'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async revokeTest(@Param('id', ParseUUIDPipe) id:string, @Body() payload: RevokeTestDto) {
    return await this.testService.revokeTest(id, payload.revoked);
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

  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['body', 'testId'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Put('edit')
  async editTest(@Body() editTestDto: EditTestDto, @Req() req: Request) {
    return await this.testService.editTest(editTestDto, req);
  }

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

  @Get(':id/submit')
  @UseGuards(AccessTokenGuard)
  async submitQuestion(
    @Param('id', ParseUUIDPipe) testId: string,
    @Req()
    req: Request & {
      student: { id: string };
    },
  ) {
    return await this.testService.submitTest(testId, req.student.id);
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

  @Get(':id/responses')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['params', 'id'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async getResponses(@Param('id', ParseUUIDPipe) testId: string) {
    return await this.testService.getResponses(testId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-test')
  async sendTestInvitation(@Body() payload: SendTestInvitationMailDto, @Req() req: Request) {
    return await this.testService.sendTestInvitationMail(req, payload);
  }

  @Post('send-results')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['body', 'testId'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async sendResultToEmail(@Req() req, @Body() payload: SendTestResults){
    return await this.testService.sendResultToEmail(req, payload);
  }

  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['params', 'id'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Post(':id/grade')
  async updateScore(@Param('id', ParseUUIDPipe) testId: string, @Body() { studentId, point, questionId }: UpdateScoreDto, @Query('autoGrade') autoGrade: string) {
    return await this.testService.updateScore(testId, point, questionId, studentId, autoGrade);
  }

  @Post('send-token')
  async sendTokenToEmail(@Body() payload: SendTestTokenDto) {
    return await this.testService.sendTokenToEmail(payload);
  }

  @Get(":id/result")
  @UseGuards(AccessTokenGuard)
  async getTestResult(@Req() req: Request & { student: { id: string }; }, @Param('id', ParseUUIDPipe) testId: string){
    return await this.testService.getResult(testId, req.student.id);
  }
}
