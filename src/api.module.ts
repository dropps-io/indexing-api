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

@Module({
  imports: [
    AddressModule,
    MethodModule,
    WrappedTxModule,
    ContractTokenModule,
    TokenHolderModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      driver: ApolloDriver,
      playground: true,
      introspection: true,
    }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class ApiModule {}
