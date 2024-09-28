import { Injectable, Signal, signal } from '@angular/core';
import { UserCredentials } from '../model/user-credentials';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  static KEY = 'username';

  private username = signal<string | null>(null);

  constructor() {
    this.username.set(localStorage.getItem(AuthenticationService.KEY));
  }

  login(userCredentials: UserCredentials) {
    // À faire
  }

  logout() {
    localStorage.removeItem(AuthenticationService.KEY);
  }

  getUsername(): Signal<string | null> {
    return this.username;
  }
}
