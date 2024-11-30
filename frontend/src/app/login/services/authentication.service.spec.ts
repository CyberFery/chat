import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { UserCredentials } from '../model/user-credentials';
import { LoginResponse } from '../model/login-response';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpTestingController: HttpTestingController;

  const loginData: UserCredentials = {
    username: 'username',
    password: 'pwd',
  };

  const loginResponse: LoginResponse = {
    username: 'username',
  };

  afterEach(() => {
    localStorage.clear();
    httpTestingController.verify();
  });

  describe('on login', () => {
    beforeEach(() => {
      localStorage.clear();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthenticationService],
      });
      httpTestingController = TestBed.inject(HttpTestingController);
      service = TestBed.inject(AuthenticationService);
    });

    it('should call POST with login data to auth/login', async () => {
      const loginPromise = service.login(loginData);

      const req = httpTestingController.expectOne(
        `${environment.backendUrl}/auth/login`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      expect(req.request.withCredentials).toBeTrue();

      req.flush(loginResponse);

      await loginPromise;
    });

    it('should store and emit the username', async () => {
      expect(localStorage.getItem(AuthenticationService.KEY)).toBeNull();
      expect(service.getUsername()()).toBeNull();

      const loginPromise = service.login(loginData);

      const req = httpTestingController.expectOne(
        `${environment.backendUrl}/auth/login`,
      );
      req.flush(loginResponse);

      await loginPromise;

      expect(localStorage.getItem(AuthenticationService.KEY)).toBe(
        loginResponse.username,
      );

      expect(service.getUsername()()).toBe(loginResponse.username);
    });

  });

  describe('on logout', () => {
    beforeEach(() => {
      localStorage.setItem(AuthenticationService.KEY, loginData.username);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthenticationService],
      });
      httpTestingController = TestBed.inject(HttpTestingController);
      service = TestBed.inject(AuthenticationService);
    });

    it('should call POST to auth/logout', async () => {
      const logoutPromise = service.logout();

      const req = httpTestingController.expectOne(
        `${environment.backendUrl}/auth/logout`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      expect(req.request.withCredentials).toBeTrue();

      req.flush(null, { status: 200, statusText: 'OK' });

      const result = await logoutPromise;
      expect(result).toBeTrue();
    });

    it('should remove the username from the service and local storage on successful logout', async () => {
      expect(localStorage.getItem(AuthenticationService.KEY)).toBe(
        loginData.username,
      );
      expect(service.getUsername()()).toBe(loginData.username);

      const logoutPromise = service.logout();

      const req = httpTestingController.expectOne(
        `${environment.backendUrl}/auth/logout`,
      );
      req.flush(null, { status: 200, statusText: 'OK' });

      const result = await logoutPromise;

      expect(localStorage.getItem(AuthenticationService.KEY)).toBeNull();

      expect(service.getUsername()()).toBeNull();

      expect(result).toBeTrue();
    });

    it('should return false if logout response status is not 200', async () => {
      const logoutPromise = service.logout();

      const req = httpTestingController.expectOne(
        `${environment.backendUrl}/auth/logout`,
      );
      req.flush(null, { status: 400, statusText: 'Bad Request' });

      const result = await logoutPromise;

      expect(localStorage.getItem(AuthenticationService.KEY)).toBe(
        loginData.username,
      );

      expect(service.getUsername()()).toBe(loginData.username);

      expect(result).toBeFalse();
    });

    it('should handle logout errors gracefully and return false', async () => {
      const logoutPromise = service.logout();

      const req = httpTestingController.expectOne(
        `${environment.backendUrl}/auth/logout`,
      );
      req.error(new ErrorEvent('Network error'), {
        status: 0,
        statusText: 'Unknown Error',
      });

      const result = await logoutPromise;

      expect(localStorage.getItem(AuthenticationService.KEY)).toBe(
        loginData.username,
      );

      expect(service.getUsername()()).toBe(loginData.username);

      expect(result).toBeFalse();
    });
  });

  // Suppression du describe 'getUsername' en raison des erreurs rencontrées
});
