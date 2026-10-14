// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract ArcWorldItem is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;

    struct ItemAttributes {
        uint8 itemType;
        uint8 rarity;
        uint16 power;
        string name;
    }

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    uint256 private _nextTokenId = 1;

    mapping(uint256 tokenId => ItemAttributes) private _itemAttributes;
    mapping(address minter => bool) public minters;

    modifier onlyMinterOrOwner() {
        require(owner() == _msgSender() || minters[_msgSender()], "ArcWorldItem: caller is not minter or owner");
        _;
    }

    constructor() ERC721("Arc World Item", "AWI") Ownable(msg.sender) {}

    function mintItem(
        address to,
        uint8 itemType,
        uint8 rarity,
        uint16 power,
        string calldata name
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _mintWithAttributes(to, itemType, rarity, power, name);
    }

    function mintToPlayer(
        address to,
        uint8 itemType,
        uint8 rarity,
        uint16 power,
        string calldata name
    ) external onlyMinterOrOwner returns (uint256 tokenId) {
        tokenId = _mintWithAttributes(to, itemType, rarity, power, name);
    }

    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "ArcWorldItem: zero minter");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    function getItemAttributes(uint256 tokenId) external view returns (ItemAttributes memory) {
        _requireOwned(tokenId);
        return _itemAttributes[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        ItemAttributes memory attrs = _itemAttributes[tokenId];

        string memory json = string(
            abi.encodePacked(
                '{"name":"',
                attrs.name,
                '","description":"Arc World in-game item",',
                '"attributes":[',
                '{"trait_type":"Type","value":"',
                _itemTypeToString(attrs.itemType),
                '"},',
                '{"trait_type":"Rarity","value":"',
                _rarityToString(attrs.rarity),
                '"},',
                '{"trait_type":"Power","value":"',
                uint256(attrs.power).toString(),
                '"}',
                "]}"
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function _mintWithAttributes(
        address to,
        uint8 itemType,
        uint8 rarity,
        uint16 power,
        string calldata name
    ) internal returns (uint256 tokenId) {
        require(to != address(0), "ArcWorldItem: zero recipient");
        require(itemType <= 3, "ArcWorldItem: invalid item type");
        require(rarity <= 4, "ArcWorldItem: invalid rarity");

        tokenId = _nextTokenId;
        _nextTokenId++;

        _itemAttributes[tokenId] = ItemAttributes({itemType: itemType, rarity: rarity, power: power, name: name});
        _safeMint(to, tokenId);
    }

    function _itemTypeToString(uint8 itemType) internal pure returns (string memory) {
        if (itemType == 0) return "Weapon";
        if (itemType == 1) return "Armor";
        if (itemType == 2) return "Pet";
        if (itemType == 3) return "Skin";
        return "Unknown";
    }

    function _rarityToString(uint8 rarity) internal pure returns (string memory) {
        if (rarity == 0) return "Common";
        if (rarity == 1) return "Uncommon";
        if (rarity == 2) return "Rare";
        if (rarity == 3) return "Epic";
        if (rarity == 4) return "Legendary";
        return "Unknown";
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
