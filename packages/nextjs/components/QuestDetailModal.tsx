import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Calendar, Coins, Users, Tag, Clock, Award, Camera, ExternalLink, Lock } from 'lucide-react'
import { Quest } from '../types'

interface QuestDetailModalProps {
  quest: Quest
  onClose: () => void
  isConnected: boolean
  onLoginRequired: () => void
}

const QuestDetailModal: React.FC<QuestDetailModalProps> = ({ 
  quest, 
  onClose, 
  isConnected, 
  onLoginRequired 
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'submissions'>('details')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Ends today'
    if (diffDays === 1) return 'Ends tomorrow'
    return `${diffDays} days remaining`
  }

  const handleSubmit = async () => {
    if (!isConnected) {
      onLoginRequired()
      return
    }
    
    setIsSubmitting(true)
    // Simulate submission process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    // Show success message or handle submission
  }

  const mockSubmissions = [
    {
      id: '1',
      photographer: '0xabcd...1234',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop',
      timestamp: '2024-01-15T10:30:00Z',
      votes: 24
    },
    {
      id: '2',
      photographer: '0xefgh...5678',
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
      timestamp: '2024-01-14T15:45:00Z',
      votes: 18
    },
    {
      id: '3',
      photographer: '0xijkl...9012',
      imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=300&h=300&fit=crop',
      timestamp: '2024-01-13T09:20:00Z',
      votes: 31
    }
  ]

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
          <div className="relative h-64 overflow-hidden">
            <img
              src={quest.imageUrl}
              alt={quest.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Quest Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
                    <span className="text-green-300 text-sm font-medium">Active</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">{formatDeadline(quest.deadline)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full border border-yellow-500/30">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold text-lg">{quest.reward}</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">{quest.title}</h1>
              <p className="text-gray-200 text-lg">{quest.description}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col h-[calc(90vh-16rem)]">
            {/* Tabs */}
            <div className="flex border-b border-white/20">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/5'
                }`}
              >
                Quest Details
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'submissions'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/5'
                }`}
              >
                Submissions ({quest.submissions})
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-700">Submissions</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {quest.submissions}/{quest.maxSubmissions}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-700">Deadline</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {new Date(quest.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium text-gray-700">Creator</span>
                      </div>
                      <div className="text-sm font-mono text-gray-900">
                        {quest.creator}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {quest.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Submissions received</span>
                        <span>{Math.round((quest.submissions / quest.maxSubmissions) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(quest.submissions / quest.maxSubmissions) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Photo</h3>
                    
                    {!isConnected ? (
                      <div className="text-center py-8">
                        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Login Required</h4>
                        <p className="text-gray-600 mb-4">
                          You need to connect your wallet to submit photos to this quest.
                        </p>
                        <button
                          onClick={onLoginRequired}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Connect Wallet to Submit
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Upload your photo submission</p>
                          <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                        </div>
                        
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Uploading to IPFS...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              <span>Submit Photo</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-4">
                  {mockSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <img
                        src={submission.imageUrl}
                        alt="Submission"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-sm text-gray-700">{submission.photographer}</span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(submission.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">{submission.votes} votes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default QuestDetailModal
