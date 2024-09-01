import { IsEmail, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  @Length(5, 30)
  username: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  @Column({ default: false })
  isActivated: boolean;
}
