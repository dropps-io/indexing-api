import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { ApiModule } from './api.module';
import { PORT } from './globals';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(ApiModule, new FastifyAdapter());
  app.enableCors();
  await app.listen(PORT);
}
bootstrap();
