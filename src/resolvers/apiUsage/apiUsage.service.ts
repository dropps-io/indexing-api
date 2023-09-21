import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiUsageEntity } from "./entities/apiUsage.entity";

@Injectable()
export class ApiUsageService {
  constructor(
    @InjectRepository(ApiUsageEntity)
    private readonly apiUsageRepository: Repository<ApiUsageEntity>,
  ) {}

  async create(apiUsageData: Partial<ApiUsageEntity>): Promise<ApiUsageEntity> {
    const apiUsage = this.apiUsageRepository.create(apiUsageData);
    return await this.apiUsageRepository.save(apiUsage);
  }

  async findAll(): Promise<ApiUsageEntity[]> {
    return await this.apiUsageRepository.find();
  }

  async findOne(id: string): Promise<ApiUsageEntity | null> {
    const result = await this.apiUsageRepository.findOneBy({
      id: 1,
    });
    return result || null;
  }

  async update(id: string, apiUsageData: Partial<ApiUsageEntity>): Promise<ApiUsageEntity | null> {
    const result = await this.apiUsageRepository.findOneBy({
      id: 1,
    });
    if (!result) {
      return null;
    }
    await this.apiUsageRepository.update(id, apiUsageData);
    return result;
  }

  async remove(id: string): Promise<boolean> {
    const deleteResult = await this.apiUsageRepository.delete(id);
    return deleteResult.affected! > 0;
  }
}
