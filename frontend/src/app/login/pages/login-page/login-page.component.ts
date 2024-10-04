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
    private router: Router,
  ) {}

  onLogin(credentials: UserCredentials) {
    this.authService.login(credentials);
    this.router.navigate(['/chat']);
  }
}
