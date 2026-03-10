import { IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @MaxLength(100)
  username!: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsString()
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @IsIn(['normal', 'super_chat'])
  messageType?: 'normal' | 'super_chat';

  @IsOptional()
  @IsNumber()
  amount?: number;
}
