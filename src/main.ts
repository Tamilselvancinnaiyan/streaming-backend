import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverless from 'serverless-http';
import type { INestApplication } from '@nestjs/common';
import type { Request, Response } from 'express';

let cachedServer: ReturnType<typeof serverless> | undefined;
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

function configureApp(app: INestApplication) {
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
}

function registerHeartbeatRoute(app: INestApplication) {
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      event: 'heartbeat',
      status: 'ok',
      port: Number(process.env.PORT || 3000),
      startedAt,
      timestamp: new Date().toISOString(),
    });
  });
}

async function bootstrapServerless() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  registerHeartbeatRoute(app);

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();

  return serverless(expressApp);
}

export default async function handler(req: Request, res: Response) {
  if (!cachedServer) {
    cachedServer = await bootstrapServerless();
  }

  return cachedServer(req, res);
}

async function bootstrapLocal() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  registerHeartbeatRoute(app);
  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`LiveKit Nest backend running on http://localhost:${port}`);
}

if (require.main === module) {
  bootstrapLocal();
}
