- [Nest-Cookies](#nest-cookies)
  - [Installation](#installation)
  - [Using the Module](#using-the-module)
  - [CookiesInterceptor](#cookiesinterceptor)
  - [Setting Cookies](#setting-cookies)
  - [Reading Cookies](#reading-cookies)
  - [**Something to Note**](#something-to-note)

# Nest-Cookies

A module for adding cookie support for both Fastify and Express adapters for NestJS. There's a bit of magic that goes on under the hood when it comes to binding the cookie parser, but this module uses nothing except for what Nest itself provides, meaning no extra middleware, no extra functions, just plain, simple code. Depending on if the Fastify adapter is being used or the Express one, a request hook is added or a middleware is setup. This is for parsing incoming cookies from the `Cookie` header to make them available. And unlike using Nest middleware on the Fastify Adapter, by using a request hook we are able to keep the `req.cookies` on the top level regardless of the adapter. :fireworks:

**As of Nest version [7.5.3](https://github.com/nestjs/nest/commit/55d7b0e890be4a80ef3e6b9b60041915b49fecd0), `@Res()` can now take in a parameter of `{ passthrough: true }` which will allow Nest to still handle sending the response, while allows devs to use `@Res()` to get the response object so that cookies and headers can be set. This means cookie middleware that already works for Express and Fastify work for Nest in the same way. [You can read more about it on Nest's docs site.](https://docs.nestjs.com/techniques/cookies)**

## Installation

To install the package, use your package manager of choice and install `nest-cookies`

E.g.

```sh
npm i nest-cookies
yarn add nest-cookies
pnpm i nest-cookies
```

## Using the Module

To make sure that the request hook/middleware is bound, make sure to import the `CookieModule` in your root module. The earlier you import the module, the sooner the middleware runs [(after middleware defined in your root module, according to the documentation)](https://docs.nestjs.com/faq/request-lifecycle). There is also an exported interceptor for setting cookies, the `CookiesInterceptor`. This can be used as any other interceptor, and is described in more detail later in the doc.

## CookiesInterceptor

There is a base cookie interceptor that exists for the purpose of setting the response cookie. It reads these cookies from `req._cookies` which is instantiated in the middleware/request hook. If you need to read the cookie from a different context, like GraphQL, you can `extend` the `CookiesInterceptor` and override the `getRequestResponse` method

```ts
@Injectable()
export class GqlCookieInterceptor extends CookiesInterceptor {
  getRequestResponse(context: ExecutionContext) {
    const gql = GqlExecutionContext.create(context);
    return {
      req: gql.getContext().req,
      res: gql.getContext().res,
    };
  }
}
```

and now cookies will be set properly for GQL requests as well. Similarly, in resovlers you can modify the `req._cookies` property by using `@Context() ctx` and `ctx.req._cookies`.

You can also modify the interceptor's `getRequestResponse` method to use the proper `req` and `res` depending on the request type, if you have a hybrid server serving both HTTP and GQL requests.

## Setting Cookies

To set a cookie, a cookie object simply needs to be added to the `req._cookies` array. This cookie should be an object with a `name` and `value` property and with an optional `options` property with an object that has the following properties to it:

| Key      | Type                      | Description                                                                                                                             |
| -------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| expires  | Date                      | The date for the cookie to expire. If `maxAge` is also set, `maxAge` will be taken to be the proper value                               |
| maxAge   | Number                    | the maximum age in seconds the cookie should live                                                                                       |
| domain   | String                    | The host which the cookie should be sent to                                                                                             |
| path     | String                    | The path that the cookie should be sent to                                                                                              |
| secure   | Boolean                   | If the cookie should be set as Secure. If this is true, the request must be used over HTTPS                                             |
| httpOnly | Boolean                   | If the cookie should be only accessible via HTTP request. Setting this to true forbids the cookie from being read via Document.cookie   |
| sameSite | 'Strict', 'Lax' or 'None' | Asserts that a cookie must not be sent with cross-origin requests, providing some protection against cross-site request forgery attacks |

For more information about cookie options, [visit the MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie).

## Reading Cookies

Cookies that are sent to the server are populated on the `req.cookies` property, and are in the form of an object. The `req.cookies` will have keys that match the name of the sent cookies, and the values will be the values of the cookies, represented as strings.

E.g. If a request is sent with the header `Cookie: sessionid=54` then `req.cookies` will have

```ts
{
  sessionid: '54';
}
```

## **Something to Note**

Unlike the popular [cookie-parser](https://github.com/expressjs/cookie-parser), this package does not handle the signing of cookies. Generally, [if a cookie is random enough](https://security.stackexchange.com/questions/92122/why-is-it-insecure-to-store-the-session-id-in-a-cookie-directly) signing a cookie is not absolutely necessary. However, there is mention [in the cookie RFC](https://tools.ietf.org/html/rfc6265#section-8) about how to keep a session cookie secure. It is advised to follow the advice found there if security is a concern (and it should be).
