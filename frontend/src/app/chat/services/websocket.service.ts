import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private ws: WebSocket | null = null;

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 100;
  private readonly reconnectIntervalMs = 2000; // 2 segundos
  private reconnecting = false;

  constructor() {}

  public connect(onNotification: () => void): void {
    this.ws = new WebSocket(`${environment.wsUrl}/notifications`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.reconnecting = false;
      console.log('Connection established');
    };

    this.ws.onmessage = () => {
      onNotification();
    };

    this.ws.onclose = (ev: CloseEvent) => {
      if (ev.reason === 'user') {
        return;
      }

      if (
        !this.reconnecting &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnect(onNotification);
      }
    };

    this.ws.onerror = () => {
      this.reconnect(onNotification);
    };
  }

  private reconnect(onNotification: () => void) {
    this.reconnecting = true;
    this.reconnectAttempts++;
    console.log('Reconnecting...');

    setTimeout(() => {
      this.connect(onNotification);
    }, this.reconnectIntervalMs);
  }

  public disconnect() {
    this.ws?.close(1000, 'user');
    this.ws = null;
    this.reconnectAttempts = 0;
  }
}
