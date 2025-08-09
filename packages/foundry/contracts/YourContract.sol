//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

interface IPhotoQuestNFT {
    function mintPhotoNFT(
        uint256 questId,
        address photographer,
        address owner,
        string memory title,
        string memory description,
        uint8 category,
        string memory watermarkedImageIPFS,
        string memory originalImageIPFS,
        uint256 submittedAt,
        uint256 royaltyFee
    ) external returns (uint256);
}

/**
 * @title PhotoQuest Marketplace - Multi-Photographer Edition with NFT Integration
 * @dev A decentralized marketplace for photo requests with competitive submissions and NFT minting
 * @author PhotoQuest Team
 */
contract YourContract {
    // State Variables
    address public immutable owner;
    uint256 public questCounter = 0;
    uint256 public platformFeePercentage = 300; // 2.5% (250 basis points)
    IPhotoQuestNFT public photoQuestNFT; // NFT contract interface
    uint256 public defaultRoyaltyFee = 500; // 5% default royalty for photographers
    
    // Enums
    enum QuestStatus { Open, HasSubmissions, Completed, Cancelled }
    enum Category { Portrait, Landscape, Street, Wildlife, Architecture, Event, Product, Other }
    
    // Structs
    struct Submission {
        address photographer;
        string watermarkedPhotoIPFS;
        string originalPhotoIPFS;
        uint256 submittedAt;
        bool isSelected;
        bool isPaid;
        uint256 nftTokenId; // Associated NFT token ID (0 if no NFT minted)
    }
    
    struct Quest {
        uint256 id;
        address requester;
        string title;
        string description;
        Category category;
        uint256 reward;
        uint256 deadline;
        QuestStatus status;
        uint256 maxSubmissions;
        uint256 submissionCount;
        uint256 selectedCount;
        uint256 createdAt;
        uint256 completedAt;
        bool enableNFT; // Whether to mint NFTs for selected submissions
    }
    
    // Mappings
    mapping(uint256 => Quest) public quests;
    mapping(uint256 => Submission[]) public questSubmissions; // Quest ID => Submissions array
    mapping(uint256 => mapping(address => bool)) public hasSubmitted; // Quest ID => Photographer => Has submitted
    mapping(uint256 => mapping(address => uint256)) public photographerSubmissionIndex; // Quest ID => Photographer => Submission index
    mapping(address => uint256[]) public userQuests; // Quests created by user
    mapping(address => uint256[]) public photographerQuests; // Quests with submissions by photographer
    mapping(uint256 => bool) public questExists;
    mapping(uint256 => uint256[]) public questNFTs; // Quest ID => NFT Token IDs minted for this quest
    
    // Events
    event QuestCreated(
        uint256 indexed questId,
        address indexed requester,
        string title,
        Category category,
        uint256 reward,
        uint256 deadline,
        uint256 maxSubmissions,
        bool enableNFT
    );
    
    event PhotoSubmitted(
        uint256 indexed questId,
        address indexed photographer,
        string watermarkedPhotoIPFS,
        uint256 submissionIndex,
        uint256 timestamp
    );
    
    event SubmissionsSelected(
        uint256 indexed questId,
        address indexed requester,
        address[] selectedPhotographers,
        uint256 rewardPerWinner,
        uint256 timestamp
    );
    
    event QuestCompleted(
        uint256 indexed questId,
        address indexed requester,
        uint256 totalSelectedSubmissions,
        uint256 totalRewardDistributed,
        uint256 platformFee
    );
    
    event NFTMinted(
        uint256 indexed questId,
        uint256 indexed submissionIndex,
        uint256 indexed nftTokenId,
        address photographer,
        address owner
    );
    
    event QuestCancelled(
        uint256 indexed questId,
        address indexed requester,
        uint256 refundAmount
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event NFTContractUpdated(address oldContract, address newContract);
    event RoyaltyFeeUpdated(uint256 oldFee, uint256 newFee);
    
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
    
    modifier questInStatus(uint256 _questId, QuestStatus _status) {
        require(quests[_questId].status == _status, "Quest not in required status");
        _;
    }
    
    modifier deadlineNotPassed(uint256 _questId) {
        require(block.timestamp <= quests[_questId].deadline, "Quest deadline has passed");
        _;
    }
    
    modifier hasNotSubmitted(uint256 _questId) {
        require(!hasSubmitted[_questId][msg.sender], "Already submitted to this quest");
        _;
    }
    
    // Constructor
    constructor(address _owner) {
        owner = _owner;
    }

    /**
     * @dev Creates a new photo quest with multiple submission support
     * @param _title Title of the quest
     * @param _description Detailed description of required photo
     * @param _category Category of the photo
     * @param _deadline Deadline for photo submission (timestamp)
     * @param _maxSubmissions Maximum number of submissions allowed (default 10)
     * @param _enableNFT Whether to enable NFT minting for this quest
     */
    function createQuest(
        string memory _title,
        string memory _description,
        Category _category,
        uint256 _deadline,
        uint256 _maxSubmissions,
        bool _enableNFT
    ) external payable {
        require(msg.value > 0, "Reward must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_maxSubmissions > 0 && _maxSubmissions <= 50, "Max submissions must be between 1 and 50");
        
        questCounter++;
        uint256 questId = questCounter;
        
        quests[questId] = Quest({
            id: questId,
            requester: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            reward: msg.value,
            deadline: _deadline,
            status: QuestStatus.Open,
            maxSubmissions: _maxSubmissions,
            submissionCount: 0,
            selectedCount: 0,
            createdAt: block.timestamp,
            completedAt: 0,
            enableNFT: _enableNFT
        });
        
        questExists[questId] = true;
        userQuests[msg.sender].push(questId);
        
        emit QuestCreated(questId, msg.sender, _title, _category, msg.value, _deadline, _maxSubmissions, _enableNFT);
    }
    
    /**
     * @dev Allows a photographer to submit a photo for the quest
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
        deadlineNotPassed(_questId)
        hasNotSubmitted(_questId)
    {
        Quest storage quest = quests[_questId];
        require(quest.status == QuestStatus.Open || quest.status == QuestStatus.HasSubmissions, "Quest not accepting submissions");
        require(quest.submissionCount < quest.maxSubmissions, "Maximum submissions reached");
        require(msg.sender != quest.requester, "Requester cannot submit to own quest");
        require(bytes(_watermarkedPhotoIPFS).length > 0, "Watermarked photo IPFS hash required");
        require(bytes(_originalPhotoIPFS).length > 0, "Original photo IPFS hash required");
        
        // Create new submission
        Submission memory newSubmission = Submission({
            photographer: msg.sender,
            watermarkedPhotoIPFS: _watermarkedPhotoIPFS,
            originalPhotoIPFS: _originalPhotoIPFS,
            submittedAt: block.timestamp,
            isSelected: false,
            isPaid: false,
            nftTokenId: 0 // No NFT minted yet
        });
        
        // Add submission to quest
        questSubmissions[_questId].push(newSubmission);
        uint256 submissionIndex = questSubmissions[_questId].length - 1;
        
        // Update mappings
        hasSubmitted[_questId][msg.sender] = true;
        photographerSubmissionIndex[_questId][msg.sender] = submissionIndex;
        photographerQuests[msg.sender].push(_questId);
        
        // Update quest
        quest.submissionCount++;
        if (quest.status == QuestStatus.Open) {
            quest.status = QuestStatus.HasSubmissions;
        }
        
        emit PhotoSubmitted(_questId, msg.sender, _watermarkedPhotoIPFS, submissionIndex, block.timestamp);
    }
    
    /**
     * @dev Allows requester to select winning submissions and distribute rewards
     * @param _questId ID of the quest
     * @param _selectedSubmissionIndices Array of submission indices to select as winners
     */
    function selectSubmissions(
        uint256 _questId,
        uint256[] memory _selectedSubmissionIndices
    ) 
        external 
        questExistsAndValid(_questId)
        onlyRequester(_questId)
        questInStatus(_questId, QuestStatus.HasSubmissions)
    {
        Quest storage quest = quests[_questId];
        require(_selectedSubmissionIndices.length > 0, "Must select at least one submission");
        require(_selectedSubmissionIndices.length <= quest.submissionCount, "Cannot select more submissions than available");
        
        // Validate and mark selected submissions
        address[] memory selectedPhotographers = new address[](_selectedSubmissionIndices.length);
        
        for (uint256 i = 0; i < _selectedSubmissionIndices.length; i++) {
            uint256 index = _selectedSubmissionIndices[i];
            require(index < questSubmissions[_questId].length, "Invalid submission index");
            require(!questSubmissions[_questId][index].isSelected, "Submission already selected");
            
            questSubmissions[_questId][index].isSelected = true;
            selectedPhotographers[i] = questSubmissions[_questId][index].photographer;
        }
        
        // Calculate rewards
        uint256 totalReward = quest.reward;
        uint256 platformFee = (totalReward * platformFeePercentage) / 10000;
        uint256 rewardPool = totalReward - platformFee;
        uint256 rewardPerWinner = rewardPool / _selectedSubmissionIndices.length;
        
        // Distribute rewards to selected photographers
        for (uint256 i = 0; i < _selectedSubmissionIndices.length; i++) {
            uint256 index = _selectedSubmissionIndices[i];
            address photographer = questSubmissions[_questId][index].photographer;
            
            questSubmissions[_questId][index].isPaid = true;
            
            (bool success,) = photographer.call{value: rewardPerWinner}("");
            require(success, "Payment to photographer failed");
        }
        
        // Transfer platform fee to owner
        if (platformFee > 0) {
            (bool ownerSuccess,) = owner.call{value: platformFee}("");
            require(ownerSuccess, "Platform fee transfer failed");
        }
        
        // Mint NFTs for selected submissions
        if (quest.enableNFT) {
            for (uint256 i = 0; i < _selectedSubmissionIndices.length; i++) {
                uint256 index = _selectedSubmissionIndices[i];
                address photographer = questSubmissions[_questId][index].photographer;
                uint256 submissionIndex = _selectedSubmissionIndices[i]; // Use the original index
                
                uint256 nftTokenId = photoQuestNFT.mintPhotoNFT(
                    _questId,
                    photographer,
                    quest.requester, // Owner is the requester
                    quest.title,
                    quest.description,
                    uint8(quest.category),
                    questSubmissions[_questId][index].watermarkedPhotoIPFS,
                    questSubmissions[_questId][index].originalPhotoIPFS,
                    questSubmissions[_questId][index].submittedAt,
                    defaultRoyaltyFee // Use default royalty fee
                );
                
                questSubmissions[_questId][index].nftTokenId = nftTokenId;
                questNFTs[_questId].push(nftTokenId);
                
                emit NFTMinted(_questId, submissionIndex, nftTokenId, photographer, quest.requester);
            }
        }
        
        // Update quest status
        quest.status = QuestStatus.Completed;
        quest.selectedCount = _selectedSubmissionIndices.length;
        quest.completedAt = block.timestamp;
        
        emit SubmissionsSelected(_questId, msg.sender, selectedPhotographers, rewardPerWinner, block.timestamp);
        emit QuestCompleted(_questId, msg.sender, _selectedSubmissionIndices.length, rewardPool, platformFee);
    }
    
    /**
     * @dev Allows requester to cancel a quest and get refund
     * @param _questId ID of the quest to cancel
     */
    function cancelQuest(uint256 _questId) 
        external 
        questExistsAndValid(_questId)
        onlyRequester(_questId)
    {
        Quest storage quest = quests[_questId];
        require(quest.status != QuestStatus.Completed, "Cannot cancel completed quest");
        require(quest.status != QuestStatus.Cancelled, "Quest already cancelled");
        
        quest.status = QuestStatus.Cancelled;
        
        uint256 refundAmount = quest.reward;
        quest.reward = 0;
        
        // Refund the requester
        (bool success,) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit QuestCancelled(_questId, msg.sender, refundAmount);
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

    /**
     * @dev Updates the NFT contract address (only owner)
     * @param _newNFTContract New NFT contract address
     */
    function updateNFTContract(address _newNFTContract) external onlyOwner {
        address oldContract = address(photoQuestNFT);
        photoQuestNFT = IPhotoQuestNFT(_newNFTContract);
        emit NFTContractUpdated(oldContract, _newNFTContract);
    }

    /**
     * @dev Updates the default royalty fee (only owner)
     * @param _newRoyaltyFee New royalty fee in basis points (e.g., 500 = 5%)
     */
    function updateRoyaltyFee(uint256 _newRoyaltyFee) external onlyOwner {
        require(_newRoyaltyFee <= 1000, "Royalty fee cannot exceed 10%"); // Max 10%
        uint256 oldFee = defaultRoyaltyFee;
        defaultRoyaltyFee = _newRoyaltyFee;
        emit RoyaltyFeeUpdated(oldFee, _newRoyaltyFee);
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
     * @dev Get all submissions for a quest
     * @param _questId ID of the quest
     */
    function getQuestSubmissions(uint256 _questId) 
        external 
        view 
        questExistsAndValid(_questId) 
        returns (Submission[] memory) 
    {
        return questSubmissions[_questId];
    }
    
    /**
     * @dev Get selected submissions for a quest
     * @param _questId ID of the quest
     */
    function getSelectedSubmissions(uint256 _questId) 
        external 
        view 
        questExistsAndValid(_questId) 
        returns (Submission[] memory) 
    {
        Submission[] memory allSubmissions = questSubmissions[_questId];
        
        // Count selected submissions
        uint256 selectedCount = 0;
        for (uint256 i = 0; i < allSubmissions.length; i++) {
            if (allSubmissions[i].isSelected) {
                selectedCount++;
            }
        }
        
        // Create array of selected submissions
        Submission[] memory selectedSubmissions = new Submission[](selectedCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allSubmissions.length; i++) {
            if (allSubmissions[i].isSelected) {
                selectedSubmissions[index] = allSubmissions[i];
                index++;
            }
        }
        
        return selectedSubmissions;
    }

    /**
     * @dev Get all NFT token IDs minted for a quest
     * @param _questId ID of the quest
     */
    function getQuestNFTs(uint256 _questId) external view questExistsAndValid(_questId) returns (uint256[] memory) {
        return questNFTs[_questId];
    }
    
    /**
     * @dev Get all open quests
     */
    function getOpenQuests() external view returns (uint256[] memory) {
        uint256[] memory openQuests = new uint256[](questCounter);
        uint256 openCount = 0;
        
        for (uint256 i = 1; i <= questCounter; i++) {
            if (questExists[i] && (quests[i].status == QuestStatus.Open || quests[i].status == QuestStatus.HasSubmissions)) {
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
     * @dev Get quests with submissions by a photographer
     * @param _photographer Address of the photographer
     */
    function getPhotographerQuests(address _photographer) external view returns (uint256[] memory) {
        return photographerQuests[_photographer];
    }
    
    /**
     * @dev Check if photographer has submitted to a quest
     * @param _questId ID of the quest
     * @param _photographer Address of the photographer
     */
    function hasPhotographerSubmitted(uint256 _questId, address _photographer) external view returns (bool) {
        return hasSubmitted[_questId][_photographer];
    }
    
    /**
     * @dev Get photographer's submission for a quest
     * @param _questId ID of the quest
     * @param _photographer Address of the photographer
     */
    function getPhotographerSubmission(uint256 _questId, address _photographer) 
        external 
        view 
        returns (Submission memory) 
    {
        require(hasSubmitted[_questId][_photographer], "Photographer has not submitted to this quest");
        uint256 index = photographerSubmissionIndex[_questId][_photographer];
        return questSubmissions[_questId][index];
    }

    /**
     * @dev Get NFT details for a specific submission
     * @param _questId ID of the quest
     * @param _submissionIndex Index of the submission within the quest
     */
    function getSubmissionNFT(uint256 _questId, uint256 _submissionIndex)
        external
        view
        questExistsAndValid(_questId)
        returns (uint256 nftTokenId, address photographer, address owner, string memory title, string memory description, uint8 category, string memory watermarkedImageIPFS, string memory originalImageIPFS, uint256 submittedAt, uint256 royaltyFee)
    {
        require(_submissionIndex < questSubmissions[_questId].length, "Invalid submission index");
        Submission memory submission = questSubmissions[_questId][_submissionIndex];
        Quest memory questData = quests[_questId];
        
        nftTokenId = submission.nftTokenId;
        photographer = submission.photographer;
        owner = questData.requester; // The quest requester is the NFT owner
        title = questData.title;
        description = questData.description;
        category = uint8(questData.category);
        watermarkedImageIPFS = submission.watermarkedPhotoIPFS;
        originalImageIPFS = submission.originalPhotoIPFS;
        submittedAt = submission.submittedAt;
        royaltyFee = defaultRoyaltyFee;
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