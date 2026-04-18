import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';
import { useWallet, SUPPORTED_CHAINS } from '../../context/WalletContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const { 
    account, 
    chainId, 
    isConnected, 
    currentChain,
    isConnecting,
    connect, 
    disconnect,
    switchNetwork
  } = useWallet();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' },
  ];

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    await connect();
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  const handleNetworkSwitch = async (networkChainId) => {
    await switchNetwork(networkChainId);
    setShowNetworkMenu(false);
  };

  const supportedNetworks = Object.entries(SUPPORTED_CHAINS).map(([chainId, info]) => ({
    chainId: parseInt(chainId),
    ...info,
  }));

  return (
    <nav className="bg-white shadow-sm">
      <div className="container">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <svg width="30" height="35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="20" r="10" stroke="#0682ff"/>
                  <circle cx="15" cy="20" r="6" stroke="#0682ff" strokeWidth="3"/>
              </svg>  
              <span className="text-2xl font-bold text-primary-600 mt-1.5">Real Estate Investment Platform</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-secondary-600 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}

            {/* Network Selector */}
            {isConnected && currentChain && (
              <div className="relative">
                <button
                  onClick={() => setShowNetworkMenu(!showNetworkMenu)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600"
                >
                  <FaEthereum className="text-primary-600" />
                  <span>{currentChain.name}</span>
                </button>
                {showNetworkMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
                    {supportedNetworks.map((network) => (
                      <button
                        key={network.chainId}
                        onClick={() => handleNetworkSwitch(network.chainId)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          chainId === network.chainId
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-secondary-600 hover:bg-primary-50'
                        }`}
                      >
                        {network.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wallet Button */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-600">
                  {formatAddress(account)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-secondary-600 hover:text-primary-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Wallet Section */}
              <div className="pt-4 border-t">
                {isConnected ? (
                  <>
                    <div className="px-3 py-2 text-base font-medium text-secondary-600">
                      {formatAddress(account)}
                    </div>
                    {currentChain && (
                      <div className="px-3 py-2 text-sm text-secondary-500">
                        Network: {currentChain.name}
                      </div>
                    )}
                    <button
                      onClick={handleDisconnect}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;