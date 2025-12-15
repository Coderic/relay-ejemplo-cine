import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { onMount, onDestroy } from 'svelte';
import { writable, type Writable } from 'svelte/store';

function getRelayUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }
  if (window.location.hostname === 'localhost' && window.location.port === '8000') {
    return 'http://localhost:5000';
  }
  if (window.location.hostname === 'coderic.org') {
    return 'wss://demo.relay.coderic.net';
  }
  return `${window.location.protocol}//${window.location.hostname}:5000`;
}

const RELAY_URL = import.meta.env.VITE_RELAY_URL || getRelayUrl();

export function createRelay(userId: string) {
  const connected = writable(false);
  const identified = writable(false);
  let socket: Socket | null = null;
  const listeners = new Map<string, (data: any) => void>();

  onMount(() => {
    socket = io(`${RELAY_URL}/relay`, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Relay] Conectado:', socket?.id);
      connected.set(true);
      
      if (userId) {
        socket?.emit('identificar', userId, (ok: boolean) => {
          console.log('[Relay] Identificado:', userId);
          identified.set(ok);
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Relay] Desconectado:', reason);
      connected.set(false);
      identified.set(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[Relay] Error:', error.message);
    });

    socket.on('relay', (data) => {
      listeners.forEach((callback) => callback(data));
    });

    socket.on('notificar', (data) => {
      listeners.forEach((callback, key) => {
        if (key.startsWith('notificar:')) callback(data);
      });
    });

    return () => {
      socket?.disconnect();
    };
  });

  onDestroy(() => {
    socket?.disconnect();
  });

  const enviar = (data: any, destino: 'yo' | 'ustedes' | 'nosotros' = 'nosotros') => {
    if (socket) {
      socket.emit('relay', { ...data, destino });
    }
  };

  const enviarATodos = (data: any) => enviar(data, 'nosotros');
  const enviarAOtros = (data: any) => enviar(data, 'ustedes');
  const enviarAMi = (data: any) => enviar(data, 'yo');

  const onMensaje = (callback: (data: any) => void) => {
    const key = `mensaje:${Date.now()}:${Math.random()}`;
    listeners.set(key, callback);
    return () => listeners.delete(key);
  };

  return {
    connected,
    identified,
    enviar,
    enviarATodos,
    enviarAOtros,
    enviarAMi,
    onMensaje
  };
}

