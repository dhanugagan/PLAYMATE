import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Volume2, Sparkles, Check, SkipForward, HelpCircle, Send, ThumbsUp } from 'lucide-react';
import { GameEngineProps } from './types';
import { EMOJI_STORIES, CHARADES_DECK, SOUND_CLIPS } from '../data/gameContentBank';
import { soundFX } from '../utils/sound';

const DRAW_PROMPTS = ['ROCKET', 'CASTLE', 'GUITAR', 'SUNFLOWER', 'BICYCLE', 'LIGHTHOUSE'];
const STUDIO_SKETCHES: { word: string; strokes: [number, number][][] }[] = [
  {
    word: 'HOUSE',
    strokes: [
      [[100, 150], [100, 90], [220, 90], [220, 150], [100, 150]],
      [[90, 90], [160, 40], [230, 90]],
      [[145, 150], [145, 115], [175, 115], [175, 150]],
    ],
  },
  {
    word: 'SUN',
    strokes: [
      [[160, 70], [185, 80], [195, 105], [185, 130], [160, 140], [135, 130], [125, 105], [135, 80], [160, 70]],
      [[160, 45], [160, 60]],
      [[160, 150], [160, 165]],
      [[100, 105], [115, 105]],
      [[205, 105], [220, 105]],
    ],
  },
  {
    word: 'BOAT',
    strokes: [
      [[90, 130], [230, 130], [205, 165], [115, 165], [90, 130]],
      [[160, 130], [160, 55]],
      [[160, 60], [210, 115], [160, 115]],
    ],
  },
];

