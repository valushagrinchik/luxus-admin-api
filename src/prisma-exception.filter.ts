import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { ERROR_CODES, ERROR_MESSAGES } from './constants';

const prismaCodeToError = (error: PrismaClientKnownRequestError) => {
  switch (error.code) {
    case 'P2002':
      return ERROR_CODES[
        `${(error.meta.modelName as string).toUpperCase()}_ALREADY_EXISTS`
      ];
    case 'P2025':
      return ERROR_CODES[
        `${(error.meta.modelName as string).toUpperCase()}_NOT_FOUND`
      ];
  }
};

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const error = prismaCodeToError(exception);

    if (!error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error,
      message: [ERROR_MESSAGES[error]],
      // cause: exception,
    });
  }
}
