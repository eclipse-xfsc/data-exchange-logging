import {
  Exclude,
  Expose,
  Transform,
  TransformFnParams,
} from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class InboxNotificationResponseDto
  implements Readonly<InboxNotificationResponseDto>
{
  @Transform(({ value }) => `${process.env.SERVER_ENDPOINT}/api/inbox/${value}`)
  @IsString()
  @Expose()
  id: string;

  @IsString()
  @Expose()
  description: string;

  @IsString()
  @Expose()
  contract: string;

  @IsString()
  @Expose()
  receiver: string;

  @IsString()
  @Expose()
  sender: string;

  @Expose()
  @Transform(({ value, obj }: TransformFnParams) => {
    return value ?? JSON.parse(obj.verifiableCrendetial)['@context'];
  })
  '@context': any;
}
