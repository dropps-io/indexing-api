// health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('healthz')
export class HealthController {
  @Get()
  getHealth(): string {
    return 'OK';
  }
}
