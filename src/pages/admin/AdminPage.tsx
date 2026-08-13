import React, { useState } from 'react';
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

interface AdminPageProps {
  onNavigateSite: (page: NavigationPage) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateSite }) => {
  const { content, resetToDefaults } = useContent();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  useModalBackHandler(mobileMenuOpen, () => setMobileMenuOpen(false), 'adminMobileMenu');
  useModalBackHandler(showResetModal, () => setShowResetModal(false), 'adminResetModal');

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

  const navItems = [
    { id: 'dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
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
    { id: 'bookings', label: 'درخواست‌های رزرو', icon: Calendar, badge: (content.bookings || []).filter(b => b.status === 'New').length },
    { id: 'settings', label: 'تنظیمات و تماس', icon: Settings },
  ];

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

        <div className="font-display font-bold text-sm text-[#e9c349]">
          پنل مدیریت DANCE ACADEMY
        </div>

        <button
          onClick={() => onNavigateSite('home')}
          className="text-xs text-[#a0d1c0] bg-[#063b2f] border border-[#e9c349]/30 px-3 py-1.5 rounded-xl flex items-center gap-1"
        >
          <span>مشاهده سایت</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#e9c349]" />
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 right-0 z-40 w-72 h-screen bg-[#111413] border-l border-[#e9c349]/20 flex flex-col justify-between p-6 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'max-md:translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="border-b border-[#e9c349]/20 pb-4 space-y-1">
            <div className="font-display text-xl font-bold text-[#e9c349]">
              DANCE ACADEMY
            </div>
            <p className="text-[11px] text-[#c0c8c4]">سیستم مدیریت محتوای اختصاصی</p>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
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
                  className={`w-full p-3 rounded-xl text-xs md:text-sm font-medium flex items-center justify-between transition-all cursor-pointer ${
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
            className="w-full py-2.5 bg-[#181a19] hover:bg-white/5 border border-[#e9c349]/30 text-[#e9c349] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>بازگشت به نمایش اصلی سایت</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="w-full py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 text-red-300 text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>بازگردانی به متون اولیه آکادمی</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full min-h-screen pt-6 md:pt-10">
        {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} onNotify={notify} />}
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
        {activeTab === 'bookings' && <BookingsManager onNotify={notify} />}
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
