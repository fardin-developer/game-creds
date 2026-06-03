'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MdArrowBack } from 'react-icons/md';
import { useAppSelector } from '@/lib/hooks/redux';
import apiClient from '@/lib/api/axios';

interface LeaderboardPlayer {
  _id: string;
  totalPurchaseAmount: number;
  purchaseCount: number;
  name: string;
  email: string;
  avatar?: string | null;
}

interface WalletAdder {
  _id: string;
  totalWalletAdded: number;
  walletAddCount: number;
  name: string;
  email: string;
  avatar?: string | null;
}

interface PeriodData {
  period: string;
  leaderboard: LeaderboardPlayer[];
  walletAdders: WalletAdder[];
}

interface LeaderboardData {
  currentPeriod: PeriodData;
  lastPeriod: PeriodData;
  filters: { eventDate: null; startDate: null; endDate: null };
}

interface LeaderboardPageProps {
  onNavigate?: (screen: string) => void;
}

const MEDAL = {
  0: { color: '#FFD700', shadow: 'rgba(255,215,0,0.4)', bg: 'rgba(255,215,0,0.12)', label: '1st', emoji: '🥇', height: 90 },
  1: { color: '#C0C0C0', shadow: 'rgba(192,192,192,0.3)', bg: 'rgba(192,192,192,0.10)', label: '2nd', emoji: '🥈', height: 70 },
  2: { color: '#CD7F32', shadow: 'rgba(205,127,50,0.3)', bg: 'rgba(205,127,50,0.10)', label: '3rd', emoji: '🥉', height: 55 },
} as const;

