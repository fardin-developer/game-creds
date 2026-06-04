'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LuPlus, LuAward, LuCreditCard, LuChartBar } from 'react-icons/lu';
import { FaWhatsapp, FaYoutube, FaInstagram, FaFacebook } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { initializeAuth } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';
import SideMenu from './SideMenu';
import AuthChecker from './AuthChecker';
import Navbar from './Navbar';
import WelcomeBanner from './WelcomeBanner';

interface DashboardPageProps {
  onNavigate?: (screen: string) => void;
}

const HOME_THEME = {
  primary: '#E7121B',
  primaryDark: '#C21011',
  secondary: '#FFFFFF',
  secondarySoft: '#EFEBF0',
  text: '#010102',
};

export default function DashboardPage({ onNavigate }: DashboardPageProps = {}) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize auth
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    fetchGames();
  }, []);



  const fetchGames = async () => {
    try {
      setGamesLoading(true);
      const response = await apiClient.get('/games/get-all');
      if (response.data.success) setGames(response.data.games);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setGamesLoading(false);
    }
  };

  const dashboardContent = (
    <div
      className="min-h-screen relative p-0 m-0 bg-[var(--color-secondary-soft)] text-[var(--color-text)] overflow-x-hidden pb-20"
      style={
        {
          '--color-primary': HOME_THEME.primary,
          '--color-primary-dark': HOME_THEME.primaryDark,
          '--color-secondary': HOME_THEME.secondary,
          '--color-secondary-soft': HOME_THEME.secondarySoft,
          '--color-text': HOME_THEME.text,
        } as Record<string, string>
      }
    >
      {/* Minimal clean header accent instead of a heavy red block */}
      <div className="absolute top-0 left-0 right-0 bg-[var(--color-primary)] z-0" />
      <div className="absolute top-0 left-0 right-0 h-[250px] bg-gradient-to-b from-[#E7121B]/[0.03] to-transparent z-0 pointer-events-none" />

      <div className="w-full relative z-10 pt-2">
        {/* Navbar Component */}
        <Navbar
          onMenuToggle={() => setIsMenuOpen(true)}
          onNavigate={onNavigate}
          walletBalance={dashboardData?.walletBalance ?? 0}
        />

        {/* Welcome Banner Component */}
        <WelcomeBanner />

        {/* Action Icons */}
        <div className="w-11/12 mx-auto relative z-20 mb-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 p-4">
            <div className="flex justify-between items-center px-1">
              <ActionIconButton
                icon={<LuPlus />}
                label="Add Money"
                onClick={() => onNavigate ? onNavigate('addcoin') : router.push('/addcoin')}
              />
              <ActionIconButton
                icon={<LuCreditCard />}
                label="Payments"
                onClick={() => onNavigate ? onNavigate('payments') : router.push('/payments')}
              />
              <ActionIconButton
                icon={<LuChartBar />}
                label="Leaderboard"
                onClick={() => onNavigate ? onNavigate('leaderboard') : router.push('/leaderboard')}
              />
              <ActionIconButton
                icon={<LuAward />}
                label="Reward Points"
                onClick={() => onNavigate ? onNavigate('rewards') : router.push('/rewards')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trending Games Section */}
      <div className="px-5 py-8 relative w-11/12 mx-auto mb-16 rounded-[2rem] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-gray-100">

        {/* Games Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6 relative z-10">
          {gamesLoading ? (
            Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-sm bg-[var(--color-secondary-soft)] mb-3 relative">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))
          ) : (
            games.map((game) => (
              <div
                key={game._id}
                className="flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 group"
                onClick={() => onNavigate ? onNavigate(`topup/${game._id}`) : router.push(`/topup/${game._id}`)}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[var(--color-primary)] shadow-[0_4px_12px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_20px_rgba(231,18,27,0.2)] bg-white mb-2 transition-all">
                  <Image
                    src={game.image}
                    alt={game.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-[var(--color-text)] text-[11px] md:text-sm font leading-tight text-center line-clamp-2 max-w-[5.5rem] md:max-w-[6.5rem] mt-1 group-hover:text-[var(--color-primary)] transition-colors">
                  {game.name}
                </h3>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-11/12 mx-auto bg-white pt-8 pb-8 px-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-gray-100 mt-2 mb-8 relative overflow-hidden">
        {/* Subtle Theme Accent at Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] opacity-80"></div>

        <div className="max-w-md mx-auto flex flex-col items-center relative z-10">
          
          <div className="mb-6 flex flex-col items-center">
             <h2 className="text-gray-800 text-xl font-black tracking-wider uppercase drop-shadow-sm">Zoro Topup</h2>
             <div className="w-10 h-1 bg-[var(--color-primary)] rounded-full mt-2 opacity-80"></div>
          </div>

          {/* Policy Links */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mb-6 w-full">
            <button onClick={() => router.push('/refund-policy')} className="text-gray-500 text-[11px] font-bold hover:text-[var(--color-primary)] transition-colors">
              Refund Policy
            </button>
            <button onClick={() => router.push('/terms')} className="text-gray-500 text-[11px] font-bold hover:text-[var(--color-primary)] transition-colors">
              Terms & Conditions
            </button>
            <button onClick={() => router.push('/privacy')} className="text-gray-500 text-[11px] font-bold hover:text-[var(--color-primary)] transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => router.push('/reward-policy')} className="text-gray-500 text-[11px] font-bold hover:text-[var(--color-primary)] transition-colors">
              Reward Policy
            </button>
          </div>

          <div className="w-full h-px bg-gray-100 mb-6" />

          {/* Social Links */}
          <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Connect With Us</h4>
          <div className="flex gap-4 mb-6">
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#25D366] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(37,211,102,0.3)] transition-all duration-300">
              <FaWhatsapp className="text-lg" />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(225,48,108,0.3)] transition-all duration-300">
              <FaInstagram className="text-lg" />
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(24,119,242,0.3)] transition-all duration-300">
              <FaFacebook className="text-lg" />
            </a>
            <a href="https://youtube.com/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#FF0000] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(255,0,0,0.3)] transition-all duration-300">
              <FaYoutube className="text-lg" />
            </a>
          </div>

          <p className="text-gray-400 text-[10px] text-center font-medium tracking-wide">
            © {new Date().getFullYear()} Zoro Topup. All rights reserved.
          </p>
        </div>
      </div>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={onNavigate} />
    </div>
  );

  return <AuthChecker>{dashboardContent}</AuthChecker>;
}

function ActionIconButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <div className="flex flex-col items-center cursor-pointer group" onClick={onClick}>
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-gray-50 text-[var(--color-primary)] text-lg border border-gray-100 group-hover:bg-[var(--color-primary)] group-hover:text-white group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-200 ease-out">
        <span className="flex items-center justify-center">{icon}</span>
      </div>
      <span className="text-gray-500 text-[11px] mt-1.5 font-bold tracking-wide group-hover:text-[var(--color-primary)] transition-colors duration-200">{label}</span>
    </div>
  );
}