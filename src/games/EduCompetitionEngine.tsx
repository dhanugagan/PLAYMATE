import React, { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, Play, Sparkles, Trophy, Search } from 'lucide-react';
import { GameEngineProps } from './types';
import { CODING_CHALLENGES, DEBUGGING_CHALLENGES, MYSTERY_CASES } from '../data/gameContentBank';
import { soundFX } from '../utils/sound';

export const EduCompetitionEngine: React.FC<GameEngineProps> = ({
  game,
  difficulty,
  playerName,
  onScoreChange,
  onCharacterReact,
  onAdvanceLevel,
  onFinishGame,
}) => {
  // --- GAME #41: CODING CHALLENGE ---
  const [codeIdx, setCodeIdx] = useState(0);
  const currentCode = CODING_CHALLENGES[codeIdx % CODING_CHALLENGES.length];
  const [arrangedLines, setArrangedLines] = useState<string[]>(() =>
    [...CODING_CHALLENGES[0].lines].sort(() => Math.random() - 0.5)
  );
  const [codeResult, setCodeResult] = useState<string | null>(null);
  const [codeScore, setCodeScore] = useState(0);

  if (game.id === 41) {
    const moveLine = (i: number, dir: -1 | 1) => {
      const target = i + dir;
      if (target < 0 || target >= arrangedLines.length) return;
      soundFX.click();
      const next = [...arrangedLines];
      [next[i], next[target]] = [next[target], next[i]];
      setArrangedLines(next);
      setCodeResult(null);
    };

    const runTests = () => {
      const passed = arrangedLines.every((line, idx) => line === currentCode.lines[idx]);
      if (passed) {
        soundFX.correct();
        const nextScore = codeScore + 25;
        setCodeScore(nextScore);
        onScoreChange(nextScore);
        setCodeResult('ALL TEST CASES PASSED!');
        onCharacterReact('correct', 'Clean algorithm! All unit tests green!');
      } else {
        soundFX.wrong();
        setCodeResult('Test Failed: Check loop initialization or return placement.');
        onCharacterReact('oops', 'Trace the execution order top to bottom!');
      }
    };

    const nextChallenge = () => {
      if (codeIdx + 1 >= CODING_CHALLENGES.length) {
        onFinishGame(codeScore, 'Passed all coding challenges!', [`Score: ${codeScore}`]);
        return;
      }
      const nextIdx = codeIdx + 1;
      onAdvanceLevel(nextIdx + 1, `Challenge ${nextIdx + 1}: ${CODING_CHALLENGES[nextIdx].title}`, 'New language & test assertions!');
      setCodeIdx(nextIdx);
      setArrangedLines([...CODING_CHALLENGES[nextIdx].lines].sort(() => Math.random() - 0.5));
      setCodeResult(null);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>PROBLEM {codeIdx + 1} / {CODING_CHALLENGES.length} · {currentCode.language}</span>
          <span>SCORE: {codeScore}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-lg font-display font-bold">{currentCode.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{currentCode.prompt}</p>
            <div className="mt-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">
              {currentCode.testCase}
            </div>
          </div>

          <div className="space-y-2 bg-[#0F172A] p-4 rounded-xl">
            {arrangedLines.map((line, i) => (
              <div
                key={`${i}-${line}`}
                className="flex items-center justify-between gap-3 bg-[#1E293B] px-3.5 py-2.5 rounded-lg text-emerald-300 font-mono text-xs sm:text-sm"
              >
                <span className="truncate">{line}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveLine(i, -1)}
                    disabled={i === 0}
                    aria-label="Move line up"
                    className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveLine(i, 1)}
                    disabled={i === arrangedLines.length - 1}
                    aria-label="Move line down"
                    className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={runTests}
              className="tactile-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm cursor-pointer"
            >
              <Play className="w-4 h-4" /> Run Test Cases
            </button>
            {codeResult && (
              <span className={`text-xs font-mono font-bold ${codeResult.includes('PASSED') ? 'text-emerald-700' : 'text-rose-600'}`}>
                {codeResult}
              </span>
            )}
          </div>

          {codeResult?.includes('PASSED') && (
            <div className="flex justify-end">
              <button
                onClick={nextChallenge}
                className="tactile-btn px-5 py-2 rounded-xl bg-[#FF5A36] text-white text-sm font-semibold cursor-pointer"
              >
                {codeIdx + 1 >= CODING_CHALLENGES.length ? 'Finish Suite' : 'Next Problem'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GAME #42: DEBUGGING BATTLE ---
  const [dbgIdx, setDbgIdx] = useState(0);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [fixChoice, setFixChoice] = useState<number | null>(null);
  const [dbgScore, setDbgScore] = useState(0);

  if (game.id === 42) {
    const bug = DEBUGGING_CHALLENGES[dbgIdx % DEBUGGING_CHALLENGES.length];

    const applyFix = (idx: number) => {
      if (fixChoice !== null) return;
      setFixChoice(idx);
      if (selectedLine === bug.bugLineIndex && idx === bug.correctFixIndex) {
        soundFX.correct();
        const nextScore = dbgScore + 25;
        setDbgScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', bug.explanation);
      } else {
        soundFX.wrong();
        onCharacterReact('oops', bug.explanation);
      }
    };

    const nextBug = () => {
      if (dbgIdx + 1 >= DEBUGGING_CHALLENGES.length) {
        onFinishGame(dbgScore, 'Debugged all code snippets!', [`Score: ${dbgScore}`]);
        return;
      }
      onAdvanceLevel(dbgIdx + 2, `Debug Level ${dbgIdx + 2}`, 'Inspect the next broken function!');
      setDbgIdx(dbgIdx + 1);
      setSelectedLine(null);
      setFixChoice(null);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>BUG {dbgIdx + 1} / {DEBUGGING_CHALLENGES.length} · {bug.language}</span>
          <span>STEP 1: CLICK BUGGY LINE · STEP 2: PICK PATCH</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 shadow-xl space-y-5">
          <h3 className="text-lg font-display font-bold">{bug.title}</h3>

          <div className="rounded-xl bg-[#0F172A] p-4 space-y-1 font-mono text-xs sm:text-sm">
            {bug.buggyLines.map((line, i) => (
              <button
                key={i}
                onClick={() => {
                  soundFX.click();
                  setSelectedLine(i);
                }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-3 cursor-pointer ${
                  selectedLine === i
                    ? 'bg-[#FF5A36] text-white'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span className="opacity-40 w-4">{i + 1}</span>
                <span>{line}</span>
              </button>
            ))}
          </div>

          {selectedLine !== null && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">Select the patch for line {selectedLine + 1}:</div>
              {bug.fixOptions.map((fix, idx) => (
                <button
                  key={idx}
                  onClick={() => applyFix(idx)}
                  disabled={fixChoice !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border font-mono text-xs cursor-pointer ${
                    fixChoice !== null && idx === bug.correctFixIndex
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : fixChoice === idx
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white border-slate-300 hover:border-[#FF5A36]'
                  }`}
                >
                  {fix}
                </button>
              ))}
            </div>
          )}

          {fixChoice !== null && (
            <div className="p-4 rounded-xl bg-slate-100 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-700">{bug.explanation}</p>
              <button
                onClick={nextBug}
                className="tactile-btn shrink-0 px-4 py-2 rounded-lg bg-[#FF5A36] text-white text-sm font-semibold cursor-pointer"
              >
                {dbgIdx + 1 >= DEBUGGING_CHALLENGES.length ? 'Finish' : 'Next Bug'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GAME #49: CHAMPIONSHIP BATTLE (8-Player Knockout Bracket) ---
  const [stageIdx, setStageIdx] = useState(0); // 0=QF, 1=SF, 2=Final
  const [champScore, setChampScore] = useState(0);
  const bracketMatches = useMemo(
    () => [
      { stage: 'Quarterfinal', rival: 'Nova Bot', q: 'Which planet is closest to the Sun?', opts: ['Venus', 'Mercury', 'Mars'], ans: 1, pts: 20 },
      { stage: 'Semifinal', rival: 'Vega Ace', q: 'What is 14 × 6 + 16?', opts: ['96', '100', '104'], ans: 1, pts: 35 },
      { stage: 'Grand Final', rival: 'Grandmaster Rex', q: 'Which data structure uses FIFO (First-In, First-Out)?', opts: ['Stack', 'Queue', 'Tree'], ans: 1, pts: 60 },
    ],
    []
  );

  if (game.id === 49) {
    const match = bracketMatches[stageIdx];
    const playDuel = (optIdx: number) => {
      if (optIdx === match.ans) {
        soundFX.correct();
        const nextScore = champScore + match.pts;
        setChampScore(nextScore);
        onScoreChange(nextScore);
        if (stageIdx < 2) {
          onAdvanceLevel(stageIdx + 2, `${bracketMatches[stageIdx + 1].stage} Qualified!`, `Defeated ${match.rival}!`);
          setStageIdx(stageIdx + 1);
        } else {
          onFinishGame(nextScore, 'Crowned PLAYMATE Championship Winner!', [`Trophy Unlocked`, `Total Score: ${nextScore}`]);
        }
      } else {
        soundFX.wrong();
        onFinishGame(champScore, `Knocked out in ${match.stage} by ${match.rival}.`, [`Score: ${champScore}`]);
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          {bracketMatches.map((m, i) => (
            <div
              key={m.stage}
              className={`py-2 px-3 rounded-lg border ${
                i === stageIdx
                  ? 'bg-[#FF5A36]/20 border-[#FF5A36] text-white font-bold'
                  : i < stageIdx
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-[#181B26] border-white/10 text-slate-400'
              }`}
            >
              {m.stage}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A36]">
              {match.stage} Duel: {playerName} vs {match.rival}
            </span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>

          <h3 className="text-xl font-display font-bold">{match.q}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {match.opts.map((opt, i) => (
              <button
                key={opt}
                onClick={() => playDuel(i)}
                className="tactile-btn py-3.5 px-4 rounded-xl bg-white border-2 border-slate-200 hover:border-[#FF5A36] font-semibold text-sm cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #50: MYSTERY CHALLENGE ---
  const [caseData, setCaseData] = useState(MYSTERY_CASES[0]);
  const [revealedClues, setRevealedClues] = useState<number[]>([0]);
  const [cipherInput, setCipherInput] = useState('');
  const [cipherSolved, setCipherSolved] = useState(false);
  const [accused, setAccused] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadAIMystery = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/mystery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });
      const data = await res.json();
      if (res.ok && data.episode) {
        setCaseData({
          ...MYSTERY_CASES[0],
          title: data.episode.title,
          briefing: data.episode.briefing,
          clues: data.episode.clues,
          suspects: data.episode.suspects,
          culpritIndex: data.episode.culpritIndex,
          explanation: data.episode.explanation,
          cipherPrompt: 'Bonus Check: Type "SOLVED" once you inspect all 3 clues:',
          cipherAnswer: 'SOLVED',
          cipherAccepted: ['SOLVED'],
        });
        setRevealedClues([0]);
        setCipherSolved(false);
        setAccused(null);
        onCharacterReact('excited', 'Fresh AI detective mission loaded!');
      } else {
        onCharacterReact('oops', data.error || 'Could not load AI episode.');
      }
    } catch {
      onCharacterReact('oops', 'AI episode generator unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const checkCipher = (e: React.FormEvent) => {
    e.preventDefault();
    if (caseData.cipherAccepted.includes(cipherInput.trim().toUpperCase())) {
      soundFX.correct();
      setCipherSolved(true);
      onScoreChange(30);
      onCharacterReact('correct', 'Evidence cipher unlocked! +30 pts');
    } else {
      soundFX.wrong();
      onCharacterReact('oops', 'Shift each letter 1 step BACK (M → L, B → A...)');
    }
  };

  const accuseSuspect = (idx: number) => {
    if (accused !== null) return;
    setAccused(idx);
    const total = (cipherSolved ? 30 : 0) + (idx === caseData.culpritIndex ? 70 : 10);
    if (idx === caseData.culpritIndex) {
      soundFX.victory();
      onScoreChange(total);
      onCharacterReact('victory', caseData.explanation);
    } else {
      soundFX.wrong();
      onCharacterReact('oops', caseData.explanation);
    }
    setTimeout(() => {
      onFinishGame(total, caseData.explanation, [`Culprit: ${caseData.suspects[caseData.culpritIndex]}`]);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-mono text-[#A6ACCD]">
        <span>CASE FILE: {caseData.title}</span>
        <button
          onClick={loadAIMystery}
          disabled={aiLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2433] hover:bg-[#2A3044] border border-white/10 text-white cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{aiLoading ? 'Creating Case...' : 'AI New Mystery'}</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 sm:p-8 shadow-xl space-y-6">
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{caseData.briefing}</p>

        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Evidence Clues</div>
          {caseData.clues.map((clue, idx) => {
            const open = revealedClues.includes(idx);
            return open ? (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-slate-800">
                <span className="font-mono font-bold text-amber-700 mr-2">Clue {idx + 1}:</span>
                {clue}
              </div>
            ) : (
              <button
                key={idx}
                onClick={() => {
                  soundFX.flip();
                  setRevealedClues((prev) => [...prev, idx]);
                }}
                className="w-full p-3 rounded-xl border border-dashed border-slate-300 hover:border-[#FF5A36] text-xs font-semibold text-slate-600 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" /> Inspect Evidence Clue #{idx + 1}
              </button>
            );
          })}
        </div>

        <form onSubmit={checkCipher} className="p-4 rounded-xl bg-slate-100 space-y-2.5">
          <div className="text-xs font-semibold text-slate-700">{caseData.cipherPrompt}</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={cipherInput}
              disabled={cipherSolved}
              onChange={(e) => setCipherInput(e.target.value)}
              placeholder="Decoded keyword..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm uppercase"
            />
            <button
              type="submit"
              disabled={cipherSolved}
              className="px-4 py-2 rounded-lg bg-[#0F1117] disabled:bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
            >
              {cipherSolved ? 'Unlocked' : 'Verify'}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Accuse the Culprit</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {caseData.suspects.map((sus, idx) => (
              <button
                key={sus}
                onClick={() => accuseSuspect(idx)}
                disabled={accused !== null}
                className={`tactile-btn p-3.5 rounded-xl border font-semibold text-sm cursor-pointer ${
                  accused !== null && idx === caseData.culpritIndex
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : accused === idx
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-white border-slate-200 hover:border-[#FF5A36]'
                }`}
              >
                {sus}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
