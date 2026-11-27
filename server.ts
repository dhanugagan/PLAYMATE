import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface RoomPlayer {
  id: string;
  name: string;
  characterId: string;
  score: number;
  team: 'A' | 'B';
  ready: boolean;
}

interface RoomState {
  code: string;
  hostId: string;
  gameId: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'lobby' | 'playing' | 'finished';
  players: RoomPlayer[];
  createdAt: number;
}

const rooms = new Map<string, RoomState>();
const socketMeta = new Map<WebSocket, { roomCode?: string; playerId?: string }>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function broadcastToRoom(roomCode: string, payload: unknown, exclude?: WebSocket) {
  const data = JSON.stringify(payload);
  for (const [client, meta] of socketMeta.entries()) {
    if (meta.roomCode === roomCode && client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', roomsActive: rooms.size });
  });

  app.post('/api/ai/questions', async (req, res) => {
    try {
      const { gameTitle, topic, difficulty = 'Medium', count = 6 } = req.body ?? {};
      const ai = getGeminiClient();
      const safeCount = Math.min(Math.max(Number(count) || 6, 3), 10);

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Create ${safeCount} engaging, accurate multiple-choice questions for the game "${String(gameTitle || 'General Knowledge Quiz')}" on topic "${String(topic || 'Mixed')}" at "${String(difficulty)}" difficulty. Include 4 concise options, the 0-based index of the correct option, a 1-sentence educational explanation, and 2 progressive hints.`,
        config: {
          systemInstruction:
            'You are the PLAYMATE Quiz Master. Produce family-friendly, factually verified questions suitable for students, friends, and classrooms.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                hints: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['prompt', 'options', 'correctIndex', 'explanation', 'hints'],
            },
          },
        },
      });

      const text = (response.text ?? '[]').trim();
      const questions = JSON.parse(text);
      res.json({ questions });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate AI questions';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ai/mystery', async (req, res) => {
    try {
      const { difficulty = 'Medium' } = req.body ?? {};
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate a family-friendly detective mystery episode at ${String(difficulty)} difficulty for PLAYMATE Mystery Challenge. Provide a title, a short 2-sentence briefing, 3 investigation clues, 3 suspects (one is the culprit), and a deductive question whose answer identifies the culprit and motive.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              briefing: { type: Type.STRING },
              clues: { type: Type.ARRAY, items: { type: Type.STRING } },
              suspects: { type: Type.ARRAY, items: { type: Type.STRING } },
              culpritIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ['title', 'briefing', 'clues', 'suspects', 'culpritIndex', 'explanation'],
          },
        },
      });
      const episode = JSON.parse((response.text ?? '{}').trim());
      res.json({ episode });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate mystery';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ai/story-twist', async (req, res) => {
    try {
      const { sentences = [], theme = 'Adventure' } = req.body ?? {};
      const ai = getGeminiClient();
      const storySoFar = Array.isArray(sentences) ? sentences.slice(-8).join(' ') : '';
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Continue this collaborative ${String(theme)} story with one clever, family-friendly twist sentence (max 24 words): "${storySoFar}"`,
      });
      res.json({ sentence: (response.text ?? '').trim() });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate story twist';
      res.status(500).json({ error: message });
    }
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    socketMeta.set(ws, {});

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type: string; payload?: Record<string, unknown> };
        const meta = socketMeta.get(ws) || {};
        const p = msg.payload || {};

        if (msg.type === 'room:create') {
          const code = generateRoomCode();
          const playerId = String(p.playerId || `p_${Date.now()}`);
          const player: RoomPlayer = {
            id: playerId,
            name: String(p.name || 'Host').slice(0, 20),
            characterId: String(p.characterId || 'owl'),
            score: 0,
            team: 'A',
            ready: true,
          };
          const room: RoomState = {
            code,
            hostId: playerId,
            gameId: Number(p.gameId) || 1,
            difficulty: (p.difficulty as RoomState['difficulty']) || 'Medium',
            status: 'lobby',
            players: [player],
            createdAt: Date.now(),
          };
          rooms.set(code, room);
          socketMeta.set(ws, { roomCode: code, playerId });
          ws.send(JSON.stringify({ type: 'room:state', payload: room }));
          return;
        }

        if (msg.type === 'room:join') {
          const code = String(p.code || '').toUpperCase().trim();
          const room = rooms.get(code);
          if (!room) {
            ws.send(JSON.stringify({ type: 'room:error', payload: { message: 'Room code not found.' } }));
            return;
          }
          const playerId = String(p.playerId || `p_${Date.now()}`);
          const existing = room.players.find((pl) => pl.id === playerId);
          if (!existing) {
            room.players.push({
              id: playerId,
              name: String(p.name || 'Player').slice(0, 20),
              characterId: String(p.characterId || 'fox'),
              score: 0,
              team: room.players.length % 2 === 0 ? 'A' : 'B',
              ready: true,
            });
          }
          socketMeta.set(ws, { roomCode: code, playerId });
          broadcastToRoom(code, { type: 'room:state', payload: room });
          return;
        }

        if (msg.type === 'room:select_game' && meta.roomCode) {
          const room = rooms.get(meta.roomCode);
          if (room && room.hostId === meta.playerId) {
            room.gameId = Number(p.gameId) || room.gameId;
            if (p.difficulty === 'Easy' || p.difficulty === 'Medium' || p.difficulty === 'Hard') {
              room.difficulty = p.difficulty;
            }
            broadcastToRoom(room.code, { type: 'room:state', payload: room });
          }
          return;
        }

        if (msg.type === 'room:start_game' && meta.roomCode) {
          const room = rooms.get(meta.roomCode);
          if (room && room.hostId === meta.playerId) {
            room.status = 'playing';
            room.players.forEach((pl) => {
              pl.score = 0;
            });
            broadcastToRoom(room.code, { type: 'room:state', payload: room });
            broadcastToRoom(room.code, { type: 'room:started', payload: { gameId: room.gameId, difficulty: room.difficulty } });
          }
          return;
        }

        if (msg.type === 'room:score_update' && meta.roomCode && meta.playerId) {
          const room = rooms.get(meta.roomCode);
          if (room) {
            const player = room.players.find((pl) => pl.id === meta.playerId);
            if (player) {
              player.score = Math.max(0, Number(p.score) || 0);
              broadcastToRoom(room.code, { type: 'room:state', payload: room });
            }
          }
          return;
        }

        if (msg.type === 'room:game_event' && meta.roomCode) {
          broadcastToRoom(meta.roomCode, {
            type: 'room:game_event',
            payload: { fromId: meta.playerId, ...p },
          }, ws);
          return;
        }

        if (msg.type === 'room:leave' && meta.roomCode) {
          const room = rooms.get(meta.roomCode);
          if (room) {
            room.players = room.players.filter((pl) => pl.id !== meta.playerId);
            if (room.players.length === 0) {
              rooms.delete(meta.roomCode);
            } else {
              if (room.hostId === meta.playerId) {
                room.hostId = room.players[0].id;
              }
              broadcastToRoom(meta.roomCode, { type: 'room:state', payload: room });
            }
          }
          socketMeta.set(ws, {});
        }
      } catch {
        // Ignore malformed socket frames
      }
    });

    ws.on('close', () => {
      const meta = socketMeta.get(ws);
      if (meta?.roomCode && meta.playerId) {
        const room = rooms.get(meta.roomCode);
        if (room) {
          room.players = room.players.filter((pl) => pl.id !== meta.playerId);
          if (room.players.length === 0) {
            rooms.delete(meta.roomCode);
          } else {
            if (room.hostId === meta.playerId) {
              room.hostId = room.players[0].id;
            }
            broadcastToRoom(meta.roomCode, { type: 'room:state', payload: room });
          }
        }
      }
      socketMeta.delete(ws);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`PLAYMATE server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
