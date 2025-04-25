import { Cache } from 'cache-manager';
import {
  DeepPartial,
  FindManyOptions,
  Repository,
  FindOptionsOrderValue,
} from 'typeorm';
import { BaseEntity } from '../model/base.entity';
import { BaseListParams } from './list.params';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT: FindOptionsOrderValue = 'DESC';

export class BaseDatabaseRepository<T extends BaseEntity> {
  public constructor(
    protected cache: Cache,
    protected repository: Repository<T>
  ) {}

  public getEntity(id: string) {
    return this.rememberValue(id, () =>
      this.repository.findOneOrFail({ where: { id: id } } as FindManyOptions<T>)
    );
  }

  public list(options?: FindManyOptions) {
    return options ? this.repository.find(options) : this.repository.find();
  }

  public async save(entity: DeepPartial<T>): Promise<T> {
    const [result] = await Promise.all([
      this.repository.save(entity),
      this.forgetCache(entity.id),
    ]);
    return result;
  }

  public async delete(id: string) {
    const [result] = await Promise.all([
      this.repository.delete(id),
      this.forgetCache(id),
    ]);
    return result;
  }

  public async paginate<P extends BaseListParams<T>>(params?: P) {
    const options = this.getFindOptions(params);
    const [items, count] = await this.repository.findAndCount(options);
    return {
      items,
      count,
    };
  }

  protected async rememberValue(
    key: string,
    fetch: () => Promise<T>
  ): Promise<T> {
    key = this.makeCacheKey(key);
    const entity = (await this.cache.get<T>(key)) || (await fetch());
    entity && (await this.cache.set(key, this.prepareCacheData(entity)));
    return entity;
  }

  protected forgetCache(key): Promise<boolean> {
    return this.cache.del(this.makeCacheKey(key));
  }

  protected makeCacheKey(name) {
    return `${this.constructor.name}:${name}`;
  }

  protected prepareCacheData(data): any {
    return data;
  }

  protected getFindOptions(
    params?: BaseListParams<T>
  ): FindManyOptions<T> | undefined {
    if (!params) {
      return undefined;
    }

    const options: FindManyOptions<T> = {};

    if (params.page) {
      options.skip = (params.page - 1) * (params.pageSize ?? DEFAULT_PAGE_SIZE);
    }
    if (params.pageSize) {
      options.take = params.pageSize;
    }
    options.order = {};
    const field = (params.orderBy ?? 'createdAt') as keyof T;
    options.order[field] = (params.orderDirection as any) ?? DEFAULT_SORT;
    return options;
  }
}
