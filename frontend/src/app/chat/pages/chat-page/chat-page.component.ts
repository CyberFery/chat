import { Component, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/login/services/authentication.service';
import { MessagesService } from '../../services/messages.service';
import { WebSocketService } from '../../services/websocket.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessagesComponent } from '../../composants/messages/messages.component';
import { NewMessageFormComponent } from '../../composants/new-message-form/new-message-form.component';
import { MatButtonModule } from '@angular/material/button';
import { NewMessageRequest } from '../../model/message.model';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
  standalone: true,
  imports: [MessagesComponent, NewMessageFormComponent, MatButtonModule],
})
export class ChatPageComponent implements OnDestroy {
  messages = this.messagesService.getMessages();
  username = this.authenticationService.getUsername();
  private wsSubscription: Subscription | null = null;

  constructor(
    private messagesService: MessagesService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    if (!this.username()) {
      this.router.navigate(['/login']);
    } else {
      this.messagesService.fetchMessages();
      this.connectWebSocket();
    }
  }

  ngOnDestroy() {
    this.disconnectWebSocket();
  }

  async publishMessage(newMessageRequest: NewMessageRequest) {
    newMessageRequest.username = this.username()!;

    if ((await this.messagesService.postMessage(newMessageRequest)) === false) {
      this.onLogout();
    }
  }

  async onLogout() {
    const result = await this.authenticationService.logout();
    if (result) {
      this.router.navigate(['/login']);
    } else {
      console.error('Logout failed');
    }
  }

  private connectWebSocket() {
    this.webSocketService.connect(this.onNotification.bind(this));
  }

  private async onNotification() {
    if ((await this.messagesService.fetchMessages()) === false) {
      this.onLogout();
    }
  }

  private disconnectWebSocket() {
    this.wsSubscription?.unsubscribe();
    this.webSocketService.disconnect();
  }
}
