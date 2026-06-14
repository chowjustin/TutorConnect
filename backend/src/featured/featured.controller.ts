import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsInt, Max, Min } from 'class-validator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeaturedService } from './featured.service';

class RequestFeaturedDto {
  @IsInt() @Min(1) @Max(90)
  days: number;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('featured')
export class FeaturedController {
  constructor(private readonly svc: FeaturedService) {}

  @Roles(UserRole.TUTOR)
  @Get('me')
  me(@Request() req) {
    return this.svc.getMine(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Get('pending')
  async pending(@Request() req) {
    const p = await this.svc.hasPending(req.user.sub);
    return { pending: p };
  }

  @Roles(UserRole.TUTOR)
  @Get('history')
  history(@Request() req) {
    return this.svc.listMyHistory(req.user.sub);
  }

  @Roles(UserRole.TUTOR)
  @Post('request')
  request(@Request() req, @Body() dto: RequestFeaturedDto) {
    return this.svc.prepareRequest(req.user.email, dto.days);
  }
}
