import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class PaginatorQueryDto {
  @IsNumber()
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 25;

  @IsOptional()
  orderBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';

  @IsOptional()
  searchTerm?: string;
}
