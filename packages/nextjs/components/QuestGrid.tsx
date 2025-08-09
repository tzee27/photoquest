import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Coins, Users, Clock, Filter, Search } from 'lucide-react'
import { Quest, PhotoCategory } from '../types'
import { PHOTO_CATEGORIES, getCategoryInfo } from '../constants/categories'

interface QuestGridProps {
  quests: Quest[]
  onQuestClick: (quest: Quest) => void
}

const QuestGrid: React.FC<QuestGridProps> = ({ quests, onQuestClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredQuests = quests.filter(quest => {
    const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Ends today'
    if (diffDays === 1) return 'Ends tomorrow'
    return `${diffDays} days left`
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search quests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PhotoCategory | 'all')}
            className="pl-10 pr-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 min-w-[200px]"
          >
            <option value="all">All Categories</option>
            {PHOTO_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white/20 backdrop-blur-sm text-gray-700 hover:bg-white/30'
          }`}
        >
          All Categories
        </button>
        {PHOTO_CATEGORIES.slice(0, 8).map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                : 'bg-white/20 backdrop-blur-sm text-gray-700 hover:bg-white/30'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-gray-600">
        Showing {filteredQuests.length} quest{filteredQuests.length !== 1 ? 's' : ''}
        {selectedCategory !== 'all' && (
          <span> in {getCategoryInfo(selectedCategory)?.name}</span>
        )}
        {searchTerm && (
          <span> matching "{searchTerm}"</span>
        )}
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredQuests.map((quest, index) => {
          const categoryInfo = getCategoryInfo(quest.category)
          
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => onQuestClick(quest)}
              className="group cursor-pointer"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={quest.imageUrl}
                    alt={quest.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Category Badge */}
                  {categoryInfo && (
                    <div className="absolute top-3 left-3">
                      <span className={`flex items-center space-x-1 px-3 py-1 bg-gradient-to-r ${categoryInfo.color} text-white rounded-full text-sm font-medium shadow-lg`}>
                        <span>{categoryInfo.icon}</span>
                        <span>{categoryInfo.name}</span>
                      </span>
                    </div>
                  )}
                  
                  {/* Reward */}
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full text-white font-semibold">
                      <Coins className="w-4 h-4" />
                      <span>{quest.reward}</span>
                    </span>
                  </div>

                  {/* Status */}
                  <div className="absolute bottom-3 left-3">
                    <span className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full text-green-300 text-sm font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{formatDeadline(quest.deadline)}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {quest.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {quest.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{quest.submissions}/{quest.maxSubmissions}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(quest.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {quest.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                    {quest.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        +{quest.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredQuests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No quests found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or category filter
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default QuestGrid
