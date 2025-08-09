"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useGetActiveQuests, useGetQuestSubmissions } from "~~/hooks/useSubgraph";
import { QuestWithStatus } from "~~/types/subgraph";

interface QuestCardProps {
  quest: QuestWithStatus;
  onQuestClick: (quest: QuestWithStatus) => void;
}

const QuestCard = ({ quest, onQuestClick }: QuestCardProps) => {
  const { data: submissions } = useGetQuestSubmissions(quest.questId);
  const submissionCount = submissions?.photoSubmitteds?.length || 0;

  // Convert deadline timestamp to Date
  const deadline = new Date(Number(quest.deadline) * 1000);
  const isExpired = deadline < new Date();

  // Category mapping (assuming categories are stored as numbers in contract)
  const categoryNames = ["landscape", "portrait", "street", "wildlife", "macro", "architecture", "abstract", "other"];
  const categoryName = categoryNames[quest.category] || "other";

  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onQuestClick(quest)}
    >
      {/* Placeholder image - in production you might want to store image URLs in IPFS metadata */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-xl relative">
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          {categoryName}
        </div>
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {formatEther(BigInt(quest.reward))} ETH
        </div>
        {isExpired && (
          <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            Expired
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{quest.title}</h3>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>Deadline: {deadline.toLocaleDateString()}</span>
          <span>
            {submissionCount}/{quest.maxSubmissions} submissions
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            By: {quest.requester.slice(0, 6)}...{quest.requester.slice(-4)}
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExploreQuestsSubgraph = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [selectedQuest, setSelectedQuest] = useState<QuestWithStatus | null>(null);

  // Use subgraph data instead of direct contract calls
  const { data: activeQuests, loading, error } = useGetActiveQuests();

  const handleQuestClick = (quest: QuestWithStatus) => {
    setSelectedQuest(quest);
    // You could open a modal here or navigate to a detail page
    console.log("Selected quest:", quest);
  };

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
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quest Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{activeQuests.length}</div>
            <div className="text-gray-600">Active Quests</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {activeQuests.reduce((total, quest) => total + Number(formatEther(BigInt(quest.reward))), 0).toFixed(2)}
            </div>
            <div className="text-gray-600">Total ETH Rewards</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {new Set(activeQuests.map(quest => quest.category)).size}
            </div>
            <div className="text-gray-600">Categories</div>
          </div>
        </div>
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeQuests.map(quest => (
          <QuestCard key={quest.id} quest={quest} onQuestClick={handleQuestClick} />
        ))}
      </div>

      {/* Note about data source */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          📊 <strong>Powered by The Graph:</strong> This data is sourced from your PhotoQuest subgraph, providing fast
          and efficient access to indexed blockchain events.
        </p>
      </div>
    </div>
  );
};
