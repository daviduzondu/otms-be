import { Injectable } from '@nestjs/common';
import { Database } from '../kysesly/database';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';

@Injectable()
export class UsersService {
  constructor(@InjectKysesly() private db: Database) {}

  async getUserRecord({ userId, email }: { userId?: string; email?: string }) {
    return await this.db
      .selectFrom('users')
      .selectAll()
      .where(userId ? 'id' : 'email', '=', userId ?? email)
      .executeTakeFirst();
  }

  async getUserProfile({ userId, email }: { userId?: string; email?: string }) {
    const user = await this.db
      .selectFrom('users')
      .leftJoin('institutions', 'users.institutionId', 'institutions.id')
      .leftJoin('media', 'media.uploader', 'users.id')
      .leftJoin('tests', 'tests.creatorId', 'users.id')
      .select([
        'users.id',
        'users.firstName',
        'users.lastName',
        'users.email',
        'users.photoId',
        'users.banned',
        'users.isEmailVerified',
        'users.authType',
        'tests.id as testId',
        'institutions.id as institutionId',
        'institutions.name as institutionName',
        'media.id as mediaId',
        'media.url as mediaUrl',
      ])
      .where(userId ? 'users.id' : 'users.email', '=', userId ?? email)
      .executeTakeFirst();

    if (!user) {
      return null; // Handle if no user is found
    }

    // Now format the data to fit your desired output structure
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      photoId: user.photoId,
      banned: user.banned,
      isEmailVerified: user.isEmailVerified,
      authType: user.authType,
      institution: user.institutionId
        ? [{ id: user.institutionId, name: user.institutionName }]
        : [],
      uploads: user.mediaId ? [{ id: user.mediaId, url: user.mediaUrl }] : [],
    };
  }
}
