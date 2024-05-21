import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieServiceService } from 'src/app/shared/services/cookieservice/cookieservice.service';

export const tokenCookiesAuthGuard: CanActivateFn = async (route, state) => {
  const router: Router = inject(Router);
  const service: CookieServiceService = inject(CookieServiceService);
  const url = state.url;
  const idParam: string | null = route.paramMap.get('id');

  try {
    const response = await service.compareTokens().toPromise();

    if (response !== undefined && response.canLogin) {
      if (url.includes('dashboard') && idParam === response.userId.toString()) {
        return true;
      } else {
        return router.navigate([`/dashboard/${response.userId}`]);
      }
    } else {
      if (url.includes('login')) {
        return true;
      } else {
        return router.navigate(['/login']);
      }
    }
  } catch (error) {
    if (url.includes('login')) {
      return true;
    } else {
      return router.navigate(['/login']);
    }
  }
};