export const CreativeSocialEngine: React.FC<GameEngineProps> = ({
  game,
  playerName,
  onScoreChange,
  onCharacterReact,
  onAdvanceLevel,
  onFinishGame,
  sendRoomEvent,
  lastRoomEvent,
}) => {
  // --- GAMES #35 & #36: DRAWING BATTLE / GUESS MY DRAWING ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#0F1117');
  const [brushSize, setBrushSize] = useState(5);
  const [promptIdx, setPromptIdx] = useState(0);
  const [drawGuess, setDrawGuess] = useState('');
  const [drawScore, setDrawScore] = useState(0);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);

  // Sync incoming WebSocket drawing strokes if in a room
  useEffect(() => {
    if ((game.id !== 35 && game.id !== 36) || !lastRoomEvent) return;
    if (lastRoomEvent.eventType === 'draw:stroke' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const { x1, y1, x2, y2, color, size } = lastRoomEvent as unknown as {
        x1: number; y1: number; x2: number; y2: number; color: string; size: number;
      };
      ctx.strokeStyle = color || '#0F1117';
      ctx.lineWidth = size || 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (lastRoomEvent.eventType === 'draw:clear' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [lastRoomEvent, game.id]);

  // Animated studio sketch playback for Game #36 (Guess My Drawing)
  useEffect(() => {
    if (game.id !== 36 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sketch = STUDIO_SKETCHES[promptIdx % STUDIO_SKETCHES.length];
    let sIdx = 0;
    let pIdx = 1;
    const timer = setInterval(() => {
      if (sIdx >= sketch.strokes.length) {
        clearInterval(timer);
        return;
      }
      const stroke = sketch.strokes[sIdx];
      if (pIdx >= stroke.length) {
        sIdx++;
        pIdx = 1;
        return;
      }
      const [x1, y1] = stroke[pIdx - 1];
      const [x2, y2] = stroke[pIdx];
      ctx.strokeStyle = '#FF5A36';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      pIdx++;
    }, 260);
    return () => clearInterval(timer);
  }, [game.id, promptIdx]);

  if (game.id === 35 || game.id === 36) {
    const isGuessMode = game.id === 36;
    const targetWord = isGuessMode
      ? STUDIO_SKETCHES[promptIdx % STUDIO_SKETCHES.length].word
      : DRAW_PROMPTS[promptIdx % DRAW_PROMPTS.length];

    const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * e.currentTarget.width,
        y: ((e.clientY - rect.top) / rect.height) * e.currentTarget.height,
      };
    };

    const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isGuessMode) return;
      setDrawing(true);
      lastPtRef.current = getCoords(e);
    };

    const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing || isGuessMode || !canvasRef.current || !lastPtRef.current) return;
      const pt = getCoords(e);
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();

      sendRoomEvent?.('draw:stroke', {
        x1: lastPtRef.current.x,
        y1: lastPtRef.current.y,
        x2: pt.x,
        y2: pt.y,
        color: brushColor,
        size: brushSize,
      });
      lastPtRef.current = pt;
    };

    const clearCanvas = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      sendRoomEvent?.('draw:clear', {});
    };

    const submitGuessOrSketch = (e: React.FormEvent) => {
      e.preventDefault();
      if (isGuessMode) {
        if (drawGuess.trim().toUpperCase() === targetWord) {
          soundFX.correct();
          const nextScore = drawScore + 25;
          setDrawScore(nextScore);
          onScoreChange(nextScore);
          onCharacterReact('correct', `Yes! It’s a ${targetWord}! +25 pts`);
          setDrawGuess('');
          if (promptIdx + 1 >= STUDIO_SKETCHES.length) {
            onFinishGame(nextScore, 'Guessed every studio drawing!', [`Score: ${nextScore}`]);
          } else {
            onAdvanceLevel(promptIdx + 2, `Sketch ${promptIdx + 2}`, 'Watch the next live strokes!');
            setPromptIdx(promptIdx + 1);
          }
        } else {
          soundFX.wrong();
          onCharacterReact('oops', 'Keep watching the strokes—try another guess!');
        }
      } else {
        soundFX.correct();
        const nextScore = drawScore + 20;
        setDrawScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('excited', `Great ${targetWord} sketch! +20 pts`);
        clearCanvas();
        if (promptIdx + 1 >= 3) {
          onFinishGame(nextScore, 'Completed 3 Drawing Battle sketches!', [`Score: ${nextScore}`]);
        } else {
          onAdvanceLevel(promptIdx + 2, `Canvas Round ${promptIdx + 2}`, 'New secret word unlocked!');
          setPromptIdx(promptIdx + 1);
        }
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex justify-between items-center text-xs font-mono text-[#A6ACCD]">
          <span>{isGuessMode ? `SKETCH ${promptIdx + 1} / 3` : `DRAW PROMPT: ${targetWord}`}</span>
          <span>SCORE: {drawScore}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-5 shadow-xl space-y-4">
          {!isGuessMode && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {['#0F1117', '#FF5A36', '#10B981', '#3B82F6', '#F59E0B', '#FFFFFF'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    aria-label={`Color ${c}`}
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                      brushColor === c ? 'border-slate-900 scale-110' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {[3, 6, 12].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setBrushSize(sz)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer ${
                      brushSize === sz ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
                <button
                  onClick={clearCanvas}
                  className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer"
                  aria-label="Clear canvas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={340}
            height={210}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={() => setDrawing(false)}
            onPointerLeave={() => setDrawing(false)}
            className="w-full aspect-[16/10] bg-white rounded-xl border-2 border-slate-300 touch-none cursor-crosshair"
          />

          <form onSubmit={submitGuessOrSketch} className="flex gap-2">
            {isGuessMode ? (
              <>
                <input
                  type="text"
                  value={drawGuess}
                  onChange={(e) => setDrawGuess(e.target.value)}
                  placeholder="Type what is being drawn..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
                >
                  Guess
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="tactile-btn w-full py-3 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
              >
                Lock Sketch &amp; Next Prompt
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // --- GAME #37: CHARADES ---
  const [chIdx, setChIdx] = useState(0);
  const [chScore, setChScore] = useState(0);

  if (game.id === 37) {
    const card = CHARADES_DECK[chIdx % CHARADES_DECK.length];
    const nextCard = (gotIt: boolean) => {
      let nextScore = chScore;
      if (gotIt) {
        soundFX.correct();
        nextScore += 15;
        setChScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', 'Standing ovation! +15 pts');
      } else {
        soundFX.click();
        onCharacterReact('thinking', 'Skipped—next actor step up!');
      }
      if (chIdx + 1 >= 6) {
        onFinishGame(nextScore, 'Charades spotlight round complete!', [`Prompts Acted: ${nextScore / 15}`]);
      } else {
        setChIdx(chIdx + 1);
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>PROMPT {chIdx + 1} / 6</span>
          <span>CATEGORY: {card.category}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-8 shadow-xl text-center space-y-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Act Without Speaking</div>
          <div className="text-2xl sm:text-3xl font-display font-bold">{card.word}</div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => nextCard(false)}
              className="tactile-btn py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <SkipForward className="w-4 h-4" /> Skip
            </button>
            <button
              onClick={() => nextCard(true)}
              className="tactile-btn py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Team Guessed It!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME #38: EMOJI STORY ---
  const [emIdx, setEmIdx] = useState(0);
  const [emHint, setEmHint] = useState(false);
  const [emPicked, setEmPicked] = useState<string | null>(null);
  const [emScore, setEmScore] = useState(0);

  if (game.id === 38) {
    const cur = EMOJI_STORIES[emIdx % EMOJI_STORIES.length];

    const pickEmoji = (opt: string) => {
      if (emPicked) return;
      setEmPicked(opt);
      if (opt === cur.answer) {
        soundFX.correct();
        const pts = emHint ? 10 : 15;
        const nextScore = emScore + pts;
        setEmScore(nextScore);
        onScoreChange(nextScore);
        onCharacterReact('correct', `Decoded "${cur.answer}"! +${pts} pts`);
      } else {
        soundFX.wrong();
        onCharacterReact('oops', `That emoji sequence meant "${cur.answer}".`);
      }
    };

    const nextEmoji = () => {
      if (emIdx + 1 >= EMOJI_STORIES.length) {
        onFinishGame(emScore, 'Decoded every Emoji Story!', [`Final Score: ${emScore}`]);
        return;
      }
      if (emIdx === 1) onAdvanceLevel(2, 'Level 2: Science & Milestones', 'Decode iconic moments!');
      if (emIdx === 3) onAdvanceLevel(3, 'Level 3: Proverbs & Champions', 'Final emoji puzzles!');
      setEmIdx(emIdx + 1);
      setEmHint(false);
      setEmPicked(null);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
          <span>EMOJI PUZZLE {emIdx + 1} / {EMOJI_STORIES.length}</span>
          <span>THEME: {cur.category}</span>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-6 text-center">
          <div className="text-4xl sm:text-5xl tracking-widest py-3">{cur.emojis}</div>

          {!emHint && !emPicked && (
            <button
              onClick={() => setEmHint(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" /> Show Text Hint
            </button>
          )}
          {emHint && (
            <div className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3">
              Hint: {cur.hint}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {cur.options.map((opt) => {
              let cls = 'bg-white border-slate-200 hover:border-[#FF5A36] text-slate-900';
              if (emPicked) {
                if (opt === cur.answer) cls = 'bg-emerald-600 border-emerald-600 text-white';
                else if (opt === emPicked) cls = 'bg-rose-600 border-rose-600 text-white';
              }
              return (
                <button
                  key={opt}
                  onClick={() => pickEmoji(opt)}
                  disabled={!!emPicked}
                  className={`tactile-btn px-4 py-3.5 rounded-xl border font-semibold text-sm cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {emPicked && (
            <div className="flex justify-end">
              <button
                onClick={nextEmoji}
                className="tactile-btn px-5 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
              >
                {emIdx + 1 >= EMOJI_STORIES.length ? 'Finish' : 'Next Story'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GAME #39: STORY BUILDER ---
  const [sentences, setSentences] = useState<{ author: string; text: string; votes: number }[]>([
    { author: 'Palette', text: 'At midnight, the museum clock chimed thirteen times and every board game piece began to glow.', votes: 1 },
  ]);
  const [draft, setDraft] = useState('');
  const [twistLoading, setTwistLoading] = useState(false);
  const [storyScore, setStoryScore] = useState(0);

  useEffect(() => {
    if (game.id === 39 && lastRoomEvent?.eventType === 'story:add') {
      const s = lastRoomEvent as unknown as { author: string; text: string };
      setSentences((prev) => [...prev, { author: s.author || 'Friend', text: s.text, votes: 0 }]);
    }
  }, [lastRoomEvent, game.id]);

  if (game.id === 39) {
    const addSentence = (e: React.FormEvent) => {
      e.preventDefault();
      if (!draft.trim()) return;
      soundFX.correct();
      const entry = { author: playerName, text: draft.trim(), votes: 0 };
      setSentences((prev) => [...prev, entry]);
      sendRoomEvent?.('story:add', entry);
      setDraft('');
      const nextScore = storyScore + 15;
      setStoryScore(nextScore);
      onScoreChange(nextScore);
      onCharacterReact('excited', 'What a twist! Story chapter growing!');
    };

    const requestAITwist = async () => {
      setTwistLoading(true);
      try {
        const res = await fetch('/api/ai/story-twist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sentences: sentences.map((s) => s.text), theme: 'Mystery Adventure' }),
        });
        const data = await res.json();
        if (res.ok && data.sentence) {
          setSentences((prev) => [...prev, { author: 'AI Co-Author', text: data.sentence, votes: 0 }]);
          onCharacterReact('excited', 'Plot twist added by Gemini!');
        } else {
          onCharacterReact('oops', data.error || 'Could not reach AI twist.');
        }
      } catch {
        onCharacterReact('oops', 'AI twist unavailable—keep writing together!');
      } finally {
        setTwistLoading(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex justify-between items-center text-xs font-mono text-[#A6ACCD]">
          <span>STORY LINES: {sentences.length}</span>
          <button
            onClick={requestAITwist}
            disabled={twistLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2433] hover:bg-[#2A3044] border border-white/10 text-white cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{twistLoading ? 'Writing Twist...' : 'AI Plot Twist'}</span>
          </button>
        </div>

        <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-6 shadow-xl space-y-4">
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {sentences.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#FF5A36] mb-0.5">{s.author}</div>
                  <p className="text-sm text-slate-800 leading-relaxed">{s.text}</p>
                </div>
                <button
                  onClick={() => {
                    soundFX.click();
                    setSentences((prev) => prev.map((it, i) => (i === idx ? { ...it, votes: it.votes + 1 } : it)));
                  }}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-[#FF5A36] cursor-pointer"
                >
                  <ThumbsUp className="w-3 h-3" /> {s.votes}
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addSentence} className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add the next sentence to the story..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
            <button
              type="submit"
              className="tactile-btn px-4 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Add
            </button>
          </form>

          {sentences.length >= 4 && (
            <div className="flex justify-end">
              <button
                onClick={() => onFinishGame(storyScore + 20, 'Published collaborative group story!', [`Total Lines: ${sentences.length}`])}
                className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                Finish &amp; Publish Story →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GAME #40: GUESS THE SOUND ---
  const [sndIdx, setSndIdx] = useState(0);
  const [sndPicked, setSndPicked] = useState<string | null>(null);
  const [sndScore, setSndScore] = useState(0);
  const [playingWave, setPlayingWave] = useState(false);

  const curSound = SOUND_CLIPS[sndIdx % SOUND_CLIPS.length];

  const triggerClip = () => {
    setPlayingWave(true);
    soundFX.playClip(curSound.id);
    setTimeout(() => setPlayingWave(false), 1200);
  };

  const pickSound = (opt: string) => {
    if (sndPicked) return;
    setSndPicked(opt);
    if (opt === curSound.label) {
      soundFX.correct();
      const nextScore = sndScore + 15;
      setSndScore(nextScore);
      onScoreChange(nextScore);
      onCharacterReact('correct', `Sharp ears! That was ${curSound.label}!`);
    } else {
      soundFX.wrong();
      onCharacterReact('oops', `That clip was ${curSound.label}.`);
    }
  };

  const nextSound = () => {
    if (sndIdx + 1 >= 5) {
      onFinishGame(sndScore, 'Audio recognition challenge complete!', [`Score: ${sndScore}`]);
      return;
    }
    setSndIdx(sndIdx + 1);
    setSndPicked(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex justify-between text-xs font-mono text-[#A6ACCD]">
        <span>AUDIO CLIP {sndIdx + 1} / 5</span>
        <span>SCORE: {sndScore}</span>
      </div>

      <div className="rounded-2xl bg-[#FAF8F4] text-[#0F1117] p-7 shadow-xl space-y-6 text-center">
        <div className="flex items-center justify-center gap-1.5 h-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              animate={playingWave ? { scaleY: [0.3, 1.4, 0.4] } : { scaleY: 0.35 }}
              transition={{ duration: 0.35, repeat: playingWave ? Infinity : 0, delay: i * 0.04 }}
              className="w-2 h-8 rounded-full bg-[#FF5A36]"
            />
          ))}
        </div>

        <button
          onClick={triggerClip}
          className="tactile-btn mx-auto inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0F1117] text-white font-semibold cursor-pointer"
        >
          <Volume2 className="w-5 h-5 text-emerald-400" />
          <span>Play Sound Clip</span>
        </button>

        <div className="grid grid-cols-2 gap-3 text-left">
          {curSound.options.map((opt) => {
            let cls = 'bg-white border-slate-200 hover:border-[#FF5A36] text-slate-900';
            if (sndPicked) {
              if (opt === curSound.label) cls = 'bg-emerald-600 border-emerald-600 text-white';
              else if (opt === sndPicked) cls = 'bg-rose-600 border-rose-600 text-white';
            }
            return (
              <button
                key={opt}
                onClick={() => pickSound(opt)}
                disabled={!!sndPicked}
                className={`tactile-btn px-4 py-3 rounded-xl border font-semibold text-sm cursor-pointer ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {sndPicked && (
          <div className="flex justify-end">
            <button
              onClick={nextSound}
              className="tactile-btn px-5 py-2.5 rounded-xl bg-[#FF5A36] text-white font-semibold text-sm cursor-pointer"
            >
              {sndIdx + 1 >= 5 ? 'Finish' : 'Next Clip'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
