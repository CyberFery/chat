
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TestHelper } from 'src/TestHelper';

import { LoginFormComponent } from './login-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let testHelper: TestHelper<LoginFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NoopAnimationsModule,
        CommonModule,
        LoginFormComponent, 
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    testHelper = new TestHelper(fixture);
    fixture.detectChanges();
  });


  it("devrait émettre le nom d'utilisateur et le mot de passe lorsque le formulaire est valide et que le bouton de connexion est cliqué", () => {
    let emittedCredentials: { username: string; password: string } | undefined;

    component.login.subscribe((credentials) => {
      emittedCredentials = credentials;
    });

    const usernameInput = testHelper.getInput('username-input');
    const passwordInput = testHelper.getInput('password-input');
    const loginButton = testHelper.getButton('login-button');

    testHelper.writeInInput(usernameInput, 'testuser');
    testHelper.writeInInput(passwordInput, 'testpassword');

    fixture.detectChanges();

    loginButton.click();

    fixture.detectChanges();

    expect(emittedCredentials).toEqual({
      username: 'testuser',
      password: 'testpassword',
    });

    expect(component.loginForm.valid).toBeTrue();
  });



  it("ne doit pas émettre de valeur et afficher une erreur lorsque le nom d'utilisateur est manquant", () => {
    let emittedCredentials: { username: string; password: string } | undefined;

    component.login.subscribe((credentials) => {
      emittedCredentials = credentials;
    });

    const passwordInput = testHelper.getInput('password-input');
    const loginButton = testHelper.getButton('login-button');

    testHelper.writeInInput(passwordInput, 'testpassword');

    fixture.detectChanges();

    loginButton.click();

    fixture.detectChanges();

    expect(emittedCredentials).toBeUndefined();

    expect(component.loginForm.valid).toBeFalse();

    const usernameError = testHelper.getElement('username-error');
    expect(usernameError).toBeTruthy();
    expect(usernameError.textContent).toContain("Entrez un nom d'usager");
  });

  it('ne doit pas émettre de valeur et afficher une erreur lorsque le mot de passe est manquant', () => {
    let emittedCredentials: { username: string; password: string } | undefined;

    component.login.subscribe((credentials) => {
      emittedCredentials = credentials;
    });

    const usernameInput = testHelper.getInput('username-input');
    const loginButton = testHelper.getButton('login-button');

    testHelper.writeInInput(usernameInput, 'testuser');

    fixture.detectChanges();

    loginButton.click();

    fixture.detectChanges();

    expect(emittedCredentials).toBeUndefined();

    expect(component.loginForm.valid).toBeFalse();

    fixture.detectChanges();

    const passwordError = testHelper.getElement('password-error');
    expect(passwordError).toBeTruthy();
    expect(passwordError.textContent).toContain('Entrez un mot de passe');
  });

  it("ne doit pas émettre de valeur et afficher des erreurs lorsque le nom d'utilisateur et le mot de passe sont manquants", () => {
    let emittedCredentials: { username: string; password: string } | undefined;

    component.login.subscribe((credentials) => {
      emittedCredentials = credentials;
    });

    const loginButton = testHelper.getButton('login-button');

    fixture.detectChanges();

    loginButton.click();

    fixture.detectChanges();

    expect(emittedCredentials).toBeUndefined();

    expect(component.loginForm.valid).toBeFalse();

    const usernameError = testHelper.getElement('username-error');
    const passwordError = testHelper.getElement('password-error');

    expect(usernameError).toBeTruthy();
    expect(usernameError.textContent).toContain("Entrez un nom d'usager");

    expect(passwordError).toBeTruthy();
    expect(passwordError.textContent).toContain('Entrez un mot de passe');
  });
});
