import { Injectable } from '@nestjs/common';

import { MethodEntity } from './entities/method.entity';
import { MethodParameterEntity } from './entities/method-parameter.entity';
import { LuksoStructureDbService } from '../../libs/database/lukso-structure/lukso-structure-db.service';

@Injectable()
export class MethodService {
  constructor(private readonly structureDB: LuksoStructureDbService) {}
  async findById(id: string): Promise<MethodEntity | null> {
    return await this.structureDB.getMethodInterfaceById(id);
  }

  async findParametersById(id: string): Promise<MethodParameterEntity[]> {
    return await this.structureDB.getMethodParametersByMethodId(id);
  }
}
