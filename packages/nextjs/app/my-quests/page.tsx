"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Camera, Clock, Coins, Eye, Star, Target, Trophy, Upload, X } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import QuestDetailModal from "~~/components/QuestDetailModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getIPFSGateways, getIPFSUrl } from "~~/utils/pinata";

// Contract enums mapping
const QuestStatus = {
  0: "Open",
  1: "HasSubmissions",
  2: "Completed",
  3: "Cancelled",
} as const;

const Category = {
  0: "Portrait",
  1: "Landscape",
  2: "Street",
  3: "Wildlife",
  4: "Architecture",
  5: "Event",
  6: "Product",
  7: "Other",
} as const;

// Image Modal Component
const ImageModal = ({
  isOpen,
  onClose,
  imageUrl,
  questTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  questTitle: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!isOpen) return null;

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    console.log("Image loaded successfully:", imageUrl);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Image failed to load from:", e.currentTarget.src);

    const currentSrc = e.currentTarget.src;

    // Extract IPFS hash from URL
    const ipfsHashMatch = currentSrc.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    if (!ipfsHashMatch) {
      console.error("Could not extract IPFS hash from URL:", currentSrc);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const ipfsHash = ipfsHashMatch[1];
    console.log("Extracted IPFS hash:", ipfsHash);

    // Get all available gateways for this hash
    const gateways = getIPFSGateways(ipfsHash);
    console.log("Available gateways:", gateways);

    // Find current gateway index and try next one
    let nextGateway = null;
    for (let i = 0; i < gateways.length; i++) {
      if (currentSrc === gateways[i] && i < gateways.length - 1) {
        nextGateway = gateways[i + 1];
        break;
      }
    }

    if (nextGateway) {
      console.log("Trying next gateway:", nextGateway);
      e.currentTarget.src = nextGateway;
    } else {
      // All gateways failed
      console.log("All IPFS gateways failed for hash:", ipfsHash);
      setHasError(true);
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{questTitle}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image Content */}
          <div className="p-6">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  <span className="ml-3 text-gray-600">Loading image...</span>
                </div>
              )}

              {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <Eye className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">Image unavailable</p>
                  <p className="text-sm text-center max-w-md">
                    The IPFS image could not be loaded from any gateway. This might be a temporary issue.
                  </p>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={questTitle}
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </div>

            {/* Image URL Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 break-all">
                <strong>IPFS URL:</strong> {imageUrl}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Submission Card Component
const SubmissionCard = ({ submission, questTitle }: { submission: any; questTitle: string }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  const imageUrl = getIPFSUrl(submission.watermarkedPhotoIPFS);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-video bg-gray-100 relative group cursor-pointer" onClick={() => setShowImageModal(true)}>
          <img
            src={imageUrl}
            alt={`Submission for ${questTitle}`}
            className="w-full h-full object-cover"
            onError={e => {
              // Try alternative IPFS gateway on error
              const target = e.target as HTMLImageElement;
              const ipfsHash = submission.watermarkedPhotoIPFS;
              const gateways = getIPFSGateways(ipfsHash);

              // Find current src and try next gateway
              const currentIndex = gateways.findIndex(gateway => gateway === target.src);
              if (currentIndex !== -1 && currentIndex < gateways.length - 1) {
                target.src = gateways[currentIndex + 1];
              }
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Submitted {new Date(Number(submission.submittedAt) * 1000).toLocaleDateString()}</span>
            {submission.isSelected && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Selected</span>
            )}
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={imageUrl}
        questTitle={questTitle}
      />
    </>
  );
};

// Quest Card Component for Contract Data
const QuestCard = ({
  questId,
  quest,
  submissions,
  type,
  onClick,
}: {
  questId: number;
  quest: any;
  submissions: any[];
  type: string;
  onClick: (questData: any) => void;
}) => {
  const categoryName = Category[quest.category as keyof typeof Category] || "Other";
  const statusName = QuestStatus[quest.status as keyof typeof QuestStatus] || "Unknown";

  const isCompleted = quest.status === 2;
  const isCancelled = quest.status === 3;

  const questData = {
    questId: questId,
    title: quest.title,
    description: quest.description,
    category: quest.category,
    reward: quest.reward.toString(),
    deadline: quest.deadline.toString(),
    status: quest.status,
    maxSubmissions: quest.maxSubmissions.toString(),
    requester: quest.requester,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Quest Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{quest.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {categoryName}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isCompleted
                    ? "bg-green-100 text-green-800"
                    : isCancelled
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {statusName}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{formatEther(BigInt(quest.reward))} ETH</div>
            <div className="text-sm text-gray-500">Reward</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Deadline: {new Date(Number(quest.deadline) * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Upload className="w-4 h-4" />
              <span>
                {submissions.length}/{quest.maxSubmissions} submissions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions */}
      {submissions.length > 0 && (
        <div className="p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Submissions</h4>
          <div className="grid grid-cols-2 gap-3">
            {submissions.slice(0, 4).map((submission, index) => (
              <SubmissionCard key={index} submission={submission} questTitle={quest.title} />
            ))}
          </div>
          {submissions.length > 4 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => onClick(questData)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all {submissions.length} submissions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onClick(questData)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

const MyQuestsPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "created">("active");
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [showQuestDetail, setShowQuestDetail] = useState(false);

  console.log("🎯 MyQuestsPage - Connected Address:", {
    connectedAddress,
    isConnected,
    normalized: connectedAddress?.toLowerCase(),
  });

  // Use Scaffold-ETH hooks to get data directly from contract
  const { data: userQuestIds } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getUserQuests",
    args: [connectedAddress || "0x0"],
  });

  const { data: photographerQuestIds } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPhotographerQuests",
    args: [connectedAddress || "0x0"],
  });

  const { data: questCounter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "questCounter",
  });

  console.log("🎯 MyQuestsPage - Contract Data:", {
    userQuestIds: userQuestIds?.length || 0,
    photographerQuestIds: photographerQuestIds?.length || 0,
    questCounter: questCounter?.toString(),
  });

  // Fetch individual quest details for created quests
  const createdQuests = useMemo(() => {
    if (!userQuestIds || userQuestIds.length === 0) return [];

    return userQuestIds.map(questId => {
      const questIdNum = Number(questId);
      return { questId: questIdNum };
    });
  }, [userQuestIds]);

  // Fetch individual quest details for photographer quests (active submissions)
  const photographerQuests = useMemo(() => {
    if (!photographerQuestIds || photographerQuestIds.length === 0) return [];

    return photographerQuestIds.map(questId => {
      const questIdNum = Number(questId);
      return { questId: questIdNum };
    });
  }, [photographerQuestIds]);

  // Filter completed quests (quests where user submitted and quest is completed)
  const completedQuests = useMemo(() => {
    if (!photographerQuests) return [];
    return photographerQuests.filter(q => {
      // We'll need to check quest status for each quest
      // For now, return empty array since we need individual quest data
      return false;
    });
  }, [photographerQuests]);

  const handleQuestClick = (questData: any) => {
    // Transform contract data to Quest interface format expected by QuestDetailModal
    const questForModal = {
      id: questData.questId,
      title: questData.title,
      description: questData.description || `${questData.title} - Photography Quest`,
      reward: `${formatEther(BigInt(questData.reward))} ETH`,
      deadline: new Date(Number(questData.deadline) * 1000).toISOString(),
      creator: questData.requester,
      maxSubmissions: Number(questData.maxSubmissions),
      imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
      tags: ["photography", "quest"],
      category: Category[questData.category as keyof typeof Category].toLowerCase() as any,
    };

    setSelectedQuest(questForModal);
    setShowQuestDetail(true);
  };

  const handleCloseQuestDetail = () => {
    setShowQuestDetail(false);
    setSelectedQuest(null);
  };

  const handleLoginRequired = () => {
    console.log("Login required");
  };

  const questCounts = {
    created: createdQuests.length,
    active: photographerQuests.length,
    completed: completedQuests.length,
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Quests</h1>
            <p className="text-gray-600 mb-8">Connect your wallet to view your photo quests</p>
          </div>
        </div>
      </div>
    );
  }

  const renderQuestList = () => {
    if (activeTab === "created") {
      if (createdQuests.length === 0) {
        return (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No created quests yet</h3>
            <p className="text-gray-500 mb-4">Create your first quest to challenge the community</p>
            <p className="text-sm text-gray-400">Go to the homepage to create your first quest</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {createdQuests.map(({ questId }) => (
            <QuestCardWithData key={`created-${questId}`} questId={questId} type="created" onClick={handleQuestClick} />
          ))}
        </div>
      );
    }

    if (activeTab === "active") {
      if (photographerQuests.length === 0) {
        return (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No submissions yet</h3>
            <p className="text-gray-500 mb-4">Submit photos to quests to see them here</p>
            <p className="text-sm text-gray-400">Browse available quests on the explore page to get started</p>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photographerQuests.map(({ questId }) => (
            <SubmissionCardWithData
              key={`submission-${questId}`}
              questId={questId}
              userAddress={connectedAddress}
              onClick={handleQuestClick}
            />
          ))}
        </div>
      );
    }

    // Completed tab
    if (completedQuests.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No completed quests yet</h3>
          <p className="text-gray-500 mb-4">Complete your first quest to earn rewards</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedQuests.map(({ questId }) => (
          <QuestCardWithData
            key={`completed-${questId}`}
            questId={questId}
            type="completed"
            onClick={handleQuestClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Quests</h1>
          <p className="text-gray-600 text-lg">Manage your photo quests and submissions</p>

          {/* Contract indicator */}
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-blue-800">🔗 Powered by Smart Contract - Real-time data</span>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 text-center"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{questCounts.created}</h3>
            <p className="text-gray-600">Created Quests</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 text-center"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{questCounts.active}</h3>
            <p className="text-gray-600">Active Submissions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 text-center"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{questCounts.completed}</h3>
            <p className="text-gray-600">Completed Quests</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            {(["active", "completed", "created"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                <span className="capitalize">{tab === "active" ? "My Submissions" : `${tab} Quests`}</span>
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {tab === "created"
                    ? questCounts.created
                    : tab === "active"
                      ? questCounts.active
                      : questCounts.completed}
                </span>
              </button>
            ))}
          </div>

          {/* Quest Content */}
          <div className="p-8">{renderQuestList()}</div>
        </div>

        {/* Quest Detail Modal */}
        {showQuestDetail && selectedQuest && (
          <QuestDetailModal
            quest={selectedQuest}
            onClose={handleCloseQuestDetail}
            isConnected={isConnected}
            onLoginRequired={handleLoginRequired}
          />
        )}
      </div>
    </div>
  );
};

// Component to fetch and display quest data
const QuestCardWithData = ({
  questId,
  type,
  onClick,
}: {
  questId: number;
  type: string;
  onClick: (quest: any) => void;
}) => {
  const { data: quest } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getQuest",
    args: [BigInt(questId)],
  });

  const { data: submissions } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getQuestSubmissions",
    args: [BigInt(questId)],
  });

  if (!quest) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <QuestCard
      questId={questId}
      quest={quest}
      submissions={submissions ? [...submissions] : []}
      type={type}
      onClick={onClick}
    />
  );
};

