import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { CurrentUser } from '../../common/decorator/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // <<< thêm cái này
  @UseGuards(LocalAuthGuard)
  @Post('login')
  signIn(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('logout')
  logOut(@Request() req) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.logout(token);
  }

  @Get('profile')
  getProfile(@CurrentUser() user) {
    return user;
  }
}
