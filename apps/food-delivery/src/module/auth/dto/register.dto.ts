import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../../generated/prisma/enums';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @IsEnum(UserRole, { message: 'Role must be a valid UserRole' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;
}
