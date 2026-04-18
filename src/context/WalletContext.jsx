import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH' },
  137: { name: 'Polygon', symbol: 'MATIC' },
  11155111: { name: 'Sepolia', symbol: 'ETH' },
};

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const [txState, setTxState] = useState({
    status: 'idle',
    txHash: null,
    message: '',
  });

  const isConnected = !!account;
  const currentChain = chainId ? SUPPORTED_CHAINS[chainId] : null;

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await ethersProvider.send('eth_requestAccounts', []);
      
      const accounts = await ethersProvider.listAccounts();
      const network = await ethersProvider.getNetwork();
      
      const signer = ethersProvider.getSigner();
      
      setProvider(ethersProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setTxState({ status: 'idle', txHash: null, message: '' });
  }, []);

  const switchNetwork = useCallback(async (targetChainId) => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(targetChainId) }],
      });
    } catch (err) {
      if (err.code === 4902) {
        setError(`Please switch to ${SUPPORTED_CHAINS[targetChainId]?.name || 'supported network'}`);
      } else {
        setError(err.message);
      }
    }
  }, []);

  const setTransactionState = useCallback((state) => {
    setTxState(prev => ({ ...prev, ...state }));
  }, []);

  const resetTransactionState = useCallback(() => {
    setTxState({ status: 'idle', txHash: null, message: '' });
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
      window.location.reload();
    };

    const handleConnect = ({ chainId }) => {
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnect);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('connect', handleConnect);
    };
  }, [disconnect]);

  useEffect(() => {
    if (!window.ethereum) return;

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
          const network = await ethersProvider.getNetwork();
          
          setProvider(ethersProvider);
          setSigner(ethersProvider.getSigner());
          setAccount(accounts[0]);
          setChainId(network.chainId);
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
      }
    };

    checkConnection();
  }, []);

  const value = {
    account,
    chainId,
    provider,
    signer,
    isConnecting,
    isConnected,
    currentChain,
    error,
    txState,
    connect,
    disconnect,
    switchNetwork,
    setTransactionState,
    resetTransactionState,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}