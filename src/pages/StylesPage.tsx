import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { DanceStyle, NavigationPage } from '../types';
import { Sparkles, Check, Clock, Award, ArrowLeft, X } from 'lucide-react';

interface StylesPageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenBooking: (defaultStyle?: string) => void;
}

export const StylesPage: React.FC<StylesPageProps> = ({ onNavigate, onOpenBooking }) => {
  const { content } = useContent();
  const danceStyles = content.styles || [];
  const [selectedStyle, setSelectedStyle] = useState<DanceStyle | null>(null);

  return (
    <div className="w-full min-h-screen text-right pt-24 pb-16 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-[#e9c349] text-xs font-bold uppercase tracking-wider border border-[#e9c349]/30 px-3 py-1 rounded-full">
          کاتالوگ سبک‌های رقص عروسی
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#e2e3e0] font-display">
          سبک‌های مختلف رقص عروس و داماد
        </h1>
        <p className="text-xs md:text-sm text-[#c0c8c4]">
          از تانگوی پرشور و حس‌آمیز تا والس‌های رویاگون و سبک‌های شاد ایرانی
        </p>
      </div>

      {/* Grid of Styles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {danceStyles.map((style) => (
          <div
            key={style.id}
            className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#e9c349]/50 transition-all duration-300"
          >
            <div>
              <div className="relative h-56 overflow-hidden">
                <img
                  src={style.heroImage}
                  alt={style.titleFa}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-[#063b2f]/90 text-[#a0d1c0] text-xs px-3 py-1 rounded-full border border-[#e9c349]/30">
                  {style.badge}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#e2e3e0] font-display">{style.titleFa}</h3>
                  <span className="text-xs font-mono text-[#e9c349]">{style.titleEn}</span>
                </div>

                <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed line-clamp-3">
                  {style.shortDesc}
                </p>

                <div className="pt-3 border-t border-[#e9c349]/10 space-y-1.5 text-xs text-[#c0c8c4]">
                  <div className="flex justify-between">
                    <span>تعداد جلسه پیشنهادی:</span>
                    <span className="text-[#e9c349] font-bold">{style.recommendedSessions} جلسه</span>
                  </div>
                  <div className="flex justify-between">
                    <span>درجه سختی:</span>
                    <span className="text-[#e2e3e0] font-bold">{style.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-2">
              <button
                onClick={() => setSelectedStyle(style)}
                className="flex-1 py-2.5 bg-[#111413] hover:bg-white/5 border border-[#e9c349]/30 text-[#e2e3e0] font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                جزئیات کامل
              </button>
              <button
                onClick={() => onOpenBooking(style.titleFa)}
                className="flex-1 py-2.5 bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] border border-[#e9c349]/40 font-bold text-xs rounded-xl hover-gold-glow transition-all cursor-pointer"
              >
                رزرو مشاوره
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Style Detail Modal */}
      {selectedStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-2xl bg-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 md:p-8 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStyle(null)}
              className="absolute top-4 left-4 p-2 text-[#c0c8c4] hover:text-[#e9c349] hover:bg-white/5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 rounded-xl overflow-hidden mb-6">
              <img src={selectedStyle.heroImage} alt={selectedStyle.titleFa} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181a19] via-transparent to-transparent" />
              <div className="absolute bottom-4 right-4">
                <span className="bg-[#e9c349] text-[#3c2f00] font-bold text-xs px-3 py-1 rounded-full">
                  {selectedStyle.badge}
                </span>
                <h2 className="text-2xl font-bold text-[#e2e3e0] font-display mt-1">{selectedStyle.titleFa}</h2>
              </div>
            </div>

            <p className="text-sm text-[#c0c8c4] leading-relaxed mb-6">{selectedStyle.fullDesc}</p>

            <div className="space-y-4 mb-8">
              <h4 className="text-[#e9c349] font-bold text-sm border-b border-[#e9c349]/20 pb-2">ویژگی‌ها و دستاوردهای این سبک</h4>
              <ul className="space-y-2 text-xs md:text-sm text-[#c0c8c4]">
                {selectedStyle.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e9c349] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const styleTitle = selectedStyle.titleFa;
                  setSelectedStyle(null);
                  onOpenBooking(styleTitle);
                }}
                className="w-full bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold py-3.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#e9c349]" />
                <span>رزرو کلاس آموزشی این سبک</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
