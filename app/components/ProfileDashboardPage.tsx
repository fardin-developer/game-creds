'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiEdit2 } from 'react-icons/fi';
import { MdArrowBack } from 'react-icons/md';
import { useAppSelector } from '@/lib/hooks/redux';
import apiClient from '@/lib/api/axios';

interface ProfileDashboardPageProps {
  onNavigate?: (screen: string) => void;
}

export default function ProfileDashboardPage({ onNavigate }: ProfileDashboardPageProps = {}) {
  const router = useRouter();
  const { isAuthenticated, token } = useAppSelector((state: any) => state.auth);
  const [userData, setUserData] = useState<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    verified: boolean;
    walletBalance: number;
    role: string;
    profilePicture: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && (token || typeof window === 'undefined' || localStorage.getItem('authToken'))) {
      fetchUserData();
    } else if (!isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchUserData = async () => {
    try {
      if (!token) {
        onNavigate ? onNavigate('login') : router.push('/login');
        return;
      }
      const response = await apiClient.get('/user/me');
      const data = response.data;
      setUserData(data);
      setFormData({ fullName: data.name, email: data.email });
    } catch {
      onNavigate ? onNavigate('login') : router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setIsUploadingPicture(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) { onNavigate ? onNavigate('login') : router.push('/login'); return; }
      const fd = new FormData();
      fd.append('image', selectedImage);
      await apiClient.post('/user/profile-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSelectedImage(null);
      setImagePreview(null);
      fetchUserData();
    } catch { } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.fullName.trim()) return;
    setIsUpdating(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) { onNavigate ? onNavigate('login') : router.push('/login'); return; }
      await apiClient.put('/user/profile', { name: formData.fullName, email: formData.email });
      fetchUserData();
    } catch { } finally {
      setIsUpdating(false);
    }
  };

  // Not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <FiEdit2 className="w-10 h-10 text-[#E7121B]" />
        </div>
        <h2 className="text-gray-800 text-2xl font-bold mb-3 text-center">Login Required</h2>
        <p className="text-gray-500 text-center mb-8 max-w-xs">
          Please login to view and manage your profile details, wallet balance, and settings.
        </p>
        <button
          onClick={() => onNavigate ? onNavigate('login') : router.push('/login')}
          className="w-full max-w-[200px] py-3 rounded-xl font-bold text-white bg-[#E7121B] hover:bg-[#C21011] transition-all shadow-lg"
        >
          Login Now
        </button>
      </div>
    );
  }

  // Loading
  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E7121B] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = userData?.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-red-50 relative overflow-hidden pb-24">

      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,18,27,0.12) 0%, rgba(231,18,27,0) 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,18,27,0.10) 0%, rgba(231,18,27,0) 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-20px', width: '80px', height: '80px', background: 'rgba(231,18,27,0.06)', transform: 'rotate(45deg)', borderRadius: '10px' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-br from-[#E7121B] to-[#C21011] rounded-b-[40px] shadow-[0_10px_30px_rgba(231,18,27,0.3)] overflow-hidden">
        {/* Geometric accents */}
        <div className="absolute -right-10 -top-10 w-52 h-52 bg-white/10 rotate-45 rounded-2xl" />
        <div className="absolute right-10 bottom-5 w-32 h-32 border-2 border-white/10 rounded-full" />

        <div className="relative z-10 pt-12 pb-8 px-6 flex items-center gap-4">
          <button
            onClick={() => onNavigate ? onNavigate('home') : router.back()}
            className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <MdArrowBack size={20} />
          </button>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Your Account</p>
            <h1 className="text-white font-bold text-xl">Profile</h1>
          </div>
        </div>

        {/* Avatar floating section */}
        <div className="relative z-10 px-6 pb-10 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl border-2 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : userData?.profilePicture ? (
                <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className="text-white font-bold text-2xl">{initials}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-md">
              <FiEdit2 className="w-3 h-3 text-[#E7121B]" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{userData?.name || 'User'}</h2>
            <p className="text-white/70 text-sm">{userData?.phone ? `+91 ${userData.phone}` : userData?.email}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 mt-6 space-y-4">

        {/* Image upload confirmation */}
        {selectedImage && (
          <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm flex flex-col items-center gap-3">
            <img src={imagePreview!} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-red-100" />
            <div className="flex gap-3 w-full">
              <button
                onClick={handleImageUpload}
                disabled={isUploadingPicture}
                className="flex-1 py-2 rounded-xl bg-[#E7121B] text-white font-semibold text-sm hover:bg-[#C21011] transition-all disabled:opacity-50"
              >
                {isUploadingPicture ? 'Uploading...' : 'Upload Picture'}
              </button>
              <button
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="flex-1 py-2 rounded-xl border border-red-100 text-gray-500 font-semibold text-sm hover:bg-red-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Balance Card */}
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
              <p className="text-white font-bold text-2xl">{userData?.walletBalance || 0}</p>
            </div>
          </div>
          <div className="relative z-10 bg-white/20 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wider">
            coins
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Orders', path: 'orders',
              icon: <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            },
            {
              label: 'Top Up', path: '/',
              icon: <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            },
            {
              label: 'Support', path: 'contact',
              icon: <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate ? onNavigate(item.path) : router.push(`/${item.path}`)}
              className="bg-white border border-red-100 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:border-[#E7121B]/40 hover:shadow-md transition-all active:scale-95"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E7121B]" fill="currentColor" viewBox="0 0 20 20">
                  {item.icon}
                </svg>
              </div>
              <span className="text-gray-700 text-xs font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Edit Profile Card */}
        <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
          <h3 className="text-gray-800 font-bold text-base mb-4">Edit Profile</h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-fullname" className="block text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E7121B] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="profile-fullname"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-red-50 border border-red-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="block text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E7121B] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="profile-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-red-50 border border-red-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full py-3.5 bg-[#E7121B] hover:bg-[#C21011] text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : 'Update Profile'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
