import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(email: string) {
    const student = await this.prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: {
          include: {
            tutors: { include: { user: true } },
            applications: true,
          },
        },
      },
    });

    if (!student || !student.studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    return {
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        role: student.role,
      },
      profile: student.studentProfile,
    };
  }

  async update(id: string, dto: UpdateStudentDto) {
    const exists = await this.prisma.studentProfile.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException('Student profile not found');
    }

    return this.prisma.studentProfile.update({
      where: { id },
      data: {
        bio: dto.bio,
        school: dto.school,
        interests: dto.interests,
        whatsappNumber: dto.whatsappNumber,
      },
      include: { user: true },
    });
  }
}