function Avatar({ avatar, name, size = 72, borderColor = '#E7121B' }: { avatar?: string | null; name: string; size?: number; borderColor?: string }) {
  const initials = name?.charAt(0)?.toUpperCase() || '?';
  if (avatar) {
    return (
      <Image
        src={avatar} alt={name} width={size} height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size, border: `3px solid ${borderColor}`, boxShadow: `0 0 16px ${borderColor}50` }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white"
      style={{ width: size, height: size, border: `3px solid ${borderColor}`, background: `linear-gradient(135deg, ${borderColor} 0%, ${borderColor}99 100%)`, boxShadow: `0 0 16px ${borderColor}40`, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function LeaderboardPage({ onNavigate }: LeaderboardPageProps = {}) {
  const router = useRouter();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'last'>('current');

  useEffect(() => {
    if (isAuthenticated && (token || typeof window === 'undefined' || localStorage.getItem('authToken'))) {
      fetchLeaderboardData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchLeaderboardData = async () => {
    try {
      const response = await apiClient.get('/user/leaderboard');
      setLeaderboardData(response.data);
    } catch {
      setError('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const activePeriod = activeTab === 'current' ? leaderboardData?.currentPeriod : leaderboardData?.lastPeriod;
  const topThree = activePeriod?.leaderboard?.slice(0, 3) || [];
  const restPlayers = activePeriod?.leaderboard?.slice(3, 10) || [];

  // Reorder top 3 for podium: [2nd, 1st, 3rd]
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];
  const podiumRanks = [1, 0, 2] as const;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E7121B] mx-auto mb-4" />
          <p className="text-gray-500">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-[#E7121B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h2 className="text-gray-800 text-2xl font-bold mb-3 text-center">Login Required</h2>
        <p className="text-gray-500 text-center mb-8 max-w-xs">Login to see global rankings and where you stand.</p>
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

  return (
    <div className="min-h-screen bg-red-50 pb-28 relative overflow-hidden">

      {/* Subtle background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,18,27,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,18,27,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* ── HERO HEADER ── */}
      <div className="relative z-10 bg-gradient-to-br from-[#E7121B] to-[#8B0000] overflow-hidden" style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
        {/* Deco */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rotate-45 rounded-3xl" />
        <div className="absolute right-6 bottom-6 w-40 h-40 border border-white/10 rounded-full" />
        <div className="absolute right-20 bottom-20 w-20 h-20 border border-white/10 rounded-full" />
        <div className="absolute -left-10 top-10 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 pt-12 pb-5 px-6 flex items-center gap-3">
          <button
            onClick={() => onNavigate ? onNavigate('home') : router.back()}
            className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <MdArrowBack size={20} />
          </button>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Community</p>
            <h1 className="text-white font-bold text-xl">Leaderboard</h1>
          </div>
          <span className="text-3xl">🏆</span>
        </div>

        {/* Period tabs */}
        <div className="relative z-10 px-6 pb-6">
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm p-1 rounded-2xl">
            {(['current', 'last'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-white text-[#E7121B] shadow-sm' : 'text-white/80 hover:text-white'}`}
              >
                {tab === 'current' ? (leaderboardData?.currentPeriod?.period || 'This Period') : (leaderboardData?.lastPeriod?.period || 'Last Period')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PODIUM ── */}
      <div className="relative z-10 px-4 mt-8 mb-6">
        <div className="flex items-end justify-center gap-3">
          {podiumOrder.map((player, i) => {
            const rank = podiumRanks[i];
            const medal = MEDAL[rank];
            const isWinner = rank === 0;
            const podiumHeights = [70, 90, 55]; // 2nd, 1st, 3rd bar heights

            return (
              <div key={rank} className={`flex flex-col items-center ${isWinner ? 'scale-105 z-10' : ''}`} style={{ flex: isWinner ? '1.1' : '1' }}>
                {/* Crown for 1st */}
                {isWinner && <div className="text-2xl mb-1 animate-bounce">👑</div>}

                {/* Avatar with glow ring */}
                <div className="relative mb-2">
                  {isWinner && (
                    <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `radial-gradient(circle, ${medal.color}40 0%, transparent 70%)`, transform: 'scale(1.4)' }} />
                  )}
                  <Avatar
                    avatar={player?.avatar}
                    name={player?.name || '—'}
                    size={isWinner ? 72 : 58}
                    borderColor={medal.color}
                  />
                  {/* Rank badge */}
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                    style={{ background: medal.color, fontSize: 10 }}
                  >
                    {rank + 1}
                  </div>
                </div>

                {/* Name */}
                <p className="text-gray-800 font-bold text-xs text-center truncate w-full px-1 mb-1">
                  {player?.name || '—'}
                </p>

                {/* Amount pill */}
                <div
                  className="text-xs font-bold px-2.5 py-1 rounded-full mb-2 whitespace-nowrap"
                  style={{ background: medal.bg, color: medal.color, border: `1.5px solid ${medal.color}`, boxShadow: `0 2px 8px ${medal.shadow}` }}
                >
                  ₹{player?.totalPurchaseAmount?.toLocaleString() || '0'}
                </div>

                {/* Podium block */}
                <div
                  className="w-full rounded-t-2xl flex items-center justify-center"
                  style={{
                    height: podiumHeights[i],
                    background: `linear-gradient(180deg, ${medal.color}30 0%, ${medal.color}10 100%)`,
                    border: `1.5px solid ${medal.color}50`,
                    borderBottom: 'none',
                  }}
                >
                  <span className="text-2xl">{medal.emoji}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Podium base */}
        <div className="h-3 bg-gradient-to-r from-red-100 via-red-200 to-red-100 rounded-b-2xl mx-0 shadow-inner" />
      </div>

      {/* ── RANKED LIST (#4 onward) ── */}
      <div className="relative z-10 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-800 font-bold text-base">Top Rankings</h2>
          <span className="text-xs text-gray-400 font-medium">Ranks 4–10</span>
        </div>

        {restPlayers.length === 0 ? (
          <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">No other players yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {restPlayers.map((player, i) => {
              const rank = i + 4;
              // Color progression: gets lighter as rank increases
              const opacity = Math.max(0.3, 1 - i * 0.1);
              return (
                <div
                  key={player._id}
                  className="bg-white border border-red-100 rounded-2xl p-3.5 flex items-center gap-3 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  {/* Rank number */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: `rgba(231,18,27,${opacity * 0.1})`, color: `rgba(231,18,27,${opacity})`, border: `1.5px solid rgba(231,18,27,${opacity * 0.3})` }}
                  >
                    #{rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-red-50 border-2 border-red-100 flex items-center justify-center">
                    {player.avatar ? (
                      <Image src={player.avatar} alt={player.name} width={40} height={40} className="w-10 h-10 object-cover" />
                    ) : (
                      <span className="text-[#E7121B] font-bold text-sm">{player.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    )}
                  </div>

                  {/* Name + purchases */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-semibold text-sm truncate">{player.name}</p>
                    <p className="text-gray-400 text-xs">{player.purchaseCount} order{player.purchaseCount !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Amount */}
                  <div className="flex-shrink-0">
                    <span className="text-[#E7121B] font-bold text-sm">₹{player.totalPurchaseAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── WALLET ADDERS SECTION ── */}
      {activePeriod?.walletAdders && activePeriod.walletAdders.length > 0 && (
        <div className="relative z-10 px-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💰</span>
            <h2 className="text-gray-800 font-bold text-base">Top Wallet Adders</h2>
          </div>
          <div className="space-y-2.5">
            {activePeriod.walletAdders.slice(0, 5).map((wa, i) => (
              <div key={wa._id} className="bg-white border border-red-100 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-sm font-bold text-amber-600 flex-shrink-0">
                  #{i + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-sm">{wa.name?.charAt(0)?.toUpperCase() || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-semibold text-sm truncate">{wa.name}</p>
                  <p className="text-gray-400 text-xs">{wa.walletAddCount} top-up{wa.walletAddCount !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-amber-600 font-bold text-sm flex-shrink-0">₹{wa.totalWalletAdded.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
