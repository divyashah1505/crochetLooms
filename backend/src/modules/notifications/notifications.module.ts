import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { WhatsappService } from './whatsapp.service';

@Module({
  providers: [MailService, WhatsappService],
  exports: [MailService, WhatsappService],
})
export class NotificationsModule {}
