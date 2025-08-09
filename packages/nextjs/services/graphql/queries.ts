import { gql } from "@apollo/client";

// Get all quest created events
export const GET_QUESTS = gql`
  query GetQuests(
    $first: Int = 100
    $skip: Int = 0
    $orderBy: QuestCreated_orderBy = blockTimestamp
    $orderDirection: OrderDirection = desc
  ) {
    questCreateds(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      questId
      requester
      title
      category
      reward
      deadline
      maxSubmissions
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get quests by requester (creator)
export const GET_QUESTS_BY_REQUESTER = gql`
  query GetQuestsByRequester($requester: Bytes!, $first: Int = 100) {
    questCreateds(where: { requester: $requester }, first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      requester
      title
      category
      reward
      deadline
      maxSubmissions
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get photo submissions for a quest
export const GET_QUEST_SUBMISSIONS = gql`
  query GetQuestSubmissions($questId: BigInt!, $first: Int = 100) {
    photoSubmitteds(where: { questId: $questId }, first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      photographer
      watermarkedPhotoIPFS
      submissionIndex
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get all photo submissions by photographer
export const GET_PHOTOS_BY_PHOTOGRAPHER = gql`
  query GetPhotosByPhotographer($photographer: Bytes!, $first: Int = 100) {
    photoSubmitteds(
      where: { photographer: $photographer }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      questId
      photographer
      watermarkedPhotoIPFS
      submissionIndex
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get completed quests
export const GET_COMPLETED_QUESTS = gql`
  query GetCompletedQuests($first: Int = 100) {
    questCompleteds(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      requester
      totalSelectedSubmissions
      totalRewardDistributed
      platformFee
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get cancelled quests
export const GET_CANCELLED_QUESTS = gql`
  query GetCancelledQuests($first: Int = 100) {
    questCancelleds(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      requester
      refundAmount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get submissions selected events
export const GET_SUBMISSIONS_SELECTED = gql`
  query GetSubmissionsSelected($questId: BigInt!) {
    submissionsSelecteds(where: { questId: $questId }, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      requester
      selectedPhotographers
      rewardPerWinner
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get submissions selected events by requester (for gallery)
export const GET_USER_SELECTED_SUBMISSIONS = gql`
  query GetUserSelectedSubmissions($requester: Bytes!, $first: Int = 100) {
    submissionsSelecteds(
      where: { requester: $requester }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      questId
      requester
      selectedPhotographers
      rewardPerWinner
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get platform fee updates
export const GET_PLATFORM_FEE_UPDATES = gql`
  query GetPlatformFeeUpdates($first: Int = 10) {
    platformFeeUpdateds(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      id
      oldFee
      newFee
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Combined query to get quest details with submissions
export const GET_QUEST_WITH_SUBMISSIONS = gql`
  query GetQuestWithSubmissions($questId: BigInt!) {
    questCreateds(where: { questId: $questId }) {
      id
      questId
      requester
      title
      category
      reward
      deadline
      maxSubmissions
      blockNumber
      blockTimestamp
      transactionHash
    }
    photoSubmitteds(where: { questId: $questId }, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      photographer
      watermarkedPhotoIPFS
      submissionIndex
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
    questCompleteds(where: { questId: $questId }) {
      id
      questId
      requester
      totalSelectedSubmissions
      totalRewardDistributed
      platformFee
      blockNumber
      blockTimestamp
      transactionHash
    }
    questCancelleds(where: { questId: $questId }) {
      id
      questId
      requester
      refundAmount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get comprehensive data for user's owned photos (gallery)
export const GET_USER_OWNED_PHOTOS = gql`
  query GetUserOwnedPhotos($requester: Bytes!, $first: Int = 100) {
    # Get all quests created by the user that were completed
    questCreateds(where: { requester: $requester }, first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      requester
      title
      category
      reward
      deadline
      maxSubmissions
      blockNumber
      blockTimestamp
      transactionHash
    }

    # Get completion events for user's quests
    questCompleteds(where: { requester: $requester }, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      requester
      totalSelectedSubmissions
      totalRewardDistributed
      platformFee
      blockNumber
      blockTimestamp
      transactionHash
    }

    # Get selection events for user's quests
    submissionsSelecteds(where: { requester: $requester }, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      requester
      selectedPhotographers
      rewardPerWinner
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Get photo submissions for multiple quests (for gallery)
export const GET_SUBMISSIONS_FOR_QUESTS = gql`
  query GetSubmissionsForQuests($questIds: [BigInt!]!, $first: Int = 500) {
    photoSubmitteds(where: { questId_in: $questIds }, first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      id
      questId
      photographer
      watermarkedPhotoIPFS
      submissionIndex
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;
