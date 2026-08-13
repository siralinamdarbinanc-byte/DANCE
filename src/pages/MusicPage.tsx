import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { NavigationPage, TrackItem, Playlist } from '../types';
import { Play, Pause, Download, Music, Disc, Search, Sparkles, Filter, ShieldCheck, X } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface MusicPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const MusicPage: React.FC<MusicPageProps> = ({ onNavigate }) => {
  const { content, currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = useContent();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  useModalBackHandler(!!selectedPlaylist, () => setSelectedPlaylist(null), 'playlistDetail');

  const categories = content.musicCategories || [];
  const tracks = (content.tracks || []).filter((t) => t.active !== false);
  const playlists = (content.playlists || []).filter((p) => p.active !== false);

  // Filter tracks
  const filteredTracks = tracks.filter((track) => {
    const matchesCategory = activeCategory === 'all' || track.category === activeCategory;
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.description && track.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter playlists
  const filteredPlaylists = playlists.filter((pl) => {
    return activeCategory === 'all' || pl.category === activeCategory;
  });

  const getTracksForPlaylist = (trackIds: string[]): TrackItem[] => {
    return tracks.filter((t) => trackIds.includes(t.id));
  };

  const isTrackPlaying = (trackId: string) => {
    return currentTrack?.id === trackId && isPlaying;
  };

  return (
    <div className="w-full min-h-screen bg-[#0c0f0e] text-[#e2e3e0] py-12 px-4 md:px-8 text-right">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Banner */}
        <div className="bg-[#111413] border border-[#e9c349]/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#063b2f]/40 rounded-full blur-3xl -z-10" />

          <div className="inline-flex items-center gap-2 bg-[#063b2f] border border-[#e9c349]/30 text-[#a0d1c0] text-xs px-4 py-1.5 rounded-full mb-4">
            <Music className="w-3.5 h-3.5 text-[#e9c349]" />
            <span>آرشیو موزیک و پلی‌لیست تخصصی رقص</span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-[#e9c349] mb-4">
            کتابخانه صوتی DANCE ACADEMY
          </h1>

          <p className="max-w-3xl mx-auto text-sm md:text-base text-[#c0c8c4] leading-relaxed">
            مجموعه‌ای منتخب از بهترین موزیک‌های تانگو، بندری، ایرانی و عربی با کیفیت بالا جهت استماع آنلاین و تمرین هنرجویان.
          </p>

          {/* Search & Category Filter Controls */}
          <div className="pt-8 space-y-6 max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative max-w-md mx-auto">
              <Search className="w-5 h-5 text-[#e9c349] absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام موزیک، خواننده یا سبک..."
                className="w-full bg-[#181a19] border border-[#e9c349]/20 focus:border-[#e9c349] text-sm text-[#e2e3e0] pr-12 pl-4 py-3 rounded-full outline-none transition-all text-right"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`text-xs md:text-sm px-4 py-2 rounded-full border transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#063b2f] text-[#e9c349] border-[#e9c349] font-bold shadow-lg'
                    : 'bg-[#181a19] text-[#c0c8c4] border-white/5 hover:border-[#e9c349]/30'
                }`}
              >
                🎵 همه دسته‌ها
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs md:text-sm px-4 py-2 rounded-full border transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#063b2f] text-[#e9c349] border-[#e9c349] font-bold shadow-lg'
                      : 'bg-[#181a19] text-[#c0c8c4] border-white/5 hover:border-[#e9c349]/30'
                  }`}
                >
                  {cat.icon || '🎵'} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Playlists Section */}
        {filteredPlaylists.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-[#e9c349] flex items-center gap-2">
              <Disc className="w-6 h-6 text-[#e9c349]" />
              <span>پلی‌لیست‌های اختصاصی سبک‌ها</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPlaylists.map((pl) => {
                const plTracks = getTracksForPlaylist(pl.tracks);
                return (
                  <div
                    key={pl.id}
                    className="bg-[#111413] border border-[#e9c349]/20 hover:border-[#e9c349]/50 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all hover:-translate-y-1 shadow-lg group"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-square border border-white/5">
                      <img
                        src={pl.coverImage}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => {
                            if (plTracks.length > 0) playTrack(plTracks[0], plTracks);
                          }}
                          className="bg-[#063b2f] border border-[#e9c349] text-[#e9c349] p-3.5 rounded-full shadow-2xl hover:scale-110 transition-all cursor-pointer"
                        >
                          <Play className="w-6 h-6 fill-current" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-[#e9c349]">{pl.title}</h4>
                      <p className="text-xs text-[#c0c8c4] line-clamp-2">{pl.description}</p>
                      <span className="text-[10px] text-[#a0d1c0] bg-[#063b2f] px-2 py-0.5 rounded-full inline-block mt-1">
                        تعداد قطعات: {plTracks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPlaylist(selectedPlaylist?.id === pl.id ? null : pl)}
                      className="w-full bg-[#181a19] hover:bg-[#063b2f] text-[#e2e3e0] hover:text-[#e9c349] border border-white/10 text-xs py-2 rounded-xl transition-all cursor-pointer"
                    >
                      {selectedPlaylist?.id === pl.id ? 'پنهان کردن قطعات' : 'مشاهده قطعات پلی‌لیست'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Playlist Modal/Accordion Details */}
        {selectedPlaylist && (
          <div className="bg-[#111413] border-2 border-[#e9c349] rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e9c349]/20 pb-4">
              <div>
                <span className="text-xs text-[#a0d1c0] bg-[#063b2f] px-3 py-1 rounded-full border border-[#e9c349]/30">
                  پلی‌لیست منتخب
                </span>
                <h3 className="font-display text-2xl font-bold text-[#e9c349] mt-2">
                  {selectedPlaylist.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-[#e2e3e0] hover:text-[#e9c349] bg-[#181a19] hover:bg-[#202422] border border-[#e9c349]/30 rounded-xl cursor-pointer shadow-md transition-all"
              >
                <X className="w-4 h-4" />
                <span>بستن</span>
              </button>
            </div>

            <div className="space-y-3">
              {getTracksForPlaylist(selectedPlaylist.tracks).map((track) => (
                <div
                  key={track.id}
                  className="bg-[#181a19] border border-white/5 hover:border-[#e9c349]/40 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all"
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

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-[#c0c8c4] dir-ltr">{track.duration}</span>

                    <button
                      onClick={() =>
                        isTrackPlaying(track.id)
                          ? pauseTrack()
                          : playTrack(track, getTracksForPlaylist(selectedPlaylist.tracks))
                      }
                      className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] p-2.5 rounded-xl border border-[#e9c349]/30 transition-all cursor-pointer"
                    >
                      {isTrackPlaying(track.id) ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>

                    {track.downloadable && (track.downloadUrl || track.audioUrl) ? (
                      <a
                        href={track.downloadUrl || track.audioUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#181a19] hover:bg-[#063b2f] text-[#e9c349] border border-[#e9c349]/30 p-2.5 rounded-xl transition-all"
                        title="دانلود موزیک"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-[#c0c8c4]/50 border border-white/5 px-2 py-1 rounded-lg">
                        فقط آنلاین
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracks List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-[#e9c349] flex items-center gap-2">
              <Music className="w-6 h-6 text-[#e9c349]" />
              <span>همه قطعات صوتی آرشیو</span>
            </h2>
            <span className="text-xs text-[#c0c8c4]">
              تعداد قطعات یافت شده: {filteredTracks.length}
            </span>
          </div>

          {filteredTracks.length > 0 ? (
            <div className="bg-[#111413] border border-[#e9c349]/20 rounded-3xl p-6 md:p-8 divide-y divide-white/5 shadow-xl">
              {filteredTracks.map((track) => {
                const playing = isTrackPlaying(track.id);
                return (
                  <div
                    key={track.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-[#181a19]/50 px-3 rounded-2xl transition-all"
                  >
                    {/* Track Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={track.coverImage}
                          alt={track.title}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#e9c349]/30 shadow-md"
                        />
                        <button
                          onClick={() => (playing ? pauseTrack() : playTrack(track, filteredTracks))}
                          className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {playing ? (
                            <Pause className="w-6 h-6 text-[#e9c349] fill-current" />
                          ) : (
                            <Play className="w-6 h-6 text-[#e9c349] fill-current" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base text-[#e2e3e0] group-hover:text-[#e9c349] transition-colors truncate">
                            {track.title}
                          </h4>
                          <span className="text-[10px] bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/20 px-2 py-0.5 rounded-full">
                            {track.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#c0c8c4] truncate">{track.artist}</p>
                        {track.description && (
                          <p className="text-[11px] text-[#c0c8c4]/70 line-clamp-1">{track.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions & Player */}
                    <div className="flex items-center justify-end gap-3 shrink-0">
                      <span className="text-xs font-mono text-[#c0c8c4] dir-ltr pl-2">{track.duration}</span>

                      <button
                        onClick={() => (playing ? pauseTrack() : playTrack(track, filteredTracks))}
                        className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        {playing ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>توقف</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>پخش</span>
                          </>
                        )}
                      </button>

                      {/* Download button according to permission */}
                      {track.downloadable && (track.downloadUrl || track.audioUrl) ? (
                        <a
                          href={track.downloadUrl || track.audioUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#181a19] hover:bg-[#202422] text-[#e9c349] border border-[#e9c349]/30 p-2.5 rounded-xl transition-all cursor-pointer"
                          title="دانلود موزیک با اجازه آکادمی"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#c0c8c4]/60 bg-[#181a19] px-2.5 py-1.5 rounded-xl border border-white/5 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#e9c349]" />
                          <span>فقط آنلاین</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#111413] border border-white/5 rounded-3xl p-12 text-center text-[#c0c8c4] space-y-3">
              <Music className="w-10 h-10 text-[#e9c349]/40 mx-auto" />
              <p className="text-sm">هیچ موزیکی متناسب با این عبارت پیدا نشد.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
