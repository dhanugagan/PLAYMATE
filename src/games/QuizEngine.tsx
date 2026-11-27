import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Eye, HelpCircle, SkipForward, CheckCircle2, XCircle, MapPin, ShieldAlert, Wallet } from 'lucide-react';
import { GameEngineProps } from './types';
import {
  QUIZ_BANKS,
  TRUE_FALSE_BANK,
  GUESS_ANSWER_BANK,
  PICTURE_QUIZ_BANK,
  GEOGRAPHY_CHALLENGES,
  QuizQuestion,
} from '../data/gameContentBank';
import { soundFX } from '../utils/sound';

// Render custom crisp SVG illustrations for Picture Quiz (#10)
const PictureIllustration: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'taj':
      return (
        <svg viewBox="0 0 240 160" className="w-full h-full bg-gradient-to-b from-sky-900 to-amber-900/40">
          <rect x="25" y="128" width="190" height="16" fill="#E2DFD7" />
          <rect x="42" y="65" width="10" height="65" fill="#F4F1EA" />
          <rect x="188" y="65" width="10" height="65" fill="#F4F1EA" />
          <rect x="75" y="75" width="90" height="55" fill="#FAF8F4" />
          <path d="M 85 75 Q 120 20 155 75 Z" fill="#FFFFFF" />
          <circle cx="120" cy="30" r="3" fill="#F59E0B" />
          <path d="M 105 130 L 105 95 Q 120 82 135 95 L 135 130 Z" fill="#334155" />
        </svg>
      );
    case 'rocket':
      return (
        <svg viewBox="0 0 240 160" className="w-full h-full bg-[#0D1326]">
          <circle cx="40" cy="30" r="2" fill="#FFF" />
          <circle cx="195" cy="42" r="2" fill="#FFF" />
          <circle cx="170" cy="120" r="1.5" fill="#FFF" />
          <path d="M 120 22 Q 145 55 140 105 L 100 105 Q 95 55 120 22 Z" fill="#F4F2ED" />
          <polygon points="100,88 80,115 102,105" fill="#FF5A36" />
          <polygon points="140,88 160,115 138,105" fill="#FF5A36" />
          <circle cx="120" cy="64" r="11" fill="#38BDF8" stroke="#1E293B" strokeWidth="3" />
          <polygon points="108,105 132,105 120,142" fill="#F59E0B" />
        </svg>
      );
    case 'dna':
      return (
        <svg viewBox="0 0 240 160" className="w-full h-full bg-[#101C24]">
          {[35, 55, 75, 95, 115, 135].map((y, idx) => (
            <line key={y} x1="80" y1={y} x2="160" y2={y} stroke={idx % 2 === 0 ? '#10B981' : '#38BDF8'} strokeWidth="4" />
          ))}
          <path d="M 80 20 Q 150 60 80 100 Q 150 130 80 150" fill="none" stroke="#FF5A36" strokeWidth="6" />
          <path d="M 160 20 Q 90 60 160 100 Q 90 130 160 150" fill="none" stroke="#FBBF24" strokeWidth="6" />
        </svg>
      );
    case 'lighthouse':
      return (
        <svg viewBox="0 0 240 160" className="w-full h-full bg-[#0F1E36]">
          <rect x="0" y="125" width="240" height="35" fill="#0284C7" />
          <polygon points="104,125 136,125 128,48 112,48" fill="#FAF8F4" />
          <polygon points="108,95 132,95 130,75 110,75" fill="#FF5A36" />
          <rect x="110" y="34" width="20" height="14" fill="#FBBF24" />
          <polygon points="130,38 235,16 235,62 130,44" fill="rgba(251,191,36,0.35)" />
        </svg>
      );
    case 'microscope':
      return (
        <svg viewBox="0 0 240 160" className="w-full h-full bg-[#181B28]">
          <rect x="75" y="128" width="90" height="12" rx="4" fill="#94A3B8" />
          <path d="M 145 128 Q 165 80 128 50" fill="none" stroke="#CBD5E1" strokeWidth="10" />
          <rect x="92" y="34" width="18" height="48" rx="3" transform="rotate(22 100 55)" fill="#38BDF8" />
          <rect x="85" y="102" width="52" height="6" fill="#F59E0B" />
        </svg>
      );
    case 'pyramid':
    default:
      return (
        <svg viewBox="0 0 240 160" className="w-full h-full bg-gradient-to-b from-amber-900/50 to-amber-700/30">
          <circle cx="185" cy="40" r="18" fill="#FBBF24" />
          <rect x="0" y="120" width="240" height="40" fill="#D97706" />
          <polygon points="45,125 115,35 175,125" fill="#F59E0B" />
          <polygon points="115,35 175,125 130,125" fill="#B45309" />
        </svg>
      );
  }
};

