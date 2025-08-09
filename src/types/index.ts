export interface Quest {
  id: string
  title: string
  description: string
  reward: string
  deadline: string
  status: 'active' | 'completed' | 'expired'
  creator: string
  submissions: number
  maxSubmissions: number
  imageUrl: string
  tags: string[]
  category: PhotoCategory
}

export interface Submission {
  id: string
  questId: string
  photographer: string
  imageUrl: string
  ipfsHash: string
  timestamp: string
  status: 'pending' | 'approved' | 'rejected'
  votes: number
}

export interface User {
  address: string
  username?: string
  avatar?: string
  reputation: number
  totalEarnings: string
}

export type PhotoCategory = 
  | 'portrait'
  | 'landscape'
  | 'wildlife'
  | 'event'
  | 'street'
  | 'travel'
  | 'food'
  | 'product'
  | 'architectural'
  | 'fashion'
  | 'fine-art'
  | 'documentary'
  | 'macro'
  | 'sports-action'
  | 'night-low-light'
  | 'underwater'
  | 'aerial'

export interface PhotoCategoryInfo {
  id: PhotoCategory
  name: string
  description: string
  icon: string
  color: string
}
