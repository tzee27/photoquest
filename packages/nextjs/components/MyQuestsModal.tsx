import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Trophy, Clock, Star, Award, Target, Coins } from 'lucide-react'
import { Quest } from '../types'

interface MyQuestsModalProps {
  onClose: () => void
  user: any
  quests: Quest[]
}

const MyQuestsModal: React.FC<MyQuestsModalProps> = ({ onClose, user, quests }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'created'>('active')

  // Mock user quest data
  const userQuests = {
    active: [
      {
        ...quests[0],
        status: 'submitted' as const,
        submissionDate: '2024-01-15',
        votes: 12
      },
      {
        ...quests[1],
        status: 'in-progress' as const
      }
    ],
    completed: [
      {
        id: 'completed-1',
        title: 'Golden Hour Portraits',
        description: 'Capture stunning portrait photography during golden hour',
        reward: '0.4 ETH',
        deadline: '2024-01-10',
        status: 'completed' as const,
        creator: '0x9999...1111',
        submissions: 25,
        maxSubmissions: 30,
        imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
        tags: ['portrait', 'golden-hour'],
        earnedReward: '0.4 ETH',
        ranking: 2,
        rating: 4.8
      }
    ],
    created: [
      {
        id: 'created-1',
        title: 'City Reflections',
        description: 'Capture creative reflections in urban environments',
        reward: '0.6 ETH',
        deadline: '2024-02-28',
        status: 'active' as const,
        creator: user?.address || '0x1234...5678',
        submissions: 8,
        maxSubmissions: 25,
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        tags: ['urban', 'reflections', 'creative']
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'active':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4" />
      case 'in-progress':
        return <Target className="w-4 h-4" />
      case 'completed':
        return <Trophy className="w-4 h-4" />
      case 'active':
        return <Camera className="w-4 h-4" />
      default:
        return <Camera className="w-4 h-4" />
    }
  }

  const currentQuests = userQuests[activeTab]

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
          className="relative w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 text-center border-b border-white/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <div className="flex items-center justify-center space-x-4 mb-4">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
                <p className="text-gray-600 font-mono">{user?.address}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{user?.reputation}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">{user?.totalEarnings}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20">
            {(['active', 'completed', 'created'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/5'
                }`}
              >
                <span className="capitalize">{tab} Quests</span>
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {currentQuests.length}
                </span>
              </button>
            ))}
          </div>

          {/* Quest Content */}
          <div className="flex-1 overflow-y-auto p-6 max-h-96">
            {currentQuests.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No {activeTab} quests yet
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'active' && 'Start participating in photo quests to see them here'}
                  {activeTab === 'completed' && 'Complete your first quest to earn rewards'}
                  {activeTab === 'created' && 'Create your first quest to challenge the community'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentQuests.map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:bg-white/20 transition-all duration-200"
                  >
                    {/* Quest Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={quest.imageUrl}
                        alt={quest.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(quest.status)}`}>
                          {getStatusIcon(quest.status)}
                          <span className="capitalize">{quest.status.replace('-', ' ')}</span>
                        </span>
                      </div>

                      {/* Reward */}
                      <div className="absolute top-3 right-3">
                        <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full text-white font-semibold">
                          <Coins className="w-4 h-4" />
                          <span>{quest.reward}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quest Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{quest.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quest.description}</p>

                      {/* Quest Stats */}
                      <div className="space-y-2">
                        {activeTab === 'completed' && 'earnedReward' in quest && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Earned:</span>
                            <span className="font-semibold text-green-600">{quest.earnedReward}</span>
                          </div>
                        )}
                        
                        {activeTab === 'completed' && 'ranking' in quest && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Ranking:</span>
                            <div className="flex items-center space-x-1">
                              <Award className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-gray-900">#{quest.ranking}</span>
                            </div>
                          </div>
                        )}

                        {activeTab === 'active' && 'votes' in quest && quest.votes && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Votes:</span>
                            <span className="font-semibold text-blue-600">{quest.votes}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Submissions:</span>
                          <span className="font-semibold text-gray-900">
                            {quest.submissions}/{quest.maxSubmissions}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {quest.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                        {quest.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                            +{quest.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default MyQuestsModal
