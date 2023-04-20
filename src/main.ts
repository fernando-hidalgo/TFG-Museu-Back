import { ConfigService } from '@nestjs/config/dist';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVER_PORT } from './constants';
import { config } from 'aws-sdk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  const configService = app.get(ConfigService);
  const port = +configService.get<number>(SERVER_PORT) || 3000;
  config.update({
    accessKeyId: 'AKIA3XSTFV3WGPEP3RGM',
    secretAccessKey: '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',
    region: 'eu-north-1',
  });
  await app.listen(port);
}
bootstrap();
