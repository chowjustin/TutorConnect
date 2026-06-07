import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PromoService } from './promo.service';
import { CreatePromoCodeDto, PreviewDiscountDto } from './dto/promo.dto';

@Controller()
export class PromoController {
  constructor(private readonly svc: PromoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/promo-codes')
  create(@Request() req, @Body() dto: CreatePromoCodeDto) {
    return this.svc.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments/preview-discount')
  preview(@Body() dto: PreviewDiscountDto) {
    return this.svc.preview(dto.kind, dto.refId, dto.code);
  }
}
