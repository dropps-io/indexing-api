import { Module } from "@nestjs/common";
import { LoggerModule } from "../../logger/logger.module";
import { ClientDataDbService } from "./client-data-db.service";

@Module({
  imports: [LoggerModule],
  providers: [ClientDataDbService],
  exports: [ClientDataDbService],
})
export class ClientDataDbModule {}
