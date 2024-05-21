import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { tokenCookiesAuthGuard } from './tokenCookiesAuthGuard';

describe('singUpAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      tokenCookiesAuthGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
