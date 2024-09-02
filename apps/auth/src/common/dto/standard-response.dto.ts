import { HttpStatus } from "@nestjs/common";

export class StandardResponse<T> {
  statusCode: HttpStatus;
  message: string;
  data?: T;
  error?: unknown;
}