import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../login/services/authentication.service';

export const chatPageGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthenticationService);

  if (authService.isConnected()) {
    return true;
  } else {
    return router.parseUrl('/login');
  }
};
