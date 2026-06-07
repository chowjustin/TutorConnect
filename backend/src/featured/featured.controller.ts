import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
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
  @Post('request')
  request(@Request() req, @Body() dto: RequestFeaturedDto) {
    return this.svc.prepareRequest(req.user.email, dto.days);
  }
}
