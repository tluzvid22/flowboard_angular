import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { singUpAuthGuard } from './sing-up-auth.guard';

describe('singUpAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => singUpAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
