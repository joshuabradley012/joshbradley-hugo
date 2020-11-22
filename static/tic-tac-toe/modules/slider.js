import Component from './component.js';

class RangeInput extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.create('input', {
      className: this.props.className,
      type: 'range',
      min: this.props.min,
      max: this.props.max,
      value: this.props.value,
      onChange: () => this.props.handleChange(this.node.value),
    });
  }
}

class Slider extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.create('div', { className: 'slider' },
      this.create('label', { className: 'slider-label' }, `Board size: ${this.props.size}`),
      new RangeInput({
        className: 'slider-input',
        type: 'range',
        min: this.props.min,
        max: this.props.max,
        value: this.props.size,
        handleChange: this.props.handleChange,
      })
    );
  }
}

export default Slider;
