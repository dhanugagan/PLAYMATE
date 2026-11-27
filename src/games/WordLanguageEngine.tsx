import React, { useMemo, useState } from 'react';
import { Volume2, RotateCcw, Send, CheckCircle2 } from 'lucide-react';
import { GameEngineProps } from './types';
import { WORD_BANK, FIVE_LETTER_WORDS } from '../data/gameContentBank';
import { soundFX } from '../utils/sound';

// Generate a 10x10 Word Search Grid with hidden words
function buildWordSearchGrid(words: string[]) {
  const size = 10;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placements: { word: string; cells: [number, number][] }[] = [];

  const dirs: [number, number][] = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal
  ];

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 80 && !placed; attempt++) {
      const [dr, dc] = dirs[attempt % dirs.length];
      const r0 = Math.floor(Math.random() * size);
      const c0 = Math.floor(Math.random() * size);
      const rEnd = r0 + dr * (word.length - 1);
      const cEnd = c0 + dc * (word.length - 1);
      if (rEnd >= size || cEnd >= size || rEnd < 0 || cEnd < 0) continue;

      let fits = true;
      const cells: [number, number][] = [];
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          fits = false;
          break;
        }
        cells.push([r, c]);
      }
      if (fits) {
        cells.forEach(([r, c], i) => {
          grid[r][c] = word[i];
        });
        placements.push({ word, cells });
        placed = true;
      }
    }
  }

  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
    }
  }
  return { grid, placements };
}

