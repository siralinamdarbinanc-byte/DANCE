import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { Save } from 'lucide-react';

interface TangoEditorProps {
  onNotify: (msg: string) => void;
}

export const TangoEditor: React.FC<TangoEditorProps> = ({ onNotify }) => {
  const { content, updateSection } = useContent();
  const [formData, setFormData] = useState(content.tango);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSection('tango', formData);
    onNotify('محتوای صفحه تانگو با موفقیت ذخیره شد');
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updatedFeatures = [...formData.whyTango.features];
    updatedFeatures[index] = val;
    setFormData({
      ...formData,
      whyTango: {
        ...formData.whyTango,
        features: updatedFeatures,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-right">
      <div className="flex items-center justify-between border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">ویرایش صفحه تانگو (TangoPage)</h2>
          <p className="text-xs text-[#c0c8c4]">عنوان‌های اصلی تانگو، بخش «چرا تانگو؟» و ویژگی‌های کلیدی</p>
        </div>
        <button
          type="submit"
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-6 py-2.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#e9c349]" />
          <span>ذخیره تغییرات تانگو</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#e9c349] font-display border-b border-[#e9c349]/10 pb-2">
          بنر اصلی تانگو (Hero)
        </h3>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">برچسب بالای عنوان</label>
          <input
            type="text"
            value={formData.hero.badge}
            onChange={(e) =>
              setFormData({ ...formData, hero: { ...formData.hero, badge: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">عنوان اصلی صفحه تانگو</label>
          <input
            type="text"
            value={formData.hero.title}
            onChange={(e) =>
              setFormData({ ...formData, hero: { ...formData.hero, title: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm font-bold text-[#e9c349]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">توضیحات معرفی تانگو</label>
          <textarea
            rows={3}
            value={formData.hero.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, hero: { ...formData.hero, subtitle: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">متن دکمه رزرو</label>
          <input
            type="text"
            value={formData.hero.buttonText}
            onChange={(e) =>
              setFormData({ ...formData, hero: { ...formData.hero, buttonText: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
          />
        </div>
      </div>

      {/* Why Tango Section */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#e9c349] font-display border-b border-[#e9c349]/10 pb-2">
          بخش «چرا تانگو؟»
        </h3>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">عنوان بخش</label>
          <input
            type="text"
            value={formData.whyTango.title}
            onChange={(e) =>
              setFormData({ ...formData, whyTango: { ...formData.whyTango, title: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs font-bold text-[#e2e3e0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-1">متن جامع توضیحات</label>
          <textarea
            rows={4}
            value={formData.whyTango.description}
            onChange={(e) =>
              setFormData({ ...formData, whyTango: { ...formData.whyTango, description: e.target.value } })
            }
            className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c0c8c4] mb-2">ویژگی‌های سه‌گانه کلیدی</label>
          <div className="space-y-2">
            {formData.whyTango.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-[#e9c349] font-bold w-6">{idx + 1}.</span>
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => handleFeatureChange(idx, e.target.value)}
                  className="flex-1 p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-sm px-8 py-3 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#e9c349]" />
          <span>ذخیره تغییرات تانگو</span>
        </button>
      </div>
    </form>
  );
};
