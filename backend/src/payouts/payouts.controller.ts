import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EmailVerified } from '../auth/email-verified.decorator';
import { EmailVerifiedGuard } from '../auth/email-verified.guard';
import { IdempotencyInterceptor } from '../common/idempotency.interceptor';
import { multerStorage, materialFileFilter } from '../upload/multer.config';
import { PayoutsService } from './payouts.service';
import { RejectPayoutDto, RequestPayoutDto } from './dto/payout.dto';

@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
@Controller('tutor')
export class TutorPayoutsController {
  constructor(private readonly svc: PayoutsService) {}

  @Roles(UserRole.TUTOR)
  @Get('wallet')
  wallet(@Request() req) {
    return this.svc.getWallet(req.user.email);
  }

  @EmailVerified()
  @Roles(UserRole.TUTOR)
  @Post('payouts')
  @UseInterceptors(IdempotencyInterceptor)
  request(@Request() req, @Body() dto: RequestPayoutDto) {
    return this.svc.request(req.user.email, dto.amount);
  }

  @Roles(UserRole.TUTOR)
  @Get('payouts')
  listMine(@Request() req) {
    return this.svc.listMine(req.user.email);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/payouts')
export class AdminPayoutsController {
  constructor(private readonly svc: PayoutsService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  queue() {
    return this.svc.listQueue();
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/mark-paid')
  @UseInterceptors(
    FileInterceptor('proofImage', {
      storage: multerStorage,
      fileFilter: materialFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  markPaid(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('proofImage required');
    const proofUrl = `/uploads/payouts/${file.filename}`;
    return this.svc.markPaid(req.user.sub, id, proofUrl);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/reject')
  reject(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RejectPayoutDto,
  ) {
    return this.svc.reject(req.user.sub, id, dto.reason);
  }
}
