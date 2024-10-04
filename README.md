## Prérequis :
- [x] Installer Node.js depuis [nodejs.org](https://nodejs.org/).
- [x] Installer l'outil de ligne de commande Angular avec la commande :  
  `npm install -g @angular/cli`
- [x] Installer Visual Studio Code (VSCode) depuis [code.visualstudio.com](https://code.visualstudio.com/).
- [x] Installer les extensions Angular Language Service et Prettier dans VSCode.
- [x] Configurer VSCode pour utiliser Prettier automatiquement lors de la sauvegarde (facultatif).

## Base de code :
- [x] Forker le dépôt GitLab :  
  [https://gitlab.info.uqam.ca/trepanie_fel/tp1-base](https://gitlab.info.uqam.ca/trepanie_fel/tp1-base)
- [x] Ajouter @trepanie_fel comme contributeur.
- [x] Ajouter vos informations dans le fichier `equipe.txt`.
- [x] Cloner le dépôt localement.
- [x] Aller dans le dossier `frontend`.
- [x] Installer les dépendances du projet avec :  
  `npm install`
- [x] Lancer l'application Angular avec :  
  `ng serve`
- [x] Accéder à l'application via :  
  [http://localhost:4200](http://localhost:4200)

## Partie 1 - Page de connexion :
- [x] Écrire la méthode `onLogin` du `LoginFormComponent` pour émettre un événement avec le `EventEmitter`.
- [x] Écrire la méthode `onLogin` du `LoginPageComponent` et injecter `AuthenticationService`.
- [x] Écrire la méthode `login` dans `AuthenticationService` pour stocker le nom d'usager dans `localStorage`.
- [x] Écrire la méthode `logout` dans `AuthenticationService`.
- [x] Ajouter une nouvelle route dans `app.routes.ts` pour rediriger vers `ChatPageComponent` après la connexion.
- [x] Utiliser `Router` pour rediriger vers la page de messagerie après la connexion.

## Partie 2 - Messagerie :
- [x] Écrire la méthode `postMessage` du `MessageService` pour ajouter et émettre les nouveaux messages.
- [x] Connecter l'attribut `messages` de `ChatPageComponent` au signal retourné par `MessageService`.
- [x] Écrire la méthode `onLogout` dans `ChatPageComponent` pour déconnecter l'utilisateur et rediriger vers la page de connexion.

## Partie 3 - Améliorations :
- [x] Créer un composant pour afficher les messages en utilisant la commande Angular CLI :  
  `ng g c chat/composants/messages`
- [x] Adapter `ChatPageComponent` pour utiliser ce composant.
- [x] Créer un composant pour publier un nouveau message en utilisant la commande Angular CLI :  
  `ng g c chat/new-message-form`
- [x] Adapter `ChatPageComponent` pour utiliser ce nouveau composant.
- [x] Tester l'affichage lorsque le nombre de messages dépasse la taille du composant d'affichage.
- [x] Faire défiler automatiquement vers le dernier message après sa publication.

## Partie 4 - Angular Material :
- [x] Installer Angular Material dans le projet avec la commande :  
  `ng add @angular/material`
- [x] Utiliser des `FormFields` et un `Button` Angular Material dans le formulaire de connexion.
- [x] Utiliser un `mat-icon-button` pour le bouton d'envoi et ajuster la barre de message.
- [x] Adapter le CSS pour rendre l'interface plus attrayante.

## Remise :
- [ ] Créer une nouvelle release sur GitLab avec le tag `tp1`.
- [ ] Si des modifications sont apportées après la release, utiliser le tag `tp1.1`.

## Pondération :
- Partie 1 : 6 pts
- Partie 2 : 3 pts
- Partie 3 : 6 pts
- Partie 4 : 2 pts
- Qualité du code : 3 pts
