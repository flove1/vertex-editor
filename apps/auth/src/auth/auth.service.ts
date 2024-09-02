import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { formatErrorResponse } from '@common/helpers/response-utils';

type AccessPayload = {
  userId: number;
  username: string;
  roles: string[];
};

type RefreshPayload = {
  userId: number;
};

type Tokens = {
  access_token: string;
  refresh_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async refresh(token: string) {
    let payload: RefreshPayload;

    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new RpcException(
        formatErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication failed')
      );
    }

    const user = await this.userRepository.findOneBy({ id: payload.userId });

    if (!user) {
      throw new RpcException(
        formatErrorResponse(HttpStatus.NOT_FOUND, 'User does not exist')
      );
    }

    const accessPayload: AccessPayload = {
      userId: user.id,
      username: user.username,
      roles: ['user'],
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      privateKey: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '10m',
    });

    return {
      access_token: accessToken,
    };
  }

  async generateTokens(username: string, password: string): Promise<Tokens> {
    const user = await this.userRepository.findOneBy({ username: username });

    if (!user || !compareSync(password, user.passwordHash)) {
      throw new RpcException(
        formatErrorResponse(HttpStatus.UNAUTHORIZED, 'Authentication failed')
      );
    }

    const accessPayload: AccessPayload = {
      userId: user.id,
      username: user.username,
      roles: ['user'],
    };

    const refreshPayload: RefreshPayload = {
      userId: user.id,
    };

    const accessToken = this.jwtService.signAsync(accessPayload, {
      privateKey: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '10m',
    });

    const refreshToken = this.jwtService.signAsync(refreshPayload, {
      privateKey: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '1d',
    });

    return Promise.all([accessToken, refreshToken]).then(
      ([access, refresh]) => {
        return {
          access_token: access,
          refresh_token: refresh,
        };
      }
    );
  }
}
