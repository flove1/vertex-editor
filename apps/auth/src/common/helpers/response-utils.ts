import { HttpStatus, ValidationError } from '@nestjs/common';
import { StandardResponse } from '../dto/standard-response.dto';

export function formatResponse<T>(
  statusCode: HttpStatus,
  message: string,
  data?: T
): StandardResponse<T> {
  return {
    statusCode,
    message,
    data,
  };
}

export function formatErrorResponse(
  statusCode: HttpStatus,
  message: string,
  error?: unknown
): StandardResponse<unknown> {
  return {
    statusCode,
    message,
    error,
  };
}

export function formatValidationErrorResponse(
  errors: ValidationError[]
): StandardResponse<unknown> {
  return formatErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Validation failed',
    errors.map((error) => {
      const { property, value, constraints } = error;

      return {
        property,
        value,
        constraints: Object.values(constraints),
      };
    }),
  )
}