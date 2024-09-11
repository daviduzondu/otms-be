import {
  CanActivate,
  ExecutionContext,
  // Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { DrizzleService } from '../drizzle/drizzle.service';
import { users } from '../drizzle/schema';

@Injectable()
export class SyncGuard implements CanActivate {
  constructor(private drizzleService: DrizzleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(req);
    // if (token) {
    //   const {
    //     uid,
    //     email,
    //     firebase: { sign_in_provider },
    //   } = await getAuth().verifyIdToken(token);
    //   if (sign_in_provider === 'google.com') {
    //     await this.drizzleService.db
    //       .insert(users)
    //       .values({ id: crypto.randomUUID(), email });
    //   }
    // }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
