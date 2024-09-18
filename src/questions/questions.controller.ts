import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createQuestion(
    @Body() CreateQuestionDto: CreateQuestionDto,
    @Req() req: Request,
  ) {
    return await this.questionsService.createQuestion(CreateQuestionDto, req);
  }
}
