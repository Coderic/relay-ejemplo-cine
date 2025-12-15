# 🎬 Sistema de Reserva de Cine - SvelteKit + Relay Gateway

Sistema de reserva de asientos de cine en tiempo real construido con **SvelteKit** y **[Relay Gateway](https://github.com/Coderic/Relay)**.

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.49-FF3E00?logo=svelte)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Relay](https://img.shields.io/badge/Relay-Gateway-blueviolet)

## 📖 Sobre este Ejemplo

Este ejemplo funcional demuestra cómo construir un sistema de reserva de asientos de cine con actualización de disponibilidad en tiempo real. Este ejemplo muestra:

- 🎬 **Selección de películas** - Catálogo de películas disponibles
- 🎫 **Reserva de asientos** - Visualización interactiva de la sala de cine
- ⚡ **Actualización en tiempo real** - Los asientos se bloquean automáticamente cuando otros usuarios los seleccionan
- ⚠️ **Prevención de overbooking** - Múltiples usuarios no pueden reservar el mismo asiento
- 📊 **Gestión de reservas** - Vista de todas las reservas activas en tiempo real
- 🎭 **Visualización de la sala** - Mapa interactivo de asientos con estados (disponible, reservado, vendido)

Este ejemplo pertenece a la colección de ejemplos de **[Relay Gateway](https://github.com/Coderic/Relay)**, un gateway de comunicación en tiempo real diseñado para ser inmutable y agnóstico.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ o Docker
- Relay Gateway ejecutándose (ver [documentación de Relay](https://relay.coderic.net))

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Coderic/cine.git
cd cine

# Instalar dependencias
npm install
```

### Configuración

Asegúrate de tener Relay Gateway ejecutándose. Puedes usar el endpoint público para pruebas:

```javascript
// En tu código, el conector se conecta a:
const relay = new RelayConector('http://demo.relay.coderic.net');
```

O ejecuta Relay localmente:

```bash
# Opción 1: Con npx (recomendado para pruebas)
npx @coderic/relay

# Opción 2: Con Docker Compose
docker compose up -d
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5173` (o el puerto que Vite asigne).

### Producción

```bash
# Construir para producción
npm run build

# Los archivos estarán en la carpeta build/
```

## 🎯 Uso

1. **Abrir múltiples pestañas** para simular diferentes usuarios
2. **Seleccionar una película** del catálogo
3. **Elegir asientos** - Observa cómo los asientos se bloquean en tiempo real cuando otros usuarios los seleccionan
4. **Realizar reservas** - Los asientos se reservan automáticamente
5. **Ver el dashboard** - Monitorea todas las reservas en tiempo real

## 🔗 Enlaces

- 📦 [Repositorio](https://github.com/Coderic/cine)
- 🐛 [Issues](https://github.com/Coderic/cine/issues)
- 🌐 [Demo en línea](https://coderic.org/cine/)
- 📚 [Documentación de Relay](https://relay.coderic.net)
- ⚡ [Relay Gateway](https://github.com/Coderic/Relay)

## 🛠️ Tecnologías

- **SvelteKit** - Framework para construir aplicaciones web
- **Svelte** - Framework compilado para interfaces de usuario
- **Vite** - Build tool y dev server
- **Relay Gateway** - Gateway de comunicación en tiempo real
- **Socket.io** - Comunicación WebSocket

## 📝 Licencia

MIT
