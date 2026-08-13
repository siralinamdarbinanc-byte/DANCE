import React, { useState } from 'react';
import { MUSIC_TRACKS } from '../data/mockData';
import { useContent } from '../context/ContentContext';
import { Heart, Film, Award, Sparkles, Check, ChevronDown } from 'lucide-react';
import { AudioPlayerBar } from '../components/AudioPlayerBar';

interface TangoPageProps {
  onOpenBooking: (defaultStyle?: string) => void;
}

export const TangoPage: React.FC<TangoPageProps> = ({ onOpenBooking }) => {
  const { content } = useContent();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tangoTracks = MUSIC_TRACKS.filter(m => m.previewType === 'tango' || m.previewType === 'fusion');

  return (
    <div className="w-full min-h-screen text-right">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-[920px] flex items-center justify-center pt-24 md:pt-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="bg-cover bg-center w-full h-full absolute inset-0 opacity-40 transform scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('${content.tango?.heroImage || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80'}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111413] via-[#111413]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111413] via-transparent to-[#111413]/50" />
        </div>

        <div className="relative z-10 text-center px-4 md:px-12 max-w-4xl mx-auto flex flex-col items-center gap-6">
          <span className="text-[#e9c349] border border-[#e9c349]/30 bg-[#af8d11]/15 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium tracking-wide">
            {content.tango?.hero?.badge || 'تخصصی‌ترین مرکز آموزش رقص عروس و داماد'}
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-[#e9c349] drop-shadow-2xl leading-tight animate-fade-in-up">
            {content.tango?.hero?.title || 'تانگوی عروس و داماد'}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#c0c8c4] max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            {content.tango?.hero?.subtitle || 'رقصی پرشور و دراماتیک که اوج هماهنگی و عشق شما را در قاب سینمایی عروسی‌تان جاودانه می‌کند.'}
          </p>

          <button
            onClick={() => onOpenBooking('تانگوی عروس و داماد')}
            className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-medium text-base px-8 py-4 rounded-full mt-4 hover-gold-glow transition-all duration-500 border border-[#e9c349]/30 flex items-center gap-2 cursor-pointer shadow-xl shadow-[#063b2f]/40"
          >
            <Sparkles className="w-5 h-5 text-[#e9c349]" />
            <span>{content.tango?.hero?.buttonText || 'رزرو جلسه تانگو'}</span>
          </button>
        </div>
      </section>

      {/* Why Tango Section */}
      <section className="py-16 md:py-24 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <div className="inline-block border-b-2 border-[#e9c349] pb-2 mb-2">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-[#a0d1c0]">
                {content.tango?.whyTango?.title || 'چرا تانگو؟'}
              </h2>
            </div>

            <p className="text-base md:text-lg text-[#c0c8c4] leading-relaxed">
              {content.tango?.whyTango?.description}
            </p>

            <ul className="space-y-4 text-sm md:text-base text-[#e2e3e0] pt-2">
              {(content.tango?.whyTango?.features || []).map((bullet, idx) => (
                <li key={idx} className="flex items-center gap-4 bg-[#1e201f]/40 p-3 rounded-xl border border-[#e9c349]/10">
                  <Sparkles className="w-5 h-5 text-[#e9c349] shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Feet Image frame */}
          <div className="relative h-[450px] md:h-[580px] rounded-2xl overflow-hidden glass-panel p-2.5 border border-[#e9c349]/20 shadow-2xl">
            <img
              src={content.tango?.feetImage || 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80'}
              alt="پای جفت در فیگور تانگو"
              className="object-cover w-full h-full rounded-xl filter contrast-125 saturate-50 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111413]/80 via-transparent to-transparent rounded-xl pointer-events-none" />
            <div className="absolute bottom-6 right-6 left-6 p-4 glass-panel-gold rounded-xl border border-[#e9c349]/30">
              <p className="text-xs text-[#e9c349] font-semibold">{content.tango?.whyTango?.cardBadge || 'استودیو اختصاصی DANCE ACADEMY'}</p>
              <p className="text-sm font-bold text-[#e2e3e0] mt-0.5">{content.tango?.whyTango?.cardTitle || 'تمرین تخصصی گام‌ها و فیگورهای پای تانگو'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Music Player */}
      <section className="py-12 px-4 md:px-12 max-w-7xl mx-auto">
        <AudioPlayerBar
          tracks={tangoTracks}
          onOpenBookingWithMusic={(trackTitle) => onOpenBooking(`تانگو با موزیک ${trackTitle}`)}
        />
      </section>

      {/* Packages Section */}
      <section className="py-16 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-[#e9c349] text-xs font-bold uppercase tracking-widest border border-[#e9c349]/30 px-3 py-1 rounded-full">
            پکیج‌های تمرینی تانگو
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-[#e2e3e0] font-display">
            پکیج متناسب با زمان و نیاز خود را انتخاب کنید
          </h2>
          <p className="text-xs md:text-sm text-[#c0c8c4]">
            کلیه کلاس‌ها به صورت کاملاً خصوصی در سالن VIP با سیستم صوتی حرفه‌ای و نورپردازی استودیو برگزار می‌شود.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                pkg.isPopular
                  ? 'bg-gradient-to-b from-[#063b2f]/80 to-[#181a19] border-2 border-[#e9c349] shadow-2xl shadow-[#063b2f]/50 scale-102'
                  : 'bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/50'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 right-6 bg-[#e9c349] text-[#3c2f00] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>پیشنهاد محبوب آکادمی</span>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-[#e2e3e0] mb-1 font-display">{pkg.title}</h3>
                <p className="text-xs text-[#c0c8c4] mb-4 min-h-[32px]">{pkg.subtitle}</p>

                <div className="bg-[#111413] p-3 rounded-xl border border-[#e9c349]/15 mb-6 text-center">
                  <span className="text-2xl font-bold text-[#e9c349]">{pkg.price}</span>
                  <span className="text-xs text-[#c0c8c4] block mt-1">
                    شامل {pkg.sessions} جلسه تمرین خصوصی
                  </span>
                </div>

                <ul className="space-y-3 mb-8 text-xs md:text-sm text-[#c0c8c4]">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#e9c349] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onOpenBooking(`پکیج ${pkg.title}`)}
                className={`w-full py-3 rounded-xl font-bold text-xs md:text-sm cursor-pointer transition-all ${
                  pkg.isPopular
                    ? 'bg-[#e9c349] text-[#3c2f00] hover:bg-[#ffe088] shadow-lg shadow-[#e9c349]/20'
                    : 'bg-[#063b2f] text-[#a0d1c0] hover:bg-[#084b3c] border border-[#e9c349]/30'
                }`}
              >
                انتخاب این پکیج و مشاوره
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 md:px-12 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#e2e3e0] mb-8 text-center font-display">
          سوالات متداول درباره آموزش تانگوی عروس و داماد
        </h2>

        <div className="space-y-4">
          {(content.faqs || []).map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.id}
                className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-right font-semibold text-sm md:text-base text-[#e2e3e0] flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#e9c349] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-[#c0c8c4] leading-relaxed border-t border-[#e9c349]/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

