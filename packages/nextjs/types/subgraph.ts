// TypeScript types for PhotoQuest subgraph entities

export interface PhotoSubmitted {
  id: string;
  questId: string;
  photographer: string;
  watermarkedPhotoIPFS: string;
  submissionIndex: string;
  timestamp: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface PlatformFeeUpdated {
  id: string;
  oldFee: string;
  newFee: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface QuestCancelled {
  id: string;
  questId: string;
  requester: string;
  refundAmount: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface QuestCompleted {
  id: string;
  questId: string;
  requester: string;
  totalSelectedSubmissions: string;
  totalRewardDistributed: string;
  platformFee: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface QuestCreated {
  id: string;
  questId: string;
  requester: string;
  title: string;
  category: number;
  reward: string;
  deadline: string;
  maxSubmissions: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface SubmissionsSelected {
  id: string;
  questId: string;
  requester: string;
  selectedPhotographers: string[];
  rewardPerWinner: string;
  timestamp: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

// Query response types
export interface GetQuestsResponse {
  questCreateds: QuestCreated[];
}

export interface GetQuestSubmissionsResponse {
  photoSubmitteds: PhotoSubmitted[];
}

export interface GetCompletedQuestsResponse {
  questCompleteds: QuestCompleted[];
}

export interface GetCancelledQuestsResponse {
  questCancelleds: QuestCancelled[];
}

export interface GetSubmissionsSelectedResponse {
  submissionsSelecteds: SubmissionsSelected[];
}

export interface GetQuestWithSubmissionsResponse {
  questCreateds: QuestCreated[];
  photoSubmitteds: PhotoSubmitted[];
  questCompleteds: QuestCompleted[];
  questCancelleds: QuestCancelled[];
}

// New types for gallery functionality
export interface GetUserOwnedPhotosResponse {
  questCreateds: QuestCreated[];
  questCompleteds: QuestCompleted[];
  submissionsSelecteds: SubmissionsSelected[];
}

export interface GetSubmissionsForQuestsResponse {
  photoSubmitteds: PhotoSubmitted[];
}

export interface GetUserSelectedSubmissionsResponse {
  submissionsSelecteds: SubmissionsSelected[];
}

// Utility types for UI components
export interface QuestWithStatus extends QuestCreated {
  status: "active" | "completed" | "cancelled";
  submissionCount?: number;
  isCompleted?: boolean;
  isCancelled?: boolean;
}

// Enhanced photo interface for gallery with computed fields
export interface OwnedPhotoFromSubgraph {
  questId: string;
  questTitle: string;
  questCategory: number;
  questReward: string;
  questDeadline: string;
  questStatus: number; // 0=Open, 1=HasSubmissions, 2=Completed, 3=Cancelled
  selectedSubmission: {
    photographer: string;
    watermarkedPhotoIPFS: string;
    originalPhotoIPFS: string; // Note: This may need to be computed or fetched separately
    submittedAt: string;
    submissionIndex: string;
    isPaid: boolean;
  };
  totalSelected: number;
  paidAmount: string;
  rewardPerWinner: string;
  blockTimestamp: string;
}

// Processed photo data for gallery display
export interface GalleryPhoto {
  questId: string;
  questTitle: string;
  questCategory: number;
  questReward: string;
  questDeadline: string;
  questStatus: number;
  photographer: string;
  watermarkedPhotoIPFS: string;
  originalPhotoIPFS: string; // Original photo without watermark (for downloads)
  submissionIndex: string;
  submittedAt: string;
  totalSelected: number;
  paidAmount: string;
  isOwned: boolean;
}

// Active submission with quest details
export interface ActiveSubmissionWithQuest extends PhotoSubmitted {
  questDetails: QuestCreated;
}
