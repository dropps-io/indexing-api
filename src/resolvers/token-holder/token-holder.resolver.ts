import { Args, ObjectType, Query, Resolver } from '@nestjs/graphql';

import { TokenHolderService } from './token-holder.service';
import { TokenHolderEntity } from './entities/token-holder.entity';
import { FindTokenHolderArgs } from './dto/find-token-holder.args';
import { Pagination } from '../../entities/pagination.entity';

@ObjectType()
class TokenHolderPagination extends Pagination(TokenHolderEntity) {}

@Resolver(() => TokenHolderPagination)
export class TokenHolderResolver {
  constructor(private tokenHolderService: TokenHolderService) {}

  @Query(() => TokenHolderPagination)
  async tokenHolders(@Args() args: FindTokenHolderArgs): Promise<TokenHolderPagination> {
    return this.tokenHolderService.find(args);
  }
}
