import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LivekitService {
  async generateToken(params: {
    room: string;
    role?: 'host' | 'viewer';
    identity?: string;
  }) {
    const role = params.role ?? 'viewer';
    const identity = params.identity ?? `user_${randomUUID().slice(0, 8)}`;

    const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
    const wsUrl = process.env.LIVEKIT_URL || 'ws://localhost:7880';

    const accessToken = new AccessToken(apiKey, apiSecret, {
      identity,
      metadata: role === 'host' ? 'host' : 'viewer',
    });
    accessToken.addGrant({
      room: params.room,
      roomJoin: true,
      canPublish: role === 'host',
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await accessToken.toJwt();

    return {
      room: params.room,
      identity,
      role,
      wsUrl,
      token,
    };
  }
}
