<script lang="ts">
  import { onMount } from 'svelte';
  import { createRelay } from '$lib/relay';

  const SESSION_ID = (() => {
    if (typeof window === 'undefined') return 'user_guest';
    const stored = localStorage.getItem('cineSession');
    if (stored) return stored;
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cineSession', id);
    return id;
  })();

  const relay = createRelay(SESSION_ID);
  let connected = false;
  let asientos: { [key: string]: 'disponible' | 'reservado' | 'vendido' } = {};
  let asientosSeleccionados: string[] = [];
  let miNombre = '';
  let notificacion: { tipo: string; mensaje: string } | null = null;

  // Inicializar asientos (10 filas x 15 asientos)
  onMount(() => {
    const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const inicial: { [key: string]: 'disponible' | 'reservado' | 'vendido' } = {};
    filas.forEach(fila => {
      for (let i = 1; i <= 15; i++) {
        inicial[`${fila}${i}`] = 'disponible';
      }
    });
    asientos = inicial;

    // Suscribirse a cambios de conexión
    const unsubscribeConnected = relay.connected.subscribe(value => {
      connected = value;
    });

    // Escuchar mensajes
    const unsubscribe = relay.onMensaje((data) => {
      switch (data.tipo) {
        case 'asiento_reservado':
          if (data.asiento && data.sessionId !== SESSION_ID) {
            asientos[data.asiento] = 'reservado';
            asientos = { ...asientos };
          }
          break;

        case 'asiento_liberado':
          if (data.asiento) {
            asientos[data.asiento] = 'disponible';
            asientos = { ...asientos };
          }
          break;

        case 'compra_confirmada':
          if (data.asientos) {
            data.asientos.forEach((asiento: string) => {
              asientos[asiento] = 'vendido';
            });
            asientos = { ...asientos };
            if (data.sessionId === SESSION_ID) {
              notificacion = { tipo: 'success', mensaje: '¡Compra confirmada!' };
              setTimeout(() => notificacion = null, 3000);
            }
          }
          break;

        case 'sync_asientos':
          if (data.asientos) {
            asientos = { ...asientos, ...data.asientos };
            asientos = { ...asientos };
          }
          break;
      }
    });

    // Solicitar sincronización al conectar
    relay.connected.subscribe(value => {
      if (value) {
        relay.enviarATodos({ tipo: 'sync_request', sessionId: SESSION_ID });
      }
    });

    return () => {
      unsubscribe();
      unsubscribeConnected();
    };
  });

  function seleccionarAsiento(asiento: string) {
    if (asientos[asiento] === 'vendido') return;
    if (asientos[asiento] === 'reservado' && !asientosSeleccionados.includes(asiento)) return;

    if (asientosSeleccionados.includes(asiento)) {
      asientosSeleccionados = asientosSeleccionados.filter(a => a !== asiento);
      relay.enviarATodos({ 
        tipo: 'asiento_liberado', 
        asiento, 
        sessionId: SESSION_ID 
      });
    } else {
      asientosSeleccionados = [...asientosSeleccionados, asiento];
      relay.enviarATodos({ 
        tipo: 'asiento_reservado', 
        asiento, 
        sessionId: SESSION_ID 
      });
    }
  }

  function confirmarCompra() {
    if (asientosSeleccionados.length === 0) {
      notificacion = { tipo: 'error', mensaje: 'Selecciona al menos un asiento' };
      setTimeout(() => notificacion = null, 3000);
      return;
    }

    relay.enviarATodos({
      tipo: 'compra_confirmada',
      asientos: asientosSeleccionados,
      sessionId: SESSION_ID,
      usuario: miNombre || SESSION_ID
    });

    asientosSeleccionados.forEach(asiento => {
      asientos[asiento] = 'vendido';
    });
    asientos = { ...asientos };
    asientosSeleccionados = [];
    notificacion = { tipo: 'success', mensaje: '¡Compra realizada!' };
    setTimeout(() => notificacion = null, 3000);
  }

  function getEstadoColor(estado: string) {
    switch (estado) {
      case 'disponible': return '#10b981';
      case 'reservado': return '#f59e0b';
      case 'vendido': return '#ef4444';
      default: return '#6b7280';
    }
  }

  const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
</script>

