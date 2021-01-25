import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { UserContext, UserRole } from './userContext';
import { NotSupportedRoleException } from '../exceptions/NotSupportedRoleException';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request | any, res: Response, next: () => void) {
    const bearerHeader = req.headers.authorization;
    const accessToken = bearerHeader && bearerHeader.split(' ')[1];

    try {
      const userContext = <UserContext>(
        verify(accessToken, process.env.JWT_SECRET)
      );

      if (!Object.values(UserRole).includes(userContext.role)) {
        throw new NotSupportedRoleException('role is not supported');
      }

      req.userContext = userContext;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    next();
  }
}
