import { Component, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/login/services/authentication.service';
import { MessagesService } from '../../services/messages.service';
import {
  WebSocketService,
  WebSocketEvent,
} from '../../services/websocket.service';
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

  publishMessage(newMessageRequest: NewMessageRequest) {
    newMessageRequest.username = this.username()!;

    this.messagesService.postMessage(newMessageRequest);
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
    this.wsSubscription = this.webSocketService.connect().subscribe({
      next: (event: WebSocketEvent) => {
        if (event === 'notif') {
          this.messagesService.fetchMessages();
        }
      },
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket connection closed'),
    });
  }

  private disconnectWebSocket() {
    this.wsSubscription?.unsubscribe();
    this.webSocketService.disconnect();
  }
}
