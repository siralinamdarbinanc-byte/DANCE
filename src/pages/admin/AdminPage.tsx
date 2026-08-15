import React, { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import { NavigationPage } from '../../types';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';
import {
  LayoutDashboard,
  Home,
  Sparkles,
  Users,
  DollarSign,
  HelpCircle,
  Layers,
  Image as ImageIcon,
  Calendar,
  Settings,
  ArrowRight,
  Menu,
  X,
  RotateCcw,
  CheckCircle2,
  PhoneCall,
  Cloud,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import { AdminDashboard } from './AdminDashboard';
import { HomeEditor } from './HomeEditor';
import { TangoEditor } from './TangoEditor';
import { BrideSoloEditor } from './BrideSoloEditor';
import { PackagesEditor } from './PackagesEditor';
import { FaqEditor } from './FaqEditor';
import { StylesEditor } from './StylesEditor';
import { GalleryEditor } from './GalleryEditor';
import { InstructorsEditor } from './InstructorsEditor';
import { BookingsManager } from './BookingsManager';
import { ContactAndSettingsEditor } from './ContactAndSettingsEditor';
import { SoloDanceEditor } from './SoloDanceEditor';
import { MusicEditor } from './MusicEditor';
import { MediaR2Manager } from './MediaR2Manager';
import { AdminLoginModal } from '../../components/AdminLoginModal';
import { api } from '../../api/client';

interface AdminPageProps {
  onNavigateSite: (page: NavigationPage) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateSite }) => {
  const { content, resetToDefaults } = useContent();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('admin_auth_token');
  });
  const [isVerifying, setIsVerifying] = useState<boolean>(() => {
    return !!localStorage.getItem('admin_auth_token');
  });

  useModalBackHandler(mobileMenuOpen, () => setMobileMenuOpen(false), 'adminMobileMenu');
  useModalBackHandler(showResetModal, () => setShowResetModal(false), 'adminResetModal');

  // Prevent search engines from indexing the Admin panel while keeping public pages indexable
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !robotsMeta;
    const previousContent = robotsMeta ? robotsMeta.getAttribute('content') : null;

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive');

    return () => {
      if (created && robotsMeta && robotsMeta.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta);
      } else if (robotsMeta && previousContent !== null) {
        robotsMeta.setAttribute('content', previousContent);
      } else if (robotsMeta && robotsMeta.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta);
      }
    };
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('admin_auth_token');
      if (!token) {
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      const isValid = await api.verifyAuth();
      if (!isValid) {
        localStorage.removeItem('admin_auth_token');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
      setIsVerifying(false);
    };

    verifySession();
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleReset = () => {
    resetToDefaults();
    setShowResetModal(false);
    notify('محتوا به تنظیمات پیش‌فرض اولیه بازگردانده شد');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth_token');
    setIsAuthenticated(false);
    notify('با موفقیت از پنل مدیریت خارج شدید.');
  };

  const navItems = [
    { id: 'dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
    { id: 'bookings', label: 'سامانه CRM و رزروها', icon: Calendar, badge: (content.bookings || []).filter(b => b.status === 'New').length },
    { id: 'r2media', label: 'مخزن رسانه‌ای R2 Cloud', icon: Cloud },
    { id: 'home', label: 'صفحه اصلی', icon: Home },
    { id: 'tango', label: 'صفحه تانگو', icon: Sparkles },
    { id: 'brideSolo', label: 'صفحه سولو عروس', icon: Users },
    { id: 'soloDance', label: 'رقص‌های تک‌نفره', icon: Layers },
    { id: 'music', label: 'موزیک و پلی‌لیست', icon: Sparkles },
    { id: 'styles', label: 'سبک‌های رقص', icon: Layers },
    { id: 'packages', label: 'پکیج‌ها و قیمت‌ها', icon: DollarSign },
    { id: 'faqs', label: 'سوالات متداول FAQ', icon: HelpCircle },
    { id: 'gallery', label: 'گالری تصاویر', icon: ImageIcon },
    { id: 'instructors', label: 'اساتید و مربیان', icon: Users },
    { id: 'settings', label: 'تنظیمات و تماس', icon: Settings },
  ];

  if (isVerifying) {
    return (
      <div className="w-full min-h-screen bg-[#0c0f0e] flex flex-col items-center justify-center p-4 text-[#e2e3e0]">
        <div className="p-4 bg-[#063b2f] border border-[#e9c349]/40 rounded-2xl text-[#e9c349] shadow-lg shadow-[#063b2f]/50 animate-pulse mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-[#c0c8c4]">در حال بررسی اعتبار دسترسی مدیریت...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#0c0f0e] flex items-center justify-center p-4">
        <AdminLoginModal
          onSuccess={() => {
            setIsAuthenticated(true);
            setIsVerifying(false);
            notify('ورود به پنل مدیریت با موفقیت انجام شد.');
          }}
          onCancel={() => onNavigateSite('home')}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0c0f0e] text-[#e2e3e0] flex flex-col md:flex-row text-right">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#063b2f] border-2 border-[#e9c349] text-[#e2e3e0] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-[#e9c349]" />
          <span className="text-xs md:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-[#111413] border-b border-[#e9c349]/20 p-4 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#e9c349] bg-[#181a19] border border-[#e9c349]/20 rounded-xl"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="font-display font-bold text-sm text-[#e9c349] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>پنل مدیریت CRM و D1</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2 rounded-xl"
            title="خروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateSite('home')}
            className="text-xs text-[#a0d1c0] bg-[#063b2f] border border-[#e9c349]/30 px-3 py-1.5 rounded-xl flex items-center gap-1"
          >
            <span>سایت</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#e9c349]" />
          </button>
        </div>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 right-0 z-40 w-72 h-screen bg-[#111413] border-l border-[#e9c349]/20 flex flex-col justify-between p-6 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'max-md:translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5">
          {/* Logo & Header */}
          <div className="border-b border-[#e9c349]/20 pb-4 space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-display text-xl font-bold text-[#e9c349]">
                DANCE ACADEMY
              </div>
              <span className="text-[10px] bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/40 px-2 py-0.5 rounded-full font-mono">
                D1 + R2 Ready
              </span>
            </div>
            <p className="text-[11px] text-[#c0c8c4]">سیستم مدیریت محتوا و CRM مشتریان</p>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs md:text-sm font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/40 font-bold shadow-lg shadow-[#063b2f]/50'
                      : 'text-[#c0c8c4] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#e9c349]' : 'text-[#c0c8c4]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-[#e9c349] text-[#3c2f00] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-4 border-t border-[#e9c349]/15 space-y-2">
          <button
            onClick={() => onNavigateSite('home')}
            className="w-full py-2 bg-[#181a19] hover:bg-white/5 border border-[#e9c349]/30 text-[#e9c349] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>بازگشت به نمایش اصلی سایت</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetModal(true)}
              className="flex-1 py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 text-red-300 text-[11px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>ریست کارخانه</span>
            </button>

            <button
              onClick={handleLogout}
              className="py-2 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-[11px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="خروج از حساب مدیریت"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full min-h-screen pt-6 md:pt-10">
        {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} onNotify={notify} />}
        {activeTab === 'bookings' && <BookingsManager onNotify={notify} />}
        {activeTab === 'r2media' && <MediaR2Manager onNotify={notify} />}
        {activeTab === 'home' && <HomeEditor onNotify={notify} />}
        {activeTab === 'tango' && <TangoEditor onNotify={notify} />}
        {activeTab === 'brideSolo' && <BrideSoloEditor onNotify={notify} />}
        {activeTab === 'soloDance' && <SoloDanceEditor />}
        {activeTab === 'music' && <MusicEditor />}
        {activeTab === 'packages' && <PackagesEditor onNotify={notify} />}
        {activeTab === 'faqs' && <FaqEditor onNotify={notify} />}
        {activeTab === 'styles' && <StylesEditor onNotify={notify} />}
        {activeTab === 'gallery' && <GalleryEditor onNotify={notify} />}
        {activeTab === 'instructors' && <InstructorsEditor onNotify={notify} />}
        {activeTab === 'settings' && <ContactAndSettingsEditor onNotify={notify} />}
      </main>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResetModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="bg-[#181a19] border border-red-500/50 rounded-2xl p-6 max-w-md w-full text-right space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 left-4 p-1.5 text-[#c0c8c4] hover:text-white bg-[#111413] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-red-400 font-display">هشدار: بازگردانی به متون اولیه</h3>
            <p className="text-xs text-[#c0c8c4] leading-relaxed">
              آیا مطمئن هستید که می‌خواهید تمام تغییرات خود را پاک کرده و تمام قیمت‌ها، متون و سوالات متداول را به حالت کارخانه‌ای اولیه آکادمی بازگردانید؟
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs text-[#c0c8c4] hover:text-white"
              >
                انصراف
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                بله، بازگردانی شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
