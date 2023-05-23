import { ConfigService } from '@nestjs/config/dist';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVER_PORT } from './constants';
import { config } from 'aws-sdk';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()

  const configService = app.get(ConfigService);
  const port = +configService.get<number>(SERVER_PORT)// || 3000;

  config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'eu-north-1',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Museu')
    .setDescription('Museu API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
bootstrap();
