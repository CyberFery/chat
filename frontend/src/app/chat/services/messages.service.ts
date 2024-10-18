import { Injectable, Signal, signal } from '@angular/core';
import { Message } from '../model/message.model';
import { HttpClient, HttpParams } from '@angular/common/http';

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

    this.http.get<Message[]>('/messages', { params }).subscribe((data) => {
      if (fromId !== undefined) {
        this.messages.update((messages) => [...messages, ...data]);
      } else {
        this.messages.set(data);
      }
    });
  }

  postMessage(message: Omit<Message, 'id' | 'timestamp'>): void {
    this.http.post<Message>('/messages', message).subscribe((newMessage) => {
      this.messages.update((messages) => [...messages, newMessage]);
    });
  }

  getMessages(): Signal<Message[]> {
    return this.messages;
  }
}
