import { Reflector } from '@nestjs/core';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES_KEY } from '../decorators';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES_KEY,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new BadRequestException('User not found (Guard)');

    for (const role of user.roles) {
      if (validRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      'You do not have permission to access this route',
    );

    return true;
  }
}
