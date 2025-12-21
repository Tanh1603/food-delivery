import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '../common/decorator/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  healthCheck(@Request() req: Request) {
    return this.appService.healthCheck(req.url);
  }
}
