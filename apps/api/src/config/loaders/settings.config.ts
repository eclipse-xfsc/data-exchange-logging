import { registerAs } from '@nestjs/config';
import { SETTINGS_NAME } from '../../admin/entities/setting.entity';

const loader = () => ({
  ...Object.values(SETTINGS_NAME).reduce<Record<string, string>>(
    (accum, name) => ({ ...accum, [name]: process.env[name] }),
    {}
  ),
});

export type ConfigType = {
  settings: ReturnType<typeof loader>;
};

export default registerAs('settings', loader);
