import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { HealthController } from './health.controller';
import { WrappedTxModule } from './resolvers/wrapped-tx/wrapped-tx.module';
import { MethodModule } from './resolvers/method/method.module';
import { TokenHolderModule } from './resolvers/token-holder/token-holder.module';
import { AddressModule } from './resolvers/address/address.module';
import { ContractTokenModule } from './resolvers/contract-token/contract-token.module';
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { GqlThrottlerGuard } from "./guards/gqlThrottlerGuard.guard";

@Module({
  imports: [
    AddressModule,
    MethodModule,
    WrappedTxModule,
    ContractTokenModule,
    TokenHolderModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      context: ({ req, res }) => ({ req, res }),
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      driver: ApolloDriver,
      playground: true,
      introspection: true,
    }),
    ThrottlerModule.forRoot([{
      ttl:3600000, //1 hour
      limit: 100,
    }]),
  ],
  controllers: [HealthController],
  providers: [{
    provide: APP_GUARD,
    useClass: GqlThrottlerGuard,
  }],
})
export class ApiModule {}
