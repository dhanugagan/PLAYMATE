import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { GameEngineProps } from './types';
import { soundFX } from '../utils/sound';

// Procedural Maze Generator (DFS Backtracker)
function generateMaze(size: number) {
  const walls = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ top: true, right: true, bottom: true, left: true, visited: false }))
  );
  const stack: [number, number][] = [[0, 0]];
  walls[0][0].visited = true;

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const neighbors: [number, number, 'top' | 'right' | 'bottom' | 'left', 'top' | 'right' | 'bottom' | 'left'][] = [];
    if (r > 0 && !walls[r - 1][c].visited) neighbors.push([r - 1, c, 'top', 'bottom']);
    if (c < size - 1 && !walls[r][c + 1].visited) neighbors.push([r, c + 1, 'right', 'left']);
    if (r < size - 1 && !walls[r + 1][c].visited) neighbors.push([r + 1, c, 'bottom', 'top']);
    if (c > 0 && !walls[r][c - 1].visited) neighbors.push([r, c - 1, 'left', 'right']);

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const [nr, nc, d1, d2] = neighbors[Math.floor(Math.random() * neighbors.length)];
      walls[r][c][d1] = false;
      walls[nr][nc][d2] = false;
      walls[nr][nc].visited = true;
      stack.push([nr, nc]);
    }
  }
  return walls;
}

