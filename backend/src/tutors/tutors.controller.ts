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
import { Subject, UserRole } from '@prisma/client';
import { TutorsService } from './tutors.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import {
  ReviewVerificationDto,
  SubmitVerificationDto,
} from './dto/verification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get('search')
  async searchTutorsForStudent(
    @Query('name') name?: string,
    @Query('subject') subject?: string,
    @Query('minRate') minRate?: string,
    @Query('maxRate') maxRate?: string,
    @Request() req?: any,
  ) {
    const min = minRate ? parseFloat(minRate) : undefined;
    const max = maxRate ? parseFloat(maxRate) : undefined;
    const email = req?.user?.email;

    let validSubject: Subject | undefined;
    if (subject) {
      const upper = subject.toUpperCase();
      if (Object.keys(Subject).includes(upper)) {
        validSubject = upper as Subject;
      }
    }

    return this.tutorsService.search(
      name,
      validSubject,
      min,
      max,
      true,
      email,
    );
  }

  @Get('profile')
  getMyProfile(@Request() req) {
    return this.tutorsService.getProfile(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTutorDto: UpdateTutorDto,
  ) {
    return this.tutorsService.update(id, updateTutorDto);
  }

  @Get(':email/students')
  async listAllStudents(@Param('email') email: string) {
    return this.tutorsService.listAllStudents(email);
  }

  @Roles(UserRole.TUTOR)
  @Delete('students/:studentId')
  async removeStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.tutorsService.removeStudent(req.user.email, studentId);
  }

  @Roles(UserRole.TUTOR)
  @Get('me/completeness')
  getCompleteness(@Request() req) {
    return this.tutorsService.getCompleteness(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Post('publish')
  publish(@Request() req) {
    return this.tutorsService.publish(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Post('unpublish')
  unpublish(@Request() req) {
    return this.tutorsService.unpublish(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Post('verification')
  submitVerification(@Request() req, @Body() dto: SubmitVerificationDto) {
    return this.tutorsService.submitVerification(
      req.user.email,
      dto.idDocumentUrl,
      dto.educationProofUrl,
    );
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/tutors')
export class AdminTutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Roles(UserRole.ADMIN)
  @Get('verification')
  listPending() {
    return this.tutorsService.listPendingVerification();
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/verification')
  review(@Param('id') id: string, @Body() dto: ReviewVerificationDto) {
    return this.tutorsService.reviewVerification(id, dto.status, dto.notes);
  }
}
