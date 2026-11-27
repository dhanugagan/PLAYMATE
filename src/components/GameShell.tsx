import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, RotateCcw, Award, Clock, Users } from 'lucide-react';
import { CATEGORIES, Difficulty, GameSpec, PlayMode } from '../data/gamesCatalog';
import { CharacterCompanion, CharacterMood } from './CharacterCompanion';
import { LevelTransitionData } from './LevelTransitionOverlay';
import { QuizEngine } from '../games/QuizEngine';
import { BrainPuzzleEngine } from '../games/BrainPuzzleEngine';
import { WordLanguageEngine } from '../games/WordLanguageEngine';
import { BoardGamesEngine } from '../games/BoardGamesEngine';
import { ArcadeEngine } from '../games/ArcadeEngine';
import { CreativeSocialEngine } from '../games/CreativeSocialEngine';
import { EduCompetitionEngine } from '../games/EduCompetitionEngine';
import { soundFX } from '../utils/sound';

export interface MatchRecord {
  id: string;
  gameId: number;
  gameTitle: string;
  score: number;
  difficulty: Difficulty;
  rank: 'S' | 'A' | 'B' | 'C';
  xpEarned: number;
  playedAt: string;
}

interface GameShellProps {
  game: GameSpec;
  playerName: string;
  playerCharacterId: string;
  roomCode?: string;
  sendRoomScore?: (score: number) => void;
  sendRoomEvent?: (eventType: string, payload: Record<string, unknown>) => void;
  lastRoomEvent?: { fromId?: string; eventType?: string; [key: string]: unknown } | null;
  onTriggerTransition: (data: Omit<LevelTransitionData, 'visible'>, durationMs?: number) => void;
  onCompleteMatch: (record: MatchRecord) => void;
  onExit: () => void;
  onNextGame?: () => void;
}

type StageState = 'READY' | 'PLAYING' | 'RESULTS';

