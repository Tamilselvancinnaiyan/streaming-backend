import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { col, fn, literal, Op } from 'sequelize';
import { MODELS } from '../database/database.constants';
import { AppModels } from '../database/models';
import { randomUUID } from 'node:crypto';
import { CreateStreamDto } from './dto/create-stream.dto';
import { JoinStreamDto } from './dto/join-stream.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { HostControlDto } from './dto/host-control.dto';

@Injectable()
export class StreamsService {
  constructor(@Inject(MODELS) private readonly models: AppModels) {}

  async createStream(dto: CreateStreamDto) {
    const user = await this.models.User.create({
      displayName: dto.hostName,
      avatarUrl: dto.hostAvatarUrl,
      role: 'host',
    });

    const roomName = `stream_${randomUUID().slice(0, 8)}`;

    const stream = await this.models.Stream.create({
      hostId: user.get('id'),
      roomName,
      title: dto.title,
      category: dto.category,
      description: dto.description,
      tags: dto.tags ?? [],
      thumbnailUrl: dto.thumbnailUrl,
      visibility: dto.visibility ?? 'public',
      status: 'draft',
      streamUrl: `/live/${roomName}`,
      shareLink: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/live/${roomName}`,
      embedCode: `<iframe src="${process.env.FRONTEND_URL || 'http://localhost:3001'}/live/${roomName}" width="100%" height="450"></iframe>`,
    });

    return {
      stream,
      generated: {
        streamUrl: stream.get('streamUrl'),
        shareLink: stream.get('shareLink'),
        embedCode: stream.get('embedCode'),
      },
    };
  }

  async startStream(id: string) {
    const stream = await this.models.Stream.findByPk(id);
    if (!stream) throw new NotFoundException('stream not found');

    await stream.update({ status: 'live', startedAt: new Date(), endedAt: null });
    await this.models.StreamEvent.create({
      streamId: stream.get('id'),
      eventType: 'start_stream',
      payload: { source: 'api' },
    });
    return stream;
  }

  async stopStream(id: string) {
    const stream = await this.models.Stream.findByPk(id);
    if (!stream) throw new NotFoundException('stream not found');

    await stream.update({ status: 'ended', endedAt: new Date() });
    await this.models.StreamParticipant.update(
      { isActive: false, leftAt: new Date() },
      { where: { streamId: id, isActive: true } },
    );
    await this.models.StreamEvent.create({
      streamId: stream.get('id'),
      eventType: 'stop_stream',
      payload: { source: 'api' },
    });
    return stream;
  }

  async joinStream(id: string, dto: JoinStreamDto) {
    const stream = await this.models.Stream.findByPk(id);
    if (!stream) throw new NotFoundException('stream not found');

    if (stream.get('status') !== 'live') {
      throw new BadRequestException('stream is not live');
    }

    const [participant] = await this.models.StreamParticipant.upsert(
      {
        streamId: id,
        userId: dto.userId,
        identity: dto.identity,
        role: dto.role ?? 'viewer',
        isActive: true,
        leftAt: null,
      },
      { returning: true },
    );

    return participant;
  }

  async leaveStream(id: string, identity: string) {
    await this.models.StreamParticipant.update(
      { isActive: false, leftAt: new Date() },
      { where: { streamId: id, identity, isActive: true } },
    );
    return { left: true };
  }

  async addChatMessage(id: string, dto: ChatMessageDto) {
    const stream = await this.models.Stream.findByPk(id);
    if (!stream) throw new NotFoundException('stream not found');

    const message = await this.models.ChatMessage.create({
      streamId: id,
      username: dto.username,
      avatarUrl: dto.avatarUrl,
      message: dto.message,
      messageType: dto.messageType ?? 'normal',
      amount: dto.amount,
      isHighlighted: dto.messageType === 'super_chat',
    });

    return message;
  }

  async getChatMessages(id: string) {
    return this.models.ChatMessage.findAll({
      where: { streamId: id, isDeleted: false },
      order: [['createdAt', 'ASC']],
      limit: 200,
    });
  }

  async applyHostControl(id: string, dto: HostControlDto) {
    const stream = await this.models.Stream.findByPk(id);
    if (!stream) throw new NotFoundException('stream not found');

    const event = await this.models.StreamEvent.create({
      streamId: id,
      actorUserId: dto.actorUserId,
      eventType: dto.eventType,
      payload: dto.payload ?? {},
    });

    if (dto.eventType === 'pin_message') {
      const messageId = String(dto.payload?.messageId || '');
      if (!messageId) throw new BadRequestException('payload.messageId is required');
      await this.models.ChatMessage.update(
        { messageType: 'pinned', isHighlighted: true },
        { where: { id: messageId, streamId: id } },
      );
    }

    if (dto.eventType === 'highlight_message') {
      const messageId = String(dto.payload?.messageId || '');
      if (!messageId) throw new BadRequestException('payload.messageId is required');
      await this.models.ChatMessage.update(
        { isHighlighted: true },
        { where: { id: messageId, streamId: id } },
      );
    }

    return event;
  }

  async getLiveSessions() {
    const streams = await this.models.Stream.findAll({
      where: {
        status: 'live',
        visibility: {
          [Op.in]: ['public', 'unlisted'],
        },
      },
      include: [{ model: this.models.User, as: 'host' }],
      order: [['startedAt', 'DESC']],
    });

    const result = await Promise.all(
      streams.map(async (stream) => {
        const viewerCount = await this.models.StreamParticipant.count({
          where: {
            streamId: stream.get('id') as string,
            isActive: true,
            role: { [Op.in]: ['viewer', 'cohost'] },
          },
        });

        const startedAt = stream.get('startedAt') as Date | null;
        const durationSec = startedAt ? Math.floor((Date.now() - startedAt.getTime()) / 1000) : 0;

        return {
          id: stream.get('id'),
          roomName: stream.get('roomName'),
          title: stream.get('title'),
          thumbnailUrl: stream.get('thumbnailUrl'),
          category: stream.get('category'),
          tags: stream.get('tags'),
          viewerCount,
          durationSec,
          host: stream.get('host'),
          joinPath: `/live/${stream.get('roomName')}`,
        };
      }),
    );

    return result;
  }

  async getStreamByRoom(roomName: string) {
    const stream = await this.models.Stream.findOne({ where: { roomName } });
    if (!stream) throw new NotFoundException('stream not found');

    const viewerCount = await this.models.StreamParticipant.count({
      where: { streamId: stream.get('id') as string, isActive: true },
    });

    return { stream, viewerCount };
  }

  async analyticsSummary() {
    const [
      totalStreams,
      totalViewers,
      peakViewersRaw,
      avgWatchTimeRaw,
      viewerGrowth,
      engagement,
      durations,
    ] = await Promise.all([
      this.models.Stream.count(),
      this.models.StreamParticipant.count({ where: { role: 'viewer' } }),
      this.models.StreamParticipant.findAll({
        attributes: ['streamId', [fn('COUNT', col('id')), 'viewerCount']],
        where: { role: 'viewer' },
        group: ['streamId'],
        order: [[literal('"viewerCount"'), 'DESC']],
        limit: 1,
      }),
      this.models.StreamParticipant.findAll({
        attributes: [[fn('AVG', literal('EXTRACT(EPOCH FROM (COALESCE(left_at, NOW()) - joined_at))')), 'avgWatchSec']],
        where: { role: 'viewer' },
      }),
      this.models.Stream.findAll({
        attributes: [
          [fn('DATE', col('created_at')), 'date'],
          [fn('COUNT', col('id')), 'streams'],
        ],
        group: [literal('DATE(created_at)')],
        order: [[literal('DATE(created_at)'), 'ASC']],
      }),
      this.models.ChatMessage.findAll({
        attributes: [
          [fn('DATE', col('created_at')), 'date'],
          [fn('COUNT', col('id')), 'messages'],
        ],
        group: [literal('DATE(created_at)')],
        order: [[literal('DATE(created_at)'), 'ASC']],
      }),
      this.models.Stream.findAll({
        attributes: [
          'id',
          [fn('EXTRACT', literal('EPOCH FROM (COALESCE(ended_at, NOW()) - started_at)')), 'durationSec'],
        ],
        where: { startedAt: { [Op.ne]: null } },
        order: [[literal('"durationSec"'), 'DESC']],
        limit: 100,
      }),
    ]);

    const peakViewers = peakViewersRaw.length ? Number(peakViewersRaw[0].get('viewerCount')) : 0;
    const averageWatchTimeSec = avgWatchTimeRaw.length
      ? Math.round(Number(avgWatchTimeRaw[0].get('avgWatchSec') || 0))
      : 0;

    return {
      cards: {
        totalStreams,
        totalViewers,
        peakViewers,
        averageWatchTimeSec,
      },
      charts: {
        viewerGrowth,
        streamEngagement: engagement,
        liveSessionDuration: durations,
      },
    };
  }
}
