import React, { useState } from 'react';
import { NavigationPage } from '../types';
import { useContent } from '../context/ContentContext';
import { Menu, X, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface HeaderProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onOpenBooking }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { content } = useContent();

  useModalBackHandler(mobileMenuOpen, () => setMobileMenuOpen(false), 'mobileMenu');

  const navLinks: { id: NavigationPage; label: string }[] = [
    { id: 'home', label: content.navigation.home || 'خانه' },
    { id: 'bride-solo', label: content.navigation.brideSolo || 'عروس سولو' },
    { id: 'tango', label: content.navigation.tango || 'تانگو' },
    { id: 'solo-dance', label: content.navigation.soloDance || 'رقص‌های تک‌نفره' },
    { id: 'music', label: content.navigation.music || 'موزیک‌ها' },
    { id: 'styles', label: content.navigation.styles || 'سبک‌ها' },
    { id: 'gallery', label: content.navigation.gallery || 'گالری' },
    { id: 'instructors', label: content.navigation.instructors || 'اساتید' },
    { id: 'contact', label: content.navigation.contact || 'تماس' },
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="fixed top-0 w-full bg-[#111413]/70 backdrop-blur-3xl border-b border-[#e9c349]/20 z-50 flex justify-between items-center px-4 md:px-12 py-3.5 transition-all duration-300">
        {/* Right side (RTL Start): Logo */}
        <button 
          onClick={() => handleNavClick('home')}
          className="font-display text-2xl md:text-3xl font-bold text-[#e9c349] tracking-wider hover:opacity-90 transition-opacity text-right cursor-pointer"
        >
          {content.academy.logoText || 'DANCE ACADEMY'}
        </button>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-[#e9c349] border-b-2 border-[#e9c349] bg-[#af8d11]/15 font-semibold'
                    : 'text-[#e2e3e0] hover:text-[#ffe088] hover:bg-[#af8d11]/10'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Left side (RTL End): CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenBooking}
            className="hidden sm:flex items-center gap-2 bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] border border-[#e9c349]/30 text-xs md:text-sm font-medium px-5 py-2.5 rounded-full hover-gold-glow cursor-pointer transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-[#e9c349] animate-pulse" />
            <span>{content.navigation.bookBtn || 'رزرو مشاوره'}</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#e2e3e0] hover:text-[#e9c349] rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="تغییر منو"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            <span className="text-sm font-medium">منو</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
          className="fixed inset-0 z-40 bg-[#0c0f0e]/95 backdrop-blur-2xl flex flex-col pt-6 px-6 pb-8 lg:hidden animate-fade-in-up overflow-y-auto"
        >
          {/* Top Bar inside Drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-[#e9c349]/20 mb-4 shrink-0">
            <span className="text-[#e9c349] font-bold text-base font-display">منوی اصلی آکادمی</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#181a19] border border-[#e9c349]/40 text-[#e2e3e0] hover:text-[#e9c349] rounded-full text-xs font-bold transition-all cursor-pointer shadow-md"
              title="بستن منو (یا دکمه بازگشت گوشی)"
            >
              <X className="w-4 h-4" />
              <span>بستن منو</span>
            </button>
          </div>

          <nav className="flex flex-col gap-2 my-auto">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-right py-3.5 px-5 rounded-2xl text-lg font-medium transition-all ${
                    isActive
                      ? 'bg-[#af8d11]/25 text-[#e9c349] border border-[#e9c349]/40 font-bold'
                      : 'text-[#e2e3e0] hover:bg-white/5 hover:text-[#e9c349]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-[#e9c349]/20 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full bg-[#e9c349] text-[#3c2f00] font-bold py-3.5 rounded-full text-center flex items-center justify-center gap-2 hover:bg-[#ffe088] transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>{content.navigation.bookBtn || 'رزرو مشاوره'}</span>
            </button>
            <p className="text-center text-xs text-[#c0c8c4] opacity-70">
              {content.academy.tagline} - {content.academy.generalAddress}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

