import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppModule } from '../src/app.module';

async function exportOpenAPI() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Movie Backend API')
    .setDescription(
      'Movie management API with authentication and role-based access control',
    )
    .setVersion(process.env.npm_package_version || '1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputPath = path.resolve(__dirname, '../openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`OpenAPI spec exported to ${outputPath}`);

  await app.close();
}

exportOpenAPI();
