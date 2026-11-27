import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Eraser, Check, Lightbulb, RotateCcw } from 'lucide-react';
import { GameEngineProps } from './types';
import { LOGIC_RIDDLES } from '../data/gameContentBank';
import { soundFX } from '../utils/sound';

// Generate a valid shuffled 9x9 Sudoku board
function createSudokuBoard(difficulty: string) {
  const base = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  const solution = base.map((row) => row.map((v) => digits[v - 1]));

  const removeCount = difficulty === 'Easy' ? 30 : difficulty === 'Medium' ? 42 : 52;
  const puzzle = solution.map((row) => [...row]);
  let removed = 0;
  while (removed < removeCount) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return { solution, puzzle };
}

const MEMORY_SYMBOLS = ['★', '◆', '▲', '●', '✿', '☀', '☾', '⚡', '♫', '⚓', '♛', '☘'];

const NUMBER_PUZZLES = [
  { sequence: ['2', '6', '12', '20', '30', '?'], options: ['40', '42', '44', '38'], answer: '42', rule: 'Differences grow by +2 (+4, +6, +8, +10, +12).' },
  { sequence: ['3', '9', '27', '81', '?'], options: ['162', '243', '216', '324'], answer: '243', rule: 'Multiply each term by 3.' },
  { sequence: ['1', '1', '2', '3', '5', '8', '?'], options: ['11', '12', '13', '15'], answer: '13', rule: 'Fibonacci: sum of the two previous numbers.' },
  { sequence: ['100', '93', '85', '76', '?'], options: ['66', '67', '65', '68'], answer: '66', rule: 'Subtract 7, then 8, then 9, then 10.' },
  { sequence: ['4', '9', '16', '25', '36', '?'], options: ['45', '48', '49', '52'], answer: '49', rule: 'Perfect squares: 2², 3², 4², 5², 6², 7².' },
];

const PATTERN_PUZZLES = [
  {
    title: 'Rotation & Color Progression',
    items: [
      { shape: 'triangle', color: '#FF5A36', rot: 0 },
      { shape: 'triangle', color: '#F59E0B', rot: 90 },
      { shape: 'triangle', color: '#10B981', rot: 180 },
    ],
    options: [
      { shape: 'triangle', color: '#38BDF8', rot: 270, label: 'Blue Rotated 270°' },
      { shape: 'square', color: '#38BDF8', rot: 0, label: 'Blue Square' },
      { shape: 'triangle', color: '#FF5A36', rot: 180, label: 'Coral Rotated 180°' },
    ],
    correctIndex: 0,
    explanation: 'The triangle rotates +90° clockwise each step and cycles color.',
  },
  {
    title: 'Shape Sides Escalation',
    items: [
      { shape: 'triangle', color: '#A78BFA', rot: 0 },
      { shape: 'square', color: '#A78BFA', rot: 0 },
      { shape: 'pentagon', color: '#A78BFA', rot: 0 },
    ],
    options: [
      { shape: 'triangle', color: '#A78BFA', rot: 0, label: '3-sided Triangle' },
      { shape: 'hexagon', color: '#A78BFA', rot: 0, label: '6-sided Hexagon' },
      { shape: 'circle', color: '#A78BFA', rot: 0, label: 'Circle' },
    ],
    correctIndex: 1,
    explanation: 'Each polygon adds one extra side: 3 → 4 → 5 → 6 (Hexagon).',
  },
  {
    title: 'Alternating Twin Pattern',
    items: [
      { shape: 'circle', color: '#10B981', rot: 0 },
      { shape: 'diamond', color: '#FB7185', rot: 0 },
      { shape: 'circle', color: '#10B981', rot: 0 },
    ],
    options: [
      { shape: 'diamond', color: '#FB7185', rot: 0, label: 'Rose Diamond' },
      { shape: 'circle', color: '#10B981', rot: 0, label: 'Mint Circle' },
      { shape: 'square', color: '#F59E0B', rot: 0, label: 'Amber Square' },
    ],
    correctIndex: 0,
    explanation: 'Alternates Mint Circle and Rose Diamond.',
  },
];

