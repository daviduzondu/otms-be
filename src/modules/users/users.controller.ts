import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateStudentDto } from './dto/student.dto';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { OwnerGuard } from '../../guards/owner.guard';
import CheckOwnership from '../../decorators/check-ownership.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return await this.usersService.getTeacherProfile({ email: req.user.email });
  }

  @Post('add-student')
  @UseGuards(JwtAuthGuard)
  async addStudent(@Req() reg, @Body() createStudentDto: CreateStudentDto, @Req() req: Request) {
    return await this.usersService.createStudent(createStudentDto, req);
  }

  @Get('find-student')
  @UseGuards(JwtAuthGuard)
  async findStudentByEmail(@Query('email') email: string, @Req() req: Request) {
    return await this.usersService.findStudentByEmail(email, req);
  }

  @Get('verify-student')
  @UseGuards(AccessTokenGuard)
  async findStudentByAccessCode(@Req() req: Request & { student: { accessCode: string } }) {
    return await this.usersService.getStudentByAccessCode(req.student.accessCode);
  }

  @Get('recent-activities')
  @UseGuards(JwtAuthGuard)
  async getRecentActivities(@Req() req: Request & { user: { id: string } }) {
    return await this.usersService.getRecentActivities(req.user.id);
  }

  @Get('students')
  @UseGuards(JwtAuthGuard)
  async getAllStudents(@Req() req: Request & { user: { id: string } }) {
    return await this.usersService.getAllStudents(req.user.id);
  }
}
