import { ObjectType, Field, ID } from '@nestjs/graphql';

import { MethodParameterEntity } from './method-parameter.entity';

@ObjectType()
export class MethodEntity {
  @Field(() => ID, {
    description: 'The method id (first 8 bytes of the hash)',
  })
  id: string;

  @Field(() => String, {
    description: 'The hash of the method.',
  })
  hash: string;

  @Field(() => String, {
    description: 'The name of the method.',
  })
  name: string;

  @Field(() => String, {
    description: 'The type of the method.',
  })
  type: 'event' | 'function';

  @Field(() => [MethodParameterEntity], {
    nullable: 'items',
    description: 'An array of parameters associated with the method.',
  })
  parameters?: MethodParameterEntity[];
}
