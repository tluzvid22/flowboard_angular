import { CanActivateFn, Router } from '@angular/router';
import { SignupComponent } from '../components/user-identification/signup/signup.component';
import { inject } from '@angular/core';

export const singUpAuthGuard: CanActivateFn = (route, state) => {
  const id = route.paramMap.get('id');
  const router: Router = inject(Router);

  if (id === null) {
    return router.navigate(['/signup/step/1']);
  }
  if (SignupComponent.formStep < +id) {
    return router.navigate([`/signup/step/${SignupComponent.formStep}`]);
  } else {
    SignupComponent.formStep = +id;
    return true;
  }
};
