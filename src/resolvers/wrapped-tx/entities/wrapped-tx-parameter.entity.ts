import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class WrappedTxParameterEntity {
  @Field(() => String, {
    description: 'The value of the parameter.',
  })
  value: string;

  @Field(() => String, {
    description: 'The name of the parameter.',
  })
  name: string;

  @Field(() => String, {
    description: 'The type of the parameter.',
  })
  type: string;

  @Field(() => String, {
    description: 'The position of the parameter in the method signature.',
  })
  position: number;
}
