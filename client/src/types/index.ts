export type Mode = "rehearsal" | "learning";
export type Difficulty = "easy" | "medium" | "hard";

export interface SetupConfig {
  transcript: string;
  mode: Mode;
  difficulty: Difficulty;
}

export interface SessionState {
  isStarted: boolean;
  isPaused: boolean;
  elapsedTime: number;
  showTranscript: boolean;
}

