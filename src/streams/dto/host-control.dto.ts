import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class HostControlDto {
  @IsIn([
    'start_stream',
    'stop_stream',
    'mute_mic',
    'unmute_mic',
    'toggle_camera',
    'screen_share',
    'invite_cohost',
    'record_stream',
    'pin_message',
    'ban_user',
    'highlight_message',
  ])
  eventType!:
    | 'start_stream'
    | 'stop_stream'
    | 'mute_mic'
    | 'unmute_mic'
    | 'toggle_camera'
    | 'screen_share'
    | 'invite_cohost'
    | 'record_stream'
    | 'pin_message'
    | 'ban_user'
    | 'highlight_message';

  @IsOptional()
  @IsString()
  actorUserId?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
