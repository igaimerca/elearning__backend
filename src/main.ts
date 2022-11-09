import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as processRequest from 'graphql-upload/processRequest.js';
import { SentryService } from '@ntegral/nestjs-sentry';

async function bootstrap() {
  const adapter = new FastifyAdapter();
  const fastify = adapter.getInstance();

  fastify.addContentTypeParser('multipart', (request, done) => {
    request.isMultipart = true;
    done();
  });
  fastify.addHook('preValidation', async function (request: any, reply) {
    if (!request.raw.isMultipart) {
      return;
    }

    request.body = await processRequest(request.raw, reply.raw);
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      logger: false
    }
  );

  app.useLogger(SentryService.SentryServiceInstance());

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
