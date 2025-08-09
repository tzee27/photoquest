import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  PhotoSubmitted,
  PlatformFeeUpdated,
  QuestCancelled,
  QuestCompleted,
  QuestCreated,
  SubmissionsSelected
} from "../generated/YourContract/YourContract"

export function createPhotoSubmittedEvent(
  questId: BigInt,
  photographer: Address,
  watermarkedPhotoIPFS: string,
  submissionIndex: BigInt,
  timestamp: BigInt
): PhotoSubmitted {
  let photoSubmittedEvent = changetype<PhotoSubmitted>(newMockEvent())

  photoSubmittedEvent.parameters = new Array()

  photoSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  photoSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "photographer",
      ethereum.Value.fromAddress(photographer)
    )
  )
  photoSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "watermarkedPhotoIPFS",
      ethereum.Value.fromString(watermarkedPhotoIPFS)
    )
  )
  photoSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "submissionIndex",
      ethereum.Value.fromUnsignedBigInt(submissionIndex)
    )
  )
  photoSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return photoSubmittedEvent
}

export function createPlatformFeeUpdatedEvent(
  oldFee: BigInt,
  newFee: BigInt
): PlatformFeeUpdated {
  let platformFeeUpdatedEvent = changetype<PlatformFeeUpdated>(newMockEvent())

  platformFeeUpdatedEvent.parameters = new Array()

  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("oldFee", ethereum.Value.fromUnsignedBigInt(oldFee))
  )
  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return platformFeeUpdatedEvent
}

export function createQuestCancelledEvent(
  questId: BigInt,
  requester: Address,
  refundAmount: BigInt
): QuestCancelled {
  let questCancelledEvent = changetype<QuestCancelled>(newMockEvent())

  questCancelledEvent.parameters = new Array()

  questCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  questCancelledEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  )
  questCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "refundAmount",
      ethereum.Value.fromUnsignedBigInt(refundAmount)
    )
  )

  return questCancelledEvent
}

export function createQuestCompletedEvent(
  questId: BigInt,
  requester: Address,
  totalSelectedSubmissions: BigInt,
  totalRewardDistributed: BigInt,
  platformFee: BigInt
): QuestCompleted {
  let questCompletedEvent = changetype<QuestCompleted>(newMockEvent())

  questCompletedEvent.parameters = new Array()

  questCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  questCompletedEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  )
  questCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "totalSelectedSubmissions",
      ethereum.Value.fromUnsignedBigInt(totalSelectedSubmissions)
    )
  )
  questCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "totalRewardDistributed",
      ethereum.Value.fromUnsignedBigInt(totalRewardDistributed)
    )
  )
  questCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "platformFee",
      ethereum.Value.fromUnsignedBigInt(platformFee)
    )
  )

  return questCompletedEvent
}

export function createQuestCreatedEvent(
  questId: BigInt,
  requester: Address,
  title: string,
  category: i32,
  reward: BigInt,
  deadline: BigInt,
  maxSubmissions: BigInt
): QuestCreated {
  let questCreatedEvent = changetype<QuestCreated>(newMockEvent())

  questCreatedEvent.parameters = new Array()

  questCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam("title", ethereum.Value.fromString(title))
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "category",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(category))
    )
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam("reward", ethereum.Value.fromUnsignedBigInt(reward))
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "deadline",
      ethereum.Value.fromUnsignedBigInt(deadline)
    )
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxSubmissions",
      ethereum.Value.fromUnsignedBigInt(maxSubmissions)
    )
  )

  return questCreatedEvent
}

export function createSubmissionsSelectedEvent(
  questId: BigInt,
  requester: Address,
  selectedPhotographers: Array<Address>,
  rewardPerWinner: BigInt,
  timestamp: BigInt
): SubmissionsSelected {
  let submissionsSelectedEvent = changetype<SubmissionsSelected>(newMockEvent())

  submissionsSelectedEvent.parameters = new Array()

  submissionsSelectedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  submissionsSelectedEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  )
  submissionsSelectedEvent.parameters.push(
    new ethereum.EventParam(
      "selectedPhotographers",
      ethereum.Value.fromAddressArray(selectedPhotographers)
    )
  )
  submissionsSelectedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardPerWinner",
      ethereum.Value.fromUnsignedBigInt(rewardPerWinner)
    )
  )
  submissionsSelectedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return submissionsSelectedEvent
}
