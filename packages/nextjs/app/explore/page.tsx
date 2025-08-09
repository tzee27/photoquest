"use client";

import { useCallback, useMemo, useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { Camera, Filter, Target } from "lucide-react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import QuestDetailModal from "~~/components/QuestDetailModal";
import QuestGrid from "~~/components/QuestGrid";
import { useGetActiveQuests, useGetQuestCounts, useGetQuestSubmissions } from "~~/hooks/useSubgraph";
import { QuestWithStatus } from "~~/types/subgraph";

// Contract enums mapping
const Category = {
  0: "portrait",
  1: "landscape",
  2: "street",
  3: "wildlife",
  4: "architecture",
  5: "event",
  6: "product",
  7: "other",
} as const;

// Transform subgraph quest data to UI format - memoized for performance
const transformQuestForUI = (quest: QuestWithStatus, submissionCount: number = 0) => {
  const categoryDisplay = Category[quest.category as keyof typeof Category] || "other";
  const rewardInEth = formatEther(BigInt(quest.reward));
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

  return {
    id: quest.questId,
    title: quest.title,
    description: `${quest.title} - Photography Quest`,
    category: categoryDisplay as any,
    imageUrl: getDefaultImage(categoryDisplay),
    reward: `${rewardInEth} ETH`,
    deadline: deadlineDate,
    submissions: submissionCount,
    maxSubmissions: Number(quest.maxSubmissions),
    tags: generateTags(categoryDisplay, quest.title),
    creator: quest.requester,
    status: quest.status,
  };
};

// Lightweight component for submission counting - only loads when needed
const QuestSubmissionCounter = React.memo(
  ({ questId, onSubmissionCount }: { questId: string; onSubmissionCount: (count: number) => void }) => {
    // Only enable polling for submission counts on active viewing
    const { data: submissions } = useGetQuestSubmissions(questId, false); // No auto-polling

    React.useEffect(() => {
      const count = submissions?.photoSubmitteds?.length || 0;
      onSubmissionCount(count);
    }, [submissions, onSubmissionCount]);

    return null;
  },
);

QuestSubmissionCounter.displayName = "QuestSubmissionCounter";

// Optimized quest data provider with better memory management
const QuestDataProvider = ({ children }: { children: (quests: any[]) => React.ReactNode }) => {
  // Enable polling only for active quests to reduce memory usage
  const { data: activeQuests, loading, error } = useGetActiveQuests(true);
  const [questsWithSubmissions, setQuestsWithSubmissions] = useState<any[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});

  // Memoize the submission count handler to prevent unnecessary re-renders
  const handleSubmissionCount = useCallback((questId: string, count: number) => {
    setSubmissionCounts(prev => {
      if (prev[questId] === count) return prev; // Prevent unnecessary updates
      return { ...prev, [questId]: count };
    });
  }, []);

  // Memoize quest transformation to prevent unnecessary recalculations
  const transformedQuests = useMemo(() => {
    if (!activeQuests) return [];

    return activeQuests.map(quest => transformQuestForUI(quest, submissionCounts[quest.questId] || 0));
  }, [activeQuests, submissionCounts]);

  React.useEffect(() => {
    setQuestsWithSubmissions(transformedQuests);
  }, [transformedQuests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading quests from subgraph...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Quests</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <p className="text-sm text-gray-500">
          Make sure your subgraph is deployed and the endpoint is configured correctly.
        </p>
      </div>
    );
  }

  if (!activeQuests || activeQuests.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Quests</h3>
        <p className="text-gray-600">Be the first to create a photo quest!</p>
      </div>
    );
  }

  return (
    <>
      {/* Only load submission counters for visible quests to save memory */}
      {activeQuests.slice(0, 20).map(quest => (
        <QuestSubmissionCounter
          key={quest.questId}
          questId={quest.questId}
          onSubmissionCount={count => handleSubmissionCount(quest.questId, count)}
        />
      ))}
      {children(questsWithSubmissions)}
    </>
  );
};

const ExplorePage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [showQuestDetail, setShowQuestDetail] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);

  // Use lightweight quest counts for stats instead of full data
  const questCounts = useGetQuestCounts();

  // Use active quests for total rewards calculation (memoized)
  const { data: activeQuests } = useGetActiveQuests(true);

  const handleQuestClick = useCallback((quest: any) => {
    setSelectedQuest(quest);
    setShowQuestDetail(true);
  }, []);

  // Memoize stats calculation to prevent unnecessary recalculations
  const stats = useMemo(() => {
    if (!activeQuests) return { activeQuestCount: 0, totalRewards: "0.0", categoryCount: 0 };

    const activeQuestCount = activeQuests.length;
    const totalRewards = activeQuests
      .reduce((total, quest) => total + Number(formatEther(BigInt(quest.reward))), 0)
      .toFixed(2);
    const categoryCount = new Set(activeQuests.map(quest => quest.category)).size;

    return { activeQuestCount, totalRewards, categoryCount };
  }, [activeQuests]);

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
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeQuestCount}</h3>
                <p className="text-gray-600">Active Quests</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalRewards}</h3>
                <p className="text-gray-600">Total ETH Rewards</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.categoryCount}</h3>
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

                  {/* Subgraph indicator with memory optimization note */}
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-blue-800">
                        📊 Optimized with The Graph - Memory efficient real-time data
                      </span>
                    </div>
                  </div>
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
