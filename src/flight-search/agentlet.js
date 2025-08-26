

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
    console.log("Tool invocada:", toolName, params);
    return {
      status: "ERROR",
      message: "Tool no implementada aún: " + toolName
    };
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