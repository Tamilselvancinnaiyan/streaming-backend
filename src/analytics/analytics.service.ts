import { Injectable } from '@nestjs/common';
import { StreamsService } from '../streams/streams.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly streamsService: StreamsService) {}

  getOverview() {
    return this.streamsService.analyticsSummary();
  }
}
