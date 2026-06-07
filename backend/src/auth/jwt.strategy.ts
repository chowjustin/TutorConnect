import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
  const payloadDto = plainToClass(JwtPayloadDto, payload);
  const errors = await validate(payloadDto);
  if (errors.length > 0) throw new UnauthorizedException('Invalid token payload');

  const user = await this.prisma.user.findUnique({
    where: { id: payloadDto.sub },
  });
  if (!user) throw new UnauthorizedException('User not found');

  return { sub: user.id, email: user.email, role: user.role };
}

}
