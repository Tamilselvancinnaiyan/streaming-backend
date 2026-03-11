import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response } from 'express';

const startedAt = new Date().toISOString();

function getAllowedOrigins() {
  const allowedOrigins = [
    'http://localhost:3001',
    'https://streaming-frontend-five.vercel.app',
    ...(process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : []),
  ];

  return [...new Set(allowedOrigins.filter(Boolean))];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: getAllowedOrigins(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      startedAt,
      timestamp: new Date().toISOString(),
    });
  });

  const port = Number(process.env.PORT || 3000);

  await app.listen(port);

  console.log(`🚀 Local Nest backend running on http://localhost:${port}`);
}

bootstrap();