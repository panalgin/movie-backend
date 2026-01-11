import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies';
import { PrismaModule } from './prisma';

@Module({
  imports: [PrismaModule, MoviesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
