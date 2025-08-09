import React, { useState } from "react";
import { Quest } from "../types";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Calendar, Camera, Clock, Coins, ExternalLink, Lock, Tag, Upload, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getIPFSGateways, getIPFSUrl, uploadToIPFS, validateFile } from "~~/utils/pinata";

interface QuestDetailModalProps {
  quest: Quest;
  onClose: () => void;
  isConnected: boolean;
  onLoginRequired: () => void;
}

const QuestDetailModal: React.FC<QuestDetailModalProps> = ({ quest, onClose, isConnected, onLoginRequired }) => {
  const [activeTab, setActiveTab] = useState<"details" | "submissions">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const { address: connectedAddress } = useAccount();

  // Fetch the complete quest data from the smart contract
  const { data: contractQuest, isLoading: isLoadingQuest } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getQuest",
    args: [BigInt(quest.id)],
  });

  // Fetch quest submissions
  const { data: questSubmissions, isLoading: isLoadingSubmissions } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getQuestSubmissions",
    args: [BigInt(quest.id)],
  });

  // Check if current user has submitted to this quest
  const { data: hasUserSubmitted } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "hasPhotographerSubmitted",
    args: [BigInt(quest.id), connectedAddress || "0x0"],
  });

  // Get current user's submission if they have one
  const { data: userSubmission } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPhotographerSubmission",
    args: [BigInt(quest.id), connectedAddress || "0x0"],
  });

  // Smart contract write functions
  const { writeContractAsync: submitPhotoAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const { writeContractAsync: selectSubmissionsAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Ends today";
    if (diffDays === 1) return "Ends tomorrow";
    return `${diffDays} days remaining`;
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      onLoginRequired();
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a photo to upload");
      return;
    }

    // Validate file
    if (!validateFile(selectedFile)) {
      toast.error("Invalid file format or size. Please upload a JPEG, PNG, or WebP image under 10MB.");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress("Preparing upload...");

      // Upload the original photo to IPFS
      const uploadResult = await uploadToIPFS(selectedFile, {
        name: `quest-${quest.id}-${selectedFile.name}`,
        keyValues: {
          questId: quest.id,
          photographer: connectedAddress || "",
          type: "quest-submission",
        },
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload to IPFS");
      }

      // For now, we'll use the same hash for both watermarked and original
      // In a real implementation, you'd generate a watermarked version
      const watermarkedHash = uploadResult.ipfsHash;
      const originalHash = uploadResult.ipfsHash;

      setUploadProgress("Submitting to blockchain...");

      // Submit to smart contract
      await submitPhotoAsync({
        functionName: "submitPhoto",
        args: [BigInt(quest.id), watermarkedHash, originalHash],
      });

      toast.success("Photo submitted successfully!");
      setSelectedFile(null);
      setPreviewUrl("");
      onClose();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit photo");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleSelectSubmissions = async (selectedIndices: number[]) => {
    if (!contractQuest || !connectedAddress) return;

    try {
      setIsApproving(true);
      await selectSubmissionsAsync({
        functionName: "selectSubmissions",
        args: [BigInt(quest.id), selectedIndices.map(i => BigInt(i))],
      });
      toast.success("Submissions selected successfully!");
      onClose();
    } catch (error: any) {
      console.error("Selection error:", error);
      toast.error(error.message || "Failed to select submissions");
    } finally {
      setIsApproving(false);
    }
  };

  // Determine if user is the quest creator
  const isQuestCreator =
    contractQuest && connectedAddress && contractQuest.requester.toLowerCase() === connectedAddress.toLowerCase();

  // Check quest status - Updated for new enum values
  const isQuestOpen = contractQuest && contractQuest.status === 0; // QuestStatus.Open
  const hasSubmissions = contractQuest && contractQuest.status === 1; // QuestStatus.HasSubmissions
  const isQuestCompleted = contractQuest && contractQuest.status === 2; // QuestStatus.Completed
  const isQuestCancelled = contractQuest && contractQuest.status === 3; // QuestStatus.Cancelled

  // Check if current user has submitted
  const hasCurrentUserSubmitted = hasUserSubmitted && userSubmission;

  // Check if quest accepts submissions
  const canSubmit = (isQuestOpen || hasSubmissions) && !hasCurrentUserSubmitted && !isQuestCreator;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file immediately
      if (!validateFile(file)) {
        toast.error("Invalid file format or size. Please upload a JPEG, PNG, or WebP image under 10MB.");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  // Get status display text
  const getStatusText = () => {
    if (!contractQuest) return "Loading...";

    switch (contractQuest.status) {
      case 0:
        return "Open";
      case 1:
        return "Has Submissions";
      case 2:
        return "Completed";
      case 3:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  // Format deadline for display
  const getDeadlineText = () => {
    if (!contractQuest) return "Loading...";

    const deadlineDate = new Date(Number(contractQuest.deadline) * 1000);
    const now = new Date();
    const isExpired = deadlineDate < now;

    return isExpired ? "Expired" : deadlineDate.toLocaleDateString();
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
          className="relative w-full max-w-4xl bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-64 overflow-hidden">
            <img src={quest.imageUrl} alt={quest.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Quest Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
                    <span className="text-green-300 text-sm font-medium">Active</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">{formatDeadline(quest.deadline)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full border border-yellow-500/30">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold text-lg">{quest.reward}</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">{quest.title}</h1>
              <p className="text-gray-200 text-lg">{quest.description}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col h-[calc(90vh-16rem)]">
            {/* Tabs */}
            <div className="flex border-b border-white/20">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "details"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/5"
                }`}
              >
                Quest Details
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "submissions"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/5"
                }`}
              >
                Photo Status {hasSubmissions ? "(Submitted)" : "(Pending)"}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-200">Submissions</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {contractQuest?.submissionCount ? Number(contractQuest.submissionCount) : 0}/
                        {contractQuest?.maxSubmissions ? Number(contractQuest.maxSubmissions) : 10}
                      </div>
                    </div>

                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-200">Deadline</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{getDeadlineText()}</div>
                    </div>

                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-gray-200">Creator</span>
                      </div>
                      <div className="text-sm font-mono text-gray-100 font-semibold break-all">{quest.creator}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {quest.tags.map(tag => (
                        <span
                          key={tag}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quest Actions</h3>

                    {!isConnected ? (
                      <div className="text-center py-8">
                        <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Login Required</h4>
                        <p className="text-gray-700 mb-4">
                          You need to connect your wallet to interact with this quest.
                        </p>
                        <button
                          onClick={onLoginRequired}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Connect Wallet
                        </button>
                      </div>
                    ) : isQuestCreator ? (
                      /* Quest Creator View */
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Your Quest</h4>
                        <p className="text-gray-700 mb-4">
                          This is your quest. You can monitor submissions and approve completed work in the Submissions
                          tab.
                        </p>
                        {isQuestOpen && (
                          <p className="text-sm text-blue-600">
                            Quest is open and waiting for photographers to accept.
                          </p>
                        )}
                      </div>
                    ) : isQuestOpen && !isQuestCreator ? (
                      /* Open Quest - Photographer can accept */
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <Camera className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Accept This Quest</h4>
                          <p className="text-gray-700 mb-4">
                            This quest is available for photographers. Accept it to start working and submit your photo.
                          </p>
                        </div>

                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !selectedFile}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{uploadProgress || "Accepting Quest..."}</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-5 h-5" />
                              <span>Accept Quest & Start Working</span>
                            </>
                          )}
                        </button>

                        <div className="p-3 bg-green-50/20 border border-green-200/30 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Note:</strong> By accepting this quest, you commit to delivering a photo that meets
                            the requirements before the deadline.
                          </p>
                        </div>
                      </div>
                    ) : isQuestCompleted ? (
                      /* Accepted Quest - Photographer can submit photo */
                      <div className="space-y-4">
                        <div className="text-center py-2">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Submit Your Photo</h4>
                          <p className="text-gray-700 mb-4">
                            You've accepted this quest. Upload your photo to complete the submission.
                          </p>
                        </div>

                        {/* File Upload Area */}
                        {!selectedFile ? (
                          <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-white/10">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer">
                              <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-800 mb-2 font-medium">Upload your photo submission</p>
                              <p className="text-sm text-gray-600">JPG, PNG, GIF, WebP up to 10MB</p>
                            </label>
                          </div>
                        ) : (
                          /* File Preview */
                          <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50/20">
                            <div className="flex items-center space-x-4">
                              <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                                <p className="text-sm text-gray-600">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                onClick={handleRemoveFile}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Camera Option */}
                        <div>
                          <button
                            onClick={() => {
                              // TODO: Implement camera capture
                              toast("Camera feature coming soon!", {
                                icon: "📷",
                              });
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Camera className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700 font-medium">Take Photo with Camera</span>
                          </button>
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !selectedFile}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{uploadProgress || "Processing..."}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              <span>Submit Photo to IPFS & Blockchain</span>
                            </>
                          )}
                        </button>

                        {/* Upload Info */}
                        <div className="p-3 bg-blue-50/20 border border-blue-200/30 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your photo will be uploaded to IPFS and recorded on the blockchain.
                            Make sure your photo meets the quest requirements before submitting.
                          </p>
                        </div>
                      </div>
                    ) : contractQuest && contractQuest.status === 1 && !isQuestCreator ? (
                      /* Quest has submissions */
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Quest Has Submissions</h4>
                        <p className="text-gray-700 mb-4">
                          This quest has received submissions and is currently being reviewed.
                        </p>
                        <p className="text-sm text-orange-600">
                          Submissions: {contractQuest?.submissionCount ? Number(contractQuest.submissionCount) : 0}
                        </p>
                      </div>
                    ) : contractQuest && contractQuest.status === 2 ? (
                      /* Quest submitted */
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Submission Complete</h4>
                        <p className="text-gray-700 mb-4">
                          The photographer has submitted their work and it's awaiting approval.
                        </p>
                        <p className="text-sm text-blue-600">Check the Submissions tab to view the submitted photo.</p>
                      </div>
                    ) : contractQuest && contractQuest.status >= 3 ? (
                      /* Quest completed */
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Quest Completed</h4>
                        <p className="text-gray-700 mb-4">
                          This quest has been completed and the photographer has been paid.
                        </p>
                        <p className="text-sm text-green-600">View the final submission in the Submissions tab.</p>
                      </div>
                    ) : (
                      /* Fallback */
                      <div className="text-center py-8">
                        <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Quest Not Available</h4>
                        <p className="text-gray-700">This quest is not available for interaction at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "submissions" && (
                <div className="space-y-4">
                  {isLoadingQuest ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      <span className="ml-3 text-gray-600">Loading submission data...</span>
                    </div>
                  ) : hasSubmissions && userSubmission ? (
                    <div className="space-y-4">
                      {/* Submission Info */}
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Photo Submission</h3>

                        <div className="flex items-center space-x-4 p-4 bg-white/30 rounded-lg border border-white/40">
                          {/* Photo Preview */}
                          <div className="flex-shrink-0">
                            {userSubmission.watermarkedPhotoIPFS ? (
                              <div className="relative w-16 h-16">
                                <img
                                  src={getIPFSUrl(userSubmission.watermarkedPhotoIPFS)}
                                  alt="Submitted photo"
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onLoad={e => {
                                    console.log("Image loaded successfully:", userSubmission.watermarkedPhotoIPFS);
                                    // Hide loading overlay
                                    const loadingOverlay = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (loadingOverlay) {
                                      loadingOverlay.style.display = "none";
                                    }
                                  }}
                                  onError={e => {
                                    console.log("Image failed to load from:", e.currentTarget.src);
                                    console.log("IPFS Hash:", userSubmission.watermarkedPhotoIPFS);

                                    // Try multiple fallback gateways
                                    const currentSrc = e.currentTarget.src;
                                    const ipfsHash = userSubmission.watermarkedPhotoIPFS;

                                    // List of IPFS gateways to try
                                    const gateways = getIPFSGateways(ipfsHash);

                                    // Find current gateway index and try next one
                                    let nextGateway = null;
                                    for (let i = 0; i < gateways.length; i++) {
                                      if (currentSrc === gateways[i] && i < gateways.length - 1) {
                                        nextGateway = gateways[i + 1];
                                        break;
                                      }
                                    }

                                    if (nextGateway) {
                                      console.log("Trying next gateway:", nextGateway);
                                      e.currentTarget.src = nextGateway;
                                    } else {
                                      // All gateways failed, use placeholder and hide loading
                                      console.log("All IPFS gateways failed, using placeholder");
                                      e.currentTarget.src =
                                        "https://images.unsplash.com/photo-1494790108755-2616c95e2d75?w=64&h=64&fit=crop";
                                      const loadingOverlay = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (loadingOverlay) {
                                        loadingOverlay.style.display = "none";
                                      }
                                    }
                                  }}
                                />
                                {/* Loading overlay */}
                                <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Camera className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Submission Details */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-mono text-sm text-gray-800 font-semibold">
                                {userSubmission.photographer}
                              </span>
                              <ExternalLink className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                              Submitted: {new Date(Number(userSubmission.submittedAt) * 1000).toLocaleDateString()}
                            </div>
                            {userSubmission.watermarkedPhotoIPFS && (
                              <div className="text-xs text-gray-600 mt-1">
                                IPFS: {userSubmission.watermarkedPhotoIPFS.slice(0, 20)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Approval Section - Only show to quest creator */}
                      {isQuestCreator && contractQuest?.status === 2 && (
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Review Submission</h4>
                          <p className="text-sm text-gray-700 mb-4">
                            Review the submitted photo and approve it to complete the quest and release payment to the
                            photographer.
                          </p>

                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleSelectSubmissions([0])} // For now, approve first submission
                              disabled={isApproving}
                              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isApproving ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Approving...</span>
                                </>
                              ) : (
                                <>
                                  <Coins className="w-5 h-5" />
                                  <span>Approve & Complete Quest</span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-center text-sm text-gray-700 mt-2">Reward: {quest.reward}</p>
                        </div>
                      )}

                      {/* Status Info */}
                      {contractQuest?.status === 3 && (
                        <div className="p-4 bg-green-50/20 backdrop-blur-sm rounded-lg border border-green-200/30">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-green-700 font-medium">Quest Completed & Payment Released</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            Completed on:{" "}
                            {contractQuest.completedAt
                              ? new Date(Number(contractQuest.completedAt) * 1000).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Submissions Yet</h3>
                      <p className="text-gray-500 mb-4">
                        This quest is waiting for photographers to submit their work.
                      </p>
                      {contractQuest?.status === 0 && (
                        <p className="text-sm text-blue-600">Quest is open and accepting photographers.</p>
                      )}
                      {contractQuest?.status === 1 && (
                        <p className="text-sm text-orange-600">
                          Quest has {contractQuest?.submissionCount ? Number(contractQuest.submissionCount) : 0}{" "}
                          submissions
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuestDetailModal;
