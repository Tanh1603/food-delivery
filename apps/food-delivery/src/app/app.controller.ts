import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Public()
  // @Get('health')
  // healthCheck(@Request() req: Request) {
  //   return this.appService.healthCheck(req.url);
  // }
}
