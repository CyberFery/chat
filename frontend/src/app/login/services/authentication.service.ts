import { Injectable, Signal, signal } from '@angular/core';
import { UserCredentials } from '../model/user-credentials';
import { of, Observable, firstValueFrom } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
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

  async login(userCredentials: UserCredentials): Promise<Observable<void>> {
    let response: LoginResponse = await firstValueFrom(
      this.httpClient.post<LoginResponse>(
        `${environment.backendUrl}/auth/login`,
        userCredentials,
        { withCredentials: true }
      )
    );

    localStorage.setItem(AuthenticationService.KEY, response.username);
    this.username.set(response.username);

    return of();
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
}
