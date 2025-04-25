import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Setting, SETTINGS_NAME } from '../../admin/entities/setting.entity';

type SettingEvents = `SETTING.${SETTINGS_NAME}.updated`;
type DBBackupEvent = 'DB.BACKUP';
type IntegrityCheckStatusEvent = 'INTEGRITY_CHECK_UPDATE';

type IntegrityCheckStatusEventPayload = {
  processed: number;
  total: number;
};

export type EventName =
  | SettingEvents
  | DBBackupEvent
  | IntegrityCheckStatusEvent;

export type EventPayload<E extends EventName> = E extends SettingEvents
  ? Setting
  : E extends DBBackupEvent
  ? boolean
  : E extends IntegrityCheckStatusEvent
  ? IntegrityCheckStatusEventPayload
  : never;

@Injectable()
export class EventEmitter extends EventEmitter2 {
  constructor(private eventEmitter: EventEmitter2) {
    super();
    return new Proxy(this, {
      get: (target, property, receiver) => {
        if (['emit', 'emitAsync'].includes(property as string)) {
          return (...args: any[]) => {
            return Reflect.get(target, property, receiver).apply(target, args);
          };
        }
        return target[property];
      },
    });
  }

  public emit<E extends EventName>(
    event: E,
    ...args: EventPayload<E>[]
  ): boolean {
    return this.eventEmitter.emit(event as string, ...args);
  }

  public emitAsync<E extends EventName>(
    event: E,
    ...values: EventPayload<E>[]
  ): Promise<any[]> {
    return this.eventEmitter.emitAsync(event, ...values);
  }
}
