class VDOM {
  constructor(app, root) {
    this.app = app;
    this.root = root;
    this.render();
  }

  render() {
    this.root.appendChild(this.app.render());
  }
}

export default VDOM;
