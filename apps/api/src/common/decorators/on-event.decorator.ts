import { OnEvent as InternalOnEvent } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';
import { EventName, EventPayload } from '../../global/events/event-emitter';

type EventListener<E extends EventName> = (...args: EventPayload<E>[]) => any;
type EventListenerMethodDecorator<E extends EventName> = (
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<EventListener<E>>
) => TypedPropertyDescriptor<EventListener<E>> | void;

export function OnEvent<E extends EventName>(
  eventName: E,
  options?: OnEventOptions | undefined
): EventListenerMethodDecorator<E> {
  return InternalOnEvent(eventName, options);
}
