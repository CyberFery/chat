import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { UserCredentials } from '../../model/user-credentials';
import { AuthenticationService } from '../../services/authentication.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  standalone: true,
  imports: [LoginFormComponent, MatCardModule],
})
export class LoginPageComponent {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  protected invalidCredentials: boolean = false;
  protected serverError: boolean = false;

  async onLogin(credentials: UserCredentials) {
    const responseCode = await this.authService.login(credentials);

    if (responseCode === 200) {
      this.router.navigate(['/chat']);
      this.invalidCredentials = false;
      this.serverError = false;
    } else if (responseCode === 403) {
      this.invalidCredentials = true;
      this.serverError = false;
    } else {
      this.invalidCredentials = false;
      this.serverError = true;
    }
  }
}
