import { Injectable, Signal, signal } from '@angular/core';
import { Message, NewMessageRequest } from '../model/message.model';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  messages = signal<Message[]>([]);

  constructor(private http: HttpClient) {}

  fetchMessages(): Promise<boolean> {
    return new Promise((resolve) => {
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

            resolve(true);
          },
          error: (error) => {
            if (error.status === 403) {
              console.warn('Not authenticated');
              resolve(false);
            } else {
              console.error('Error fetching messages:', error);
              resolve(true);
            }
          },
        });
    });
  }

  postMessage(message: NewMessageRequest): Promise<boolean> {
    return new Promise((resolve) => {
      const headers = new HttpHeaders().set('username', message.username);

      this.http
        .post<Message>(`${environment.backendUrl}/messages`, message, {
          headers,
          withCredentials: true,
        })
        .subscribe({
          next: () => {
            resolve(true);
          },
          error: (error) => {
            if (error.status === 403) {
              console.warn('Not authenticated');
              resolve(false);
            } else {
              console.error('Error posting message:', error);
              resolve(true);
            }
          },
        });
    });
  }

  getMessages(): Signal<Message[]> {
    return this.messages;
  }
}
