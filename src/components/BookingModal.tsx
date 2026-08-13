import React, { useState } from 'react';
import { X, Calendar, User, Phone, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { BookingForm } from '../types';
import { useContent } from '../context/ContentContext';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStyle?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, defaultStyle }) => {
  const { addBooking, content } = useContent();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<BookingForm>({
    coupleName: '',
    phone: '',
    danceStyle: defaultStyle || 'تانگوی عروس و داماد',
    weddingDate: '',
    preferredTime: 'عصرها (۱۷ الی ۲۱)',
    notes: '',
  });

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  useModalBackHandler(isOpen, resetAndClose, 'bookingModal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.coupleName || !formData.phone) return;
    
    // Persist booking request to central CMS context & localStorage!
    addBooking(formData);
    setSubmitted(true);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 md:p-8 shadow-2xl text-right overflow-hidden my-auto">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#063b2f] rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#af8d11] rounded-full blur-3xl opacity-20 pointer-events-none" />

        {/* Top Header Bar with Close/Back Button */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e9c349]/20 relative z-10">
          <div className="flex items-center gap-2 text-[#e9c349] text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>مشاوره و تست حضوری اولیه رایگان</span>
          </div>

          <button
            onClick={resetAndClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111413] hover:bg-[#202422] border border-[#e9c349]/40 text-[#e2e3e0] hover:text-[#e9c349] rounded-full text-xs font-bold transition-all cursor-pointer shadow-md"
            title="بستن پنجره (یا کلید بازگشت گوشی)"
          >
            <X className="w-4 h-4" />
            <span>بستن</span>
          </button>
        </div>

        {!submitted ? (
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-[#e2e3e0] mb-2 font-display">
              رزرو جلسه مشاوره رقص عروسی
            </h3>
            <p className="text-xs md:text-sm text-[#c0c8c4] mb-6">
              جهت دریافت آنالیز سبک، انتخاب موزیک و رزرو زمان تمرین در استودیو VIP فرم زیر را تکمیل کنید.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Couple Name */}
              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1.5">
                  نام و نام خانوادگی زوج (یا عروس/داماد) *
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3 w-4 h-4 text-[#e9c349]" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: سامان و فرنوش"
                    value={formData.coupleName}
                    onChange={(e) => setFormData({ ...formData, coupleName: e.target.value })}
                    className="w-full pr-10 pl-4 py-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-sm text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1.5">
                  شماره تماس همراه (جهت هماهنگی واتس‌اپ) *
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 w-4 h-4 text-[#e9c349]" />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="۰۹۱۲..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pr-10 pl-4 py-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-sm text-[#e2e3e0] text-right focus:border-[#e9c349] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Dance Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#c0c8c4] mb-1.5">
                    سبک رقص مورد علاقه
                  </label>
                  <select
                    value={formData.danceStyle}
                    onChange={(e) => setFormData({ ...formData, danceStyle: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
                  >
                    {content.styles.map((st) => (
                      <option key={st.id} value={st.titleFa}>
                        {st.titleFa}
                      </option>
                    ))}
                    <option value="ترکیب چند سبک">ترکیب چند سبک (VIP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#c0c8c4] mb-1.5">
                    زمان تقریبی عروسی
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 w-4 h-4 text-[#e9c349]" />
                    <input
                      type="text"
                      placeholder="مثال: ۱ ماه آینده / خرداد ۱۴۰۳"
                      value={formData.weddingDate}
                      onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                      className="w-full pr-10 pl-3 py-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1.5">
                  توضیحات تکمیلی (مثلاً مدل لباس عروس یا سابقه رقص)
                </label>
                <textarea
                  rows={2}
                  placeholder="اگر آهنگ خاصی مد نظرتان هست یا سابقه رقص ندارید بنویسید..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] border border-[#e9c349]/40 font-bold py-3.5 rounded-xl hover-gold-glow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-[#e9c349]" />
                <span>تایید و ارسال درخواست مشاوره</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-[#063b2f] border-2 border-[#e9c349] text-[#e9c349] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#e9c349] font-display">
              درخواست شما با موفقیت ثبت شد
            </h3>
            <p className="text-sm text-[#c0c8c4] max-w-md mx-auto leading-relaxed">
              با تشکر از شما <span className="text-[#e2e3e0] font-bold">{formData.coupleName}</span> عزیز. مشاورین آکادمی تا حداکثر ۲ ساعت آینده جهت هماهنگی اولین جلسه مشاوره و تست حضوری با شماره <span className="font-mono text-[#e9c349]">{formData.phone}</span> تماس خواهند گرفت.
            </p>
            <div className="pt-4">
              <button
                onClick={resetAndClose}
                className="bg-[#e9c349] text-[#3c2f00] font-bold px-8 py-3 rounded-full text-sm hover:bg-[#ffe088] transition-colors cursor-pointer"
              >
                بازگشت به سایت
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