export const WordLanguageEngine: React.FC<GameEngineProps> = ({
  game,
  difficulty,
  mode,
  onScoreChange,
  onCharacterReact,
  onAdvanceLevel,
  onFinishGame,
}) => {
  const words = useMemo(() => WORD_BANK[difficulty] || WORD_BANK.Medium, [difficulty]);

  // --- GAME #17: WORD SCRAMBLE ---
  const [scrIdx, setScrIdx] = useState(0);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [scrScore, setScrScore] = useState(0);

  const currentScrambleWord = words[scrIdx % words.length];
  const scrambledLetters = useMemo(() => {
    const arr = currentScrambleWord.split('').map((ch, i) => ({ ch, i }));
    return [...arr].sort((a, b) => ((a.i * 7 + scrIdx * 3) % 11) - ((b.i * 5 + scrIdx) % 11));
  }, [currentScrambleWord, scrIdx]);

  if (game.id === 17) {
    const assembled = pickedIndices.map((idx) => scrambledLetters[idx].ch).join('');
    const total = 6;

    const tapTile = (tileIdx: number) => {
      if (pickedIndices.includes(tileIdx)) return;
      soundFX.click();
      const nextPicked = [...pickedIndices, tileIdx];
      setPickedIndices(nextPicked);

      const attempt = nextPicked.map((i) => scrambledLetters[i].ch).join('');
      if (attempt.length === currentScrambleWord.length) {
        if (attempt === currentScrambleWord) {
          soundFX.correct();
          const nextScore = scrScore + 15;
          setScrScore(nextScore);
          onScoreChange(nextScore);
          onCharacterReact('correct', `Unscrambled "${currentScrambleWord}"! +15 pts`);
          setTimeout(() => {
            if (scrIdx + 1 >= total) {
              onFinishGame(nextScore, `Unscrambled all ${total} words!`, [`Final Score: ${nextScore}`]);
            } else {
              if (scrIdx === 1) onAdvanceLevel(2, 'Level 2: Rapid Rack', 'Longer vocabulary incoming!');
              if (scrIdx === 3) onAdvanceLevel(3, 'Level 3: Lexicon Sprint', 'Final word rack!');
              setScrIdx(scrIdx + 1);
              setPickedIndices([]);
            }
          }, 500);
        } else {
          soundFX.wrong();
          onCharacterReact('oops', 'Not quite that order—tap Clear to retry!');
        }
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>WORD {scrIdx + 1} / {total}</span>
          <span>LENGTH: {currentScrambleWord.length} LETTERS</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-6 text-center">
          {/* Answer slots */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {currentScrambleWord.split('').map((_, slotIdx) => {
              const letter = pickedIndices[slotIdx] !== undefined ? scrambledLetters[pickedIndices[slotIdx]].ch : '';
              return (
                <button
                  key={slotIdx}
                  onClick={() => {
                    if (letter) setPickedIndices((p) => p.filter((_, i) => i !== slotIdx));
                  }}
                  className={`w-11 h-12 rounded-xl border-2 font-display text-xl font-bold flex items-center justify-center cursor-pointer ${
                    letter ? 'bg-[#0F1117] border-[#0F1117] text-white' : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Scrambled letter rack */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {scrambledLetters.map((item, idx) => {
              const used = pickedIndices.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => tapTile(idx)}
                  disabled={used}
                  className={`tactile-btn w-11 h-12 rounded-xl font-display text-xl font-bold border-2 cursor-pointer ${
                    used
                      ? 'bg-slate-100 border-slate-200 text-slate-300'
                      : 'bg-amber-100 border-amber-400 text-amber-950 hover:bg-amber-200'
                  }`}
                >
                  {item.ch}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPickedIndices([])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Rack
            </button>
            <span className="text-xs font-mono text-slate-500">Current: {assembled || '—'}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #18: WORD SEARCH ---
  const searchWords = useMemo(() => ['PLANET', 'PUZZLE', 'ROCKET', 'BRIDGE', 'STREAM'], []);
  const wsData = useMemo(() => buildWordSearchGrid(searchWords), [searchWords]);
  const [wsStart, setWsStart] = useState<[number, number] | null>(null);
  const [wsFoundWords, setWsFoundWords] = useState<string[]>([]);
  const [wsFoundCells, setWsFoundCells] = useState<string[]>([]);
  const [wsScore, setWsScore] = useState(0);

  if (game.id === 18) {
    const clickCell = (r: number, c: number) => {
      soundFX.click();
      if (!wsStart) {
        setWsStart([r, c]);
        return;
      }
      const [r0, c0] = wsStart;
      setWsStart(null);
      const match = wsData.placements.find((pl) => {
        const first = pl.cells[0];
        const last = pl.cells[pl.cells.length - 1];
        return (
          (first[0] === r0 && first[1] === c0 && last[0] === r && last[1] === c) ||
          (last[0] === r0 && last[1] === c0 && first[0] === r && first[1] === c)
        );
      });

      if (match && !wsFoundWords.includes(match.word)) {
        soundFX.correct();
        const nextFound = [...wsFoundWords, match.word];
        setWsFoundWords(nextFound);
        setWsFoundCells((prev) => [...prev, ...match.cells.map(([cr, cc]) => `${cr}-${cc}`)]);
        const nextScore = wsScore + 20;
        setWsScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', `Found "${match.word}"! +20 pts`);

        if (nextFound.length === wsData.placements.length) {
          onFinishGame(nextScore + 20, 'Uncovered every hidden word in the grid!', [`Words Found: ${nextFound.length}`]);
        }
      } else {
        onCharacterReact('thinking', 'Tap the first letter and then the last letter of a listed word.');
      }
    };

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>FOUND {wsFoundWords.length} / {wsData.placements.length} WORDS</span>
          <span>CLICK START &amp; END LETTER</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-5 sm:p-6 shadow-xl grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6 items-start">
          <div className="grid grid-cols-10 gap-1 select-none">
            {wsData.grid.map((row, r) =>
              row.map((ch, c) => {
                const key = `${r}-${c}`;
                const isFound = wsFoundCells.includes(key);
                const isSelected = wsStart?.[0] === r && wsStart?.[1] === c;
                return (
                  <button
                    key={key}
                    onClick={() => clickCell(r, c)}
                    className={`aspect-square rounded-md font-mono font-bold text-sm flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF5A36] text-white'
                        : isFound
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 hover:bg-amber-100 text-slate-900'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Words</div>
            {wsData.placements.map((pl) => {
              const done = wsFoundWords.includes(pl.word);
              return (
                <div
                  key={pl.word}
                  className={`px-3 py-2 rounded-lg text-sm font-mono font-bold flex items-center justify-between ${
                    done ? 'bg-emerald-100 text-emerald-800 line-through' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <span>{pl.word}</span>
                  {done && <CheckCircle2 className="w-4 h-4" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #19: HANGMAN ---
  const [hmWord, setHmWord] = useState(() => words[0]);
  const [customInput, setCustomInput] = useState('');
  const [waitingCustom, setWaitingCustom] = useState(mode === '2-Player');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [hmScore, setHmScore] = useState(0);

  if (game.id === 19) {
    const wrongGuesses = guessedLetters.filter((l) => !hmWord.includes(l));
    const maxWrong = 6;
    const isLost = wrongGuesses.length >= maxWrong;
    const isWon = hmWord.split('').every((ch) => guessedLetters.includes(ch));

    const guessLetter = (letter: string) => {
      if (guessedLetters.includes(letter) || isLost || isWon) return;
      const next = [...guessedLetters, letter];
      setGuessedLetters(next);
      if (hmWord.includes(letter)) {
        soundFX.correct();
        const nextScore = hmScore + 10;
        setHmScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', `Letter "${letter}" is in the word!`);
        if (hmWord.split('').every((ch) => next.includes(ch))) {
          const bonus = (maxWrong - wrongGuesses.length) * 5;
          setTimeout(() => {
            onFinishGame(nextScore + bonus, `Saved the character! Word: ${hmWord}`, [`Lives Left: ${maxWrong - wrongGuesses.length}`]);
          }, 600);
        }
      } else {
        soundFX.wrong();
        onCharacterReact('oops', `No "${letter}"! ${maxWrong - wrongGuesses.length - 1} tries left.`);
        if (wrongGuesses.length + 1 >= maxWrong) {
          setTimeout(() => {
            onFinishGame(hmScore, `Out of attempts! The word was ${hmWord}.`, [`Letters Found: ${hmScore / 10}`]);
          }, 700);
        }
      }
    };

    if (waitingCustom) {
      return (
        <div className="max-w-md mx-auto rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-4">
          <h3 className="text-lg font-display font-bold">Player 1: Set Secret Word</h3>
          <p className="text-xs text-slate-600">Enter a word (3–10 letters) for Player 2 to guess, or skip to use a random word.</p>
          <input
            type="password"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10))}
            placeholder="Secret word..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-lg tracking-widest uppercase"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (customInput.length >= 3) setHmWord(customInput);
                setWaitingCustom(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
            >
              Lock Secret Word
            </button>
            <button
              onClick={() => setWaitingCustom(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-semibold text-sm cursor-pointer"
            >
              Random
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>ATTEMPTS LEFT: {maxWrong - wrongGuesses.length} / {maxWrong}</span>
          <span>WRONG: {wrongGuesses.join(' ') || 'NONE'}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 shadow-xl space-y-6">
          <div className="flex justify-center">
            <svg viewBox="0 0 180 140" className="w-44 h-36">
              <line x1="20" y1="130" x2="100" y2="130" stroke="#334155" strokeWidth="4" />
              <line x1="45" y1="130" x2="45" y2="15" stroke="#334155" strokeWidth="4" />
              <line x1="45" y1="15" x2="115" y2="15" stroke="#334155" strokeWidth="4" />
              <line x1="115" y1="15" x2="115" y2="32" stroke="#334155" strokeWidth="3" />
              {wrongGuesses.length >= 1 && <circle cx="115" cy="46" r="13" fill="none" stroke="#FF5A36" strokeWidth="3.5" />}
              {wrongGuesses.length >= 2 && <line x1="115" y1="59" x2="115" y2="95" stroke="#FF5A36" strokeWidth="3.5" />}
              {wrongGuesses.length >= 3 && <line x1="115" y1="70" x2="95" y2="85" stroke="#FF5A36" strokeWidth="3.5" />}
              {wrongGuesses.length >= 4 && <line x1="115" y1="70" x2="135" y2="85" stroke="#FF5A36" strokeWidth="3.5" />}
              {wrongGuesses.length >= 5 && <line x1="115" y1="95" x2="98" y2="118" stroke="#FF5A36" strokeWidth="3.5" />}
              {wrongGuesses.length >= 6 && <line x1="115" y1="95" x2="132" y2="118" stroke="#FF5A36" strokeWidth="3.5" />}
            </svg>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {hmWord.split('').map((ch, i) => (
              <div key={i} className="w-10 h-12 border-b-4 border-slate-900 flex items-center justify-center font-mono text-2xl font-bold">
                {guessedLetters.includes(ch) || isLost ? ch : ''}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
              const used = guessedLetters.includes(letter);
              const hit = used && hmWord.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => guessLetter(letter)}
                  disabled={used || isLost || isWon}
                  className={`w-9 h-10 rounded-lg font-mono font-bold text-sm cursor-pointer ${
                    hit
                      ? 'bg-emerald-600 text-white'
                      : used
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-[#0F1117] hover:bg-[#FF5A36] text-white'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #20: SPELL MASTER ---
  const [spellIdx, setSpellIdx] = useState(0);
  const [spellText, setSpellText] = useState('');
  const [spellScore, setSpellScore] = useState(0);
  const spellWords = useMemo(() => ['SYMPHONY', 'HORIZON', 'ALGORITHM', 'LABYRINTH', 'CATALYST'], []);

  if (game.id === 20) {
    const target = spellWords[spellIdx % spellWords.length];

    const speakWord = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(target.toLowerCase());
        utter.rate = 0.85;
        window.speechSynthesis.speak(utter);
      } else {
        soundFX.click();
      }
      onCharacterReact('thinking', 'Listen closely to every syllable!');
    };

    const submitSpelling = (e: React.FormEvent) => {
      e.preventDefault();
      if (!spellText.trim()) return;
      const clean = spellText.trim().toUpperCase();
      if (clean === target) {
        soundFX.correct();
        const nextScore = spellScore + 20;
        setSpellScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', `Exact spelling: ${target}! +20 pts`);
      } else {
        soundFX.wrong();
        onCharacterReact('oops', `Correct spelling was ${target}.`);
      }

      if (spellIdx + 1 >= spellWords.length) {
        onFinishGame(clean === target ? spellScore + 20 : spellScore, 'Spelling gauntlet complete!', [`Score: ${clean === target ? spellScore + 20 : spellScore}`]);
      } else {
        if (spellIdx === 1) onAdvanceLevel(2, 'Level 2: Academic Vocabulary', 'Trickier double letters & Greek roots!');
        setSpellIdx(spellIdx + 1);
        setSpellText('');
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>WORD {spellIdx + 1} / {spellWords.length}</span>
          <span>HINT: {target[0]} _ _ {target[target.length - 1]} ({target.length} letters)</span>
        </div>

        <form onSubmit={submitSpelling} className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-5 text-center">
          <button
            type="button"
            onClick={speakWord}
            className="tactile-btn mx-auto inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-[#0F1117] text-white font-display font-bold text-base cursor-pointer"
          >
            <Volume2 className="w-5 h-5 text-amber-400" />
            <span>Play Pronunciation</span>
          </button>

          <input
            type="text"
            value={spellText}
            onChange={(e) => setSpellText(e.target.value)}
            placeholder="Type exact spelling here..."
            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 focus:border-[#FF5A36] outline-none text-center font-mono text-lg uppercase tracking-widest"
          />

          <button
            type="submit"
            className="tactile-btn w-full py-3 rounded-xl bg-[#FF5A36] text-white font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Submit Spelling
          </button>
        </form>
      </div>
    );
  }

  // --- GAME #22: GUESS THE WORD (5-Letter Wordle-style) ---
  const [gwRound, setGwRound] = useState(0);
  const [gwGuesses, setGwGuesses] = useState<string[]>([]);
  const [gwCurrent, setGwCurrent] = useState('');
  const [gwScore, setGwScore] = useState(0);

  const gwTarget = FIVE_LETTER_WORDS[gwRound % FIVE_LETTER_WORDS.length];

  const submitWordGuess = () => {
    if (gwCurrent.length !== 5) return;
    const nextGuesses = [...gwGuesses, gwCurrent];
    setGwGuesses(nextGuesses);
    setGwCurrent('');

    if (gwCurrent === gwTarget) {
      soundFX.correct();
      const earned = Math.max(15, 70 - nextGuesses.length * 10);
      const nextScore = gwScore + earned;
      setGwScore(nextScore);
      onScoreChange(nextScore);
      onCharacterReact('correct', `Cracked "${gwTarget}" in ${nextGuesses.length} tries! +${earned} pts`);
      setTimeout(() => {
        if (gwRound + 1 >= 3) {
          onFinishGame(nextScore, 'Completed 3 Guess-the-Word rounds!', [`Final Score: ${nextScore}`]);
        } else {
          onAdvanceLevel(gwRound + 2, `Round ${gwRound + 2}: Fresh 5-Letter Vault`, 'New secret word locked in!');
          setGwRound(gwRound + 1);
          setGwGuesses([]);
        }
      }, 800);
    } else if (nextGuesses.length >= 6) {
      soundFX.wrong();
      onCharacterReact('oops', `The secret word was ${gwTarget}!`);
      setTimeout(() => {
        onFinishGame(gwScore, `Out of tries! Secret word was ${gwTarget}.`, [`Score: ${gwScore}`]);
      }, 900);
    } else {
      soundFX.click();
    }
  };

  const getTileColor = (guess: string, col: number) => {
    const ch = guess[col];
    if (gwTarget[col] === ch) return 'bg-emerald-600 border-emerald-600 text-white';
    if (gwTarget.includes(ch)) return 'bg-amber-500 border-amber-500 text-white';
    return 'bg-slate-600 border-slate-600 text-white';
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
        <span>WORD {gwRound + 1} / 3</span>
        <span>ATTEMPT {gwGuesses.length} / 6</span>
      </div>

      <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-5 sm:p-6 shadow-xl space-y-5">
        <div className="grid grid-rows-6 gap-2 max-w-[280px] mx-auto">
          {Array.from({ length: 6 }).map((_, r) => {
            const word = gwGuesses[r] || (r === gwGuesses.length ? gwCurrent : '');
            const isSubmitted = r < gwGuesses.length;
            return (
              <div key={r} className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((__, c) => {
                  const ch = word[c] || '';
                  const cls = isSubmitted
                    ? getTileColor(word, c)
                    : ch
                    ? 'bg-white border-slate-800 text-slate-900'
                    : 'bg-slate-100 border-slate-300 text-slate-400';
                  return (
                    <div
                      key={c}
                      className={`aspect-square rounded-lg border-2 font-mono text-xl font-bold flex items-center justify-center ${cls}`}
                    >
                      {ch}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => (
            <button
              key={l}
              onClick={() => {
                if (gwCurrent.length < 5) setGwCurrent((c) => c + l);
              }}
              className="w-8 h-9 rounded-md bg-slate-200 hover:bg-slate-300 font-mono text-xs font-bold text-slate-900 cursor-pointer"
            >
              {l}
            </button>
          ))}
          <button
            onClick={() => setGwCurrent((c) => c.slice(0, -1))}
            className="px-2.5 h-9 rounded-md bg-slate-300 text-xs font-bold cursor-pointer"
          >
            DEL
          </button>
          <button
            onClick={submitWordGuess}
            disabled={gwCurrent.length !== 5}
            className="px-3 h-9 rounded-md bg-[#FF5A36] disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
          >
            ENTER
          </button>
        </div>
      </div>
    </div>
  );
};
