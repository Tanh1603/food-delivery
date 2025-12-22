// src/common/dto/api-response.dto.ts
export class ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}
