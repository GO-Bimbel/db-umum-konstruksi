import tracer from './tracer';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './utils/exceptionFilter';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  tracer.start();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const logger = app.get(LoggerService);
  const port = process.env.PORT;
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
