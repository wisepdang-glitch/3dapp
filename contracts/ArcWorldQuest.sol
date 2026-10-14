// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ArcWorldQuest is Ownable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    struct Quest {
        string title;
        string description;
        uint256 rewardUsdc;
        bool active;
        uint256 totalRewards;
        uint256 claimedCount;
    }

    IERC20 public immutable usdc;

    bytes32 public constant COMPLETION_TYPEHASH =
        keccak256("QuestCompletion(uint256 questId,address player,uint256 expiry)");

    uint256 private _nextQuestId = 1;

    mapping(uint256 questId => Quest) private _quests;
    mapping(uint256 questId => uint256) private _maxPlayers;
    mapping(uint256 questId => mapping(address player => bool)) private _hasClaimed;

    event QuestCreated(uint256 indexed questId, string title, uint256 rewardUsdc, uint256 maxPlayers);
    event QuestCompleted(uint256 indexed questId, address indexed player, uint256 rewardUsdc);
    event QuestDeactivated(uint256 indexed questId);

    constructor(address usdcToken) Ownable(msg.sender) EIP712("ArcWorldQuest", "1") {
        require(usdcToken != address(0), "ArcWorldQuest: zero USDC");
        usdc = IERC20(usdcToken);
    }

    function createQuest(
        string calldata title,
        string calldata description,
        uint256 rewardUsdc,
        uint256 maxPlayers
    ) external onlyOwner nonReentrant {
        require(bytes(title).length > 0, "ArcWorldQuest: empty title");
        require(rewardUsdc > 0, "ArcWorldQuest: zero reward");
        require(maxPlayers > 0, "ArcWorldQuest: zero max players");

        uint256 totalRewards = rewardUsdc * maxPlayers;

        uint256 questId = _nextQuestId;
        _nextQuestId++;

        _quests[questId] = Quest({
            title: title,
            description: description,
            rewardUsdc: rewardUsdc,
            active: true,
            totalRewards: totalRewards,
            claimedCount: 0
        });
        _maxPlayers[questId] = maxPlayers;

        usdc.safeTransferFrom(msg.sender, address(this), totalRewards);

        emit QuestCreated(questId, title, rewardUsdc, maxPlayers);
    }

    function completeAndClaim(uint256 questId, uint256 expiry, bytes calldata signature) external nonReentrant {
        require(block.timestamp <= expiry, "Signature expired");

        bytes32 structHash = keccak256(abi.encode(COMPLETION_TYPEHASH, questId, msg.sender, expiry));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == owner(), "Invalid completion signature");

        Quest storage quest = _quests[questId];
        require(quest.active, "ArcWorldQuest: inactive quest");
        require(!_hasClaimed[questId][msg.sender], "ArcWorldQuest: already claimed");
        require(quest.claimedCount < _maxPlayers[questId], "ArcWorldQuest: max claims reached");

        _hasClaimed[questId][msg.sender] = true;
        quest.claimedCount += 1;

        usdc.safeTransfer(msg.sender, quest.rewardUsdc);

        if (quest.claimedCount == _maxPlayers[questId]) {
            quest.active = false;
        }

        emit QuestCompleted(questId, msg.sender, quest.rewardUsdc);
    }

    function deactivateQuest(uint256 questId) external onlyOwner nonReentrant {
        Quest storage quest = _quests[questId];
        require(quest.active, "ArcWorldQuest: already inactive");

        quest.active = false;

        uint256 remainingClaims = _maxPlayers[questId] - quest.claimedCount;
        uint256 remainingRewards = quest.rewardUsdc * remainingClaims;

        if (remainingRewards > 0) {
            usdc.safeTransfer(msg.sender, remainingRewards);
        }

        emit QuestDeactivated(questId);
    }

    function getQuest(uint256 questId)
        external
        view
        returns (
            Quest memory quest,
            uint256 maxPlayers,
            uint256 remainingRewards
        )
    {
        quest = _quests[questId];
        maxPlayers = _maxPlayers[questId];
        remainingRewards = quest.rewardUsdc * (maxPlayers - quest.claimedCount);
    }

    function getActiveQuests() external view returns (uint256[] memory questIds) {
        uint256 totalQuests = _nextQuestId - 1;
        uint256 activeCount;

        for (uint256 i = 1; i <= totalQuests; i++) {
            if (_quests[i].active) {
                activeCount++;
            }
        }

        questIds = new uint256[](activeCount);
        uint256 index;

        for (uint256 i = 1; i <= totalQuests; i++) {
            if (_quests[i].active) {
                questIds[index] = i;
                index++;
            }
        }
    }

    function hasClaimed(uint256 questId, address player) external view returns (bool) {
        return _hasClaimed[questId][player];
    }
}
