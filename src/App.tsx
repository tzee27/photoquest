import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import QuestGrid from './components/QuestGrid'
import CreateQuestModal from './components/CreateQuestModal'
import QuestDetailModal from './components/QuestDetailModal'
import LoginModal from './components/LoginModal'
import LeaderboardModal from './components/LeaderboardModal'
import MyQuestsModal from './components/MyQuestsModal'
import { Quest } from './types'

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [isMyQuestsOpen, setIsMyQuestsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Mock data for demonstration with categories
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: '1',
      title: 'Urban Street Art Photography',
      description: 'Capture unique street art and murals in urban environments. Show creativity and artistic expression in public spaces.',
      reward: '0.5 ETH',
      deadline: '2024-02-15',
      status: 'active',
      creator: '0x1234...5678',
      submissions: 12,
      maxSubmissions: 50,
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      tags: ['street-art', 'urban', 'photography'],
      category: 'street'
    },
    {
      id: '2',
      title: 'Nature Macro Photography',
      description: 'Capture stunning close-up shots of insects, flowers, or other natural subjects. Focus on detail and composition.',
      reward: '0.3 ETH',
      deadline: '2024-02-20',
      status: 'active',
      creator: '0x9876...5432',
      submissions: 8,
      maxSubmissions: 30,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      tags: ['nature', 'macro', 'insects'],
      category: 'macro'
    },
    {
      id: '3',
      title: 'Architectural Minimalism',
      description: 'Photograph modern architecture with a focus on clean lines, geometric shapes, and minimalist design principles.',
      reward: '0.8 ETH',
      deadline: '2024-02-25',
      status: 'active',
      creator: '0x5555...7777',
      submissions: 25,
      maxSubmissions: 40,
      imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop',
      tags: ['architecture', 'minimalism', 'modern'],
      category: 'architectural'
    },
    {
      id: '4',
      title: 'Golden Hour Portraits',
      description: 'Create stunning portrait photography during the golden hour. Focus on natural lighting and emotional expression.',
      reward: '0.4 ETH',
      deadline: '2024-02-18',
      status: 'active',
      creator: '0x3333...4444',
      submissions: 15,
      maxSubmissions: 25,
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
      tags: ['portrait', 'golden-hour', 'natural-light'],
      category: 'portrait'
    },
    {
      id: '5',
      title: 'Wildlife in Action',
      description: 'Capture dynamic wildlife moments in their natural habitat. Show animals in motion and natural behavior.',
      reward: '0.6 ETH',
      deadline: '2024-03-01',
      status: 'active',
      creator: '0x7777...8888',
      submissions: 5,
      maxSubmissions: 20,
      imageUrl: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=400&h=300&fit=crop',
      tags: ['wildlife', 'action', 'nature'],
      category: 'wildlife'
    }
  ])

  const handleCreateQuest = (questData: Omit<Quest, 'id' | 'submissions' | 'status'>) => {
    const newQuest: Quest = {
      ...questData,
      id: Date.now().toString(),
      submissions: 0,
      status: 'active'
    }
    setQuests([newQuest, ...quests])
    setIsCreateModalOpen(false)
  }

  const handleConnect = () => {
    setIsConnected(true)
    setUser({
      address: '0x1234...5678',
      username: 'PhotoMaster',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      reputation: 4.8,
      totalEarnings: '2.3 ETH'
    })
  }

  const handleMyQuests = () => {
    if (!isConnected) {
      setIsLoginModalOpen(true)
    } else {
      setIsMyQuestsOpen(true)
    }
  }

  const handleLeaderboard = () => {
    setIsLeaderboardOpen(true)
  }

  const handleCreateQuestClick = () => {
    if (!isConnected) {
      setIsLoginModalOpen(true)
    } else {
      setIsCreateModalOpen(true)
    }
  }

  const scrollToQuests = () => {
    const questsSection = document.getElementById('quests-section')
    if (questsSection) {
      questsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 font-inter">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative z-10">
        <Header 
          isConnected={isConnected}
          user={user}
          onConnect={handleConnect}
          onCreateQuest={handleCreateQuestClick}
          onMyQuests={handleMyQuests}
          onLeaderboard={handleLeaderboard}
        />
        
        <main>
          <Hero 
            onExploreQuests={scrollToQuests}
            onCreateQuest={handleCreateQuestClick}
            isConnected={isConnected}
          />
          
          <section id="quests-section" className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Active Photo Quests
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Browse and participate in photography challenges across all categories. Submit your best work and earn rewards.
                </p>
              </motion.div>

              <QuestGrid 
                quests={quests}
                onQuestClick={setSelectedQuest}
              />
            </div>
          </section>
        </main>

        {/* Modals */}
        {isCreateModalOpen && (
          <CreateQuestModal
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateQuest}
          />
        )}

        {selectedQuest && (
          <QuestDetailModal
            quest={selectedQuest}
            onClose={() => setSelectedQuest(null)}
            isConnected={isConnected}
            onLoginRequired={() => setIsLoginModalOpen(true)}
          />
        )}

        {isLoginModalOpen && (
          <LoginModal
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={handleConnect}
          />
        )}

        {isLeaderboardOpen && (
          <LeaderboardModal
            onClose={() => setIsLeaderboardOpen(false)}
          />
        )}

        {isMyQuestsOpen && (
          <MyQuestsModal
            onClose={() => setIsMyQuestsOpen(false)}
            user={user}
            quests={quests}
          />
        )}
      </div>
    </div>
  )
}

export default App
