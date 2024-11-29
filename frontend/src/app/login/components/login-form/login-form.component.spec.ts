// login-form.component.spec.ts

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
        LoginFormComponent, // Composant à tester
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    testHelper = new TestHelper(fixture);
    fixture.detectChanges();
  });

  /**
   * Test de succès :
   * Vérifie que lorsque le nom d'utilisateur et le mot de passe sont saisis et que le bouton de connexion est cliqué,
   * les informations de connexion sont émises correctement.
   */
  it("devrait émettre le nom d'utilisateur et le mot de passe lorsque le formulaire est valide et que le bouton de connexion est cliqué", () => {
    let emittedCredentials: { username: string; password: string } | undefined;

    // S'abonner à l'EventEmitter pour capturer les valeurs émises.
    component.login.subscribe((credentials) => {
      emittedCredentials = credentials;
    });

    // Récupérer les éléments du formulaire.
    const usernameInput = testHelper.getInput('username-input');
    const passwordInput = testHelper.getInput('password-input');
    const loginButton = testHelper.getButton('login-button');

    // Simuler la saisie de l'utilisateur.
    testHelper.writeInInput(usernameInput, 'testuser');
    testHelper.writeInInput(passwordInput, 'testpassword');

    // Déclencher la détection des changements pour mettre à jour le formulaire.
    fixture.detectChanges();

    // Simuler le clic sur le bouton de connexion.
    loginButton.click();

    // Déclencher la détection des changements pour traiter l'événement.
    fixture.detectChanges();

    // Vérifier que les valeurs ont été émises correctement.
    expect(emittedCredentials).toEqual({
      username: 'testuser',
      password: 'testpassword',
    });

    // Vérifier que le formulaire est valide.
    expect(component.loginForm.valid).toBeTrue();
  });

  /**
   * Cas d'erreur :
   * Vérifie que lorsqu'un champ obligatoire est manquant, aucune valeur n'est émise et le message d'erreur approprié est affiché.
   */

  // 1. Nom d'utilisateur manquant
  it("ne doit pas émettre de valeur et afficher une erreur lorsque le nom d'utilisateur est manquant", () => {
    let emittedCredentials: { username: string; password: string } | undefined;

    component.login.subscribe((credentials) => {
      emittedCredentials = credentials;
    });

    const passwordInput = testHelper.getInput('password-input');
    const loginButton = testHelper.getButton('login-button');

    // Ne remplir que le champ mot de passe.
    testHelper.writeInInput(passwordInput, 'testpassword');

    fixture.detectChanges();

    // Simuler le clic sur le bouton de connexion.
    loginButton.click();

    fixture.detectChanges();

    // Vérifier que rien n'a été émis.
    expect(emittedCredentials).toBeUndefined();

    // Vérifier que le formulaire est invalide.
    expect(component.loginForm.valid).toBeFalse();

    // Vérifier que le message d'erreur pour le nom d'utilisateur est affiché.
    const usernameError = testHelper.getElement('username-error');
    expect(usernameError).toBeTruthy();
    expect(usernameError.textContent).toContain("Entrez un nom d'usager");
  });

  // 2. Mot de passe manquant
  it('ne doit pas émettre de valeur et afficher une erreur lorsque le mot de passe est manquant', () => {
    let emittedCredentials: { username: string; password: string } | undefined;

    component.login.subscribe((credentials) => {
      emittedCredentials = credentials;
    });

    const usernameInput = testHelper.getInput('username-input');
    const loginButton = testHelper.getButton('login-button');

    // Ne remplir que le champ nom d'utilisateur.
    testHelper.writeInInput(usernameInput, 'testuser');

    fixture.detectChanges();

    // Simuler le clic sur le bouton de connexion.
    loginButton.click();

    fixture.detectChanges();

    // Vérifier que rien n'a été émis.
    expect(emittedCredentials).toBeUndefined();

    // Vérifier que le formulaire est invalide.
    expect(component.loginForm.valid).toBeFalse();

    // Vérifier que le message d'erreur pour le mot de passe est affiché.
    const passwordError = testHelper.getElement('password-error');
    expect(passwordError).toBeTruthy();
    expect(passwordError.textContent).toContain('Entrez un mot de passe');
  });

  // 3. Nom d'utilisateur et mot de passe manquants
  it("ne doit pas émettre de valeur et afficher des erreurs lorsque le nom d'utilisateur et le mot de passe sont manquants", () => {
    let emittedCredentials: { username: string; password: string } | undefined;

    component.login.subscribe((credentials) => {
      emittedCredentials = credentials;
    });

    const loginButton = testHelper.getButton('login-button');

    // Ne remplir aucun champ.
    fixture.detectChanges();

    // Simuler le clic sur le bouton de connexion.
    loginButton.click();

    fixture.detectChanges();

    // Vérifier que rien n'a été émis.
    expect(emittedCredentials).toBeUndefined();

    // Vérifier que le formulaire est invalide.
    expect(component.loginForm.valid).toBeFalse();

    // Vérifier que les messages d'erreur pour le nom d'utilisateur et le mot de passe sont affichés.
    const usernameError = testHelper.getElement('username-error');
    const passwordError = testHelper.getElement('password-error');

    expect(usernameError).toBeTruthy();
    expect(usernameError.textContent).toContain("Entrez un nom d'usager");

    expect(passwordError).toBeTruthy();
    expect(passwordError.textContent).toContain('Entrez un mot de passe');
  });
});
