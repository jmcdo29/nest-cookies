import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MercuriusDriver } from '@nestjs/mercurius';
import { AppModule } from './app.module';

const expectedCookie = {
  cookie1: 'hasExpires',
  cookie2: 'noExpires',
  cookie3: 'hasDomain',
  cookie4: 'path',
  cookie5: 'hasSameSite',
};

const cookieArray = [
  {
    name: 'cookie1',
    value: 'hasExpires',
    maxAge: 60 * 60 * 24,
    expires: expect.any(Date),
    httpOnly: true,
  },
  {
    name: 'cookie2',
    value: 'noExpires',
    httpOnly: true,
    maxAge: 60 * 60 * 24,
  },
  {
    name: 'cookie3',
    value: 'hasDomain',
    domain: 'localhost',
  },
  {
    name: 'cookie4',
    value: 'path',
    path: '/',
  },
  {
    name: 'cookie5',
    value: 'hasSameSite',
    sameSite: 'None',
  },
];

describe('AppController Fastify (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule.forGraphQL({
          driver: MercuriusDriver,
          context: (request, reply) => {
            return { req: request, res: reply };
          },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
  });
  describe('REST', () => {
    let restLogSpy: jest.SpyInstance;
    beforeEach(() => {
      restLogSpy = jest.spyOn(console, 'log');
    });
    afterEach(() => {
      restLogSpy.mockReset();
    });
    it('/add-cookie (GET)', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const res = await app.inject({
        method: 'GET',
        url: '/add-cookie',
      });
      expect(res.cookies).toEqual(cookieArray);
      expect(res.body).toBe('done');
    });

    it('/ (GET)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/',
        cookies: {
          cookie1: 'hasExpires',
          cookie2: 'noExpires',
          cookie3: 'hasDomain',
          cookie4: 'path',
          cookie5: 'hasSameSite',
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('Hello World!');
      expect(restLogSpy).toBeCalledWith(expectedCookie);
      expect(restLogSpy).toBeCalledTimes(1);
    });
    it('/ (GET) no cookies', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('Hello World!');
      expect(restLogSpy).toBeCalledWith({});
      expect(restLogSpy).toBeCalledTimes(1);
    });
  });
  describe('GQL', () => {
    let gqlLogSpy: jest.SpyInstance;
    beforeEach(() => {
      gqlLogSpy = jest.spyOn(console, 'log');
    });
    afterEach(() => {
      gqlLogSpy.mockReset();
    });
    it('addCookie', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
          query: '{ addCookie }',
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.cookies).toEqual(cookieArray);
      expect(JSON.parse(res.body)).toEqual({ data: { addCookie: 'done' } });
    });
    it('sayHello', async () => {
      const { statusCode, cookies, body } = await app.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
          query: '{ sayHello }',
        },
        cookies: {
          cookie1: 'hasExpires',
          cookie2: 'noExpires',
          cookie3: 'hasDomain',
          cookie4: 'path',
          cookie5: 'hasSameSite',
        },
      });
      expect(cookies.length).toBeFalsy();
      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toEqual({ data: { sayHello: 'Hello World!' } });
      expect(gqlLogSpy).toBeCalledWith(expectedCookie);
      expect(gqlLogSpy).toBeCalledTimes(1);
    });
    it('noCookie', async () => {
      const { statusCode, body } = await app.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
          query: '{ sayHello }',
        },
      });
      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toEqual({ data: { sayHello: 'Hello World!' } });
      expect(gqlLogSpy).toBeCalledWith({});
      expect(gqlLogSpy).toBeCalledTimes(1);
    });
  });
});
