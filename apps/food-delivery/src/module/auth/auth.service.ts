import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { RedisService } from '../../common/redis/redis.service';
import { UserDto } from '../user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  // ------------------ VALIDATE USER ------------------
  async validateUser(email: string, pass: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) return null;

    // Trả user info mà không có password
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  // ------------------ LOGIN ------------------
  async login(user: UserDto): Promise<{ access_token: string; user: UserDto }> {
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user,
    };
  }

  // ------------------ REGISTER ------------------
  async register(
    dto: RegisterDto,
  ): Promise<{ access_token: string; user: UserDto }> {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already exists');

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    const payload = { sub: newUser.id, email: newUser.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  }

  // ------------------ LOGOUT ------------------
  async logout(token: string): Promise<{ message: string }> {
    const decoded = this.jwtService.decode(token);
    if (!decoded?.exp) {
      throw new UnauthorizedException('Invalid token');
    }

    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    await this.redisService.set(`blacklist:${token}`, 'true', ttl);

    return { message: 'Logged out successfully' };
  }

  // Kiểm tra token có bị blacklist không
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisService.get(`blacklist:${token}`);
    return !!result;
  }
}
