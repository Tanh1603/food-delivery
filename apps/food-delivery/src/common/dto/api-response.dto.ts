import { ApiProperty } from '@nestjs/swagger';

// src/common/dto/api-response.dto.ts
export class ApiResponse<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  data: T | null;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty()
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}
