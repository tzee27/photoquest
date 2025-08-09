import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Star, Camera, Coins, Award, Crown, Medal, Target } from 'lucide-react'

interface LeaderboardModalProps {
  onClose: () => void
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'earnings' | 'quests' | 'ratings'>('earnings')

  // Mock leaderboard data
  const leaderboardData = {
    earnings: [
      {
        rank: 1,
        address: '0xabcd...1234',
        username: 'PhotoMaster',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        value: '12.5 ETH',
        change: '+2.3',
        badge: 'crown'
      },
      {
        rank: 2,
        address: '0xefgh...5678',
        username: 'StreetArtist',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        value: '8.7 ETH',
        change: '+1.2',
        badge: 'gold'
      },
      {
        rank: 3,
        address: '0xijkl...9012',
        username: 'NatureLens',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        value: '6.9 ETH',
        change: '+0.8',
        badge: 'silver'
      },
      {
        rank: 4,
        address: '0xmnop...3456',
        username: 'UrbanExplorer',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        value: '5.2 ETH',
        change: '+0.5'
      },
      {
        rank: 5,
        address: '0xqrst...7890',
        username: 'MacroMagic',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        value: '4.1 ETH',
        change: '+0.3'
      }
    ],
    quests: [
      {
        rank: 1,
        address: '0xabcd...1234',
        username: 'PhotoMaster',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        value: '47 Completed',
        change: '+5',
        badge: 'crown'
      },
      {
        rank: 2,
        address: '0xefgh...5678',
        username: 'StreetArtist',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        value: '32 Completed',
        change: '+3',
        badge: 'gold'
      },
      {
        rank: 3,
        address: '0xijkl...9012',
        username: 'NatureLens',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        value: '28 Completed',
        change: '+2',
        badge: 'silver'
      }
    ],
    ratings: [
      {
        rank: 1,
        address: '0xabcd...1234',
        username: 'PhotoMaster',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        value: '4.9 ⭐',
        change: '+0.1',
        badge: 'crown'
      },
      {
        rank: 2,
        address: '0xefgh...5678',
        username: 'StreetArtist',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        value: '4.8 ⭐',
        change: '+0.2',
        badge: 'gold'
      },
      {
        rank: 3,
        address: '0xijkl...9012',
        username: 'NatureLens',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        value: '4.7 ⭐',
        change: '0.0',
        badge: 'silver'
      }
    ]
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'crown':
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 'gold':
        return <Medal className="w-5 h-5 text-yellow-600" />
      case 'silver':
        return <Award className="w-5 h-5 text-gray-500" />
      default:
        return null
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'earnings':
        return <Coins className="w-5 h-5" />
      case 'quests':
        return <Target className="w-5 h-5" />
      case 'ratings':
        return <Star className="w-5 h-5" />
      default:
        return null
    }
  }

  const currentData = leaderboardData[activeTab]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 text-center border-b border-white/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Leaderboard</h2>
            <p className="text-gray-600">
              Top photographers and quest creators in the community
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20">
            {(['earnings', 'quests', 'ratings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/5'
                }`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>

          {/* Leaderboard Content */}
          <div className="flex-1 overflow-y-auto p-6 max-h-96">
            <div className="space-y-3">
              {currentData.map((user, index) => (
                <motion.div
                  key={user.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    user.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border-yellow-200/50 shadow-lg'
                      : 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20'
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
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
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
                      <h3 className="font-semibold text-gray-900">{user.username}</h3>
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
                    <div className="text-lg font-bold text-gray-900">{user.value}</div>
                    <div className={`text-sm font-medium ${
                      user.change.startsWith('+') ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {user.change.startsWith('+') ? '↗' : '→'} {user.change}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 border-t border-white/20">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>Total Rewards: 156.8 ETH</span>
              </div>
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-blue-500" />
                <span>Active Users: 1,247</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default LeaderboardModal
