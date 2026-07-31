export interface ClickParticle {
  id: number;
  x: number;
  y: number;
  value: number;
  rotation: number;
  offsetX: number;
  isCrit?: boolean;
}

export interface SaveData {
  coins: number;
  totalEarned: number;
  stage: number;
  currentEpoch: number;
  clickPower: number;
  passiveIncome: number;
  lastOnlineTimestamp: number;
  critChance?: number; 
  username?: string;
  soundEnabled?: boolean;
  musicEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  epoch: number;
  coins: number;
  totalEarned: number;
  isCurrentPlayer?: boolean;
}