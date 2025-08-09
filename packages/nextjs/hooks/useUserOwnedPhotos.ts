import { useCallback, useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export interface OwnedPhoto {
  questId: bigint;
  questTitle: string;
  questCategory: number;
  questReward: string;
  questDeadline: bigint;
  questStatus: number;
  selectedSubmission: {
    photographer: string;
    watermarkedPhotoIPFS: string;
    originalPhotoIPFS: string;
    submittedAt: bigint;
    isSelected: boolean;
    isPaid: boolean;
  };
  totalSelected: number;
  paidAmount: string;
}

export const useUserOwnedPhotos = (userAddress: string | undefined) => {
  const [ownedPhotos, setOwnedPhotos] = useState<OwnedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { data: contract } = useScaffoldContract({ contractName: "YourContract" });

  // Get all quest IDs created by the user
  const { data: userQuestIds, isLoading: isLoadingQuests } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getUserQuests",
    args: [userAddress || "0x0"],
  });

  // Memoize the quest IDs array to prevent unnecessary re-renders
  const questIds = useMemo(() => {
    return userQuestIds ? [...userQuestIds] : [];
  }, [userQuestIds]);

  // Stable reference for the fetch function
  const fetchOwnedPhotos = useCallback(async () => {
    if (!questIds.length || !contract || !publicClient) {
      setOwnedPhotos([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const photos: OwnedPhoto[] = [];

      // Fetch data for each quest using the contract directly
      for (const questId of questIds) {
        try {
          // Fetch quest details
          const questData = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getQuest",
            args: [questId],
          });

          // Fetch selected submissions for this quest
          const submissionsData = await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSelectedSubmissions",
            args: [questId],
          });

          // Process submissions if any exist
          if (submissionsData && (submissionsData as any[]).length > 0) {
            const quest = questData as any;
            const submissions = submissionsData as any[];

            const totalReward = Number(quest.reward) / 1e18;
            const platformFee = totalReward * 0.025; // 2.5% platform fee
            const rewardPool = totalReward - platformFee;
            const rewardPerWinner = rewardPool / submissions.length;

            submissions.forEach((submission: any) => {
              photos.push({
                questId: questId,
                questTitle: quest.title,
                questCategory: quest.category,
                questReward: `${totalReward} ETH`,
                questDeadline: quest.deadline,
                questStatus: quest.status,
                selectedSubmission: submission,
                totalSelected: submissions.length,
                paidAmount: `${rewardPerWinner.toFixed(4)} ETH`,
              });
            });
          }
        } catch (questError) {
          console.error(`Error fetching data for quest ${questId}:`, questError);
          // Continue with other quests even if one fails
        }
      }

      setOwnedPhotos(photos);
    } catch (err) {
      console.error("Error fetching owned photos:", err);
      setError("Failed to load owned photos");
    } finally {
      setIsLoading(false);
    }
  }, [questIds, contract?.address, publicClient]);

  useEffect(() => {
    if (userAddress && questIds.length > 0 && contract && publicClient) {
      fetchOwnedPhotos();
    }
  }, [userAddress, questIds.length, contract?.address, publicClient, fetchOwnedPhotos]);

  const refetch = useCallback(() => {
    if (userAddress && questIds.length > 0 && contract && publicClient) {
      // Force re-fetch by clearing current data
      setOwnedPhotos([]);
      setError(null);
      fetchOwnedPhotos();
    }
  }, [userAddress, questIds.length, contract?.address, publicClient, fetchOwnedPhotos]);

  return {
    ownedPhotos,
    isLoading: isLoading || isLoadingQuests,
    error,
    refetch,
  };
};
