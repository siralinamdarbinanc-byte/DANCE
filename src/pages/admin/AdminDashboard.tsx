import React from 'react';
import { useContent } from '../../context/ContentContext';
import { Sparkles, Calendar, DollarSign, HelpCircle, Users, Layers, MessageSquare, ArrowUpRight, Download, Upload, Phone } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onNotify: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, onNotify }) => {
  const { content, exportJSON, importJSON } = useContent();

  const bookingsList = content.bookings || [];
  const packagesList = content.packages || [];
  const faqsList = content.faqs || [];
  const instructorsList = content.instructors || [];

  const newBookingsCount = bookingsList.filter((b) => b.status === 'New').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const success = importJSON(text);
        if (success) {
          onNotify('فایل پشتیبان محتوا با موفقیت بازگردانی شد');
        } else {
          onNotify('خطا در خواندن فایل پشتیبان');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 text-right">
      {/* Welcome & Stats Row */}
      <div className="bg-gradient-to-r from-[#063b2f] via-[#111413] to-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#e9c349] text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>پنل مدیریت محتوای آکادمی DANCE ACADEMY</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#e2e3e0] font-display">
              خوش آمدید مدیر محترم
            </h1>
            <p className="text-xs md:text-sm text-[#c0c8c4] max-w-xl leading-relaxed">
              از این بخش می‌توانید تمام متن‌ها، پکیج‌ها و قیمت‌ها، سوالات متداول، لیست اساتید و درخواست‌های رزرو زوج‌ها را به‌صورت زنده مدیریت کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={exportJSON}
              className="bg-[#111413] hover:bg-[#1f2321] text-[#e9c349] border border-[#e9c349]/30 text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل پشتیبان (JSON)</span>
            </button>

            <label className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] border border-[#e9c349]/40 text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 font-bold hover-gold-glow">
              <Upload className="w-4 h-4 text-[#e9c349]" />
              <span>بارگذاری فایل بکاپ</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('bookings')}
          className="bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/60 rounded-2xl p-5 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#c0c8c4] font-medium">درخواست‌های مشاوره</span>
            <div className="p-2 bg-[#063b2f] rounded-xl text-[#e9c349]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#e2e3e0] font-display">{bookingsList.length}</span>
            {newBookingsCount > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                {newBookingsCount} مورد جدید
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('packages')}
          className="bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/60 rounded-2xl p-5 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#c0c8c4] font-medium">پکیج‌ها و قیمت‌ها</span>
            <div className="p-2 bg-[#063b2f] rounded-xl text-[#e9c349]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#e2e3e0] font-display">{packagesList.length}</span>
            <span className="text-xs text-[#a0d1c0]">فعال در سایت</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('faqs')}
          className="bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/60 rounded-2xl p-5 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#c0c8c4] font-medium">سوالات متداول (FAQ)</span>
            <div className="p-2 bg-[#063b2f] rounded-xl text-[#e9c349]">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#e2e3e0] font-display">{faqsList.length}</span>
            <span className="text-xs text-[#a0d1c0]">سوال فعال</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('instructors')}
          className="bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/60 rounded-2xl p-5 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#c0c8c4] font-medium">اساتید بین‌المللی</span>
            <div className="p-2 bg-[#063b2f] rounded-xl text-[#e9c349]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#e2e3e0] font-display">{instructorsList.length}</span>
            <span className="text-xs text-[#a0d1c0]">مربی برجسته</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#e2e3e0] font-display border-b border-[#e9c349]/20 pb-2">
          دسترسی سریع به ویرایشگرها
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'home', title: 'ویرایش صفحه اصلی', desc: 'تغییر متون بنر، آمارهای صفحه اول و عنوان‌ها', icon: Layers },
            { id: 'tango', title: 'ویرایش صفحه تانگو', desc: 'متون «چرا تانگو؟»، بنر و جزئیات سبک تانگو', icon: Sparkles },
            { id: 'brideSolo', title: 'ویرایش سولو عروس', desc: 'متون ورودی عروس، نکات کلیدی و طراحی حرکت', icon: Users },
            { id: 'packages', title: 'پکیج‌ها و قیمت‌ها', desc: 'ویرایش مستقیم قیمت‌های پکیج ۳، ۶ و ۸ جلسه‌ای', icon: DollarSign },
            { id: 'faqs', title: 'سوالات متداول FAQ', desc: 'افزودن و ویرایش پاسخ به سوالات رایج زوج‌ها', icon: HelpCircle },
            { id: 'bookings', title: 'مدیریت رزروها', desc: 'مشاهده درخواست‌های جدید و تغییر وضعیت', icon: Calendar },
          ].map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className="bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/60 p-5 rounded-2xl cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="space-y-1 pr-1">
                  <h4 className="text-sm font-bold text-[#e2e3e0] group-hover:text-[#e9c349] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#c0c8c4] leading-relaxed">{item.desc}</p>
                </div>
                <div className="p-2 bg-[#111413] rounded-xl border border-[#e9c349]/20 shrink-0 text-[#e9c349] group-hover:bg-[#063b2f] transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Booking Requests */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e9c349]/10 pb-3">
          <h3 className="text-base font-bold text-[#e2e3e0] font-display">آخرین درخواست‌های ثبت‌شده</h3>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs text-[#e9c349] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>مشاهده همه</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {bookingsList.slice(0, 3).map((b) => (
            <div key={b.id} className="bg-[#111413] p-4 rounded-xl border border-[#e9c349]/15 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#e2e3e0]">{b.coupleName}</span>
                  <span className="text-[10px] bg-[#063b2f] text-[#a0d1c0] px-2 py-0.5 rounded-full border border-[#e9c349]/20">
                    {b.danceStyle}
                  </span>
                </div>
                <div className="text-xs text-[#c0c8c4] flex items-center gap-3">
                  <span>تاریخ عروسی: {b.weddingDate}</span>
                  <span>ثبت: {b.createdAt}</span>
                </div>
              </div>

              <a
                href={`https://wa.me/98${b.phone.replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/30 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-[#084b3c]"
              >
                <Phone className="w-3.5 h-3.5 text-[#e9c349]" />
                <span>واتس‌اپ</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
