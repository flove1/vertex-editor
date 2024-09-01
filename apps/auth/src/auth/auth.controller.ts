import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'refresh' })
  async refresh(@Body() dto: { token: string }) {
    return this.authService.refresh(dto.token);
  }
}
