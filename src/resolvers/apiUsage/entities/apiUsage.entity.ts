import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('api_usage')
export class ApiUsageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_ip: string;

  @Column()
  user_agent: string;

  @Column()
  country: string;

  @Column()
  device_id: string;

  @Column()
  request_count: number;

  @Column()
  rate_limit_quota: number;
}
