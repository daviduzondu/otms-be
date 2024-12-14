import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ClassService } from './class.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateClassDto } from './dto/class.dto';
import { AddStudentToClassDto } from '../users/dto/student.dto';

@UseGuards(JwtAuthGuard)
@Controller('class')
export class ClassController {
  constructor(private readonly classesService: ClassService) {}

  @Get()
  async getClasses(@Req() req, @Query('showTestParticipationStatus') testId: string) {
    return await this.classesService.getClasses(req, testId);
  }

  // @Get(':id/students')
  // async getAllStudents(@Param('id', ParseUUIDPipe) classId: string, @Query('testId', ParseUUIDPipe) testId: string) {
  //   return await this.classesService.getClassDetails(classId, testId);
  // }

  @Post()
  async createClass(@Body() createClassDto: CreateClassDto, @Req() req) {
    return await this.classesService.createClass(createClassDto, req);
  }

  @Post('/add-student')
  async addStudent(@Body() addStudentToClassDto: AddStudentToClassDto) {
    return await this.classesService.addStudentToClass(addStudentToClassDto);
  }
}
