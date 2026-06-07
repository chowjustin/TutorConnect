import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/promo.dto';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  create(adminId: string, dto: CreatePromoCodeDto) {
    return this.prisma.promoCode.create({
      data: {
        code: dto.code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        validUntil: new Date(dto.validUntil),
        maxUses: dto.maxUses,
        applicableKinds: dto.applicableKinds,
        minAmount: dto.minAmount ?? null,
        createdBy: adminId,
      },
    });
  }

  async preview(kind: PaymentKind, refId: string, code: string) {
    const promo = await this.prisma.promoCode.findUnique({ where: { code } });
    if (!promo) throw new NotFoundException('Promo not found');
    if (promo.currentUses >= promo.maxUses)
      throw new BadRequestException('Promo exhausted');
    if (new Date() > promo.validUntil)
      throw new BadRequestException('Promo expired');
    if (!promo.applicableKinds.includes(kind))
      throw new BadRequestException('Promo not applicable');

    let gross = 0;
    if (kind === PaymentKind.SESSION) {
      const a = await this.prisma.sessionAttendee.findUnique({
        where: { id: refId },
        include: { session: true },
      });
      if (!a) throw new NotFoundException('Attendee not found');
      gross = a.session.pricePerSeat;
    } else if (kind === PaymentKind.SUBSCRIPTION) {
      const prices: Record<string, number> = {
        PREMIUM_STUDENT: parseInt(process.env.PRICE_PREMIUM_STUDENT || '50000', 10),
        PRO_TUTOR: parseInt(process.env.PRICE_PRO_TUTOR || '100000', 10),
      };
      gross = prices[refId] ?? 0;
    } else {
      const days = parseInt(refId, 10);
      gross = days * parseInt(process.env.FEATURED_PRICE_PER_DAY || '5000', 10);
    }
    if (promo.minAmount && gross < promo.minAmount)
      throw new BadRequestException('Below minimum');

    const discount =
      promo.discountType === 'PERCENT'
        ? Math.floor((gross * promo.discountValue) / 100)
        : promo.discountValue;
    return { gross, discount, net: Math.max(0, gross - discount) };
  }
}
