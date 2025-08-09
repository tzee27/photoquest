import {
  PhotoSubmitted as PhotoSubmittedEvent,
  PlatformFeeUpdated as PlatformFeeUpdatedEvent,
  QuestCancelled as QuestCancelledEvent,
  QuestCompleted as QuestCompletedEvent,
  QuestCreated as QuestCreatedEvent,
  SubmissionsSelected as SubmissionsSelectedEvent
} from "../generated/YourContract/YourContract"
import {
  PhotoSubmitted,
  PlatformFeeUpdated,
  QuestCancelled,
  QuestCompleted,
  QuestCreated,
  SubmissionsSelected
} from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"

export function handlePhotoSubmitted(event: PhotoSubmittedEvent): void {
  let entity = new PhotoSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.photographer = event.params.photographer
  entity.watermarkedPhotoIPFS = event.params.watermarkedPhotoIPFS
  entity.submissionIndex = event.params.submissionIndex
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let entity = new PlatformFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldFee = event.params.oldFee
  entity.newFee = event.params.newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuestCancelled(event: QuestCancelledEvent): void {
  let entity = new QuestCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.requester = event.params.requester
  entity.refundAmount = event.params.refundAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuestCompleted(event: QuestCompletedEvent): void {
  let entity = new QuestCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.requester = event.params.requester
  entity.totalSelectedSubmissions = event.params.totalSelectedSubmissions
  entity.totalRewardDistributed = event.params.totalRewardDistributed
  entity.platformFee = event.params.platformFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuestCreated(event: QuestCreatedEvent): void {
  let entity = new QuestCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.requester = event.params.requester
  entity.title = event.params.title
  entity.category = event.params.category
  entity.reward = event.params.reward
  entity.deadline = event.params.deadline
  entity.maxSubmissions = event.params.maxSubmissions

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubmissionsSelected(
  event: SubmissionsSelectedEvent
): void {
  let entity = new SubmissionsSelected(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.requester = event.params.requester
  entity.selectedPhotographers = changetype<Bytes[]>(
    event.params.selectedPhotographers
  )
  entity.rewardPerWinner = event.params.rewardPerWinner
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
