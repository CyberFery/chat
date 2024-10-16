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

  async logout() {
    let currUsername = localStorage.getItem(AuthenticationService.KEY);

    let response: HttpResponse<any> = await firstValueFrom(
      this.httpClient.post<any>(`${environment.backendUrl}/auth/logout`, {
        withCredentials: true,
        observe: 'response',
      })
    );

    if (response.status === 200) {
      localStorage.removeItem(AuthenticationService.KEY);
      this.username.set(null);
    } else {
      throw new Error('Failed to logout');
    }
  }

  getUsername(): Signal<string | null> {
    return this.username;
  }
}
