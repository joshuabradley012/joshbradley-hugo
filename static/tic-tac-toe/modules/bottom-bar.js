import Component from './component.js';

import Button from './button.js';

class BottomBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.create('div', { className: 'bottom-bar' },
      this.create('p', { className: 'status' }, this.props.statusMessage),
      new Button({
        handleClick: this.props.handleClick,
        text: 'Reset',
      })
    );
  }
}

export default BottomBar;
