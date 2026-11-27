import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { GameEngineProps } from './types';
import { soundFX } from '../utils/sound';

type ChessColor = 'w' | 'b';
type ChessType = 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
interface ChessPiece {
  color: ChessColor;
  type: ChessType;
}

const PIECE_UNICODE: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

function createInitialChessBoard(): (ChessPiece | null)[][] {
  const back: ChessType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  const board: (ChessPiece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[0][c] = { color: 'b', type: back[c] };
    board[1][c] = { color: 'b', type: 'P' };
    board[6][c] = { color: 'w', type: 'P' };
    board[7][c] = { color: 'w', type: back[c] };
  }
  return board;
}

function getPseudoLegalMoves(board: (ChessPiece | null)[][], r: number, c: number): [number, number][] {
  const p = board[r][c];
  if (!p) return [];
  const moves: [number, number][] = [];
  const inBounds = (nr: number, nc: number) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;

  if (p.type === 'P') {
    const dir = p.color === 'w' ? -1 : 1;
    const startRow = p.color === 'w' ? 6 : 1;
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push([r + dir, c]);
      if (r === startRow && !board[r + dir * 2][c]) {
        moves.push([r + dir * 2, c]);
      }
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir;
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc] && board[nr][nc]!.color !== p.color) {
        moves.push([nr, nc]);
      }
    }
  } else if (p.type === 'N') {
    const jumps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of jumps) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== p.color) moves.push([nr, nc]);
    }
  } else if (p.type === 'K') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc]?.color !== p.color) moves.push([nr, nc]);
      }
    }
  } else {
    const dirs: [number, number][] = [];
    if (p.type === 'R' || p.type === 'Q') dirs.push([1, 0], [-1, 0], [0, 1], [0, -1]);
    if (p.type === 'B' || p.type === 'Q') dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
    for (const [dr, dc] of dirs) {
      let nr = r + dr;
      let nc = c + dc;
      while (inBounds(nr, nc)) {
        if (!board[nr][nc]) {
          moves.push([nr, nc]);
        } else {
          if (board[nr][nc]!.color !== p.color) moves.push([nr, nc]);
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  }
  return moves;
}

export const BoardGamesEngine: React.FC<GameEngineProps> = ({
  game,
  mode,
  playerName,
  onScoreChange,
  onCharacterReact,
  onFinishGame,
}) => {
  // --- GAME #23: TIC-TAC-TOE ---
  const [tttBoard, setTttBoard] = useState<('X' | 'O' | null)[]>(Array(9).fill(null));
  const [tttTurn, setTttTurn] = useState<'X' | 'O'>('X');
  const [tttScores, setTttScores] = useState({ X: 0, O: 0, round: 1 });

  const checkTTTWinner = (b: ('X' | 'O' | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, m, z] of lines) {
      if (b[a] && b[a] === b[m] && b[a] === b[z]) return b[a];
    }
    return b.every(Boolean) ? 'DRAW' : null;
  };

  useEffect(() => {
    if (game.id !== 23 || mode !== 'Solo' || tttTurn !== 'O') return;
    if (checkTTTWinner(tttBoard)) return;
    const t = setTimeout(() => {
      const empties = tttBoard.map((v, i) => (v ? -1 : i)).filter((i) => i !== -1);
      if (empties.length === 0) return;
      // Pick winning or blocking or center move
      let pick = empties.includes(4) ? 4 : empties[Math.floor(Math.random() * empties.length)];
      for (const idx of empties) {
        const test = [...tttBoard];
        test[idx] = 'O';
        if (checkTTTWinner(test) === 'O') {
          pick = idx;
          break;
        }
      }
      const next = [...tttBoard];
      next[pick] = 'O';
      setTttBoard(next);
      soundFX.click();
      const res = checkTTTWinner(next);
      if (res) {
        if (res === 'O') {
          onCharacterReact('oops', 'Rook Automaton claimed that round!');
          setTttScores((s) => ({ ...s, O: s.O + 30 }));
        } else if (res === 'DRAW') {
          onCharacterReact('thinking', 'Stalemate draw! +10 pts');
          const nextPts = tttScores.X + 10;
          setTttScores((s) => ({ ...s, X: nextPts }));
          onScoreChange(nextPts);
        }
      } else {
        setTttTurn('X');
      }
    }, 420);
    return () => clearTimeout(t);
  }, [game.id, mode, tttTurn, tttBoard, tttScores.X, onCharacterReact, onScoreChange]);

  if (game.id === 23) {
    const winner = checkTTTWinner(tttBoard);

    const playTTT = (idx: number) => {
      if (tttBoard[idx] || winner || (mode === 'Solo' && tttTurn === 'O')) return;
      soundFX.click();
      const next = [...tttBoard];
      next[idx] = tttTurn;
      setTttBoard(next);
      const res = checkTTTWinner(next);
      if (res === 'X') {
        soundFX.correct();
        const nextPts = tttScores.X + 30;
        setTttScores((s) => ({ ...s, X: nextPts }));
        onScoreChange(nextPts);
        onCharacterReact('correct', 'Three in a row! +30 pts');
      } else if (res === 'O') {
        soundFX.correct();
        setTttScores((s) => ({ ...s, O: s.O + 30 }));
        onCharacterReact('excited', 'Player O takes the round!');
      } else if (res === 'DRAW') {
        const nextPts = tttScores.X + 10;
        setTttScores((s) => ({ ...s, X: nextPts }));
        onScoreChange(nextPts);
        onCharacterReact('thinking', 'Clean draw! +10 pts');
      } else {
        setTttTurn((t) => (t === 'X' ? 'O' : 'X'));
      }
    };

    const nextTTTRound = () => {
      if (tttScores.round >= 3) {
        onFinishGame(tttScores.X, 'Best-of-3 Tic-Tac-Toe complete!', [`${playerName}: ${tttScores.X}`, `Opponent: ${tttScores.O}`]);
        return;
      }
      setTttBoard(Array(9).fill(null));
      setTttTurn('X');
      setTttScores((s) => ({ ...s, round: s.round + 1 }));
    };

    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>ROUND {tttScores.round} / 3</span>
          <span>X: {tttScores.X} · O: {tttScores.O}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 shadow-xl space-y-5 text-center">
          <div className="text-sm font-semibold text-slate-600">
            {winner
              ? winner === 'DRAW'
                ? 'Round Draw!'
                : `${winner} Wins the Round!`
              : `Turn: ${tttTurn}`}
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
            {tttBoard.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => playTTT(idx)}
                className={`tactile-btn aspect-square rounded-xl border-2 text-4xl font-display font-extrabold flex items-center justify-center cursor-pointer ${
                  cell === 'X'
                    ? 'bg-orange-50 border-[#FF5A36] text-[#FF5A36]'
                    : cell === 'O'
                    ? 'bg-sky-50 border-sky-500 text-sky-600'
                    : 'bg-white border-slate-200 hover:border-slate-400'
                }`}
              >
                {cell}
              </button>
            ))}
          </div>

          {winner && (
            <button
              onClick={nextTTTRound}
              className="tactile-btn px-6 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
            >
              {tttScores.round >= 3 ? 'Finish Match' : 'Next Round'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- GAME #24: CHESS ---
  const [chessBoard, setChessBoard] = useState<(ChessPiece | null)[][]>(() => createInitialChessBoard());
  const [chessTurn, setChessTurn] = useState<ChessColor>('w');
  const [chessSelected, setChessSelected] = useState<[number, number] | null>(null);
  const [chessMoves, setChessMoves] = useState<string[]>([]);
  const [chessScore, setChessScore] = useState(0);

  const legalChessTargets = chessSelected ? getPseudoLegalMoves(chessBoard, chessSelected[0], chessSelected[1]) : [];

  // Bot move for Black in Solo mode
  useEffect(() => {
    if (game.id !== 24 || mode !== 'Solo' || chessTurn !== 'b') return;
    const t = setTimeout(() => {
      const allMoves: { from: [number, number]; to: [number, number]; capValue: number }[] = [];
      const pieceVal: Record<ChessType, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (chessBoard[r][c]?.color === 'b') {
            for (const [nr, nc] of getPseudoLegalMoves(chessBoard, r, c)) {
              const target = chessBoard[nr][nc];
              allMoves.push({ from: [r, c], to: [nr, nc], capValue: target ? pieceVal[target.type] : 0 });
            }
          }
        }
      }
      if (allMoves.length === 0) {
        onFinishGame(chessScore + 50, 'Checkmate / Stalemate! White wins!', chessMoves.slice(-6));
        return;
      }
      allMoves.sort((a, b) => b.capValue - a.capValue);
      const topPool = allMoves[0].capValue > 0 ? allMoves.slice(0, 2) : allMoves;
      const chosen = topPool[Math.floor(Math.random() * topPool.length)];
      const next = chessBoard.map((row) => [...row]);
      const moving = next[chosen.from[0]][chosen.from[1]]!;
      const captured = next[chosen.to[0]][chosen.to[1]];
      next[chosen.to[0]][chosen.to[1]] = moving.type === 'P' && chosen.to[0] === 7 ? { color: 'b', type: 'Q' } : moving;
      next[chosen.from[0]][chosen.from[1]] = null;
      setChessBoard(next);
      soundFX.click();
      const files = 'abcdefgh';
      setChessMoves((m) => [...m, `b:${moving.type}${files[chosen.to[1]]}${8 - chosen.to[0]}`]);
      if (captured?.type === 'K') {
        onFinishGame(chessScore, 'Rook Automaton captured your King!', chessMoves.slice(-6));
      } else {
        setChessTurn('w');
      }
    }, 520);
    return () => clearTimeout(t);
  }, [game.id, mode, chessTurn, chessBoard, chessScore, chessMoves, onFinishGame]);

  if (game.id === 24) {
    const clickSquare = (r: number, c: number) => {
      if (mode === 'Solo' && chessTurn === 'b') return;
      const piece = chessBoard[r][c];
      const isLegal = legalChessTargets.some(([lr, lc]) => lr === r && lc === c);

      if (chessSelected && isLegal) {
        const [sr, sc] = chessSelected;
        const moving = chessBoard[sr][sc]!;
        const captured = chessBoard[r][c];
        const next = chessBoard.map((row) => [...row]);
        next[r][c] = moving.type === 'P' && (r === 0 || r === 7) ? { color: moving.color, type: 'Q' } : moving;
        next[sr][sc] = null;
        setChessBoard(next);
        setChessSelected(null);

        const files = 'abcdefgh';
        setChessMoves((m) => [...m, `${moving.color}:${moving.type}${files[c]}${8 - r}`]);

        if (captured) {
          soundFX.correct();
          const pts = captured.type === 'Q' ? 25 : captured.type === 'R' ? 15 : 10;
          const nextScore = chessScore + pts;
          setChessScore(nextScore);
          onScoreChange(nextScore);
          onCharacterReact('correct', `Captured opponent piece! +${pts} pts`);
          if (captured.type === 'K') {
            onFinishGame(nextScore + 50, 'Victory! Opponent King captured!', chessMoves.slice(-6));
            return;
          }
        } else {
          soundFX.click();
        }
        setChessTurn(chessTurn === 'w' ? 'b' : 'w');
        return;
      }

      if (piece && piece.color === chessTurn) {
        soundFX.click();
        setChessSelected([r, c]);
      } else {
        setChessSelected(null);
      }
    };

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
          <span>TURN: {chessTurn === 'w' ? 'WHITE (YOU)' : 'BLACK'}</span>
          <button
            onClick={() => onFinishGame(chessScore + 20, 'Concluded Chess match as friendly draw.', chessMoves.slice(-6))}
            className="underline hover:text-white cursor-pointer"
          >
            Claim Draw &amp; Finish
          </button>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-4 sm:p-6 shadow-xl grid grid-cols-1 md:grid-cols-[1fr_180px] gap-5 items-start">
          <div className="grid grid-cols-8 border-2 border-slate-900 aspect-square max-w-[420px] w-full mx-auto select-none">
            {chessBoard.map((row, r) =>
              row.map((sq, c) => {
                const dark = (r + c) % 2 === 1;
                const isSel = chessSelected?.[0] === r && chessSelected?.[1] === c;
                const isTarget = legalChessTargets.some(([lr, lc]) => lr === r && lc === c);
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => clickSquare(r, c)}
                    className={`relative flex items-center justify-center text-2xl sm:text-3xl cursor-pointer ${
                      isSel
                        ? 'bg-[#FF5A36] text-white'
                        : dark
                        ? 'bg-[#4B637A] text-white'
                        : 'bg-[#EDE9E0] text-slate-900'
                    }`}
                  >
                    {sq && (
                      <span className={sq.color === 'w' ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] text-white' : 'text-slate-950'}>
                        {PIECE_UNICODE[`${sq.color}${sq.type}`]}
                      </span>
                    )}
                    {isTarget && (
                      <span
                        className={`absolute rounded-full ${
                          sq ? 'inset-1 border-2 border-amber-400' : 'w-3 h-3 bg-emerald-400/80'
                        }`}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Move History</div>
            <div className="h-52 overflow-y-auto rounded-lg bg-slate-100 p-2.5 font-mono text-xs space-y-1 text-slate-700">
              {chessMoves.length === 0 ? (
                <div className="text-slate-400">Tap any White piece to move.</div>
              ) : (
                chessMoves.map((mv, i) => <div key={i}>{i + 1}. {mv}</div>)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #25: CHECKERS ---
  const [chkBoard, setChkBoard] = useState<({ color: 'r' | 'b'; king: boolean } | null)[][]>(() => {
    const b: ({ color: 'r' | 'b'; king: boolean } | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) b[r][c] = { color: 'b', king: false };
          else if (r > 4) b[r][c] = { color: 'r', king: false };
        }
      }
    }
    return b;
  });
  const [chkTurn, setChkTurn] = useState<'r' | 'b'>('r');
  const [chkSel, setChkSel] = useState<[number, number] | null>(null);
  const [chkScore, setChkScore] = useState(0);

  const getCheckersMoves = (b: typeof chkBoard, r: number, c: number) => {
    const p = b[r][c];
    if (!p) return [];
    const dirs = p.king ? [-1, 1] : p.color === 'r' ? [-1] : [1];
    const moves: { to: [number, number]; capture?: [number, number] }[] = [];
    for (const dr of dirs) {
      for (const dc of [-1, 1]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (!b[nr][nc]) moves.push({ to: [nr, nc] });
          else if (b[nr][nc]!.color !== p.color) {
            const jr = nr + dr;
            const jc = nc + dc;
            if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !b[jr][jc]) {
              moves.push({ to: [jr, jc], capture: [nr, nc] });
            }
          }
        }
      }
    }
    return moves;
  };

  useEffect(() => {
    if (game.id !== 25 || mode !== 'Solo' || chkTurn !== 'b') return;
    const t = setTimeout(() => {
      const options: { from: [number, number]; to: [number, number]; capture?: [number, number] }[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (chkBoard[r][c]?.color === 'b') {
            for (const mv of getCheckersMoves(chkBoard, r, c)) {
              options.push({ from: [r, c], ...mv });
            }
          }
        }
      }
      if (options.length === 0) {
        onFinishGame(chkScore + 30, 'You trapped all Black pieces! Victory!', [`Score: ${chkScore + 30}`]);
        return;
      }
      const cap = options.find((o) => o.capture);
      const chosen = cap || options[Math.floor(Math.random() * options.length)];
      const next = chkBoard.map((row) => [...row]);
      const piece = next[chosen.from[0]][chosen.from[1]]!;
      next[chosen.to[0]][chosen.to[1]] = { ...piece, king: piece.king || chosen.to[0] === 7 };
      next[chosen.from[0]][chosen.from[1]] = null;
      if (chosen.capture) next[chosen.capture[0]][chosen.capture[1]] = null;
      setChkBoard(next);
      soundFX.click();
      setChkTurn('r');
    }, 480);
    return () => clearTimeout(t);
  }, [game.id, mode, chkTurn, chkBoard, chkScore, onFinishGame]);

  if (game.id === 25) {
    const validTargets = chkSel ? getCheckersMoves(chkBoard, chkSel[0], chkSel[1]) : [];
    const clickChk = (r: number, c: number) => {
      if (mode === 'Solo' && chkTurn === 'b') return;
      const mv = validTargets.find((m) => m.to[0] === r && m.to[1] === c);
      if (chkSel && mv) {
        const next = chkBoard.map((row) => [...row]);
        const piece = next[chkSel[0]][chkSel[1]]!;
        next[r][c] = { ...piece, king: piece.king || r === 0 || r === 7 };
        next[chkSel[0]][chkSel[1]] = null;
        if (mv.capture) {
          next[mv.capture[0]][mv.capture[1]] = null;
          soundFX.correct();
          const nextScore = chkScore + 15;
          setChkScore(nextScore);
          onScoreChange(nextScore);
          onCharacterReact('correct', 'Captured enemy disc! +15 pts');
        } else {
          soundFX.click();
        }
        setChkBoard(next);
        setChkSel(null);
        const remainingBlack = next.flat().filter((p) => p?.color === 'b').length;
        if (remainingBlack === 0) {
          onFinishGame(chkScore + 45, 'Cleared every opponent disc!', [`Total Score: ${chkScore + 45}`]);
          return;
        }
        setChkTurn(chkTurn === 'r' ? 'b' : 'r');
        return;
      }
      if (chkBoard[r][c]?.color === chkTurn) {
        setChkSel([r, c]);
      } else {
        setChkSel(null);
      }
    };

    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>TURN: {chkTurn === 'r' ? 'CORAL (YOU)' : 'SLATE'}</span>
          <span>SCORE: {chkScore}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] p-4 shadow-xl">
          <div className="grid grid-cols-8 border-2 border-slate-900 aspect-square max-w-[400px] mx-auto">
            {chkBoard.map((row, r) =>
              row.map((sq, c) => {
                const dark = (r + c) % 2 === 1;
                const isSel = chkSel?.[0] === r && chkSel?.[1] === c;
                const isHint = validTargets.some((m) => m.to[0] === r && m.to[1] === c);
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => clickChk(r, c)}
                    className={`flex items-center justify-center cursor-pointer ${
                      isSel ? 'bg-amber-300' : isHint ? 'bg-emerald-300' : dark ? 'bg-slate-700' : 'bg-[#EDE9E0]'
                    }`}
                  >
                    {sq && (
                      <div
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          sq.color === 'r'
                            ? 'bg-[#FF5A36] border-white text-white'
                            : 'bg-slate-950 border-slate-400 text-amber-300'
                        }`}
                      >
                        {sq.king ? '♛' : ''}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #26: CONNECT FOUR ---
  const [c4Grid, setC4Grid] = useState<(1 | 2 | null)[][]>(() => Array.from({ length: 6 }, () => Array(7).fill(null)));
  const [c4Turn, setC4Turn] = useState<1 | 2>(1);
  const [c4Winner, setC4Winner] = useState<1 | 2 | 'DRAW' | null>(null);

  const checkC4 = (g: (1 | 2 | null)[][]): 1 | 2 | 'DRAW' | null => {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const p = g[r][c];
        if (!p) continue;
        const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (const [dr, dc] of dirs) {
          let count = 1;
          for (let k = 1; k < 4; k++) {
            const nr = r + dr * k;
            const nc = c + dc * k;
            if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && g[nr][nc] === p) count++;
          }
          if (count === 4) return p;
        }
      }
    }
    return g[0].every((v) => v !== null) ? 'DRAW' : null;
  };

  useEffect(() => {
    if (game.id !== 26 || mode !== 'Solo' || c4Turn !== 2 || c4Winner) return;
    const t = setTimeout(() => {
      const validCols = [0, 1, 2, 3, 4, 5, 6].filter((c) => c4Grid[0][c] === null);
      if (validCols.length === 0) return;
      const col = validCols[Math.floor(Math.random() * validCols.length)];
      const next = c4Grid.map((row) => [...row]);
      for (let r = 5; r >= 0; r--) {
        if (next[r][col] === null) {
          next[r][col] = 2;
          break;
        }
      }
      setC4Grid(next);
      soundFX.flip();
      const w = checkC4(next);
      if (w) {
        setC4Winner(w);
        if (w === 2) onCharacterReact('oops', 'Bot connected 4! Rematch?');
      } else {
        setC4Turn(1);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [game.id, mode, c4Turn, c4Grid, c4Winner, onCharacterReact]);

  if (game.id === 26) {
    const dropDisc = (col: number) => {
      if (c4Winner || (mode === 'Solo' && c4Turn === 2)) return;
      if (c4Grid[0][col] !== null) return;
      const next = c4Grid.map((row) => [...row]);
      for (let r = 5; r >= 0; r--) {
        if (next[r][col] === null) {
          next[r][col] = c4Turn;
          break;
        }
      }
      soundFX.flip();
      setC4Grid(next);
      const w = checkC4(next);
      if (w) {
        setC4Winner(w);
        if (w === 1) {
          soundFX.correct();
          onScoreChange(30);
          onCharacterReact('correct', 'Four in a row! +30 pts!');
        }
      } else {
        setC4Turn((t) => (t === 1 ? 2 : 1));
      }
    };

    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>{c4Winner ? (c4Winner === 'DRAW' ? 'DRAW' : `PLAYER ${c4Winner} WINS!`) : `TURN: PLAYER ${c4Turn}`}</span>
          <span>TAP ANY COLUMN TO DROP</span>
        </div>

        <div className="rounded-2xl bg-[#1C3D7A] p-4 shadow-xl border-4 border-[#2853A3]">
          <div className="grid grid-cols-7 gap-2">
            {c4Grid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => dropDisc(c)}
                  className="aspect-square rounded-full bg-[#0F1117] flex items-center justify-center p-1 cursor-pointer hover:ring-2 hover:ring-white/40"
                >
                  {cell && (
                    <motion.div
                      initial={{ y: -24, opacity: 0.5 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.22 }}
                      className={`w-full h-full rounded-full ${cell === 1 ? 'bg-[#FF5A36]' : 'bg-amber-400'}`}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {c4Winner && (
          <div className="flex justify-center">
            <button
              onClick={() => onFinishGame(c4Winner === 1 ? 30 : 10, 'Connect Four match finished!')}
              className="tactile-btn px-6 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
            >
              View Match Summary
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- GAME #27: DOTS AND BOXES (3x3 Boxes = 4x4 Dots) ---
  const [hEdges, setHEdges] = useState<number[][]>(() => Array.from({ length: 4 }, () => Array(3).fill(0)));
  const [vEdges, setVEdges] = useState<number[][]>(() => Array.from({ length: 3 }, () => Array(4).fill(0)));
  const [boxes, setBoxes] = useState<number[][]>(() => Array.from({ length: 3 }, () => Array(3).fill(0)));
  const [dbTurn, setDbTurn] = useState<1 | 2>(1);

  if (game.id === 27) {
    const p1Count = boxes.flat().filter((v) => v === 1).length;
    const p2Count = boxes.flat().filter((v) => v === 2).length;
    const totalClaimed = p1Count + p2Count;

    const claimEdge = (type: 'h' | 'v', r: number, c: number) => {
      if (type === 'h' && hEdges[r][c] !== 0) return;
      if (type === 'v' && vEdges[r][c] !== 0) return;
      soundFX.click();

      const nextH = hEdges.map((row) => [...row]);
      const nextV = vEdges.map((row) => [...row]);
      if (type === 'h') nextH[r][c] = dbTurn;
      else nextV[r][c] = dbTurn;

      const nextBoxes = boxes.map((row) => [...row]);
      let gained = 0;
      for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
          if (
            nextBoxes[br][bc] === 0 &&
            nextH[br][bc] !== 0 &&
            nextH[br + 1][bc] !== 0 &&
            nextV[br][bc] !== 0 &&
            nextV[br][bc + 1] !== 0
          ) {
            nextBoxes[br][bc] = dbTurn;
            gained++;
          }
        }
      }

      setHEdges(nextH);
      setVEdges(nextV);
      setBoxes(nextBoxes);

      if (gained > 0) {
        soundFX.correct();
        const nextP1 = nextBoxes.flat().filter((v) => v === 1).length * 10;
        onScoreChange(nextP1);
        onCharacterReact('correct', `Player ${dbTurn} closed ${gained} box(es) & earns a bonus turn!`);
      } else {
        setDbTurn(dbTurn === 1 ? 2 : 1);
      }

      if (nextBoxes.flat().every((v) => v !== 0)) {
        const finalP1 = nextBoxes.flat().filter((v) => v === 1).length * 10;
        setTimeout(() => {
          onFinishGame(finalP1, 'All 9 boxes claimed!', [`P1 Boxes: ${finalP1 / 10}`, `P2 Boxes: ${9 - finalP1 / 10}`]);
        }, 500);
      }
    };

    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>TURN: PLAYER {dbTurn}</span>
          <span>P1: {p1Count} BOXES · P2: {p2Count} BOXES ({totalClaimed}/9)</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] p-7 shadow-xl flex justify-center">
          <div className="space-y-1">
            {[0, 1, 2, 3].map((r) => (
              <React.Fragment key={r}>
                {/* Dot + Horizontal Edge Row */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map((c) => (
                    <React.Fragment key={c}>
                      <div className="w-4 h-4 rounded-full bg-slate-900 shrink-0" />
                      {c < 3 && (
                        <button
                          onClick={() => claimEdge('h', r, c)}
                          aria-label={`Horizontal edge ${r}-${c}`}
                          className={`w-16 h-3 rounded-full transition-colors cursor-pointer ${
                            hEdges[r][c] === 1
                              ? 'bg-[#FF5A36]'
                              : hEdges[r][c] === 2
                              ? 'bg-sky-500'
                              : 'bg-slate-200 hover:bg-slate-400'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Vertical Edge + Box Row */}
                {r < 3 && (
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3].map((c) => (
                      <React.Fragment key={c}>
                        <button
                          onClick={() => claimEdge('v', r, c)}
                          aria-label={`Vertical edge ${r}-${c}`}
                          className={`w-3 h-16 rounded-full mx-0.5 transition-colors cursor-pointer ${
                            vEdges[r][c] === 1
                              ? 'bg-[#FF5A36]'
                              : vEdges[r][c] === 2
                              ? 'bg-sky-500'
                              : 'bg-slate-200 hover:bg-slate-400'
                          }`}
                        />
                        {c < 3 && (
                          <div
                            className={`w-16 h-16 rounded-lg flex items-center justify-center font-display font-bold text-lg ${
                              boxes[r][c] === 1
                                ? 'bg-orange-100 text-[#FF5A36]'
                                : boxes[r][c] === 2
                                ? 'bg-sky-100 text-sky-600'
                                : 'bg-transparent'
                            }`}
                          >
                            {boxes[r][c] ? `P${boxes[r][c]}` : ''}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #28: ROCK PAPER SCISSORS (Best of 5) ---
  const [rpsRounds, setRpsRounds] = useState<{ p: string; bot: string; res: string }[]>([]);
  const [rpsScore, setRpsScore] = useState(0);

  const playRPS = (choice: 'Rock' | 'Paper' | 'Scissors') => {
    const opts: ('Rock' | 'Paper' | 'Scissors')[] = ['Rock', 'Paper', 'Scissors'];
    const bot = opts[Math.floor(Math.random() * 3)];
    let res = 'Draw';
    let delta = 5;
    if (
      (choice === 'Rock' && bot === 'Scissors') ||
      (choice === 'Paper' && bot === 'Rock') ||
      (choice === 'Scissors' && bot === 'Paper')
    ) {
      res = 'Win';
      delta = 10;
      soundFX.correct();
      onCharacterReact('correct', `${choice} beats ${bot}! +10 pts`);
    } else if (choice === bot) {
      soundFX.click();
      onCharacterReact('thinking', `Both chose ${choice}! +5 pts`);
    } else {
      delta = 0;
      soundFX.wrong();
      onCharacterReact('oops', `${bot} beats ${choice}!`);
    }

    const nextScore = rpsScore + delta;
    setRpsScore(nextScore);
    onScoreChange(nextScore);
    const nextRounds = [...rpsRounds, { p: choice, bot, res }];
    setRpsRounds(nextRounds);

    if (nextRounds.length >= 5) {
      setTimeout(() => {
        onFinishGame(nextScore, 'Best-of-5 Rock Paper Scissors complete!', [
          `Wins: ${nextRounds.filter((r) => r.res === 'Win').length}`,
          `Draws: ${nextRounds.filter((r) => r.res === 'Draw').length}`,
        ]);
      }, 700);
    }
  };

  const lastRps = rpsRounds[rpsRounds.length - 1];

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
        <span>ROUND {Math.min(5, rpsRounds.length + 1)} / 5</span>
        <span>SCORE: {rpsScore}</span>
      </div>

      <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-6 text-center">
        {lastRps ? (
          <motion.div
            key={rpsRounds.length}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-8 py-3"
          >
            <div>
              <div className="text-xs text-slate-500 font-semibold mb-1">YOU</div>
              <div className="text-4xl">{lastRps.p === 'Rock' ? '✊' : lastRps.p === 'Paper' ? '✋' : '✌️'}</div>
            </div>
            <div className="text-sm font-mono font-bold px-3 py-1 rounded-lg bg-slate-900 text-white">
              {lastRps.res.toUpperCase()}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold mb-1">BOT</div>
              <div className="text-4xl">{lastRps.bot === 'Rock' ? '✊' : lastRps.bot === 'Paper' ? '✋' : '✌️'}</div>
            </div>
          </motion.div>
        ) : (
          <div className="py-4 text-slate-500 text-sm">Lock in your stance below!</div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {(['Rock', 'Paper', 'Scissors'] as const).map((item) => (
            <button
              key={item}
              onClick={() => playRPS(item)}
              disabled={rpsRounds.length >= 5}
              className="tactile-btn py-5 rounded-xl bg-white border-2 border-slate-200 hover:border-[#FF5A36] flex flex-col items-center gap-2 cursor-pointer"
            >
              <span className="text-3xl">{item === 'Rock' ? '✊' : item === 'Paper' ? '✋' : '✌️'}</span>
              <span className="text-sm font-bold">{item}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setRpsRounds([]);
            setRpsScore(0);
            onScoreChange(0);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Series
        </button>
      </div>
    </div>
  );
};
