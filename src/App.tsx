import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Volume2, VolumeX, Play, Trophy, Sparkles, Gamepad2 } from 'lucide-react';
import { CATEGORIES, CategoryId, GAMES_CATALOG, GameSpec } from './data/gamesCatalog';
import { CHARACTER_ROSTER, CharacterCompanion, CharacterMood } from './components/CharacterCompanion';
import { LevelTransitionData, LevelTransitionOverlay } from './components/LevelTransitionOverlay';
import { GameShell, MatchRecord } from './components/GameShell';
import { MultiplayerRoomModal, RoomState } from './components/MultiplayerRoomModal';
import { soundFX } from './utils/sound';

const STORAGE_KEY = 'playmate_profile_v1';

interface PlayerProfile {
  name: string;
  characterId: string;
  xp: number;
  history: MatchRecord[];
}

function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PlayerProfile;
  } catch {
    // ignore storage errors
  }
  return {
    name: 'Player One',
    characterId: 'owl',
    xp: 0,
    history: [],
  };
}

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [playerId] = useState(() => `pm_${Math.random().toString(36).slice(2, 9)}`);
  const [muted, setMuted] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<GameSpec | null>(null);
  const [heroMood, setHeroMood] = useState<CharacterMood>('greeting');

  // Custom animated level transition overlay state
  const [transition, setTransition] = useState<LevelTransitionData | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  // WebSocket Multiplayer Room state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [lastRoomEvent, setLastRoomEvent] = useState<{ fromId?: string; eventType?: string; [key: string]: unknown } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore storage errors
    }
  }, [profile]);

  // Connect WebSocket for real multiplayer rooms
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let socket: WebSocket | null = null;
    let closedByUnmount = false;

    const connect = () => {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
        setRoomError(null);
      };
      socket.onclose = () => {
        setWsConnected(false);
        if (!closedByUnmount) {
          setTimeout(connect, 2500);
        }
      };
      socket.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as { type: string; payload: unknown };
          if (msg.type === 'room:state') {
            setRoom(msg.payload as RoomState);
            setRoomError(null);
          } else if (msg.type === 'room:error') {
            setRoomError((msg.payload as { message: string }).message);
          } else if (msg.type === 'room:started') {
            const { gameId } = msg.payload as { gameId: number };
            const found = GAMES_CATALOG.find((g) => g.id === gameId);
            if (found) {
              setRoomModalOpen(false);
              launchGameWithTransition(found);
            }
          } else if (msg.type === 'room:game_event') {
            setLastRoomEvent(msg.payload as { fromId?: string; eventType?: string });
          }
        } catch {
          // ignore malformed messages
        }
      };
    };

    connect();
    return () => {
      closedByUnmount = true;
      socket?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerTransition = (data: Omit<LevelTransitionData, 'visible'>, durationMs = 760) => {
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    setTransition({ ...data, visible: true });
    transitionTimeoutRef.current = window.setTimeout(() => {
      setTransition((prev) => (prev ? { ...prev, visible: false } : null));
    }, durationMs);
  };

  const launchGameWithTransition = (game: GameSpec) => {
    const cat = CATEGORIES.find((c) => c.id === game.category) || CATEGORIES[0];
    soundFX.levelUp();
    triggerTransition(
      {
        style: cat.transitionStyle,
        characterId: cat.characterId,
        stepLabel: `ENTERING #${String(game.id).padStart(2, '0')} · ${cat.name.toUpperCase()}`,
        title: game.title,
        subtitle: `Hosted by ${cat.characterName} · ${game.players} Players`,
        accentHex: cat.accentHex,
        mood: 'greeting',
      },
      720
    );
    setTimeout(() => {
      setActiveGame(game);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 260);
  };

  const handleCompleteMatch = (record: MatchRecord) => {
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + record.xpEarned,
      history: [record, ...prev.history].slice(0, 20),
    }));
  };

  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((g) => {
      const catMatch = selectedCategory === 'all' || g.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const textMatch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.objective.toLowerCase().includes(q) ||
        String(g.id) === q;
      return catMatch && textMatch;
    });
  }, [selectedCategory, searchQuery]);

  const playerLevel = Math.floor(profile.xp / 150) + 1;

  const sendWs = (type: string, payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  };

  const toggleMute = () => {
    const next = !muted;
    soundFX.muted = next;
    setMuted(next);
  };

  return (
    <div className="min-h-screen bg-[#0F1117] bg-stage-grid text-[#F4F2ED] flex flex-col">
      <LevelTransitionOverlay transition={transition} />

      {/* Top Bar Contract: 3 exact zones (Brand — Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0F1117]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveGame(null);
            }}
            className="text-xl font-display font-extrabold tracking-tight text-[#F4F2ED] whitespace-nowrap shrink-0"
          >
            PLAYMATE
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A6ACCD]">
            <a
              href="#games"
              onClick={() => setActiveGame(null)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              50 Games
            </a>
            <a
              href="#realms"
              onClick={() => setActiveGame(null)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Realms
            </a>
            <a
              href="#companion"
              onClick={() => setActiveGame(null)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Companions
            </a>
            <a
              href="#history"
              onClick={() => setActiveGame(null)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              History
            </a>
          </nav>

          <div className="shrink-0">
            <button
              onClick={() => {
                soundFX.click();
                setRoomModalOpen(true);
              }}
              className="tactile-btn px-4 py-2 rounded-lg bg-[#FF5A36] hover:bg-[#eb4e2c] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              {room ? `Room ${room.code}` : 'Multiplayer Room'}
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {activeGame ? (
          <GameShell
            game={activeGame}
            playerName={profile.name}
            playerCharacterId={profile.characterId}
            roomCode={room?.code}
            sendRoomScore={(sc) => sendWs('room:score_update', { score: sc })}
            sendRoomEvent={(eventType, payload) => sendWs('room:game_event', { eventType, ...payload })}
            lastRoomEvent={lastRoomEvent}
            onTriggerTransition={triggerTransition}
            onCompleteMatch={handleCompleteMatch}
            onExit={() => setActiveGame(null)}
            onNextGame={() => {
              const nextId = activeGame.id >= 50 ? 1 : activeGame.id + 1;
              const nextSpec = GAMES_CATALOG.find((g) => g.id === nextId);
              if (nextSpec) launchGameWithTransition(nextSpec);
            }}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
            {/* Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-2">
                <div className="space-y-5">
                  <div className="text-xs font-mono text-[#A6ACCD]">
                    50 Playable Games · 8 Realms · Solo, 2-Player &amp; Live Rooms
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-extrabold leading-[1.06] tracking-tight text-balance">
                    Play Together. Grow Together.
                  </h1>

                  <p className="text-base text-[#B6BCD9] max-w-xl leading-relaxed">
                    Every challenge pairs you with an animated Playmate companion and custom level transitions across quizzes, logic puzzles, word games, chess, arcade sprints, drawing canvases, and tournaments.
                  </p>

                  <div className="pt-1">
                    <CharacterCompanion
                      characterId={profile.characterId}
                      mood={heroMood}
                      size={76}
                      showBubble
                      customMessage={`Hey ${profile.name}! Pick any of the 50 games below and I’ll react at every step!`}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => launchGameWithTransition(GAMES_CATALOG[0])}
                    className="tactile-btn px-6 py-3.5 rounded-xl bg-[#FF5A36] hover:bg-[#eb4e2c] text-white font-display font-bold text-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-current" /> Quick Play: GK Quiz
                  </button>
                  <button
                    onClick={() => {
                      const randomGame = GAMES_CATALOG[Math.floor(Math.random() * GAMES_CATALOG.length)];
                      launchGameWithTransition(randomGame);
                    }}
                    className="tactile-btn px-5 py-3.5 rounded-xl bg-[#1A1E2B] hover:bg-[#252A3C] border border-white/15 text-[#F4F2ED] font-semibold text-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" /> Surprise Me
                  </button>
                  <button
                    onClick={toggleMute}
                    aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
                    className="p-3.5 rounded-xl bg-[#1A1E2B] hover:bg-[#252A3C] border border-white/10 text-[#A6ACCD] hover:text-white cursor-pointer"
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 relative rounded-2xl overflow-hidden bg-[#181B26] border border-white/10 min-h-[280px]">
                <img
                  src="/src/assets/images/playmate_hero_stage_1794927452801.jpg"
                  alt="PLAYMATE tabletop and arcade gaming stage"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117]/85 via-[#0F1117]/20 to-transparent flex items-end p-6">
                  <div className="flex flex-wrap items-center justify-between w-full gap-4">
                    <div>
                      <div className="text-xs font-mono text-amber-400">FEATURED ARENA</div>
                      <div className="text-lg font-display font-bold text-white">
                        Universal 50-Game Stage Engine
                      </div>
                    </div>
                    <button
                      onClick={() => launchGameWithTransition(GAMES_CATALOG[23])}
                      className="px-4 py-2 rounded-lg bg-white text-[#0F1117] text-xs font-bold hover:bg-amber-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Play #24 Chess
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 4-Column Studio Metrics Strip */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl bg-[#161923] border border-white/10 p-5">
                <div className="text-xs text-[#A6ACCD]">Catalogue</div>
                <div className="mt-1 text-2xl font-display font-bold tabular-nums">50 Games</div>
              </div>
              <div className="rounded-xl bg-[#161923] border border-white/10 p-5">
                <div className="text-xs text-[#A6ACCD]">Player Rank</div>
                <div className="mt-1 text-2xl font-display font-bold tabular-nums text-amber-400">
                  Level {playerLevel}
                </div>
              </div>
              <div className="rounded-xl bg-[#161923] border border-white/10 p-5">
                <div className="text-xs text-[#A6ACCD]">Total XP Earned</div>
                <div className="mt-1 text-2xl font-display font-bold tabular-nums text-emerald-400">
                  {profile.xp} XP
                </div>
              </div>
              <div className="rounded-xl bg-[#161923] border border-white/10 p-5">
                <div className="text-xs text-[#A6ACCD]">Matches Completed</div>
                <div className="mt-1 text-2xl font-display font-bold tabular-nums">
                  {profile.history.length}
                </div>
              </div>
            </section>

            {/* Character Companion Picker */}
            <section id="companion" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                    Choose Your Animated Companion
                  </h2>
                  <p className="text-sm text-[#A6ACCD] mt-1">
                    Your selected character animates in every step, reacts to moves, and leaps across level transitions.
                  </p>
                </div>

                <label className="flex items-center gap-2 text-xs font-mono text-[#A6ACCD]">
                  <span>NICKNAME</span>
                  <input
                    type="text"
                    value={profile.name}
                    maxLength={18}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value || 'Player' }))}
                    className="px-3 py-2 rounded-lg bg-[#181B26] border border-white/15 text-white text-xs font-sans focus:border-[#FF5A36] outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {CHARACTER_ROSTER.map((char) => {
                  const active = profile.characterId === char.id;
                  return (
                    <button
                      key={char.id}
                      onClick={() => {
                        soundFX.flip();
                        setProfile((p) => ({ ...p, characterId: char.id }));
                        setHeroMood('excited');
                      }}
                      className={`tactile-btn rounded-2xl p-3.5 border text-center flex flex-col items-center gap-2 cursor-pointer ${
                        active
                          ? 'bg-[#1E2333] border-[#FF5A36] shadow-lg'
                          : 'bg-[#161923] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <CharacterCompanion characterId={char.id} mood={active ? 'excited' : 'idle'} size={58} />
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[110px]">{char.name}</div>
                        <div className="text-[11px] text-[#A6ACCD] truncate max-w-[110px]">{char.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 8 Realms & Featured Character Showcase */}
            <section id="realms" className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                  8 Game Realms &amp; Transition Styles
                </h2>
                <p className="text-sm text-[#A6ACCD] mt-1">
                  Each category features its own host mascot and signature level transition animation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CATEGORIES.filter((c) => c.portraitImage).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundFX.click();
                      setSelectedCategory(cat.id);
                      document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group text-left rounded-2xl overflow-hidden bg-[#161923] border border-white/10 hover:border-white/25 transition-colors flex items-stretch cursor-pointer"
                  >
                    <div className="w-28 sm:w-32 shrink-0 bg-[#10131C] overflow-hidden">
                      <img
                        src={cat.portraitImage}
                        alt={cat.characterName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-mono" style={{ color: cat.accentHex }}>
                          Realm {cat.number} · {cat.characterName}
                        </div>
                        <div className="text-base font-display font-bold text-white mt-0.5">{cat.name}</div>
                        <p className="text-xs text-[#A6ACCD] mt-1 line-clamp-2">{cat.tagline}</p>
                      </div>
                      <div className="text-xs font-semibold text-white mt-3">
                        Filter Realm →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Complete 50-Game Catalog */}
            <section id="games" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                    All 50 Playable Games
                  </h2>
                  <p className="text-sm text-[#A6ACCD] mt-1">
                    Showing {filteredGames.length} of 50 interactive games—click any card to launch.
                  </p>
                </div>

                <div className="relative w-full lg:w-72">
                  <Search className="w-4 h-4 text-[#A6ACCD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games or #number..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181B26] border border-white/10 text-sm text-white placeholder:text-[#7E85A3] focus:border-[#FF5A36] outline-none"
                  />
                </div>
              </div>

              {/* Segmented Category Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                <button
                  onClick={() => {
                    soundFX.click();
                    setSelectedCategory('all');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#FF5A36] text-white'
                      : 'bg-[#181B26] text-[#A6ACCD] hover:text-white'
                  }`}
                >
                  All 50
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundFX.click();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-white text-[#0F1117]'
                        : 'bg-[#181B26] text-[#A6ACCD] hover:text-white'
                    }`}
                  >
                    {cat.number}. {cat.name}
                  </button>
                ))}
              </div>

              {/* 50-Game Cards Grid (Zero-Pill Metadata) */}
              {filteredGames.length === 0 ? (
                <div className="rounded-2xl bg-[#161923] border border-white/10 p-10 text-center text-sm text-[#A6ACCD]">
                  No games match “{searchQuery}”. Clear the search to browse all 50 games.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGames.map((game) => {
                    const cat = CATEGORIES.find((c) => c.id === game.category)!;
                    return (
                      <motion.button
                        key={game.id}
                        whileHover={{ y: -2 }}
                        onClick={() => launchGameWithTransition(game)}
                        className="group text-left rounded-2xl bg-[#161923] hover:bg-[#1B1F2D] border border-white/10 hover:border-white/25 p-5 flex flex-col justify-between gap-4 transition-colors cursor-pointer"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-[#A6ACCD] font-mono">
                            <span>
                              #{String(game.id).padStart(2, '0')} · {cat.name}
                            </span>
                            <span style={{ color: cat.accentHex }}>{game.players} P</span>
                          </div>

                          <h3 className="text-lg font-display font-bold text-[#F4F2ED] group-hover:text-white">
                            {game.title}
                          </h3>

                          <p className="text-xs text-[#A6ACCD] leading-relaxed line-clamp-2">
                            {game.objective}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-[#8E95B5] truncate max-w-[190px]">
                            {game.modes.join(' · ')}
                          </span>
                          <span className="font-semibold text-[#FF5A36] inline-flex items-center gap-1 shrink-0">
                            <Gamepad2 className="w-3.5 h-3.5" /> Play
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Match History Section */}
            <section id="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold tracking-tight">Recent Match History</h2>
                  <p className="text-sm text-[#A6ACCD]">Your latest scores, ranks, and XP rewards.</p>
                </div>
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>

              {profile.history.length === 0 ? (
                <div className="rounded-2xl bg-[#161923] border border-white/10 p-8 text-center text-sm text-[#A6ACCD]">
                  Complete any game to record your score, rank, and XP here.
                </div>
              ) : (
                <div className="rounded-2xl bg-[#161923] border border-white/10 overflow-hidden">
                  <div className="divide-y divide-white/10">
                    {profile.history.slice(0, 8).map((rec) => (
                      <div
                        key={rec.id}
                        className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-sm"
                      >
                        <div>
                          <div className="font-semibold text-white">
                            #{String(rec.gameId).padStart(2, '0')} {rec.gameTitle}
                          </div>
                          <div className="text-xs text-[#A6ACCD]">
                            {rec.difficulty} · Played at {rec.playedAt}
                          </div>
                        </div>
                        <div className="flex items-center gap-5 font-mono tabular-nums text-xs">
                          <span className="text-amber-400 font-bold">Rank {rec.rank}</span>
                          <span className="text-emerald-400 font-bold">+{rec.xpEarned} XP</span>
                          <span className="text-white font-bold">{rec.score} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-[#7E85A3]">
        PLAYMATE — Play Together. Grow Together. · 50 Interactive Games
      </footer>

      <MultiplayerRoomModal
        open={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        connected={wsConnected}
        room={room}
        playerId={playerId}
        roomError={roomError}
        onCreateRoom={() =>
          sendWs('room:create', {
            playerId,
            name: profile.name,
            characterId: profile.characterId,
            gameId: activeGame?.id || 1,
          })
        }
        onJoinRoom={(code) =>
          sendWs('room:join', {
            code,
            playerId,
            name: profile.name,
            characterId: profile.characterId,
          })
        }
        onLeaveRoom={() => {
          sendWs('room:leave', {});
          setRoom(null);
        }}
        onSelectRoomGame={(gameId) => sendWs('room:select_game', { gameId })}
        onStartRoomGame={() => sendWs('room:start_game', {})}
      />
    </div>
  );
}
