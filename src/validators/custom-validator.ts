import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'CustomIsInArray', async: false })
export class CustomIsInArray implements ValidatorConstraintInterface {
  validate(correctAnswer: string, args: ValidationArguments) {
    const [optionsField] = args.constraints;
    const options = (args.object as any)[optionsField];
    return Array.isArray(options) && options.includes(correctAnswer);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Correct answer must be one of the options';
  }
}
