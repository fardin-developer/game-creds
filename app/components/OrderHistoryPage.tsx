'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useAppSelector } from '@/lib/hooks/redux';
import apiClient from '@/lib/api/axios';

interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  _id: string;
}

interface Order {
  _id: string;
  userId: string;
  orderType: string;
  orderId: string;
  gameName?: string;
  amount: number;
  currency: string;
  status: string;
  manualOrder: boolean;
  paymentMethod: string;
  items: OrderItem[];
  description: string;
  nextStatusCheck: string;
  statusCheckCount: number;
  maxStatusChecks: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderHistoryResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface OrderHistoryPageProps {
  onNavigate?: (screen: string) => void;
}

interface LedgerTransaction {
  _id: string;
  userId: string;
  transactionType: 'credit' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  referenceType: string;
  description: string;
  status: string;
  createdBy: { _id: string; name: string; email: string };
  createdByType: string;
  isReversal: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  metadata?: any;
}

interface LedgerResponse {
  success: boolean;
  data: {
    transactions: LedgerTransaction[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: string;
  balanceBefore?: number;
  balanceAfter?: number;
  reference?: string;
  referenceType?: string;
}

interface TransactionResponse {
  _id: string;
  userId: string;
  orderId: string;
  amount: number;
  paymentNote: string;
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  redirectUrl: string;
  status: string;
  gatewayId: string;
  gatewayType: string;
  gatewayResponse: any;
  udf1: string;
  udf2: string;
  createdAt: string;
  updatedAt: string;
  gatewayOrderId?: string;
  payerUpi?: string;
  txnId?: string;
  utr?: string;
}

interface TransactionHistoryResponse {
  success: boolean;
  transactions: TransactionResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface PaymentTransaction {
  id: string;
  method: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  transactionId: string;
  orderId?: string;
  payerUpi?: string;
}

export default function OrderHistoryPage({ onNavigate }: OrderHistoryPageProps = {}) {
  const router = useRouter();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'orders' | 'wallet' | 'payment'>('orders');
  const [orderData, setOrderData] = useState<OrderHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!isAuthenticated);
  const [error, setError] = useState<string | null>(null);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedWalletTransaction, setSelectedWalletTransaction] = useState<WalletTransaction | null>(null);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [walletPagination, setWalletPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [paymentPagination, setPaymentPagination] = useState({ currentPage: 1, totalPages: 0, totalTransactions: 0, hasNextPage: false, hasPrevPage: false });
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const paymentDateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isAuthenticated && (token || typeof window === 'undefined' || localStorage.getItem('authToken'))) {
      fetchOrderHistory();
    }
  }, [currentPage, isAuthenticated, token]);

  useEffect(() => {
    if (activeTab === 'wallet' && isAuthenticated && token) fetchWalletTransactions();
  }, [activeTab, isAuthenticated, token, walletPagination.page]);

  useEffect(() => {
    if (activeTab === 'payment' && isAuthenticated && token) fetchPaymentHistory();
  }, [activeTab, isAuthenticated, token, paymentPagination.currentPage]);

