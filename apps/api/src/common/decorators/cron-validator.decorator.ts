import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { isValidCron } from 'cron-validator';

export function IsCronExpression(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsCronExpression',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message:
          validationOptions && validationOptions.message
            ? validationOptions.message
            : `${propertyName} is not a valid cron expression.`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          return isValidCron(value, { seconds: true, allowBlankDay: true });
        },
      },
    });
  };
}
