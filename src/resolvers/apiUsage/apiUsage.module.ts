import { Module } from "@nestjs/common";
import { LoggerModule } from "../../libs/logger/logger.module";
import { ApiUsageResolver } from "./apiUsage.resolver";
import { ApiUsageService } from "./apiUsage.service";
import { ClientDataDbModule } from "../../libs/database/client-data/client-data-db.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiUsageEntity } from "./entities/apiUsage.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ApiUsageEntity])],
  providers: [ApiUsageResolver, ApiUsageService],
  exports: [ApiUsageResolver],
})
export class ApiUsageModule {}
