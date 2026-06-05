'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaWhatsapp } from 'react-icons/fa';
import apiClient from '@/lib/api/axios';

interface Banner {
    _id: string;
    title: string;
    url: string;
    image: string;
    type: 'primary banner' | 'secondary banner';
    priority: number;
    createdAt: string;
}

export default function WelcomeBanner() {
    const { user } = useAppSelector((state) => state.auth);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [primaryBanners, setPrimaryBanners] = useState<Banner[]>([]);
    const [secondaryBanners, setSecondaryBanners] = useState<Banner[]>([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        // Auto-scroll banners every 4 seconds
        if (primaryBanners.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentBannerIndex((prev) =>
                    prev === primaryBanners.length - 1 ? 0 : prev + 1
                );
            }, 4000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [primaryBanners.length]);

    const fetchBanners = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/banners/public/banners');
            if (response.data.success) {
                const allBanners = response.data.data;
                setBanners(allBanners);

                // Sort by priority and separate by type
                const primary = allBanners
                    .filter((b: Banner) => b.type === 'primary banner')
                    .sort((a: Banner, b: Banner) => a.priority - b.priority);
                const secondary = allBanners
                    .filter((b: Banner) => b.type === 'secondary banner')
                    .sort((a: Banner, b: Banner) => a.priority - b.priority);

                setPrimaryBanners(primary);
                setSecondaryBanners(secondary);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBannerClick = (url: string) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const goToSlide = (index: number) => {
        setCurrentBannerIndex(index);
        // Reset auto-scroll timer
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                setCurrentBannerIndex((prev) =>
                    prev === primaryBanners.length - 1 ? 0 : prev + 1
                );
            }, 4000);
        }
    };

    return (
        <div className="px-4 md:px-6 lg:px-8 relative z-10 mb-3">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 relative mt-2">
                <div className="flex flex-col p-1">
                    <h1 className="text-gray-900 font-bold text-xl md:text-2xl tracking-tight">
                        GG, <span className="text-[var(--color-primary)] font-semibold">{user?.name || 'Guest'}</span>! ⚡
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5">Let&apos;s get you topped up and ready to dominate.</p>
                </div>
            </div>

            {/* Primary Banners Carousel */}
            {!isLoading && primaryBanners.length > 0 && (
                <div className="mb-4 group relative">
                    <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] border border-gray-100">
                        {/* Banner Image */}
                        <div
                            className="relative w-full aspect-[21/9] md:aspect-[21/7] cursor-pointer"
                            onClick={() => handleBannerClick(primaryBanners[currentBannerIndex].url)}
                        >
                            <Image
                                src={primaryBanners[currentBannerIndex].image}
                                alt={primaryBanners[currentBannerIndex].title || 'Banner'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                                priority
                            />
                            {/* Gradient Overlay for Text Readability (Optional) */}
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        </div>

                        {/* Navigation Dots */}
                        {primaryBanners.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {primaryBanners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent banner click
                                            goToSlide(index);
                                        }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentBannerIndex
                                            ? 'w-6 bg-white'
                                            : 'w-1.5 bg-white/40 hover:bg-white/60'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Secondary Banners Grid */}
            {!isLoading && secondaryBanners.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {secondaryBanners.map((banner) => (
                        <div
                            key={banner._id}
                            className="relative w-full aspect-[21/9] md:aspect-[16/7] rounded-xl overflow-hidden cursor-pointer group shadow-[0_8px_20px_rgba(0,0,0,0.08)] border-2 border-white bg-[var(--color-secondary-soft)] hover:border-[#E7121B] transition-all"
                            onClick={() => handleBannerClick(banner.url)}
                        >
                            <Image
                                src={banner.image}
                                alt={banner.title || 'Secondary Banner'}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                    ))}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="w-full aspect-[21/9] md:aspect-[21/7] bg-[var(--color-secondary-soft)] animate-pulse rounded-2xl" />
            )}
        </div>
    );
}
