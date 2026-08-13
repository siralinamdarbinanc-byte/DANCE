import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { Save } from 'lucide-react';

interface ContactAndSettingsEditorProps {
  onNotify: (msg: string) => void;
}

export const ContactAndSettingsEditor: React.FC<ContactAndSettingsEditorProps> = ({ onNotify }) => {
  const { content, updateSection } = useContent();
  const [academyData, setAcademyData] = useState(content.academy);
  const [socialData, setSocialData] = useState(content.social);
  const [branchesData, setBranchesData] = useState(content.branches);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSection('academy', academyData);
    updateSection('social', socialData);
    updateSection('branches', branchesData);
    onNotify('تنظیمات تماس، شعب و شبکه‌های اجتماعی با موفقیت ذخیره شد');
  };

  const updateBranchField = (index: number, field: string, val: string) => {
    const updated = [...branchesData];
    updated[index] = { ...updated[index], [field]: val };
    setBranchesData(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-right">
      <div className="flex items-center justify-between border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">تنظیمات عمومی، شعب و تماس</h2>
          <p className="text-xs text-[#c0c8c4]">ویرایش شماره تلفن‌ها، آدرس شعب VIP، لینک‌های شبکه اجتماعی و متن‌های لوگو</p>
        </div>
        <button
          type="submit"
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-6 py-2.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#e9c349]" />
          <span>ذخیره تنظیمات</span>
        </button>
      </div>

      {/* Academy General Info */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#e9c349] font-display border-b border-[#e9c349]/10 pb-2">
          اطلاعات اصلی برند و تماس تلفنی
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#c0c8c4] mb-1">نام آکادمی</label>
            <input
              type="text"
              value={academyData.name}
              onChange={(e) => setAcademyData({ ...academyData, name: e.target.value })}
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#c0c8c4] mb-1">شعار برند (Tagline)</label>
            <input
              type="text"
              value={academyData.tagline}
              onChange={(e) => setAcademyData({ ...academyData, tagline: e.target.value })}
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#c0c8c4] mb-1">شماره تلفن ثابت اصلی</label>
            <input
              type="text"
              value={academyData.phoneMain}
              onChange={(e) => setAcademyData({ ...academyData, phoneMain: e.target.value })}
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#c0c8c4] mb-1">شماره همراه و واتس‌اپ</label>
            <input
              type="text"
              value={academyData.phoneMobile}
              onChange={(e) => setAcademyData({ ...academyData, phoneMobile: e.target.value })}
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#c0c8c4] mb-1">ساعات کاری آکادمی</label>
          <input
            type="text"
            value={academyData.workingHours}
            onChange={(e) => setAcademyData({ ...academyData, workingHours: e.target.value })}
            className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#e9c349] font-display border-b border-[#e9c349]/10 pb-2">
          لینک شبکه‌های اجتماعی و پیام‌رسان‌ها
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#c0c8c4] mb-1">اینستاگرام (URL)</label>
            <input
              type="text"
              dir="ltr"
              value={socialData.instagram}
              onChange={(e) => setSocialData({ ...socialData, instagram: e.target.value })}
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] text-left font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-[#c0c8c4] mb-1">واتس‌اپ (URL)</label>
            <input
              type="text"
              dir="ltr"
              value={socialData.whatsapp}
              onChange={(e) => setSocialData({ ...socialData, whatsapp: e.target.value })}
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] text-left font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-[#c0c8c4] mb-1">تلگرام (URL)</label>
            <input
              type="text"
              dir="ltr"
              value={socialData.telegram}
              onChange={(e) => setSocialData({ ...socialData, telegram: e.target.value })}
              className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] text-left font-mono"
            />
          </div>
        </div>
      </div>

      {/* Branches Info */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#e9c349] font-display border-b border-[#e9c349]/10 pb-2">
          شعب استودیو VIP
        </h3>

        <div className="space-y-6">
          {branchesData.map((branch, idx) => (
            <div key={branch.id} className="bg-[#111413] p-4 rounded-xl border border-[#e9c349]/15 space-y-3">
              <h4 className="text-sm font-bold text-[#e9c349]">{branch.name}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#c0c8c4] mb-1">نام شعبه</label>
                  <input
                    type="text"
                    value={branch.name}
                    onChange={(e) => updateBranchField(idx, 'name', e.target.value)}
                    className="w-full p-2 bg-[#181a19] border border-[#e9c349]/20 rounded-lg text-xs text-[#e2e3e0]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#c0c8c4] mb-1">تلفن مستقیم شعبه</label>
                  <input
                    type="text"
                    value={branch.phone}
                    onChange={(e) => updateBranchField(idx, 'phone', e.target.value)}
                    className="w-full p-2 bg-[#181a19] border border-[#e9c349]/20 rounded-lg text-xs text-[#e2e3e0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#c0c8c4] mb-1">آدرس دقیق شعبه</label>
                <input
                  type="text"
                  value={branch.address}
                  onChange={(e) => updateBranchField(idx, 'address', e.target.value)}
                  className="w-full p-2 bg-[#181a19] border border-[#e9c349]/20 rounded-lg text-xs text-[#e2e3e0]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-sm px-8 py-3 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#e9c349]" />
          <span>ذخیره کلیه تنظیمات</span>
        </button>
      </div>
    </form>
  );
};
