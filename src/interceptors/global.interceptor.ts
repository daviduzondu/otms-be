import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((obj) => {
        if (obj?.data) {
          const { data } = obj;
          data.createdAt = undefined;
          data.updatedAt = undefined;
        }
        // console.log(obj);
        return instanceToPlain(obj);
      }),
    );
  }
}
