import { Injectable } from '@nestjs/common';
import { SendGridService } from 'src/common/services/sendgrid.service';
import { CreateSupportInput } from './dto/create-support.input';

@Injectable()
export class SupportService {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly emailService: SendGridService) {}
  contact(createSupportInput: CreateSupportInput) {
    const email = {
      to: 'Support@gradearc.com',
      from: createSupportInput.email,
      subject: `Support Request from ${createSupportInput.name}`,
      text: `
      ${createSupportInput.title}
      ${createSupportInput.description}`,
    };
    this.emailService.send(email);
  }
}
