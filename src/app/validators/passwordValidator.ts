import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const passwordErrorMessages = {
  passwordLength: 'La contraseña debe tener al menos 8 caracteres.',
  passwordPattern:
    'La contraseña debe contener al menos un carácter especial, una letra mayúscula, una letra minúscula y un número.',
};

export function PasswordValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password: string = control.value;

    if (!password) {
      return null;
    }

    const passwordLength = password.length > minLength;

    // Regular expressions for special character, uppercase, and lowercase letter
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /\d/;

    // Check if password meets all criteria
    const passwordPattern =
      specialCharRegex.test(password) &&
      uppercaseRegex.test(password) &&
      lowercaseRegex.test(password) &&
      numberRegex.test(password);

    return passwordLength && passwordPattern
      ? null
      : {
          passwordStrength: true,
          message: !passwordLength
            ? passwordErrorMessages.passwordLength
            : passwordErrorMessages.passwordPattern,
        };
  };
}
