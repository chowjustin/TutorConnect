import { Module } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { TutorsController, AdminTutorsController } from './tutors.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [TutorsController, AdminTutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
