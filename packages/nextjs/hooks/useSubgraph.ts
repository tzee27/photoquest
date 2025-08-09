import { useMemo } from "react";
import React from "react";
import { useScaffoldContract } from "./scaffold-eth";
import { useQuery } from "@apollo/client";
import { usePublicClient } from "wagmi";
import {
  GET_CANCELLED_QUESTS,
  GET_COMPLETED_QUESTS,
  GET_PHOTOS_BY_PHOTOGRAPHER,
  GET_QUESTS,
  GET_QUESTS_BY_REQUESTER,
  GET_QUEST_SUBMISSIONS,
  GET_QUEST_WITH_SUBMISSIONS,
  GET_SUBMISSIONS_FOR_QUESTS,
  GET_SUBMISSIONS_SELECTED,
  GET_USER_OWNED_PHOTOS,
  GET_USER_SELECTED_SUBMISSIONS,
} from "~~/services/graphql/queries";
import {
  GalleryPhoto,
  GetCancelledQuestsResponse,
  GetCompletedQuestsResponse,
  GetQuestSubmissionsResponse,
  GetQuestWithSubmissionsResponse,
  GetQuestsResponse,
  GetSubmissionsForQuestsResponse,
  GetSubmissionsSelectedResponse,
  GetUserOwnedPhotosResponse,
  GetUserSelectedSubmissionsResponse,
  QuestCreated,
  QuestWithStatus,
} from "~~/types/subgraph";

// Configuration for polling intervals - more conservative approach
const POLLING_CONFIG = {
  DISABLED: undefined, // No polling
  SLOW: 60000, // 1 minute - for background data
  NORMAL: 30000, // 30 seconds - for active data
  FAST: 10000, // 10 seconds - for critical real-time data
};

// Hook to get all quests with optimized caching
export const useGetQuests = (first: number = 50, skip: number = 0, enablePolling: boolean = false) => {
  return useQuery<GetQuestsResponse>(GET_QUESTS, {
    variables: { first, skip },
    pollInterval: enablePolling ? POLLING_CONFIG.NORMAL : POLLING_CONFIG.DISABLED,
    notifyOnNetworkStatusChange: false, // Reduce re-renders
    fetchPolicy: "cache-first", // Use cache when possible
    errorPolicy: "all",
  });
};

