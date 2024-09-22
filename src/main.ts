import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: ['.env'] });

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );
    await app.listen(process.env.APP_PORT);
}
bootstrap();
