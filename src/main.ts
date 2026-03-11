import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';

let cachedExpressApp: Express | undefined;
const startedAt = new Date().toISOString();

function getAllowedOrigins() {
  const allowedOrigins = [
    'http://localhost:3001',
    'https://streaming-frontend-five.vercel.app',
    ...(process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : []),
  ];

  return [...new Set(allowedOrigins.filter(Boolean))];
}

async function bootstrapServer() {
  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

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

  expressApp.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      startedAt,
      timestamp: new Date().toISOString(),
    });
  });

  await app.init();

  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  if (!cachedExpressApp) {
    cachedExpressApp = await bootstrapServer();
  }

  return cachedExpressApp(req, res);
}
