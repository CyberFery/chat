import { Injectable, Signal, signal } from '@angular/core';
import { UserCredentials } from '../model/user-credentials';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  static KEY = 'username';

  private username = signal<string | null>(null);

  constructor() {
    this.username.set(localStorage.getItem(AuthenticationService.KEY));
  }

  login(userCredentials: UserCredentials): Observable<void> {
  localStorage.setItem(AuthenticationService.KEY, userCredentials.username);
  this.username.set(userCredentials.username);
  return of();
}

  logout() {
    localStorage.removeItem(AuthenticationService.KEY);
    this.username.set(null);
  }

  getUsername(): Signal<string | null> {
    return this.username;
  }
}

