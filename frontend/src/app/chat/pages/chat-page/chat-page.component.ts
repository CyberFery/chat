import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/login/services/authentication.service';
import { MessagesService } from '../../services/messages.service';
import { Router } from '@angular/router';
import { MessagesComponent } from '../../composants/messages/messages.component';
import { NewMessageFormComponent } from '../../composants/new-message-form/new-message-form.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
  standalone: true,
  imports: [MessagesComponent, NewMessageFormComponent, MatButtonModule],
})
export class ChatPageComponent {
  messages = this.messagesService.getMessages();
  username = this.authenticationService.getUsername();

  constructor(
    private messagesService: MessagesService,
    private authenticationService: AuthenticationService,
    private Router: Router
  ) {}

  ngOnInit() {
    if (!this.username()) {
      this.Router.navigate(['/login']);
    }
  }

  publishMessage(newMessage: string) {
    this.messagesService.postMessage({
      text: newMessage,
      username: this.username()!,
      timestamp: Date.now(),
    });
  }

  async onLogout() {
    await this.authenticationService.logout();
    this.Router.navigate(['/login']);
  }
}
