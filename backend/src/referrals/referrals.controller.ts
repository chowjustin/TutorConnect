import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReferralsService } from './referrals.service';

@Controller()
export class ReferralsController {
  constructor(private readonly svc: ReferralsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/referrals')
  mine(@Request() req) {
    return this.svc.getMine(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/referrals/:id/grant')
  grant(@Param('id') id: string) {
    return this.svc.grant(id);
  }
}
