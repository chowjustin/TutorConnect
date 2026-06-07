import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly apps: ApplicationsService) {}

  @Roles(UserRole.STUDENT)
  @Post()
  apply(@Request() req, @Body() dto: CreateApplicationDto) {
    return this.apps.apply(req.user.email, dto.tutorId, dto.message);
  }

  @Roles(UserRole.STUDENT)
  @Delete(':id')
  cancel(@Request() req, @Param('id') id: string) {
    return this.apps.cancel(req.user.email, id);
  }

  @Roles(UserRole.STUDENT)
  @Get('student')
  listForStudent(@Request() req, @Query() pagination: PaginationQueryDto) {
    return this.apps.listForStudent(req.user.email, pagination);
  }

  @Roles(UserRole.TUTOR)
  @Get('tutor')
  listForTutor(@Request() req, @Query() pagination: PaginationQueryDto) {
    return this.apps.listForTutor(req.user.email, pagination);
  }

  @Roles(UserRole.TUTOR)
  @Patch(':id/status')
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.apps.updateStatus(req.user.email, id, dto.status);
  }
}
