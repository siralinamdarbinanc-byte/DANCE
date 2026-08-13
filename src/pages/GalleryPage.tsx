import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { GalleryItem } from '../types';
import { X, Play, Image, Sparkles } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface GalleryPageProps {
  onOpenBooking: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onOpenBooking }) => {
  const { content } = useContent();
  const galleryItems = content.gallery || [];
  const [filter, setFilter] = useState<'all' | 'tango' | 'bride-solo' | 'group' | 'backstage'>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  useModalBackHandler(!!activeItem, () => setActiveItem(null), 'galleryLightbox');

  const filteredItems = filter === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === filter);

  return (
    <div className="w-full min-h-screen text-right pt-24 pb-16 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="text-[#e9c349] text-xs font-bold uppercase tracking-wider border border-[#e9c349]/30 px-3 py-1 rounded-full">
          گالری عکس و ویدیو
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#e2e3e0] font-display">
          لحظات ثبت شده هنرجویان آکادمی
        </h1>
        <p className="text-xs md:text-sm text-[#c0c8c4]">
          تصاویری از اجراهای تانگو، سولو عروس و پشت صحنه تمرینات خصوصی در استودیو VIP
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {[
          { id: 'all', label: 'همه تصاویر' },
          { id: 'tango', label: 'تانگو' },
          { id: 'bride-solo', label: 'عروس سولو' },
          { id: 'group', label: 'ساقدوش و رقص چاقو' },
          { id: 'backstage', label: 'پشت صحنه استودیو' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-all ${
              filter === tab.id
                ? 'bg-[#e9c349] text-[#3c2f00] font-bold shadow-md shadow-[#e9c349]/20'
                : 'bg-[#181a19] text-[#c0c8c4] border border-[#e9c349]/20 hover:border-[#e9c349]/40 hover:text-[#e2e3e0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-[#e9c349]/20 hover:border-[#e9c349]/60 transition-all duration-300"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111413] via-[#111413]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            <div className="absolute top-4 right-4 bg-[#111413]/80 p-2 rounded-full border border-[#e9c349]/30 text-[#e9c349]">
              <Image className="w-4 h-4" />
            </div>

            <div className="absolute bottom-4 right-4 left-4 space-y-1">
              <span className="text-[11px] text-[#e9c349] font-medium block">{item.dateStr}</span>
              <h3 className="text-sm font-bold text-[#e2e3e0] group-hover:text-[#e9c349] transition-colors">
                {item.title}
              </h3>
              {item.coupleName && (
                <span className="text-xs text-[#c0c8c4] block">زوج: {item.coupleName}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveItem(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in-up overflow-y-auto"
        >
          <div className="relative w-full max-w-4xl bg-[#181a19] border border-[#e9c349]/40 rounded-2xl overflow-hidden p-4 md:p-6 text-right my-auto">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-[#111413]/90 hover:bg-[#202422] text-[#e2e3e0] hover:text-[#e9c349] rounded-full border border-[#e9c349]/40 text-xs font-bold transition-all cursor-pointer shadow-md"
              title="بستن (یا کلید بازگشت)"
            >
              <X className="w-4 h-4" />
              <span>بستن</span>
            </button>

            <div className="relative h-[60vh] rounded-xl overflow-hidden mb-4">
              <img src={activeItem.imageUrl} alt={activeItem.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#e9c349] font-display">{activeItem.title}</h3>
                <p className="text-xs text-[#c0c8c4]">
                  زوج: {activeItem.coupleName} • تاریخ: {activeItem.dateStr}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveItem(null);
                  onOpenBooking();
                }}
                className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-6 py-2.5 rounded-full border border-[#e9c349]/30 hover-gold-glow flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#e9c349]" />
                <span>رزرو مشاوره برای اجرای شبیه به این</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