// Hook to get quests by requester - only poll when user is connected
export const useGetQuestsByRequester = (requester: string, first: number = 50, enablePolling: boolean = false) => {
  return useQuery<GetQuestsResponse>(GET_QUESTS_BY_REQUESTER, {
    variables: { requester, first },
    pollInterval: requester && enablePolling ? POLLING_CONFIG.SLOW : POLLING_CONFIG.DISABLED,
    skip: !requester,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
};

// Hook to get submissions for a specific quest - minimal polling
export const useGetQuestSubmissions = (questId: string, enablePolling: boolean = false) => {
  return useQuery<GetQuestSubmissionsResponse>(GET_QUEST_SUBMISSIONS, {
    variables: { questId },
    pollInterval: questId && enablePolling ? POLLING_CONFIG.NORMAL : POLLING_CONFIG.DISABLED,
    skip: !questId,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
};

// Hook to get photos by photographer - background polling only
export const useGetPhotosByPhotographer = (
  photographer: string,
  first: number = 50,
  enablePolling: boolean = false,
) => {
  return useQuery<GetQuestSubmissionsResponse>(GET_PHOTOS_BY_PHOTOGRAPHER, {
    variables: { photographer, first },
    pollInterval: photographer && enablePolling ? POLLING_CONFIG.SLOW : POLLING_CONFIG.DISABLED,
    skip: !photographer,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
};

// Hook to get completed quests - cached heavily since they don't change
export const useGetCompletedQuests = (first: number = 100, enablePolling: boolean = false) => {
  return useQuery<GetCompletedQuestsResponse>(GET_COMPLETED_QUESTS, {
    variables: { first },
    pollInterval: enablePolling ? POLLING_CONFIG.SLOW : POLLING_CONFIG.DISABLED,
    fetchPolicy: "cache-first", // Completed quests rarely change
    errorPolicy: "all",
  });
};

// Hook to get cancelled quests - cached heavily since they don't change
export const useGetCancelledQuests = (first: number = 100, enablePolling: boolean = false) => {
  return useQuery<GetCancelledQuestsResponse>(GET_CANCELLED_QUESTS, {
    variables: { first },
    pollInterval: enablePolling ? POLLING_CONFIG.SLOW : POLLING_CONFIG.DISABLED,
    fetchPolicy: "cache-first", // Cancelled quests don't change
    errorPolicy: "all",
  });
};

// Hook to get submission selection events for a quest
export const useGetSubmissionsSelected = (questId: string, enablePolling: boolean = false) => {
  return useQuery<GetSubmissionsSelectedResponse>(GET_SUBMISSIONS_SELECTED, {
    variables: { questId },
    pollInterval: questId && enablePolling ? POLLING_CONFIG.SLOW : POLLING_CONFIG.DISABLED,
    skip: !questId,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
};

// Hook to get comprehensive quest data with submissions - use sparingly
export const useGetQuestWithSubmissions = (questId: string, enablePolling: boolean = false) => {
  return useQuery<GetQuestWithSubmissionsResponse>(GET_QUEST_WITH_SUBMISSIONS, {
    variables: { questId },
    pollInterval: questId && enablePolling ? POLLING_CONFIG.NORMAL : POLLING_CONFIG.DISABLED,
    skip: !questId,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
};

// NEW HOOKS FOR GALLERY FUNCTIONALITY

// Hook to get user's owned photos data (for gallery)
export const useGetUserOwnedPhotos = (requester: string, enablePolling: boolean = false) => {
  return useQuery<GetUserOwnedPhotosResponse>(GET_USER_OWNED_PHOTOS, {
    variables: { requester, first: 100 },
    pollInterval: requester && enablePolling ? POLLING_CONFIG.SLOW : POLLING_CONFIG.DISABLED,
    skip: !requester,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
};

// Hook to get submissions for multiple quests
export const useGetSubmissionsForQuests = (questIds: string[], enablePolling: boolean = false) => {
  return useQuery<GetSubmissionsForQuestsResponse>(GET_SUBMISSIONS_FOR_QUESTS, {
    variables: { questIds, first: 500 },
    pollInterval: questIds.length > 0 && enablePolling ? POLLING_CONFIG.SLOW : POLLING_CONFIG.DISABLED,
    skip: questIds.length === 0,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
};

// Hook to get user's selected submissions
export const useGetUserSelectedSubmissions = (requester: string, enablePolling: boolean = false) => {
  return useQuery<GetUserSelectedSubmissionsResponse>(GET_USER_SELECTED_SUBMISSIONS, {
    variables: { requester, first: 100 },
    pollInterval: requester && enablePolling ? POLLING_CONFIG.SLOW : POLLING_CONFIG.DISABLED,
    skip: !requester,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
};

// Utility hooks for common use cases - optimized with memoization

// Hook to get active quests with optimized filtering
export const useGetActiveQuests = (enablePolling: boolean = true) => {
  const { data: allQuests, loading, error } = useGetQuests(100, 0, enablePolling);
  const { data: completedQuests } = useGetCompletedQuests(100, false); // Don't poll completed
  const { data: cancelledQuests } = useGetCancelledQuests(100, false); // Don't poll cancelled

  // Memoize the filtering to prevent unnecessary recalculations
  const activeQuests: QuestWithStatus[] | undefined = useMemo(() => {
    if (!allQuests?.questCreateds) return undefined;

    const completedSet = new Set(completedQuests?.questCompleteds?.map(q => q.questId) || []);
    const cancelledSet = new Set(cancelledQuests?.questCancelleds?.map(q => q.questId) || []);

    // First, deduplicate by questId in case there are duplicate entries
    const questMap = new Map();
    allQuests.questCreateds.forEach((quest: QuestCreated) => {
      // Only keep the latest version of each quest (in case of duplicates)
      const existing = questMap.get(quest.questId);
      if (!existing || Number(quest.blockTimestamp) > Number(existing.blockTimestamp)) {
        questMap.set(quest.questId, quest);
      }
    });

    // Then filter out completed and cancelled quests
    return Array.from(questMap.values())
      .filter((quest: QuestCreated) => !completedSet.has(quest.questId) && !cancelledSet.has(quest.questId))
      .map((quest: QuestCreated) => ({
        ...quest,
        status: "active" as const,
        isCompleted: false,
        isCancelled: false,
      }));
  }, [allQuests?.questCreateds, completedQuests?.questCompleteds, cancelledQuests?.questCancelleds]);

  return {
    data: activeQuests,
    loading,
    error,
  };
};

// Hook to get user's quest statistics - optimized with minimal polling
export const useGetUserStats = (userAddress: string, enablePolling: boolean = false) => {
  const { data: createdQuests } = useGetQuestsByRequester(userAddress, 50, enablePolling);
  const { data: submissions } = useGetPhotosByPhotographer(userAddress, 50, enablePolling);
  const { data: completedQuests } = useGetCompletedQuests(100, false); // Static data

  // Memoize calculations to prevent unnecessary recalculations
  return useMemo(() => {
    const userCompletedQuests =
      completedQuests?.questCompleteds?.filter(quest => quest.requester.toLowerCase() === userAddress?.toLowerCase()) ||
      [];

    return {
      createdQuestsCount: createdQuests?.questCreateds?.length || 0,
      submissionsCount: submissions?.photoSubmitteds?.length || 0,
      completedQuestsCount: userCompletedQuests.length,
      loading: false,
    };
  }, [createdQuests, submissions, completedQuests, userAddress]);
};

// Lightweight hook for quest counts only (no detailed data)
export const useGetQuestCounts = () => {
  const { data: allQuests } = useGetQuests(1, 0, false); // Just get count, no polling
  const { data: completedQuests } = useGetCompletedQuests(1, false);
  const { data: cancelledQuests } = useGetCancelledQuests(1, false);

  return useMemo(
    () => ({
      total: allQuests?.questCreateds?.length || 0,
      completed: completedQuests?.questCompleteds?.length || 0,
      cancelled: cancelledQuests?.questCancelleds?.length || 0,
      active: Math.max(
        0,
        (allQuests?.questCreateds?.length || 0) -
          (completedQuests?.questCompleteds?.length || 0) -
          (cancelledQuests?.questCancelleds?.length || 0),
      ),
    }),
    [allQuests, completedQuests, cancelledQuests],
  );
};

// COMPREHENSIVE HOOK FOR GALLERY FUNCTIONALITY
export const useUserGalleryPhotos = (userAddress: string, enablePolling: boolean = false) => {
  const publicClient = usePublicClient();
  const { data: contract } = useScaffoldContract({ contractName: "YourContract" });

  // Get user's completed quests and selection events
  const {
    data: userOwnedData,
    loading: loadingOwned,
    error: errorOwned,
  } = useGetUserOwnedPhotos(userAddress, enablePolling);

  // Get quest IDs from completed quests
  const completedQuestIds = useMemo(() => {
    if (!userOwnedData?.questCompleteds) return [];
    return userOwnedData.questCompleteds.map(quest => quest.questId);
  }, [userOwnedData]);

  // Get submissions for those quests
  const { data: submissionsData, loading: loadingSubmissions } = useGetSubmissionsForQuests(completedQuestIds, false);

  // Process and combine the data into gallery photos
  const galleryPhotos: GalleryPhoto[] = useMemo(() => {
    if (!userOwnedData || !submissionsData) return [];

    const photos: GalleryPhoto[] = [];
    const { questCreateds, questCompleteds, submissionsSelecteds } = userOwnedData;
    const { photoSubmitteds } = submissionsData;

    // Create maps for quick lookup
    const questMap = new Map(questCreateds.map(q => [q.questId, q]));
    const completedMap = new Map(questCompleteds.map(q => [q.questId, q]));
    const selectionMap = new Map(submissionsSelecteds.map(s => [s.questId, s]));

    // Process each selection event
    submissionsSelecteds.forEach(selection => {
      const quest = questMap.get(selection.questId);
      const completed = completedMap.get(selection.questId);

      if (!quest || !completed) return;

      // Find selected submissions for this quest
      const questSubmissions = photoSubmitteds.filter(sub => sub.questId === selection.questId);

      // Match selected photographers with their submissions
      selection.selectedPhotographers.forEach(photographerAddress => {
        const submission = questSubmissions.find(
          sub => sub.photographer.toLowerCase() === photographerAddress.toLowerCase(),
        );

        if (submission) {
          const totalReward = Number(quest.reward) / 1e18;
          const platformFee = totalReward * 0.025; // 2.5% platform fee
          const rewardPool = totalReward - platformFee;
          const rewardPerWinner = rewardPool / selection.selectedPhotographers.length;

          photos.push({
            questId: quest.questId,
            questTitle: quest.title,
            questCategory: quest.category,
            questReward: `${totalReward} ETH`,
            questDeadline: quest.deadline,
            questStatus: 2, // Completed
            photographer: submission.photographer,
            watermarkedPhotoIPFS: submission.watermarkedPhotoIPFS,
            originalPhotoIPFS: submission.watermarkedPhotoIPFS, // Will be updated with original hash
            submissionIndex: submission.submissionIndex,
            submittedAt: submission.timestamp,
            totalSelected: selection.selectedPhotographers.length,
            paidAmount: `${rewardPerWinner.toFixed(4)} ETH`,
            isOwned: true,
          });
        }
      });
    });

    return photos.sort((a, b) => Number(b.submittedAt) - Number(a.submittedAt));
  }, [userOwnedData, submissionsData]);

  // Fetch original photo hashes from contract for owned photos
  const [photosWithOriginals, setPhotosWithOriginals] = React.useState<GalleryPhoto[]>([]);

  React.useEffect(() => {
    const fetchOriginalHashes = async () => {
      if (!contract || !publicClient || galleryPhotos.length === 0) {
        setPhotosWithOriginals(galleryPhotos);
        return;
      }

      try {
        const updatedPhotos = await Promise.all(
          galleryPhotos.map(async photo => {
            try {
              // Get the selected submissions for this quest
              const selectedSubmissions = (await publicClient.readContract({
                address: contract.address,
                abi: contract.abi,
                functionName: "getSelectedSubmissions",
                args: [BigInt(photo.questId)],
              })) as any[];

              // Find the submission by photographer
              const submission = selectedSubmissions.find(
                (sub: any) => sub.photographer.toLowerCase() === photo.photographer.toLowerCase(),
              );

              if (submission && submission.originalPhotoIPFS) {
                return {
                  ...photo,
                  originalPhotoIPFS: submission.originalPhotoIPFS,
                };
              }

              return photo;
            } catch (error) {
              console.warn(`Failed to fetch original photo for quest ${photo.questId}:`, error);
              return photo;
            }
          }),
        );

        setPhotosWithOriginals(updatedPhotos);
      } catch (error) {
        console.error("Failed to fetch original photo hashes:", error);
        setPhotosWithOriginals(galleryPhotos);
      }
    };

    fetchOriginalHashes();
  }, [galleryPhotos, contract, publicClient]);

  return {
    photos: photosWithOriginals,
    loading: loadingOwned || loadingSubmissions,
    error: errorOwned,
    totalPhotos: photosWithOriginals.length,
    totalSpent: photosWithOriginals.reduce((sum, photo) => sum + parseFloat(photo.paidAmount.replace(" ETH", "")), 0),
    uniqueQuests: new Set(photosWithOriginals.map(p => p.questId)).size,
    uniquePhotographers: new Set(photosWithOriginals.map(p => p.photographer)).size,
  };
};

// Hook to get user's active submissions with quest details
export const useGetUserActiveSubmissions = (userAddress: string, enablePolling: boolean = false) => {
  // Normalize the address to lowercase for subgraph queries
  const normalizedAddress = userAddress?.toLowerCase();

  // Get user's photo submissions
  const {
    data: userSubmissions,
    loading: loadingSubmissions,
    error,
  } = useGetPhotosByPhotographer(normalizedAddress, 100, enablePolling);

  // Get all quests to match with submissions
  const { data: allQuests, loading: loadingQuests } = useGetQuests(500, 0, false);

  // Get completed and cancelled quests to filter out
  const { data: completedQuests } = useGetCompletedQuests(100, false);
  const { data: cancelledQuests } = useGetCancelledQuests(100, false);

  console.log("🔍 useGetUserActiveSubmissions - Raw Data:", {
    originalUserAddress: userAddress,
    normalizedAddress,
    userSubmissions: userSubmissions,
    userSubmissionsCount: userSubmissions?.photoSubmitteds?.length,
    allQuestsCount: allQuests?.questCreateds?.length,
    completedQuestsCount: completedQuests?.questCompleteds?.length,
    cancelledQuestsCount: cancelledQuests?.questCancelleds?.length,
    loadingSubmissions,
    loadingQuests,
    error: error?.message,
  });

  // Process and combine the data
  const activeSubmissions = useMemo(() => {
    console.log("🔍 Processing submissions for userAddress:", normalizedAddress);

    if (!userSubmissions?.photoSubmitteds) {
      console.log("🔍 No user submissions found");
      return [];
    }

    if (!allQuests?.questCreateds) {
      console.log("🔍 No quests found");
      return [];
    }

    const completedSet = new Set(completedQuests?.questCompleteds?.map(q => q.questId) || []);
    const cancelledSet = new Set(cancelledQuests?.questCancelleds?.map(q => q.questId) || []);

    console.log("🔍 Active Submissions Debug - Detailed:", {
      normalizedAddress,
      totalSubmissions: userSubmissions.photoSubmitteds.length,
      submissionDetails: userSubmissions.photoSubmitteds.map(s => ({
        questId: s.questId,
        photographer: s.photographer,
        photographerLower: s.photographer.toLowerCase(),
        userAddressLower: normalizedAddress,
        matches: s.photographer.toLowerCase() === normalizedAddress,
        ipfs: s.watermarkedPhotoIPFS.slice(0, 20),
        timestamp: s.timestamp,
      })),
      completedQuests: Array.from(completedSet),
      cancelledQuests: Array.from(cancelledSet),
    });

    // Create a map of quest details for quick lookup
    const questMap = new Map(allQuests.questCreateds.map(q => [q.questId, q]));

    // For submissions, we want to show:
    // 1. Submissions to active quests (not completed/cancelled)
    // 2. OR submissions to completed quests where user hasn't been selected yet
    const filteredSubmissions = userSubmissions.photoSubmitteds
      .map(submission => {
        const quest = questMap.get(submission.questId);
        const isCompleted = completedSet.has(submission.questId);
        const isCancelled = cancelledSet.has(submission.questId);

        console.log(`🔍 Processing submission ${submission.questId}:`, {
          questExists: !!quest,
          isCompleted,
          isCancelled,
          questTitle: quest?.title,
          photographer: submission.photographer,
          normalizedAddress,
          addressMatch: submission.photographer.toLowerCase() === normalizedAddress,
        });

        return {
          ...submission,
          questDetails: quest,
          isCompleted,
          isCancelled,
        };
      })
      .filter(submission => {
        // Include if:
        // 1. Quest exists and is not cancelled
        // 2. Either active OR completed (we'll show both for now)
        const shouldInclude = submission.questDetails && !submission.isCancelled;
        console.log(`🔍 Filter decision for ${submission.questId}:`, {
          hasQuestDetails: !!submission.questDetails,
          isCancelled: submission.isCancelled,
          shouldInclude,
        });
        return shouldInclude;
      })
      .sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp));

    console.log("🔍 Active Submissions Final Result:", {
      count: filteredSubmissions.length,
      submissions: filteredSubmissions.map(s => ({
        questId: s.questId,
        title: s.questDetails?.title,
        isCompleted: s.isCompleted,
        photographer: s.photographer,
        ipfs: s.watermarkedPhotoIPFS.slice(0, 20),
      })),
    });

    return filteredSubmissions;
  }, [
    userSubmissions?.photoSubmitteds,
    allQuests?.questCreateds,
    completedQuests?.questCompleteds,
    cancelledQuests?.questCancelleds,
    normalizedAddress,
  ]);

  return {
    data: activeSubmissions,
    loading: loadingSubmissions || loadingQuests,
    error,
    count: activeSubmissions.length,
    uniqueQuests: new Set(activeSubmissions.map(s => s.questId)).size,
  };
};
