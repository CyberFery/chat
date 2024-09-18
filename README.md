## Prérequis :
- [ ] Installer Node.js depuis [nodejs.org](https://nodejs.org/).
- [ ] Installer l'outil de ligne de commande Angular avec la commande :  
  `npm install -g @angular/cli`
- [ ] Installer Visual Studio Code (VSCode) depuis [code.visualstudio.com](https://code.visualstudio.com/).
- [ ] Installer les extensions Angular Language Service et Prettier dans VSCode.
- [ ] Configurer VSCode pour utiliser Prettier automatiquement lors de la sauvegarde (facultatif).

## Base de code :
- [ ] Forker le dépôt GitLab :  
  [https://gitlab.info.uqam.ca/trepanie_fel/tp1-base](https://gitlab.info.uqam.ca/trepanie_fel/tp1-base)
- [ ] Ajouter @trepanie_fel comme contributeur.
- [ ] Ajouter vos informations dans le fichier `equipe.txt`.
- [ ] Cloner le dépôt localement.
- [ ] Aller dans le dossier `frontend`.
- [ ] Installer les dépendances du projet avec :  
  `npm install`
- [ ] Lancer l'application Angular avec :  
  `ng serve`
- [ ] Accéder à l'application via :  
  [http://localhost:4200](http://localhost:4200)

## Partie 1 - Page de connexion :
- [ ] Écrire la méthode `onLogin` du `LoginFormComponent` pour émettre un événement avec le `EventEmitter`.
- [ ] Écrire la méthode `onLogin` du `LoginPageComponent` et injecter `AuthenticationService`.
- [ ] Écrire la méthode `login` dans `AuthenticationService` pour stocker le nom d'usager dans `localStorage`.
- [ ] Écrire la méthode `logout` dans `AuthenticationService`.
- [ ] Ajouter une nouvelle route dans `app.routes.ts` pour rediriger vers `ChatPageComponent` après la connexion.
- [ ] Utiliser `Router` pour rediriger vers la page de messagerie après la connexion.

## Partie 2 - Messagerie :
- [ ] Écrire la méthode `postMessage` du `MessageService` pour ajouter et émettre les nouveaux messages.
- [ ] Connecter l'attribut `messages` de `ChatPageComponent` au signal retourné par `MessageService`.
- [ ] Écrire la méthode `onLogout` dans `ChatPageComponent` pour déconnecter l'utilisateur et rediriger vers la page de connexion.

## Partie 3 - Améliorations :
- [ ] Créer un composant pour afficher les messages en utilisant la commande Angular CLI :  
  `ng g c chat/composants/messages`
- [ ] Adapter `ChatPageComponent` pour utiliser ce composant.
- [ ] Créer un composant pour publier un nouveau message en utilisant la commande Angular CLI :  
  `ng g c chat/new-message-form`
- [ ] Adapter `ChatPageComponent` pour utiliser ce nouveau composant.
- [ ] Tester l'affichage lorsque le nombre de messages dépasse la taille du composant d'affichage.
- [ ] Faire défiler automatiquement vers le dernier message après sa publication.

## Partie 4 - Angular Material :
- [ ] Installer Angular Material dans le projet avec la commande :  
  `ng add @angular/material`
- [ ] Utiliser des `FormFields` et un `Button` Angular Material dans le formulaire de connexion.
- [ ] Utiliser un `mat-icon-button` pour le bouton d'envoi et ajuster la barre de message.
- [ ] Adapter le CSS pour rendre l'interface plus attrayante.

## Remise :
- [ ] Créer une nouvelle release sur GitLab avec le tag `tp1`.
- [ ] Si des modifications sont apportées après la release, utiliser le tag `tp1.1`.

## Pondération :
- Partie 1 : 6 pts
- Partie 2 : 3 pts
- Partie 3 : 6 pts
- Partie 4 : 2 pts
- Qualité du code : 3 pts
