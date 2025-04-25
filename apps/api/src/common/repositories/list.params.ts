export interface BaseListParams<E> {
  page?: number;
  pageSize?: number;
  orderBy?: keyof E;
  orderDirection?: 'ASC' | 'DESC';
}
