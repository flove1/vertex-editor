import {
  Body,
  Controller,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { UserService } from './user.service';
import { SignUpDto } from './dto/signUp.dto';
import * as bcrypt from 'bcrypt';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { AuthService } from '../auth/auth.service';
import { User } from '../entities/user.entity';
import { SignInDto } from './dto/signIn.dto';

const saltRounds = 10;

@UsePipes(new ValidationPipe())
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @MessagePattern({ cmd: 'signUp' })
  async signUp(@Body() { username, email, password }: SignUpDto) {
    const userExists = await Promise.all([
      this.userService.getUser(username, 'username'),
      this.userService.getUser(email, 'email'),
    ]);

    if (userExists.some((user) => user)) {
      throw new RpcException('User already exists');
    }

    const user = new User();
    user.username = username;
    user.email = email;
    user.passwordHash = await bcrypt.hash(password, saltRounds);

    try {
      await this.userService.createUser(user);
      return {
        message: `User ${user.id} created successfully`,
      };
    } catch (error) {
      console.log(`Failed to create user: ${error}`);
      throw new RpcException('Server error');
    }
  }

  @MessagePattern({ cmd: 'signIn' })
  async signIn(@Body() { username, password }: SignInDto) {
    return this.authService.generateTokens(
      username,
      password
    );
  }
}