export const GameShell: React.FC<GameShellProps> = ({
  game,
  playerName,
  playerCharacterId,
  roomCode,
  sendRoomScore,
  sendRoomEvent,
  lastRoomEvent,
  onTriggerTransition,
  onCompleteMatch,
  onExit,
  onNextGame,
}) => {
  const category = CATEGORIES.find((c) => c.id === game.category) || CATEGORIES[0];
  const hostCharacterId = category.characterId;

  const [stage, setStage] = useState<StageState>('READY');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [mode, setMode] = useState<PlayMode>(roomCode ? 'Room' : game.modes[0]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(game.defaultSeconds);
  const [charMood, setCharMood] = useState<CharacterMood>('greeting');
  const [charMessage, setCharMessage] = useState<string | undefined>(undefined);
  const [resultSummary, setResultSummary] = useState('');
  const [resultDetails, setResultDetails] = useState<string[]>([]);
  const [runKey, setRunKey] = useState(0);

  // Reset when game changes
  useEffect(() => {
    setStage('READY');
    setLevel(1);
    setScore(0);
    setSecondsLeft(game.defaultSeconds);
    setCharMood('greeting');
    setCharMessage(undefined);
    setMode(roomCode ? 'Room' : game.modes[0]);
  }, [game.id, game.defaultSeconds, game.modes, roomCode]);

  // Countdown timer during active gameplay
  useEffect(() => {
    if (stage !== 'PLAYING') return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [stage]);

  const handleStartGame = () => {
    soundFX.levelUp();
    setScore(0);
    setLevel(1);
    setSecondsLeft(game.defaultSeconds);
    setRunKey((k) => k + 1);
    onTriggerTransition(
      {
        style: category.transitionStyle,
        characterId: hostCharacterId,
        stepLabel: `LEVEL 1 · ${difficulty.toUpperCase()}`,
        title: game.title,
        subtitle: `${category.characterName}: “${game.objective}”`,
        accentHex: category.accentHex,
        mood: 'excited',
      },
      750
    );
    setTimeout(() => {
      setStage('PLAYING');
      setCharMood('idle');
      setCharMessage(undefined);
    }, 320);
  };

  const handleScoreChange = useCallback(
    (newScore: number) => {
      setScore(newScore);
      sendRoomScore?.(newScore);
    },
    [sendRoomScore]
  );

  const handleCharacterReact = useCallback((mood: CharacterMood, message?: string) => {
    setCharMood(mood);
    setCharMessage(message);
  }, []);

  const handleAdvanceLevel = useCallback(
    (nextLevel: number, label: string, subtitle: string) => {
      soundFX.levelUp();
      setLevel(nextLevel);
      setCharMood('levelup');
      setCharMessage(subtitle);
      onTriggerTransition(
        {
          style: category.transitionStyle,
          characterId: hostCharacterId,
          stepLabel: `STEP ${nextLevel} UNLOCKED`,
          title: label,
          subtitle,
          accentHex: category.accentHex,
          mood: 'levelup',
        },
        780
      );
    },
    [category.accentHex, category.transitionStyle, hostCharacterId, onTriggerTransition]
  );

  const handleFinishGame = useCallback(
    (finalScore: number, summary: string, details: string[] = []) => {
      soundFX.victory();
      setScore(finalScore);
      setResultSummary(summary);
      setResultDetails(details);
      const rank: MatchRecord['rank'] =
        finalScore >= 70 ? 'S' : finalScore >= 45 ? 'A' : finalScore >= 20 ? 'B' : 'C';
      const xpEarned = Math.max(25, finalScore + (difficulty === 'Hard' ? 30 : difficulty === 'Medium' ? 15 : 0));

      onCompleteMatch({
        id: `${game.id}-${Date.now()}`,
        gameId: game.id,
        gameTitle: game.title,
        score: finalScore,
        difficulty,
        rank,
        xpEarned,
        playedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      onTriggerTransition(
        {
          style: category.transitionStyle,
          characterId: playerCharacterId,
          stepLabel: `RANK ${rank} · +${xpEarned} XP`,
          title: 'Stage Complete!',
          subtitle: summary,
          accentHex: category.accentHex,
          mood: 'victory',
        },
        750
      );
      setTimeout(() => {
        setStage('RESULTS');
        setCharMood('victory');
      }, 320);
    },
    [category.accentHex, category.transitionStyle, difficulty, game.id, game.title, onCompleteMatch, onTriggerTransition, playerCharacterId]
  );

  const renderEngine = () => {
    const props = {
      game,
      difficulty,
      mode,
      playerName,
      characterId: playerCharacterId,
      roomCode,
      onScoreChange: handleScoreChange,
      onCharacterReact: handleCharacterReact,
      onAdvanceLevel: handleAdvanceLevel,
      onFinishGame: handleFinishGame,
      sendRoomEvent,
      lastRoomEvent,
    };

    if ([11, 12, 13, 14, 15, 16].includes(game.id)) return <BrainPuzzleEngine key={runKey} {...props} />;
    if ([17, 18, 19, 20, 22].includes(game.id)) return <WordLanguageEngine key={runKey} {...props} />;
    if ([23, 24, 25, 26, 27, 28].includes(game.id)) return <BoardGamesEngine key={runKey} {...props} />;
    if ([29, 30, 31, 32, 33, 34].includes(game.id)) return <ArcadeEngine key={runKey} {...props} />;
    if ([35, 36, 37, 38, 39, 40].includes(game.id)) return <CreativeSocialEngine key={runKey} {...props} />;
    if ([41, 42, 49, 50].includes(game.id)) return <EduCompetitionEngine key={runKey} {...props} />;
    return <QuizEngine key={runKey} {...props} />;
  };

  const rank: MatchRecord['rank'] =
    score >= 70 ? 'S' : score >= 45 ? 'A' : score >= 20 ? 'B' : 'C';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Unobtrusive Game HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#181B26] border border-white/10 px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              soundFX.click();
              onExit();
            }}
            className="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#232737] hover:bg-[#2E3449] text-xs font-semibold text-[#F4F2ED] cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit
          </button>
          <div className="truncate">
            <div className="text-xs text-[#A6ACCD] font-mono">
              #{String(game.id).padStart(2, '0')} · {category.name} · {difficulty}
            </div>
            <h1 className="text-base sm:text-lg font-display font-bold text-[#F4F2ED] truncate">
              {game.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-5 font-mono text-sm tabular-nums">
          {stage === 'PLAYING' && (
            <>
              <div className="text-right">
                <div className="text-[10px] text-[#A6ACCD] uppercase">Step</div>
                <div className="font-bold text-amber-400">LVL {level}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#A6ACCD] uppercase">Time</div>
                <div className={`font-bold ${secondsLeft <= 15 ? 'text-rose-400' : 'text-[#F4F2ED]'}`}>
                  {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#A6ACCD] uppercase">Score</div>
                <div className="font-bold text-emerald-400">{score}</div>
              </div>
              <button
                onClick={handleStartGame}
                title="Restart Match"
                aria-label="Restart Match"
                className="p-2 rounded-lg bg-[#232737] hover:bg-[#2E3449] text-[#A6ACCD] hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* STEP 1: READY BRIEFING */}
      {stage === 'READY' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-stretch"
        >
          <div className="rounded-2xl bg-[#181B26] border border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <CharacterCompanion
                characterId={hostCharacterId}
                mood="greeting"
                size={88}
                showBubble
                customMessage={`Welcome to ${game.title}! ${game.objective}`}
              />

              <div className="pt-2">
                <div className="text-xs font-mono text-[#A6ACCD] uppercase tracking-wider mb-2">How to Play</div>
                <ol className="space-y-2 text-sm text-[#D6DAEA]">
                  {game.rules.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="font-mono text-xs font-bold mt-0.5" style={{ color: category.accentHex }}>
                        0{i + 1}.
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#A6ACCD]">
              <span>Players: {game.players} · Scoring: {game.scoring}</span>
              <span>{game.stage}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#181B26] border border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <div className="text-xs font-mono text-[#A6ACCD] uppercase tracking-wider mb-2">
                  Select Difficulty
                </div>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#0F1117]">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        soundFX.click();
                        setDifficulty(d);
                      }}
                      className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        difficulty === d
                          ? 'bg-[#FF5A36] text-white'
                          : 'text-[#A6ACCD] hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-[#A6ACCD] uppercase tracking-wider mb-2">
                  Player Mode
                </div>
                <div className="flex flex-wrap gap-2">
                  {game.modes.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        soundFX.click();
                        setMode(m);
                      }}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                        mode === m
                          ? 'bg-white text-[#0F1117] border-white'
                          : 'bg-[#0F1117] text-[#A6ACCD] border-white/10 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#121520] border border-white/10 p-4 text-xs text-[#A6ACCD] space-y-1">
                <div className="font-semibold text-[#F4F2ED]">Special Feature</div>
                <p>{game.specialFeature}</p>
                {roomCode && (
                  <div className="pt-2 text-emerald-400 font-mono flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Connected to Room {roomCode}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="tactile-btn w-full py-4 rounded-xl bg-[#FF5A36] hover:bg-[#eb4e2c] text-white font-display font-bold text-base inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Level 1</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: ACTIVE GAMEPLAY WITH LIVE CHARACTER COMPANION */}
      {stage === 'PLAYING' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 px-1">
            <CharacterCompanion
              characterId={playerCharacterId}
              mood={charMood}
              size={64}
              showBubble
              customMessage={charMessage}
            />
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#A6ACCD]">
              <Clock className="w-3.5 h-3.5" />
              <span>HOST: {category.characterName}</span>
            </div>
          </div>

          {renderEngine()}
        </div>
      )}

      {/* STEP 3: RESULTS & REWARDS PODIUM */}
      {stage === 'RESULTS' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto rounded-2xl bg-[#181B26] border border-white/15 p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="flex justify-center">
            <CharacterCompanion characterId={playerCharacterId} mood="victory" size={110} />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
              <Award className="w-4 h-4" /> Rank {rank} Performance
            </div>
            <h2 className="text-3xl font-display font-bold text-[#F4F2ED]">
              {score} Points Earned
            </h2>
            <p className="mt-2 text-sm text-[#A6ACCD]">{resultSummary}</p>
          </div>

          {resultDetails.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-[#11141E] p-4 rounded-xl border border-white/5">
              {resultDetails.map((d, i) => (
                <div key={i} className="text-[#D6DAEA]">{d}</div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartGame}
              className="tactile-btn px-5 py-3 rounded-xl bg-[#FF5A36] hover:bg-[#eb4e2c] text-white font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
            {onNextGame && (
              <button
                onClick={onNextGame}
                className="tactile-btn px-5 py-3 rounded-xl bg-[#252A3B] hover:bg-[#31384E] text-white font-semibold text-sm cursor-pointer"
              >
                Next Game
              </button>
            )}
            <button
              onClick={onExit}
              className="tactile-btn px-5 py-3 rounded-xl bg-transparent border border-white/15 hover:bg-white/5 text-[#A6ACCD] hover:text-white font-semibold text-sm cursor-pointer"
            >
              All 50 Games
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
