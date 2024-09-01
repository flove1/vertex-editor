import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
  })
  @MaxLength(30)
  password: string;
}
