import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class JoinStreamDto {
  @IsString()
  @MaxLength(120)
  identity!: string;

  @IsOptional()
  @IsIn(['host', 'cohost', 'viewer'])
  role?: 'host' | 'cohost' | 'viewer';

  @IsOptional()
  @IsString()
  userId?: string;
}
