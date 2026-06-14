import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { PlanTier } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

class RequestSubscriptionDto {
  @IsEnum(PlanTier)
  tier: PlanTier;
}

@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly svc: SubscriptionService) {}

  @Get('me')
  me(@Request() req) {
    return this.svc.getMine(req.user.sub);
  }

  @Get('pending')
  async pending(@Request() req) {
    const p = await this.svc.hasPending(req.user.sub);
    return { pending: p };
  }

  @Get('history')
  history(@Request() req) {
    return this.svc.listMyHistory(req.user.sub);
  }

  @Post('request')
  request(@Request() req, @Body() dto: RequestSubscriptionDto) {
    return this.svc.prepareRequest(req.user.sub, req.user.role, dto.tier);
  }
}
