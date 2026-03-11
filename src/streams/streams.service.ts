import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MODELS } from '../database/database.constants';
import { AppModels } from '../database/models';
import { Op } from 'sequelize';
import { randomUUID } from 'node:crypto';
import { StartStreamDto } from './dto/start-stream.dto';

@Injectable()
export class StreamsService {
  constructor(@Inject(MODELS) private readonly models: AppModels) {}

  private generateRoomId() {
    return `room_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }

  async startStream(dto: StartStreamDto) {
    const hostUser = await this.models.User.findByPk(dto.hostUserId);
    if (!hostUser) {
      throw new NotFoundException('host user not found');
    }

    const roomId = this.generateRoomId();

    const stream = await this.models.Stream.create({
      host_id: dto.hostUserId,
      room_name: roomId,
      title: dto.title,
      category: dto.category ?? 'general',
      status: 'live',
      startedAt: new Date(),
      endedAt: null,
    });

    return stream;
  }

  async stopStream(streamId: string) {
    const stream = await this.models.Stream.findByPk(streamId);
    if (!stream) {
      throw new NotFoundException('stream not found');
    }

    if (stream.get('endedAt')) {
      throw new BadRequestException('stream already stopped');
    }

    await stream.update({
      endedAt: new Date(),
      status: 'ended',
    });

    return stream;
  }

  async getReconcileRecords() {
    return this.models.Stream.findAll({
      where: {
        [Op.or]: [{ endedAt: null }, { endedAt: { [Op.lte]: new Date() } }],
      },
      order: [['createdAt', 'DESC']],
    });
  }
}
