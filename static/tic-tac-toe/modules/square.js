import Component from './component.js';

class Square extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.create('div', {
      className: this.props.player ? `square ${this.props.player}` : 'square',
      onClick: this.props.handleClick,
    });
  }
}

export default Square;
