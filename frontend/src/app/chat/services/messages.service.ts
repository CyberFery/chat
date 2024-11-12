import { Injectable, Signal, signal } from '@angular/core';
import { Message } from '../model/message.model';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  messages = signal<Message[]>([]);

  constructor(private http: HttpClient) {}

  fetchMessages(): void {
    const currentMessages = this.messages();
    let fromId: string | undefined;

    if (currentMessages.length > 0) {
      fromId = currentMessages[currentMessages.length - 1].id;
    }

    let params = new HttpParams();
    if (fromId !== undefined) {
      params = params.set('fromId', fromId);
    }

    this.http
      .get<Message[]>(`${environment.backendUrl}/messages`, {
        params,
        withCredentials: true,
      })
      .subscribe({
        next: (data) => {
          if (fromId !== undefined) {
            this.messages.update((messages) => [...messages, ...data]);
          } else {
            this.messages.set(data);
          }
        },
        error: (error) => {
          console.error('Error fetching messages:', error);
        },
      });
  }

  postMessage(
    message: Omit<Message, 'id' | 'timestamp'>,
    username: string,
  ): void {
    const token = 'TOKEN';

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('username', username);

    this.http
      .post<Message>(`${environment.backendUrl}/messages`, message, {
        headers,
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          this.fetchMessages();
        },
        error: (error) => {
          console.error('Error posting message:', error);
        },
      });
  }

  getMessages(): Signal<Message[]> {
    return this.messages;
  }
}
