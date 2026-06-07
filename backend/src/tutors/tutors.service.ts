import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Subject } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';

@Injectable()
export class TutorsService {
  constructor(private prisma: PrismaService) {}

  async search(
    name?: string,
    subject?: Subject,
    minRate?: number,
    maxRate?: number,
    excludeSelf?: boolean,
    email?: string,
  ) {
    const filters: Prisma.TutorProfileWhereInput[] = [];

    if (name) {
      filters.push({
        user: { name: { contains: name.trim(), mode: 'insensitive' } },
      });
    }

    if (subject) {
      filters.push({ subjects: { has: subject } });
    }

    if (minRate !== undefined || maxRate !== undefined) {
      const rateFilter: Prisma.FloatNullableFilter = {};
      if (minRate !== undefined) rateFilter.gte = minRate;
      if (maxRate !== undefined) rateFilter.lte = maxRate;
      filters.push({ hourlyRate: rateFilter });
    }

    if (excludeSelf && email) {
      filters.push({ user: { email: { not: email } } });
    }

    return this.prisma.tutorProfile.findMany({
      where: filters.length > 0 ? { AND: filters } : undefined,
      include: { user: true },
    });
  }

  async getProfile(email: string) {
    const tutor = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tutorProfile: {
          include: { students: true, applications: true },
        },
      },
    });

    if (!tutor || !tutor.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return {
      user: {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        phoneNumber: tutor.phoneNumber,
        role: tutor.role,
      },
      profile: tutor.tutorProfile,
    };
  }

  async update(id: string, dto: UpdateTutorDto) {
    const exists = await this.prisma.tutorProfile.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Tutor profile not found');

    return this.prisma.tutorProfile.update({
      where: { id },
      data: {
        bio: dto.bio,
        hourlyRate: dto.hourlyRate,
        availability: dto.availability,
        subjects: dto.subjects,
        whatsappNumber: dto.whatsappNumber,
        educationBackground: dto.educationBackground,
        educationLevels: dto.educationLevels,
        teachingMethods: dto.teachingMethods,
        introVideoUrl: dto.introVideoUrl,
        bankName: dto.bankName,
        bankAccountNumber: dto.bankAccountNumber,
        bankAccountHolder: dto.bankAccountHolder,
      },
    });
  }

  async listAllStudents(tutorEmail: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: {
        tutorProfile: {
          include: { students: { include: { user: true } } },
        },
      },
    });

    if (!tutorUser || !tutorUser.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return tutorUser.tutorProfile.students.map((student) => ({
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      phoneNumber: student.user.phoneNumber,
      role: student.user.role,
    }));
  }

  async removeStudent(tutorEmail: string, studentId: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: { include: { students: true } } },
    });

    if (!tutorUser?.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    const tutorProfileId = tutorUser.tutorProfile.id;

    const isAssigned = tutorUser.tutorProfile.students.some(
      (s) => s.id === studentId,
    );
    if (!isAssigned) {
      throw new ForbiddenException(
        'This student is not assigned to you or already removed',
      );
    }

    await this.prisma.tutorProfile.update({
      where: { id: tutorProfileId },
      data: { students: { disconnect: { id: studentId } } },
    });

    return { message: 'Student removed successfully' };
  }

  async listApplications(tutorEmail: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: true },
    });

    if (!tutorUser || !tutorUser.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    const applications = await this.prisma.application.findMany({
      where: { tutorId: tutorUser.tutorProfile.id },
      include: { student: { include: { user: true } } },
    });

    return applications.map((app) => ({
      studentId: app.student.id,
      name: app.student.user.name,
      email: app.student.user.email,
      phoneNumber: app.student.user.phoneNumber,
      role: app.student.user.role,
      applicationStatus: app.status,
      requestedAt: app.requestedAt,
      scheduledAt: app.scheduledAt,
    }));
  }
}
