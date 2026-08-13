import React from 'react';
import { Sparkles, Check, Crown } from 'lucide-react';
import { MUSIC_TRACKS } from '../data/mockData';
import { useContent } from '../context/ContentContext';
import { AudioPlayerBar } from '../components/AudioPlayerBar';

interface BrideSoloPageProps {
  onOpenBooking: (defaultStyle?: string) => void;
}

export const BrideSoloPage: React.FC<BrideSoloPageProps> = ({ onOpenBooking }) => {
  const { content } = useContent();
  const soloTracks = MUSIC_TRACKS.filter((m) => m.previewType === 'solo' || m.previewType === 'waltz');

  return (
    <div className="w-full min-h-screen text-right pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center py-16 px-4 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={content.brideSolo?.heroImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'}
            alt="رقص سولو عروس"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111413] via-[#111413]/70 to-transparent" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 border border-[#e9c349]/30 bg-[#af8d11]/15 px-4 py-1.5 rounded-full text-xs md:text-sm text-[#e9c349]">
            <Crown className="w-4 h-4" />
            <span>{content.brideSolo?.hero?.badge || 'طراحی تخصصی ورودی و رقص سولو عروس'}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#e9c349]">
            {content.brideSolo?.hero?.title || 'رقص سولو عروس (Solo Bride)'}
          </h1>

          <p className="text-base md:text-xl text-[#c0c8c4] max-w-2xl mx-auto leading-relaxed">
            {content.brideSolo?.hero?.subtitle || 'لحظه‌ای رویایی که تمام نگاه‌ها مقهور شکوه، ناز و وقار شما می‌شوند.'}
          </p>

          <button
            onClick={() => onOpenBooking('رقص سولو عروس')}
            className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-base px-8 py-4 rounded-full border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all"
          >
            {content.brideSolo?.hero?.buttonText || 'رزرو جلسه مشاوره سولو عروس'}
          </button>
        </div>
      </section>

      {/* Feature Breakdown */}
      <section className="py-16 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#a0d1c0] border-b border-[#e9c349]/30 pb-3 inline-block">
              {content.brideSolo?.details?.title || 'نکات کلیدی در طراحی رقص سولو عروس'}
            </h2>

            <p className="text-sm md:text-base text-[#c0c8c4] leading-relaxed">
              {content.brideSolo?.details?.description}
            </p>

            <ul className="space-y-4 text-xs md:text-sm text-[#e2e3e0]">
              {(content.brideSolo?.details?.benefits || []).map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-[#181a19] p-4 rounded-xl border border-[#e9c349]/15">
                  <Check className="w-5 h-5 text-[#e9c349] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#e2e3e0] mb-1">{point.title}</strong>
                    <span>{point.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[480px] rounded-2xl overflow-hidden glass-panel p-2">
            <img
              src={content.brideSolo?.secondaryImage || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80'}
              alt="سولو عروس"
              className="w-full h-full object-cover rounded-xl filter contrast-110"
            />
          </div>
        </div>
      </section>

      {/* Recommended Solo Music */}
      <section className="py-12 px-4 md:px-12 max-w-7xl mx-auto">
        <AudioPlayerBar
          tracks={soloTracks}
          onOpenBookingWithMusic={(trackTitle) => onOpenBooking(`سولو عروس با موزیک ${trackTitle}`)}
        />
      </section>
    </div>
  );
};

