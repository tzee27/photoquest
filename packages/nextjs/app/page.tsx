"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import CreateQuestModal from "~~/components/CreateQuestModal";
import Hero from "~~/components/Hero";
import LeaderboardModal from "~~/components/LeaderboardModal";
import MyQuestsModal from "~~/components/MyQuestsModal";
import QuestDetailModal from "~~/components/QuestDetailModal";
import QuestGrid from "~~/components/QuestGrid";

// Mock data for demonstration - replace with actual data from your backend/contracts
const mockQuests = [
  {
    id: "1",
    title: "Urban Street Art Photography",
    description:
      "Capture stunning street art and murals in urban environments. Show the artistic expression and cultural vibes of your city.",
    category: "urban" as const,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    reward: "0.5 ETH",
    deadline: "2024-12-31",
    submissions: 12,
    maxSubmissions: 25,
    tags: ["streetart", "urban", "culture"],
    creator: "0x1234...5678",
    status: "active" as const,
  },
  {
    id: "2",
    title: "Nature Macro Photography",
    description:
      "Capture stunning macro shots of insects, flowers, or other small natural subjects. Focus on details and textures.",
    category: "nature" as const,
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0801ba2fe65?w=400&h=300&fit=crop",
    reward: "0.3 ETH",
    deadline: "2024-12-25",
    submissions: 8,
    maxSubmissions: 20,
    tags: ["macro", "insects", "flowers"],
    creator: "0x2345...6789",
    status: "active" as const,
  },
  {
    id: "3",
    title: "Architectural Minimalism",
    description:
      "Showcase minimalist architecture with clean lines, geometric shapes, and negative space. Black and white encouraged.",
    category: "architecture" as const,
    imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop",
    reward: "0.7 ETH",
    deadline: "2025-01-15",
    submissions: 5,
    maxSubmissions: 15,
    tags: ["minimalism", "architecture", "blackwhite"],
    creator: "0x3456...7890",
    status: "active" as const,
  },
  {
    id: "4",
    title: "Portrait in Golden Hour",
    description:
      "Capture beautiful portraits during the golden hour. Focus on natural lighting and emotional expression.",
    category: "portrait" as const,
    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616c35781e1?w=400&h=300&fit=crop",
    reward: "0.4 ETH",
    deadline: "2024-12-28",
    submissions: 15,
    maxSubmissions: 30,
    tags: ["portrait", "goldenhour", "natural"],
    creator: "0x4567...8901",
    status: "active" as const,
  },
  {
    id: "5",
    title: "Abstract Light Photography",
    description:
      "Create abstract compositions using light, shadows, and reflections. Experiment with creative techniques.",
    category: "abstract" as const,
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    reward: "0.6 ETH",
    deadline: "2025-01-10",
    submissions: 3,
    maxSubmissions: 12,
    tags: ["abstract", "light", "creative"],
    creator: "0x5678...9012",
    status: "active" as const,
  },
  {
    id: "6",
    title: "Wildlife in Action",
    description:
      "Capture wildlife in their natural habitat with focus on movement and behavior. Telephoto lenses recommended.",
    category: "wildlife" as const,
    imageUrl: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=400&h=300&fit=crop",
    reward: "0.8 ETH",
    deadline: "2025-01-20",
    submissions: 7,
    maxSubmissions: 18,
    tags: ["wildlife", "action", "telephoto"],
    creator: "0x6789...0123",
    status: "active" as const,
  },
];

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestDetail, setShowQuestDetail] = useState(false);
  const [showMyQuests, setShowMyQuests] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);

  const handleExploreQuests = () => {
    const questsSection = document.getElementById("quests-section");
    questsSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreateQuest = () => {
    setShowCreateModal(true);
  };

  const handleQuestClick = (quest: any) => {
    setSelectedQuest(quest);
    setShowQuestDetail(true);
  };

  return (
    <>
      {/* Background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Hero Section */}
        <Hero onExploreQuests={handleExploreQuests} onCreateQuest={handleCreateQuest} isConnected={isConnected} />

        {/* Active Photo Quests Section */}
        <section id="quests-section" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Active Photo Quests</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Browse and participate in photography challenges across all categories. Submit your best work and earn
                rewards.
              </p>
            </div>

            <QuestGrid quests={mockQuests} onQuestClick={handleQuestClick} />
          </div>
        </section>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateQuestModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={quest => {
            console.log("Quest created:", quest);
            setShowCreateModal(false);
          }}
        />
      )}

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

      {showMyQuests && (
        <MyQuestsModal
          onClose={() => setShowMyQuests(false)}
          user={{
            address: connectedAddress || "",
            totalEarnings: 0,
            questsCompleted: 0,
            rating: 0,
          }}
          quests={mockQuests}
        />
      )}

      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </>
  );
};

export default Home;
