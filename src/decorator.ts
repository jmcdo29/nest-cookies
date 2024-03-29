import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { NestCookieRequest } from './cookie.interface';

export const Cookies = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<NestCookieRequest<{}>>();
    if (data) {
      return req.cookies[data];
    }
    return req.cookies;
  },
);

export const NewCookies = createParamDecorator(
  (_data: never, context: ExecutionContext) =>
    context.switchToHttp().getRequest<NestCookieRequest<{}>>()._cookies,
);