// Component to fetch and display submission data
const SubmissionCardWithData = ({
  questId,
  userAddress,
  onClick,
}: {
  questId: number;
  userAddress: string | undefined;
  onClick: (quest: any) => void;
}) => {
  const { data: quest } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getQuest",
    args: [BigInt(questId)],
  });

  const { data: submission } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPhotographerSubmission",
    args: [BigInt(questId), (userAddress || "0x0") as `0x${string}`],
  });

  if (!quest || !submission) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const categoryName = Category[quest.category as keyof typeof Category] || "Other";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{quest.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{categoryName}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                quest.status === 2 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {quest.status === 2 ? "Quest Completed" : "Pending Review"}
            </span>
          </div>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <div className="text-lg font-bold text-green-600">{formatEther(BigInt(quest.reward))} ETH</div>
          <div className="text-sm text-gray-500">Potential Reward</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Deadline: {new Date(Number(quest.deadline) * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Upload className="w-4 h-4" />
            <span>Submitted: {new Date(Number(submission.submittedAt) * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Photo preview */}
      <div className="mt-4">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={getIPFSUrl(submission.watermarkedPhotoIPFS)}
            alt={`Submission for ${quest.title}`}
            className="w-full h-full object-cover"
            onError={e => {
              // Try alternative IPFS gateway on error
              const target = e.target as HTMLImageElement;
              const ipfsHash = submission.watermarkedPhotoIPFS;
              const gateways = getIPFSGateways(ipfsHash);

              const currentIndex = gateways.findIndex(gateway => gateway === target.src);
              if (currentIndex !== -1 && currentIndex < gateways.length - 1) {
                target.src = gateways[currentIndex + 1];
              }
            }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">IPFS: {submission.watermarkedPhotoIPFS.slice(0, 20)}...</div>
      </div>

      <div className="mt-4">
        <button
          onClick={() =>
            onClick({
              questId,
              title: quest.title,
              description: quest.description,
              category: quest.category,
              reward: quest.reward.toString(),
              deadline: quest.deadline.toString(),
              status: quest.status,
              maxSubmissions: quest.maxSubmissions.toString(),
              requester: quest.requester,
            })
          }
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          View Quest Details
        </button>
      </div>
    </div>
  );
};

export default MyQuestsPage;
