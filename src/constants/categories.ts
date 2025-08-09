import { PhotoCategoryInfo } from '../types'

export const PHOTO_CATEGORIES: PhotoCategoryInfo[] = [
  {
    id: 'portrait',
    name: 'Portrait',
    description: 'People photography, headshots, and character studies',
    icon: '👤',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'landscape',
    name: 'Landscape',
    description: 'Natural scenery, mountains, forests, and outdoor vistas',
    icon: '🏔️',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'wildlife',
    name: 'Wildlife',
    description: 'Animals in their natural habitat and nature photography',
    icon: '🦅',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'event',
    name: 'Event',
    description: 'Weddings, parties, concerts, and special occasions',
    icon: '🎉',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'street',
    name: 'Street',
    description: 'Urban life, candid moments, and street photography',
    icon: '🏙️',
    color: 'from-gray-500 to-slate-500'
  },
  {
    id: 'travel',
    name: 'Travel',
    description: 'Destinations, cultures, and travel experiences',
    icon: '✈️',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'food',
    name: 'Food',
    description: 'Culinary photography, restaurants, and gastronomy',
    icon: '🍽️',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'product',
    name: 'Product',
    description: 'Commercial photography and product showcases',
    icon: '📦',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'architectural',
    name: 'Architectural',
    description: 'Buildings, structures, and architectural details',
    icon: '🏛️',
    color: 'from-stone-500 to-gray-600'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Style, clothing, and fashion photography',
    icon: '👗',
    color: 'from-fuchsia-500 to-pink-500'
  },
  {
    id: 'fine-art',
    name: 'Fine Art',
    description: 'Artistic expression and creative photography',
    icon: '🎨',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'documentary',
    name: 'Documentary',
    description: 'Storytelling, journalism, and documentary photography',
    icon: '📰',
    color: 'from-neutral-500 to-gray-500'
  },
  {
    id: 'macro',
    name: 'Macro',
    description: 'Close-up photography and detailed subjects',
    icon: '🔍',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'sports-action',
    name: 'Sports & Action',
    description: 'Dynamic movement, sports, and action photography',
    icon: '⚽',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'night-low-light',
    name: 'Night/Low-Light',
    description: 'Night photography, astrophotography, and low-light scenes',
    icon: '🌙',
    color: 'from-slate-600 to-gray-800'
  },
  {
    id: 'underwater',
    name: 'Underwater',
    description: 'Marine life and underwater photography',
    icon: '🐠',
    color: 'from-blue-600 to-teal-600'
  },
  {
    id: 'aerial',
    name: 'Aerial Photography',
    description: 'Drone photography and aerial perspectives',
    icon: '🚁',
    color: 'from-sky-500 to-blue-500'
  }
]

export const getCategoryInfo = (categoryId: string): PhotoCategoryInfo | undefined => {
  return PHOTO_CATEGORIES.find(cat => cat.id === categoryId)
}
