import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const DEFAULT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

function parseFrontendOrigins(): string[] {
  const raw = process.env.FRONTEND_ORIGINS?.trim();
  if (!raw) return DEFAULT_ORIGINS;
  const origins = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return origins.length > 0 ? origins : DEFAULT_ORIGINS;
}

function isAllowedOrigin(origin: string | undefined, allowed: string[]): boolean {
  if (!origin) return true;
  if (allowed.includes(origin)) return true;
  if (process.env.ALLOW_VERCEL_PREVIEW === 'true') {
    return /^https:\/\/[\w-]+\.vercel\.app$/.test(origin);
  }
  return false;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigins = parseFrontendOrigins();

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin, frontendOrigins)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin ?? '(no origin)'}`));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS API listening on http://0.0.0.0:${port}`);
  console.log(`CORS allowed origins: ${frontendOrigins.join(', ')}`);
  if (process.env.ALLOW_VERCEL_PREVIEW === 'true') {
    console.log('CORS: Vercel preview (*.vercel.app) 허용 활성화');
  }
}
bootstrap();
