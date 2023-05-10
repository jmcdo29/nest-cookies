import { DynamicModule, Module } from '@nestjs/common';
import { GqlModuleOptions, GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { CookieModule } from '../src';

@Module({
  imports: [CookieModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static forGraphQL(options: GqlModuleOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        GraphQLModule.forRoot({
          autoSchemaFile: true,
          ...options,
        }),
      ],
      providers: [AppResolver],
    };
  }
}
