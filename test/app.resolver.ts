import { UseInterceptors } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { NestCookieRequest } from '../src';
import { AppService } from './app.service';
import { GqlCookieInterceptor } from './graphql-cookie.interceptor';

@UseInterceptors(GqlCookieInterceptor)
@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}
  @Query(() => String)
  sayHello(@Context() ctx: { req: NestCookieRequest<unknown> }): string {
    console.log(ctx.req.cookies);
    return this.appService.getHello();
  }

  @Query(() => String)
  addCookie(@Context() ctx: { req: NestCookieRequest<unknown> }): string {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    ctx.req._cookies = [
      {
        name: 'cookie1',
        value: 'hasExpires',
        options: {
          maxAge: 60 * 60 * 24,
          httpOnly: true,
          expires,
        },
      },
      {
        name: 'cookie2',
        value: 'noExpires',
        options: {
          maxAge: 60 * 60 * 24,
          httpOnly: false,
        },
      },
      {
        name: 'cookie3',
        value: 'hasDomain',
        options: {
          domain: 'localhost',
        },
      },
      {
        name: 'cookie4',
        value: 'path',
        options: {
          path: '/',
        },
      },
      {
        name: 'cookie5',
        value: 'hasSameSite',
        options: {
          sameSite: 'None',
        },
      },
    ];
    return 'done';
  }
}
