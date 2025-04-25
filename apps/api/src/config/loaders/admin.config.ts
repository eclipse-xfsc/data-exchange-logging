import { registerAs } from '@nestjs/config';

const loader = () => ({
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,

  auth: {
    secret: process.env.ADMIN_JWT_SECRET_KEY,
    expiresIn: Number(process.env.ADMIN_JWT_EXPIRES_IN_MINUTES) * 60,
  },

  backupLocation: process.env.BACKUP_LOCATION,
  backupCron: process.env.BACKUP_CRON,
});

export type ConfigType = {
  admin: ReturnType<typeof loader>;
};

export default registerAs('admin', loader);
