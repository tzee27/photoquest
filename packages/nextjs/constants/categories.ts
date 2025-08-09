import { PhotoCategory } from "../types";

export interface CategoryInfo {
  id: PhotoCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const PHOTO_CATEGORIES: CategoryInfo[] = [
  {
    id: "landscape",
    name: "Landscape",
    icon: "🏔️",
    color: "from-green-500 to-emerald-500",
    description: "Natural landscapes and scenic views",
  },
  {
    id: "portrait",
    name: "Portrait",
    icon: "👤",
    color: "from-pink-500 to-rose-500",
    description: "People and portrait photography",
  },
  {
    id: "street",
    name: "Street",
    icon: "🏙️",
    color: "from-gray-500 to-slate-500",
    description: "Street photography and urban life",
  },
  {
    id: "nature",
    name: "Nature",
    icon: "🌿",
    color: "from-green-500 to-lime-500",
    description: "Flora, fauna, and natural elements",
  },
  {
    id: "architecture",
    name: "Architecture",
    icon: "🏛️",
    color: "from-blue-500 to-indigo-500",
    description: "Buildings, structures, and architectural details",
  },
  {
    id: "abstract",
    name: "Abstract",
    icon: "🎨",
    color: "from-purple-500 to-violet-500",
    description: "Abstract and artistic compositions",
  },
  {
    id: "wildlife",
    name: "Wildlife",
    icon: "🦅",
    color: "from-orange-500 to-amber-500",
    description: "Animals in their natural habitat",
  },
  {
    id: "urban",
    name: "Urban",
    icon: "🌆",
    color: "from-cyan-500 to-blue-500",
    description: "City life and urban environments",
  },
  {
    id: "macro",
    name: "Macro",
    icon: "🔍",
    color: "from-teal-500 to-green-500",
    description: "Close-up and detailed photography",
  },
  {
    id: "night",
    name: "Night",
    icon: "🌙",
    color: "from-indigo-500 to-purple-500",
    description: "Night photography and low light",
  },
  {
    id: "event",
    name: "Event",
    icon: "🎪",
    color: "from-red-500 to-pink-500",
    description: "Events, celebrations, and gatherings",
  },
  {
    id: "travel",
    name: "Travel",
    icon: "✈️",
    color: "from-yellow-500 to-orange-500",
    description: "Travel destinations and experiences",
  },
];

export const getCategoryInfo = (categoryId: PhotoCategory): CategoryInfo | undefined => {
  return PHOTO_CATEGORIES.find(category => category.id === categoryId);
};
