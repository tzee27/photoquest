import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export interface PhotoNFT {
  tokenId: bigint;
  questId: bigint;
  photographer: string;
  currentOwner: string;
  title: string;
  description: string;
  category: number;
  watermarkedImageIPFS: string;
  originalImageIPFS: string;
  createdAt: bigint;
  submittedAt: bigint;
  isOriginal: boolean;
  royaltyFee: bigint;
}

export interface NFTTransferData {
  tokenId: bigint;
  from: string;
  to: string;
  price: bigint;
  royaltyAmount: bigint;
  royaltyRecipient: string;
}

export const usePhotoNFTs = () => {
  const [userNFTs, setUserNFTs] = useState<PhotoNFT[]>([]);
  const [createdNFTs, setCreatedNFTs] = useState<PhotoNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: nftContract } = useScaffoldContract({ contractName: "PhotoQuestNFT" });

  // NFT contract write functions
  const { writeContractAsync: transferWithRoyalty } = useScaffoldWriteContract({
    contractName: "PhotoQuestNFT",
  });

  // Get NFTs owned by user
  const { data: ownedNFTIds } = useScaffoldReadContract({
    contractName: "PhotoQuestNFT",
    functionName: "getNFTsByOwner",
    args: [connectedAddress || "0x0"],
  });

  // Get NFTs created by user (as photographer)
  const { data: createdNFTIds } = useScaffoldReadContract({
    contractName: "PhotoQuestNFT",
    functionName: "getNFTsByPhotographer",
    args: [connectedAddress || "0x0"],
  });

  // Fetch NFT details for owned NFTs
  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!ownedNFTIds || !nftContract || !publicClient) {
        setUserNFTs([]);
        return;
      }

      try {
        setIsLoading(true);
        const nftDetails: PhotoNFT[] = [];

        for (const tokenId of ownedNFTIds) {
          try {
            const nftData = await publicClient.readContract({
              address: nftContract.address,
              abi: nftContract.abi,
              functionName: "getNFTDetails",
              args: [tokenId],
            });

            nftDetails.push(nftData as PhotoNFT);
          } catch (err) {
            console.error(`Failed to fetch NFT ${tokenId}:`, err);
          }
        }

        setUserNFTs(nftDetails);
      } catch (err) {
        console.error("Error fetching user NFTs:", err);
        setError("Failed to load your NFTs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTDetails();
  }, [ownedNFTIds, nftContract, publicClient]);

  // Fetch NFT details for created NFTs
  useEffect(() => {
    const fetchCreatedNFTDetails = async () => {
      if (!createdNFTIds || !nftContract || !publicClient) {
        setCreatedNFTs([]);
        return;
      }

      try {
        const nftDetails: PhotoNFT[] = [];

        for (const tokenId of createdNFTIds) {
          try {
            const nftData = await publicClient.readContract({
              address: nftContract.address,
              abi: nftContract.abi,
              functionName: "getNFTDetails",
              args: [tokenId],
            });

            nftDetails.push(nftData as PhotoNFT);
          } catch (err) {
            console.error(`Failed to fetch created NFT ${tokenId}:`, err);
          }
        }

        setCreatedNFTs(nftDetails);
      } catch (err) {
        console.error("Error fetching created NFTs:", err);
      }
    };

    fetchCreatedNFTDetails();
  }, [createdNFTIds, nftContract, publicClient]);

  // Get original image (only for NFT owners)
  const getOriginalImage = async (tokenId: bigint): Promise<string | null> => {
    if (!nftContract || !publicClient) return null;

    try {
      const originalImageIPFS = await publicClient.readContract({
        address: nftContract.address,
        abi: nftContract.abi,
        functionName: "getOriginalImage",
        args: [tokenId],
      });

      return originalImageIPFS as string;
    } catch (err) {
      console.error("Error fetching original image:", err);
      return null;
    }
  };

  // Get royalty info for an NFT
  const getRoyaltyInfo = async (
    tokenId: bigint,
    salePrice: bigint,
  ): Promise<{ recipient: string; amount: bigint } | null> => {
    if (!nftContract || !publicClient) return null;

    try {
      const royaltyData = await publicClient.readContract({
        address: nftContract.address,
        abi: nftContract.abi,
        functionName: "royaltyInfo",
        args: [tokenId, salePrice],
      });

      const [recipient, amount] = royaltyData as [string, bigint];
      return { recipient, amount };
    } catch (err) {
      console.error("Error fetching royalty info:", err);
      return null;
    }
  };

  // Transfer NFT with royalty payment
  const transferNFTWithRoyalty = async (
    from: string,
    to: string,
    tokenId: bigint,
    salePrice: bigint,
  ): Promise<boolean> => {
    try {
      await transferWithRoyalty({
        functionName: "transferWithRoyalty",
        args: [from, to, tokenId, salePrice],
        value: salePrice,
      });

      // Refresh NFT data after transfer
      // This will trigger useEffect to re-fetch
      return true;
    } catch (err) {
      console.error("Error transferring NFT:", err);
      throw err;
    }
  };

  // Check if user owns a specific NFT
  const isNFTOwner = (tokenId: bigint): boolean => {
    return userNFTs.some(nft => nft.tokenId === tokenId);
  };

  // Check if user created a specific NFT
  const isNFTCreator = (tokenId: bigint): boolean => {
    return createdNFTs.some(nft => nft.tokenId === tokenId);
  };

  // Get NFT by token ID from user's collection
  const getNFTById = (tokenId: bigint): PhotoNFT | undefined => {
    return userNFTs.find(nft => nft.tokenId === tokenId) || createdNFTs.find(nft => nft.tokenId === tokenId);
  };

  // Stats for dashboard
  const nftStats = useMemo(() => {
    const totalOwned = userNFTs.length;
    const totalCreated = createdNFTs.length;
    const totalRoyaltyEarnings = createdNFTs.reduce((sum, nft) => {
      // This would need to be calculated from transfer events
      // For now, return 0
      return sum;
    }, 0);

    return {
      totalOwned,
      totalCreated,
      totalRoyaltyEarnings,
    };
  }, [userNFTs, createdNFTs]);

  return {
    // Data
    userNFTs,
    createdNFTs,
    nftStats,
    isLoading,
    error,

    // Functions
    getOriginalImage,
    getRoyaltyInfo,
    transferNFTWithRoyalty,
    isNFTOwner,
    isNFTCreator,
    getNFTById,

    // Refresh function
    refetch: () => {
      // This will trigger useEffect re-runs
      setError(null);
    },
  };
};
