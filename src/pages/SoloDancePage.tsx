import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { NavigationPage, SoloDanceStyle, TrackItem } from '../types';
import { Sparkles, Clock, Calendar, DollarSign, CheckCircle2, User, Play, ArrowRight, Music, Disc } from 'lucide-react';

interface SoloDancePageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenBooking: () => void;
}

export const SoloDancePage: React.FC<SoloDancePageProps> = ({ onNavigate, onOpenBooking }) => {
  const { content, playTrack } = useContent();
  const [selectedStyle, setSelectedStyle] = useState<SoloDanceStyle | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const soloStyles = (content.soloDance || []).filter((s) => s.active !== false);
  const playlists = content.playlists || [];
  const tracks = content.tracks || [];

  const categories = [
    { id: 'all', label: 'همه سبک‌ها' },
    { id: 'arabic', label: 'رقص عربی' },
    { id: 'bandari', label: 'رقص بندری' },
    { id: 'persian', label: 'رقص ایرانی' },
    { id: 'heels', label: 'رقص هیلز' },
    { id: 'twerk', label: 'رقص توئرک' },
  ];

  const filteredStyles = activeCategoryFilter === 'all'
    ? soloStyles
    : soloStyles.filter((s) => s.slug === activeCategoryFilter || s.id === activeCategoryFilter);

  // Find linked playlist for selected style
  const getLinkedPlaylist = (playlistId?: string) => {
    if (!playlistId) return null;
    return playlists.find((p) => p.id === playlistId || p.category === playlistId);
  };

  const getTracksForPlaylist = (playlistId?: string): TrackItem[] => {
    const pl = getLinkedPlaylist(playlistId);
    if (!pl) return [];
    return tracks.filter((t) => pl.tracks.includes(t.id));
  };

  return (
    <div className="w-full min-h-screen bg-[#0c0f0e] text-[#e2e3e0] py-12 px-4 md:px-8 text-right">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* DETAIL VIEW MODE */}
        {selectedStyle ? (
          <div className="space-y-12 animate-fade-in">
            {/* Back Button */}
            <div>
              <button
                onClick={() => setSelectedStyle(null)}
                className="inline-flex items-center gap-2 bg-[#181a19] hover:bg-[#063b2f] text-[#e9c349] border border-[#e9c349]/30 text-xs md:text-sm px-4 py-2 rounded-full transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به لیست رقص‌های تک‌نفره</span>
              </button>
            </div>

            {/* Style Detail Hero Card */}
            <div className="bg-[#111413] border border-[#e9c349]/30 rounded-3xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#063b2f]/30 rounded-full blur-3xl -z-10" />

              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#063b2f] border border-[#e9c349]/40 text-[#a0d1c0] text-xs px-3.5 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-[#e9c349]" />
                  <span>دوره انفرادی و اختصاصی (Solo Dance)</span>
                </div>

                <h1 className="font-display text-3xl md:text-5xl font-extrabold text-[#e9c349] leading-tight">
                  {selectedStyle.title}
                </h1>

                <p className="text-sm md:text-base text-[#c0c8c4] leading-relaxed">
                  {selectedStyle.fullDescription || selectedStyle.shortDescription}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-[#181a19] border border-white/5 p-3 rounded-2xl">
                    <span className="text-xs text-[#c0c8c4] block mb-1">سطح آموزشی</span>
                    <span className="text-sm font-bold text-[#e2e3e0]">{selectedStyle.level}</span>
                  </div>
                  <div className="bg-[#181a19] border border-white/5 p-3 rounded-2xl">
                    <span className="text-xs text-[#c0c8c4] block mb-1">تعداد جلسات</span>
                    <span className="text-sm font-bold text-[#e2e3e0]">{selectedStyle.sessions}</span>
                  </div>
                  <div className="bg-[#181a19] border border-white/5 p-3 rounded-2xl col-span-2 sm:col-span-1">
                    <span className="text-xs text-[#c0c8c4] block mb-1">شهریه دوره</span>
                    <span className="text-sm font-bold text-[#e9c349]">{selectedStyle.price}</span>
                  </div>
                </div>

                {/* Instructor */}
                {selectedStyle.instructor && (
                  <div className="flex items-center gap-3 bg-[#181a19] p-3 rounded-2xl border border-[#e9c349]/20">
                    <User className="w-5 h-5 text-[#e9c349]" />
                    <span className="text-xs text-[#c0c8c4]">مربی دوره:</span>
                    <span className="text-sm font-bold text-[#e2e3e0]">{selectedStyle.instructor}</span>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-2">
                  <button
                    onClick={onOpenBooking}
                    className="w-full sm:w-auto bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/50 text-sm font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>رزرو جلسه مشاوره این سبک</span>
                  </button>
                </div>
              </div>

              {/* Cover Image */}
              <div className="relative rounded-2xl overflow-hidden border border-[#e9c349]/30 aspect-4/3 group shadow-2xl">
                <img
                  src={selectedStyle.image}
                  alt={selectedStyle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f0e] via-transparent to-transparent opacity-60" />
              </div>
            </div>

            {/* Syllabus & Features */}
            {selectedStyle.features && selectedStyle.features.length > 0 && (
              <div className="bg-[#111413] border border-[#e9c349]/20 rounded-3xl p-6 md:p-8 space-y-6">
                <h3 className="font-display text-xl font-bold text-[#e9c349] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#e9c349]" />
                  <span>ویژگی‌ها و سرفصل‌های آموزشی دوره {selectedStyle.title}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStyle.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="bg-[#181a19] border border-white/5 p-4 rounded-2xl flex items-start gap-3"
                    >
                      <Sparkles className="w-4 h-4 text-[#e9c349] shrink-0 mt-1" />
                      <span className="text-xs md:text-sm text-[#e2e3e0]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Playlist & Music Player */}
            {selectedStyle.musicPlaylistId && (
              <div className="bg-[#111413] border border-[#e9c349]/20 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-[#e9c349] flex items-center gap-2">
                    <Disc className="w-5 h-5 text-[#e9c349]" />
                    <span>پلی‌لیست صوتی اختصاصی این سبک</span>
                  </h3>
                  <button
                    onClick={() => onNavigate('music')}
                    className="text-xs text-[#a0d1c0] hover:text-[#e9c349] transition-colors cursor-pointer"
                  >
                    مشاهده آرشیو کامل موزیک‌ها
                  </button>
                </div>

                {getTracksForPlaylist(selectedStyle.musicPlaylistId).length > 0 ? (
                  <div className="space-y-3">
                    {getTracksForPlaylist(selectedStyle.musicPlaylistId).map((track) => (
                      <div
                        key={track.id}
                        className="bg-[#181a19] border border-white/5 hover:border-[#e9c349]/40 p-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={track.coverImage}
                            alt={track.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#e9c349]/20"
                          />
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-[#e2e3e0] truncate">{track.title}</h5>
                            <p className="text-xs text-[#c0c8c4] truncate">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-[#c0c8c4] dir-ltr">{track.duration}</span>
                          <button
                            onClick={() => playTrack(track, getTracksForPlaylist(selectedStyle.musicPlaylistId))}
                            className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] p-2.5 rounded-xl border border-[#e9c349]/30 transition-all cursor-pointer"
                            title="پخش موزیک"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#c0c8c4] italic">
                    موزیک‌های این سبک به زودی در آرشیو اضافه می‌شوند.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* LISTING MODE */
          <div className="space-y-12">
            {/* Page Header Banner */}
            <div className="bg-[#111413] border border-[#e9c349]/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#063b2f]/40 rounded-full blur-3xl -z-10" />

              <div className="inline-flex items-center gap-2 bg-[#063b2f] border border-[#e9c349]/30 text-[#a0d1c0] text-xs px-4 py-1.5 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#e9c349]" />
                <span>{content.soloContent?.hero?.badge || 'دوره تخصصی رقص‌های تک‌نفره (Solo Dance)'}</span>
              </div>

              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-[#e9c349] mb-4">
                {content.soloContent?.hero?.title || 'آموزش رقص‌های تک‌نفره و انفرادی'}
              </h1>

              <p className="max-w-3xl mx-auto text-sm md:text-base text-[#c0c8c4] leading-relaxed">
                {content.soloContent?.hero?.subtitle ||
                  'یادگیری حرفه‌ای سبک‌های عربی، بندری، ایرانی اصیل، هیلز و توئرک با اساتید مجرب در محیطی کاملاً خصوصی و لاکچری.'}
              </p>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`text-xs md:text-sm px-4 py-2 rounded-full border transition-all cursor-pointer ${
                      activeCategoryFilter === cat.id
                        ? 'bg-[#063b2f] text-[#e9c349] border-[#e9c349] shadow-lg font-bold'
                        : 'bg-[#181a19] text-[#c0c8c4] border-white/5 hover:border-[#e9c349]/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Solo Dance Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStyles.map((style) => (
                <div
                  key={style.id}
                  className="bg-[#111413] border border-[#e9c349]/20 hover:border-[#e9c349]/60 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 shadow-xl group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={style.image}
                      alt={style.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111413] via-transparent to-transparent opacity-80" />
                    <span className="absolute top-4 right-4 bg-[#063b2f]/90 backdrop-blur-md border border-[#e9c349]/40 text-[#e9c349] text-xs px-3 py-1 rounded-full font-bold">
                      {style.level}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-bold text-[#e9c349] group-hover:text-white transition-colors">
                        {style.title}
                      </h3>
                      <p className="text-xs text-[#c0c8c4] line-clamp-2 leading-relaxed">
                        {style.shortDescription}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#c0c8c4]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#e9c349]" />
                          <span>جلسات:</span>
                        </span>
                        <span className="font-bold text-[#e2e3e0]">{style.sessions}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#c0c8c4]">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-[#e9c349]" />
                          <span>شهریه:</span>
                        </span>
                        <span className="font-bold text-[#e9c349]">{style.price}</span>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStyle(style)}
                          className="flex-1 bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/30 text-xs py-2.5 rounded-xl font-bold transition-all cursor-pointer text-center"
                        >
                          مشاهده جزئیات
                        </button>
                        <button
                          onClick={onOpenBooking}
                          className="bg-[#181a19] hover:bg-[#202422] text-[#e2e3e0] border border-white/10 text-xs px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          رزرو
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits Banner */}
            <div className="bg-[#111413] border border-[#e9c349]/20 rounded-3xl p-8 md:p-10 space-y-6">
              <h2 className="font-display text-2xl font-bold text-[#e9c349] text-center">
                {content.soloContent?.benefitsTitle || 'ویژگی‌های انحصاری دوره‌های تک‌نفره'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(content.soloContent?.benefits || []).map((ben, idx) => (
                  <div key={idx} className="bg-[#181a19] border border-white/5 p-5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-sm text-[#e9c349] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#e9c349]" />
                      <span>{ben.title}</span>
                    </h4>
                    <p className="text-xs text-[#c0c8c4] leading-relaxed">{ben.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
