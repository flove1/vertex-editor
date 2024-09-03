import { HttpStatus } from "@nestjs/common";

export type StandardResponse<T> = {
  statusCode: HttpStatus;
  message: string;
  data?: T;
  error?: unknown;
}