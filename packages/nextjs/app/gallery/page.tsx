"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Calendar, Camera, Coins, Download, ExternalLink, Eye, Filter, Tag, User } from "lucide-react";
import { useAccount } from "wagmi";
import { useUserGalleryPhotos } from "~~/hooks/useSubgraph";
import { getIPFSUrl } from "~~/utils/pinata";

const categoryNames = ["Portrait", "Landscape", "Street", "Wildlife", "Architecture", "Event", "Product", "Other"];

const statusNames = ["Open", "Has Submissions", "Completed", "Cancelled"];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [imageError, setImageError] = useState<Set<string>>(new Set());

  const { address: connectedAddress, isConnected } = useAccount();

  // Use the new subgraph-powered hook for gallery photos
  const {
    photos: ownedPhotos,
    loading: isLoading,
    error,
    totalPhotos,
    totalSpent,
    uniqueQuests,
    uniquePhotographers,
  } = useUserGalleryPhotos(connectedAddress || "", false); // No auto-polling for better performance

  // Filter photos based on selected filters
  const filteredPhotos = ownedPhotos.filter(item => {
    const categoryMatch = selectedCategory === "All" || categoryNames[item.questCategory] === selectedCategory;
    const statusMatch = selectedStatus === "All" || statusNames[item.questStatus] === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const handleImageError = (ipfsHash: string) => {
    setImageError(prev => new Set([...prev, ipfsHash]));
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 1:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 2:
        return "bg-green-100 text-green-700 border-green-200";
      case 3:
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleDownload = (
    originalPhotoIPFS: string,
    watermarkedPhotoIPFS: string,
    questTitle: string,
    photographer: string,
  ) => {
    // Use original photo if available, fallback to watermarked photo
    const downloadHash =
      originalPhotoIPFS && originalPhotoIPFS !== watermarkedPhotoIPFS ? originalPhotoIPFS : watermarkedPhotoIPFS;
    const ipfsUrl = getIPFSUrl(downloadHash);
    const link = document.createElement("a");
    link.href = ipfsUrl;
    link.download = `${questTitle}-by-${photographer}-${originalPhotoIPFS && originalPhotoIPFS !== watermarkedPhotoIPFS ? "original" : "watermarked"}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueCategories = ["All", ...Array.from(new Set(ownedPhotos.map(p => categoryNames[p.questCategory])))];
  const uniqueStatuses = ["All", ...Array.from(new Set(ownedPhotos.map(p => statusNames[p.questStatus])))];

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-500">Please connect your wallet to view your owned photos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Photo Collection</h1>
        <p className="text-gray-600">
          Your purchased photos from completed quests • {totalPhotos} photos owned • {totalSpent.toFixed(4)} ETH spent
        </p>
        {error && <p className="text-sm text-red-600 mt-2">{error.message} - Some photos may not be displayed.</p>}

        {/* Subgraph indicator */}
        <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-green-800">📊 Powered by The Graph - Optimized data loading</span>
        </div>
      </div>

      {/* Stats Cards */}
      {ownedPhotos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2 mb-1">
              <Camera className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Total Photos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalPhotos}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2 mb-1">
              <Coins className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-700">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalSpent.toFixed(4)} ETH</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2 mb-1">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-700">Quests Completed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{uniqueQuests}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2 mb-1">
              <User className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-700">Photographers</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{uniquePhotographers}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filters:</span>
        </div>

        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {uniqueCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Status:</span>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-500">
          {filteredPhotos.length} of {ownedPhotos.length} photos
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading your collection from subgraph...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && ownedPhotos.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Photos Owned Yet</h2>
          <p className="text-gray-500 mb-4">
            You don't own any photos yet. Create quests and select winning submissions to build your collection.
          </p>
          <a
            href="/my-quests"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-5 h-5 mr-2" />
            View My Quests
          </a>
        </div>
      )}

      {/* Gallery Grid */}
      {!isLoading && filteredPhotos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={`${photo.questId}-${photo.photographer}-${photo.submissionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="relative aspect-square">
                {!imageError.has(photo.watermarkedPhotoIPFS) ? (
                  <img
                    src={getIPFSUrl(photo.watermarkedPhotoIPFS)}
                    alt={`Owned photo from ${photo.questTitle}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(photo.watermarkedPhotoIPFS)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(photo.questStatus)}`}
                  >
                    {statusNames[photo.questStatus]}
                  </span>
                </div>

                {/* Owned Badge */}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">Owned</span>
                </div>

                {/* Download Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <button
                    onClick={() =>
                      handleDownload(
                        photo.originalPhotoIPFS,
                        photo.watermarkedPhotoIPFS,
                        photo.questTitle,
                        photo.photographer,
                      )
                    }
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {photo.originalPhotoIPFS && photo.originalPhotoIPFS !== photo.watermarkedPhotoIPFS
                        ? "Download Original"
                        : "Download"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{photo.questTitle}</h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <span>{categoryNames[photo.questCategory]}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="font-mono text-xs truncate">
                      {photo.photographer.slice(0, 6)}...
                      {photo.photographer.slice(-4)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4" />
                    <span>Paid: {photo.paidAmount}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Acquired: {new Date(Number(photo.submittedAt) * 1000).toLocaleDateString()}</span>
                  </div>

                  {photo.totalSelected > 1 && (
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>1 of {photo.totalSelected} selected</span>
                    </div>
                  )}
                </div>

                {/* IPFS Info */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <ExternalLink className="w-3 h-3" />
                      <span className="font-mono truncate">Display: {photo.watermarkedPhotoIPFS.slice(0, 15)}...</span>
                    </div>
                    {photo.originalPhotoIPFS && photo.originalPhotoIPFS !== photo.watermarkedPhotoIPFS && (
                      <div className="flex items-center space-x-2 text-xs text-green-600">
                        <Download className="w-3 h-3" />
                        <span className="font-mono truncate">Original: {photo.originalPhotoIPFS.slice(0, 15)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* No Results After Filtering */}
      {!isLoading && ownedPhotos.length > 0 && filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Photos Match Your Filters</h2>
          <p className="text-gray-500 mb-4">Try adjusting your category or status filters to see more photos.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
