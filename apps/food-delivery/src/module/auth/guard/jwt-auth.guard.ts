import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from './../../../common/decorator/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const result = (await super.canActivate(context)) as boolean;
    if (!result) return false;

    // Lấy token từ header
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token missing');
    const token = authHeader.split(' ')[1];

    // Kiểm tra token có bị blacklist không
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) throw new UnauthorizedException('Token revoked');

    return true;
  }
}
