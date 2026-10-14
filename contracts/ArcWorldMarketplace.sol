// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ArcWorldMarketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    IERC20 public immutable usdc;
    IERC721 public immutable itemContract;

    uint256 public feeBasisPoints = 250;
    address public feeRecipient;

    uint256 private _nextListingId = 1;
    mapping(uint256 listingId => Listing) private _listings;

    event ItemListed(uint256 indexed listingId, address indexed seller, uint256 indexed tokenId, uint256 price);
    event ItemSold(uint256 indexed listingId, address indexed buyer, uint256 indexed tokenId, uint256 price, uint256 fee);
    event ListingCancelled(uint256 indexed listingId);

    constructor(address usdcToken, address itemContractAddress) Ownable(msg.sender) {
        require(usdcToken != address(0), "ArcWorldMarketplace: zero USDC");
        require(itemContractAddress != address(0), "ArcWorldMarketplace: zero item contract");

        usdc = IERC20(usdcToken);
        itemContract = IERC721(itemContractAddress);
        feeRecipient = msg.sender;
    }

    function listItem(uint256 tokenId, uint256 priceUsdc) external {
        require(priceUsdc > 0, "ArcWorldMarketplace: invalid price");
        require(itemContract.ownerOf(tokenId) == msg.sender, "ArcWorldMarketplace: not token owner");
        require(
            itemContract.getApproved(tokenId) == address(this) || itemContract.isApprovedForAll(msg.sender, address(this)),
            "ArcWorldMarketplace: marketplace not approved"
        );

        uint256 listingId = _nextListingId;
        _nextListingId++;

        _listings[listingId] = Listing({seller: msg.sender, tokenId: tokenId, price: priceUsdc, active: true});

        emit ItemListed(listingId, msg.sender, tokenId, priceUsdc);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "ArcWorldMarketplace: inactive listing");
        require(listing.seller == msg.sender, "ArcWorldMarketplace: not seller");

        listing.active = false;

        emit ListingCancelled(listingId);
    }

    function buyItem(uint256 listingId) external nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "ArcWorldMarketplace: inactive listing");

        listing.active = false;

        uint256 fee = (listing.price * feeBasisPoints) / 10_000;
        uint256 sellerAmount = listing.price - fee;

        itemContract.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        usdc.safeTransferFrom(msg.sender, address(this), listing.price);
        if (fee > 0) {
            usdc.safeTransfer(feeRecipient, fee);
        }
        usdc.safeTransfer(listing.seller, sellerAmount);

        emit ItemSold(listingId, msg.sender, listing.tokenId, listing.price, fee);
    }

    function getActiveListings() external view returns (uint256[] memory listingIds) {
        uint256 totalListings = _nextListingId - 1;
        uint256 activeCount;

        for (uint256 i = 1; i <= totalListings; i++) {
            if (_listings[i].active) {
                activeCount++;
            }
        }

        listingIds = new uint256[](activeCount);
        uint256 index;

        for (uint256 i = 1; i <= totalListings; i++) {
            if (_listings[i].active) {
                listingIds[index] = i;
                index++;
            }
        }
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return _listings[listingId];
    }

    function setFee(uint256 basisPoints) external onlyOwner {
        require(basisPoints <= 1000, "ArcWorldMarketplace: fee too high");
        feeBasisPoints = basisPoints;
    }

    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "ArcWorldMarketplace: zero fee recipient");
        feeRecipient = newFeeRecipient;
    }
}
