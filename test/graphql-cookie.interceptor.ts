import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response } from 'express';
import { FastifyReply } from 'fastify';
import { CookiesInterceptor, NestCookieRequest } from '../src';

@Injectable()
export class GqlCookieInterceptor extends CookiesInterceptor {
  getRequestResponse(
    context: ExecutionContext,
  ): { req: NestCookieRequest<unknown>; res: Response | FastifyReply } {
    const gqlCtx = GqlExecutionContext.create(context);
    return gqlCtx.getContext();
  }
}
