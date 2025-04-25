import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig, {
  ConfigType as DatabaseConfig,
} from './loaders/database.config';
import validationSchema from './config-validation-schema';
import loggerConfig, {
  ConfigType as LoggerConfig,
} from './loaders/logger.config';
import generalConfig, {
  ConfigType as GeneralConfig,
} from './loaders/general.config';
import redisConfig, { ConfigType as RedisConfig } from './loaders/redis.config';
import adminConfig, { ConfigType as AdminConfig } from './loaders/admin.config';
import serverConfig, {
  ConfigType as ServerConfig,
} from './loaders/server.config';
import settingsConfig, {
  ConfigType as SettingsConfig,
} from './loaders/settings.config';

export type ConfigType = DatabaseConfig &
  LoggerConfig &
  GeneralConfig &
  RedisConfig &
  AdminConfig &
  ServerConfig &
  SettingsConfig;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [
        generalConfig,
        databaseConfig,
        loggerConfig,
        redisConfig,
        adminConfig,
        serverConfig,
        settingsConfig,
      ],
    }),
  ],
})
export class AppConfigModule {}
