import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class StartStreamDto {
  @IsUUID()
  hostUserId!: string;

  @IsString()
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;
}
