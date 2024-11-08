import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateStudentDto } from './dto/student.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req) {
    return await this.usersService.getTeacherProfile({ email: req.user.email });
  }

  @Post('add-student')
  async addStudent(@Req() reg, @Body() createStudentDto: CreateStudentDto) {
    return await this.usersService.createStudent(createStudentDto);
  }
}
