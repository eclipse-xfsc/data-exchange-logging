import { registerAs } from '@nestjs/config';

const load = () => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),

  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
});

export type ConfigType = {
  database: ReturnType<typeof load>;
};

export default registerAs('database', load);
