import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroupDirective,
  Validators,
  FormGroup,
} from '@angular/forms';
import { UserCredentials } from '../../model/user-credentials';
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Import MatInputModule
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
  ],
})
export class LoginFormComponent {
  @ViewChild(FormGroupDirective)
  formDirective: FormGroupDirective | null = null;

  loginForm: FormGroup;

  @Output() login = new EventEmitter<UserCredentials>();

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLogin(formDirective: FormGroupDirective) {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginForm.reset();
    formDirective.resetForm();

    const credentials: UserCredentials = {
      username: this.loginForm.value.username ?? '',
      password: this.loginForm.value.password ?? '',
    };
    this.login.emit(credentials);
  }

  hasControlError(controlName: 'username' | 'password'): boolean {
    return this.showError(controlName, 'required');
  }

  private showError(field: 'username' | 'password', error: string): boolean {
    return (
      this.loginForm.controls[field].hasError(error) &&
      (this.loginForm.controls[field].dirty ||
        this.loginForm.controls[field].touched)
    );
  }
}
