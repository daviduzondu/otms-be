import { Controller, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import CheckOwnership from '../../decorators/check-ownership.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OwnerGuard } from '../../guards/owner.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboardOverview(@Req() req: Request & { user: { id: string } }) {
    return await this.analyticsService.getDashboardOverview(req.user.id);
  }

  @Get('test/:id')
  @CheckOwnership({
    table: 'tests',
    column: 'id',
    foreignKey: 'teacherId',
    pathOnReq: ['params', 'id'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async getTestMetrics(@Param('id', ParseUUIDPipe) testId: string, @Req() req: Request & { user: { id: string } }) {
    return await this.analyticsService.getTestMetrics(testId, req.user.id);
  }

  @Get('student/:studentId')
  @CheckOwnership({
    table: 'students',
    column: 'id',
    foreignKey: 'addedBy',
    pathOnReq: ['params', 'studentId'],
  })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async getStudentPerformanceMetrics(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return await this.analyticsService.getOverallStudentPerformance(studentId);
  }
}
