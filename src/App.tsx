/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationPage } from './types';
import { ContentProvider } from './context/ContentContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileFooterNav } from './components/MobileFooterNav';
import { BookingModal } from './components/BookingModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';

// Pages
import { TangoPage } from './pages/TangoPage';
import { HomePage } from './pages/HomePage';
import { BrideSoloPage } from './pages/BrideSoloPage';
import { StylesPage } from './pages/StylesPage';
import { GalleryPage } from './pages/GalleryPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { ContactPage } from './pages/ContactPage';
import { SoloDancePage } from './pages/SoloDancePage';
import { MusicPage } from './pages/MusicPage';
import { AdminPage } from './pages/admin/AdminPage';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/admin') || hash === '#admin') return 'admin';
    if (path.includes('/solo-dance') || hash === '#solo-dance') return 'solo-dance';
    if (path.includes('/music') || hash === '#music') return 'music';
    if (path.includes('/bride-solo') || hash === '#bride-solo') return 'bride-solo';
    if (path.includes('/styles') || hash === '#styles') return 'styles';
    if (path.includes('/gallery') || hash === '#gallery') return 'gallery';
    if (path.includes('/instructors') || hash === '#instructors') return 'instructors';
    if (path.includes('/contact') || hash === '#contact') return 'contact';
    if (path.includes('/home') || hash === '#home') return 'home';
    return 'tango';
  });

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStyle, setBookingStyle] = useState<string>('تانگوی عروس و داماد');

  useEffect(() => {
    const handleHashOrPathChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash === '#admin') {
        setCurrentPage('admin');
      } else if (path.includes('/solo-dance') || hash === '#solo-dance') {
        setCurrentPage('solo-dance');
      } else if (path.includes('/music') || hash === '#music') {
        setCurrentPage('music');
      } else if (path.includes('/bride-solo') || hash === '#bride-solo') {
        setCurrentPage('bride-solo');
      } else if (path.includes('/styles') || hash === '#styles') {
        setCurrentPage('styles');
      } else if (path.includes('/gallery') || hash === '#gallery') {
        setCurrentPage('gallery');
      } else if (path.includes('/instructors') || hash === '#instructors') {
        setCurrentPage('instructors');
      } else if (path.includes('/contact') || hash === '#contact') {
        setCurrentPage('contact');
      } else if (path.includes('/home') || hash === '#home') {
        setCurrentPage('home');
      } else if (path.includes('/tango') || hash === '#tango' || path === '/') {
        setCurrentPage('tango');
      }
    };
    window.addEventListener('popstate', handleHashOrPathChange);
    window.addEventListener('hashchange', handleHashOrPathChange);
    return () => {
      window.removeEventListener('popstate', handleHashOrPathChange);
      window.removeEventListener('hashchange', handleHashOrPathChange);
    };
  }, []);

  const handleOpenBooking = (defaultStyle?: string) => {
    if (defaultStyle) {
      setBookingStyle(defaultStyle);
    } else {
      setBookingStyle('تانگوی عروس و داماد');
    }
    setBookingOpen(true);
  };

  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    try {
      const targetPath = page === 'tango' ? '/' : `/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    } catch (e) {
      // Ignore in restricted iframe contexts
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'admin') {
    return <AdminPage onNavigateSite={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-[#111413] text-[#e2e3e0] flex flex-col font-sans selection:bg-[#af8d11] selection:text-white pb-20">
      {/* Top Header Navigation */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Main Content Area */}
      <main className="flex-grow pt-16">
        {currentPage === 'tango' && <TangoPage onOpenBooking={handleOpenBooking} />}
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} onOpenBooking={handleOpenBooking} />}
        {currentPage === 'bride-solo' && <BrideSoloPage onOpenBooking={handleOpenBooking} />}
        {currentPage === 'solo-dance' && <SoloDancePage onNavigate={handleNavigate} onOpenBooking={() => handleOpenBooking()} />}
        {currentPage === 'music' && <MusicPage onNavigate={handleNavigate} />}
        {currentPage === 'styles' && <StylesPage onNavigate={handleNavigate} onOpenBooking={handleOpenBooking} />}
        {currentPage === 'gallery' && <GalleryPage onOpenBooking={handleOpenBooking} />}
        {currentPage === 'instructors' && <InstructorsPage onOpenBooking={handleOpenBooking} />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      {/* Persistent Audio Player */}
      <AudioPlayerBar />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenBooking={() => handleOpenBooking()} />

      {/* Mobile Sticky Bottom CTA */}
      <MobileFooterNav onOpenBooking={() => handleOpenBooking()} />

      {/* Booking Popup Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        defaultStyle={bookingStyle}
      />
    </div>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <MainApp />
    </ContentProvider>
  );
}
