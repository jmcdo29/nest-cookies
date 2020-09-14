import { Request } from 'express';
import { FastifyRequest } from 'fastify';

export interface Cookie {
  name: string;
  value: any;
  options?: {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'None' | 'Lax';
  };
}

export interface ExpressCookieRequest extends Request {
  _cookies: Cookie[];
  cookies: Record<string, string>;
}

export interface FastifyCookieRequest extends FastifyRequest {
  _cookies: Cookie[];
  cookies: Record<string, string>;
}

export type NestCookieRequest = ExpressCookieRequest | FastifyCookieRequest;
