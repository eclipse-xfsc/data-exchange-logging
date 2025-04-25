import { Exclude, Expose, Transform } from 'class-transformer';
import { IsString, IsUrl } from 'class-validator';

@Exclude()
export class QueryNotificationsResponseDto
  implements Readonly<QueryNotificationsResponseDto>
{
  @Expose()
  @IsUrl()
  id: string;

  @Expose()
  @IsString()
  '@context': string;

  @Expose()
  @Transform(({ value }) =>
    value.map((v) => `${process.env.SERVER_ENDPOINT}/api/inbox/${v}`)
  )
  contains: string[];
}
