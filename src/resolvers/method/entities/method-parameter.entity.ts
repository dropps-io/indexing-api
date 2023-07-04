import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class MethodParameterEntity {
  @Field(() => String, {
    description: 'The name of the method parameter',
  })
  name: string;

  @Field(() => String, {
    description: 'The type of the method parameter',
  })
  type: string;

  @Field(() => Boolean, {
    description:
      'Whether the method parameter is indexed or not (apply only for parameters of method type event)',
  })
  indexed: boolean;

  @Field(() => Number, {
    description:
      'Position of the parameter in the method signature (e.g. in someMethod(uint param1,uint param2), param2 has position 2)',
  })
  position: number;
}
