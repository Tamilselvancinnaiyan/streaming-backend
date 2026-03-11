import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LivekitController } from './livekit/livekit.controller';
import { LivekitService } from './livekit/livekit.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { StreamsController } from './streams/streams.controller';
import { StreamsService } from './streams/streams.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  controllers: [LivekitController, AuthController, StreamsController],
  providers: [LivekitService, AuthService, StreamsService],
})
export class AppModule {}
