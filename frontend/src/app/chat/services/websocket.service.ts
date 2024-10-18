import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export type WebSocketEvent = 'notif';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private ws: WebSocket | null = null;

  public connect(): Observable<WebSocketEvent> {
    this.ws = new WebSocket(`${environment.wsUrl}/notifications`);
    const events = new Subject<WebSocketEvent>();

    this.ws.onmessage = () => events.next('notif');
    this.ws.onclose = () => events.complete();
    this.ws.onerror = () => events.error('error');

    return events.asObservable();
  }

  public disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
