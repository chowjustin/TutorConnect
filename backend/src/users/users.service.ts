import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginatePrisma } from '../common/paginate';

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    return paginatePrisma(this.prisma.user, query, {
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_SELECT,
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  /**
   * Like findOne but joins profile FKs so the FE can hit
   * /materials/tutor/:tutorProfileId etc without an extra round trip.
   */
  async findMe(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...SAFE_SELECT,
        emailVerifiedAt: true,
        referralCode: true,
        referredById: true,
        tutorProfile: { select: { id: true } },
        studentProfile: { select: { id: true } },
      },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return {
      ...user,
      tutorProfileId: user.tutorProfile?.id ?? null,
      studentProfileId: user.studentProfile?.id ?? null,
      tutorProfile: undefined,
      studentProfile: undefined,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`User with ID ${id} not found`);

    const data: UpdateUserDto = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_SELECT,
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`User with ID ${id} not found`);
    return this.prisma.user.delete({ where: { id }, select: SAFE_SELECT });
  }
}
