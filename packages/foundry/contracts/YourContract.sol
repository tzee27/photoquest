//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

/**
 * @title PhotoQuest Marketplace
 * @dev A decentralized marketplace for photo requests and submissions
 * @author PhotoQuest Team
 */
contract YourContract {
    // State Variables
    address public immutable owner;
    uint256 public questCounter = 0;
    uint256 public platformFeePercentage = 250; // 2.5% (250 basis points)
    
    // Enums
    enum QuestStatus { Open, Accepted, Submitted, Approved, Completed, Cancelled }
    enum Category { Portrait, Landscape, Street, Wildlife, Architecture, Event, Product, Other }
    
    // Structs
    struct Quest {
        uint256 id;
        address requester;
        address photographer;
        string title;
        string description;
        Category category;
        uint256 reward;
        uint256 deadline;
        QuestStatus status;
        string watermarkedPhotoIPFS; // IPFS hash for watermarked photo
        string originalPhotoIPFS; // IPFS hash for original photo (encrypted until approved)
        uint256 createdAt;
        uint256 submittedAt;
        uint256 approvedAt;
    }
    
    // Mappings
    mapping(uint256 => Quest) public quests;
    mapping(address => uint256[]) public userQuests; // Quests created by user
    mapping(address => uint256[]) public photographerQuests; // Quests accepted by photographer
    mapping(uint256 => bool) public questExists;
    
    // Events
    event QuestCreated(
        uint256 indexed questId,
        address indexed requester,
        string title,
        Category category,
        uint256 reward,
        uint256 deadline
    );
    
    event QuestAccepted(
        uint256 indexed questId,
        address indexed photographer,
        uint256 timestamp
    );
    
    event PhotoSubmitted(
        uint256 indexed questId,
        address indexed photographer,
        string watermarkedPhotoIPFS,
        uint256 timestamp
    );
    
    event QuestApproved(
        uint256 indexed questId,
        address indexed requester,
        string originalPhotoIPFS,
        uint256 timestamp
    );
    
    event QuestCompleted(
        uint256 indexed questId,
        address indexed photographer,
        uint256 reward,
        uint256 platformFee
    );
    
    event QuestCancelled(
        uint256 indexed questId,
        address indexed requester,
        uint256 refundAmount
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }
    
    modifier questNotExists(uint256 _questId) {
        require(!questExists[_questId], "Quest already exists");
        _;
    }
    
    modifier questExistsAndValid(uint256 _questId) {
        require(questExists[_questId], "Quest does not exist");
        _;
    }
    
    modifier onlyRequester(uint256 _questId) {
        require(quests[_questId].requester == msg.sender, "Not the quest requester");
        _;
    }
    
    modifier onlyPhotographer(uint256 _questId) {
        require(quests[_questId].photographer == msg.sender, "Not the assigned photographer");
        _;
    }
    
    modifier questInStatus(uint256 _questId, QuestStatus _status) {
        require(quests[_questId].status == _status, "Quest not in required status");
        _;
    }
    
    modifier deadlineNotPassed(uint256 _questId) {
        require(block.timestamp <= quests[_questId].deadline, "Quest deadline has passed");
        _;
    }
    
    // Constructor
    constructor(address _owner) {
        owner = _owner;
    }

    /**
     * @dev Creates a new photo quest
     * @param _title Title of the quest
     * @param _description Detailed description of required photo
     * @param _category Category of the photo
     * @param _deadline Deadline for photo submission (timestamp)
     */
    function createQuest(
        string memory _title,
        string memory _description,
        Category _category,
        uint256 _deadline
    ) external payable {
        require(msg.value > 0, "Reward must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        questCounter++;
        uint256 questId = questCounter;
        
        quests[questId] = Quest({
            id: questId,
            requester: msg.sender,
            photographer: address(0),
            title: _title,
            description: _description,
            category: _category,
            reward: msg.value,
            deadline: _deadline,
            status: QuestStatus.Open,
            watermarkedPhotoIPFS: "",
            originalPhotoIPFS: "",
            createdAt: block.timestamp,
            submittedAt: 0,
            approvedAt: 0
        });
        
        questExists[questId] = true;
        userQuests[msg.sender].push(questId);
        
        emit QuestCreated(questId, msg.sender, _title, _category, msg.value, _deadline);
    }
    
    /**
     * @dev Allows a photographer to accept a quest
     * @param _questId ID of the quest to accept
     */
    function acceptQuest(uint256 _questId) 
        external 
        questExistsAndValid(_questId)
        questInStatus(_questId, QuestStatus.Open)
        deadlineNotPassed(_questId)
    {
        require(msg.sender != quests[_questId].requester, "Requester cannot accept own quest");
        
        quests[_questId].photographer = msg.sender;
        quests[_questId].status = QuestStatus.Accepted;
        photographerQuests[msg.sender].push(_questId);
        
        emit QuestAccepted(_questId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Allows photographer to submit a photo for the quest
     * @param _questId ID of the quest
     * @param _watermarkedPhotoIPFS IPFS hash of the watermarked photo
     * @param _originalPhotoIPFS IPFS hash of the original photo (encrypted)
     */
    function submitPhoto(
        uint256 _questId,
        string memory _watermarkedPhotoIPFS,
        string memory _originalPhotoIPFS
    ) 
        external 
        questExistsAndValid(_questId)
        onlyPhotographer(_questId)
        questInStatus(_questId, QuestStatus.Accepted)
        deadlineNotPassed(_questId)
    {
        require(bytes(_watermarkedPhotoIPFS).length > 0, "Watermarked photo IPFS hash required");
        require(bytes(_originalPhotoIPFS).length > 0, "Original photo IPFS hash required");
        
        quests[_questId].watermarkedPhotoIPFS = _watermarkedPhotoIPFS;
        quests[_questId].originalPhotoIPFS = _originalPhotoIPFS;
        quests[_questId].status = QuestStatus.Submitted;
        quests[_questId].submittedAt = block.timestamp;
        
        emit PhotoSubmitted(_questId, msg.sender, _watermarkedPhotoIPFS, block.timestamp);
    }
    
    /**
     * @dev Allows requester to approve the submitted photo and complete payment
     * @param _questId ID of the quest to approve
     */
    function approveQuest(uint256 _questId) 
        external 
        questExistsAndValid(_questId)
        onlyRequester(_questId)
        questInStatus(_questId, QuestStatus.Submitted)
    {
        Quest storage quest = quests[_questId];
        quest.status = QuestStatus.Approved;
        quest.approvedAt = block.timestamp;
        
        // Calculate platform fee
        uint256 platformFee = (quest.reward * platformFeePercentage) / 10000;
        uint256 photographerPayment = quest.reward - platformFee;
        
        // Transfer payment to photographer
        (bool photographerSuccess,) = quest.photographer.call{value: photographerPayment}("");
        require(photographerSuccess, "Payment to photographer failed");
        
        // Transfer platform fee to owner
        if (platformFee > 0) {
            (bool ownerSuccess,) = owner.call{value: platformFee}("");
            require(ownerSuccess, "Platform fee transfer failed");
        }
        
        quest.status = QuestStatus.Completed;
        
        emit QuestApproved(_questId, msg.sender, quest.originalPhotoIPFS, block.timestamp);
        emit QuestCompleted(_questId, quest.photographer, photographerPayment, platformFee);
    }
    
    /**
     * @dev Allows requester to cancel an open quest and get refund
     * @param _questId ID of the quest to cancel
     */
    function cancelQuest(uint256 _questId) 
        external 
        questExistsAndValid(_questId)
        onlyRequester(_questId)
    {
        require(
            quests[_questId].status == QuestStatus.Open || 
            quests[_questId].status == QuestStatus.Accepted,
            "Cannot cancel quest in current status"
        );
        
        Quest storage quest = quests[_questId];
        quest.status = QuestStatus.Cancelled;
        
        uint256 refundAmount = quest.reward;
        quest.reward = 0;
        
        // Refund the requester
        (bool success,) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit QuestCancelled(_questId, msg.sender, refundAmount);
    }
    
    /**
     * @dev Allows photographer to withdraw from accepted quest if deadline passed without submission
     * @param _questId ID of the quest
     */
    function withdrawFromQuest(uint256 _questId) 
        external 
        questExistsAndValid(_questId)
        onlyPhotographer(_questId)
        questInStatus(_questId, QuestStatus.Accepted)
    {
        require(block.timestamp > quests[_questId].deadline, "Deadline has not passed");
        
        quests[_questId].photographer = address(0);
        quests[_questId].status = QuestStatus.Open;
    }
    
    /**
     * @dev Updates the platform fee percentage (only owner)
     * @param _newFeePercentage New fee percentage in basis points (e.g., 250 = 2.5%)
     */
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = _newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, _newFeePercentage);
    }
    
    // View Functions
    
    /**
     * @dev Get quest details
     * @param _questId ID of the quest
     */
    function getQuest(uint256 _questId) 
        external 
        view 
        questExistsAndValid(_questId) 
        returns (Quest memory) 
    {
        return quests[_questId];
    }
    
    /**
     * @dev Get all open quests
     */
    function getOpenQuests() external view returns (uint256[] memory) {
        uint256[] memory openQuests = new uint256[](questCounter);
        uint256 openCount = 0;
        
        for (uint256 i = 1; i <= questCounter; i++) {
            if (questExists[i] && quests[i].status == QuestStatus.Open) {
                openQuests[openCount] = i;
                openCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](openCount);
        for (uint256 i = 0; i < openCount; i++) {
            result[i] = openQuests[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get quests created by a user
     * @param _user Address of the user
     */
    function getUserQuests(address _user) external view returns (uint256[] memory) {
        return userQuests[_user];
    }
    
    /**
     * @dev Get quests accepted by a photographer
     * @param _photographer Address of the photographer
     */
    function getPhotographerQuests(address _photographer) external view returns (uint256[] memory) {
        return photographerQuests[_photographer];
    }
    
    /**
     * @dev Emergency withdraw function for owner
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
    
    /**
     * @dev Function that allows the contract to receive ETH
     */
    receive() external payable {}
}