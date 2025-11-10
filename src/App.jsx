import { useState } from 'react';
import './App.css'; 

function calculateWinner(squares) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],      
    [0,3,6],[1,4,7],[2,5,8],      
    [0,4,8],[2,4,6]              
  ];
  for (const [a,b,c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a,b,c] };
    }
  }
  return { winner: null, line: [] };
}

function indexToRowCol(i) {
  return { row: Math.floor(i/3) + 1, col: (i % 3) + 1 };
}

function Square({ value, onClick, highlight, disabled }) {
  return (
    <button
      className={`square ${highlight ? 'winning' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={value ? `Cell ${value}` : 'Empty cell'}
    >
      {value}
    </button>
  );
}

function Board({ squares, onPlay, winningLine = [], locked = false }) {
  function renderSquare(i) {
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onPlay(i)}
        highlight={winningLine.includes(i)}
        disabled={locked || Boolean(squares[i])}
      />
    );
  }

  return (
    <div>
      <div className="board-row">{[0,1,2].map(renderSquare)}</div>
      <div className="board-row">{[3,4,5].map(renderSquare)}</div>
      <div className="board-row">{[6,7,8].map(renderSquare)}</div>
    </div>
  );
}

export default function App() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), lastMove: null }]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAsc, setIsAsc] = useState(true);

  const current = history[currentStep];
  const { winner, line } = calculateWinner(current.squares);
  const xIsNext = currentStep % 2 === 0;
  const isDraw = !winner && current.squares.every(Boolean);

  function handlePlay(i) {
    if (winner || current.squares[i]) return;
    const nextSquares = current.squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    const nextHistory = history.slice(0, currentStep + 1).concat([
      { squares: nextSquares, lastMove: i },
    ]);
    setHistory(nextHistory);
    setCurrentStep(nextHistory.length - 1);
  }

  function jumpTo(step) {
    setCurrentStep(step);
  }

  function reset() {
    setHistory([{ squares: Array(9).fill(null), lastMove: null }]);
    setCurrentStep(0);
  }

  const moves = history.map((step, move) => {
    let desc = move ? `Go to move #${move}` : 'Go to game start';
    if (move && step.lastMove != null) {
      const { row, col } = indexToRowCol(step.lastMove);
      desc += ` (r${row}, c${col})`;
    }
    return (
      <li key={move}>
        <button
          onClick={() => jumpTo(move)}
          aria-current={move === currentStep ? 'true' : undefined}
        >
          {move === currentStep ? <strong>{desc}</strong> : desc}
        </button>
      </li>
    );
  });

  const orderedMoves = isAsc ? moves : [...moves].reverse();

  let status = '';
  if (winner) status = `Winner: ${winner}`;
  else if (isDraw) status = 'Draw!';
  else status = `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="game">
      <Board
        squares={current.squares}
        onPlay={handlePlay}
        winningLine={line}
        locked={Boolean(winner)}
      />

      <div className="panel">
        <div className="status">{status}</div>
        <div className="controls">
          <button onClick={() => setIsAsc(v => !v)}>Sort: {isAsc ? 'ASC' : 'DESC'}</button>
          <button onClick={reset}>Reset</button>
        </div>
        <ol>{orderedMoves}</ol>
      </div>
    </div>
  );
}
