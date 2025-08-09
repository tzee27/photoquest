import React, { useState } from "react";
import { PHOTO_CATEGORIES } from "../constants/categories";
import { PhotoCategory, Quest } from "../types";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Camera, Coins, Loader2, Tag, Upload, Users, X } from "lucide-react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CreateQuestModalProps {
  onClose: () => void;
  onSubmit: (quest: Omit<Quest, "id" | "submissions" | "status">) => void;
}

// Mapping frontend categories to smart contract enum values
const categoryToContractEnum: Record<PhotoCategory, number> = {
  portrait: 0,
  landscape: 1,
  street: 2,
  wildlife: 3,
  architecture: 4,
  event: 5,
  travel: 6, // Map to Product in contract
  abstract: 7, // Map to Other in contract
  nature: 7, // Map to Other in contract
  urban: 2, // Map to Street in contract
  macro: 7, // Map to Other in contract
  night: 7, // Map to Other in contract
};

const CreateQuestModal: React.FC<CreateQuestModalProps> = ({ onClose, onSubmit }) => {
  const { address: connectedAddress } = useAccount();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    deadline: "",
    maxSubmissions: "",
    imageUrl: "",
    tags: "",
    category: "" as PhotoCategory | "",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connectedAddress) {
      setError("Please connect your wallet first");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    if (!formData.reward || parseFloat(formData.reward) <= 0) {
      setError("Please enter a valid reward amount");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Convert deadline to timestamp
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

      // Convert reward to wei
      const rewardInWei = parseEther(formData.reward);

      // Get contract enum value for category
      const categoryEnum = categoryToContractEnum[formData.category];

      console.log("Creating quest with params:", {
        title: formData.title,
        description: formData.description,
        category: categoryEnum,
        deadline: deadlineTimestamp,
        maxSubmissions: parseInt(formData.maxSubmissions) || 10,
        value: rewardInWei.toString(),
      });

      // Call smart contract
      const result = await writeYourContractAsync({
        functionName: "createQuest",
        args: [
          formData.title,
          formData.description,
          categoryEnum,
          BigInt(deadlineTimestamp),
          BigInt(parseInt(formData.maxSubmissions) || 10),
        ],
        value: rewardInWei,
      });

      console.log("Quest created successfully:", result);

      // Create quest data for UI update (optional - you might want to refetch from contract instead)
      const questData: Omit<Quest, "id" | "submissions" | "status"> = {
        title: formData.title,
        description: formData.description,
        reward: `${formData.reward} ETH`,
        deadline: formData.deadline,
        creator: connectedAddress,
        maxSubmissions: parseInt(formData.maxSubmissions) || 50,
        imageUrl:
          formData.imageUrl || "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
        tags: formData.tags
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean),
        category: formData.category as PhotoCategory,
      };

      onSubmit(questData);
    } catch (error: any) {
      console.error("Error creating quest:", error);
      setError(error.message || "Failed to create quest. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

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
          className="relative w-full max-w-2xl bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Create New Quest</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Quest Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isCreating}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50"
                placeholder="Enter quest title..."
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Camera className="w-4 h-4 inline mr-2" />
                Photography Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isCreating}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
              >
                <option value="">Select a category...</option>
                {PHOTO_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name} - {category.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                disabled={isCreating}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none disabled:opacity-50"
                placeholder="Describe your photography challenge..."
              />
            </div>

            {/* Reward and Max Submissions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <Coins className="w-4 h-4 inline mr-2" />
                  Reward (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  required
                  disabled={isCreating}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50"
                  placeholder="0.1"
                />
                <p className="text-xs text-gray-300 mt-1">Minimum: 0.001 ETH</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Max Submissions (optional)
                </label>
                <input
                  type="number"
                  name="maxSubmissions"
                  value={formData.maxSubmissions}
                  onChange={handleChange}
                  min="1"
                  disabled={isCreating}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Deadline
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                disabled={isCreating}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50"
                placeholder="photography, nature, landscape"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="px-6 py-3 text-gray-200 hover:bg-white/10 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !connectedAddress}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isCreating ? "Creating Quest..." : "Create Quest"}</span>
              </button>
            </div>

            {!connectedAddress && (
              <p className="text-center text-sm text-gray-300">Please connect your wallet to create a quest</p>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateQuestModal;
