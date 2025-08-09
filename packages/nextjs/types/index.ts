export type PhotoCategory =
  | "landscape"
  | "portrait"
  | "street"
  | "nature"
  | "architecture"
  | "abstract"
  | "wildlife"
  | "urban"
  | "macro"
  | "night"
  | "event"
  | "travel";

export type QuestStatus = "active" | "completed" | "expired" | "draft";

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: PhotoCategory;
  imageUrl: string;
  reward: string;
  deadline: string;
  submissions: number;
  maxSubmissions: number;
  tags: string[];
  creator: string;
  status: QuestStatus;
}

export interface User {
  address: string;
  username?: string;
  avatar?: string;
  totalEarnings: number;
  questsCompleted: number;
  rating: number;
}

export interface Submission {
  id: string;
  questId: string;
  user: string;
  imageUrl: string;
  title: string;
  description: string;
  timestamp: string;
  votes: number;
  isWinner?: boolean;
}
