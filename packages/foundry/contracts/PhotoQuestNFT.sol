//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PhotoQuest NFT
 * @dev ERC721 NFT contract for photo assets with royalty support
 * @author PhotoQuest Team
 */
contract PhotoQuestNFT is ERC721, ERC721URIStorage, ERC721Royalty, Ownable, ReentrancyGuard {
    // State Variables
    uint256 private _currentTokenId = 0;
    address public photoQuestMarketplace;
    uint256 public constant MAX_ROYALTY_FEE = 1000; // 10% maximum royalty
    uint256 public platformFee = 250; // 2.5% platform fee for NFT trades
    
    // Enums
    enum PhotoCategory { Portrait, Landscape, Street, Wildlife, Architecture, Event, Product, Other }
    
    // Structs
    struct PhotoNFT {
        uint256 tokenId;
        uint256 questId;
        address photographer; // Original creator
        address currentOwner; // Current owner (can be different from creator)
        string title;
        string description;
        PhotoCategory category;
        string watermarkedImageIPFS;
        string originalImageIPFS; // Only accessible by owner
        uint256 createdAt;
        uint256 submittedAt;
        bool isOriginal; // True if this is the original submission NFT
        uint256 royaltyFee; // Royalty percentage in basis points (e.g., 500 = 5%)
    }
    
    // Mappings
    mapping(uint256 => PhotoNFT) public photoNFTs;
    mapping(uint256 => uint256) public questToNFT; // Quest ID => NFT Token ID
    mapping(address => uint256[]) public photographerNFTs; // Photographer => Token IDs
    mapping(address => uint256[]) public ownerNFTs; // Owner => Token IDs
    mapping(uint256 => bool) public nftExists;
    
    // Events
    event PhotoNFTMinted(
        uint256 indexed tokenId,
        uint256 indexed questId,
        address indexed photographer,
        address owner,
        string title,
        uint256 royaltyFee
    );
    
    event NFTTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 price
    );
    
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed buyer,
        uint256 royaltyAmount
    );
    
    event OriginalImageAccessed(
        uint256 indexed tokenId,
        address indexed owner,
        string originalImageIPFS
    );
    
    // Modifiers
    modifier onlyMarketplace() {
        require(msg.sender == photoQuestMarketplace, "Only marketplace can call this function");
        _;
    }
    
    modifier onlyNFTOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        _;
    }
    
    modifier nftExistsCheck(uint256 tokenId) {
        require(nftExists[tokenId], "NFT does not exist");
        _;
    }
    
    // Constructor
    constructor(
        string memory name,
        string memory symbol,
        address _photoQuestMarketplace
    ) ERC721(name, symbol) Ownable(msg.sender) {
        photoQuestMarketplace = _photoQuestMarketplace;
    }
    
    /**
     * @dev Mints a new Photo NFT when a submission is selected in a quest
     * @param questId The quest ID this photo was submitted for
     * @param photographer The original photographer/creator
     * @param owner The owner of the NFT (quest requester who purchased it)
     * @param title Title of the photo
     * @param description Description of the photo
     * @param category Photo category
     * @param watermarkedImageIPFS IPFS hash of watermarked image
     * @param originalImageIPFS IPFS hash of original image
     * @param submittedAt Timestamp when photo was submitted
     * @param royaltyFee Royalty fee in basis points (e.g., 500 = 5%)
     */
    function mintPhotoNFT(
        uint256 questId,
        address photographer,
        address owner,
        string memory title,
        string memory description,
        PhotoCategory category,
        string memory watermarkedImageIPFS,
        string memory originalImageIPFS,
        uint256 submittedAt,
        uint256 royaltyFee
    ) external onlyMarketplace returns (uint256) {
        require(photographer != address(0), "Invalid photographer address");
        require(owner != address(0), "Invalid owner address");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(watermarkedImageIPFS).length > 0, "Watermarked image IPFS required");
        require(bytes(originalImageIPFS).length > 0, "Original image IPFS required");
        require(royaltyFee <= MAX_ROYALTY_FEE, "Royalty fee too high");
        
        _currentTokenId++;
        uint256 tokenId = _currentTokenId;
        
        // Mint NFT to the owner (quest requester)
        _safeMint(owner, tokenId);
        
        // Set royalty info for the creator (photographer)
        _setTokenRoyalty(tokenId, photographer, uint96(royaltyFee));
        
        // Create metadata URI
        string memory tokenURI = createTokenURI(
            tokenId,
            title,
            description,
            watermarkedImageIPFS,
            category
        );
        _setTokenURI(tokenId, tokenURI);
        
        // Store NFT data
        photoNFTs[tokenId] = PhotoNFT({
            tokenId: tokenId,
            questId: questId,
            photographer: photographer,
            currentOwner: owner,
            title: title,
            description: description,
            category: category,
            watermarkedImageIPFS: watermarkedImageIPFS,
            originalImageIPFS: originalImageIPFS,
            createdAt: block.timestamp,
            submittedAt: submittedAt,
            isOriginal: true,
            royaltyFee: royaltyFee
        });
        
        // Update mappings
        nftExists[tokenId] = true;
        questToNFT[questId] = tokenId;
        photographerNFTs[photographer].push(tokenId);
        ownerNFTs[owner].push(tokenId);
        
        emit PhotoNFTMinted(tokenId, questId, photographer, owner, title, royaltyFee);
        
        return tokenId;
    }
    
    /**
     * @dev Creates metadata URI for the NFT
     */
    function createTokenURI(
        uint256 tokenId,
        string memory title,
        string memory description,
        string memory imageIPFS,
        PhotoCategory category
    ) internal pure returns (string memory) {
        // In a real implementation, you'd create proper JSON metadata
        // For now, we'll return a simple format
        return string(abi.encodePacked(
            "data:application/json;base64,",
            // You would base64 encode the JSON metadata here
            // For simplicity, returning the IPFS hash
            imageIPFS
        ));
    }
    
    /**
     * @dev Allows NFT owner to access the original image IPFS hash
     * @param tokenId The NFT token ID
     */
    function getOriginalImage(uint256 tokenId) 
        external 
        view 
        onlyNFTOwner(tokenId) 
        nftExistsCheck(tokenId) 
        returns (string memory) 
    {
        return photoNFTs[tokenId].originalImageIPFS;
    }
    
    /**
     * @dev Gets NFT details for a token ID
     */
    function getNFTDetails(uint256 tokenId) 
        external 
        view 
        nftExistsCheck(tokenId) 
        returns (PhotoNFT memory) 
    {
        return photoNFTs[tokenId];
    }
    
    /**
     * @dev Gets all NFTs owned by an address
     */
    function getNFTsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerNFTs[owner];
    }
    
    /**
     * @dev Gets all NFTs created by a photographer
     */
    function getNFTsByPhotographer(address photographer) external view returns (uint256[] memory) {
        return photographerNFTs[photographer];
    }
    
    /**
     * @dev Transfers NFT with royalty payment
     */
    function transferWithRoyalty(
        address from,
        address to,
        uint256 tokenId,
        uint256 salePrice
    ) external payable nonReentrant {
        require(ownerOf(tokenId) == from, "Not the owner");
        require(msg.value >= salePrice, "Insufficient payment");
        
        // Calculate royalty
        (address royaltyRecipient, uint256 royaltyAmount) = royaltyInfo(tokenId, salePrice);
        
        // Calculate platform fee
        uint256 platformFeeAmount = (salePrice * platformFee) / 10000;
        
        // Calculate seller amount
        uint256 sellerAmount = salePrice - royaltyAmount - platformFeeAmount;
        
        // Transfer NFT
        _transfer(from, to, tokenId);
        
        // Update ownership tracking
        photoNFTs[tokenId].currentOwner = to;
        _updateOwnershipArrays(from, to, tokenId);
        
        // Pay royalty to creator
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            payable(royaltyRecipient).transfer(royaltyAmount);
            emit RoyaltyPaid(tokenId, royaltyRecipient, to, royaltyAmount);
        }
        
        // Pay platform fee to owner
        if (platformFeeAmount > 0) {
            payable(owner()).transfer(platformFeeAmount);
        }
        
        // Pay seller
        if (sellerAmount > 0) {
            payable(from).transfer(sellerAmount);
        }
        
        // Refund excess payment
        if (msg.value > salePrice) {
            payable(msg.sender).transfer(msg.value - salePrice);
        }
        
        emit NFTTransferred(tokenId, from, to, salePrice);
    }
    
    /**
     * @dev Updates ownership arrays when NFT is transferred
     */
    function _updateOwnershipArrays(address from, address to, uint256 tokenId) internal {
        // Remove from previous owner's array
        uint256[] storage fromTokens = ownerNFTs[from];
        for (uint256 i = 0; i < fromTokens.length; i++) {
            if (fromTokens[i] == tokenId) {
                fromTokens[i] = fromTokens[fromTokens.length - 1];
                fromTokens.pop();
                break;
            }
        }
        
        // Add to new owner's array
        ownerNFTs[to].push(tokenId);
    }
    
    /**
     * @dev Set marketplace contract address (only owner)
     */
    function setMarketplaceContract(address _photoQuestMarketplace) external onlyOwner {
        photoQuestMarketplace = _photoQuestMarketplace;
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Platform fee too high"); // Max 10%
        platformFee = _platformFee;
    }
    
    /**
     * @dev Get total number of minted NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _currentTokenId;
    }
    
    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage, ERC721Royalty) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
} 