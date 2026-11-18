import { HttpException } from '@nestjs/common';

export function apiError(
  statusCode: number,
  code: string,
  message: string,
  details = {},
) {
  return new HttpException(
    { statusCode, code, message, ...details },
    statusCode,
  );
}
