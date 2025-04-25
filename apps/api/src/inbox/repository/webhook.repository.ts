import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  Not,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { BaseDatabaseRepository } from '../../common/repositories/base-db.repository';
import { BaseListParams } from '../../common/repositories/list.params';
import { WebHook, WebHookStatus } from '../entities/webhook.entity';
import { Cache } from 'cache-manager';

export interface WebHookQueryParams extends BaseListParams<WebHook> {
  participantId: string;
  contractId?: string;
}

@Injectable()
export class WebHookRepository extends BaseDatabaseRepository<WebHook> {
  public constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    @InjectRepository(WebHook)
    repository: Repository<WebHook>
  ) {
    super(cache, repository);
  }

  async findContractWebHooks(
    contractId: string,
    participantId: string
  ): Promise<WebHook[]> {
    return this.repository.find({
      where: {
        contractId,
        status: WebHookStatus.ACTIVE,
        participantId: Not(participantId),
      },
    });
  }

  protected getFindOptions(
    params?: WebHookQueryParams
  ): FindManyOptions<WebHook> {
    const options = super.getFindOptions(params);
    options.where =
      options.where || ({} as FindOptionsWhere<WebHook> | ObjectLiteral);
    if (params) {
      options.where.participantId = params.participantId;
      if (params.contractId) {
        options.where.contractId = params.contractId;
      }
    }
    return options;
  }
}
