import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((resData) => {
        let message = 'Operation successful';
        let data = resData;

        if (resData && typeof resData === 'object' && 'message' in resData && 'data' in resData) {
          message = resData.message;
          data = resData.data;
        } else if (resData && typeof resData === 'object' && 'message' in resData && Object.keys(resData).length === 1) {
          message = resData.message;
          data = null;
        }

        return {
          success: true,
          statusCode,
          message,
          data,
        };
      }),
    );
  }
}
