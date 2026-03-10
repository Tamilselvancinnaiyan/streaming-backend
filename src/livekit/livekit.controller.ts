import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { LivekitService } from './livekit.service';

@Controller('token')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Get()
  async getToken(
    @Query('room') room?: string,
    @Query('role') role?: 'host' | 'viewer',
    @Query('identity') identity?: string,
  ) {
    if (!room) {
      throw new BadRequestException('room is required');
    }

    return this.livekitService.generateToken({ room, role, identity });
  }
}
