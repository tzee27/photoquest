"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import CreateQuestModal from "~~/components/CreateQuestModal";
import Hero from "~~/components/Hero";
import LeaderboardModal from "~~/components/LeaderboardModal";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleExploreQuests = () => {
    // Navigate to the explore page
    window.location.href = "/explore";
  };

  const handleCreateQuest = () => {
    setShowCreateModal(true);
  };

  return (
    <>
      {/* Background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Hero Section */}
        <Hero onExploreQuests={handleExploreQuests} onCreateQuest={handleCreateQuest} isConnected={isConnected} />

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose PhotoQuest?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join the decentralized photography marketplace where creativity meets blockchain technology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Decentralized Marketplace</h3>
                <p className="text-gray-600">
                  Create and participate in photography challenges on the blockchain with smart contract security.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Earn ETH Rewards</h3>
                <p className="text-gray-600">
                  Get paid in cryptocurrency for your photography skills and creative contributions to the community.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Community</h3>
                <p className="text-gray-600">
                  Connect with photographers worldwide and participate in diverse, creative challenges.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Photography Journey?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of photographers earning ETH through creative challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleExploreQuests}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Explore Quests
              </button>
              <button
                onClick={handleCreateQuest}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Create Quest
              </button>
            </div>
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

      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </>
  );
};

export default Home;
