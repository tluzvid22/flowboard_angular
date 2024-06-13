import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieServiceService } from 'src/app/shared/services/cookieservice/cookieservice.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { User } from 'src/app/shared/types/user';

export const tokenCookiesAuthGuard: CanActivateFn = async (route, state) => {
  const router: Router = inject(Router);
  const userService = inject(UserDataService);
  const service: CookieServiceService = inject(CookieServiceService);
  const url = state.url;
  const idParam: string | null = route.paramMap.get('id');

  try {
    const response = await service.compareTokens();

    if (response !== undefined && response.canLogin) {
      if (
        url.includes('dashboard') &&
        idParam === response.user?.id?.toString()
      ) {
        userService.setUser(response.user!);
        return true;
      } else {
        return router.navigate([`/dashboard/${response.user?.id}`]);
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
