import React from 'react';
import { NavigationPage } from '../types';
import { useContent } from '../context/ContentContext';
import { Phone, MapPin, Instagram, MessageCircle, Send, Sparkles, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBooking }) => {
  const { content } = useContent();

  return (
    <footer className="bg-[#0c0f0e] w-full border-t border-[#e9c349]/15 flex flex-col items-center py-16 px-4 md:px-12 mt-20 text-right">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Col 1: Brand & Bio */}
        <div className="md:col-span-1 space-y-4">
          <div className="font-display text-2xl md:text-3xl text-[#e9c349] font-bold">
            {content.academy.logoText}
          </div>
          <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed">
            {content.academy.tagline}. آموزش رقص عروس و داماد، تانگو، والس سینمایی و رقص ورودی عروس سولو. خلق لحظاتی جاودانه برای مهم‌ترین شب زندگی شما.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenBooking}
              className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] border border-[#e9c349]/30 text-xs px-4 py-2 rounded-full hover-gold-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e9c349]" />
              <span>{content.navigation.bookBtn || 'درخواست رزرو مشاوره رایگان'}</span>
            </button>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-[#e9c349] font-semibold text-sm border-b border-[#e9c349]/20 pb-2 inline-block">
            دسترسی سریع
          </h4>
          <ul className="space-y-2 text-xs md:text-sm text-[#c0c8c4]">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-[#e9c349] transition-colors cursor-pointer">
                {content.navigation.home}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('tango')} className="hover:text-[#e9c349] transition-colors cursor-pointer">
                {content.navigation.tango}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('bride-solo')} className="hover:text-[#e9c349] transition-colors cursor-pointer">
                {content.navigation.brideSolo}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('solo-dance')} className="hover:text-[#e9c349] transition-colors cursor-pointer">
                {content.navigation.soloDance || 'رقص‌های تک‌نفره'}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('music')} className="hover:text-[#e9c349] transition-colors cursor-pointer">
                {content.navigation.music || 'موزیک‌ها و پلی‌لیست'}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('styles')} className="hover:text-[#e9c349] transition-colors cursor-pointer">
                {content.navigation.styles}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('instructors')} className="hover:text-[#e9c349] transition-colors cursor-pointer">
                {content.navigation.instructors}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Studio Location & Hours */}
        <div className="space-y-3">
          <h4 className="text-[#e9c349] font-semibold text-sm border-b border-[#e9c349]/20 pb-2 inline-block">
            شعبه‌های آکادمی VIP
          </h4>
          <div className="space-y-2.5 text-xs md:text-sm text-[#c0c8c4]">
            {content.branches.map((b) => (
              <div key={b.id} className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#e9c349] shrink-0 mt-0.5" />
                <span>{b.name}: {b.address}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <Phone className="w-4 h-4 text-[#e9c349] shrink-0" />
              <span dir="ltr" className="text-left font-mono">{content.academy.phoneMain} / {content.academy.phoneMobile}</span>
            </div>
          </div>
        </div>

        {/* Col 4: Social Messengers */}
        <div className="space-y-3">
          <h4 className="text-[#e9c349] font-semibold text-sm border-b border-[#e9c349]/20 pb-2 inline-block">
            ارتباط مستقیم در شبکه‌های اجتماعی
          </h4>
          <p className="text-xs text-[#c0c8c4]">
            جهت مشاهده ویدیوهای جدید و نمونه‌کارهای هنرجویان با ما در ارتباط باشید:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={content.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#1e201f] hover:bg-[#af8d11]/30 border border-[#e9c349]/20 text-[#e2e3e0] text-xs px-3 py-1.5 rounded-full transition-all"
            >
              <Instagram className="w-3.5 h-3.5 text-[#e9c349]" />
              <span>اینستاگرام</span>
            </a>
            <a
              href={content.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#1e201f] hover:bg-[#af8d11]/30 border border-[#e9c349]/20 text-[#e2e3e0] text-xs px-3 py-1.5 rounded-full transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#e9c349]" />
              <span>واتس‌اپ</span>
            </a>
            <a
              href={content.social.telegram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#1e201f] hover:bg-[#af8d11]/30 border border-[#e9c349]/20 text-[#e2e3e0] text-xs px-3 py-1.5 rounded-full transition-all"
            >
              <Send className="w-3.5 h-3.5 text-[#e9c349]" />
              <span>تلگرام</span>
            </a>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl pt-8 border-t border-[#e9c349]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#c0c8c4] opacity-70">
        <div>{content.academy.copyright}</div>
        <div className="font-display text-[#e9c349]">Elegance in Movement</div>
      </div>
    </footer>
  );
};

