import React from 'react';
import { motion } from 'motion/react';

export type CharacterMood =
  | 'idle'
  | 'greeting'
  | 'thinking'
  | 'excited'
  | 'correct'
  | 'oops'
  | 'levelup'
  | 'victory';

export interface CharacterInfo {
  id: string;
  name: string;
  role: string;
  accent: string;
  quips: Record<CharacterMood, string>;
}

export const CHARACTER_ROSTER: CharacterInfo[] = [
  {
    id: 'owl',
    name: 'Prof. Hoot',
    role: 'Trivia Maestro',
    accent: '#FF5A36',
    quips: {
      idle: 'Ready when you are!',
      greeting: 'Hoo-ray! Let’s test those wits!',
      thinking: 'Hmm… examine every clue carefully.',
      excited: 'Sharp eye! Keep that streak alive!',
      correct: 'Spot on! +Points locked in!',
      oops: 'Close! Shake it off and soar on!',
      levelup: 'Level cleared! Next tier unlocked!',
      victory: 'Magnificent mastery! Take a bow!',
    },
  },
  {
    id: 'fox',
    name: 'Bolt the Fox',
    role: 'Speed Runner',
    accent: '#FB7185',
    quips: {
      idle: 'Fingers warmed up?',
      greeting: '3… 2… 1… let’s blitz this stage!',
      thinking: 'Stay locked in—watch the signal!',
      excited: 'Blazing pace! Don’t blink now!',
      correct: 'Lightning reflexes! Boom!',
      oops: 'Whoa—watch the decoy trap!',
      levelup: 'Hyper-gear engaged! Next level!',
      victory: 'Unstoppable speed! New record vibes!',
    },
  },
  {
    id: 'cat',
    name: 'Inspector Whiskers',
    role: 'Logic Sleuth',
    accent: '#10B981',
    quips: {
      idle: 'Every detail matters.',
      greeting: 'Magnifying glass ready. Let’s investigate!',
      thinking: 'Follow the pattern—eliminate the impossible.',
      excited: 'Purr-fect deduction!',
      correct: 'Elementary! Clue solved!',
      oops: 'A red herring! Re-check the evidence.',
      levelup: 'Case file advanced! Deeper puzzle ahead!',
      victory: 'Case closed with total brilliance!',
    },
  },
  {
    id: 'quill',
    name: 'Lexi Quill',
    role: 'Word Weaver',
    accent: '#F59E0B',
    quips: {
      idle: 'Letters await your command.',
      greeting: 'Let’s spell out something brilliant!',
      thinking: 'Look for roots, vowels, and rhythm…',
      excited: 'Poetic precision!',
      correct: 'Wordsmith perfection!',
      oops: 'Not quite that spelling—try another angle!',
      levelup: 'Chapter complete! Turning the page!',
      victory: 'Headline champion of words!',
    },
  },
  {
    id: 'rook',
    name: 'Rook Automaton',
    role: 'Grandmaster Bot',
    accent: '#38BDF8',
    quips: {
      idle: 'Board calibrated.',
      greeting: 'May the sharpest strategy prevail.',
      thinking: 'Calculating two moves ahead…',
      excited: 'Tactical advantage secured!',
      correct: 'Brilliant move! Tempo is yours!',
      oops: 'Watch that diagonal flank!',
      levelup: 'Endgame phase unlocked!',
      victory: 'Checkmate! Pure board dominance!',
    },
  },
  {
    id: 'chameleon',
    name: 'Palette',
    role: 'Studio Director',
    accent: '#A78BFA',
    quips: {
      idle: 'Canvas primed!',
      greeting: 'Time to paint, act, and improvise!',
      thinking: 'What’s the boldest creative angle?',
      excited: 'Ooh, pure studio magic!',
      correct: 'Standing ovation from the crew!',
      oops: 'Plot twist! Improvise and keep rolling!',
      levelup: 'Act Two begins! Cue the lights!',
      victory: 'Masterpiece complete! Bravo!',
    },
  },
  {
    id: 'byte',
    name: 'Byte CRT',
    role: 'Lab Mentor',
    accent: '#34D399',
    quips: {
      idle: 'Compiler standing by.',
      greeting: 'Booting challenge suite. Ready!',
      thinking: 'Trace the variables step by step…',
      excited: 'Zero errors! Clean execution!',
      correct: 'All test assertions passed!',
      oops: 'Syntax hiccup—check that edge case!',
      levelup: 'Module compiled! Advancing tier!',
      victory: '100% build success! Ship it!',
    },
  },
  {
    id: 'nova',
    name: 'Captain Nova',
    role: 'Arena Host',
    accent: '#FBBF24',
    quips: {
      idle: 'Arena gates open.',
      greeting: 'Welcome to the spotlight, contender!',
      thinking: 'Every point counts in the bracket!',
      excited: 'The crowd is roaring!',
      correct: 'Clutch play under pressure!',
      oops: 'Stay in the fight—comeback time!',
      levelup: 'Advancing to the next championship round!',
      victory: 'Champion crowned! Lift the trophy!',
    },
  },
];

