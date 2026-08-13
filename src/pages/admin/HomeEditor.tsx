import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { Sparkles, Save, CheckCircle2, RotateCcw } from 'lucide-react';

interface HomeEditorProps {
  onNotify: (msg: string) => void;
}

export const HomeEditor: React.FC<HomeEditorProps> = ({ onNotify }) => {
  const { content, updateSection } = useContent();
  const [formData, setFormData] = useState(content.home);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSection('home', formData);
    onNotify('محتوای صفحه اصلی با موفقیت ذخیره شد');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-right">
      <div className="flex items-center justify-between border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">ویرایش محتوای صفحه اصلی (HomePage)</h2>
          <p className="text-xs text-[#c0c8c4]">عنوان‌ها، توضیحات هیرو، آمار و بخش‌های اصلی صفحه اول</p>
        </div>
        <button
          type="submit"
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-6 py-2.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#e9c349]" />
          <span>ذخیره تغییرات صفحه اصلی</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#e9c349] font-display border-b border-[#e9c349]/10 pb-2">
          بخش بنر اصلی (Hero)
        </h3>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">برچسب بالای عنوان اصلی</label>
          <input
            type="text"
            value={formData.hero.badge}
            onChange={(e) =>
              setFormData({ ...formData, hero: { ...formData.hero, badge: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">عنوان اصلی (H1)</label>
          <input
            type="text"
            value={formData.hero.title}
            onChange={(e) =>
              setFormData({ ...formData, hero: { ...formData.hero, title: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm font-bold text-[#e9c349] focus:border-[#e9c349] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">توضیحات زیر عنوان</label>
          <textarea
            rows={3}
            value={formData.hero.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, hero: { ...formData.hero, subtitle: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">متن دکمه اصلی (CTA اصلی)</label>
            <input
              type="text"
              value={formData.hero.primaryButton}
              onChange={(e) =>
                setFormData({ ...formData, hero: { ...formData.hero, primaryButton: e.target.value } })
              }
              className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">متن دکمه دوم</label>
            <input
              type="text"
              value={formData.hero.secondaryButton}
              onChange={(e) =>
                setFormData({ ...formData, hero: { ...formData.hero, secondaryButton: e.target.value } })
              }
              className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0] focus:border-[#e9c349] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#e9c349] font-display border-b border-[#e9c349]/10 pb-2">
          آمار و افتخارات آکادمی (نوار سریع)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">تعداد زوج‌های آموزش دیده</label>
            <input
              type="text"
              value={formData.stats.couplesCount}
              onChange={(e) =>
                setFormData({ ...formData, stats: { ...formData.stats, couplesCount: e.target.value } })
              }
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs font-bold text-[#e9c349]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">سابقه تدریس تخصصی</label>
            <input
              type="text"
              value={formData.stats.experienceYears}
              onChange={(e) =>
                setFormData({ ...formData, stats: { ...formData.stats, experienceYears: e.target.value } })
              }
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs font-bold text-[#e9c349]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">تعداد شعب</label>
            <input
              type="text"
              value={formData.stats.branchesCount}
              onChange={(e) =>
                setFormData({ ...formData, stats: { ...formData.stats, branchesCount: e.target.value } })
              }
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs font-bold text-[#e9c349]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">متن تضمین کیفیت</label>
            <input
              type="text"
              value={formData.stats.guaranteeText}
              onChange={(e) =>
                setFormData({ ...formData, stats: { ...formData.stats, guaranteeText: e.target.value } })
              }
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs font-bold text-[#e9c349]"
            />
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#e9c349] font-display border-b border-[#e9c349]/10 pb-2">
          محاسبه‌گر هوشمند زمان تمرین
        </h3>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">عنوان ابزار محاسبه‌گر</label>
          <input
            type="text"
            value={formData.calculator.title}
            onChange={(e) =>
              setFormData({ ...formData, calculator: { ...formData.calculator, title: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">توضیحات راهنما</label>
          <textarea
            rows={2}
            value={formData.calculator.description}
            onChange={(e) =>
              setFormData({ ...formData, calculator: { ...formData.calculator, description: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-sm px-8 py-3 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#e9c349]" />
          <span>ذخیره تغییرات صفحه اصلی</span>
        </button>
      </div>
    </form>
  );
};
