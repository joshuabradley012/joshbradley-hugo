class EventSystem {
  constructor() {
    this.events = {};
  }

  on(e, cb) {
    this.events[e] = this.events[e] || [];
    this.events[e].push(cb);
  }

  trigger(e) {
    this.events[e].forEach(cb => cb());
  }
}

export default EventSystem;
