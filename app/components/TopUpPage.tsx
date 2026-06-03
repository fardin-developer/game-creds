'use client';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { updateUser } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';
import TopSection from './TopSection';
import { toast } from 'react-hot-toast';

interface TopUpPageProps {
  onNavigate?: (screen: string) => void;
}

export default function TopUpPage({ onNavigate }: TopUpPageProps = {}) {
  const router = useRouter();
  const params = useParams();
  const gameId = params?.gameId as string;
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [gameData, setGameData] = useState<{
    _id: string;
    name: string;
    image: string;
    productId: string;
    publisher: string;
    validationFields: string[];
    regionList?: Array<{
      code: string;
      name: string;
    }>;
    createdAt: string;
    updatedAt: string;
    __v: number;
    ogcode?: string;
  } | null>(null);

  const [diamondPacks, setDiamondPacks] = useState<Array<{
    _id: string;
    game: string;
    amount: number;
    commission: number;
    cashback: number;
    logo: string;
    description: string;
    status: string;
    category: string;
  }>>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validatedInfo, setValidatedInfo] = useState<{
    nickname: string;
    server: string;
  } | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [selectedPackData, setSelectedPackData] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [validationHistory, setValidationHistory] = useState<Array<{
    gameId: string;
    playerId: string;
    server: string;
    playerName: string;
    timestamp: string;
    _id: string;
  }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHistoryListModal, setShowHistoryListModal] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [highlightButton, setHighlightButton] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if user is logged in when component mounts
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsUserLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (gameId) {
      fetchDiamondPacks();
      fetchValidationHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Initialize formData when gameData is loaded
  useEffect(() => {
    if (gameData && gameData.validationFields) {
      const initialFormData: Record<string, string> = {};
      gameData.validationFields.forEach((field) => {
        initialFormData[field] = '';
      });
      setFormData(initialFormData);
    }
  }, [gameData]);

  useEffect(() => {
    if (showCheckoutPopup) {
      document.body.style.overflow = 'hidden';
      fetchWalletBalance();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCheckoutPopup]);

  useEffect(() => {
    if (showHistoryModal || showHistoryListModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showHistoryModal, showHistoryListModal]);

  // Auto-open history modal if there's history data on page load
  useEffect(() => {
    if (validationHistory.length > 0 && !showHistoryModal) {
      setShowHistoryModal(true);
    }
  }, [validationHistory]);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await apiClient.get('/user/me');
      const data = response.data;
      const balanceCandidate =
        (data && (data.walletBalance ?? data.user?.walletBalance ?? data.data?.walletBalance ?? data.data?.user?.walletBalance));
      if (typeof balanceCandidate === 'number') {
        setWalletBalance(balanceCandidate);
      } else if (typeof balanceCandidate === 'string' && !isNaN(Number(balanceCandidate))) {
        setWalletBalance(Number(balanceCandidate));
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchValidationHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setIsLoadingHistory(true);
      const response = await apiClient.get(`/games/${gameId}/validation-history`);
      const responseData = response.data;

      if (responseData.success && responseData.validationHistory) {
        // Sort by timestamp, most recent first
        const sortedHistory = [...responseData.validationHistory].sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setValidationHistory(sortedHistory);
      }
    } catch (error) {
      console.error('Error fetching validation history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectHistoryItem = (historyItem: any) => {
    // Auto-fill form with history data
    const newFormData: Record<string, string> = { ...formData };

    // Map history fields to form fields
    if (historyItem.playerId) {
      newFormData['playerId'] = historyItem.playerId;
    }
    if (historyItem.server) {
      newFormData['server'] = historyItem.server;
    }
    if (historyItem.serverId) {
      newFormData['serverId'] = historyItem.serverId;
    }

    setFormData(newFormData);

    // Set validated info without requiring validation
    setValidatedInfo({
      nickname: historyItem.playerName || '',
      server: historyItem.server || ''
    });

    // Mark as validated since we're using history data
    setIsValidated(true);

    // Close history modal
    setShowHistoryModal(false);
  };

  const processUPIPayment = async () => {
    try {
      setIsProcessingPayment(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        // toast.error('Authentication token not found');
        return;
      }

      if (!selectedPackData) {
        // toast.error('No pack selected');
        return;
      }

      // Build request body dynamically based on validationFields
      const requestBody: any = {
        diamondPackId: selectedPackData.packId,
        amount: selectedPackData.packAmount,
        quantity: 1,
        redirectUrl: typeof window !== 'undefined'
          ? `${window.location.origin}/payment-status`
          : 'https://zorotopup.com/payment-status'
      };

      // Add all validation fields dynamically
      if (gameData && gameData.validationFields) {
        gameData.validationFields.forEach((field) => {
          requestBody[field] = selectedPackData[field];
        });
      }

      const response = await apiClient.post('/order/diamond-pack-upi', requestBody);
      const responseData = response.data;

      if (responseData.success && responseData.transaction?.paymentUrl) {
        toast.success('Payment request created successfully! Redirecting...');
        window.location.href = responseData.transaction.paymentUrl;
      } else {
        toast.error(responseData.message || 'Failed to create payment request');
      }
    } catch (error: any) {
      console.error('Error processing UPI payment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while processing payment';
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const processWalletPayment = async () => {
    try {
      setIsProcessingPayment(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        // toast.error('Authentication token not found');
        return;
      }

      if (!selectedPackData) {
        // toast.error('No pack selected');
        return;
      }

      // Build request body dynamically based on validationFields
      const requestBody: any = {
        diamondPackId: selectedPackData.packId,
        quantity: 1
      };

      // Add all validation fields dynamically
      if (gameData && gameData.validationFields) {
        gameData.validationFields.forEach((field) => {
          requestBody[field] = selectedPackData[field];
        });
      }

      const response = await apiClient.post('/order/diamond-pack', requestBody);
      const responseData = response.data;

      if (responseData.success) {
        setShowCheckoutPopup(false);

        // Update wallet balance after successful payment
        try {
          const userResponse = await apiClient.get('/user/me');
          const userData = userResponse.data;
          const updatedBalance = userData?.walletBalance ?? userData?.user?.walletBalance ?? userData?.data?.walletBalance;
          if (typeof updatedBalance === 'number') {
            // Update Redux state
            dispatch(updateUser({ walletBalance: updatedBalance }));
            // Update local state
            setWalletBalance(updatedBalance);
          } else if (typeof updatedBalance === 'string' && !isNaN(Number(updatedBalance))) {
            const balanceNum = Number(updatedBalance);
            dispatch(updateUser({ walletBalance: balanceNum }));
            setWalletBalance(balanceNum);
          }
        } catch (error) {
          console.error('Error fetching updated wallet balance:', error);
          // Still proceed with redirect even if balance update fails
        }

        // For wallet payments, redirect to order status page using orderId
        const orderId = responseData.orderId ||
          responseData.order?.orderId ||
          responseData.data?.orderId ||
          responseData.order?._id;

        if (orderId) {
          // Redirect to order status page
          if (onNavigate) {
            onNavigate('order-status');
          } else {
            router.push(`/order-status?orderId=${encodeURIComponent(orderId)}`);
          }
        } else {
          // Fallback: check for transaction IDs and redirect to payment status
          const transaction = responseData.transaction || responseData.data?.transaction;
          const clientTxnId = transaction?.clientTxnId || transaction?.client_txn_id || transaction?.clientTrxId;
          const txnId = transaction?.txnId || transaction?.txn_id || transaction?.transactionId;

          if (clientTxnId || txnId) {
            const params = new URLSearchParams();
            if (clientTxnId) {
              params.append('clientTxnId', clientTxnId);
            }
            if (txnId) {
              params.append('transactionId', txnId);
            }

            if (onNavigate) {
              onNavigate('payment-status');
            } else {
              router.push(`/payment-status?${params.toString()}`);
            }
          } else {
            // Final fallback to dashboard
            if (onNavigate) {
              onNavigate('home');
            } else {
              router.push('/');
            }
          }
        }
      } else {
        toast.error(responseData.message || 'Failed to process wallet payment');
      }
    } catch (error: any) {
      console.error('Error processing wallet payment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while processing payment';
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const fetchDiamondPacks = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/games/${gameId}/diamond-packs`);
      const responseData = response.data;

      if (responseData.success) {
        const gameDataValue = responseData.gameData;
        setGameData(gameDataValue);
        setDiamondPacks(responseData.diamondPacks);

        // Extract unique categories from diamond packs (excluding "All")
        const extractedCategories = Array.from(new Set(responseData.diamondPacks.map((pack: any) => pack.category).filter(Boolean))) as string[];
        const categories = ["All", ...extractedCategories];
        setAllCategories(categories);

        // Set 'All' as default category
        if (categories.length > 0) {
          setSelectedCategory('All');
        }

        // Get the most used product image for each category
        const images: Record<string, string> = {};
        categories.forEach((category) => {
          if (category === 'All' && extractedCategories.length > 0) {
            const firstCategoryPacks = responseData.diamondPacks.filter((pack: any) => pack.category === extractedCategories[0]);
            if (firstCategoryPacks.length > 0) {
              const firstPack = firstCategoryPacks[0];
              images[category] = firstPack.logo || firstPack.image || gameDataValue?.image || '';
            }
          } else {
            // Find all packs in this category
            const categoryPacks = responseData.diamondPacks.filter((pack: any) => pack.category === category);
            if (categoryPacks.length > 0) {
              const firstPack = categoryPacks[0];
              images[category] = firstPack.logo || firstPack.image || gameDataValue?.image || '';
            }
          }
        });
        setCategoryImages(images);
      }
    } catch (error) {
      console.error('Error fetching diamond packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced auto-validation — fires 800ms after the user stops typing.
  // AbortController cancels any in-flight request so a slow old response
  // can never overwrite the result of a newer request.
  const scheduleAutoValidate = useCallback((updatedFormData: Record<string, string>) => {
    // Cancel pending debounce timer
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    // Abort any in-flight API call immediately
    if (abortControllerRef.current) abortControllerRef.current.abort();

    debounceTimerRef.current = setTimeout(async () => {
      if (!gameData || !gameData.validationFields) return;
      // Only fire when ALL required fields are filled
      const allFilled = gameData.validationFields.every(f => updatedFormData[f]?.trim());
      if (!allFilled) return;

      // Create a fresh controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsValidating(true);
      try {
        const requestBody: Record<string, string> = { gameId };
        gameData.validationFields.forEach((field) => {
          const isServerField = field === 'server' || field === 'serverId';
          if (isServerField && gameData.regionList?.length) {
            const selected = gameData.regionList.find(r => r.code === updatedFormData[field]);
            requestBody[field] = selected ? selected.code : updatedFormData[field];
          } else {
            requestBody[field] = updatedFormData[field];
          }
        });

        const response = await apiClient.post('/games/validate-user', requestBody, {
          signal: controller.signal
        });
        const responseData = response.data;
        if (responseData.response || responseData.valid) {
          const nickname = responseData.name || responseData.data?.nickname || '';
          const server = responseData.server || responseData.data?.server || '';
          setValidatedInfo({ nickname, server });
          setIsValidated(true);
          toast.success(responseData.msg || responseData.data?.msg || 'Player verified!');
        } else {
          setValidatedInfo(null);
          setIsValidated(false);
          toast.error(responseData.msg || responseData.data?.msg || 'Invalid ID or Server');
        }
      } catch (error: any) {
        // Silently ignore aborted (cancelled) requests — they are expected
        if (error?.name === 'CanceledError' || error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') return;
        setValidatedInfo(null);
        setIsValidated(false);
        toast.error(error.response?.data?.msg || error.response?.data?.data?.msg || 'Validation failed');
      } finally {
        // Only clear the validating state if this controller wasn't already replaced
        if (abortControllerRef.current === controller) {
          setIsValidating(false);
        }
      }
    }, 800);
  }, [gameData, gameId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setIsValidated(false);
    setValidatedInfo(null);
    if (invalidFields.includes(name)) {
      setInvalidFields(prev => prev.filter(field => field !== name));
    }
    scheduleAutoValidate(updated);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setIsValidated(false);
    setValidatedInfo(null);
    if (invalidFields.includes(name)) {
      setInvalidFields(prev => prev.filter(field => field !== name));
    }
    scheduleAutoValidate(updated);
  };

  // Helper function to format field names to user-friendly labels
  const getFieldLabel = (fieldName: string): string => {
    const labelMap: Record<string, string> = {
      playerId: 'Player ID',
      server: 'Server',
      serverId: 'Server ID',
      uid: 'UID',
      username: 'Username',
      accountId: 'Account ID',
      characterName: 'Character Name',
    };

    // If we have a mapping, use it
    if (labelMap[fieldName]) {
      return labelMap[fieldName];
    }

    // Otherwise, format the field name (e.g., "playerId" -> "Player ID")
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper function to get placeholder text
  const getFieldPlaceholder = (fieldName: string): string => {
    return `Enter your ${getFieldLabel(fieldName)}`;
  };

  const handleValidate = async () => {
    // Dynamic validation - check all required fields
    if (!gameData || !gameData.validationFields) {
      toast.error('Game data not loaded');
      return;
    }

    const newInvalidFields: string[] = [];
    for (const field of gameData.validationFields) {
      if (!formData[field] || !formData[field].trim()) {
        newInvalidFields.push(field);
      }
    }

    if (newInvalidFields.length > 0) {
      setInvalidFields(newInvalidFields);

      // Scroll to validation section first
      const validationSection = document.getElementById('validation-section');
      if (validationSection) {
        validationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Trigger button highlight and shake for different durations
      setHighlightButton(true);
      setShake(true);

      // Clear input field borders after 1.2s
      setTimeout(() => {
        setInvalidFields([]);
      }, 1200);

      // Clear button highlight and shake after 1.7s
      setTimeout(() => {
        setShake(false);
        setHighlightButton(false);
      }, 1700);

      return;
    }

    setIsValidating(true);

    try {
      // Build request body dynamically based on validationFields
      const requestBody: Record<string, string> = {
        gameId: gameId,
      };

      gameData.validationFields.forEach((field) => {
        if (formData[field]) {
          // If this is a server field and regionList is available, ensure we're using the region code
          const isServerField = (field === 'server' || field === 'serverId');
          if (isServerField && gameData.regionList && gameData.regionList.length > 0) {
            // The formData already contains the region code from the dropdown
            // Verify it's a valid region code from the regionList
            const selectedRegion = gameData.regionList.find(region => region.code === formData[field]);
            if (selectedRegion) {
              requestBody[field] = selectedRegion.code;
            } else {
              // If it's not a valid region code, use the value as-is (might be manual input)
              requestBody[field] = formData[field];
            }
          } else {
            requestBody[field] = formData[field];
          }
        }
      });

      const response = await apiClient.post('/games/validate-user', requestBody);
      const responseData = response.data;
      // Check for success using response or valid field
      if (responseData.response || responseData.valid) {
        // Show success message from response
        const successMsg = responseData.msg || responseData.data?.msg || 'User validated successfully!';
        toast.success(successMsg);

        // Set validated info - use top level fields or data fields
        const nickname = responseData.name || responseData.data?.nickname || '';
        const server = responseData.server || responseData.data?.server || '';

        setValidatedInfo({
          nickname: nickname,
          server: server
        });

        // Mark as validated
        setIsValidated(true);
      } else {
        // Show error message
        const errorMsg = responseData.msg || responseData.data?.msg || 'Invalid ID or Server';
        toast.error(errorMsg);
        setValidatedInfo(null);
        setIsValidated(false);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || error.response?.data?.data?.msg || error.message || 'Validation failed. Please try again.';
      toast.error(errorMsg);
      setValidatedInfo(null);
      setIsValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Filter diamond packs by selected category
  const filteredDiamondPacks = selectedCategory && selectedCategory !== 'All'
    ? diamondPacks.filter(pack => pack.category === selectedCategory)
    : diamondPacks;
  const validateButtonIsAlert = highlightButton || invalidFields.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFEBF0' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#010102] text-lg">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFEBF0' }}>
        <div className="text-center">
          <p className="text-[#010102] text-lg">Game not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#E7121B] text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden p-0 m-0"
      style={{
        backgroundColor: '#EFEBF0',
        backgroundImage:
          'radial-gradient(circle at 8% 10%, rgba(231, 18, 27, 0.10) 0, transparent 38%), radial-gradient(circle at 95% 12%, rgba(128, 117, 255, 0.08) 0, transparent 30%), linear-gradient(180deg, #F3EFF6 0%, #EFEBF0 45%, #ECE7EE 100%)'
      }}
    >
      {/* Desktop Container */}
      <div className="w-full">
        {/* Top Color Effect */}
        <div
          className="absolute top-0 left-0 right-0 h-40 z-0"
          style={{
            background: 'linear-gradient(180deg, rgba(176, 20, 40, 0.13) 0%, rgba(176, 20, 40, 0.03) 55%, transparent 100%)'
          }}
        />

        {/* Top Section with Logo */}
        <div className="relative z-10">
          <TopSection showLogo={true} onNavigate={onNavigate} />
        </div>

        {/* Game Information & Input Card */}
        <div className="px-4 md:px-6 lg:px-8 mb-6">
          <div
            className="p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(130deg, #B80D22 0%, #D80E21 48%, #EE3A45 100%)',
              borderRadius: '22px',
              boxShadow: '0px 14px 34px rgba(99, 24, 46, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.22)'
            }}
          >
            <div
              className="absolute -top-20 -right-14 w-52 h-52 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.01) 68%)' }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(73, 8, 31, 0.40) 0%, rgba(73, 8, 31, 0.02) 70%)' }}
            />
            <div
              className="absolute top-12 -right-6 w-36 h-36 pointer-events-none"
              style={{
                clipPath: 'polygon(50% 0%, 96% 28%, 80% 100%, 12% 86%, 0% 34%)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.20)',
                filter: 'blur(0.3px)'
              }}
            />
            <div
              className="absolute -bottom-8 right-16 w-28 h-28 pointer-events-none"
              style={{
                clipPath: 'polygon(52% 0%, 100% 50%, 52% 100%, 0% 56%)',
                background: 'linear-gradient(160deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.16)'
              }}
            />
            <div
              className="absolute top-20 left-28 w-20 h-20 pointer-events-none"
              style={{
                clipPath: 'polygon(50% 0%, 100% 40%, 78% 100%, 20% 100%, 0% 40%)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.02) 100%)'
              }}
            />
            <div className="relative z-10">
              {/* Game Logo and Info */}
              <div className="flex items-center mb-6">
                <div className="relative mr-4">
                  <Image
                    src={gameData.image}
                    alt={gameData.name}
                    width={60}
                    height={60}
                    className="object-cover rounded-lg"
                    style={{
                      width: '60px',
                      height: '60px',
                      border: '1px solid white',
                      borderRadius: '22px',
                      color: 'transparent'
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg">{gameData.name}</h3>
                  <p className="text-gray-100 text-xs sm:text-sm">{gameData.publisher}</p>
                </div>
              </div>

              {/* Input Fields - Dynamic based on validationFields */}
              <div className="space-y-3" id="validation-section">
                {gameData.validationFields && (() => {
                  // Determine which field should get the inline history button
                  const fields = gameData.validationFields;
                  const hasServerField = fields.some(f => f === 'server' || f === 'serverId');
                  // History button goes on the last field (server if present, else playerId / last field)
                  const historyTargetField = hasServerField
                    ? fields.find(f => f === 'server' || f === 'serverId')
                    : fields[fields.length - 1];

                  return fields.map((field) => {
                    const isServerField = (field === 'server' || field === 'serverId');
                    const shouldUseDropdown = isServerField && gameData.regionList && gameData.regionList.length > 0;
                    const isInvalid = invalidFields.includes(field);
                    const showHistoryHere = field === historyTargetField && validationHistory.length > 0;
                    // Show status indicator (spinner / checkmark) on last field
                    const isLastField = field === fields[fields.length - 1];

                    return (
                      <div key={field}>
                        <label
                          htmlFor={`topup-${field}`}
                          className="text-[#FFF4F6] text-sm mb-1.5 block"
                        >
                          Enter Your {getFieldLabel(field)}
                        </label>

                        {/* Input row with optional history button */}
                        <div className="flex items-center gap-2">
                          {/* Input / Select */}
                          <div className="flex-1 relative">
                            {shouldUseDropdown && gameData.regionList ? (
                              <select
                                name={field}
                                id={`topup-${field}`}
                                value={formData[field] || ''}
                                onChange={handleSelectChange}
                                className="w-full px-4 py-2.5 rounded-xl text-black transition-all outline-none"
                                style={{
                                  backgroundColor: '#FFF9FA',
                                  border: isInvalid ? '1.5px solid #FCA5A5' : '1px solid #F3CAD2',
                                  color: '#201421'
                                }}
                              >
                                <option value="">Select {getFieldLabel(field)}</option>
                                {gameData.regionList.map((region) => (
                                  <option key={region.code} value={region.code}>
                                    {region.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field === 'playerId' ? 'tel' : 'text'}
                                name={field}
                                id={`topup-${field}`}
                                value={formData[field] || ''}
                                onChange={handleInputChange}
                                placeholder={getFieldPlaceholder(field)}
                                className="w-full px-4 py-2.5 rounded-xl text-black placeholder-gray-400 transition-all outline-none"
                                style={{
                                  backgroundColor: '#FFF9FA',
                                  border: isInvalid ? '1.5px solid #FCA5A5' : '1px solid #F3CAD2',
                                  color: '#201421'
                                }}
                              />
                            )}

                            {/* Inline validation spinner / checkmark (on last field only) */}
                            {isLastField && (isValidating || isValidated) && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isValidating ? (
                                  <div style={{
                                    width: '16px', height: '16px',
                                    border: '2px solid rgba(231,18,27,0.25)',
                                    borderTopColor: '#E7121B',
                                    borderRadius: '50%',
                                    animation: 'spin 0.7s linear infinite'
                                  }} />
                                ) : (
                                  <div style={{
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* History button — inline on the target field */}
                          {showHistoryHere && (
                            <button
                              type="button"
                              onClick={() => setShowHistoryListModal(true)}
                              title={`${validationHistory.length} previous validations`}
                              style={{
                                position: 'relative',
                                flexShrink: 0,
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.18)',
                                border: '1px solid rgba(255,255,255,0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <svg width="18" height="18" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {/* Count badge */}
                              <span style={{
                                position: 'absolute', top: '-4px', right: '-4px',
                                minWidth: '16px', height: '16px', borderRadius: '99px',
                                background: '#22C55E',
                                color: 'white', fontSize: '9px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0 3px'
                              }}>
                                {validationHistory.length}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}

                {/* Validated player name card */}
                {validatedInfo && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.30)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ color: '#FFFFFF', fontFamily: 'Poppins', fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>
                        {validatedInfo.nickname}
                      </p>
                      {validatedInfo.server && (
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins', fontWeight: 400, fontSize: '11px', marginTop: '1px' }}>
                          {validatedInfo.server}
                        </p>
                      )}
                    </div>
                    <span style={{
                      marginLeft: 'auto', background: 'rgba(34,197,94,0.2)',
                      border: '1px solid rgba(34,197,94,0.4)',
                      borderRadius: '6px', padding: '2px 8px',
                      color: '#4ADE80', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em'
                    }}>VERIFIED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Select Diamond Pack Section */}
        <div className="px-4 md:px-6 lg:px-8 mb-6">
          <h2 className="text-[#1A1A22] font-semibold text-base sm:text-lg mb-4 tracking-tight">Select Diamond Pack</h2>

          {/* Category Cards - Square Design - Scrollable */}
          {allCategories.length > 0 && (() => {
            // We need a ref for the scroll container — declared inline via a callback ref pattern
            // using a stable module-level ref (catScrollRef is declared alongside other state).
            return (
              <div className="mb-6 relative" id="category-scroll-wrapper">
                {/* Scroll strip */}
                <div
                  id="category-scroll-inner"
                  className="overflow-x-auto scrollbar-hide"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
                    const hint = document.getElementById('cat-scroll-hint');
                    if (hint) hint.style.opacity = atEnd ? '0' : '1';
                  }}
                >
                  <div className="flex gap-2.5 md:gap-3 pb-2" style={{ minWidth: 'max-content' }}>
                    {allCategories.map((category) => {
                      const isSelected = selectedCategory === category;
                      const categoryImage = categoryImages[category];

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 flex flex-col items-center justify-start p-2 shrink-0"
                          style={{
                            width: '192px',
                            minWidth: '92px',
                            minHeight: '102px',
                            background: isSelected
                              ? 'linear-gradient(145deg, #E0202D 0%, #B30B19 100%)'
                              : 'linear-gradient(150deg, #FFFFFF 0%, #F2F5FC 65%, #EBEEF7 100%)',
                            border: isSelected ? '1px solid rgba(176, 16, 33, 0.85)' : '1px solid #D9DEE8',
                            boxShadow: isSelected ? '0 10px 18px rgba(190, 22, 38, 0.22)' : '0 8px 16px rgba(34, 42, 66, 0.12)'
                          }}
                        >
                          {/* Category Image as Element */}
                          {categoryImage ? (
                            <div className="w-10 h-10 sm:w-11 sm:h-11 mb-1 relative shrink-0">
                              <Image
                                src={categoryImage}
                                alt={category}
                                fill
                                className="object-contain"
                                style={{ filter: isSelected ? 'none' : 'grayscale(30%)' }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 sm:w-11 sm:h-11 mb-1 flex items-center justify-center bg-gray-200 rounded-lg">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 100 4 2 2 0 000-4zM5.5 1a2.5 2.5 0 00-2.5 2.5v.5h5v-.5A2.5 2.5 0 005.5 1zM9 3a2 2 0 100 4 2 2 0 000-4zM10.5 1a2.5 2.5 0 00-2.5 2.5v.5h5v-.5A2.5 2.5 0 0010.5 1zM15 3a2 2 0 100 4 2 2 0 000-4zM16.5 1a2.5 2.5 0 00-2.5 2.5v.5h5v-.5A2.5 2.5 0 0016.5 1zM3 8a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                              </svg>
                            </div>
                          )}

                          {/* Category Name */}
                          <div className="text-center mt-0.5 px-0.5">
                            <span
                              className={`${isSelected ? "text-white" : "text-[#1E2738]"} font-semibold leading-tight wrap-break-word`}
                              style={{
                                textShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.28)' : 'none',
                                lineHeight: '1.15',
                                fontSize: '11px',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                            >
                              {category}
                            </span>
                          </div>

                          {/* Selected Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right-edge scroll hint — fades when user reaches the end */}
                <div
                  id="cat-scroll-hint"
                  className="pointer-events-none absolute top-0 right-0 bottom-2 flex items-center justify-end"
                  style={{
                    width: '64px',
                    background: 'linear-gradient(to right, transparent 0%, rgba(248,249,251,0.85) 55%, rgba(248,249,251,0.98) 100%)',
                    transition: 'opacity 0.3s ease',
                    opacity: allCategories.length > 3 ? 1 : 0,
                    borderRadius: '0 12px 12px 0'
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '6px',
                      boxShadow: '0 2px 8px rgba(231,18,27,0.35)',
                      animation: 'catHintBounce 1.2s ease-in-out infinite'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Diamond Pack Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filteredDiamondPacks.map((pack, index) => (
              <div
                key={pack._id}
                className="cursor-pointer"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '22px',
                  boxShadow: '0px 4px 4px 0px #00000040'
                }}
                onClick={() => {
                  // Check if user is logged in before proceeding
                  if (!isUserLoggedIn) {
                    toast.error('Please login first to checkout');
                    setTimeout(() => {
                      if (onNavigate) {
                        onNavigate('login');
                      } else {
                        router.push('/login');
                      }
                    }, 1500);
                    return;
                  }

                  // If not validated (whether fields are empty or just not validated yet),
                  // scroll to validation section and highlight the button + input fields
                  if (!isValidated) {
                    const validationSection = document.getElementById('validation-section');
                    if (validationSection) {
                      validationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }

                    // Highlight both the validate button and input fields for different durations
                    if (gameData?.validationFields) {
                      setInvalidFields(gameData.validationFields);
                    }
                    setHighlightButton(true);
                    setShake(true);

                    // Clear input field borders after 1.2s
                    setTimeout(() => {
                      setInvalidFields([]);
                    }, 1200);

                    // Clear button highlight and shake after 1.7s
                    setTimeout(() => {
                      setShake(false);
                      setHighlightButton(false);
                    }, 1700);

                    toast.error('Please validate your Player ID and Server before purchasing.');
                    return;
                  }

                  // Store pack details for checkout popup - include all validation fields
                  const packDetails: any = {
                    packId: pack._id,
                    gameId: gameId,
                    gameName: gameData?.name,
                    gameImage: gameData?.image,
                    packDescription: pack.description,
                    packAmount: pack.amount,
                    packLogo: pack.logo,
                    packCategory: pack.category,
                  };

                  // Add all validation fields dynamically
                  gameData.validationFields.forEach((field) => {
                    packDetails[field] = formData[field];
                  });
                  localStorage.setItem('selectedPack', JSON.stringify(packDetails));
                  setSelectedPackData(packDetails);
                  setShowCheckoutPopup(true);
                }}
              >
                <div className="relative mb-6">
                  <Image
                    src={pack.logo}
                    alt={pack.description}
                    width={80}
                    height={80}
                    className="w-full h-20 object-cover rounded-lg"
                    style={{
                      width: '70px',
                      margin: 'auto',
                      color: 'transparent'
                    }}
                  />
                </div>
                <div
                  className="text-left py-2 px-3 rounded-lg"
                  style={{
                    background: '#EFEBF0',
                    borderRadius: '22px'
                  }}
                >
                  <h3 className="text-[#010102] mb-1" style={{
                    fontFamily: 'Poppins',
                    fontWeight: 800,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '100%',
                    letterSpacing: '0%'
                  }}>{pack.description}</h3>
                  <p className="text-[#E7121B] font-bold" style={{ fontSize: '10px' }}>₹{pack.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Legend Note - Show only for 2x First recharge bonus and Weekly Pass categories */}
        {gameData &&
          (gameData.name.toLowerCase().includes('mobile legend') || gameData.name.toLowerCase().includes('mobile legends')) &&
          (selectedCategory === '2x First recharge bonus' || selectedCategory === 'Weekly Pass') && (
            <div className="px-4 md:px-6 lg:px-8 mb-6 mt-4">
              {selectedCategory === '2x First recharge bonus' ? (
                <div className="text-gray-700 text-xs space-y-1" style={{ fontFamily: 'Poppins', lineHeight: '1.4' }}>
                  <p className="text-[#E7121B] font-semibold text-xs mb-1">2x First Recharge Bonus</p>
                  <p className="text-xs">Total Diamonds received for each level:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                    <li>50 Diamond level: 50 base + 50 bonus = <span className="text-[#E7121B] font-bold">100 total</span></li>
                    <li>150 Diamond level: 150 base + 150 bonus = <span className="text-[#E7121B] font-bold">300 total</span></li>
                    <li>250 Diamond level: 250 base + 250 bonus = <span className="text-[#E7121B] font-bold">500 total</span></li>
                    <li>500 Diamond level: 500 base + 500 bonus = <span className="text-[#E7121B] font-bold">1000 total</span></li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Double Diamonds bonus applies only to your first purchase, regardless of payment channel or platform.
                  </p>
                </div>
              ) : selectedCategory === 'Weekly Pass' ? (
                <div className="text-gray-700 text-xs space-y-2" style={{ fontFamily: 'Poppins', lineHeight: '1.4' }}>
                  <p className="text-[#E7121B] font-semibold text-xs mb-1">Weekly Pass Notes</p>
                  <p className="text-xs"><span className="font-semibold">1.</span> The game account level must reach level 5 in order to purchase the weekly diamond pass.</p>
                  <p className="text-xs"><span className="font-semibold">2.</span> A maximum of 10 weekly diamond passes can be purchased within a 70-day period on the third-party platform (the 10-pass count includes passes purchased in-game). Please do not make additional purchases to avoid losses.</p>
                  <p className="text-xs"><span className="font-semibold">3.</span> You will receive 80 diamonds on the day of purchase, with the extra 20 diamonds being sent to your Vault, which you need to log in to in order to claim. Additionally, you must log in and access the weekly pass page for 6 consecutive days to claim a total of 120 extra diamonds, with 20 extra diamonds per day. During the 7 days, you will earn a total of 220 diamonds.</p>
                </div>
              ) : null}
            </div>
          )}

        {/* Bottom Spacing for Fixed Navigation */}
        <div className="h-15"></div>

        {/* Bottom Navigation */}
      </div>

      {/* Validation History Modal */}
      {showHistoryModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setShowHistoryModal(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl overflow-hidden"
              style={{ backgroundColor: '#FFFFFF' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Color Effect */}
              <div
                className="h-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(231, 18, 27, 0.15) 0%, transparent 100%)'
                }}
              />

              <div className="px-6 pb-6">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#E7121B] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 text-sm">Loading history...</p>
                    </div>
                  </div>
                ) : validationHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 text-sm font-medium">No validation history</p>
                    <p className="text-gray-500 text-xs mt-1">Your first validated profile will appear here</p>
                    <button
                      onClick={() => setShowHistoryModal(false)}
                      className="mt-6 w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #E7121B 0%, #C21011 100%)',
                        boxShadow: '0px 4px 4px 0px #00000040'
                      }}
                    >
                      Enter Manually
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(231, 18, 27, 0.1) 0%, rgba(194, 16, 17, 0.1) 100%)'
                        }}
                      >
                        <svg className="w-8 h-8 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-center font-bold text-xl text-[#010102] mb-2">Use Previous Validation?</h2>
                    <p className="text-center text-gray-600 text-sm mb-6">We found your last validation data. Would you like to use it?</p>

                    {/* Last Validation Info */}
                    <div
                      className="mb-6 p-4 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(231, 18, 27, 0.05) 0%, rgba(194, 16, 17, 0.05) 100%)',
                        border: '1px solid rgba(231, 18, 27, 0.1)'
                      }}
                    >
                      <p className="text-gray-500 text-xs mb-3 font-semibold">Last Validation:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Player Name:</span>
                          <span className="text-[#E7121B] font-bold text-sm">#{validationHistory[0].playerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Player ID:</span>
                          <span className="text-[#010102] font-mono text-sm">{validationHistory[0].playerId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Server:</span>
                          <span className="text-[#010102] font-mono text-sm">{validationHistory[0].server}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Yes, Use This */}
                      <button
                        onClick={() => handleSelectHistoryItem(validationHistory[0])}
                        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, #E7121B 0%, #C21011 100%)',
                          boxShadow: '0px 4px 8px rgba(231, 18, 27, 0.3)'
                        }}
                      >
                        Yes, Use This
                      </button>

                      {/* Choose from History */}
                      {validationHistory.length > 1 && (
                        <button
                          onClick={() => {
                            setShowHistoryModal(false);
                            setShowHistoryListModal(true);
                          }}
                          className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, #E7121B 0%, #C21011 100%)',
                            boxShadow: '0px 4px 4px 0px #00000040'
                          }}
                        >
                          Choose from History ({validationHistory.length})
                        </button>
                      )}

                      {/* No, Enter Manually */}
                      <button
                        onClick={() => setShowHistoryModal(false)}
                        className="w-full py-3.5 rounded-2xl text-gray-700 font-semibold text-sm transition-all hover:bg-gray-100 active:scale-95"
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(231, 18, 27, 0.1)'
                        }}
                      >
                        No, Enter Manually
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* History List Modal - Rendered independently */}
      {showHistoryListModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => {
            setShowHistoryListModal(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Color Effect */}
            <div
              className="h-10 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(231, 18, 27, 0.15) 0%, transparent 100%)'
              }}
            />

            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex items-center mb-6">
                <button
                  onClick={() => {
                    setShowHistoryListModal(false);
                    setShowHistoryModal(true);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="flex-1 text-center font-bold text-xl text-[#010102]">Previous Validations</h2>
                <div className="w-10"></div>
              </div>

              {/* History Items - Scrollable */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {validationHistory.map((historyItem, index) => (
                  <button
                    key={historyItem._id}
                    onClick={() => {
                      setShowHistoryListModal(false);
                      handleSelectHistoryItem(historyItem);
                    }}
                    className="w-full text-left p-4 rounded-2xl transition-all hover:shadow-lg active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, rgba(231, 18, 27, 0.05) 0%, rgba(194, 16, 17, 0.05) 100%)',
                      border: '1px solid rgba(231, 18, 27, 0.1)'
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Player Name:</span>
                        <span className="text-[#E7121B] font-bold text-sm">#{historyItem.playerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Player ID:</span>
                        <span className="text-[#010102] font-mono text-sm">{historyItem.playerId}</span>
                      </div>
                      {historyItem.server && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Server:</span>
                          <span className="text-[#010102] font-mono text-sm">{historyItem.server}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Popup */}
      {showCheckoutPopup && selectedPackData && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCheckoutPopup(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[60] overflow-y-auto"
            style={{
              animation: 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
              backgroundColor: '#F8F9FB',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              maxHeight: '92vh',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)'
            }}
          >
            {/* Red accent bar at top */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #E7121B 0%, #FF5A5F 100%)', borderTopLeftRadius: '28px', borderTopRightRadius: '28px' }} />

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: '40px', height: '4px', background: '#D1D5DB', borderRadius: '99px' }} />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center mb-5">
                <div style={{ width: '36px' }} />
                <h2 className="flex-1 text-center font-bold text-[#010102]" style={{ fontSize: '18px', fontFamily: 'Poppins', fontWeight: 700 }}>Checkout</h2>
                <button
                  onClick={() => setShowCheckoutPopup(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#F0F0F3',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <svg fill="none" stroke="#6B7280" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Summary Card */}
              <div className="mb-5" style={{
                background: 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)',
                borderRadius: '20px',
                padding: '16px 18px',
                boxShadow: '0 6px 24px rgba(231,18,27,0.28)'
              }}>
                <div className="flex items-center mb-3">
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.6)', marginRight: '8px'
                  }} />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Poppins', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order Summary</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedPackData.packLogo && (
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                        <Image src={selectedPackData.packLogo} alt="pack" width={44} height={44} style={{ width: '44px', height: '44px', objectFit: 'cover', color: 'transparent' }} />
                      </div>
                    )}
                    <div>
                      <p style={{ color: '#FFFFFF', fontFamily: 'Poppins', fontWeight: 700, fontSize: '15px', lineHeight: '1.2' }}>{selectedPackData.packDescription}</p>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins', fontWeight: 400, fontSize: '12px', marginTop: '2px' }}>{selectedPackData.gameName}</p>
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.18)',
                    borderRadius: '12px',
                    padding: '6px 14px',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <p style={{ color: '#FFFFFF', fontFamily: 'Poppins', fontWeight: 800, fontSize: '16px' }}>₹{selectedPackData.packAmount}</p>
                  </div>
                </div>
              </div>

              {/* Validated Player Info Card */}
              {validatedInfo && (
                <div className="mb-5" style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  border: '1.5px solid #E8F0E9',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span style={{ color: '#15803D', fontFamily: 'Poppins', fontWeight: 600, fontSize: '12px' }}>Player Verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <svg width="20" height="20" fill="none" stroke="#E7121B" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p style={{ color: '#010102', fontFamily: 'Poppins', fontWeight: 700, fontSize: '14px' }}>{validatedInfo.nickname}</p>
                      {validatedInfo.server && (
                        <p style={{ color: '#6B7280', fontFamily: 'Poppins', fontWeight: 400, fontSize: '12px', marginTop: '1px' }}>Server: {validatedInfo.server}</p>
                      )}
                    </div>
                    <div style={{
                      background: '#FEF2F2',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      border: '1px solid #FECACA'
                    }}>
                      <span style={{ color: '#E7121B', fontFamily: 'Poppins', fontWeight: 600, fontSize: '10px', letterSpacing: '0.05em' }}>VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Section */}
              <div className="mb-2">
                <p style={{ color: '#6B7280', fontFamily: 'Poppins', fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Choose Payment Method</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                  {/*Coins Option */}
                  <div
                    onClick={() => {
                      if (selectedPackData && walletBalance < selectedPackData.packAmount) {
                        toast.error(`Insufficient coins! You have ${walletBalance} coins but need ${selectedPackData.packAmount} coins for this pack.`);
                        return;
                      }
                      setSelectedPaymentMethod('zoro-coins');
                    }}
                    style={{
                      background: selectedPaymentMethod === 'zoro-coins'
                        ? 'linear-gradient(135deg, #FEF2F2 0%, #FFE4E4 100%)'
                        : '#FFFFFF',
                      borderRadius: '18px',
                      border: selectedPaymentMethod === 'zoro-coins' ? '2px solid #E7121B' : '1.5px solid #E5E7EB',
                      padding: '14px 16px',
                      cursor: selectedPackData && walletBalance < selectedPackData.packAmount ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedPaymentMethod === 'zoro-coins' ? '0 4px 16px rgba(231,18,27,0.14)' : '0 2px 8px rgba(0,0,0,0.05)',
                      opacity: selectedPackData && walletBalance < selectedPackData.packAmount ? 0.55 : 1
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio Circle */}
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        border: selectedPaymentMethod === 'zoro-coins' ? '2px solid #E7121B' : '2px solid #D1D5DB',
                        background: selectedPaymentMethod === 'zoro-coins' ? '#E7121B' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        {selectedPaymentMethod === 'zoro-coins' && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF' }} />
                        )}
                      </div>

                      {/* Coin Icon */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                        background: selectedPaymentMethod === 'zoro-coins' ? 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)' : '#F5F5F7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedPaymentMethod === 'zoro-coins' ? '0 4px 12px rgba(231,18,27,0.3)' : 'none'
                      }}>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill={selectedPaymentMethod === 'zoro-coins' ? '#FFFFFF' : '#E7121B'} />
                          <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill={selectedPaymentMethod === 'zoro-coins' ? '#E7121B' : 'white'} fontFamily="sans-serif">₮</text>
                        </svg>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <p style={{ color: '#010102', fontFamily: 'Poppins', fontWeight: 700, fontSize: '14px' }}>Coins</p>
                        <p style={{ color: selectedPackData && walletBalance < selectedPackData.packAmount ? '#EF4444' : '#6B7280', fontFamily: 'Poppins', fontWeight: 500, fontSize: '12px', marginTop: '1px' }}>
                          Balance: {walletBalance} coins
                          {selectedPackData && walletBalance < selectedPackData.packAmount && ' · Insufficient'}
                        </p>
                      </div>

                      {/* Badge */}
                      {walletBalance >= selectedPackData.packAmount && (
                        <div style={{
                          background: '#F0FFF4',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          border: '1px solid #A7F3D0',
                          flexShrink: 0
                        }}>
                          <span style={{ color: '#059669', fontFamily: 'Poppins', fontWeight: 600, fontSize: '10px' }}>Instant</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* UPI Option */}
                  <div
                    onClick={() => setSelectedPaymentMethod('upi')}
                    style={{
                      background: selectedPaymentMethod === 'upi'
                        ? 'linear-gradient(135deg, #FEF2F2 0%, #FFE4E4 100%)'
                        : '#FFFFFF',
                      borderRadius: '18px',
                      border: selectedPaymentMethod === 'upi' ? '2px solid #E7121B' : '1.5px solid #E5E7EB',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedPaymentMethod === 'upi' ? '0 4px 16px rgba(231,18,27,0.14)' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio Circle */}
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        border: selectedPaymentMethod === 'upi' ? '2px solid #E7121B' : '2px solid #D1D5DB',
                        background: selectedPaymentMethod === 'upi' ? '#E7121B' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        {selectedPaymentMethod === 'upi' && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF' }} />
                        )}
                      </div>

                      {/* UPI Logo */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                        background: selectedPaymentMethod === 'upi' ? 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)' : '#F5F5F7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedPaymentMethod === 'upi' ? '0 4px 12px rgba(231,18,27,0.3)' : 'none'
                      }}>
                        <Image src="/UPI_logo.svg.png" alt="UPI Logo" width={28} height={28} style={{
                          width: '28px', height: '28px', objectFit: 'contain', color: 'transparent',
                          filter: selectedPaymentMethod === 'upi' ? 'brightness(10)' : 'none'
                        }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <p style={{ color: '#010102', fontFamily: 'Poppins', fontWeight: 700, fontSize: '14px' }}>UPI</p>
                        <p style={{ color: '#6B7280', fontFamily: 'Poppins', fontWeight: 500, fontSize: '12px', marginTop: '1px' }}>GPay, PhonePe, Paytm & more</p>
                      </div>

                      {/* Badge */}
                      <div style={{
                        background: '#EFF6FF',
                        borderRadius: '8px',
                        padding: '3px 8px',
                        border: '1px solid #BFDBFE',
                        flexShrink: 0
                      }}>
                        <span style={{ color: '#2563EB', fontFamily: 'Poppins', fontWeight: 600, fontSize: '10px' }}>Secure</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Pay Securely Button */}
              <div style={{ marginTop: '20px', marginBottom: '8px' }}>
                <button
                  type="button"
                  disabled={isProcessingPayment || !selectedPaymentMethod}
                  onClick={async () => {
                    if (!selectedPaymentMethod) {
                      toast.error('Please select a payment method');
                      return;
                    }
                    if (selectedPaymentMethod === 'zoro-coins') {
                      if (!selectedPackData) { toast.error('No pack selected'); return; }
                      if (walletBalance < selectedPackData.packAmount) {
                        toast.error(`Insufficient coins! You have ${walletBalance} coins but need ${selectedPackData.packAmount} coins for this pack.`);
                        return;
                      }
                      await processWalletPayment();
                    } else if (selectedPaymentMethod === 'upi') {
                      await processUPIPayment();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    borderRadius: '18px',
                    background: !selectedPaymentMethod
                      ? '#D1D5DB'
                      : isProcessingPayment
                        ? 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)'
                        : 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)',
                    border: 'none',
                    color: !selectedPaymentMethod ? '#9CA3AF' : '#FFFFFF',
                    fontFamily: 'Poppins',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: isProcessingPayment || !selectedPaymentMethod ? 'not-allowed' : 'pointer',
                    boxShadow: !selectedPaymentMethod ? 'none' : '0 8px 24px rgba(231,18,27,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    opacity: isProcessingPayment ? 0.8 : 1
                  }}
                  aria-busy={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                      {!selectedPaymentMethod ? 'Select a Payment Method' : 'Pay Securely'}
                    </>
                  )}
                </button>

                {/* Security note */}
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'Poppins', fontSize: '11px', marginTop: '10px' }}>
                  🔒 100% secure & encrypted payment
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes catHintBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 25px rgba(251, 191, 36, 0.8), 0 0 15px rgba(239, 68, 68, 0.5);
            border-color: #fbbf24;
          }
          50% { 
            box-shadow: 0 0 35px rgba(251, 191, 36, 1), 0 0 25px rgba(239, 68, 68, 0.8);
            border-color: #f59e0b;
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
