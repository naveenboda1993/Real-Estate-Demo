import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiMaximize2, FiCalendar, FiTrendingUp, FiUsers, FiDollarSign, FiGrid, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton } from 'react-share';
import { FaFacebook, FaTwitter, FaLinkedin, FaEthereum, FaWallet } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';

function PropertyDetail() {
  const { id } = useParams();
  const { account, isConnected, connect, provider, setTransactionState, txState, resetTransactionState } = useWallet();
  
  const [investmentAmount, setInvestmentAmount] = useState(10);
  const [isInvesting, setIsInvesting] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  const property = {
    id: parseInt(id),
    title: 'Modern Villa with Pool',
    price: {
      usd: 850000,
      eth: 425
    },
    location: 'Beverly Hills, CA',
    type: 'villa',
    roi: '7.2%',
    metrics: {
      totalInvestors: 142,
      funded: '89%',
      minInvestment: '$10',
      monthlyIncome: '$520',
      appreciation: '4.5%',
      rentalYield: '5.8%',
      totalReturn: '10.3%'
    },
    status: 'Active Investment',
    description: 'This stunning modern villa offers luxurious living spaces with high-end finishes throughout. The property has been tokenized for fractional ownership, allowing investors to participate in this premium real estate opportunity with as little as $10.',
    features: [
      'Swimming Pool',
      'Smart Home System',
      'Gourmet Kitchen',
      'Home Theater',
      'Wine Cellar',
      'Outdoor Kitchen',
      'Fire Pit',
      'Three-Car Garage'
    ],
    tokenDetails: {
      totalTokens: 85000,
      availableTokens: 9350,
      tokenPrice: '$10',
      tokenSymbol: 'VILLA425',
      contractAddress: '0x1234...5678',
      blockchain: 'Ethereum'
    },
    financials: {
      grossRent: '$8,500/month',
      netRent: '$7,225/month',
      expenses: {
        management: '8%',
        maintenance: '5%',
        insurance: '2%',
        property_tax: '1.2%'
      },
      projectedAppreciation: '4.5% annually'
    },
    yearBuilt: 2020,
    parkingSpaces: 3,
    lotSize: '0.5 acres',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'
    ],
    agent: {
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john@realestate.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
    }
  };

  const shareUrl = window.location.href;

  const handleInvest = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    setIsInvesting(true);
    setTransactionState({ status: 'pending', message: 'Confirm in wallet...' });

    try {
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      const signer = provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0EfE8',
        value: ethers.utils.parseEther('0.001')
      });

      setTransactionState({ 
        status: 'confirming', 
        txHash: tx.hash,
        message: 'Waiting for confirmation...'
      });

      await tx.wait();

      setTransactionState({ 
        status: 'success', 
        txHash: tx.hash,
        message: 'Minted!'
      });

    } catch (err) {
      if (err.code === 4001 || err.message.includes('user rejected')) {
        setTransactionState({ status: 'rejected', message: 'Transaction rejected' });
      } else {
        setTransactionState({ status: 'error', message: err.message });
      }
    } finally {
      setIsInvesting(false);
    }
  };

  useEffect(() => {
    if (txState.status === 'success') {
      const timer = setTimeout(() => {
        resetTransactionState();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [txState.status, resetTransactionState]);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const renderTxButton = () => {
    if (txState.status === 'pending' || txState.status === 'confirming' || isInvesting) {
      return (
        <button className="btn w-full mb-4 flex items-center justify-center" disabled>
          <FiLoader className="animate-spin mr-2" />
          {txState.status === 'pending' ? 'Confirm in wallet...' : 'Waiting for confirmation...'}
        </button>
      );
    }

    if (txState.status === 'success') {
      return (
        <motion.button 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="btn w-full mb-4 flex items-center justify-center bg-green-600 hover:bg-green-700"
        >
          <FiCheck className="mr-2" />
          {txState.message}
        </motion.button>
      );
    }

    if (txState.status === 'rejected' || txState.status === 'error') {
      return (
        <button 
          onClick={() => resetTransactionState()}
          className="btn w-full mb-4 flex items-center justify-center"
        >
          <FiAlertCircle className="mr-2" />
          {txState.status === 'rejected' ? 'Transaction rejected' : 'Error - Try again'}
        </button>
      );
    }

    return (
      <button 
        onClick={handleInvest}
        className="btn w-full mb-4 flex items-center justify-center"
      >
        <FaWallet className="mr-2" />
        {isConnected ? 'Invest Now' : 'Connect Wallet to Invest'}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Navigation */}
      <div className="bg-white shadow">
        <div className="container py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-secondary-600 hover:text-primary-600">Home</Link>
            <span className="text-secondary-400">/</span>
            <Link to="/properties" className="text-secondary-600 hover:text-primary-600">Properties</Link>
            <span className="text-secondary-400">/</span>
            <span className="text-primary-600">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="h-96 rounded-lg overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {property.images.slice(1).map((image, index) => (
                  <div key={index} className="h-32 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${property.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold mb-4">Property Details</h2>
              <p className="text-secondary-600 mb-6">{property.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span>{property.parkingSpaces} Parking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMaximize2 className="text-primary-600" />
                  <span>{property.lotSize}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-primary-600" />
                  <span>Built {property.yearBuilt}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiUsers className="text-primary-600" />
                  <span>{property.metrics.totalInvestors} Investors</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FiHome className="text-primary-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Token Details */}
              <h3 className="text-xl font-semibold mb-4">Token Information</h3>
              <div className="bg-secondary-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-600">Token Symbol</p>
                    <p className="font-semibold">{property.tokenDetails.tokenSymbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Token Price</p>
                    <p className="font-semibold">{property.tokenDetails.tokenPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Available Tokens</p>
                    <p className="font-semibold">{property.tokenDetails.availableTokens.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Total Supply</p>
                    <p className="font-semibold">{property.tokenDetails.totalTokens.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-secondary-600">Smart Contract</p>
                    <p className="font-mono text-sm">{property.tokenDetails.contractAddress}</p>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Rental Income</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Gross Rent</span>
                      <span className="font-medium">{property.financials.grossRent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Net Rent</span>
                      <span className="font-medium">{property.financials.netRent}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Expenses</h4>
                  <div className="space-y-2">
                    {Object.entries(property.financials.expenses).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-secondary-600">{key.replace('_', ' ').charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Investment Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-secondary-500">Investment Price</p>
                  <div className="flex items-center">
                    <FiDollarSign className="text-primary-600" />
                    <span className="text-2xl font-bold">${property.price.usd.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-primary-600">
                    <FaEthereum className="mr-1" />
                    <span>{property.price.eth} ETH</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500">Annual ROI</p>
                  <div className="flex items-center justify-end text-green-600">
                    <FiTrendingUp className="mr-1" />
                    <span className="text-2xl font-bold">{property.roi}</span>
                  </div>
                </div>
              </div>

              {/* Investment Metrics */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Rental Yield</span>
                  <span className="font-medium">{property.metrics.rentalYield}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Appreciation</span>
                  <span className="font-medium">{property.metrics.appreciation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Total Return</span>
                  <span className="font-medium text-green-600">{property.metrics.totalReturn}</span>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Funding Progress</span>
                  <span className="font-medium">{property.metrics.funded}</span>
                </div>
                <div className="w-full bg-secondary-100 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: property.metrics.funded }}
                  />
                </div>
                <p className="text-sm text-secondary-500 mt-1">
                  Min Investment: {property.metrics.minInvestment}
                </p>
              </div>
              
              <Link
                to={`/property-3d`}
                className="btn w-full mb-4 flex items-center justify-center">
                <FiGrid className="mr-2" />
                View 3D version
              </Link>

              {/* Transaction Button */}
              {renderTxButton()}
              
              {/* Connected Account Display */}
              {isConnected && txState.status !== 'success' && (
                <div className="flex items-center justify-center text-sm text-secondary-500 pt-2">
                  {showFullAddress ? (
                    <span 
                      className="font-mono cursor-pointer"
                      onClick={() => setShowFullAddress(false)}
                    >
                      {account}
                    </span>
                  ) : (
                    <span 
                      className="cursor-pointer"
                      onClick={() => setShowFullAddress(true)}
                    >
                      {formatAddress(account)}
                    </span>
                  )}
                </div>
              )}

              {/* Transaction Hash Display */}
              {txState.txHash && (
                <div className="mt-2 text-xs text-secondary-500">
                  <p>Tx Hash: {txState.txHash.slice(0, 10)}...{txState.txHash.slice(-8)}</p>
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-4 pt-4 border-t">
                <FacebookShareButton url={shareUrl}>
                  <FaFacebook className="text-2xl text-blue-600 hover:opacity-80" />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl}>
                  <FaTwitter className="text-2xl text-sky-500 hover:opacity-80" />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl}>
                  <FaLinkedin className="text-2xl text-blue-700 hover:opacity-80" />
                </LinkedinShareButton>
              </div>
            </div>

            {/* Agent Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={property.agent.image}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{property.agent.name}</h3>
                  <p className="text-sm text-secondary-600">Investment Advisor</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {property.agent.phone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {property.agent.email}
                </p>
              </div>
              <button className="btn-secondary w-full mt-4">
                Schedule Consultation
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;