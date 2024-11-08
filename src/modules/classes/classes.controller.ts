import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateClassDto } from './dto/class.dto';
import { AddStudentToClassDto } from '../users/dto/student.dto';

@UseGuards(JwtAuthGuard)
@Controller('class')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  async getClasses(@Req() req) {
    return await this.classesService.getClasses(req);
  }

  @Get(':id/students')
  async getAllStudents(@Param('id', ParseUUIDPipe) classId: string) {
    return await this.classesService.getClassDetails(classId);
  }

  @Post()
  async createClass(@Body() createClassDto: CreateClassDto, @Req() req) {
    return await this.classesService.createClass(createClassDto, req);
  }

  @Post('/add-student')
  async addStudent(@Body() addStudentToClassDto: AddStudentToClassDto) {
    return await this.classesService.addStudentToClass(addStudentToClassDto);
  }
}
