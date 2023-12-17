import { BadRequestException } from '@nestjs/common';

export const ValidatePasswordString = (password: string) => {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

  if (!password.match(regex)) {
    throw new BadRequestException(
      'Password must contain a capital letter, number, special character & be between 8 and 20 characters long.',
    );
  }

  return true;
};
