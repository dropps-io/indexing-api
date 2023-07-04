import { NestFactory } from '@nestjs/core';

import { ApiModule } from './api.module';
import { PORT } from './globals';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, { cors: true });
  await app.listen(PORT);
}
bootstrap();
