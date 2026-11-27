import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Users, Play, LogOut } from 'lucide-react';
import { GAMES_CATALOG } from '../data/gamesCatalog';
import { CharacterCompanion } from './CharacterCompanion';

export interface RoomPlayer {
  id: string;
  name: string;
  characterId: string;
  score: number;
  team: 'A' | 'B';
}

export interface RoomState {
  code: string;
  hostId: string;
  gameId: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'lobby' | 'playing' | 'finished';
  players: RoomPlayer[];
}

interface MultiplayerRoomModalProps {
  open: boolean;
  onClose: () => void;
  connected: boolean;
  room: RoomState | null;
  playerId: string;
  roomError: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onSelectRoomGame: (gameId: number) => void;
  onStartRoomGame: () => void;
}

export const MultiplayerRoomModal: React.FC<MultiplayerRoomModalProps> = ({
  open,
  onClose,
  connected,
  room,
  playerId,
  roomError,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onSelectRoomGame,
  onStartRoomGame,
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const isHost = room?.hostId === playerId;
  const selectedGame = GAMES_CATALOG.find((g) => g.id === room?.gameId) || GAMES_CATALOG[0];

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard?.writeText(room.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-2xl bg-[#181B26] border border-white/15 p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#FF5A36]" />
              <h2 className="text-lg font-display font-bold text-[#F4F2ED]">
                Multiplayer Room Lobby
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close room modal"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#A6ACCD] hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!connected && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200">
              Connecting to live WebSocket room server…
            </div>
          )}

          {roomError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-200">
              {roomError}
            </div>
          )}

          {!room ? (
            <div className="space-y-4">
              <p className="text-sm text-[#A6ACCD]">
                Create a private room code and open a second browser tab or invite friends to join live over WebSockets.
              </p>

              <button
                onClick={onCreateRoom}
                disabled={!connected}
                className="tactile-btn w-full py-3.5 rounded-xl bg-[#FF5A36] hover:bg-[#eb4e2c] disabled:opacity-50 text-white font-semibold text-sm cursor-pointer"
              >
                Create New Multiplayer Room
              </button>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code..."
                  maxLength={6}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F1117] border border-white/15 text-white font-mono text-sm uppercase tracking-widest"
                />
                <button
                  onClick={() => onJoinRoom(joinCode)}
                  disabled={!connected || joinCode.length < 4}
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-[#252A3B] hover:bg-[#31384E] disabled:opacity-40 text-white text-sm font-semibold cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-[#0F1117] border border-white/10 p-4">
                <div>
                  <div className="text-[11px] font-mono text-[#A6ACCD]">ROOM CODE</div>
                  <div className="text-2xl font-mono font-bold tracking-widest text-emerald-400">
                    {room.code}
                  </div>
                </div>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#232737] hover:bg-[#2E3449] text-xs font-semibold text-white cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-[#A6ACCD]">PLAYERS ({room.players.length})</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {room.players.map((pl) => (
                    <div
                      key={pl.id}
                      className="flex items-center justify-between rounded-xl bg-[#121520] border border-white/10 px-3 py-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CharacterCompanion characterId={pl.characterId} size={32} />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white truncate">
                            {pl.name} {pl.id === room.hostId ? '(Host)' : ''}
                          </div>
                          <div className="text-[10px] font-mono text-[#A6ACCD]">Team {pl.team}</div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                        {pl.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {isHost ? (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <label className="block text-xs font-mono text-[#A6ACCD]">
                    SELECT ROOM GAME
                    <select
                      value={room.gameId}
                      onChange={(e) => onSelectRoomGame(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl bg-[#0F1117] border border-white/15 px-3 py-2.5 text-sm text-white"
                    >
                      {GAMES_CATALOG.map((g) => (
                        <option key={g.id} value={g.id}>
                          #{g.id} — {g.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex gap-2">
                    <button
                      onClick={onStartRoomGame}
                      className="tactile-btn flex-1 py-3 rounded-xl bg-[#FF5A36] hover:bg-[#eb4e2c] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" /> Launch for All Players
                    </button>
                    <button
                      onClick={onLeaveRoom}
                      aria-label="Leave Room"
                      className="px-4 py-3 rounded-xl bg-[#252A3B] hover:bg-rose-600 text-white text-sm cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-[#A6ACCD]">
                  <span>Selected: #{selectedGame.id} {selectedGame.title}</span>
                  <button
                    onClick={onLeaveRoom}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    Leave Room
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
