import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { StartStreamDto } from './dto/start-stream.dto';

@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Post('start')
  startStream(@Body() dto: StartStreamDto) {
    return this.streamsService.startStream(dto);
  }

  @Patch(':id/stop')
  stopStream(@Param('id') id: string) {
    return this.streamsService.stopStream(id);
  }

  @Get('reconcile')
  reconcileRecords() {
    return this.streamsService.getReconcileRecords();
  }
}
