'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { MdArrowBack } from 'react-icons/md';
import apiClient from '@/lib/api/axios';
import {
  FaNewspaper,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaBullhorn,
  FaInfoCircle,
  FaWrench,
  FaStar,
  FaFire,
} from 'react-icons/fa';

// --- Interfaces ---
interface Author { _id: string; name: string; email: string; }
interface NewsItem {
  _id: string;
  title: string;
  content: string;
  summary: string;
  image?: string;
  category: 'general' | 'announcement' | 'update' | 'maintenance' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  tags: string[];
  author: Author;
  expiresAt: string;
  isPinned: boolean;
  viewCount: number;
  contentType: 'html' | 'text';
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
interface NewsResponse {
  success: boolean;
  message: string;
  data: {
    news: NewsItem[];
    pagination: { currentPage: number; totalPages: number; totalNews: number; hasNextPage: boolean; hasPrevPage: boolean; limit: number; };
  };
}
interface NewsPageProps { onNavigate?: (screen: string) => void; }

// --- Helpers ---
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; }> = {
  announcement: { icon: <FaBullhorn />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  update:       { icon: <FaInfoCircle />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  maintenance:  { icon: <FaWrench />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  promotion:    { icon: <FaStar />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  general:      { icon: <FaNewspaper />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; }> = {
  urgent: { label: 'Urgent', color: 'text-[#E7121B]', bg: 'bg-red-50', border: 'border-red-200' },
  high:   { label: 'High',   color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium: { label: 'Med',    color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  low:    { label: 'Low',    color: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200' },
};

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));

const CATEGORIES = ['All', 'General', 'Announcement', 'Update', 'Maintenance', 'Promotion'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Urgent'];

// --- Main Component ---
export default function NewsPage({ onNavigate }: NewsPageProps = {}) {
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/news/list?page=1&limit=50');
      const data: NewsResponse = response.data;
      if (data.success && data.data?.news) setNewsData(data.data.news);
    } catch {
      setError('Failed to load news');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNews = useMemo(() => {
    return newsData
      .filter(item => {
        const catOk = selectedCategory === 'all' || item.category === selectedCategory;
        const prioOk = selectedPriority === 'all' || item.priority === selectedPriority;
        return catOk && prioOk;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [newsData, selectedCategory, selectedPriority]);

  const pinnedNews = filteredNews.filter(n => n.isPinned);
  const regularNews = filteredNews.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen bg-red-50 pb-28 relative overflow-hidden">

      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,18,27,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'rgba(231,18,27,0.05)', transform: 'rotate(45deg)', borderRadius: '20px' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,18,27,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* ── HEADER ── */}
      <div className="relative z-10 bg-gradient-to-br from-[#E7121B] to-[#9B0E14] overflow-hidden" style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/5 rotate-45 rounded-3xl" />
        <div className="absolute right-6 bottom-4 w-36 h-36 border border-white/10 rounded-full" />
        <div className="absolute -left-10 top-8 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10 pt-12 pb-5 px-6 flex items-center gap-3">
          <button
            onClick={() => onNavigate ? onNavigate('home') : router.back()}
            className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <MdArrowBack size={20} />
          </button>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Latest Updates</p>
            <h1 className="text-white font-bold text-xl">Newsroom</h1>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${showFilters ? 'bg-white text-[#E7121B] border-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}`}
          >
            <FaFilter size={14} />
          </button>
        </div>

        {/* Stats row */}
        <div className="relative z-10 px-6 pb-5 flex items-center gap-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
            <FaFire className="text-amber-300 text-xs" />
            <span className="text-white text-xs font-semibold">{newsData.length} Articles</span>
          </div>
          {pinnedNews.length > 0 && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-yellow-300 text-xs">📌</span>
              <span className="text-white text-xs font-semibold">{pinnedNews.length} Pinned</span>
            </div>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="relative z-10 mx-4 mb-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="mb-3">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat.toLowerCase())}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat.toLowerCase()
                      ? 'bg-white text-[#E7121B]'
                      : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >{cat}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Priority</p>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriority(p.toLowerCase())}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedPriority === p.toLowerCase()
                      ? 'bg-white text-[#E7121B]'
                      : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 px-4 mt-5 space-y-5">

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-red-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 bg-red-50" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-red-50 rounded w-3/4" />
                  <div className="h-3 bg-red-50 rounded w-1/2" />
                  <div className="h-12 bg-red-50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="text-center py-12">
            <p className="text-[#E7121B] font-medium">{error}</p>
            <button onClick={fetchNews} className="mt-3 px-4 py-2 bg-[#E7121B] text-white rounded-xl text-sm">Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredNews.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaNewspaper className="text-[#E7121B] text-3xl" />
            </div>
            <h3 className="text-gray-800 font-semibold text-lg">No articles found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting the filters above.</p>
          </div>
        )}

        {/* ── Pinned Articles ── */}
        {!isLoading && pinnedNews.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📌</span>
              <h2 className="text-gray-800 font-bold text-base">Pinned</h2>
            </div>
            <div className="space-y-3">
              {pinnedNews.map((item) => (
                <NewsCard key={item._id} item={item} onClick={() => setSelectedNews(item)} featured />
              ))}
            </div>
          </div>
        )}

        {/* ── Regular Articles ── */}
        {!isLoading && regularNews.length > 0 && (
          <div>
            {pinnedNews.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <FaNewspaper className="text-[#E7121B] text-sm" />
                <h2 className="text-gray-800 font-bold text-base">All Articles</h2>
              </div>
            )}
            <div className="space-y-3">
              {regularNews.map((item) => (
                <NewsCard key={item._id} item={item} onClick={() => setSelectedNews(item)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedNews && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="bg-white w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal image */}
            <div className="relative h-48 sm:h-56 bg-red-50 shrink-0 overflow-hidden">
              {selectedNews.image ? (
                <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                  <FaNewspaper className="text-red-200 text-6xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Close button */}
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-md"
              >
                <FaTimes size={12} />
              </button>

              {/* Badges on image */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <CategoryBadge category={selectedNews.category} />
                {selectedNews.priority !== 'low' && <PriorityBadge priority={selectedNews.priority} />}
              </div>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto p-5">
              <h2 className="text-gray-800 font-bold text-xl leading-tight mb-3">{selectedNews.title}</h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4 pb-4 border-b border-red-50">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-[#E7121B]" />
                  {formatDate(selectedNews.createdAt)}
                </span>
                {selectedNews.author && (
                  <span className="flex items-center gap-1.5">
                    <FaUser className="text-[#E7121B]" />
                    {selectedNews.author.name}
                  </span>
                )}
                {selectedNews.tags.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <FaTag className="text-[#E7121B]" />
                    {selectedNews.tags.slice(0, 3).join(', ')}
                  </span>
                )}
              </div>

              <div className="text-gray-600 text-sm leading-relaxed">
                {selectedNews.contentType === 'html' ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedNews.content }} className="news-html-content space-y-3" />
                ) : (
                  <p className="whitespace-pre-wrap">{selectedNews.content}</p>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t border-red-50 bg-white shrink-0">
              <button
                onClick={() => setSelectedNews(null)}
                className="w-full py-3 bg-[#E7121B] hover:bg-[#C21011] text-white font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .news-html-content h1, .news-html-content h2, .news-html-content h3 { color: #1f2937; font-weight: 700; margin-bottom: 0.5rem; }
        .news-html-content p { color: #4b5563; margin-bottom: 0.75rem; }
        .news-html-content a { color: #E7121B; text-decoration: underline; }
        .news-html-content ul, .news-html-content ol { color: #4b5563; padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .news-html-content li { margin-bottom: 0.25rem; }
      `}</style>
    </div>
  );
}

// ── Sub-components ──

function CategoryBadge({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
  return (
    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.icon}
      <span className="capitalize">{category}</span>
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function NewsCard({ item, onClick, featured = false }: { item: NewsItem; onClick: () => void; featured?: boolean }) {
  const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.general;

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.995] group ${featured ? 'border-[#E7121B]/30 shadow-sm' : 'border-red-100'}`}
    >
      {/* Image (only shown for featured or if image exists) */}
      {(featured || item.image) && (
        <div className="relative h-40 bg-red-50 overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${catCfg.bg}`}>
              <span className={`text-5xl ${catCfg.color} opacity-30`}>{catCfg.icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {featured && (
            <div className="absolute top-3 left-3 bg-[#E7121B] text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
              📌 Pinned
            </div>
          )}
          {item.priority === 'urgent' && (
            <div className="absolute top-3 right-3 bg-red-50 text-[#E7121B] border border-red-200 text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
              🔥 Urgent
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Category + date row */}
        <div className="flex items-center justify-between mb-2">
          <CategoryBadge category={item.category} />
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <FaCalendarAlt className="text-[#E7121B] text-[10px]" />
            {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-gray-800 font-bold text-sm leading-snug mb-1.5 group-hover:text-[#E7121B] transition-colors line-clamp-2">
          {item.title}
        </h3>

        {/* Summary */}
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {item.summary || 'Tap to read more.'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-red-50">
          <div className="flex gap-1.5">
            {item.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-[#E7121B] border border-red-100">
                #{tag}
              </span>
            ))}
          </div>
          <span className="text-[#E7121B] text-xs font-semibold flex items-center gap-0.5">
            Read →
          </span>
        </div>
      </div>
    </div>
  );
}
