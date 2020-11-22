import Component from './component.js';

class Score extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.create('div', { className: 'score' },
      this.create('span', { className: 'player-name' }, this.props.name.toUpperCase()),
      this.create('span', { className: 'player-score' }, this.props.score)
    );
  }
}

class Tally extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.create('div', { className: 'tally' },
      ...Object.entries(this.props.playerScores).map(([name, score]) => new Score({
        name,
        score,
      }))
    );
  }
}

export default Tally;
