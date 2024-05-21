import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { UsersService } from '../shared/services/flowboard/users/users.service';
import { Observable, catchError, map, of } from 'rxjs';

export function UsernameAsyncValidator(
  service: UsersService
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const username: string = control.value;
    if (!username) {
      return of(null);
    }

    // Devolver una promesa que resuelva con los errores o null si no hay errores
    return service.getUsernameExists(username).pipe(
      map((response: boolean) => {
        return response ? { usernameExists: true } : null;
      }),
      catchError((error) => {
        console.log(error);
        return of({ usernameExists: true }); // Manejar el error aquí
      })
    );
  };
}
