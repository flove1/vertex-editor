import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { RpcException } from '@nestjs/microservices';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async createUser(user: User): Promise<User> {
    const errors = await validate(user);

    if (errors.length > 0) {
      throw new RpcException('Validation failed');
    }

    return this.userRepository.save(user);
  }

  getUser(
    value: string | number,
    by: 'username' | 'email' | 'id'
  ): Promise<User> {
    return this.userRepository.findOneBy({ [by]: value });
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
