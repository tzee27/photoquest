"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Camera, Coins, Crown, Medal, Star, Target, Trophy } from "lucide-react";
import type { NextPage } from "next";

const Leaderboard: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"earnings" | "quests" | "ratings">("earnings");

  // Mock leaderboard data
  const leaderboardData = {
    earnings: [
      {
        rank: 1,
        address: "0xabcd...1234",
        username: "PhotoMaster",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        value: "12.5 ETH",
        change: "+2.3",
        badge: "crown",
      },
      {
        rank: 2,
        address: "0xefgh...5678",
        username: "StreetArtist",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        value: "8.7 ETH",
        change: "+1.2",
        badge: "gold",
      },
      {
        rank: 3,
        address: "0xijkl...9012",
        username: "NatureLens",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        value: "6.9 ETH",
        change: "+0.8",
        badge: "silver",
      },
      {
        rank: 4,
        address: "0xmnop...3456",
        username: "UrbanExplorer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        value: "5.2 ETH",
        change: "+0.5",
      },
      {
        rank: 5,
        address: "0xqrst...7890",
        username: "MacroMagic",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        value: "4.1 ETH",
        change: "+0.3",
      },
      {
        rank: 6,
        address: "0xuvwx...1122",
        username: "LightChaser",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
        value: "3.8 ETH",
        change: "+0.2",
      },
      {
        rank: 7,
        address: "0xyzab...3344",
        username: "WildlifeSnap",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
        value: "3.4 ETH",
        change: "+0.1",
      },
      {
        rank: 8,
        address: "0xcdef...5566",
        username: "PortraitPro",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
        value: "2.9 ETH",
        change: "0.0",
      },
    ],
    quests: [
      {
        rank: 1,
        address: "0xabcd...1234",
        username: "PhotoMaster",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        value: "47 Completed",
        change: "+5",
        badge: "crown",
      },
      {
        rank: 2,
        address: "0xefgh...5678",
        username: "StreetArtist",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        value: "32 Completed",
        change: "+3",
        badge: "gold",
      },
      {
        rank: 3,
        address: "0xijkl...9012",
        username: "NatureLens",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        value: "28 Completed",
        change: "+2",
        badge: "silver",
      },
      {
        rank: 4,
        address: "0xmnop...3456",
        username: "UrbanExplorer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        value: "21 Completed",
        change: "+1",
      },
      {
        rank: 5,
        address: "0xqrst...7890",
        username: "MacroMagic",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        value: "18 Completed",
        change: "+2",
      },
      {
        rank: 6,
        address: "0xuvwx...1122",
        username: "LightChaser",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
        value: "15 Completed",
        change: "+1",
      },
    ],
    ratings: [
      {
        rank: 1,
        address: "0xabcd...1234",
        username: "PhotoMaster",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        value: "4.9 ⭐",
        change: "+0.1",
        badge: "crown",
      },
      {
        rank: 2,
        address: "0xefgh...5678",
        username: "StreetArtist",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        value: "4.8 ⭐",
        change: "+0.2",
        badge: "gold",
      },
      {
        rank: 3,
        address: "0xijkl...9012",
        username: "NatureLens",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        value: "4.7 ⭐",
        change: "0.0",
        badge: "silver",
      },
      {
        rank: 4,
        address: "0xmnop...3456",
        username: "UrbanExplorer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        value: "4.6 ⭐",
        change: "+0.1",
      },
      {
        rank: 5,
        address: "0xqrst...7890",
        username: "MacroMagic",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        value: "4.5 ⭐",
        change: "-0.1",
      },
    ],
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "crown":
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case "gold":
        return <Medal className="w-5 h-5 text-yellow-600" />;
      case "silver":
        return <Award className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "earnings":
        return <Coins className="w-5 h-5" />;
      case "quests":
        return <Target className="w-5 h-5" />;
      case "ratings":
        return <Star className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const currentData = leaderboardData[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Leaderboard</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Top photographers and quest creators in the PhotoQuest community. Compete, earn, and showcase your skills!
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">156.8 ETH</p>
                  <p className="text-sm text-gray-600">Total Rewards Paid</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-gray-600">Active Photographers</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">892</p>
                  <p className="text-sm text-gray-600">Quests Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {(["earnings", "quests", "ratings"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {getTabIcon(tab)}
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
            </div>

            {/* Leaderboard Content */}
            <div className="p-6">
              <div className="space-y-4">
                {currentData.map((user, index) => (
                  <motion.div
                    key={user.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      user.rank <= 3
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg"
                        : "bg-gray-50/50 border-gray-200 hover:bg-gray-100/50"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12">
                      {user.badge ? (
                        getBadgeIcon(user.badge)
                      ) : (
                        <span className="text-2xl font-bold text-gray-600">#{user.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                      />
                      {user.rank === 1 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{user.username}</h3>
                        {user.rank <= 3 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Top {user.rank}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-mono">{user.address}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{user.value}</div>
                      <div
                        className={`text-sm font-medium ${
                          user.change.startsWith("+")
                            ? "text-green-600"
                            : user.change.startsWith("-")
                              ? "text-red-500"
                              : "text-gray-500"
                        }`}
                      >
                        {user.change.startsWith("+") ? "↗" : user.change.startsWith("-") ? "↘" : "→"} {user.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Rankings update every 24 hours. Keep participating to climb the leaderboard!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <span>🏆 Top 3 get special badges</span>
              <span>📈 Weekly rewards for top performers</span>
              <span>⭐ Build your reputation with high ratings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