function generateMathQuestions(difficulty: string): QuizQuestion[] {
  const ops = difficulty === 'Easy' ? ['+', '-'] : difficulty === 'Medium' ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
  const maxN = difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 45 : 80;
  const list: QuizQuestion[] = [];
  for (let i = 0; i < 9; i++) {
    const op = ops[i % ops.length];
    let a = Math.floor(Math.random() * maxN) + 3;
    let b = Math.floor(Math.random() * (op === '×' ? 12 : maxN)) + 2;
    let ans = 0;
    if (op === '+') ans = a + b;
    else if (op === '-') {
      if (a < b) [a, b] = [b, a];
      ans = a - b;
    } else if (op === '×') ans = a * b;
    else {
      ans = Math.floor(Math.random() * 14) + 2;
      a = ans * b;
    }
    const distractors = new Set<number>([ans]);
    while (distractors.size < 4) {
      const delta = (Math.floor(Math.random() * 9) + 1) * (Math.random() > 0.5 ? 1 : -1);
      if (ans + delta >= 0) distractors.add(ans + delta);
    }
    const options = Array.from(distractors).sort(() => Math.random() - 0.5).map(String);
    list.push({
      prompt: `Solve rapidly: ${a} ${op} ${b} = ?`,
      options,
      correctIndex: options.indexOf(String(ans)),
      explanation: `${a} ${op} ${b} equals ${ans}.`,
      level: i < 3 ? 1 : i < 6 ? 2 : 3,
    });
  }
  return list;
}

