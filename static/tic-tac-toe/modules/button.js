import Component from './component.js';

class Button extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.create('button', {
      className: 'btn',
      onClick: this.props.handleClick,
    }, this.props.text);
  }
}

export default Button;
