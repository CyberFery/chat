import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export type WebSocketEvent = 'notif' | 'error' | 'closed';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private ws: WebSocket | null = null;

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 100;
  private readonly reconnectIntervalMs = 2000; // 2 segundos
  private reconnecting = false;

  constructor(private ngZone: NgZone) {}

  public connect(): Observable<WebSocketEvent> {
    this.ws = new WebSocket(`${environment.wsUrl}/notifications`);
    const events = new Subject<WebSocketEvent>();

    this.ws = new WebSocket(`${environment.wsUrl}/notifications`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.reconnecting = false;
      console.log('Conexión establecida');
      //if (onReconnect) onReconnect();
    };

    this.ws.onmessage = () => events.next('notif');

    this.ws.onclose = () => {
      events.next('closed');
      if (
        !this.reconnecting &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        //this.reconnect(onReconnect);
      } else {
        events.complete();
      }
    };

    this.ws.onerror = () => {
      events.next('error');
      if (!this.reconnecting) {
        //this.reconnect(onReconnect);
      }
    };

    return events.asObservable();
  }

  public disconnect() {
    this.ws?.close();
    this.ws = null;
    this.reconnectAttempts = 0;
  }
}
