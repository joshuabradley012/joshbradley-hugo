class Component {
  constructor(props = {}) {
    this.state = {};
    this.props = props;
    this.create = this.create.bind(this);
    this.setState = this.setState.bind(this);
    this.node = this.create('div');

    this.syntheticEvents = {
      onClick: 'click',
      onChange: 'change',
    };
  }

  setState(updates, ...callbacks) {
    const newState = {};
    const oldNode = this.node;
    const parent = oldNode.parentElement;

    Object.assign(newState, this.state, updates);
    this.state = newState;
    this.render();
    parent.replaceChild(this.node, oldNode);

    callbacks.forEach(cb => cb());
  }

  create(type, props = {}, ...children) {
    this.node = document.createElement(type);

    Object.entries(props).forEach(([prop, value]) => {
      if (this.syntheticEvents.hasOwnProperty(prop)) {
        this.node.addEventListener(this.syntheticEvents[prop], value);
      } else {
        this.node[prop] = value;
      }
    });

    children.forEach(childElement => {
      const isComponent = childElement instanceof Component;
      const isNode = childElement instanceof Node;
      const isString = typeof childElement === 'string' || childElement instanceof String;
      const isNumber = typeof childElement === 'number' || childElement instanceof Number;

      if (isComponent) {
        this.node.appendChild(childElement.render());
      } else if (isNode) {
        this.node.appendChild(childElement);
      } else if (isString) {
        const textNode = document.createTextNode(childElement);
        this.node.appendChild(textNode);
      } else if (isNumber) {
        const textNode = document.createTextNode(String(childElement));
        this.node.appendChild(textNode);
      } else {
        console.error(`Could not create node of type ${typeof childElement}`);
      }
    });

    return this.node;
  }

  render() {
    console.error('Subclasses of Component must have a render method.')
    return this.node;
  }
}

export default Component;
