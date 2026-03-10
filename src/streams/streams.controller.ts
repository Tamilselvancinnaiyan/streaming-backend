import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { JoinStreamDto } from './dto/join-stream.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { HostControlDto } from './dto/host-control.dto';

@Controller()
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Get('live-sessions')
  getLiveSessions() {
    return this.streamsService.getLiveSessions();
  }

  @Get('streams/room/:roomName')
  getStreamByRoom(@Param('roomName') roomName: string) {
    return this.streamsService.getStreamByRoom(roomName);
  }

  @Post('streams')
  createStream(@Body() dto: CreateStreamDto) {
    return this.streamsService.createStream(dto);
  }

  @Patch('streams/:id/start')
  startStream(@Param('id') id: string) {
    return this.streamsService.startStream(id);
  }

  @Patch('streams/:id/stop')
  stopStream(@Param('id') id: string) {
    return this.streamsService.stopStream(id);
  }

  @Post('streams/:id/join')
  joinStream(@Param('id') id: string, @Body() dto: JoinStreamDto) {
    return this.streamsService.joinStream(id, dto);
  }

  @Patch('streams/:id/leave')
  leaveStream(@Param('id') id: string, @Query('identity') identity: string) {
    return this.streamsService.leaveStream(id, identity);
  }

  @Get('streams/:id/chat')
  getChatMessages(@Param('id') id: string) {
    return this.streamsService.getChatMessages(id);
  }

  @Post('streams/:id/chat')
  addChatMessage(@Param('id') id: string, @Body() dto: ChatMessageDto) {
    return this.streamsService.addChatMessage(id, dto);
  }

  @Post('streams/:id/host-control')
  hostControl(@Param('id') id: string, @Body() dto: HostControlDto) {
    return this.streamsService.applyHostControl(id, dto);
  }
}
