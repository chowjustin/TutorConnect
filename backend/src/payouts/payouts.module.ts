import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import {
  AdminPayoutsController,
  TutorPayoutsController,
} from './payouts.controller';
import { PayoutsService } from './payouts.service';

@Module({
  imports: [AuthModule, MailModule],
  controllers: [TutorPayoutsController, AdminPayoutsController],
  providers: [PayoutsService],
})
export class PayoutsModule {}
