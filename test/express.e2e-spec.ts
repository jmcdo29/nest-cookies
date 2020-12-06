import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';

const UTCRegex =
  '\\w{3},\\s\\d{2}\\s\\w{3}\\s\\d{4}\\s\\d{2}:\\d{2}:\\d{2}\\sGMT';

const cookieString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return [
    `cookie1=hasExpires; Max-Age=86400; HttpOnly; Expires=${UTCRegex};`,
    'cookie2=noExpires; Max-Age=86400; HttpOnly;',
    'cookie3=hasDomain; Domain=localhost;',
    'cookie4=path; Path=/;',
    'cookie5=hasSameSite; SameSite=None;',
  ].map(s => expect.stringMatching(s));
};

const expectedCookie = {
  cookie1: 'hasExpires',
  cookie2: 'noExpires',
  cookie3: 'hasDomain',
  cookie4: 'path',
  cookie5: 'hasSameSite',
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule.forGraphQL({
          context: ({ req, res }) => ({ req, res }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
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
    it('/add-cookie (GET)', () => {
      return request(app.getHttpServer())
        .get('/add-cookie')
        .expect(200)
        .expect('done')
        .expect(({ headers }) => {
          expect(headers['set-cookie']).toEqual(
            expect.arrayContaining(cookieString()),
          );
        });
    });

    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .set('Cookie', [
          'cookie1=hasExpires',
          'cookie2=noExpires',
          'cookie3=hasDomain',
          'cookie4=path',
          'cookie5=hasSameSite',
        ])
        .expect(200)
        .expect('Hello World!')
        .expect(() => {
          expect(restLogSpy).toBeCalledTimes(1);
          expect(restLogSpy).toBeCalledWith(expectedCookie);
        });
    });
    it('/ (GET) no cookies', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!')
        .expect(res => {
          expect(res.headers['set-cookie']).toBeFalsy();
          expect(restLogSpy).toBeCalledTimes(1);
          expect(restLogSpy).toBeCalledWith({});
        });
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
    it('addCookie', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: '{ addCookie }' })
        .expect(200)
        .expect({ data: { addCookie: 'done' } })
        .expect(({ headers }) => {
          expect(headers['set-cookie']).toEqual(
            expect.arrayContaining(cookieString()),
          );
        });
    });
    it('sayHello', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: '{ sayHello }' })
        .set('Cookie', [
          'cookie1=hasExpires',
          'cookie2=noExpires',
          'cookie3=hasDomain',
          'cookie4=path',
          'cookie5=hasSameSite',
        ])
        .expect(200)
        .expect({ data: { sayHello: 'Hello World!' } })
        .expect(() => {
          expect(gqlLogSpy).toBeCalledTimes(1);
          expect(gqlLogSpy).toBeCalledWith(expectedCookie);
        });
    });
    it('noCookie', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: '{ sayHello }' })
        .expect(200)
        .expect({ data: { sayHello: 'Hello World!' } })
        .expect(res => {
          expect(res.headers['set-cookie']).toBeFalsy();
          expect(gqlLogSpy).toBeCalledTimes(1);
          expect(gqlLogSpy).toBeCalledWith({});
        });
    });
  });
});
