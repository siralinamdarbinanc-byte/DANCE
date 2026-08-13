import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { MapPin, Phone, Clock, Mail, Instagram, MessageCircle, Send, Sparkles, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { content, addBooking } = useContent();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const branches = content.branches || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      addBooking({
        coupleName: name,
        phone,
        danceStyle: 'پیام از فرم تماس',
        weddingDate: '',
        preferredTime: '',
        notes: message,
      });
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full min-h-screen text-right pt-24 pb-16 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-[#e9c349] text-xs font-bold uppercase tracking-wider border border-[#e9c349]/30 px-3 py-1 rounded-full">
          تماس با آکادمی
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#e2e3e0] font-display">
          ارتباط با DANCE ACADEMY
        </h1>
        <p className="text-xs md:text-sm text-[#c0c8c4]">
          جهت مشاوره حضوری، بازدید از استودیو VIP و هماهنگی ساعات تمرین پذیرای شما هستیم.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info & Branches */}
        <div className="space-y-8">
          {/* Branch 1 */}
          <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-[#e9c349] font-display flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#e9c349]" />
              <span>شعبه الهیه (مرکزی VIP)</span>
            </h3>
            <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed">
              تهران، خیابان فرشته (شهید بیدارلو)، برج تجاری-اداری داریوش، طبقه ۶، واحد ۶۰۴
            </p>
            <div className="pt-2 text-xs text-[#e2e3e0] flex flex-wrap gap-4">
              <span>تلفن: <strong dir="ltr" className="font-mono">۰۲۱-۲۲۶۵۹۰۸۰</strong></span>
              <span>همراه / واتس‌اپ: <strong dir="ltr" className="font-mono">۰۹۱۲-۸۸۸۳۰۰۲</strong></span>
            </div>
          </div>

          {/* Branch 2 */}
          <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-[#e9c349] font-display flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#e9c349]" />
              <span>شعبه نیاوران</span>
            </h3>
            <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed">
              تهران، نیاوران، خیابان شهید باهنر، نرسیده به میدان باهنر، مجتمع VIP البرز
            </p>
            <div className="pt-2 text-xs text-[#e2e3e0] flex flex-wrap gap-4">
              <span>تلفن: <strong dir="ltr" className="font-mono">۰۲۱-۲۶۱۱۴۵۹۰</strong></span>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-[#e2e3e0] font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#e9c349]" />
              <span>ساعات کاری استودیو</span>
            </h3>
            <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed">
              شنبه تا پنج‌شنبه: ۱۰:۰۰ صبح الی ۲۱:۰۰ شب (با هماهنگی قبلی)
              <br />
              جمعه‌ها و ایام تعطیل: ویژه جلسات فشرده اختصاصی VIP
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 md:p-8 shadow-xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-[#e2e3e0] font-display mb-2">
                ارسال پیام مستقیم به مشاورین
              </h3>
              <p className="text-xs text-[#c0c8c4] mb-4">
                سوال یا درخواست خود را مطرح کنید تا در سریع‌ترین زمان پاسخگوی شما باشیم.
              </p>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">نام شما *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فرنوش احمدی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">شماره تماس *</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="۰۹۱۲..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0] text-right focus:border-[#e9c349] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">متن پیام یا سوال شما</label>
                <textarea
                  rows={4}
                  placeholder="توضیحات در مورد تاریخ عروسی، سبک مورد علاقه یا تالار..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold py-3.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#e9c349]" />
                <span>ارسال پیام</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#e9c349] mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold text-[#e2e3e0] font-display">پیام شما دریافت شد</h3>
              <p className="text-xs md:text-sm text-[#c0c8c4]">
                با تشکر، مشاورین آکادمی به زودی با شما تماس خواهند گرفت.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
