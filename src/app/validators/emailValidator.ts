import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { UsersService } from '../shared/services/flowboard/users/users.service';
import { Observable, catchError, map, of } from 'rxjs';

export function EmailAsyncValidator(service: UsersService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email: string = control.value;
    if (!email) {
      return of(null);
    }

    // Devolver una promesa que resuelva con los errores o null si no hay errores
    return service.getEmailExists(email).pipe(
      map((response: boolean) => {
        return response ? { emailExists: true } : null;
      }),
      catchError((error) => {
        console.log(error);
        return of({ emailExists: true }); // Manejar el error aquí
      })
    );
  };
}
