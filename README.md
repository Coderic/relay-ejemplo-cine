# 🎬 Sistema de Reserva de Cine - SvelteKit + Relay Gateway

Sistema de reserva de asientos de cine en tiempo real construido con **SvelteKit** y [Relay Gateway](https://github.com/Coderic/Relay).

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.49-FF3E00?logo=svelte)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Relay](https://img.shields.io/badge/Relay-Gateway-blueviolet)

## 🚀 Inicio Rápido

### Prerrequisitos

Relay Gateway ejecutándose en `http://localhost:5000`:

```bash
npx relay-gateway
```

### Instalación

```bash
git clone https://github.com/Coderic/relay-ejemplo-cine.git
cd relay-ejemplo-cine
npm install
npm run dev
```

Abre http://localhost:5173

## 📖 Características

- **Reserva de asientos en tiempo real**: Los asientos se bloquean instantáneamente cuando alguien los selecciona
- **Sincronización automática**: Todos los usuarios ven el mismo estado de los asientos
- **Confirmación de compra**: Sistema de compra con bloqueo temporal de asientos
- **Interfaz visual**: Sala de cine con 10 filas x 15 asientos

### Estados de asientos

- 🟢 **Disponible** - Libre para reservar
- 🟡 **Reservado** - En proceso de compra (temporalmente bloqueado)
- 🔴 **Vendido** - Ya fue comprado

## 💻 Uso del Servicio Relay

```typescript
import { createRelay } from '$lib/relay';

const relay = createRelay('mi-usuario-id');

// Suscribirse a conexión
relay.connected.subscribe(connected => {
  console.log('Conectado:', connected);
});

// Escuchar mensajes
const unsubscribe = relay.onMensaje((data) => {
  if (data.tipo === 'asiento_reservado') {
    // Bloquear asiento visualmente
  }
});

// Enviar mensaje
relay.enviarATodos({ 
  tipo: 'asiento_reservado', 
  asiento: 'A5' 
});
```

## 🔧 Configuración

Crea un archivo `.env`:

```env
VITE_RELAY_URL=http://localhost:5000
```

## 📁 Estructura

```
src/
├── lib/
│   └── relay.ts          # Servicio Relay para SvelteKit
├── routes/
│   ├── +layout.svelte     # Layout principal
│   └── +page.svelte       # Página principal (reserva de asientos)
└── app.d.ts
```

## 🎯 Casos de Uso

Este ejemplo demuestra patrones aplicables a:

- 🎬 **Cines y teatros**
- 🎸 **Conciertos y festivales**
- 🚌 **Buses y transporte**
- ✈️ **Vuelos**
- 🏨 **Hoteles**

## 🔗 Enlaces

- [Relay Gateway](https://github.com/Coderic/Relay)
- [Documentación](https://coderic.github.io/Relay/)
- [Otros ejemplos](https://github.com/Coderic?q=relay-ejemplo)

## 📄 Licencia

MIT © [Coderic](https://github.com/Coderic)
