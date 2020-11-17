import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CookiesInterceptor, NestCookieRequest } from '../src';

@UseInterceptors(CookiesInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: NestCookieRequest<unknown>): string {
    console.log(req.cookies);
    return this.appService.getHello();
  }

  @Get('add-cookie')
  addCookie(@Req() req: NestCookieRequest<unknown>): string {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    req._cookies = [
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
