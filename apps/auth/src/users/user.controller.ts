import { Body, Controller, HttpStatus, ValidationPipe } from '@nestjs/common';

import { UserService } from './user.service';
import { SignUpRequestDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { AuthService } from '../auth/auth.service';
import { User } from '../entity/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';
import { formatErrorResponse, formatResponse, formatValidationErrorResponse } from '@vertex-editor/response';

const saltRounds = 10;

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @MessagePattern({ cmd: 'signUp' })
  async signUp(
    @Body(
      new ValidationPipe({
        exceptionFactory: (errors) =>
          new RpcException(formatValidationErrorResponse(errors)),
      })
    )
    signUpDto: SignUpRequestDto
  ) {
    const userExists = await Promise.all([
      this.userService.getUser(signUpDto.username, 'username'),
      this.userService.getUser(signUpDto.email, 'email'),
    ]);

    if (userExists.some((user) => user)) {
      throw new RpcException(
        formatErrorResponse(HttpStatus.CONFLICT, 'User already exists')
      );
    }

    const user = new User();
    user.username = signUpDto.username;
    user.email = signUpDto.email;
    user.passwordHash = await bcrypt.hash(signUpDto.password, saltRounds);

    await this.userService.createUser(user);

    return formatResponse(
      HttpStatus.CREATED,
      `User created successfully`,
      plainToInstance(UserDto, user, { excludeExtraneousValues: true })
    );
  }

  @MessagePattern({ cmd: 'signIn' })
  async signIn(@Body() { username, password }: SignInDto) {
    const tokens = await this.authService.generateTokens(username, password);

    return formatResponse(
      HttpStatus.CREATED,
      `User logged in successfully`,
      tokens
    );
  }
}
