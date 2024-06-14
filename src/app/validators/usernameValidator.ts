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

    return service.getUsernameExists(username).pipe(
      map((response: boolean) => {
        return response ? { usernameExists: true } : null;
      }),
      catchError((error) => {
        console.log(error);
        return of({ usernameExists: true });
      })
    );
  };
}
