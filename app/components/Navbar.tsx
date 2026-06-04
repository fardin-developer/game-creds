'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { MdPerson, MdLogout } from 'react-icons/md';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { logout } from '@/lib/store/authSlice';
import AddBalanceModal from './AddBalanceModal';

interface NavbarProps {
    onMenuToggle: () => void;
    onNavigate?: (screen: string) => void;
    walletBalance?: number;
}

const NAV_THEME = {
    primary: '#E7121B',
    primaryDark: '#C21011',
    surface: '#FFFFFF',
    surfaceSoft: '#EFEBF0',
    text: '#010102',
};

export default function Navbar({ onMenuToggle, onNavigate, walletBalance }: NavbarProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const menuRef = useRef<HTMLDivElement>(null);

    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Get wallet balance from Redux user state, fallback to prop, then to 0
    const displayWalletBalance = user?.walletBalance ?? walletBalance ?? 0;

    // Click-outside listener to close profile menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        setIsProfileMenuOpen(false);
        if (onNavigate) {
            onNavigate('profile');
        } else {
            router.push('/profile');
        }
    };

    return (
        <>
            <nav
                className="mx-4 md:mx-6 lg:mx-8 relative z-50 mt-4 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-100 shadow-sm"
                style={
                    {
                        '--nav-primary': NAV_THEME.primary,
                        '--nav-primary-dark': NAV_THEME.primaryDark,
                        '--nav-surface': NAV_THEME.surface,
                        '--nav-surface-soft': NAV_THEME.surfaceSoft,
                        '--nav-text': NAV_THEME.text,
                    } as Record<string, string>
                }
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 ml-1">
                            <Image
                                src="/logo9.png"
                                alt="Logo"
                                width={150}
                                height={150}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Wallet Balance - Only for authenticated users */}
                        {isAuthenticated && (
                            <button
                                onClick={() => setIsAddBalanceModalOpen(true)}
                                className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                {/* Red coin icon */}
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#E7121B" />
                                    <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="sans-serif">₮</text>
                                </svg>
                                <span className="font-bold text-gray-800 text-xs tracking-wide">{displayWalletBalance}</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>
            <AddBalanceModal
                isOpen={isAddBalanceModalOpen}
                onClose={() => setIsAddBalanceModalOpen(false)}
                currentBalance={displayWalletBalance}
            />
        </>
    );
}
