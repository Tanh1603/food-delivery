import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { Public } from '../../common/decorator/public.decorator';
import { ApiResponseWrapper } from '../../common/helper/api-response.helper';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { UserDto } from '../user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // <<< thêm cái này
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({
    type: SignInDto,
  })
  @ApiResponseWrapper(AuthResponseDto)
  signIn(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  @ApiBody({
    type: RegisterDto,
  })
  @ApiResponseWrapper(AuthResponseDto)
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('logout')
  @ApiBearerAuth()
  logOut(@Request() req) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.logout(token);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiResponseWrapper(UserDto)
  getProfile(@CurrentUser() user) {
    return user;
  }
}
