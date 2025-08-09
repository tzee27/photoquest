import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Coins, Shield, Zap, ArrowRight, Star } from 'lucide-react'

interface HeroProps {
  onExploreQuests: () => void
  onCreateQuest: () => void
  isConnected: boolean
}

const Hero: React.FC<HeroProps> = ({ onExploreQuests, onCreateQuest, isConnected }) => {
  const features = [
    {
      icon: Camera,
      title: 'Photo Quests',
      description: 'Create and participate in photography challenges'
    },
    {
      icon: Shield,
      title: 'On-Chain Escrow',
      description: 'Secure payments with smart contract escrow'
    },
    {
      icon: Coins,
      title: 'NFT Rewards',
      description: 'Mint winning photos as NFTs with royalties'
    },
    {
      icon: Zap,
      title: 'IPFS Storage',
      description: 'Decentralized storage via Pinata integration'
    }
  ]

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full backdrop-blur-sm"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Fully Decentralized Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Web3 Photo
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {' '}Quest
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Create photography challenges, submit stunning work, and earn rewards in a fully decentralized ecosystem powered by Ethereum, IPFS, and The Graph.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          >
            <button 
              onClick={onExploreQuests}
              className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Explore Quests</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {isConnected && (
              <button 
                onClick={onCreateQuest}
                className="flex items-center space-x-3 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300"
              >
                <Camera className="w-5 h-5" />
                <span>Create Quest</span>
              </button>
            )}
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group"
            >
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="text-3xl font-bold text-gray-900 mb-2">150+</div>
            <div className="text-gray-600">Active Quests</div>
          </div>
          <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="text-3xl font-bold text-gray-900 mb-2">2.5K+</div>
            <div className="text-gray-600">Photographers</div>
          </div>
          <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="text-3xl font-bold text-gray-900 mb-2">45 ETH</div>
            <div className="text-gray-600">Total Rewards</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
