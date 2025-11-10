import { useState } from 'react';
import './App.css';

// first winner check 
function calculateWinner(squares) {
  const patterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  
    [0, 4, 8], [2, 4, 6]             
  ];

  for (const [a, b, c] of patterns) {
    if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }

  return { winner: null, line: [] };
}

//convert array to 2D
function indexToRowCol(i) {
  return {
    row: Math.floor(i / 3) + 1,
    col: (i % 3) + 1
  };
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

//gird board
function Board({ squares, onPlay, winningLine = [], locked = false }) {
  function renderSquare(i) {
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onPlay(i)}
        highlight={winningLine.includes(i)}
        disabled={locked || !!squares[i]} 
      />
    );
  }

  return (
    <div>
      
      <div className="board-row">{[0, 1, 2].map(renderSquare)}</div>
      <div className="board-row">{[3, 4, 5].map(renderSquare)}</div>
      <div className="board-row">{[6, 7, 8].map(renderSquare)}</div>
    </div>
  );
}

export default function App() {
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), lastMove: null }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAsc, setIsAsc] = useState(true);

  const current = history[currentStep];
  const { winner, line } = calculateWinner(current.squares);
  const xIsNext = currentStep % 2 === 0;
  const isDraw = !winner && current.squares.every(Boolean);

  function handlePlay(index) {
   // prevent overide 
    if (winner || current.squares[index]) return;

    const next = current.squares.slice();
    next[index] = xIsNext ? 'X' : 'O';

    const updatedHistory = history.slice(0, currentStep + 1).concat([
      { squares: next, lastMove: index }
    ]);

    setHistory(updatedHistory);
    setCurrentStep(updatedHistory.length - 1);
  }

  function jumpTo(step) {
    setCurrentStep(step);
  }

  function reset() {
    setHistory([{ squares: Array(9).fill(null), lastMove: null }]);
    setCurrentStep(0);
  }

  const moves = history.map((step, moveIdx) => {
    let description = moveIdx === 0 ? 'Go to game start' : `Go to move #${moveIdx}`;

    if (moveIdx > 0 && step.lastMove != null) {
      const { row, col } = indexToRowCol(step.lastMove);
      description += ` (r${row}, c${col})`; 
    }

    return (
      <li key={moveIdx}>
        <button
          onClick={() => jumpTo(moveIdx)}
          aria-current={moveIdx === currentStep ? 'true' : undefined}
        >
          {moveIdx === currentStep ? <strong>{description}</strong> : description}
        </button>
      </li>
    );
  });

  const sortedMoves = isAsc ? moves : [...moves].reverse();

  let statusText = '';
  if (winner) statusText = `Winner: ${winner}`;
  else if (isDraw) statusText = 'Draw!';
  else statusText = `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="game">
      <Board
        squares={current.squares}
        onPlay={handlePlay}
        winningLine={line}
        locked={!!winner}
      />

      <div className="panel">
        <div className="status">{statusText}</div>
        <div className="controls">
          <button onClick={() => setIsAsc(val => !val)}>
            Sort: {isAsc ? 'ASC' : 'DESC'}
          </button>
          <button onClick={reset}>Reset</button>
        </div>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
}
