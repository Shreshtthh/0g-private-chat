// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PrivateChat {
    struct ChatRecord {
        bytes32 contentHash;
        bytes32 merkleRoot;
        uint256 timestamp;
        string  model;
    }

    mapping(address => ChatRecord[]) public userChats;
    mapping(address => bool) public registeredUsers;
    uint256 public totalChats;
    uint256 public totalUsers;

    event UserRegistered(address indexed user, uint256 timestamp);
    event ChatSaved(address indexed user, bytes32 contentHash, bytes32 merkleRoot, string model, uint256 timestamp);

    function registerUser() external {
        require(!registeredUsers[msg.sender], "Already registered");
        registeredUsers[msg.sender] = true;
        totalUsers++;
        emit UserRegistered(msg.sender, block.timestamp);
    }

    function isRegistered(address user) external view returns (bool) { return registeredUsers[user]; }

    function saveChat(bytes32 contentHash, bytes32 merkleRoot, string calldata model) external {
        require(registeredUsers[msg.sender], "Not registered");
        userChats[msg.sender].push(ChatRecord(contentHash, merkleRoot, block.timestamp, model));
        totalChats++;
        emit ChatSaved(msg.sender, contentHash, merkleRoot, model, block.timestamp);
    }

    function getUserChatCount(address user) external view returns (uint256) { return userChats[user].length; }
    function getUserChat(address user, uint256 index) external view returns (ChatRecord memory) { return userChats[user][index]; }
    function getStats() external view returns (uint256 users, uint256 chats) { return (totalUsers, totalChats); }
}
