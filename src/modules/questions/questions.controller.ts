import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import CheckOwnership from '../../decorators/check-ownership.decorator';
import { OwnerGuard } from '../../guards/owner.guard';
import { UpdateQuestionOrderDto } from './dto/update-question-index.dto';
import { RemoveMediaDto } from './dto/remove-media.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Post('create')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['body', 'testId'],
  })
  async createQuestion(@Body() CreateQuestionDto: CreateQuestionDto) {
    return await this.questionsService.createQuestion(CreateQuestionDto);
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Put('edit/:questionId')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['body', 'testId'],
  })
  async editQuestion(@Body() editQuestionDto: CreateQuestionDto, @Param('questionId', ParseUUIDPipe) questionId: string) {
    return await this.questionsService.editQuestion(editQuestionDto, questionId);
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Delete('/delete/:questionId')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['body', 'testId'],
  })
  async deleteQuestion(@Param('questionId', ParseUUIDPipe) questionId: string) {
    return await this.questionsService.deleteQuestion(questionId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-index/')
  async updateIndex(@Body() updateQuestionIndexDto: UpdateQuestionOrderDto) {
    return await this.questionsService.updateQuestionOrder(updateQuestionIndexDto);
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['body', 'testId'],
  })

  @Patch(':questionId/remove-media')
  async removeMedia(@Param('questionId', ParseUUIDPipe) questionId: string,  @Body() { mediaId, testId }: RemoveMediaDto) {
    return await this.questionsService.removeMedia(questionId, mediaId, testId)
  }
}
