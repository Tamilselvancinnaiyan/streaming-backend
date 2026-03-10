import { IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStreamDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(120)
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsIn(['public', 'private', 'unlisted'])
  visibility?: 'public' | 'private' | 'unlisted';

  @IsString()
  hostName!: string;

  @IsOptional()
  @IsString()
  hostAvatarUrl?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
