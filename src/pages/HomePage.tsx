import React, { useState } from 'react';
import { NavigationPage } from '../types';
import { useContent } from '../context/ContentContext';
import { Sparkles, Calendar, Star, ArrowLeft, CheckCircle, Flame, Music, Play, Award } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenBooking: (defaultStyle?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenBooking }) => {
  const { content } = useContent();
  const [weddingWeeks, setWeddingWeeks] = useState<number>(4);

  // Interactive calculation for estimated recommended sessions
  const calculatedSessions = Math.min(10, Math.max(3, Math.round(weddingWeeks * 1.5)));

  return (
    <div className="w-full min-h-screen text-right">
      {/* Hero Banner */}
      <section className="relative min-h-[90vh] md:min-h-[920px] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="bg-cover bg-center w-full h-full absolute inset-0 opacity-45 scale-105"
            style={{ backgroundImage: `url('${content.home?.heroImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111413] via-[#111413]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111413] via-transparent to-[#111413]/70" />
        </div>

        <div className="relative z-10 text-center px-4 md:px-12 max-w-5xl mx-auto flex flex-col items-center gap-6 pt-12">
          <div className="inline-flex items-center gap-2 border border-[#e9c349]/40 bg-[#af8d11]/20 px-4 py-1.5 rounded-full text-xs md:text-sm text-[#e9c349] font-medium backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>{content.home?.hero?.badge || 'آکادمی بین‌المللی رقص عروس و داماد DANCE ACADEMY'}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-[#e9c349] leading-tight drop-shadow-2xl animate-fade-in-up">
            {content.home?.hero?.title || 'خلق درخشان‌ترین صحنه فیلم عروسی شما'}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#c0c8c4] max-w-3xl mx-auto leading-relaxed">
            {content.home?.hero?.subtitle || 'آموزش اختصاصی تانگوی سینمایی، رقص سولو عروس و والس کلاسیک.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <button
              onClick={() => onOpenBooking()}
              className="w-full sm:w-auto bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-base px-8 py-4 rounded-full border border-[#e9c349]/40 hover-gold-glow transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#063b2f]/50"
            >
              <Calendar className="w-5 h-5 text-[#e9c349]" />
              <span>{content.home?.hero?.primaryButton || 'رزرو جلسه تست و مشاوره رایگان'}</span>
            </button>

            <button
              onClick={() => onNavigate('tango')}
              className="w-full sm:w-auto bg-[#181a19]/80 hover:bg-[#181a19] text-[#e2e3e0] border border-[#e9c349]/20 font-medium text-base px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{content.home?.hero?.secondaryButton || 'مشاهده پکیج‌های تانگو'}</span>
              <ArrowLeft className="w-4 h-4 text-[#e9c349]" />
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-12 bg-[#181a19]/80 backdrop-blur-xl border border-[#e9c349]/20 p-4 rounded-2xl">
            <div className="p-2 border-l border-[#e9c349]/15 last:border-0 text-center">
              <span className="block text-2xl font-bold text-[#e9c349] font-display">{content.home?.stats?.couplesCount || '+۵۰۰'}</span>
              <span className="text-xs text-[#c0c8c4]">زوج آموزش دیده</span>
            </div>
            <div className="p-2 border-l border-[#e9c349]/15 last:border-0 text-center">
              <span className="block text-2xl font-bold text-[#e9c349] font-display">{content.home?.stats?.experienceYears || '۱۲ سال'}</span>
              <span className="text-xs text-[#c0c8c4]">سابقه تدریس تخصصی</span>
            </div>
            <div className="p-2 border-l border-[#e9c349]/15 last:border-0 text-center">
              <span className="block text-2xl font-bold text-[#e9c349] font-display">{content.home?.stats?.branchesCount || '۲ شعبه'}</span>
              <span className="text-xs text-[#c0c8c4]">الهیه و نیاوران</span>
            </div>
            <div className="p-2 text-center">
              <span className="block text-2xl font-bold text-[#e9c349] font-display">{content.home?.stats?.guaranteeText || '۱۰۰٪'}</span>
              <span className="text-xs text-[#c0c8c4]">تضمین آمادگی روز عروسی</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Style Card Grid */}
      <section className="py-20 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-[#e9c349]/15 pb-6">
          <div>
            <span className="text-[#e9c349] text-xs font-bold uppercase tracking-wider">سبک‌های رقص آکادمی</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#e2e3e0] font-display mt-1">
              سبک اختصاصی عروسی خود را کشف کنید
            </h2>
          </div>
          <button
            onClick={() => onNavigate('styles')}
            className="text-[#e9c349] text-sm font-semibold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>مشاهده جزئیات همه سبک‌ها</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(content.styles || []).map((style) => (
            <div
              key={style.id}
              className="group bg-[#181a19] border border-[#e9c349]/20 rounded-2xl overflow-hidden hover:border-[#e9c349]/60 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={style.heroImage}
                    alt={style.titleFa}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181a19] via-transparent to-transparent" />
                  <span className="absolute top-4 right-4 bg-[#063b2f]/90 text-[#a0d1c0] border border-[#e9c349]/30 text-xs px-3 py-1 rounded-full backdrop-blur-md">
                    {style.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-[#e2e3e0] font-display group-hover:text-[#e9c349] transition-colors">
                    {style.titleFa}
                  </h3>
                  <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed line-clamp-3">
                    {style.shortDesc}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#e9c349] border-t border-[#e9c349]/10">
                    <span>پیشنهاد: {style.recommendedSessions} جلسه</span>
                    <span>سطح: {style.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    if (style.id === 'tango') onNavigate('tango');
                    else if (style.id === 'bride-solo') onNavigate('bride-solo');
                    else onNavigate('styles');
                  }}
                  className="w-full py-2.5 bg-[#111413] hover:bg-[#af8d11]/20 border border-[#e9c349]/30 text-[#e2e3e0] hover:text-[#e9c349] font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>مشاهده جزئیات و فیلم نمونه</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Session Estimator Tool */}
      <section className="py-16 px-4 md:px-12 max-w-5xl mx-auto">
        <div className="bg-[#181a19] border border-[#e9c349]/30 rounded-3xl p-6 md:p-10 shadow-2xl glass-panel relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-[#e9c349] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>محاسبه‌گر هوشمند زمان تمرین</span>
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-[#e2e3e0] mt-2 mb-4 font-display">
              چند جلسه تمرین برای رقص عروسی شما کافی است؟
            </h3>
            <p className="text-xs md:text-sm text-[#c0c8c4] mb-8">
              بر اساس تعداد هفته‌های باقی‌مانده تا تاریخ مراسم، برنامه زمان‌بندی پیشنهادی آکادمی را دریافت کنید:
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-[#c0c8c4]">زمان باقی‌مانده تا عروسی:</span>
                  <span className="text-[#e9c349] font-bold">{weddingWeeks} هفته (حدود {weddingWeeks * 7} روز)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={weddingWeeks}
                  onChange={(e) => setWeddingWeeks(Number(e.target.value))}
                  className="w-full accent-[#e9c349] h-2 bg-[#111413] rounded-lg cursor-pointer"
                />
              </div>

              {/* Result Box */}
              <div className="bg-[#111413] p-5 rounded-2xl border border-[#e9c349]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-[#c0c8c4]">پیشنهاد آکادمی برای شما:</span>
                  <p className="text-lg font-bold text-[#e9c349]">
                    پکیج اختصاصی {calculatedSessions} جلسه‌ای
                  </p>
                  <p className="text-xs text-[#c0c8c4]">
                    {weddingWeeks <= 2
                      ? 'کلاس‌های فشرده اکسپرس ۳ روز در هفته'
                      : 'کلاس‌های ارام و منظم ۱ الی ۲ روز در هفته'}
                  </p>
                </div>

                <button
                  onClick={() => onOpenBooking(`پکیج ${calculatedSessions} جلسه‌ای`)}
                  className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-6 py-3 rounded-full border border-[#e9c349]/30 shrink-0 cursor-pointer transition-all hover-gold-glow"
                >
                  رزرو مشاوره این پکیج
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solo Dance & Music Previews Section */}
      <section className="py-16 px-4 md:px-12 max-w-7xl mx-auto space-y-12">
        {/* Solo Dance Banner Card */}
        <div className="bg-[#181a19] border border-[#e9c349]/30 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-2xl relative overflow-hidden">
          <div className="space-y-4">
            <span className="text-xs text-[#a0d1c0] bg-[#063b2f] border border-[#e9c349]/30 px-3 py-1 rounded-full inline-block">
              جدید • رقص‌های تک‌نفره (Solo Dance)
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-[#e9c349]">
              آموزش انفرادی رقص‌های عربی، بندری، ایرانی، هیلز و توئرک
            </h2>
            <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed">
              دوره‌های تخصصی انفرادی با اساتید مجرب در محیطی کاملاً خصوصی و لاکچری. مناسب افرادی که می‌خواهند تکنیک‌های ناز دست، لرزش شانه و ایقاع‌شناسی را تسلط یابند.
            </p>
            <button
              onClick={() => onNavigate('solo-dance')}
              className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs md:text-sm font-bold px-6 py-3 rounded-full transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#e9c349]" />
              <span>مشاهده و ثبت‌نام دوره‌های تک‌نفره</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#e9c349]/20 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1545959570-a942ee4ee74a?q=80&w=1200&auto=format&fit=crop"
              alt="Solo Dance"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181a19] via-transparent to-transparent opacity-60" />
          </div>
        </div>

        {/* Music & Playlists Banner Card */}
        <div className="bg-[#181a19] border border-[#e9c349]/30 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-2xl relative overflow-hidden">
          <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden aspect-video border border-[#e9c349]/20 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
              alt="Music Library"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181a19] via-transparent to-transparent opacity-60" />
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <span className="text-xs text-[#a0d1c0] bg-[#063b2f] border border-[#e9c349]/30 px-3 py-1 rounded-full inline-block">
              جدید • آرشیو صوتی و پلی‌لیست‌ها
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-[#e9c349]">
              آرشیو تخصصی موزیک‌های تانگو، بندری، ایرانی و عربی
            </h2>
            <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed">
              استماع آنلاین و تمرین با برترین موزیک‌های ویرایش شده آکادمی. امکان دانلود فایل‌ها برای موزیک‌های مجاز.
            </p>
            <button
              onClick={() => onNavigate('music')}
              className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs md:text-sm font-bold px-6 py-3 rounded-full transition-all cursor-pointer flex items-center gap-2"
            >
              <Music className="w-4 h-4 text-[#e9c349]" />
              <span>ورود به آرشیو صوتی و پلی‌لیست‌ها</span>
            </button>
          </div>
        </div>
      </section>

      {/* Instructors Preview */}
      <section className="py-20 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[#e9c349] text-xs font-bold uppercase">اساتید بین‌المللی آکادمی</span>
          <h2 className="text-2xl md:text-4xl font-bold text-[#e2e3e0] font-display">
            کادر طراحان و مربیان برجسته
          </h2>
          <p className="text-xs md:text-sm text-[#c0c8c4]">
            تمرین تحت نظر بااستعدادترین اساتید رقص بین‌المللی با صبوری و دقت بالا
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(content.instructors || []).map((ins) => (
            <div
              key={ins.id}
              className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 text-center hover:border-[#e9c349]/50 transition-all group"
            >
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-[#e9c349] p-1 mb-4">
                <img
                  src={ins.image}
                  alt={ins.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h3 className="text-lg font-bold text-[#e2e3e0] font-display mb-1">{ins.name}</h3>
              <p className="text-xs text-[#e9c349] font-medium mb-3">{ins.title}</p>
              <p className="text-xs text-[#c0c8c4] leading-relaxed mb-4 line-clamp-3">{ins.bio}</p>

              <div className="pt-3 border-t border-[#e9c349]/10 flex justify-around text-xs text-[#c0c8c4]">
                <div>
                  <span className="font-bold text-[#e2e3e0] block">{ins.experienceYears} سال</span>
                  <span>سابقه</span>
                </div>
                <div>
                  <span className="font-bold text-[#e2e3e0] block">+{ins.choreographiesCount}</span>
                  <span>طراحی رقص</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => onNavigate('instructors')}
            className="bg-[#181a19] hover:bg-[#af8d11]/20 border border-[#e9c349]/30 text-[#e9c349] text-xs font-bold px-6 py-3 rounded-full transition-all cursor-pointer"
          >
            مشاهده پروفایل کامل مربیان
          </button>
        </div>
      </section>

      {/* Student Couple Reviews */}
      <section className="py-16 px-4 md:px-12 max-w-7xl mx-auto bg-[#0c0f0e] rounded-3xl border border-[#e9c349]/15 p-8 md:p-12 my-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[#e9c349] text-xs font-bold uppercase">تجربه هنرجویان آکادمی</span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#e2e3e0] font-display">
            نظرات زوج‌های DANCE ACADEMY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(content.testimonials || []).map((t) => (
            <div key={t.id} className="bg-[#181a19] border border-[#e9c349]/15 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-1 text-[#e9c349]">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed italic">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-[#e9c349]/10">
                <img
                  src={t.image}
                  alt={t.coupleName}
                  className="w-10 h-10 rounded-full object-cover border border-[#e9c349]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#e2e3e0]">{t.coupleName}</h4>
                  <span className="text-[10px] text-[#e9c349]">{t.style}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

