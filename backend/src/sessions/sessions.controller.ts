import {
  Body,
  Controller,
  Get,
  Header,
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
import { EmailVerified } from '../auth/email-verified.decorator';
import { EmailVerifiedGuard } from '../auth/email-verified.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { SkipTransform } from '../common/skip-transform.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly svc: SessionsService) {}

  @EmailVerified()
  @Roles(UserRole.STUDENT)
  @Post()
  create(@Request() req, @Body() dto: CreateSessionDto) {
    return this.svc.create(req.user.email, dto);
  }

  @Roles(UserRole.STUDENT, UserRole.TUTOR)
  @Patch(':id')
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSessionStatusDto,
  ) {
    return this.svc.updateStatus(
      req.user.email,
      req.user.role,
      id,
      dto.status,
    );
  }

  @Roles(UserRole.STUDENT)
  @Get('student')
  listStudent(
    @Request() req,
    @Query() pagination: PaginationQueryDto,
    @Query('past') past?: string,
  ) {
    return this.svc.listForStudent(req.user.email, pagination, past === 'true');
  }

  @Roles(UserRole.TUTOR)
  @Get('tutor')
  listTutor(
    @Request() req,
    @Query() pagination: PaginationQueryDto,
    @Query('past') past?: string,
  ) {
    return this.svc.listForTutor(req.user.email, pagination, past === 'true');
  }

  @SkipTransform()
  @Get(':id/ical')
  @Header('Content-Type', 'text/calendar')
  async ical(@Param('id') id: string) {
    return this.svc.ical(id);
  }
}
