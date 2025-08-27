

import { Agentlet } from '../lib/agentlet-1.0.0.js';

class FlightSearchAgentlet extends Agentlet {
  static get agentletId() {
    return {
      manifestVersion: "1.1.0-mini",
      name: "Flight Search",
      version: "0.1.0",
      groupId: "com.autanalabs",
      artifactId: "flight-reservation",
      tagName: "flight-search"
    };
  }

  constructor() {
    super();
    // Estado inicial por defecto (provisional)
    this._state = {
      origin: "",
      destination: "",
      startDate: "",
      endDate: "",
      passengers: { adults: 1, children: 0, infants: 0 },
      cabinClass: "economy"
    };
  }

  onToolCall(toolName, params) {
    switch (toolName) {
      case 'agentlet_getState':
        return {
          status: "OK",
          message: "Estado actual devuelto.",
          response: this._state
        };

      case 'agentlet_setItinerary':
        this._state = {
          ...this._state,
          ...params,
          passengers: {
            ...this._state.passengers,
            ...(params.passengers || {})
          }
        };
        this.render();
        return {
          status: "OK",
          message: "Itinerario actualizado.",
          response: this._state
        };

      case 'agentlet_updateField':
        const { field, value } = params || {};
        if (field && field in this._state) {
          this._state[field] = value;
          this.render();
          return {
            status: "OK",
            message: `Campo ${field} actualizado.`,
            response: this._state
          };
        }
        return {
          status: "ERROR",
          message: "Campo inválido o no especificado."
        };

      case 'agentlet_shiftDates':
        const { deltaDays } = params || {};
        if (typeof deltaDays !== 'number') {
          return {
            status: "ERROR",
            message: "Parámetro deltaDays inválido."
          };
        }
        const shift = (dateStr) => {
          const d = new Date(dateStr);
          d.setDate(d.getDate() + deltaDays);
          return d.toISOString().slice(0, 10);
        };
        if (this._state.startDate) this._state.startDate = shift(this._state.startDate);
        if (this._state.endDate) this._state.endDate = shift(this._state.endDate);
        this.render();
        return {
          status: "OK",
          message: `Fechas desplazadas ${deltaDays} días.`,
          response: this._state
        };

      case 'agentlet_setPassengers':
        this._state.passengers = {
          ...this._state.passengers,
          ...(params || {})
        };
        this.render();
        return {
          status: "OK",
          message: "Pasajeros actualizados.",
          response: this._state
        };

      case 'agentlet_setClass':
        if (params && typeof params.cabinClass === 'string') {
          this._state.cabinClass = params.cabinClass;
          this.render();
          return {
            status: "OK",
            message: "Clase actualizada.",
            response: this._state
          };
        }
        return {
          status: "ERROR",
          message: "Parámetro cabinClass inválido."
        };

      case 'agentlet_reset':
        this._state = {
          origin: "",
          destination: "",
          startDate: "",
          endDate: "",
          passengers: { adults: 1, children: 0, infants: 0 },
          cabinClass: "economy"
        };
        this.render();
        return {
          status: "OK",
          message: "Estado reiniciado.",
          response: this._state
        };

      default:
        return {
          status: "ERROR",
          message: "Tool no reconocida: " + toolName
        };
    }
  }

  onMessageFromShell(message) {
    console.log("Mensaje desde Shell:", message);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        div {
          font-family: sans-serif;
          font-size: 16px;
          padding: 12px;
        }
      </style>
      <div>✈️ Agentlet de búsqueda de vuelos en construcción…</div>
    `;
  }
}

Agentlet.register(FlightSearchAgentlet);