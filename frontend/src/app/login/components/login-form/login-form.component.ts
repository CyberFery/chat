import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserCredentials } from '../../model/user-credentials';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class LoginFormComponent {
  loginForm = this.fb.group({
    username: '',
    password: '',
  });

  @Output() login = new EventEmitter<UserCredentials>();

  constructor(private fb: FormBuilder) {}

  onLogin() {
  const credentials: UserCredentials = {
    username: this.loginForm.value.username ?? '', // Default to empty string if null or undefined
    password: this.loginForm.value.password ?? ''  // Default to empty string if null or undefined
   };
  this.login.emit(credentials);
  }
}

