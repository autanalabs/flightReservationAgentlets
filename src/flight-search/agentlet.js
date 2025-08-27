import { Agentlet } from '../lib/agentlet-1.0.0.js';

class FlightSearchAgentlet extends Agentlet {
  static get agentletId() {
    return {
      manifestVersion: "1.1.0-mini",
      name: "Buscar vuelos",
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

  _sendMessage(text) {
    Agentlet.shell.sendMessageToShell(JSON.stringify({
      type: 'message',
      message: text
    }));
  }

  _highlightField(id) {
    const el = this.shadowRoot.getElementById(id);
    if (!el) return;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 500);
  }

  onToolCall(toolName, params) {
    switch (toolName) {
      case 'getState':
      case 'agentlet_getState':
        return {
          status: "OK",
          message: "Estado actual devuelto.",
          response: this._state
        };

      case 'setItinerary':
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
        if (params) {
          if ('origin' in params) this._highlightField('origin');
          if ('destination' in params) this._highlightField('destination');
          if ('startDate' in params) this._highlightField('startDate');
          if ('endDate' in params) this._highlightField('endDate');
          if (params.passengers) {
            if ('adults' in params.passengers) this._highlightField('adults');
            if ('children' in params.passengers) this._highlightField('children');
            if ('infants' in params.passengers) this._highlightField('infants');
          }
          if ('cabinClass' in params) this._highlightField('cabinClass');
        }
        return {
          status: "OK",
          message: "Itinerario actualizado.",
          response: this._state
        };

      case 'updateField':
      case 'agentlet_updateField':
        const { field, value } = params || {};
        if (field && field in this._state) {
          this._state[field] = value;
          this.render();
          this._highlightField(field);
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

      case 'shiftDates':
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
        this._highlightField('startDate');
        this._highlightField('endDate');
        return {
          status: "OK",
          message: `Fechas desplazadas ${deltaDays} días.`,
          response: this._state
        };

      case 'setPassengers':
      case 'agentlet_setPassengers':
        this._state.passengers = {
          ...this._state.passengers,
          ...(params || {})
        };
        this.render();
        this._highlightField('adults');
        this._highlightField('children');
        this._highlightField('infants');
        return {
          status: "OK",
          message: "Pasajeros actualizados.",
          response: this._state
        };

      case 'setClass':
      case 'agentlet_setClass':
        if (params && typeof params.cabinClass === 'string') {
          this._state.cabinClass = params.cabinClass;
          this.render();
          this._highlightField('cabinClass');
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
        this._highlightField('origin');
        this._highlightField('destination');
        this._highlightField('startDate');
        this._highlightField('endDate');
        this._highlightField('adults');
        this._highlightField('children');
        this._highlightField('infants');
        this._highlightField('cabinClass');
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
    const s = this._state;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
          background: transparent;
          padding: 24px;
          color: #111;
          /* max-width: 900px; */
          /* margin: auto; */
          transform: scale(0.75);
          transform-origin: top left;
        }
        .container {
          background: rgba(255,255,255,0.92) url('https://almundo-com-res.cloudinary.com/image/upload/v1756089522/BANCO%20DE%20IMAGENES%202019/TRAVEL_2025_-_HOME_HEADER_-_VUELOS.jpg') center center / cover no-repeat;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          padding: 24px;
        }
        .field { margin-bottom: 10px; }
       label {
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  color: white;
  font-size: 18px;
  text-shadow:
    -1px -1px 1px #000,
     1px -1px 1px #000,
    -1px  1px 1px #000,
     1px  1px 1px #000;
}
        input, select {
          width: 100%;
          padding: 10px 14px;
          font-size: 15px;
          border: 1px solid #ccc;
          border-radius: 12px;
          box-sizing: border-box;
          transition: border 0.3s ease;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #00a4a5;
        }
        .row { display: flex; gap: 12px; }
        .col { flex: 1; }
        .section { border: 1px solid #eee; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
        .section h3 {
  margin-top: 0;
  font-size: 18px;
  color: white;
  text-shadow:
    -1px -1px 1px #000,
     1px -1px 1px #000,
    -1px  1px 1px #000,
     1px  1px 1px #000;
}
        .flash {
          background-color: #fff8b3 !important;
          transition: background-color 0.5s ease-out;
        }
        .footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }
        .footer button {
          background-color: #00a4a5;
          color: white;
          font-size: 15px;
          padding: 10px 20px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .footer button:hover {
          background-color: #008f90;
        }
      </style>
      <div class="container">
        <div class="section">
          <h3>Itinerario</h3>
          <div class="row">
            <div class="col field">
              <label for="origin">Origen</label>
              <input id="origin" name="origin" value="${s.origin}" />
            </div>
            <div class="col field">
              <label for="destination">Destino</label>
              <input id="destination" name="destination" value="${s.destination}" />
            </div>
          </div>
          <div class="row">
            <div class="col field">
              <label for="startDate">Ida</label>
              <input id="startDate" name="startDate" type="date" value="${s.startDate}" />
            </div>
            <div class="col field">
              <label for="endDate">Vuelta</label>
              <input id="endDate" name="endDate" type="date" value="${s.endDate}" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Pasajeros</h3>
          <div class="row">
            <div class="col field">
              <label for="adults">Adultos</label>
              <input id="adults" name="adults" type="number" min="1" max="9" value="${s.passengers.adults}" />
            </div>
            <div class="col field">
              <label for="children">Niños</label>
              <input id="children" name="children" type="number" min="0" max="9" value="${s.passengers.children}" />
            </div>
            <div class="col field">
              <label for="infants">Bebes</label>
              <input id="infants" name="infants" type="number" min="0" max="9" value="${s.passengers.infants}" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Clase</h3>
          <div class="field">
           
            <select id="cabinClass" name="cabinClass">
              <option value="economy" ${s.cabinClass === 'economy' ? 'selected' : ''}>Económica</option>
              <option value="premium_economy" ${s.cabinClass === 'premium_economy' ? 'selected' : ''}>Premium Económica</option>
              <option value="business" ${s.cabinClass === 'business' ? 'selected' : ''}>Business</option>
              <option value="first" ${s.cabinClass === 'first' ? 'selected' : ''}>Primera</option>
            </select>
          </div>
        </div>
        <div class="footer">
          <button id="searchBtn">
            🔍 Buscar
          </button>
        </div>
      </div>
    `;

    let originTimer, destinationTimer;
    let lastOrigin = this._state.origin;
    let lastDestination = this._state.destination;

    const bind = (id, fn) => {
      const el = this.shadowRoot.getElementById(id);
      if (el) el.addEventListener('input', fn);
    };

    bind('origin', e => {
      const newVal = e.target.value;
      this._state.origin = newVal;
      //this.render();
      clearTimeout(originTimer);
      originTimer = setTimeout(() => {
        if (lastOrigin !== newVal) {
          this._sendMessage("Origen actualizado a " + newVal);
          lastOrigin = newVal;
        }
      }, 600);
    });

    bind('destination', e => {
      const newVal = e.target.value;
      this._state.destination = newVal;
      //this.render();
      clearTimeout(destinationTimer);
      destinationTimer = setTimeout(() => {
        if (lastDestination !== newVal) {
          this._sendMessage("Destino actualizado a " + newVal);
          lastDestination = newVal;
        }
      }, 600);
    });

    bind('startDate', e => { this._state.startDate = e.target.value; this.render(); this._sendMessage("Fecha de ida actualizada a " + this._state.startDate); });
    bind('endDate', e => { this._state.endDate = e.target.value; this.render(); this._sendMessage("Fecha de vuelta actualizada a " + this._state.endDate); });

    bind('adults', e => { this._state.passengers.adults = Number(e.target.value); this.render(); this._sendMessage("Adultos actualizados a " + this._state.passengers.adults); });
    bind('children', e => { this._state.passengers.children = Number(e.target.value); this.render(); this._sendMessage("Niños actualizados a " + this._state.passengers.children); });
    bind('infants', e => { this._state.passengers.infants = Number(e.target.value); this.render(); this._sendMessage("Infantes actualizados a " + this._state.passengers.infants); });

    bind('cabinClass', e => { this._state.cabinClass = e.target.value; this.render(); this._sendMessage("Clase actualizada a " + this._state.cabinClass); });

    const searchBtn = this.shadowRoot.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this._sendMessage("El usuario desea realizar la búsqueda de vuelos");
      });
    }
  }
}

Agentlet.register(FlightSearchAgentlet);