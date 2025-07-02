// Các cái này là bổ sung cho các thư viện cần thiết cho WebSocket
import { Buffer } from 'buffer';

if (typeof global === 'undefined') {
  (window as any).global = window;
}

if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    from: (data: any) => new Uint8Array(data),
    alloc: (size: number) => new Uint8Array(size),
    allocUnsafe: (size: number) => new Uint8Array(size),
  };
}
(window as any).Buffer = Buffer;