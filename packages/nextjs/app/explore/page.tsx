"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { Camera, Filter, Target } from "lucide-react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import QuestDetailModal from "~~/components/QuestDetailModal";
import QuestGrid from "~~/components/QuestGrid";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Contract enums mapping
const QuestStatus = {
  0: "Open",
  1: "Accepted",
  2: "Submitted",
  3: "Approved",
  4: "Completed",
  5: "Cancelled",
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

// Individual quest fetcher component
const QuestFetcher = ({ questId, onQuestLoaded }: { questId: bigint; onQuestLoaded: (quest: any) => void }) => {
  const { data: quest, isLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getQuest",
    args: [questId],
  });

  useEffect(() => {
    if (quest && !isLoading) {
      // Convert contract data to UI format
      const statusDisplay = QuestStatus[quest.status as keyof typeof QuestStatus];
      const categoryDisplay = Category[quest.category as keyof typeof Category].toLowerCase();
      const rewardInEth = formatEther(quest.reward);
      const deadlineDate = new Date(Number(quest.deadline) * 1000).toISOString().split("T")[0];

      // Default image based on category
      const getDefaultImage = (category: string) => {
        const images = {
          portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop",
          landscape: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
          street: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          wildlife: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=400&h=300&fit=crop",
          architecture: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
          event: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop",
          product: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
          other: "https://images.unsplash.com/photo-1494790108755-2616c95e2d75?w=400&h=300&fit=crop",
        };
        return images[category as keyof typeof images] || images.other;
      };

      // Generate simple tags based on category and title
      const generateTags = (category: string, title: string) => {
        const categoryTags = {
          portrait: ["portrait", "people", "lighting"],
          landscape: ["landscape", "nature", "scenery"],
          street: ["street", "urban", "candid"],
          wildlife: ["wildlife", "animals", "nature"],
          architecture: ["architecture", "buildings", "design"],
          event: ["event", "celebration", "moments"],
          product: ["product", "commercial", "still-life"],
          other: ["photography", "creative", "artistic"],
        };

        const baseTags = categoryTags[category as keyof typeof categoryTags] || categoryTags.other;
        const titleWords = title
          .toLowerCase()
          .split(" ")
          .filter(word => word.length > 3);
        return [...baseTags.slice(0, 2), ...titleWords.slice(0, 1)];
      };

      const questData = {
        id: questId.toString(),
        title: quest.title,
        description: quest.description,
        category: categoryDisplay as any,
        imageUrl: getDefaultImage(categoryDisplay),
        reward: `${rewardInEth} ETH`,
        deadline: deadlineDate,
        submissions: 0, // This would need a separate contract call to count submissions
        maxSubmissions: 50, // Default value, could be added to contract
        tags: generateTags(categoryDisplay, quest.title),
        creator: quest.requester,
        status: statusDisplay.toLowerCase() as any,
      };

      onQuestLoaded(questData);
    }
  }, [quest, isLoading, questId, onQuestLoaded]);

  return null;
};

// Component to fetch and convert quest data
const QuestDataProvider = ({ children }: { children: (quests: any[]) => React.ReactNode }) => {
  const [questsData, setQuestsData] = useState<any[]>([]);
  const [loadedQuestIds, setLoadedQuestIds] = useState<Set<string>>(new Set());

  // Fetch all open quests from the contract
  const { data: openQuestIds, isLoading: isLoadingIds } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getOpenQuests",
  });

  const handleQuestLoaded = useCallback((quest: any) => {
    setLoadedQuestIds(prev => new Set([...prev, quest.id]));
    setQuestsData(prev => {
      const existing = prev.find(q => q.id === quest.id);
      if (existing) return prev;
      return [...prev, quest];
    });
  }, []);

  // Reset when quest IDs change
  useEffect(() => {
    if (openQuestIds) {
      setQuestsData([]);
      setLoadedQuestIds(new Set());
    }
  }, [openQuestIds]);

  if (isLoadingIds) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!openQuestIds || openQuestIds.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Quests</h3>
        <p className="text-gray-600">Be the first to create a photo quest!</p>
      </div>
    );
  }

  const isLoadingQuests = loadedQuestIds.size < openQuestIds.length;

  return (
    <>
      {/* Render QuestFetcher components for each quest ID */}
      {openQuestIds.map((questId: bigint) => (
        <QuestFetcher key={questId.toString()} questId={questId} onQuestLoaded={handleQuestLoaded} />
      ))}

      {/* Show loading while fetching quest details */}
      {isLoadingQuests ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">
            Loading quest details... ({loadedQuestIds.size}/{openQuestIds.length})
          </span>
        </div>
      ) : (
        children(questsData)
      )}
    </>
  );
};

const ExplorePage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [showQuestDetail, setShowQuestDetail] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);

  // Fetch contract data for stats
  const { data: openQuestIds } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getOpenQuests",
  });

  // Contract write function for accepting quests
  const { writeContractAsync: acceptQuestAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const handleQuestClick = (quest: any) => {
    setSelectedQuest(quest);
    setShowQuestDetail(true);
  };

  const handleAcceptQuest = async (questId: string) => {
    if (!isConnected) {
      console.log("Please connect your wallet first");
      return;
    }

    try {
      await acceptQuestAsync({
        functionName: "acceptQuest",
        args: [BigInt(questId)],
      });
      console.log("Quest accepted successfully!");
      // Refresh the page or update local state
      window.location.reload();
    } catch (error) {
      console.error("Error accepting quest:", error);
    }
  };

  // Calculate stats from contract data
  const activeQuestCount = openQuestIds?.length || 0;
  const totalRewards = openQuestIds?.length ? (openQuestIds.length * 0.5).toFixed(1) : "0.0";
  const categoryCount = 8; // Fixed for now, could be made dynamic

  // Calculate actual total rewards from quest data if available
  const { data: questCounter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "questCounter",
  });

  const actualTotalRewards = useMemo(() => {
    if (!openQuestIds || openQuestIds.length === 0) return "0.0";
    // For now, estimate based on average of 0.5 ETH per quest
    // In production, you'd sum up the actual reward amounts
    return (openQuestIds.length * 0.5).toFixed(1);
  }, [openQuestIds]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                Explore Photo Quests
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Discover photography challenges across all categories. Submit your best work and earn ETH rewards.
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{activeQuestCount}</h3>
                <p className="text-gray-600">Active Quests</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{actualTotalRewards}</h3>
                <p className="text-gray-600">Total ETH Rewards</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{categoryCount}</h3>
                <p className="text-gray-600">Categories</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quest Grid Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <QuestDataProvider>
              {quests => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <QuestGrid quests={quests} onQuestClick={handleQuestClick} />
                </motion.div>
              )}
            </QuestDataProvider>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Photography Journey?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Join our community of photographers and start earning ETH for your amazing shots.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Create Your First Quest
                </button>
                <button
                  onClick={() => (window.location.href = "/my-quests")}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  View My Quests
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Quest Detail Modal */}
      {showQuestDetail && selectedQuest && (
        <QuestDetailModal
          onClose={() => setShowQuestDetail(false)}
          quest={selectedQuest}
          isConnected={isConnected}
          onLoginRequired={() => {
            console.log("Login required");
          }}
        />
      )}
    </>
  );
};

export default ExplorePage;