const PatternShapeSVG: React.FC<{ shape: string; color: string; rot: number }> = ({ shape, color, rot }) => (
  <svg viewBox="0 0 64 64" className="w-12 h-12" style={{ transform: `rotate(${rot}deg)` }}>
    {shape === 'triangle' && <polygon points="32,10 54,52 10,52" fill={color} />}
    {shape === 'square' && <rect x="14" y="14" width="36" height="36" rx="4" fill={color} />}
    {shape === 'diamond' && <polygon points="32,8 54,32 32,56 10,32" fill={color} />}
    {shape === 'circle' && <circle cx="32" cy="32" r="20" fill={color} />}
    {shape === 'pentagon' && <polygon points="32,8 54,25 46,52 18,52 10,25" fill={color} />}
    {shape === 'hexagon' && <polygon points="32,8 52,20 52,44 32,56 12,44 12,20" fill={color} />}
  </svg>
);

export const BrainPuzzleEngine: React.FC<GameEngineProps> = ({
  game,
  difficulty,
  mode,
  onScoreChange,
  onCharacterReact,
  onAdvanceLevel,
  onFinishGame,
}) => {
  // --- GAME #11: SUDOKU ---
  const initialSudoku = useMemo(() => createSudokuBoard(difficulty), [difficulty]);
  const [board, setBoard] = useState<number[][]>(() => initialSudoku.puzzle.map((r) => [...r]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [sudokuScore, setSudokuScore] = useState(0);

  if (game.id === 11) {
    const { solution, puzzle } = initialSudoku;
    const filledCells = board.flat().filter((v) => v !== 0).length;

    const placeNumber = (num: number) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;
      if (puzzle[r][c] !== 0) return;

      if (num === 0) {
        const next = board.map((row) => [...row]);
        next[r][c] = 0;
        setBoard(next);
        return;
      }

      if (solution[r][c] === num) {
        soundFX.correct();
        const next = board.map((row) => [...row]);
        next[r][c] = num;
        setBoard(next);
        const nextScore = sudokuScore + 10;
        setSudokuScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', `Clean placement at row ${r + 1}, col ${c + 1}!`);

        if (next.flat().every((v) => v !== 0)) {
          const finalPts = nextScore + Math.max(0, 50 - mistakes * 10);
          onFinishGame(finalPts, 'Completed the 9×9 Sudoku grid!', [`Mistakes: ${mistakes}`]);
        }
      } else {
        soundFX.wrong();
        setMistakes((m) => m + 1);
        onCharacterReact('oops', 'Conflict in that row, column, or 3×3 box!');
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
          <span>PROGRESS: {filledCells} / 81 CELLS</span>
          <span className={mistakes > 2 ? 'text-rose-400' : ''}>MISTAKES: {mistakes}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-4 sm:p-6 shadow-xl flex flex-col items-center gap-5">
          <div className="grid grid-cols-9 border-2 border-slate-900 bg-slate-900 gap-[1px] select-none">
            {board.map((row, r) =>
              row.map((val, c) => {
                const isGiven = puzzle[r][c] !== 0;
                const isSel = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const thickRight = c === 2 || c === 5 ? 'border-r-2 border-r-slate-900' : '';
                const thickBottom = r === 2 || r === 5 ? 'border-b-2 border-b-slate-900' : '';
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      soundFX.click();
                      setSelectedCell([r, c]);
                    }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-mono text-sm sm:text-base font-bold transition-colors cursor-pointer ${thickRight} ${thickBottom} ${
                      isSel
                        ? 'bg-[#FF5A36] text-white'
                        : isGiven
                        ? 'bg-slate-200 text-slate-900'
                        : val !== 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-white hover:bg-orange-50 text-slate-800'
                    }`}
                  >
                    {val !== 0 ? val : ''}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => placeNumber(n)}
                className="tactile-btn w-10 h-10 rounded-lg bg-[#0F1117] hover:bg-[#23283A] text-white font-mono font-bold cursor-pointer"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => placeNumber(0)}
              aria-label="Erase cell"
              className="tactile-btn px-3 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <Eraser className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #12: MEMORY MATCH ---
  const [memLevel, setMemLevel] = useState(1);
  const pairCount = memLevel === 1 ? 6 : memLevel === 2 ? 8 : 10;
  const [cards, setCards] = useState(() => {
    const picks = MEMORY_SYMBOLS.slice(0, 6);
    return [...picks, ...picks].sort(() => Math.random() - 0.5).map((sym, idx) => ({ id: idx, sym, matched: false }));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [memScore, setMemScore] = useState(0);
  const [turnPlayer, setTurnPlayer] = useState<1 | 2>(1);
  const [pScores, setPScores] = useState({ p1: 0, p2: 0 });

  const startMemoryLevel = (lvl: number) => {
    const count = lvl === 1 ? 6 : lvl === 2 ? 8 : 10;
    const picks = MEMORY_SYMBOLS.slice(0, count);
    setCards([...picks, ...picks].sort(() => Math.random() - 0.5).map((sym, idx) => ({ id: idx, sym, matched: false })));
    setFlipped([]);
    setMemLevel(lvl);
  };

  if (game.id === 12) {
    const flipCard = (idx: number) => {
      if (flipped.length >= 2 || flipped.includes(idx) || cards[idx].matched) return;
      soundFX.flip();
      const nextFlipped = [...flipped, idx];
      setFlipped(nextFlipped);

      if (nextFlipped.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = nextFlipped;
        if (cards[a].sym === cards[b].sym) {
          setTimeout(() => {
            soundFX.correct();
            const updated = cards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
            setCards(updated);
            setFlipped([]);
            const nextScore = memScore + 10;
            setMemScore(nextScore);
            onScoreChange(nextScore);
            if (mode === '2-Player') {
              setPScores((ps) => ({
                ...ps,
                [turnPlayer === 1 ? 'p1' : 'p2']: ps[turnPlayer === 1 ? 'p1' : 'p2'] + 10,
              }));
            }
            onCharacterReact('correct', 'Exact pair matched! +10 pts');

            if (updated.every((c) => c.matched)) {
              if (memLevel < 3) {
                const nextLvl = memLevel + 1;
                onAdvanceLevel(nextLvl, `Level ${nextLvl}: Deeper Deck`, `Expanding grid to ${nextLvl === 2 ? 16 : 20} cards!`);
                setTimeout(() => startMemoryLevel(nextLvl), 450);
              } else {
                const bonus = Math.max(10, 60 - moves);
                onFinishGame(nextScore + bonus, `Cleared all 3 Memory Match decks!`, [`Total Moves: ${moves}`, `Efficiency Bonus: +${bonus}`]);
              }
            }
          }, 320);
        } else {
          setTimeout(() => {
            setFlipped([]);
            if (mode === '2-Player') setTurnPlayer((tp) => (tp === 1 ? 2 : 1));
            onCharacterReact('thinking', 'Keep track of those positions!');
          }, 680);
        }
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
          <span>LEVEL {memLevel} / 3 · {pairCount} PAIRS</span>
          <span>
            {mode === '2-Player'
              ? `TURN: PLAYER ${turnPlayer} (P1: ${pScores.p1} · P2: ${pScores.p2})`
              : `MOVES: ${moves}`}
          </span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] p-5 sm:p-7 shadow-xl">
          <div className={`grid gap-3 ${memLevel === 3 ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-4'}`}>
            {cards.map((card, idx) => {
              const isOpen = card.matched || flipped.includes(idx);
              return (
                <motion.button
                  key={`${memLevel}-${card.id}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => flipCard(idx)}
                  className={`aspect-square rounded-xl font-display text-2xl sm:text-3xl font-bold flex items-center justify-center border-2 transition-all cursor-pointer ${
                    card.matched
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                      : isOpen
                      ? 'bg-white border-[#FF5A36] text-[#0F1117]'
                      : 'bg-[#181B26] border-[#2C3246] text-white/30 hover:border-[#FF5A36]'
                  }`}
                >
                  {isOpen ? card.sym : '?'}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #13: NUMBER PUZZLE ---
  const [npIdx, setNpIdx] = useState(0);
  const [npPicked, setNpPicked] = useState<string | null>(null);
  const [npScore, setNpScore] = useState(0);

  if (game.id === 13) {
    const cur = NUMBER_PUZZLES[npIdx];
    const pickNp = (opt: string) => {
      if (npPicked) return;
      setNpPicked(opt);
      if (opt === cur.answer) {
        soundFX.correct();
        const nextScore = npScore + 15;
        setNpScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', cur.rule);
      } else {
        soundFX.wrong();
        onCharacterReact('oops', `Rule: ${cur.rule}`);
      }
    };

    const nextNp = () => {
      if (npIdx + 1 >= NUMBER_PUZZLES.length) {
        onFinishGame(npScore, 'Solved all numerical sequences!', [`Score: ${npScore}`]);
        return;
      }
      if (npIdx === 1) onAdvanceLevel(2, 'Level 2: Geometric Growth', 'Higher-order ratios ahead!');
      if (npIdx === 3) onAdvanceLevel(3, 'Level 3: Grandmaster Sequences', 'Final analytical sprint!');
      setNpIdx(npIdx + 1);
      setNpPicked(null);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>SEQUENCE {npIdx + 1} / {NUMBER_PUZZLES.length}</span>
          <span>SCORE: {npScore}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {cur.sequence.map((item, idx) => (
              <div
                key={idx}
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono text-xl font-bold border-2 ${
                  item === '?'
                    ? 'bg-orange-50 border-[#FF5A36] text-[#FF5A36]'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {item === '?' && npPicked ? npPicked : item}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cur.options.map((opt) => {
              let cls = 'bg-white border-slate-200 hover:border-[#FF5A36] text-slate-900';
              if (npPicked) {
                if (opt === cur.answer) cls = 'bg-emerald-600 border-emerald-600 text-white';
                else if (opt === npPicked) cls = 'bg-rose-600 border-rose-600 text-white';
              }
              return (
                <button
                  key={opt}
                  onClick={() => pickNp(opt)}
                  disabled={!!npPicked}
                  className={`tactile-btn py-3.5 rounded-xl border font-mono font-bold text-lg cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {npPicked && (
            <div className="p-4 rounded-xl bg-slate-100 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-700">{cur.rule}</p>
              <button
                onClick={nextNp}
                className="tactile-btn shrink-0 px-4 py-2 rounded-lg bg-[#FF5A36] text-white text-sm font-semibold cursor-pointer"
              >
                {npIdx + 1 >= NUMBER_PUZZLES.length ? 'Finish' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GAME #14: PATTERN MASTER ---
  const [patIdx, setPatIdx] = useState(0);
  const [patChoice, setPatChoice] = useState<number | null>(null);
  const [patScore, setPatScore] = useState(0);

  if (game.id === 14) {
    const cur = PATTERN_PUZZLES[patIdx];
    const choosePat = (i: number) => {
      if (patChoice !== null) return;
      setPatChoice(i);
      if (i === cur.correctIndex) {
        soundFX.correct();
        const nextScore = patScore + 15;
        setPatScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', cur.explanation);
      } else {
        soundFX.wrong();
        onCharacterReact('oops', cur.explanation);
      }
    };

    const nextPat = () => {
      if (patIdx + 1 >= PATTERN_PUZZLES.length) {
        onFinishGame(patScore, 'Mastered all visual pattern stages!', [`Score: ${patScore}`]);
        return;
      }
      onAdvanceLevel(patIdx + 2, `Level ${patIdx + 2}: ${PATTERN_PUZZLES[patIdx + 1].title}`, 'Decode the next visual transformation!');
      setPatIdx(patIdx + 1);
      setPatChoice(null);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>PATTERN {patIdx + 1} / {PATTERN_PUZZLES.length}</span>
          <span>{cur.title}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-center gap-4">
            {cur.items.map((it, idx) => (
              <div key={idx} className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                <PatternShapeSVG {...it} />
              </div>
            ))}
            <div className="w-20 h-20 rounded-xl bg-orange-50 border-2 border-dashed border-[#FF5A36] flex items-center justify-center font-display text-2xl font-bold text-[#FF5A36]">
              ?
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cur.options.map((opt, idx) => {
              let cls = 'bg-white border-slate-200 hover:border-[#FF5A36]';
              if (patChoice !== null) {
                if (idx === cur.correctIndex) cls = 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-400';
                else if (idx === patChoice) cls = 'bg-rose-50 border-rose-500';
              }
              return (
                <button
                  key={idx}
                  onClick={() => choosePat(idx)}
                  disabled={patChoice !== null}
                  className={`tactile-btn p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer ${cls}`}
                >
                  <PatternShapeSVG shape={opt.shape} color={opt.color} rot={opt.rot} />
                  <span className="text-xs font-semibold text-slate-700">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {patChoice !== null && (
            <div className="p-4 rounded-xl bg-slate-100 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-700">{cur.explanation}</p>
              <button
                onClick={nextPat}
                className="tactile-btn shrink-0 px-4 py-2 rounded-lg bg-[#FF5A36] text-white text-sm font-semibold cursor-pointer"
              >
                {patIdx + 1 >= PATTERN_PUZZLES.length ? 'Finish' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GAME #15: LOGIC CHALLENGE ---
  const [logIdx, setLogIdx] = useState(0);
  const [logChoice, setLogChoice] = useState<number | null>(null);
  const [crossed, setCrossed] = useState<number[]>([]);
  const [logScore, setLogScore] = useState(0);

  if (game.id === 15) {
    const cur = LOGIC_RIDDLES[logIdx];
    const toggleCross = (i: number) => {
      setCrossed((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
    };

    const submitLogic = (i: number) => {
      if (logChoice !== null) return;
      setLogChoice(i);
      if (i === cur.correctIndex) {
        soundFX.correct();
        const nextScore = logScore + 20;
        setLogScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', cur.explanation);
      } else {
        soundFX.wrong();
        onCharacterReact('oops', cur.explanation);
      }
    };

    const nextLogic = () => {
      if (logIdx + 1 >= LOGIC_RIDDLES.length) {
        onFinishGame(logScore, 'Completed all deductive reasoning cases!', [`Final Score: ${logScore}`]);
        return;
      }
      onAdvanceLevel(logIdx + 2, `Case ${logIdx + 2}: Deeper Deduction`, 'Eliminate impossible choices!');
      setLogIdx(logIdx + 1);
      setLogChoice(null);
      setCrossed([]);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>LOGIC CASE {logIdx + 1} / {LOGIC_RIDDLES.length}</span>
          <span>CLICK CLUES TO CHECK OFF</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 sm:p-8 shadow-xl space-y-5">
          <h3 className="text-lg font-display font-bold leading-snug">{cur.question}</h3>

          <div className="space-y-2">
            {cur.clues.map((clue, idx) => (
              <button
                key={idx}
                onClick={() => toggleCross(idx)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs flex items-center gap-2 cursor-pointer ${
                  crossed.includes(idx)
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through'
                    : 'bg-amber-50 border-amber-200 text-slate-800'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>{clue}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cur.options.map((opt, idx) => {
              let cls = 'bg-white border-slate-200 hover:border-[#FF5A36] text-slate-900';
              if (logChoice !== null) {
                if (idx === cur.correctIndex) cls = 'bg-emerald-600 border-emerald-600 text-white';
                else if (idx === logChoice) cls = 'bg-rose-600 border-rose-600 text-white';
              }
              return (
                <button
                  key={opt}
                  onClick={() => submitLogic(idx)}
                  disabled={logChoice !== null}
                  className={`tactile-btn py-3 px-4 rounded-xl border font-semibold text-sm cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {logChoice !== null && (
            <div className="p-4 rounded-xl bg-slate-100 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-700">{cur.explanation}</p>
              <button
                onClick={nextLogic}
                className="tactile-btn shrink-0 px-4 py-2 rounded-lg bg-[#FF5A36] text-white text-sm font-semibold cursor-pointer"
              >
                {logIdx + 1 >= LOGIC_RIDDLES.length ? 'Finish' : 'Next Case'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GAME #16: FIND THE DIFFERENCE ---
  const [diffLevel, setDiffLevel] = useState(1);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [diffScore, setDiffScore] = useState(0);

  const diffsForLevel = useMemo(() => {
    if (diffLevel === 1) {
      return [
        { id: 'sun', x: 190, y: 38, label: 'Sun Color' },
        { id: 'window', x: 86, y: 98, label: 'Missing Window' },
        { id: 'chimney', x: 112, y: 52, label: 'Chimney' },
        { id: 'tree', x: 185, y: 120, label: 'Tree Fruit' },
      ];
    }
    return [
      { id: 'planet', x: 50, y: 42, label: 'Ring on Planet' },
      { id: 'star', x: 195, y: 34, label: 'Extra Star' },
      { id: 'antenna', x: 120, y: 42, label: 'Satellite Dish' },
      { id: 'port', x: 145, y: 112, label: 'Porthole' },
      { id: 'flag', x: 180, y: 132, label: 'Moon Flag' },
    ];
  }, [diffLevel]);

  const hitDifference = (id: string) => {
    if (foundIds.includes(id)) return;
    soundFX.correct();
    const updated = [...foundIds, id];
    setFoundIds(updated);
    const nextScore = diffScore + 15;
    setDiffScore(nextScore);
    onScoreChange(nextScore);
    onCharacterReact('correct', `Spotted ${id}! (${updated.length}/${diffsForLevel.length})`);

    if (updated.length === diffsForLevel.length) {
      if (diffLevel === 1) {
        onAdvanceLevel(2, 'Level 2: Lunar Outpost', '5 subtler differences hidden in space!');
        setTimeout(() => {
          setDiffLevel(2);
          setFoundIds([]);
        }, 500);
      } else {
        onFinishGame(nextScore + 20, 'Found every hidden difference across both scenes!', [`Total Found: 9`]);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
        <span>SCENE {diffLevel} / 2 · FOUND {foundIds.length} / {diffsForLevel.length}</span>
        <span>TAP DIFFERENCES ON THE RIGHT SCENE</span>
      </div>

      <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Reference Scene */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Original Scene</div>
            <svg viewBox="0 0 240 170" className="w-full rounded-xl border border-slate-300 bg-sky-100">
              {diffLevel === 1 ? (
                <>
                  <rect x="0" y="130" width="240" height="40" fill="#4ADE80" />
                  <circle cx="190" cy="38" r="18" fill="#FBBF24" />
                  <rect x="55" y="75" width="75" height="60" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
                  <polygon points="48,75 92,42 136,75" fill="#EF4444" />
                  <rect x="106" y="45" width="12" height="20" fill="#94A3B8" />
                  <rect x="78" y="90" width="16" height="16" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.5" />
                  <rect x="98" y="105" width="16" height="30" fill="#92400E" />
                  <rect x="178" y="95" width="14" height="40" fill="#78350F" />
                  <circle cx="185" cy="82" r="24" fill="#16A34A" />
                </>
              ) : (
                <>
                  <rect width="240" height="170" fill="#0F172A" />
                  <rect x="0" y="132" width="240" height="38" fill="#64748B" />
                  <circle cx="50" cy="42" r="16" fill="#F97316" />
                  <circle cx="195" cy="34" r="3" fill="#FFF" />
                  <rect x="75" y="80" width="90" height="54" rx="8" fill="#E2E8F0" />
                  <line x1="120" y1="80" x2="120" y2="48" stroke="#94A3B8" strokeWidth="3" />
                  <circle cx="120" cy="44" r="7" fill="#38BDF8" />
                  <circle cx="105" cy="108" r="10" fill="#38BDF8" />
                  <circle cx="145" cy="108" r="10" fill="#38BDF8" />
                </>
              )}
            </svg>
          </div>

          {/* Right Interactive Scene */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#FF5A36] uppercase tracking-wide">Tap Differences Here</div>
            <svg viewBox="0 0 240 170" className="w-full rounded-xl border-2 border-[#FF5A36]/40 bg-sky-100 cursor-crosshair">
              {diffLevel === 1 ? (
                <>
                  <rect x="0" y="130" width="240" height="40" fill="#4ADE80" />
                  {/* Diff 1: Coral sun */}
                  <circle cx="190" cy="38" r="18" fill="#FB7185" onClick={() => hitDifference('sun')} />
                  <rect x="55" y="75" width="75" height="60" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
                  <polygon points="48,75 92,42 136,75" fill="#EF4444" />
                  {/* Diff 2: Missing chimney hotspot */}
                  <rect x="102" y="42" width="22" height="22" fill="transparent" onClick={() => hitDifference('chimney')} />
                  {/* Diff 3: Missing window hotspot */}
                  <rect x="74" y="88" width="22" height="22" fill="transparent" onClick={() => hitDifference('window')} />
                  <rect x="98" y="105" width="16" height="30" fill="#92400E" />
                  <rect x="178" y="95" width="14" height="40" fill="#78350F" />
                  <circle cx="185" cy="82" r="24" fill="#16A34A" />
                  {/* Diff 4: Apple on tree */}
                  <circle cx="185" cy="88" r="5" fill="#EF4444" onClick={() => hitDifference('tree')} />
                </>
              ) : (
                <>
                  <rect width="240" height="170" fill="#0F172A" />
                  <rect x="0" y="132" width="240" height="38" fill="#64748B" />
                  {/* Diff 1: Planet ring */}
                  <g onClick={() => hitDifference('planet')}>
                    <circle cx="50" cy="42" r="16" fill="#F97316" />
                    <ellipse cx="50" cy="42" rx="26" ry="6" fill="none" stroke="#FDE047" strokeWidth="2.5" />
                  </g>
                  {/* Diff 2: Extra bright star */}
                  <circle cx="195" cy="34" r="9" fill="#FDE047" onClick={() => hitDifference('star')} />
                  <rect x="75" y="80" width="90" height="54" rx="8" fill="#E2E8F0" />
                  {/* Diff 3: Missing dish */}
                  <circle cx="120" cy="44" r="14" fill="transparent" onClick={() => hitDifference('antenna')} />
                  <circle cx="105" cy="108" r="10" fill="#38BDF8" />
                  {/* Diff 4: Amber porthole */}
                  <circle cx="145" cy="108" r="11" fill="#F59E0B" onClick={() => hitDifference('port')} />
                  {/* Diff 5: Moon flag */}
                  <g onClick={() => hitDifference('flag')}>
                    <line x1="180" y1="134" x2="180" y2="108" stroke="#FFF" strokeWidth="2" />
                    <rect x="180" y="108" width="16" height="10" fill="#FF5A36" />
                  </g>
                </>
              )}

              {diffsForLevel
                .filter((d) => foundIds.includes(d.id))
                .map((d) => (
                  <circle
                    key={d.id}
                    cx={d.x}
                    cy={d.y - (diffLevel === 1 && d.id === 'tree' ? 32 : 0)}
                    r="16"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                  />
                ))}
            </svg>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {diffsForLevel.map((d) => (
            <span
              key={d.id}
              className={`text-xs font-mono px-2.5 py-1 rounded-md ${
                foundIds.includes(d.id) ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {foundIds.includes(d.id) ? `✓ ${d.label}` : '???'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