export const QuizEngine: React.FC<GameEngineProps> = ({
  game,
  difficulty,
  mode,
  playerName,
  onScoreChange,
  onCharacterReact,
  onAdvanceLevel,
  onFinishGame,
}) => {
  const [score, setScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [teamScores, setTeamScores] = useState<{ A: number; B: number }>({ A: 0, B: 0 });
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A');
  const [survivors, setSurvivors] = useState(8);
  const [streak, setStreak] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [cluesShown, setCluesShown] = useState(1);
  const [maskedTiles, setMaskedTiles] = useState<boolean[]>(() =>
    [false, true, false, true, true, true, false, true, true]
  );
  const [rapidSeconds, setRapidSeconds] = useState(60);
  const [savingsMeter, setSavingsMeter] = useState(50);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [customBank, setCustomBank] = useState<QuizQuestion[] | null>(null);

  // Build initial question deck per game ID
  const baseQuestions = useMemo(() => {
    if (customBank) return customBank;
    if (game.id === 3) return generateMathQuestions(difficulty);
    if (QUIZ_BANKS[game.id]) return QUIZ_BANKS[game.id];
    // Games 6 (Rapid Fire), 9 (Who Knows More), 46 (Team Trivia), 47 (Survival), 48 (Daily)
    const combined = [
      ...QUIZ_BANKS[1].slice(0, 3),
      ...QUIZ_BANKS[2].slice(0, 3),
      ...QUIZ_BANKS[5].slice(0, 3),
      ...QUIZ_BANKS[4].slice(0, 3),
    ];
    return combined;
  }, [game.id, difficulty, customBank]);

  // Rapid Fire 60-second clock (#6)
  useEffect(() => {
    if (game.id !== 6) return;
    const t = setInterval(() => {
      setRapidSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          onFinishGame(score, `60-second Rapid Fire complete!`, [`Best Streak: ${streak}`]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [game.id, score, streak, onFinishGame]);

  const handleLoadAIQuestions = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameTitle: game.title,
          topic: game.objective,
          difficulty,
          count: 6,
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.questions)) {
        throw new Error(data.error || 'Could not generate AI questions.');
      }
      const mapped: QuizQuestion[] = data.questions.map((q: QuizQuestion, idx: number) => ({
        ...q,
        level: idx < 2 ? 1 : idx < 4 ? 2 : 3,
      }));
      setCustomBank(mapped);
      setIndex(0);
      setSelected(null);
      setFeedback(null);
      onCharacterReact('excited', 'Fresh AI-crafted questions loaded! Let’s roll!');
      soundFX.levelUp();
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI service unavailable.');
      onCharacterReact('oops', 'AI deck unavailable right now—playing curated studio bank!');
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger level transition at checkpoints
  const checkLevelTransition = (nextIdx: number, total: number) => {
    const third = Math.max(1, Math.floor(total / 3));
    if (nextIdx === third) {
      onAdvanceLevel(2, 'Level 2: Rising Heat', 'Higher stakes and sharper questions ahead!');
    } else if (nextIdx === third * 2) {
      onAdvanceLevel(3, 'Level 3: Grand Finale', 'Final stretch—lock in those bonus points!');
    }
  };

  // --- SPECIALIZED MODE: TRUE OR FALSE (#7) ---
  if (game.id === 7) {
    const item = TRUE_FALSE_BANK[index % TRUE_FALSE_BANK.length];
    const total = TRUE_FALSE_BANK.length;

    const pickTF = (choice: boolean) => {
      if (selected !== null) return;
      const isCorrect = choice === item.answer;
      setSelected(choice ? 1 : 0);
      if (isCorrect) {
        soundFX.correct();
        const nextScore = score + 10;
        setScore(nextScore);
        onScoreChange(nextScore);
        setStreak((s) => s + 1);
        onCharacterReact('correct', 'Myth busted cleanly! +10 pts');
      } else {
        soundFX.wrong();
        setStreak(0);
        onCharacterReact('oops', 'Surprising truth, right? Check the explanation!');
      }
      setFeedback(item.explanation);
    };

    const nextTF = () => {
      if (index + 1 >= total) {
        onFinishGame(score, `Completed all ${total} True or False statements!`, [`Final Score: ${score}`]);
        return;
      }
      checkLevelTransition(index + 1, total);
      setIndex(index + 1);
      setSelected(null);
      setFeedback(null);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
          <span>STATEMENT {index + 1} / {total}</span>
          <span>LEVEL {item.level} · STREAK {streak}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 sm:p-9 shadow-xl border border-white/20">
          <p className="text-xl sm:text-2xl font-display font-bold leading-snug text-center">
            “{item.statement}”
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { label: 'TRUE', val: true },
              { label: 'FALSE', val: false },
            ].map((btn) => {
              const picked = selected !== null && (selected === 1) === btn.val;
              const isAnswer = item.answer === btn.val;
              let style = 'bg-[#0F1117] text-white hover:bg-[#1E2436]';
              if (selected !== null) {
                if (isAnswer) style = 'bg-emerald-600 text-white ring-4 ring-emerald-300';
                else if (picked) style = 'bg-rose-600 text-white';
                else style = 'bg-slate-200 text-slate-500';
              }
              return (
                <button
                  key={btn.label}
                  onClick={() => pickTF(btn.val)}
                  disabled={selected !== null}
                  className={`tactile-btn py-5 rounded-xl text-lg font-display font-bold tracking-wide cursor-pointer ${style}`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-4"
            >
              <p className="text-sm text-slate-700">{feedback}</p>
              <button
                onClick={nextTF}
                className="tactile-btn shrink-0 px-4 py-2 rounded-lg bg-[#FF5A36] text-white text-sm font-semibold cursor-pointer"
              >
                {index + 1 >= total ? 'Finish' : 'Next'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // --- SPECIALIZED MODE: GUESS THE ANSWER (#8) ---
  if (game.id === 8) {
    const item = GUESS_ANSWER_BANK[index % GUESS_ANSWER_BANK.length];
    const total = GUESS_ANSWER_BANK.length;
    const potentialPoints = cluesShown === 1 ? 30 : cluesShown === 2 ? 20 : 10;

    const handleGuess = (optIdx: number) => {
      if (selected !== null) return;
      setSelected(optIdx);
      const isCorrect = item.options[optIdx] === item.answer;
      if (isCorrect) {
        soundFX.correct();
        const nextScore = score + potentialPoints;
        setScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', `Solved with ${cluesShown} clue(s)! +${potentialPoints} pts!`);
      } else {
        soundFX.wrong();
        onCharacterReact('oops', `The answer was ${item.answer}.`);
      }
      setFeedback(item.explanation);
    };

    const nextMystery = () => {
      if (index + 1 >= total) {
        onFinishGame(score, `Solved ${total} clue-based mysteries!`, [`Total Score: ${score}`]);
        return;
      }
      checkLevelTransition(index + 1, total);
      setIndex(index + 1);
      setCluesShown(1);
      setSelected(null);
      setFeedback(null);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
          <span>MYSTERY {index + 1} / {total}</span>
          <span className="text-amber-400">POTENTIAL REWARD: +{potentialPoints} PTS</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="space-y-2.5">
            {item.clues.slice(0, cluesShown).map((clue, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-slate-800"
              >
                <span className="font-mono font-bold text-amber-700 mr-2">Clue {idx + 1}:</span>
                {clue}
              </motion.div>
            ))}
          </div>

          {cluesShown < 3 && selected === null && (
            <button
              onClick={() => {
                soundFX.click();
                setCluesShown((c) => Math.min(3, c + 1));
                onCharacterReact('thinking', 'Extra clue unlocked—narrowing down the answer!');
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Reveal Next Clue (reduces reward to {cluesShown === 1 ? '20' : '10'} pts)
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {item.options.map((opt, idx) => {
              const isCorrect = opt === item.answer;
              let cls = 'bg-white border-slate-200 hover:border-slate-400 text-slate-900';
              if (selected !== null) {
                if (isCorrect) cls = 'bg-emerald-600 border-emerald-600 text-white';
                else if (selected === idx) cls = 'bg-rose-600 border-rose-600 text-white';
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleGuess(idx)}
                  disabled={selected !== null}
                  className={`tactile-btn text-left px-4 py-3.5 rounded-xl border font-semibold text-sm cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div className="p-4 rounded-xl bg-slate-100 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-700">{feedback}</p>
              <button
                onClick={nextMystery}
                className="tactile-btn shrink-0 px-4 py-2 rounded-lg bg-[#FF5A36] text-white text-sm font-semibold cursor-pointer"
              >
                {index + 1 >= total ? 'Finish' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SPECIALIZED MODE: PICTURE QUIZ (#10) ---
  if (game.id === 10) {
    const item = PICTURE_QUIZ_BANK[index % PICTURE_QUIZ_BANK.length];
    const total = PICTURE_QUIZ_BANK.length;
    const revealedCount = maskedTiles.filter((t) => !t).length;
    const reward = Math.max(10, 35 - revealedCount * 5);

    const revealTile = (tileIdx: number) => {
      if (!maskedTiles[tileIdx] || selected !== null) return;
      soundFX.flip();
      setMaskedTiles((prev) => prev.map((v, i) => (i === tileIdx ? false : v)));
    };

    const pickPic = (optIdx: number) => {
      if (selected !== null) return;
      setSelected(optIdx);
      setMaskedTiles(Array(9).fill(false));
      if (optIdx === item.correctIndex) {
        soundFX.correct();
        const nextScore = score + reward;
        setScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', `Sharp eyes! Earned +${reward} points!`);
      } else {
        soundFX.wrong();
        onCharacterReact('oops', `Look closely—it was ${item.label}!`);
      }
    };

    const nextPic = () => {
      if (index + 1 >= total) {
        onFinishGame(score, `Identified pictures across ${total} rounds!`, [`Final Score: ${score}`]);
        return;
      }
      checkLevelTransition(index + 1, total);
      setIndex(index + 1);
      setSelected(null);
      setMaskedTiles([false, true, false, true, true, true, false, true, true]);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
          <span>PICTURE {index + 1} / {total} · {item.category}</span>
          <span className="text-emerald-400">TAP TILES TO REVEAL · VALUE +{reward} PTS</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 shadow-xl space-y-5">
          <div className="relative w-full max-w-md mx-auto aspect-[3/2] rounded-xl overflow-hidden border-2 border-slate-300">
            <PictureIllustration id={item.visualId} />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {maskedTiles.map((covered, i) => (
                <button
                  key={i}
                  onClick={() => revealTile(i)}
                  disabled={!covered || selected !== null}
                  aria-label={`Reveal tile ${i + 1}`}
                  className={`border border-slate-700/40 transition-all duration-200 flex items-center justify-center ${
                    covered
                      ? 'bg-[#181B26] hover:bg-[#23283A] text-white/70 cursor-pointer'
                      : 'bg-transparent pointer-events-none'
                  }`}
                >
                  {covered && <Eye className="w-4 h-4 opacity-50" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {item.options.map((opt, idx) => {
              let cls = 'bg-white border-slate-200 hover:border-slate-400 text-slate-900';
              if (selected !== null) {
                if (idx === item.correctIndex) cls = 'bg-emerald-600 border-emerald-600 text-white';
                else if (selected === idx) cls = 'bg-rose-600 border-rose-600 text-white';
              }
              return (
                <button
                  key={opt}
                  onClick={() => pickPic(idx)}
                  disabled={selected !== null}
                  className={`tactile-btn px-4 py-3 rounded-xl border font-semibold text-sm cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="flex justify-end">
              <button
                onClick={nextPic}
                className="tactile-btn px-5 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
              >
                {index + 1 >= total ? 'Finish Picture Quiz' : 'Next Image'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SPECIALIZED MODE: GEOGRAPHY INTERACTIVE MAP CHALLENGE (#44) ---
  if (game.id === 44) {
    const item = GEOGRAPHY_CHALLENGES[index % GEOGRAPHY_CHALLENGES.length];
    const total = GEOGRAPHY_CHALLENGES.length;
    const [lastClicked, setLastClicked] = useState<string | null>(null);

    const regions = [
      { id: 'north_america', label: 'N. America', x: 52, y: 48, w: 92, h: 66, path: 'M 30 35 L 125 28 L 135 72 L 90 105 L 55 95 Z' },
      { id: 'south_america', label: 'S. America', x: 105, y: 120, w: 60, h: 80, path: 'M 95 112 L 145 120 L 132 190 L 105 182 Z' },
      { id: 'europe', label: 'Europe', x: 185, y: 40, w: 68, h: 45, path: 'M 172 34 L 240 28 L 248 68 L 175 72 Z' },
      { id: 'africa', label: 'Africa', x: 182, y: 90, w: 72, h: 85, path: 'M 170 84 L 235 88 L 245 135 L 210 172 L 175 130 Z' },
      { id: 'india', label: 'India', x: 268, y: 88, w: 46, h: 52, path: 'M 255 82 L 296 84 L 278 136 L 260 112 Z' },
      { id: 'oceania', label: 'Oceania', x: 320, y: 136, w: 68, h: 48, path: 'M 305 132 L 372 130 L 375 174 L 315 170 Z' },
    ];

    const handleMapClick = (regionId: string) => {
      if (lastClicked !== null) return;
      setLastClicked(regionId);
      if (regionId === item.targetRegion) {
        soundFX.correct();
        const nextScore = score + 15;
        setScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', 'Exact geographic pin! +15 pts!');
      } else {
        soundFX.wrong();
        onCharacterReact('oops', `Look at ${item.hint}`);
      }
    };

    const nextGeo = () => {
      if (index + 1 >= total) {
        onFinishGame(score, `Mapped all ${total} global targets!`, [`Total Score: ${score}`]);
        return;
      }
      checkLevelTransition(index + 1, total);
      setIndex(index + 1);
      setLastClicked(null);
    };

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
          <span>MAP TARGET {index + 1} / {total}</span>
          <span>HINT: {item.hint}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-display font-bold">
            <MapPin className="w-5 h-5 text-[#FF5A36]" />
            <span>{item.prompt}</span>
          </div>

          <div className="rounded-xl overflow-hidden bg-[#0E2238] border border-slate-300 p-2">
            <svg viewBox="0 0 410 210" className="w-full h-auto">
              {/* Ocean grid lines */}
              {[50, 100, 150].map((y) => (
                <line key={y} x1="0" y1={y} x2="410" y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              ))}
              {regions.map((reg) => {
                const isTarget = reg.id === item.targetRegion;
                const isPicked = reg.id === lastClicked;
                let fill = '#2C5278';
                if (lastClicked !== null) {
                  if (isTarget) fill = '#10B981';
                  else if (isPicked) fill = '#FB7185';
                }
                return (
                  <g
                    key={reg.id}
                    onClick={() => handleMapClick(reg.id)}
                    className="cursor-pointer group"
                  >
                    <path
                      d={reg.path}
                      fill={fill}
                      stroke="#E2E8F0"
                      strokeWidth="1.8"
                      className="transition-colors duration-150 group-hover:fill-[#FF5A36]"
                    />
                    <text
                      x={reg.x + reg.w / 3}
                      y={reg.y + reg.h / 3}
                      fill="#FAF8F4"
                      fontSize="9"
                      fontWeight="700"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {reg.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {lastClicked !== null && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-slate-700">
                {lastClicked === item.targetRegion ? 'Pinpoint accuracy!' : `Correct region highlighted in emerald.`}
              </span>
              <button
                onClick={nextGeo}
                className="tactile-btn px-5 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
              >
                {index + 1 >= total ? 'Complete Map' : 'Next Target'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STANDARD + SPECIALIZED MULTI-CHOICE ENGINES (1,2,3,4,5,6,9,21,43,45,46,47,48) ---
  const q = baseQuestions[index % baseQuestions.length];
  const total = game.id === 6 ? 99 : baseQuestions.length;

  const handleSelectOption = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const isCorrect = optIdx === q.correctIndex;

    if (game.id === 45) {
      setSavingsMeter((m) => Math.max(10, Math.min(100, isCorrect ? m + 12 : m - 10)));
    }

    if (isCorrect) {
      soundFX.correct();
      const speedBonus = game.id === 3 || game.id === 6 ? 5 : 0;
      const gained = 10 + speedBonus + (streak >= 2 ? 5 : 0);
      const nextScore = score + gained;
      setScore(nextScore);
      onScoreChange(nextScore);
      setStreak((s) => s + 1);
      if (game.id === 46) {
        setTeamScores((ts) => ({ ...ts, [activeTeam]: ts[activeTeam] + gained }));
      }
      if (game.id === 9) {
        const botHits = Math.random() > 0.35 ? 10 : 0;
        setRivalScore((rs) => rs + botHits);
      }
      onCharacterReact('correct', `+${gained} pts! ${q.explanation}`);
    } else {
      soundFX.wrong();
      setStreak(0);
      if (game.id === 47) {
        const nextSurv = Math.max(1, survivors - 2);
        setSurvivors(nextSurv);
        onCharacterReact('oops', `Elimination wave! ${nextSurv} contenders left in arena!`);
      } else {
        onCharacterReact('oops', q.explanation);
      }
      if (game.id === 9) {
        setRivalScore((rs) => rs + 10);
      }
    }
    setFeedback(q.explanation);

    // Rapid Fire auto-advances fast!
    if (game.id === 6) {
      setTimeout(() => {
        setIndex((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      }, 650);
    }
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      const summaryDetails = [`Score: ${score}`, `Peak Streak: ${streak}`];
      if (game.id === 9) summaryDetails.push(`Rival Bot: ${rivalScore}`);
      if (game.id === 46) summaryDetails.push(`Team Coral: ${teamScores.A} · Team Mint: ${teamScores.B}`);
      if (game.id === 47) summaryDetails.push(`Arena Survivors: ${survivors}/8`);
      onFinishGame(score, `Completed ${game.title}!`, summaryDetails);
      return;
    }
    checkLevelTransition(index + 1, total);
    setIndex(index + 1);
    setSelected(null);
    setFeedback(null);
    if (game.id === 46) {
      setActiveTeam((t) => (t === 'A' ? 'B' : 'A'));
    }
    if (game.id === 47 && survivors > 1) {
      setSurvivors((s) => Math.max(1, s - 1));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Mode-specific top telemetry strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#A6ACCD]">
        <div className="flex items-center gap-3">
          <span>
            {game.id === 6 ? `TURBO QUESTION ${index + 1}` : `ROUND ${index + 1} / ${total}`}
          </span>
          <span aria-hidden="true">·</span>
          <span>LEVEL {q.level}</span>
          {streak >= 2 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">STREAK {streak}x</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {game.id === 6 && (
            <span className="text-[#FF5A36] font-bold">TURBO CLOCK: {rapidSeconds}s</span>
          )}
          <button
            onClick={handleLoadAIQuestions}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2433] hover:bg-[#2A3044] border border-white/10 text-[#F4F2ED] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{aiLoading ? 'Generating...' : 'AI Fresh Pack'}</span>
          </button>
        </div>
      </div>

      {aiError && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-xs text-amber-200">
          {aiError}
        </div>
      )}

      {/* Specialized Head-to-Head bar (#9) */}
      {game.id === 9 && (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#191D29] p-4 border border-white/10">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#FF5A36]">{playerName}</span>
              <span className="font-mono tabular-nums">{score} pts</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#FF5A36] transition-all" style={{ width: `${Math.min(100, score)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-sky-400">Bot Challenger</span>
              <span className="font-mono tabular-nums">{rivalScore} pts</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-sky-400 transition-all" style={{ width: `${Math.min(100, rivalScore)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Specialized Team Trivia scoreboard (#46) */}
      {game.id === 46 && (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#191D29] p-4 border border-white/10">
          <div className={`p-3 rounded-lg border ${activeTeam === 'A' ? 'border-[#FF5A36] bg-[#FF5A36]/10' : 'border-white/5'}`}>
            <div className="text-xs text-[#FF5A36] font-semibold">Team Coral {activeTeam === 'A' ? '(Active Turn)' : ''}</div>
            <div className="text-xl font-mono font-bold tabular-nums mt-0.5">{teamScores.A} pts</div>
          </div>
          <div className={`p-3 rounded-lg border ${activeTeam === 'B' ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/5'}`}>
            <div className="text-xs text-emerald-400 font-semibold">Team Mint {activeTeam === 'B' ? '(Active Turn)' : ''}</div>
            <div className="text-xl font-mono font-bold tabular-nums mt-0.5">{teamScores.B} pts</div>
          </div>
        </div>
      )}

      {/* Specialized Survival Arena Strip (#47) */}
      {game.id === 47 && (
        <div className="flex items-center justify-between rounded-xl bg-[#191D29] px-4 py-3 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>Survival Arena: {survivors} / 8 Contenders Standing</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <span
                key={idx}
                className={`w-3 h-3 rounded-sm transition-colors ${idx < survivors ? 'bg-emerald-400' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Specialized Financial Literacy Savings Meter (#45) */}
      {game.id === 45 && (
        <div className="rounded-xl bg-[#191D29] px-4 py-3 border border-white/10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
              <Wallet className="w-4 h-4" /> Virtual Savings Health
            </span>
            <span className="font-mono tabular-nums">{savingsMeter}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${savingsMeter}%` }} />
          </div>
        </div>
      )}

      {/* Main Question Card */}
      <motion.div
        key={`${index}-${q.prompt}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 sm:p-8 shadow-xl space-y-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg sm:text-xl font-display font-bold leading-snug text-balance">
            {q.prompt}
          </h3>
          {game.id === 6 && (
            <button
              onClick={() => {
                soundFX.click();
                setIndex((i) => i + 1);
              }}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" /> Skip
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((opt, optIdx) => {
            const isCorrect = optIdx === q.correctIndex;
            const isPicked = selected === optIdx;
            let cls = 'bg-white border-slate-200 hover:border-[#FF5A36] hover:bg-orange-50/40 text-slate-900';
            if (selected !== null) {
              if (isCorrect) cls = 'bg-emerald-600 border-emerald-600 text-white';
              else if (isPicked) cls = 'bg-rose-600 border-rose-600 text-white';
              else cls = 'bg-slate-100 border-slate-200 text-slate-400';
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                disabled={selected !== null}
                className={`tactile-btn flex items-center justify-between gap-3 text-left px-4 py-3.5 rounded-xl border font-medium text-sm cursor-pointer ${cls}`}
              >
                <span>
                  <span className="font-mono font-bold mr-2 opacity-60">
                    {String.fromCharCode(65 + optIdx)}.
                  </span>
                  {opt}
                </span>
                {selected !== null && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {selected !== null && isPicked && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        {feedback && game.id !== 6 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <p className="text-sm text-slate-700 leading-relaxed">{feedback}</p>
            <button
              onClick={handleNext}
              className="tactile-btn shrink-0 px-5 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#e84b29] text-white text-sm font-semibold cursor-pointer"
            >
              {index + 1 >= total ? 'See Results' : 'Continue'}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
