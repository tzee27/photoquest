"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Camera, Clock, Coins, Eye, Star, Target, Trophy, Upload, X } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Contract enums mapping
const QuestStatus = {
  0: "Open",
  1: "Accepted",
  2: "Submitted",
  3: "Approved",
  4: "Completed",
  5: "Cancelled",
} as const;

const Category = {
  0: "Portrait",
  1: "Landscape",
  2: "Street",
  3: "Wildlife",
  4: "Architecture",
  5: "Event",
  6: "Product",
  7: "Other",
} as const;

// Image Modal Component
const ImageModal = ({
  isOpen,
  onClose,
  imageUrl,
  questTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  questTitle: string;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{questTitle}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Image */}
          <div className="p-4">
            <img src={imageUrl} alt={questTitle} className="w-full h-auto max-h-[70vh] object-contain rounded-lg" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Photo Upload Modal Component
const PhotoUploadModal = ({
  isOpen,
  onClose,
  questId,
  questTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  questId: bigint;
  questTitle: string;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { writeContractAsync: submitPhoto } = useScaffoldWriteContract("YourContract");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      // TODO: In a real implementation, you would:
      // 1. Upload the file to IPFS
      // 2. Get the IPFS hash
      // 3. Submit the hash to the smart contract

      // For now, we'll use a placeholder IPFS hash
      const placeholderIPFSHash = "QmYourPhotoHashHere";

      await submitPhoto({
        functionName: "submitPhoto",
        args: [questId, placeholderIPFSHash, placeholderIPFSHash], // watermarked and original
      });

      console.log("Photo submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting photo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Submit Photo</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">{questTitle}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Choose a photo to upload</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg border" />
              </div>
            )}

            {/* Camera Option */}
            <div className="mt-6">
              <button
                onClick={() => {
                  // TODO: Implement camera capture
                  alert("Camera feature coming soon!");
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Camera className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Take Photo with Camera</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || isUploading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? "Uploading..." : "Submit Photo"}
              </button>
            </div>

            {/* Note */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will submit your photo to the blockchain. Make sure your photo meets the
                quest requirements before submitting.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Component to fetch individual quest details
const QuestDetailsWrapper = ({ questId, type }: { questId: bigint; type: "created" | "accepted" }) => {
  const { address: connectedAddress } = useAccount();
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: quest } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getQuest",
    args: [questId],
  });

  if (!quest) {
    return (
      <motion.div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 overflow-hidden shadow-sm">
        <div className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Loading quest details...</p>
        </div>
      </motion.div>
    );
  }

  const getStatusDisplay = (status: number) => {
    return QuestStatus[status as keyof typeof QuestStatus] || "Unknown";
  };

  const getCategoryDisplay = (category: number) => {
    return Category[category as keyof typeof Category] || "Other";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-700 border-green-200";
      case "accepted":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "submitted":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "approved":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <Camera className="w-4 h-4" />;
      case "accepted":
        return <Target className="w-4 h-4" />;
      case "submitted":
        return <Clock className="w-4 h-4" />;
      case "approved":
      case "completed":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Camera className="w-4 h-4" />;
    }
  };

  const statusDisplay = getStatusDisplay(quest.status);
  const categoryDisplay = getCategoryDisplay(quest.category);
  const rewardInEth = formatEther(quest.reward);
  const deadlineDate = new Date(Number(quest.deadline) * 1000);
  const createdDate = new Date(Number(quest.createdAt) * 1000);

  // Check if quest has submitted photo
  const hasSubmittedPhoto = quest.watermarkedPhotoIPFS && quest.watermarkedPhotoIPFS.length > 0;

  // Check if user can upload photo (is photographer and quest is accepted but no photo submitted)
  const canUploadPhoto =
    type === "accepted" &&
    quest.photographer.toLowerCase() === connectedAddress?.toLowerCase() &&
    statusDisplay === "Accepted" &&
    !hasSubmittedPhoto;

  // Generate IPFS URL for the image
  const getIPFSUrl = (hash: string) => {
    if (!hash) return "";
    // Remove 'ipfs://' prefix if present
    const cleanHash = hash.replace(/^ipfs:\/\//, "");
    return `https://ipfs.io/ipfs/${cleanHash}`;
  };

  const handleShowImage = () => {
    if (hasSubmittedPhoto) {
      setShowImageModal(true);
    }
  };

  const handleUploadPhoto = () => {
    setShowUploadModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 overflow-hidden hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {/* Quest Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{quest.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{quest.description}</p>
            </div>
            <div className="ml-4 flex flex-col items-end space-y-2">
              {/* Status Badge */}
              <span
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(statusDisplay)}`}
              >
                {getStatusIcon(statusDisplay)}
                <span>{statusDisplay}</span>
              </span>

              {/* Reward */}
              <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-700 font-semibold">
                <Coins className="w-4 h-4" />
                <span>{rewardInEth} ETH</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-4">
            {/* Show Image Button */}
            {hasSubmittedPhoto && (
              <button
                onClick={handleShowImage}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>Show Submitted Photo</span>
              </button>
            )}

            {/* Upload Photo Button */}
            {canUploadPhoto && (
              <button
                onClick={handleUploadPhoto}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
            )}
          </div>

          {/* Quest Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quest ID:</span>
              <span className="font-semibold text-gray-900">#{quest.id.toString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Category:</span>
              <span className="font-semibold text-gray-900">{categoryDisplay}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reward:</span>
              <span className="font-semibold text-green-600">{rewardInEth} ETH</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deadline:</span>
              <span className="font-semibold text-gray-900 text-xs">{deadlineDate.toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="font-semibold text-gray-900 text-xs">{createdDate.toLocaleDateString()}</span>
            </div>

            {quest.submittedAt > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Submitted:</span>
                <span className="font-semibold text-gray-900 text-xs">
                  {new Date(Number(quest.submittedAt) * 1000).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Photo Status:</span>
              <span className={`font-semibold text-xs ${hasSubmittedPhoto ? "text-green-600" : "text-gray-500"}`}>
                {hasSubmittedPhoto ? "Submitted" : "Not Submitted"}
              </span>
            </div>

            {type === "created" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Requester:</span>
                <span className="font-semibold text-gray-900 text-xs font-mono">
                  {quest.requester.slice(0, 6)}...{quest.requester.slice(-4)}
                </span>
              </div>
            )}

            {type === "accepted" && quest.photographer !== "0x0000000000000000000000000000000000000000" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Photographer:</span>
                <span className="font-semibold text-gray-900 text-xs font-mono">
                  {quest.photographer.slice(0, 6)}...{quest.photographer.slice(-4)}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium">
              {categoryDisplay}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg font-medium">{type}</span>
            {hasSubmittedPhoto && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg font-medium">
                Photo Available
              </span>
            )}
            {canUploadPhoto && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-lg font-medium">
                Ready to Submit
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={hasSubmittedPhoto ? getIPFSUrl(quest.watermarkedPhotoIPFS) : ""}
        questTitle={quest.title}
      />

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        questId={questId}
        questTitle={quest.title}
      />
    </>
  );
};

const MyQuestsPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "created">("active");

  // Fetch user's created quests
  const { data: userQuestIds } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getUserQuests",
    args: [connectedAddress],
  });

  // Fetch user's accepted quests (as photographer)
  const { data: photographerQuestIds } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPhotographerQuests",
    args: [connectedAddress],
  });

  // Mock user data - you could fetch this from the contract or IPFS in the future
  const user = {
    address: connectedAddress || "0x1234...5678",
    username: "PhotoQuester",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    reputation: 4.8,
    totalEarnings: "2.3 ETH",
  };

  const questCounts = {
    created: userQuestIds?.length || 0,
    active: photographerQuestIds?.length || 0, // Only accepted quests
    completed: 0, // TODO: Calculate completed quests
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Quests</h1>
            <p className="text-gray-600 mb-8">Connect your wallet to view your photo quests</p>
          </div>
        </div>
      </div>
    );
  }

  const renderQuestList = () => {
    if (activeTab === "created") {
      if (!userQuestIds || userQuestIds.length === 0) {
        return (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No created quests yet</h3>
            <p className="text-gray-500 mb-4">Create your first quest to challenge the community</p>
            <p className="text-sm text-gray-400">Go to the homepage to create your first quest</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userQuestIds.map(questId => (
            <QuestDetailsWrapper key={`created-${questId.toString()}`} questId={questId} type="created" />
          ))}
        </div>
      );
    }

    if (activeTab === "active") {
      if (!photographerQuestIds || photographerQuestIds.length === 0) {
        return (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No active quests yet</h3>
            <p className="text-gray-500 mb-4">Accept photo quests as a photographer to see them here</p>
            <p className="text-sm text-gray-400">Browse available quests on the explore page to get started</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Only Accepted Quests (as photographer) */}
          {photographerQuestIds.map(questId => (
            <QuestDetailsWrapper key={`active-accepted-${questId.toString()}`} questId={questId} type="accepted" />
          ))}
        </div>
      );
    }

    // Completed tab
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No completed quests yet</h3>
        <p className="text-gray-500 mb-4">Complete your first quest to earn rewards</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{user?.address}</h1>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-700">Reputation: {user?.reputation}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">Total Earnings: {user?.totalEarnings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quest Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{questCounts.created}</h3>
            <p className="text-gray-600">Created Quests</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{questCounts.active}</h3>
            <p className="text-gray-600">Active Quests</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{questCounts.completed}</h3>
            <p className="text-gray-600">Completed Quests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            {(["active", "completed", "created"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                <span className="capitalize">{tab} Quests</span>
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {tab === "created"
                    ? questCounts.created
                    : tab === "active"
                      ? questCounts.active
                      : questCounts.completed}
                </span>
              </button>
            ))}
          </div>

          {/* Quest Content */}
          <div className="p-8">{renderQuestList()}</div>
        </div>
      </div>
    </div>
  );
};

export default MyQuestsPage;
