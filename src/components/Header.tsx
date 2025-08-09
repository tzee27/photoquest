import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Wallet, Globe, Zap, Trophy, User } from 'lucide-react'

interface HeaderProps {
  isConnected: boolean
  user?: any
  onConnect: () => void
  onCreateQuest: () => void
  onMyQuests: () => void
  onLeaderboard: () => void
}

const Header: React.FC<HeaderProps> = ({ 
  isConnected, 
  user, 
  onConnect, 
  onCreateQuest, 
  onMyQuests, 
  onLeaderboard 
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-50"
    >
      <div className="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PhotoQuest</h1>
                <p className="text-xs text-gray-600">Web3 Photography Platform</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Explore
              </a>
              <button 
                onClick={onMyQuests}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                My Quests
              </button>
              <button 
                onClick={onLeaderboard}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Leaderboard
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Network Status */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <Globe className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Ethereum</span>
              </div>

              {/* Leaderboard Button - Only show on mobile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLeaderboard}
                className="md:hidden flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg font-medium border border-white/30 transition-all duration-200"
              >
                <Trophy className="w-4 h-4 text-yellow-500" />
              </motion.button>

              {/* Create Quest Button - Only show when connected */}
              {isConnected && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCreateQuest}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Quest</span>
                </motion.button>
              )}

              {/* Connect Wallet Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConnect}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 ${
                  isConnected
                    ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 hover:bg-white/30'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl animate-glow'
                }`}
              >
                {isConnected && user ? (
                  <>
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{user.username}</span>
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
