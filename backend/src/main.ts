import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { configureApplication } from './common/configure-app.js';

if (existsSync('.env')) {
  loadEnvFile('.env');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApplication(app);

  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  await app.listen(port);

  console.log(`BrewLite API running at http://localhost:${port}`);
}

void bootstrap();