<svelte:head>
  <title>🎬 Cine en Tiempo Real - Relay</title>
</svelte:head>

<div class="app">
  <header class="header">
    <h1>🎬 Sistema de Reserva de Cine</h1>
    <div class="status-bar">
      <div class="status-item">
        <span class="dot" class:online={connected}></span>
        <span>{connected ? 'Conectado' : 'Desconectado'}</span>
      </div>
      <div class="status-item">
        <span class="dot" style="background: #10b981;"></span>
        <span>Disponible</span>
      </div>
      <div class="status-item">
        <span class="dot" style="background: #f59e0b;"></span>
        <span>Reservado</span>
      </div>
      <div class="status-item">
        <span class="dot" style="background: #ef4444;"></span>
        <span>Vendido</span>
      </div>
    </div>
  </header>

  <div class="container">
    <div class="panel">
      <h2>Pantalla</h2>
      <div class="pantalla"></div>
      
      <div class="sala">
        {#each filas as fila}
          <div class="fila">
            <span class="fila-label">{fila}</span>
            {#each Array(15) as _, i}
              {@const asiento = `${fila}${i + 1}`}
              {@const estado = asientos[asiento] || 'disponible'}
              {@const seleccionado = asientosSeleccionados.includes(asiento)}
              <button
                class="asiento"
                class:seleccionado={seleccionado}
                style="background: {getEstadoColor(estado)};"
                on:click={() => seleccionarAsiento(asiento)}
                disabled={estado === 'vendido'}
              >
                {i + 1}
              </button>
            {/each}
          </div>
        {/each}
      </div>

      <div class="resumen">
        <div class="input-group">
          <label for="nombre-input">Tu nombre (opcional):</label>
          <input
            id="nombre-input"
            type="text"
            bind:value={miNombre}
            placeholder="Ingresa tu nombre"
            maxlength={20}
          />
        </div>
        
        {#if asientosSeleccionados.length > 0}
          <div class="seleccionados">
            <strong>Asientos seleccionados:</strong> {asientosSeleccionados.join(', ')}
          </div>
        {/if}

        <button class="btn-confirmar" on:click={confirmarCompra}>
          Confirmar Compra ({asientosSeleccionados.length})
        </button>
      </div>
    </div>
  </div>

  {#if notificacion}
    <div class="notificacion" class:success={notificacion.tipo === 'success'} class:error={notificacion.tipo === 'error'}>
      {notificacion.mensaje}
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
    min-height: 100vh;
    color: #e0e0e0;
  }

  .app {
    min-height: 100vh;
  }

  .header {
    text-align: center;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header h1 {
    font-size: 2rem;
    color: white;
    margin: 0 0 1rem 0;
  }

  .status-bar {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    font-size: 0.85rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #6b7280;
  }

  .dot.online {
    background: #10b981;
    box-shadow: 0 0 10px #10b981;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .panel {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
  }

  .panel h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: white;
  }

  .pantalla {
    width: 80%;
    height: 80px;
    background: linear-gradient(to bottom, #4b5563, #1f2937);
    margin: 0 auto 3rem;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    position: relative;
  }

  .pantalla::after {
    content: 'PANTALLA';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.3);
    font-size: 1.5rem;
    font-weight: bold;
  }

  .sala {
    margin-bottom: 2rem;
  }

  .fila {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    justify-content: center;
  }

  .fila-label {
    width: 30px;
    text-align: center;
    font-weight: bold;
    color: white;
  }

  .asiento {
    width: 40px;
    height: 40px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .asiento:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 0 10px currentColor;
  }

  .asiento:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .asiento.seleccionado {
    border-color: white;
    border-width: 3px;
    box-shadow: 0 0 15px currentColor;
  }

  .resumen {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .input-group {
    margin-bottom: 1rem;
  }

  .input-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: white;
  }

  .input-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
  }

  .input-group input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .seleccionados {
    padding: 1rem;
    background: rgba(99, 102, 241, 0.2);
    border-radius: 8px;
    margin-bottom: 1rem;
    color: white;
  }

  .btn-confirmar {
    width: 100%;
    padding: 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-confirmar:hover {
    background: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
  }

  .notificacion {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  }

  .notificacion.success {
    background: #10b981;
  }

  .notificacion.error {
    background: #ef4444;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
