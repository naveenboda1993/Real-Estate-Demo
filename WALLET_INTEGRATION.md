# Wallet Integration Documentation

## Overview

This document describes the wallet connection and UI state management implementation for the Real Estate Investment Platform.

## 1. Wallet Connection

### Features Implemented

| Feature | Description |
|---------|-------------|
| Connect Wallet | Connect to MetaMask wallet |
| Disconnect Wallet | Disconnect and clear session |
| Network Detection | Detect network changes (Ethereum, Polygon, Sepolia) |
| Account Detection | Detect account changes |
| Auto-connect | Reconnect on page load if previously connected |

### Supported Networks

```javascript
const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH' },
  137: { name: 'Polygon', symbol: 'MATIC' },
  11155111: { name: 'Sepolia', symbol: 'ETH' },
};
```

## 2. WalletContext API

### State Values

| State | Type | Description |
|-------|------|-------------|
| `account` | string \| null | Connected wallet address |
| `chainId` | number \| null | Current network chain ID |
| `provider` | Web3Provider | Ethers provider instance |
| `signer` | Signer | Ethers signer instance |
| `isConnecting` | boolean | Connection in progress |
| `isConnected` | boolean | Wallet connected status |
| `currentChain` | object \| null | Current network info |
| `error` | string \| null | Error message |
| `txState` | object | Transaction state |

### Transaction State Object

```javascript
{
  status: 'idle' | 'pending' | 'confirming' | 'success' | 'rejected' | 'error',
  txHash: string | null,
  message: string
}
```

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `connect()` | none | Connect to MetaMask |
| `disconnect()` | none | Disconnect wallet |
| `switchNetwork(chainId)` | number | Switch to target network |
| `setTransactionState(state)` | object | Update tx state |
| `resetTransactionState()` | none | Reset tx state to idle |

## 3. UI Components

### Navbar

#### Connection States

| State | Display |
|-------|---------|
| Not Connected | "Connect Wallet" button |
| Connecting | "Connecting..." (disabled) |
| Connected | Address (0x1234...abcd) + Disconnect button |

#### Network Selector

- Shows current network name (e.g., "Ethereum", "Polygon", "Sepolia")
- Dropdown to switch networks
- Only visible when wallet is connected

### PropertyDetail - Investment Button

#### Transaction States

| Status | Icon | Message | Button Style |
|--------|------|---------|--------------|
| `idle` | Wallet icon | "Connect Wallet to Invest" / "Invest Now" | Primary |
| `pending` | Spinner | "Confirm in wallet..." | Disabled |
| `confirming` | Spinner | "Waiting for confirmation..." | Disabled |
| `success` | Checkmark | "Minted!" | Green |
| `rejected` | Alert | "Transaction rejected" | Default |
| `error` | Alert | "Error - Try again" | Default |

#### Additional UI Elements

- Transaction hash display (after submission)
- Connected account address display (click to show full address)
- Auto-clear success message after 5 seconds

## 4. File Structure

```
src/
├── context/
│   └── WalletContext.jsx     # Wallet state management
├── pages/
│   └── PropertyDetail.jsx  # Investment UI with tx states
├── components/
│   └── layout/
│       └── Navbar.jsx       # Wallet connection UI
└── index.js               # App wrapper with WalletProvider
```

## 5. Usage

### Using WalletContext in Components

```javascript
import { useWallet } from './context/WalletContext';

function MyComponent() {
  const {
    account,
    isConnected,
    currentChain,
    txState,
    connect,
    disconnect,
    switchNetwork,
    setTransactionState,
    resetTransactionState
  } = useWallet();

  // Your component logic
}
```

### Wrapping the App

```javascript
// index.js
import { WalletProvider } from './context/WalletContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <WalletProvider>
    <App />
  </WalletProvider>
);
```

## 6. Event Listeners

The WalletContext listens to the following MetaMask events:

| Event | Handler |
|-------|---------|
| `accountsChanged` | Update account or disconnect if empty |
| `chainChanged` | Update chainId and reload page |
| `connect` | Update chainId |

## 7. Error Handling

| Error Code | Description |
|------------|-------------|
| 4001 | Transaction rejected by user |
| 4902 | Network not added to wallet |

## 8. Testing

To test the implementation:

1. Install MetaMask browser extension
2. Start the development server
3. Click "Connect Wallet" in the navbar
4. Approve the connection request in MetaMask
5. Network should display in navbar
6. Navigate to Property Detail
7. Click "Invest Now" to trigger transaction flow

## 9. Notes

- Uses ethers.js v5 for blockchain interactions
- Auto-reconnects on page load if wallet was previously connected
- Transaction states auto-reset after success (5 seconds)
- Network switching requires user approval in MetaMask