export const ArcadeEngine: React.FC<GameEngineProps> = ({
  game,
  difficulty,
  onScoreChange,
  onCharacterReact,
  onAdvanceLevel,
  onFinishGame,
}) => {
  // --- GAME #29: REACTION SPEED TEST ---
  const [rxState, setRxState] = useState<'waiting' | 'ready' | 'go' | 'early' | 'done'>('waiting');
  const [rxTimes, setRxTimes] = useState<number[]>([]);
  const goTimeRef = useRef<number>(0);
  const rxTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rxTimerRef.current) clearTimeout(rxTimerRef.current);
    };
  }, []);

  if (game.id === 29) {
    const startTrial = () => {
      soundFX.click();
      setRxState('ready');
      const delay = 1100 + Math.random() * 2100;
      rxTimerRef.current = window.setTimeout(() => {
        goTimeRef.current = performance.now();
        setRxState('go');
        soundFX.flip();
      }, delay);
    };

    const handlePadTap = () => {
      if (rxState === 'waiting' || rxState === 'early') {
        startTrial();
        return;
      }
      if (rxState === 'ready') {
        if (rxTimerRef.current) clearTimeout(rxTimerRef.current);
        soundFX.wrong();
        setRxState('early');
        onCharacterReact('oops', 'False start! Wait until it flashes Mint Green!');
        return;
      }
      if (rxState === 'go') {
        const ms = Math.round(performance.now() - goTimeRef.current);
        soundFX.correct();
        const nextTimes = [...rxTimes, ms];
        setRxTimes(nextTimes);
        const pts = nextTimes.reduce((acc, t) => acc + Math.max(5, Math.round((500 - t) / 18)), 0);
        onScoreChange(pts);
        onCharacterReact('correct', `${ms} ms reaction!`);

        if (nextTimes.length >= 5) {
          setRxState('done');
          const avg = Math.round(nextTimes.reduce((a, b) => a + b, 0) / 5);
          setTimeout(() => {
            onFinishGame(pts, `5-attempt average: ${avg} ms!`, nextTimes.map((t, i) => `Trial ${i + 1}: ${t} ms`));
          }, 700);
        } else {
          setRxState('waiting');
        }
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>TRIAL {Math.min(5, rxTimes.length + 1)} / 5</span>
          <span>LOG: {rxTimes.map((t) => `${t}ms`).join(' · ') || 'READY'}</span>
        </div>

        <button
          onClick={handlePadTap}
          className={`w-full h-72 rounded-2xl border-4 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer select-none ${
            rxState === 'go'
              ? 'bg-emerald-500 border-emerald-300 text-[#0F1117]'
              : rxState === 'ready'
              ? 'bg-rose-600 border-rose-400 text-white'
              : rxState === 'early'
              ? 'bg-amber-500 border-amber-300 text-[#0F1117]'
              : 'bg-[#1A1F2E] border-white/15 text-white hover:border-[#FF5A36]'
          }`}
        >
          <Zap className="w-10 h-10" />
          <div className="text-2xl sm:text-3xl font-display font-bold">
            {rxState === 'waiting' && (rxTimes.length === 0 ? 'Tap to Start Trial 1' : 'Tap for Next Trial')}
            {rxState === 'ready' && 'Wait for Green…'}
            {rxState === 'go' && 'TAP NOW!'}
            {rxState === 'early' && 'Too Early! Tap to Retry'}
            {rxState === 'done' && 'All 5 Complete!'}
          </div>
        </button>
      </div>
    );
  }

  // --- GAME #30: TAP CHALLENGE ---
  const [tapTime, setTapTime] = useState(15);
  const [tapCount, setTapCount] = useState(0);
  const [tapPos, setTapPos] = useState({ x: 50, y: 50, golden: false });
  const [tapStarted, setTapStarted] = useState(false);

  useEffect(() => {
    if (game.id !== 30 || !tapStarted) return;
    const t = setInterval(() => {
      setTapTime((s) => {
        if (s <= 1) {
          clearInterval(t);
          onFinishGame(tapCount, `15-second Tap Challenge complete!`, [`Valid Hits: ${tapCount}`]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [game.id, tapStarted, tapCount, onFinishGame]);

  if (game.id === 30) {
    const hitTarget = () => {
      if (!tapStarted) setTapStarted(true);
      soundFX.click();
      const gain = tapPos.golden ? 3 : 1;
      const next = tapCount + gain;
      setTapCount(next);
      onScoreChange(next);
      setTapPos({
        x: 15 + Math.random() * 70,
        y: 18 + Math.random() * 64,
        golden: Math.random() > 0.78,
      });
    };

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>CLOCK: {tapTime}s</span>
          <span>SCORE: {tapCount} HITS</span>
        </div>

        <div className="relative h-80 rounded-2xl bg-[#181C28] border border-white/15 overflow-hidden select-none">
          <button
            onClick={hitTarget}
            style={{ left: `${tapPos.x}%`, top: `${tapPos.y}%`, transform: 'translate(-50%, -50%)' }}
            className={`absolute w-20 h-20 rounded-full font-display font-bold text-sm shadow-xl cursor-pointer transition-transform active:scale-90 ${
              tapPos.golden
                ? 'bg-amber-400 text-[#0F1117] ring-4 ring-amber-200/40'
                : 'bg-[#FF5A36] text-white ring-4 ring-[#FF5A36]/30'
            }`}
          >
            {tapPos.golden ? '+3' : 'TAP'}
          </button>
        </div>
      </div>
    );
  }

  // --- GAME #31: COLOR MATCH (Stroop) ---
  const COLOR_ITEMS = useMemo(
    () => [
      { name: 'RED', hex: '#EF4444' },
      { name: 'BLUE', hex: '#3B82F6' },
      { name: 'GREEN', hex: '#10B981' },
      { name: 'AMBER', hex: '#F59E0B' },
    ],
    []
  );
  const [cmRound, setCmRound] = useState(0);
  const [cmWordIdx, setCmWordIdx] = useState(0);
  const [cmInkIdx, setCmInkIdx] = useState(1);
  const [cmScore, setCmScore] = useState(0);

  if (game.id === 31) {
    const total = 10;
    const pickColor = (idx: number) => {
      const nextRound = cmRound + 1;
      let nextScore = cmScore;
      if (idx === cmInkIdx) {
        soundFX.correct();
        nextScore += 10;
        setCmScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', 'Spot-on ink focus! +10 pts');
      } else {
        soundFX.wrong();
        onCharacterReact('oops', 'Watch the INK color, not the word!');
      }

      if (nextRound >= total) {
        onFinishGame(nextScore, `Completed ${total} Stroop Color Match rounds!`, [`Score: ${nextScore}`]);
        return;
      }
      if (nextRound === 4) onAdvanceLevel(2, 'Level 2: Stroop Overdrive', 'Stay sharp—speed increasing!');
      if (nextRound === 7) onAdvanceLevel(3, 'Level 3: Chromatic Finale', 'Final 3 color illusions!');
      setCmRound(nextRound);
      setCmWordIdx(Math.floor(Math.random() * 4));
      setCmInkIdx(Math.floor(Math.random() * 4));
    };

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>ROUND {cmRound + 1} / {total}</span>
          <span>TAP THE INK COLOR (IGNORE WORD MEANING)</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-8 shadow-xl text-center space-y-8">
          <div
            className="text-5xl font-display font-extrabold tracking-wider"
            style={{ color: COLOR_ITEMS[cmInkIdx].hex }}
          >
            {COLOR_ITEMS[cmWordIdx].name}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {COLOR_ITEMS.map((c, idx) => (
              <button
                key={c.name}
                onClick={() => pickColor(idx)}
                className="tactile-btn py-4 rounded-xl text-white font-display font-bold text-base shadow cursor-pointer"
                style={{ backgroundColor: c.hex }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #32: NUMBER RUSH ---
  const [nrRound, setNrRound] = useState(0);
  const [nrStreak, setNrStreak] = useState(0);
  const [nrScore, setNrScore] = useState(0);
  const nrProblem = useMemo(() => {
    const a = Math.floor(Math.random() * (difficulty === 'Hard' ? 40 : 20)) + 2;
    const b = Math.floor(Math.random() * 14) + 2;
    const op = nrRound % 3 === 0 ? '+' : nrRound % 3 === 1 ? '-' : '×';
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const opts = new Set<number>([ans]);
    while (opts.size < 4) opts.add(ans + (Math.floor(Math.random() * 9) - 4));
    return { text: `${a} ${op} ${b}`, ans, opts: Array.from(opts).sort(() => Math.random() - 0.5) };
  }, [nrRound, difficulty]);

  if (game.id === 32) {
    const pickNr = (val: number) => {
      let nextScore = nrScore;
      if (val === nrProblem.ans) {
        soundFX.correct();
        const mult = Math.min(3, 1 + Math.floor(nrStreak / 2));
        nextScore += 10 * mult;
        setNrScore(nextScore);
        setNrStreak((s) => s + 1);
        onScoreChange(nextScore);
        onCharacterReact('correct', `Rush ×${mult}! +${10 * mult} pts`);
      } else {
        soundFX.wrong();
        setNrStreak(0);
        onCharacterReact('oops', `Answer was ${nrProblem.ans}`);
      }

      if (nrRound + 1 >= 9) {
        onFinishGame(nextScore, 'Number Rush blitz complete!', [`Score: ${nextScore}`]);
        return;
      }
      if (nrRound === 2) onAdvanceLevel(2, 'Level 2: Rush Multiplier', 'Keep your streak burning!');
      if (nrRound === 5) onAdvanceLevel(3, 'Level 3: Turbo Overdrive', 'Final 3 equations!');
      setNrRound((r) => r + 1);
    };

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>EQUATION {nrRound + 1} / 9</span>
          <span>STREAK: {nrStreak}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-8 shadow-xl text-center space-y-6">
          <div className="text-4xl sm:text-5xl font-mono font-bold">{nrProblem.text} = ?</div>
          <div className="grid grid-cols-2 gap-3">
            {nrProblem.opts.map((opt) => (
              <button
                key={opt}
                onClick={() => pickNr(opt)}
                className="tactile-btn py-4 rounded-xl bg-[#0F1117] hover:bg-[#FF5A36] text-white font-mono text-2xl font-bold cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #33: QUICK REFLEX ---
  const [qrWave, setQrWave] = useState(0);
  const [qrScore, setQrScore] = useState(0);
  const [qrCells, setQrCells] = useState<('target' | 'decoy' | null)[]>(() => {
    const arr: ('target' | 'decoy' | null)[] = Array(9).fill(null);
    arr[2] = 'target';
    arr[5] = 'decoy';
    return arr;
  });

  if (game.id === 33) {
    const tapReflex = (idx: number) => {
      const kind = qrCells[idx];
      if (!kind) return;
      let nextScore = qrScore;
      if (kind === 'target') {
        soundFX.correct();
        nextScore += 10;
        setQrScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', 'Clean target hit! +10');
      } else {
        soundFX.wrong();
        nextScore = Math.max(0, nextScore - 5);
        setQrScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('oops', 'Decoy trap! -5 pts');
      }

      const nextWave = qrWave + 1;
      if (nextWave >= 10) {
        onFinishGame(nextScore, 'Quick Reflex waves cleared!', [`Final Score: ${nextScore}`]);
        return;
      }
      if (nextWave === 4) onAdvanceLevel(2, 'Wave 2: Faster Decoys', 'Only tap the Coral Star ★!');
      setQrWave(nextWave);
      const nextGrid: ('target' | 'decoy' | null)[] = Array(9).fill(null);
      const tPos = Math.floor(Math.random() * 9);
      let dPos = Math.floor(Math.random() * 9);
      if (dPos === tPos) dPos = (tPos + 3) % 9;
      nextGrid[tPos] = 'target';
      nextGrid[dPos] = 'decoy';
      setQrCells(nextGrid);
    };

    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>WAVE {qrWave + 1} / 10</span>
          <span className="text-[#FF5A36]">TAP ★ · AVOID ✕</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] p-5 shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            {qrCells.map((kind, i) => (
              <button
                key={i}
                onClick={() => tapReflex(i)}
                className={`aspect-square rounded-xl border-2 text-3xl font-bold flex items-center justify-center cursor-pointer ${
                  kind === 'target'
                    ? 'bg-[#FF5A36] border-[#FF5A36] text-white'
                    : kind === 'decoy'
                    ? 'bg-slate-800 border-slate-800 text-rose-400'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                {kind === 'target' ? '★' : kind === 'decoy' ? '✕' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #34: MAZE RUNNER ---
  const [mazeLevel, setMazeLevel] = useState(1);
  const mazeSize = mazeLevel === 1 ? 6 : mazeLevel === 2 ? 8 : 10;
  const maze = useMemo(() => generateMaze(mazeSize), [mazeSize]);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [mazeScore, setMazeScore] = useState(0);

  const movePlayer = (dr: number, dc: number) => {
    const [r, c] = pos;
    const cell = maze[r][c];
    if (dr === -1 && cell.top) return;
    if (dr === 1 && cell.bottom) return;
    if (dc === -1 && cell.left) return;
    if (dc === 1 && cell.right) return;

    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= mazeSize || nc < 0 || nc >= mazeSize) return;
    soundFX.click();
    setPos([nr, nc]);

    if (nr === mazeSize - 1 && nc === mazeSize - 1) {
      soundFX.correct();
      const nextScore = mazeScore + 30;
      setMazeScore(nextScore);
      onScoreChange(nextScore);
      if (mazeLevel < 3) {
        const nextLvl = mazeLevel + 1;
        onAdvanceLevel(nextLvl, `Maze ${nextLvl}: Deeper Labyrinth`, `${nextLvl === 2 ? '8×8' : '10×10'} grid unlocked!`);
        setTimeout(() => {
          setMazeLevel(nextLvl);
          setPos([0, 0]);
        }, 450);
      } else {
        onFinishGame(nextScore + 20, 'Escaped all 3 procedural mazes!', [`Mazes Cleared: 3`]);
      }
    }
  };

  useEffect(() => {
    if (game.id !== 34) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); movePlayer(-1, 0); }
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); movePlayer(1, 0); }
      if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); movePlayer(0, -1); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); movePlayer(0, 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
        <span>MAZE LEVEL {mazeLevel} / 3 ({mazeSize}×{mazeSize})</span>
        <span>USE ARROWS / WASD OR D-PAD</span>
      </div>

      <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-5 shadow-xl flex flex-col sm:flex-row items-center justify-center gap-6">
        <div
          className="grid border-2 border-slate-900 bg-white"
          style={{ gridTemplateColumns: `repeat(${mazeSize}, minmax(0, 1fr))`, width: 'min(320px, 80vw)', height: 'min(320px, 80vw)' }}
        >
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = pos[0] === r && pos[1] === c;
              const isExit = r === mazeSize - 1 && c === mazeSize - 1;
              return (
                <div
                  key={`${r}-${c}`}
                  className="relative flex items-center justify-center"
                  style={{
                    borderTop: cell.top ? '2px solid #0F172A' : '1px solid transparent',
                    borderRight: cell.right ? '2px solid #0F172A' : '1px solid transparent',
                    borderBottom: cell.bottom ? '2px solid #0F172A' : '1px solid transparent',
                    borderLeft: cell.left ? '2px solid #0F172A' : '1px solid transparent',
                  }}
                >
                  {isExit && <span className="text-emerald-600 font-bold text-sm">⚑</span>}
                  {isPlayer && (
                    <motion.div
                      layoutId="maze-player"
                      className="w-3/4 h-3/4 rounded-full bg-[#FF5A36] border-2 border-white shadow"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <button onClick={() => movePlayer(-1, 0)} aria-label="Move Up" className="tactile-btn p-3 rounded-xl bg-slate-900 text-white flex justify-center cursor-pointer"><ArrowUp className="w-4 h-4" /></button>
          <div />
          <button onClick={() => movePlayer(0, -1)} aria-label="Move Left" className="tactile-btn p-3 rounded-xl bg-slate-900 text-white flex justify-center cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
          <button onClick={() => movePlayer(1, 0)} aria-label="Move Down" className="tactile-btn p-3 rounded-xl bg-slate-900 text-white flex justify-center cursor-pointer"><ArrowDown className="w-4 h-4" /></button>
          <button onClick={() => movePlayer(0, 1)} aria-label="Move Right" className="tactile-btn p-3 rounded-xl bg-slate-900 text-white flex justify-center cursor-pointer"><ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
