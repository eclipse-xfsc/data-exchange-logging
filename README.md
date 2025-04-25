## Open Items:

- AbstractCAMAdapter needs to be implemented

```
/**
*  The GX-DELS MUST provide a mechanism to enforce the integrity of the overall Log Entry storage. The GX-DELS MUST provide a possibility to verify the integrity in regular intervals by the GX-CAM (see above in GX-DLES.IR.010).
*/
reportCorruptedLog(notification: InboxNotification): Promise<void>;
```

## Installation

```bash
$ npm config set @gaia-x:registry https://gitlab.com/api/v4/projects/38989724/packages/npm/
$ npm install
```

## Formatting

```bash
# Setting the hooksPath will run the pre-commit hook in order to standardize the formatted output
$ git config core.hooksPath .github/hooks
```

## Running the app

#### Environment variables - example ./.env.example

```
# general
NODE_ENV=development # development/production
NX_API_ENDPOINT=/api # api server endpoint

# server
SERVER_ENDPOINT=http://localhost:3000 # endpoint for current application
SERVER_THROTLLER_TTL=60
SERVER_THROTLLER_LIMIT=10

#logger
## types "console"/"winston"
LOGGER_TYPE=console
# winston config
LOGGER_WINSTON_LEVEL=info
LOGGER_WINSTON_TRANSPORTS_CONSOLE=true
LOGGER_WINSTON_TRANSPORTS_FILE=logs/app.log
# cache
## types "memory"/"redis"
CACHE_TYPE=redis
CACHE_TTL=300

# db
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=mysecretpassword
DATABASE_DATABASE=dels

## redis config
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PREFIX=cache

# admin config
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
ADMIN_JWT_SECRET_KEY=dafgsdfgsdfgasdfasdf
ADMIN_JWT_EXPIRES_IN_MINUTES=120
BACKUP_LOCATION=/tmp/backups
BACKUP_CRON=*/1 * * * *

# admin settings - used to seed default settings
SETTING_LOG_RETENTION_PERIOD_DAYS=30
SETTING_LOG_PRUNING_CRON=*/1 * * * *
SETTING_LOG_INTEGRITY_CRON=*/1 * * * *

# gateways
TRUST_SERVICE_GATEWAY_HOST=https://trust-service.com
CAM_GATEWAY_HOST=http://example.com
DCT_GATEWAY_HOST=http://dct-service.com
```

#### Config variables - example ./apps/api/.env.example

NOTE: `"./apps/api/.env"` - overrides `"./.env"`

Required

- ADMIN_USERNAME - username used to sign into Administrative UI
- ADMIN_PASSWORD - password used to sign into Administrative UI
- ADMIN_JWT_SECRET_KEY - secret key used to generate JWT token

Optional

- SERVER_THROTLLER_TTL - number
- SERVER_THROTLLER_LIMIT - number

- ADMIN_JWT_EXPIRES_IN_MINUTES - number
- LOGGER_TYPE - "console"/"winston"
- LOGGER_WINSTON_LEVEL
- LOGGER_WINSTON_TRANSPORTS_CONSOLE - boolean
- LOGGER_WINSTON_TRANSPORTS_FILE - file path
- CACHE_TYPE - "memory"/"redis"
- CACHE_TTL - number
- SETTING_LOG_RETENTION_PERIOD_DAYS - number
- SETTING_LOG_PRUNING_CRON
- SETTING_LOG_INTEGRITY_CRON

```bash
# development (watch mode)
$ npm run start:dev

# production mode
$ npm run start
```

## Pre Deploy

```bash
$ npm run typeorm:migrations:generate ${migration_name}
$ npm run typeorm:migrations:run
```

## DB Migrations

##### Revert

```bash
$ npm run typeorm:migrations:revert
```

##### Create new empty migration

```bash
$ npm run typeorm:migrations:create ./apps/api/src/migrations/${migration_name}
```

## Swagger path (OpenApi spec):

- `/swagger`

## Docker

Minimum envrionment config `"./.env.example"`, rename it to `".env"`

```bash
$ docker-compose up
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
