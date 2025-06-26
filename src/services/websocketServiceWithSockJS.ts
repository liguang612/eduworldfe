import { Client } from '@stomp/stompjs';
import type { NotificationData } from '@/api/notificationApi';

// Dynamic import để tránh lỗi global
let SockJS: any = null;

const loadSockJS = async () => {
  if (!SockJS) {
    try {
      const sockjsModule = await import('sockjs-client');
      SockJS = sockjsModule.default;
    } catch (error) {
      console.error('Failed to load SockJS, falling back to native WebSocket:', error);
      return null;
    }
  }
  return SockJS;
};

export class WebSocketServiceWithSockJS {
  private client: Client | null = null;
  private notificationCallback: ((notification: NotificationData) => void) | null = null;
  private connectionStatusCallback: ((connected: boolean) => void) | null = null;

  async connect(token: string, userId: string) {
    if (this.client?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    // Try to load SockJS first, fallback to native WebSocket
    const SockJSModule = await loadSockJS();
    const wsURL = baseURL.replace(/^https?:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');

    this.client = new Client({
      webSocketFactory: () => {
        if (SockJSModule) {
          return new SockJSModule(`${baseURL}/ws`);
        } else {
          return new WebSocket(`${wsURL}/ws`);
        }
      },
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket');

        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(true);
        }

        // Subscribe to personal notifications
        this.client?.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            if (this.notificationCallback) {
              this.notificationCallback(notification);
            }
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        });

        // Subscribe to general notifications
        this.client?.subscribe(`/topic/notifications`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            if (this.notificationCallback) {
              this.notificationCallback(notification);
            }
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(false);
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(false);
        }
      }
    });

    this.client.activate();
  }

  onNotification(callback: (notification: NotificationData) => void) {
    this.notificationCallback = callback;
  }

  onConnectionStatusChange(callback: (connected: boolean) => void) {
    this.connectionStatusCallback = callback;
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const websocketServiceWithSockJS = new WebSocketServiceWithSockJS(); 