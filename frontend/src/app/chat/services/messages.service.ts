import { Injectable, Signal, signal } from '@angular/core';
import { Message, NewMessageRequest } from '../model/message.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  messages = signal<Message[]>([]);

  constructor(private http: HttpClient) {}

  fetchMessages(): void {
    const messages = this.messages();
    let fromId: number | undefined;

    if (messages.length > 0) {
      fromId = messages[messages.length - 1].id;
    }

    let params = new HttpParams();
    if (fromId !== undefined) {
      params = params.set('fromId', fromId.toString());
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

  postMessage(message: NewMessageRequest): void {
    this.http
      .post<Message>(`${environment.backendUrl}/messages`, message, {
        withCredentials: true,
      })
      .subscribe();
  }

  getMessages(): Signal<Message[]> {
    return this.messages;
  }
}
