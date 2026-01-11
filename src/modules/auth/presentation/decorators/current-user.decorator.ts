import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User } from '../../domain/entities';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data && user) {
      return user[data];
    }

    return user;
  },
);
