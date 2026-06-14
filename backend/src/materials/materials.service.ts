import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EducationLevel, MaterialKind, Subject } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginatePrisma } from '../common/paginate';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async updateMaterial(
    tutorUserId: string,
    materialId: string,
    patch: {
      title?: string;
      subject?: Subject;
      level?: EducationLevel;
      kind?: MaterialKind;
      description?: string;
      isPremium?: boolean;
    },
  ) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { tutor: true },
    });
    if (!material) throw new BadRequestException('Material not found');
    const owns = await this.prisma.tutorProfile.findFirst({
      where: { id: material.tutorId, userId: tutorUserId },
      select: { id: true },
    });
    if (!owns) throw new ForbiddenException('Not your material');

    return this.prisma.material.update({
      where: { id: materialId },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.subject !== undefined ? { subject: patch.subject } : {}),
        ...(patch.level !== undefined ? { level: patch.level } : {}),
        ...(patch.kind !== undefined ? { kind: patch.kind } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description }
          : {}),
        ...(patch.isPremium !== undefined
          ? { isPremium: patch.isPremium }
          : {}),
      },
    });
  }

  async updateAccess(
    tutorUserId: string,
    materialId: string,
    studentProfileIds: string[],
  ) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { tutor: { include: { students: { select: { id: true } } } } },
    });
    if (!material) throw new BadRequestException('Material not found');
    const ownsMaterial = await this.prisma.tutorProfile.findFirst({
      where: { id: material.tutorId, userId: tutorUserId },
      select: { id: true },
    });
    if (!ownsMaterial)
      throw new ForbiddenException('Not your material');

    const ownIds = new Set(material.tutor.students.map((s) => s.id));
    const stranger = studentProfileIds.find((id) => !ownIds.has(id));
    if (stranger) {
      throw new ForbiddenException(
        `Student ${stranger} is not assigned to this tutor`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.materialAccess.deleteMany({ where: { materialId } });
      if (studentProfileIds.length) {
        await tx.materialAccess.createMany({
          data: studentProfileIds.map((sid) => ({
            materialId,
            studentId: sid,
          })),
          skipDuplicates: true,
        });
      }
    });
    return { success: true };
  }

  async getAccess(tutorUserId: string, materialId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: {
        tutor: true,
        allowedStudents: { select: { studentId: true } },
      },
    });
    if (!material) throw new BadRequestException('Material not found');
    const ownsMaterial = await this.prisma.tutorProfile.findFirst({
      where: { id: material.tutorId, userId: tutorUserId },
      select: { id: true },
    });
    if (!ownsMaterial)
      throw new ForbiddenException('Not your material');
    return {
      materialId,
      studentIds: material.allowedStudents.map((a) => a.studentId),
    };
  }

  async userOwnsTutorProfile(userId: string, tutorProfileId: string) {
    const tp = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId },
      select: { userId: true },
    });
    return !!tp && tp.userId === userId;
  }

  async userOwnsStudentProfile(userId: string, studentProfileId: string) {
    const sp = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { userId: true },
    });
    return !!sp && sp.userId === userId;
  }

  async createMaterial(
    fileUrl: string,
    originalName: string,
    tutorUserId: string,
    studentProfileIds: string[],
    meta?: {
      subject?: Subject;
      level?: EducationLevel;
      kind?: MaterialKind;
      description?: string;
      isPremium?: boolean;
    },
  ) {
    if (!fileUrl) throw new BadRequestException('fileUrl is required');
    if (!originalName) throw new BadRequestException('originalName is required');

    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
      select: { id: true, students: { select: { id: true } } },
    });
    if (!tutor) throw new ForbiddenException('Tutor profile not found');

    if (studentProfileIds.length) {
      const ownIds = new Set(tutor.students.map((s) => s.id));
      const stranger = studentProfileIds.find((id) => !ownIds.has(id));
      if (stranger) {
        throw new ForbiddenException(
          `Student ${stranger} is not assigned to this tutor`,
        );
      }
    }

    const material = await this.prisma.material.create({
      data: {
        title: originalName,
        fileUrl,
        tutorId: tutor.id,
        ...(meta?.subject ? { subject: meta.subject } : {}),
        ...(meta?.level ? { level: meta.level } : {}),
        ...(meta?.kind ? { kind: meta.kind } : {}),
        ...(meta?.description ? { description: meta.description } : {}),
        ...(meta?.isPremium ? { isPremium: true } : {}),
      },
    });

    // Default access: all current students of the tutor.
    const ids = studentProfileIds.length
      ? studentProfileIds
      : tutor.students.map((s) => s.id);
    if (ids.length) {
      await this.prisma.materialAccess.createMany({
        data: ids.map((sid) => ({
          materialId: material.id,
          studentId: sid,
        })),
        skipDuplicates: true,
      });
    }

    return {
      success: true,
      message: 'Material uploaded',
      materialId: material.id,
    };
  }

  async getMaterialsForTutor(
    tutorProfileId: string,
    pagination: PaginationQueryDto,
    filters?: {
      subject?: Subject;
      level?: EducationLevel;
      kind?: MaterialKind;
      isPremium?: boolean;
    },
  ) {
    return paginatePrisma(this.prisma.material, pagination, {
      where: {
        tutorId: tutorProfileId,
        subject: filters?.subject,
        level: filters?.level,
        kind: filters?.kind,
        ...(filters?.isPremium !== undefined
          ? { isPremium: filters.isPremium }
          : {}),
      },
      include: {
        allowedStudents: {
          include: { student: { include: { user: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMaterialsForStudent(
    studentProfileId: string,
    pagination: PaginationQueryDto,
    filters?: {
      subject?: Subject;
      level?: EducationLevel;
      kind?: MaterialKind;
      isPremium?: boolean;
    },
  ) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: {
        user: { select: { subscription: { select: { tier: true, expiresAt: true } } } },
      },
    });
    const sub = student?.user.subscription;
    const isPremium =
      sub?.tier === 'PREMIUM_STUDENT' &&
      sub?.expiresAt &&
      new Date(sub.expiresAt) > new Date();

    // Two access paths:
    // 1. Tutor explicitly granted access via allowedStudents (for reguler materials).
    // 2. Premium subscription auto-grants access to any premium material from this student's tutors.
    const studentWithTutors = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { tutors: { select: { id: true } } },
    });
    const tutorIds = studentWithTutors?.tutors.map((t) => t.id) ?? [];

    return paginatePrisma(this.prisma.material, pagination, {
      where: {
        OR: [
          { allowedStudents: { some: { studentId: studentProfileId } } },
          ...(isPremium && tutorIds.length
            ? [{ isPremium: true, tutorId: { in: tutorIds } }]
            : []),
        ],
        subject: filters?.subject,
        level: filters?.level,
        kind: filters?.kind,
        ...(filters?.isPremium !== undefined
          ? { isPremium: filters.isPremium }
          : {}),
      },
      include: { tutor: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
