import {
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  username: string;

  @IsStrongPassword({
    minLength: 8,
  })
  @MaxLength(30)
  password: string;
}