interface CharacterCompanionProps {
  characterId: string;
  mood?: CharacterMood;
  size?: number;
  showBubble?: boolean;
  customMessage?: string;
  className?: string;
}

export const CharacterCompanion: React.FC<CharacterCompanionProps> = ({
  characterId,
  mood = 'idle',
  size = 84,
  showBubble = false,
  customMessage,
  className = '',
}) => {
  const info = CHARACTER_ROSTER.find((c) => c.id === characterId) || CHARACTER_ROSTER[0];
  const message = customMessage || info.quips[mood];

  const getBodyAnimation = () => {
    switch (mood) {
      case 'correct':
      case 'levelup':
      case 'victory':
        return {
          y: [0, -10, 0, -6, 0],
          rotate: [0, -5, 5, -3, 0],
          scale: [1, 1.07, 1],
        };
      case 'oops':
        return {
          x: [0, -5, 5, -4, 4, 0],
          rotate: [0, -4, 4, 0],
        };
      case 'thinking':
        return {
          rotate: [0, -4, -4, 0],
          y: [0, -2, 0],
        };
      case 'excited':
      case 'greeting':
        return {
          y: [0, -5, 0],
          scale: [1, 1.04, 1],
        };
      default:
        return {
          y: [0, -3, 0],
        };
    }
  };

  const isInfinite = mood === 'idle' || mood === 'thinking';

  const renderFaceEyes = (cx1: number, cx2: number, cy: number) => {
    if (mood === 'correct' || mood === 'victory' || mood === 'levelup') {
      return (
        <g stroke="#0F1117" strokeWidth="2.8" strokeLinecap="round" fill="none">
          <path d={`M ${cx1 - 5} ${cy + 1} Q ${cx1} ${cy - 5} ${cx1 + 5} ${cy + 1}`} />
          <path d={`M ${cx2 - 5} ${cy + 1} Q ${cx2} ${cy - 5} ${cx2 + 5} ${cy + 1}`} />
        </g>
      );
    }
    if (mood === 'oops') {
      return (
        <g stroke="#0F1117" strokeWidth="2.4" strokeLinecap="round">
          <line x1={cx1 - 4} y1={cy - 4} x2={cx1 + 4} y2={cy + 4} />
          <line x1={cx1 + 4} y1={cy - 4} x2={cx1 - 4} y2={cy + 4} />
          <line x1={cx2 - 4} y1={cy - 4} x2={cx2 + 4} y2={cy + 4} />
          <line x1={cx2 + 4} y1={cy - 4} x2={cx2 - 4} y2={cy + 4} />
        </g>
      );
    }
    return (
      <g>
        <circle cx={cx1} cy={cy} r="4.5" fill="#0F1117" />
        <circle cx={cx2} cy={cy} r="4.5" fill="#0F1117" />
        <circle cx={cx1 - 1.5} cy={cy - 1.5} r="1.5" fill="#FFFFFF" />
        <circle cx={cx2 - 1.5} cy={cy - 1.5} r="1.5" fill="#FFFFFF" />
      </g>
    );
  };

  const renderCharacterSVG = () => {
    switch (info.id) {
      case 'owl':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <circle cx="50" cy="54" r="36" fill="#2A2F42" stroke={info.accent} strokeWidth="2.5" />
            {/* Ear tufts */}
            <polygon points="24,28 36,24 30,38" fill="#D97745" />
            <polygon points="76,28 64,24 70,38" fill="#D97745" />
            {/* Body */}
            <ellipse cx="50" cy="58" rx="26" ry="27" fill="#C26A3E" />
            <ellipse cx="50" cy="66" rx="16" ry="17" fill="#FDE6C4" />
            {/* Scarf */}
            <path d="M 28 68 Q 50 76 72 68 L 70 77 Q 50 84 30 77 Z" fill="#FF5A36" />
            {/* Face & Glasses */}
            <circle cx="39" cy="48" r="10" fill="#FFF7EB" stroke="#F59E0B" strokeWidth="2.2" />
            <circle cx="61" cy="48" r="10" fill="#FFF7EB" stroke="#F59E0B" strokeWidth="2.2" />
            <line x1="49" y1="48" x2="51" y2="48" stroke="#F59E0B" strokeWidth="2.5" />
            {renderFaceEyes(39, 61, 48)}
            {/* Beak */}
            <polygon points="46,54 54,54 50,62" fill="#FBBF24" />
            {/* Graduation cap */}
            <polygon points="50,14 72,22 50,29 28,22" fill="#1E293B" stroke="#FBBF24" strokeWidth="1.5" />
            <line x1="68" y1="23" x2="68" y2="33" stroke="#FBBF24" strokeWidth="2" />
          </svg>
        );
      case 'fox':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <circle cx="50" cy="54" r="36" fill="#232838" stroke={info.accent} strokeWidth="2.5" />
            {/* Ears */}
            <polygon points="25,40 22,16 42,32" fill="#EA580C" />
            <polygon points="75,40 78,16 58,32" fill="#EA580C" />
            <polygon points="27,36 26,21 37,32" fill="#FED7AA" />
            <polygon points="73,36 74,21 63,32" fill="#FED7AA" />
            {/* Head */}
            <ellipse cx="50" cy="54" rx="25" ry="22" fill="#F97316" />
            <path d="M 27 56 Q 50 78 73 56 Q 50 64 27 56 Z" fill="#FFF7ED" />
            {/* Headphones */}
            <path d="M 22 50 A 28 28 0 0 1 78 50" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
            <rect x="17" y="44" width="9" height="16" rx="4" fill="#10B981" />
            <rect x="74" y="44" width="9" height="16" rx="4" fill="#10B981" />
            {renderFaceEyes(39, 61, 50)}
            <circle cx="50" cy="60" r="3.5" fill="#0F1117" />
          </svg>
        );
      case 'cat':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <circle cx="50" cy="54" r="36" fill="#1E272B" stroke={info.accent} strokeWidth="2.5" />
            <polygon points="26,42 28,20 43,34" fill="#78716C" />
            <polygon points="74,42 72,20 57,34" fill="#78716C" />
            <circle cx="50" cy="56" r="24" fill="#A8A29E" />
            {/* Detective cap */}
            <ellipse cx="50" cy="34" rx="22" ry="7" fill="#57534E" />
            <path d="M 32 34 Q 50 18 68 34 Z" fill="#78716C" />
            {/* Magnifier */}
            <circle cx="62" cy="53" r="10" fill="rgba(56,189,248,0.22)" stroke="#FBBF24" strokeWidth="2.5" />
            <line x1="69" y1="60" x2="78" y2="70" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
            {renderFaceEyes(40, 62, 53)}
            <polygon points="48,60 52,60 50,63" fill="#FB7185" />
            <line x1="28" y1="59" x2="38" y2="60" stroke="#44403C" strokeWidth="1.5" />
            <line x1="28" y1="64" x2="38" y2="63" stroke="#44403C" strokeWidth="1.5" />
          </svg>
        );
      case 'quill':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <circle cx="50" cy="54" r="36" fill="#2A241E" stroke={info.accent} strokeWidth="2.5" />
            {/* Songbird head & crest */}
            <path d="M 44 26 Q 52 12 60 24 Q 52 24 44 26 Z" fill="#F59E0B" />
            <circle cx="50" cy="55" r="24" fill="#FBBF24" />
            <ellipse cx="50" cy="64" rx="16" ry="13" fill="#FEF3C7" />
            {renderFaceEyes(40, 60, 50)}
            <polygon points="46,56 54,56 50,63" fill="#EA580C" />
            {/* Floating feather quill */}
            <path d="M 70 72 Q 86 46 82 28 Q 72 44 68 68 Z" fill="#FAF8F4" stroke="#F59E0B" strokeWidth="1.5" />
          </svg>
        );
      case 'rook':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <circle cx="50" cy="54" r="36" fill="#182433" stroke={info.accent} strokeWidth="2.5" />
            {/* Castle battlements */}
            <rect x="30" y="22" width="8" height="10" rx="1" fill="#94A3B8" />
            <rect x="46" y="22" width="8" height="10" rx="1" fill="#94A3B8" />
            <rect x="62" y="22" width="8" height="10" rx="1" fill="#94A3B8" />
            <rect x="30" y="30" width="40" height="44" rx="6" fill="#CBD5E1" />
            {/* Visor screen */}
            <rect x="34" y="40" width="32" height="18" rx="4" fill="#0F172A" />
            <circle cx="42" cy="49" r="3.5" fill={mood === 'oops' ? '#FB7185' : '#38BDF8'} />
            <circle cx="58" cy="49" r="3.5" fill={mood === 'oops' ? '#FB7185' : '#38BDF8'} />
            <rect x="38" y="64" width="24" height="5" rx="2" fill="#38BDF8" />
          </svg>
        );
      case 'chameleon':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <circle cx="50" cy="54" r="36" fill="#272038" stroke={info.accent} strokeWidth="2.5" />
            {/* Beret */}
            <ellipse cx="48" cy="30" rx="20" ry="8" fill="#FF5A36" transform="rotate(-10 48 30)" />
            <circle cx="50" cy="56" r="24" fill="#8B5CF6" />
            <circle cx="38" cy="50" r="8" fill="#DDD6FE" />
            <circle cx="62" cy="50" r="8" fill="#DDD6FE" />
            {renderFaceEyes(38, 62, 50)}
            <path d="M 40 66 Q 50 73 60 66" fill="none" stroke="#FDE047" strokeWidth="2.8" strokeLinecap="round" />
            {/* Brush */}
            <line x1="72" y1="68" x2="84" y2="42" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="85" cy="39" r="4" fill="#34D399" />
          </svg>
        );
      case 'byte':
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <circle cx="50" cy="54" r="36" fill="#172725" stroke={info.accent} strokeWidth="2.5" />
            {/* Antenna */}
            <line x1="50" y1="18" x2="50" y2="30" stroke="#34D399" strokeWidth="3" />
            <circle cx="50" cy="16" r="4" fill="#FBBF24" />
            {/* CRT chassis */}
            <rect x="26" y="30" width="48" height="44" rx="10" fill="#E2E8F0" />
            <rect x="32" y="36" width="36" height="28" rx="5" fill="#0F172A" />
            {mood === 'correct' || mood === 'victory' ? (
              <text x="50" y="55" textAnchor="middle" fill="#34D399" fontSize="14" fontFamily="monospace" fontWeight="bold">
                ★_★
              </text>
            ) : mood === 'oops' ? (
              <text x="50" y="55" textAnchor="middle" fill="#FB7185" fontSize="14" fontFamily="monospace" fontWeight="bold">
                &gt;_&lt;
              </text>
            ) : mood === 'thinking' ? (
              <text x="50" y="55" textAnchor="middle" fill="#FBBF24" fontSize="14" fontFamily="monospace" fontWeight="bold">
                o_O
              </text>
            ) : (
              <text x="50" y="55" textAnchor="middle" fill="#34D399" fontSize="14" fontFamily="monospace" fontWeight="bold">
                ^_^
              </text>
            )}
          </svg>
        );
      case 'nova':
      default:
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <circle cx="50" cy="54" r="36" fill="#2A2418" stroke={info.accent} strokeWidth="2.5" />
            {/* Star cape silhouette */}
            <polygon
              points="50,18 59,38 80,41 64,56 68,77 50,67 32,77 36,56 20,41 41,38"
              fill="#FBBF24"
              stroke="#F59E0B"
              strokeWidth="2"
            />
            {renderFaceEyes(43, 57, 48)}
            <path d="M 43 58 Q 50 64 57 58" fill="none" stroke="#0F1117" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <motion.div
        key={`${info.id}-${mood}`}
        animate={getBodyAnimation()}
        transition={{
          duration: mood === 'idle' ? 2.6 : 0.55,
          repeat: isInfinite ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="relative shrink-0"
      >
        {renderCharacterSVG()}
      </motion.div>

      {showBubble && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22 }}
          className="relative max-w-xs rounded-xl bg-[#1C202E] border border-white/10 px-3.5 py-2 text-xs leading-relaxed text-[#F4F2ED] shadow-lg"
        >
          <div className="font-semibold text-[11px] mb-0.5" style={{ color: info.accent }}>
            {info.name}
          </div>
          <div>{message}</div>
        </motion.div>
      )}
    </div>
  );
};
