import Component from './component.js';
import Square from './square.js';

class Board extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.create('div', { className: 'board', style: `--board-size: ${this.props.size}` },
      this.create('div', { className: 'board-inner' },
        ...this.props.board.map((player, i) => new Square({
          player,
          handleClick: () => this.props.handleClick(i),
        }))
      )
    );
  }
}

export default Board;
