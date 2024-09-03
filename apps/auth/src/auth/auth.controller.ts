import { Body, Controller, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { formatResponse } from '@vertex-editor/response';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'refresh' })
  async refresh(@Body() dto: { token: string }) {
    const token = await this.authService.refresh(dto.token);

    return formatResponse(HttpStatus.CREATED, 'Token refreshed', token);
  }
}
