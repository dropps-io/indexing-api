import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Field, InputType, ObjectType } from "@nestjs/graphql";

@InputType()
@Entity()
export class ApiUsageEntity {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Field(type => String)
  @Column()
  client_ip: string;

  @Field(type => String)
  @Column()
  user_agent: string;

  @Field(type => String)
  @Column()
  country: string;

  @Field(type => String)
  @Column()
  device_id: string;

  @Field(type => Number)
  @Column()
  request_count: number;

  @Field(type => Number)
  @Column()
  rate_limit_quota: number;
}
