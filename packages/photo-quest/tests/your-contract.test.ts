import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { PhotoSubmitted } from "../generated/schema"
import { PhotoSubmitted as PhotoSubmittedEvent } from "../generated/YourContract/YourContract"
import { handlePhotoSubmitted } from "../src/your-contract"
import { createPhotoSubmittedEvent } from "./your-contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let questId = BigInt.fromI32(234)
    let photographer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let watermarkedPhotoIPFS = "Example string value"
    let submissionIndex = BigInt.fromI32(234)
    let timestamp = BigInt.fromI32(234)
    let newPhotoSubmittedEvent = createPhotoSubmittedEvent(
      questId,
      photographer,
      watermarkedPhotoIPFS,
      submissionIndex,
      timestamp
    )
    handlePhotoSubmitted(newPhotoSubmittedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("PhotoSubmitted created and stored", () => {
    assert.entityCount("PhotoSubmitted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "PhotoSubmitted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "questId",
      "234"
    )
    assert.fieldEquals(
      "PhotoSubmitted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "photographer",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "PhotoSubmitted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "watermarkedPhotoIPFS",
      "Example string value"
    )
    assert.fieldEquals(
      "PhotoSubmitted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "submissionIndex",
      "234"
    )
    assert.fieldEquals(
      "PhotoSubmitted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "timestamp",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
