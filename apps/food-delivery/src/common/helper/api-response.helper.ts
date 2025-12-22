// src/common/helpers/api-response.helper.ts
import { ApiResponse } from '../dto/api-response.dto';

export function successResponse<T>(
  data: T,
  message = 'Success',
  meta?: Record<string, unknown>,
): ApiResponse<T> {
  return { success: true, data, message, meta };
}

export function errorResponse(
  message: string,
  data: unknown = null,
): ApiResponse<unknown> {
  return { success: false, data, message };
}
