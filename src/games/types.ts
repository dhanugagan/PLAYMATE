import { CharacterMood } from '../components/CharacterCompanion';
import { Difficulty, GameSpec, PlayMode } from '../data/gamesCatalog';

export interface GameEngineProps {
  game: GameSpec;
  difficulty: Difficulty;
  mode: PlayMode;
  playerName: string;
  characterId: string;
  roomCode?: string;
  onScoreChange: (newScore: number) => void;
  onCharacterReact: (mood: CharacterMood, message?: string) => void;
  onAdvanceLevel: (nextLevel: number, label: string, subtitle: string) => void;
  onFinishGame: (finalScore: number, summary: string, details?: string[]) => void;
  sendRoomEvent?: (eventType: string, payload: Record<string, unknown>) => void;
  lastRoomEvent?: { fromId?: string; eventType?: string; [key: string]: unknown } | null;
}
