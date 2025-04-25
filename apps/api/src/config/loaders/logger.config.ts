import { registerAs } from '@nestjs/config';
import { LoggerType } from '../../global/logs/logger.provider';

const loader = () => ({
  type: process.env.LOGGER_TYPE || LoggerType.Console,

  winston: {
    level: process.env.LOGGER_WINSTON_LEVEL,
    isConsole: Boolean(process.env.LOGGER_WINSTON_TRANSPORTS_CONSOLE),
    fileName: process.env.LOGGER_WINSTON_TRANSPORTS_FILE,
  },
});

export type ConfigType = {
  logger: ReturnType<typeof loader>;
};

export default registerAs('logger', loader);
