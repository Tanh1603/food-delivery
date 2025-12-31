import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
