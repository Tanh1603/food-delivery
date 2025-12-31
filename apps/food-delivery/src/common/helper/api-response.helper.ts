// src/common/helpers/api-response.helper.ts
import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
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

export const ApiResponseWrapper = (dataType: Type, isArray = false) => {
  return applyDecorators(
    ApiExtraModels(ApiResponse, dataType),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(dataType) },
                  }
                : { $ref: getSchemaPath(dataType) },
            },
          },
        ],
      },
    }),
  );
};
