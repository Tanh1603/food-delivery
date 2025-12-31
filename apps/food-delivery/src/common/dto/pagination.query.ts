import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  limit?: number;

  @IsOptional()
  @ApiPropertyOptional()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
