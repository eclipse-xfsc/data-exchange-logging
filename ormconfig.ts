import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import dbConfiguration from './apps/api/src/config/loaders/database.config';

ConfigModule.forRoot({
  isGlobal: true,
  load: [dbConfiguration],
});

export default new DataSource({
  ...(dbConfiguration() as PostgresConnectionOptions),
  migrations: ['apps/api/src/migrations/*.ts'],
});