  useEffect(() => {
    if (isAuthenticated) setIsLoading(false);
    else if (!isAuthenticated) setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && token) {
      if (user?.walletBalance !== undefined) setWalletBalance(user.walletBalance);
      const fetchBalance = async () => {
        try {
          const response = await apiClient.get('/user/me');
          if (response.data.data?.walletBalance !== undefined) setWalletBalance(response.data.data.walletBalance);
        } catch { }
      };
      fetchBalance();
    }
  }, [isAuthenticated, token, user]);

  useEffect(() => {
    if (showOrderDetails || showWalletDetails || showPaymentDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showOrderDetails, showWalletDetails, showPaymentDetails]);

  const fetchOrderHistory = async () => {
    try {
      if (!token) { setError('Authentication token not found'); return; }
      const queryParams = new URLSearchParams({ page: currentPage.toString(), limit: '10' });
      if (searchDate) queryParams.append('dateFrom', searchDate);
      if (searchOrderId) queryParams.append('orderId', searchOrderId);
      const response = await apiClient.get(`/order/history?${queryParams.toString()}`);
      setOrderData(response.data);
    } catch {
      setError('Failed to load order history');
    }
  };

  const fetchWalletTransactions = async () => {
    try {
      setIsLoadingWallet(true);
      if (!token) return;
      const now = new Date();
      const queryParams = new URLSearchParams({
        page: walletPagination.page.toString(),
        limit: walletPagination.limit.toString(),
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
      });
      const response = await apiClient.get(`/wallet/ledger?${queryParams.toString()}`);
      const data: LedgerResponse = response.data;
      if (data.success && data.data) {
        const transformed = data.data.transactions.map((tx) => ({
          id: tx._id, type: tx.transactionType, amount: tx.amount,
          description: tx.description, date: tx.createdAt, status: tx.status,
          balanceBefore: tx.balanceBefore, balanceAfter: tx.balanceAfter,
          reference: tx.reference, referenceType: tx.referenceType
        })) as WalletTransaction[];
        setWalletTransactions(transformed);
        setWalletPagination(data.data.pagination);
        if (transformed.length > 0 && transformed[0].balanceAfter) setWalletBalance(transformed[0].balanceAfter);
      }
    } catch { } finally { setIsLoadingWallet(false); }
  };

  const fetchPaymentHistory = async () => {
    try {
      setIsLoadingPayment(true);
      if (!token) return;
      const queryParams = new URLSearchParams({ page: paymentPagination.currentPage.toString(), limit: '10' });
      const response = await apiClient.get(`/transaction/history?${queryParams.toString()}`);
      const data: TransactionHistoryResponse = response.data;
      if (data.success && data.transactions) {
        const transformed = data.transactions.map((tx) => ({
          id: tx._id, method: tx.gatewayType.toUpperCase(), amount: tx.amount,
          description: tx.paymentNote, date: tx.createdAt, status: tx.status,
          transactionId: tx.txnId || tx.gatewayOrderId || tx._id,
          orderId: tx.orderId, payerUpi: tx.payerUpi
        })) as PaymentTransaction[];
        setPaymentTransactions(transformed);
        setPaymentPagination(data.pagination);
      }
    } catch { } finally { setIsLoadingPayment(false); }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  };

  const parseDescription = (description: string) => {
    try {
      const parsed = JSON.parse(description);
      return { playerId: parsed.playerId || 'N/A', server: parsed.server || 'N/A' };
    } catch {
      return { playerId: 'N/A', server: 'N/A' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': case 'success': return 'text-green-600';
      case 'pending': return 'text-amber-500';
      case 'failed': case 'cancelled': return 'text-[#E7121B]';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': case 'success': return 'bg-green-50 text-green-600 border-green-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'failed': case 'cancelled': return 'bg-red-50 text-[#E7121B] border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  // Loading
  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E7121B] mx-auto mb-4" />
          <p className="text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-gray-800 text-2xl font-bold mb-3 text-center">Login Required</h2>
        <p className="text-gray-500 text-center mb-8 max-w-xs">Please login to view your order history and wallet transactions.</p>
        <button
          onClick={() => onNavigate ? onNavigate('login') : router.push('/login')}
          className="w-full max-w-[200px] py-3 rounded-xl font-bold text-white bg-[#E7121B] hover:bg-[#C21011] transition-all shadow-lg"
        >Login Now</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <p className="text-[#E7121B] font-medium">{error}</p>
      </div>
    );
  }

  const tabs = [
    { key: 'orders', label: 'Orders' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'payment', label: 'Payments' },
  ] as const;

  return (
    <div className="min-h-screen bg-red-50 pb-24 relative overflow-hidden">

      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,18,27,0.10) 0%, rgba(231,18,27,0) 70%)' }} />
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'rgba(231,18,27,0.05)', transform: 'rotate(45deg)', borderRadius: '20px' }} />
      </div>

      {/* Red gradient header */}
      <div className="relative z-10 bg-gradient-to-br from-[#E7121B] to-[#C21011] rounded-b-[40px] shadow-[0_10px_30px_rgba(231,18,27,0.3)] overflow-hidden">
        <div className="absolute -right-10 -top-10 w-52 h-52 bg-white/10 rotate-45 rounded-2xl" />
        <div className="absolute right-10 bottom-5 w-32 h-32 border-2 border-white/10 rounded-full" />
        <div className="relative z-10 pt-12 pb-6 px-6 flex items-center gap-4">
          <button
            onClick={() => onNavigate ? onNavigate('home') : router.back()}
            className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <MdArrowBack size={20} />
          </button>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Your Activity</p>
            <h1 className="text-white font-bold text-xl">Order History</h1>
          </div>
          {orderData?.pagination && (
            <span className="text-white/70 text-xs">{orderData.pagination.totalOrders} orders</span>
          )}
        </div>

        {/* Tabs inside header */}
        <div className="relative z-10 px-6 pb-5">
          <div className="flex gap-2 bg-white/10 p-1 rounded-2xl backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.key
                  ? 'bg-white text-[#E7121B] shadow-sm'
                  : 'text-white/80 hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 mt-5 space-y-4">

        {/* Wallet Balance Card */}
        {activeTab === 'wallet' && (
          <div
            className="rounded-2xl p-4 flex items-center justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #E7121B 0%, #C21011 100%)', boxShadow: '0 8px 24px rgba(231,18,27,0.25)' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rotate-45 rounded-xl" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-white/20 p-2.5 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#FFFFFF" />
                  <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#E7121B" fontFamily="sans-serif">₮</text>
                </svg>
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium">Available Balance</p>
                <p className="text-white font-bold text-2xl">{walletBalance}</p>
              </div>
            </div>
            <div className="relative z-10 bg-white/20 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wider">coins</div>
          </div>
        )}

        {/* Search — Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by order ID..."
                className="flex-1 px-4 py-3 bg-white border border-red-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] text-sm transition-all"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
              />
              <button
                type="button"
                onClick={() => { setCurrentPage(1); fetchOrderHistory(); }}
                className="w-11 h-11 rounded-xl bg-[#E7121B] flex items-center justify-center text-white hover:bg-[#C21011] transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { try { (dateInputRef.current as any)?.showPicker?.() || dateInputRef.current?.focus(); } catch { dateInputRef.current?.focus(); } }}
                className="w-11 h-11 rounded-xl bg-white border border-red-100 flex items-center justify-center text-[#E7121B] hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                className="flex-1 px-4 py-3 bg-white border border-red-100 rounded-xl text-gray-800 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] text-sm transition-all"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
              <button
                type="button"
                onClick={() => { setCurrentPage(1); fetchOrderHistory(); }}
                className="px-4 py-3 rounded-xl bg-[#E7121B] text-white font-semibold text-sm hover:bg-[#C21011] transition-colors"
              >Search</button>
            </div>
          </div>
        )}

        {/* Search — Payments */}
        {activeTab === 'payment' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by transaction ID..."
                className="flex-1 px-4 py-3 bg-white border border-red-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] text-sm transition-all"
              />
              <button className="w-11 h-11 rounded-xl bg-[#E7121B] flex items-center justify-center text-white hover:bg-[#C21011] transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { try { (paymentDateInputRef.current as any)?.showPicker?.() || paymentDateInputRef.current?.focus(); } catch { paymentDateInputRef.current?.focus(); } }}
                className="w-11 h-11 rounded-xl bg-white border border-red-100 flex items-center justify-center text-[#E7121B] hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </button>
              <input ref={paymentDateInputRef} type="date"
                className="flex-1 px-4 py-3 bg-white border border-red-100 rounded-xl text-gray-800 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] text-sm transition-all" />
              <button className="px-4 py-3 rounded-xl bg-[#E7121B] text-white font-semibold text-sm hover:bg-[#C21011] transition-colors">Search</button>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orderData?.orders?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">No orders found</p>
                <p className="text-gray-400 text-sm mt-1">You haven't placed any orders yet</p>
              </div>
            ) : (
              orderData?.orders?.map((order) => {
                const orderItem = order.items[0];
                return (
                  <div
                    key={order._id}
                    className="bg-white border border-red-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                    onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-800 font-semibold text-sm truncate">{orderItem?.itemName || order.gameName || 'Order'}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${getStatusBg(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-500 text-xs">
                            {order.paymentMethod === 'wallet' ? '💳 Wallet' : order.paymentMethod === 'upi' ? '📱 UPI' : order.paymentMethod?.toUpperCase()}
                          </span>
                          <span className="text-[#E7121B] font-bold text-sm">₹{order.amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── WALLET TAB ── */}
        {activeTab === 'wallet' && (
          <div className="space-y-3">
            {isLoadingWallet ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E7121B] mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading transactions...</p>
              </div>
            ) : walletTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">No transactions found</p>
                <p className="text-gray-400 text-sm mt-1">No wallet activity this month</p>
              </div>
            ) : (
              walletTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white border border-red-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                  onClick={() => { setSelectedWalletTransaction(tx); setShowWalletDetails(true); }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'credit' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                      {tx.type === 'credit' ? (
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-[#E7121B]'}`}>
                          {tx.type === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                        <span className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-[#E7121B]'}`}>
                          {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs truncate">{tx.description}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── PAYMENT TAB ── */}
        {activeTab === 'payment' && (
          <div className="space-y-3">
            {isLoadingPayment ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E7121B] mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading payments...</p>
              </div>
            ) : paymentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">No payments found</p>
                <p className="text-gray-400 text-sm mt-1">You haven't made any payments yet</p>
              </div>
            ) : (
              paymentTransactions.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white border border-red-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                  onClick={() => { setSelectedPayment(payment); setShowPaymentDetails(true); }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-800 font-semibold text-sm truncate">{payment.description || payment.method}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${getStatusBg(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">{formatDate(payment.date)}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-xs truncate">{payment.transactionId}</span>
                        <span className="text-[#E7121B] font-bold text-sm ml-2">₹{payment.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── ORDER DETAILS POPUP ── */}
      {showOrderDetails && selectedOrder && (() => {
        const desc = parseDescription(selectedOrder.description);
        const rows = [
          { label: 'Order Date', value: formatDate(selectedOrder.createdAt), color: 'text-gray-800' },
          { label: 'Order ID', value: selectedOrder.orderId, color: 'text-[#E7121B]' },
          { label: 'Product', value: selectedOrder.items[0]?.itemName || 'N/A', color: 'text-gray-800' },
          { label: 'Game', value: selectedOrder.gameName || 'N/A', color: 'text-gray-800' },
          { label: 'Price', value: `₹${selectedOrder.amount} ${selectedOrder.currency}`, color: 'text-[#E7121B] font-bold' },
          { label: 'Payment', value: selectedOrder.paymentMethod === 'upi' ? 'UPI' : selectedOrder.paymentMethod === 'wallet' ? 'Wallet' : selectedOrder.paymentMethod?.toUpperCase() || 'N/A', color: 'text-gray-800' },
          { label: 'User ID', value: desc.playerId, color: 'text-[#E7121B]' },
          { label: 'Zone ID', value: desc.server, color: 'text-gray-800' },
          { label: 'Status', value: selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1), color: getStatusColor(selectedOrder.status) + ' font-bold' },
        ];
        return (
          <>
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm" onClick={() => setShowOrderDetails(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl bg-white max-h-[80vh] overflow-y-auto shadow-2xl" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <div className="sticky top-0 bg-white border-b border-red-100 px-5 py-4 flex items-center">
                <button onClick={() => setShowOrderDetails(false)} className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#E7121B]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="flex-1 text-center font-bold text-gray-800">Order Details</h2>
                <div className="w-8" />
              </div>
              <div className="p-5 space-y-3">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between py-2 border-b border-red-50 last:border-0">
                    <span className="text-gray-500 text-sm flex-shrink-0 w-28">{row.label}</span>
                    <span className={`text-sm text-right flex-1 ml-4 ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })()}

      {/* ── WALLET DETAILS POPUP ── */}
      {showWalletDetails && selectedWalletTransaction && (() => {
        const tx = selectedWalletTransaction;
        const rows = [
          { label: 'Date', value: formatDate(tx.date), color: 'text-gray-800' },
          { label: 'Transaction ID', value: tx.id, color: 'text-[#E7121B]' },
          { label: 'Type', value: tx.type.charAt(0).toUpperCase() + tx.type.slice(1), color: tx.type === 'credit' ? 'text-green-600 font-bold' : 'text-[#E7121B] font-bold' },
          { label: 'Description', value: tx.description, color: 'text-gray-800' },
          { label: 'Amount', value: `${tx.type === 'credit' ? '+' : '-'}₹${tx.amount}`, color: tx.type === 'credit' ? 'text-green-600 font-bold' : 'text-[#E7121B] font-bold' },
          { label: 'Status', value: tx.status.charAt(0).toUpperCase() + tx.status.slice(1), color: getStatusColor(tx.status) + ' font-bold' },
        ];
        return (
          <>
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm" onClick={() => setShowWalletDetails(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl bg-white max-h-[80vh] overflow-y-auto shadow-2xl" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <div className="sticky top-0 bg-white border-b border-red-100 px-5 py-4 flex items-center">
                <button onClick={() => setShowWalletDetails(false)} className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#E7121B]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="flex-1 text-center font-bold text-gray-800">Transaction Details</h2>
                <div className="w-8" />
              </div>
              <div className="p-5 space-y-3">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between py-2 border-b border-red-50 last:border-0">
                    <span className="text-gray-500 text-sm flex-shrink-0 w-28">{row.label}</span>
                    <span className={`text-sm text-right flex-1 ml-4 break-all ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })()}

      {/* ── PAYMENT DETAILS POPUP ── */}
      {showPaymentDetails && selectedPayment && (() => {
        const p = selectedPayment;
        const rows = [
          { label: 'Date', value: formatDate(p.date), color: 'text-gray-800' },
          { label: 'Transaction ID', value: p.transactionId, color: 'text-[#E7121B]' },
          { label: 'Method', value: p.method, color: 'text-gray-800' },
          { label: 'Description', value: p.description, color: 'text-gray-800' },
          { label: 'Amount', value: `₹${p.amount} INR`, color: 'text-[#E7121B] font-bold' },
          { label: 'Status', value: p.status.charAt(0).toUpperCase() + p.status.slice(1), color: getStatusColor(p.status) + ' font-bold' },
          ...(p.orderId ? [{ label: 'Order ID', value: p.orderId, color: 'text-[#E7121B]' }] : []),
          ...(p.payerUpi ? [{ label: 'Payer UPI', value: p.payerUpi, color: 'text-gray-800' }] : []),
        ];
        return (
          <>
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm" onClick={() => setShowPaymentDetails(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl bg-white max-h-[80vh] overflow-y-auto shadow-2xl" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <div className="sticky top-0 bg-white border-b border-red-100 px-5 py-4 flex items-center">
                <button onClick={() => setShowPaymentDetails(false)} className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#E7121B]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="flex-1 text-center font-bold text-gray-800">Payment Details</h2>
                <div className="w-8" />
              </div>
              <div className="p-5 space-y-3">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between py-2 border-b border-red-50 last:border-0">
                    <span className="text-gray-500 text-sm flex-shrink-0 w-28">{row.label}</span>
                    <span className={`text-sm text-right flex-1 ml-4 break-all ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })()}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
