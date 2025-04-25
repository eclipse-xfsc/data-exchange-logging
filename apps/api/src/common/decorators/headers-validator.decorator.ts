import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsHeadersObject(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsHeadersObject',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message:
          validationOptions && validationOptions.message
            ? validationOptions.message
            : `${propertyName} is not a valid header object.`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          return Object.entries(value).every(([key, val]) => {
            return (
              typeof key === 'string' &&
              ['string', 'number', 'boolean'].includes(typeof val)
            );
          });
        },
      },
    });
  };
}
