import { Injectable, Signal, signal } from '@angular/core';
import { UserCredentials } from '../model/user-credentials';
import { of, Observable, firstValueFrom } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../model/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  static KEY = 'username';

  private username = signal<string | null>(null);

  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;

    this.username.set(localStorage.getItem(AuthenticationService.KEY));
  }

  async login(userCredentials: UserCredentials): Promise<number> {
    try {
      const response: HttpResponse<LoginResponse> = await firstValueFrom(
        this.httpClient.post<LoginResponse>(
          `${environment.backendUrl}/auth/login`,
          userCredentials,
          { observe: 'response', withCredentials: true }
        )
      );

      if (response.status === 200 && response.body) {
        localStorage.setItem(AuthenticationService.KEY, response.body.username);
        this.username.set(response.body.username);
      }

      return response.status;
    } catch (error) {
      // Si autre erreur du côté du serveur
      if (error instanceof HttpErrorResponse) {
        return error.status;
      } else {
        return 500;
      }
    }
  }

  async logout(): Promise<boolean> {
    try {
      let response: HttpResponse<void> = await firstValueFrom(
        this.httpClient.post<void>(
          `${environment.backendUrl}/auth/logout`,
          {},
          {
            observe: 'response',
            withCredentials: true,
          }
        )
      );

      if (response.status === 200) {
        localStorage.removeItem(AuthenticationService.KEY);
        this.username.set(null);
        console.log('Logged out.');

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Failed to logout:', error);

      return false;
    }
  }

  getUsername(): Signal<string | null> {
    return this.username;
  }

  isConnected(): boolean {
    return localStorage.getItem(AuthenticationService.KEY) !== null;
  }
}
