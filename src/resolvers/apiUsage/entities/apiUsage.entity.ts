import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApiUsageEntity {
  @Field(() => ID, {
    nullable: false,
    description:
      'A unique identifier for each ip that makes a request (assuming a serial primary key)',
  })
  id: string;

  @Field(() => Number, {nullable: false,
    description: 'Stores the client IP address'
  })
    client_ip: number;

    @Field(() => String, {nullable: true,
        description: 'Field to store the country name or code'
    })
    country: string;

    @Field(() => String, {nullable: true,
        description: 'Field to store the User-Agent header'
    })
    user_agent: string;

    @Field(() => String, {nullable: true,
        description: 'Field for storing the device identifier.'
    })
    device_id: string;

    @Field(() => Number, {nullable: false,
        description: 'Field to store the number of requests made by the client'
    })
    request_count: number;

    @Field(() => Number, {nullable: false,
        description: ' Field to store the remaining rate limit quota for the client'
    })
    rate_limit_quota: number;
}
