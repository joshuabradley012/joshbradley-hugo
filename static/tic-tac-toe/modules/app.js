import Component from './component.js';

import Board from './board.js';
import BottomBar from './bottom-bar.js';
import Slider from './slider.js'
import Tally from './tally.js'

class App extends Component {
  constructor(props = { size: 3 }) {
    super(props);

    this.state = {
      size: this.props.size,
      board: new Array(this.props.size ** 2).fill(''),
      currentPlayer: 'x',
      lastWinner: 'x',
      gameOver: false,
      statusMessage: 'X plays next.',
      playerScores: {
        x: 0,
        o: 0,
      }
    };

    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.isWinner = this.isWinner.bind(this);
    this.handleGameOver = this.handleGameOver.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  get nextPlayer() {
    return this.state.currentPlayer === 'x' ? 'o' : 'x';
  }

  isWinner(player) {
    const lines = {
      all: [],
      rows: [],
      cols: [],
      lDiag: [],
      rDiag: [],
    };

    for (let i = 0; i < this.state.board.length; i++) {
      const piece = this.state.board[i];
      const col = i % this.state.size;
      const row = Math.floor(i / this.state.size) % this.state.size;

      if (!lines.cols[col]) lines.cols[col] = [];
      if (!lines.rows[row]) lines.rows[row] = [];

      lines.cols[col].push(piece);
      lines.rows[row].push(piece);

      if (col === row) lines.lDiag.push(piece);
      if (col + row === this.state.size - 1) lines.rDiag.push(piece);
    }

    Object.values(lines).forEach(line => {
      if (Array.isArray(line[0])) {
        lines.all.push(...line);
      } else {
        lines.all.push(line);
      }
    });

    for (let i = 0; i < lines.all.length; i++) {
      const line = lines.all[i];
      if (line.every(piece => piece === player)) {
        return true;
      }
    }

    return false;
  }

  handleReset() {
    this.setState({
      gameOver: false,
      board: new Array(this.state.size ** 2).fill(''),
      currentPlayer: this.state.lastWinner,
      statusMessage: `${this.state.lastWinner.toUpperCase()} plays next.`,
    });
  }

  handleResize(size) {
    this.setState({
      size
    }, this.handleReset);
  }

  handleGameOver(winner) {
    let statusMessage = 'Draw!';
    let lastWinner = this.state.lastWinner;
    let playerScores = Object.assign({}, this.state.playerScores);

    if (winner) {
      statusMessage = `${winner.toUpperCase()} wins!`;
      lastWinner = winner;
      playerScores[winner]++;
    }

    this.setState({
      gameOver: true,
      statusMessage,
      lastWinner,
      playerScores,
    });
  }

  handleSquareClick(i) {
    if (this.state.gameOver || this.state.board[i]) return;

    const newBoard = this.state.board.slice();
    newBoard[i] = this.state.currentPlayer;

    this.setState({
      board: newBoard,
      currentPlayer: this.nextPlayer,
      statusMessage: `${this.nextPlayer.toUpperCase()} plays next.`,
    }, () => {
      if (this.isWinner(this.nextPlayer)) {
        return this.handleGameOver(this.nextPlayer);
      }

      if (this.state.board.every(piece => piece !== '')) {
        return this.handleGameOver('');
      }
    });
  }

  render() {
    return this.create('div', { className: 'app-shell' },
      this.create('h1', { className: 'title' }, 'Tic tac toe'),
      new Slider({
        min: 3,
        max: 8,
        size: this.state.size,
        handleChange: this.handleResize,
      }),
      new Tally({
        playerScores: this.state.playerScores,
      }),
      new Board({
        handleClick: this.handleSquareClick,
        board: this.state.board,
        size: this.state.size,
      }),
      new BottomBar({
        handleClick: this.handleReset,
        statusMessage: this.state.statusMessage,
      })
    );
  }
}

export default App;
