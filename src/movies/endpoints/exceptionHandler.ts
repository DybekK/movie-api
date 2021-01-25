import { ForbiddenException, HttpStatus } from '@nestjs/common';
import { ExceededLimitException } from '../exceptions/ExceededLimitException';
import { MovieNotFoundException } from '../exceptions/MovieNotFoundException';
import { Response } from 'express';

export const exceptionHandler = (err, response: Response) => {
  if (err instanceof ForbiddenException) {
    return response.status(HttpStatus.FORBIDDEN).json({
      message: err.message,
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
  if (err instanceof ExceededLimitException) {
    return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      message: err.message,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  }
  if (err instanceof MovieNotFoundException) {
    return response.status(HttpStatus.BAD_REQUEST).json({
      message: err.message,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
  return response.status(err.status).json({
    message: err.message,
    statusCode: err.status,
  });
};
