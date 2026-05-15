/**
 * PrivateChat.sol ABI — only the functions we call from the frontend.
 * Generated from contracts/PrivateChat.sol
 */
export const PRIVATE_CHAT_ABI = [
  {
    inputs: [],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "isRegistered",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "contentHash", type: "bytes32" },
      { name: "merkleRoot", type: "bytes32" },
      { name: "model", type: "string" },
    ],
    name: "saveChat",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserChatCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "index", type: "uint256" },
    ],
    name: "getUserChat",
    outputs: [
      {
        components: [
          { name: "contentHash", type: "bytes32" },
          { name: "merkleRoot", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "model", type: "string" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStats",
    outputs: [
      { name: "users", type: "uint256" },
      { name: "chats", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "contentHash", type: "bytes32" },
      { indexed: false, name: "merkleRoot", type: "bytes32" },
      { indexed: false, name: "model", type: "string" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "ChatSaved",
    type: "event",
  },
] as const;
