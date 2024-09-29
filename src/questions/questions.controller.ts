import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import CheckOwnership from '../decorators/check-ownership.decorator';
import { OwnerGuard } from '../guards/owner.guard';
import { UpdateQuestionIndexDto } from './dto/update-question-index.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Post('create')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'userId',
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
    foreignKey: 'userId',
    pathOnReq: ['body', 'testId'],
  })
  async editQuestion(
    @Body() editQuestionDto: CreateQuestionDto,
    @Param('questionId', ParseUUIDPipe) questionId: string,
  ) {
    return await this.questionsService.editQuestion(
      editQuestionDto,
      questionId,
    );
  }

  @Delete('/delete/:questionId')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'userId',
    pathOnReq: ['body', 'testId'],
  })
  async deleteQuestion(@Param('questionId', ParseUUIDPipe) questionId: string) {
    return await this.questionsService.deleteQuestion(questionId);
  }

  @Patch('/update-index/')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'userId',
    pathOnReq: ['body', 'testId'],
  })
  async updateIndex(@Body() updateQuestionIndexDto: UpdateQuestionIndexDto) {
    return await this.questionsService.updateQuestionIndex(
      updateQuestionIndexDto,
    );
  }
}
