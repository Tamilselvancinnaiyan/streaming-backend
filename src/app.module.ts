import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LivekitController } from './livekit/livekit.controller';
import { LivekitService } from './livekit/livekit.service';
import { StreamsController } from './streams/streams.controller';
import { StreamsService } from './streams/streams.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  controllers: [LivekitController, StreamsController, AnalyticsController],
  providers: [LivekitService, StreamsService, AnalyticsService],
})
export class AppModule {}
