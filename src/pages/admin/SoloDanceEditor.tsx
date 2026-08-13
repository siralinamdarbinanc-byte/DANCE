import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { SoloDanceStyle } from '../../types';
import { Plus, Trash2, Edit3, Save, CheckCircle2, Sparkles, Image as ImageIcon, Layers, Eye, EyeOff } from 'lucide-react';

export const SoloDanceEditor: React.FC = () => {
  const { content, saveSoloStyle, deleteSoloStyle, updateSection } = useContent();
  const [editingStyle, setEditingStyle] = useState<SoloDanceStyle | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // General Solo Content Header State
  const [heroBadge, setHeroBadge] = useState<string>(content.soloContent?.hero?.badge || 'دوره تخصصی رقص‌های تک‌نفره (Solo Dance)');
  const [heroTitle, setHeroTitle] = useState<string>(content.soloContent?.hero?.title || 'آموزش رقص‌های تک‌نفره و انفرادی');
  const [heroSubtitle, setHeroSubtitle] = useState<string>(content.soloContent?.hero?.subtitle || 'یادگیری حرفه‌ای سبک‌های عربی، بندری، ایرانی اصیل، هیلز و توئرک با اساتید مجرب.');

  const soloStyles = content.soloDance || [];
  const playlists = content.playlists || [];

  const handleSaveHeader = () => {
    updateSection('soloContent', {
      hero: {
        badge: heroBadge,
        title: heroTitle,
        subtitle: heroSubtitle,
      },
      benefitsTitle: content.soloContent?.benefitsTitle || 'ویژگی‌های انحصاری دوره‌های تک‌نفره',
      benefits: content.soloContent?.benefits || [],
    });
    triggerNotice();
  };

  const triggerNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleCreateNew = () => {
    const newStyle: SoloDanceStyle = {
      id: `solo-${Date.now()}`,
      title: 'سبک جدید رقص تک‌نفره',
      slug: 'custom-style',
      shortDescription: 'توضیحات کوتاه سبک رقص جدید',
      fullDescription: 'توضیحات کامل و جامع برای دوره آموزشی سبک رقص جدید...',
      image: 'https://images.unsplash.com/photo-1545959570-a942ee4ee74a?q=80&w=1200&auto=format&fit=crop',
      category: 'solo',
      level: 'مقدماتی تا پیشرفته',
      duration: '۱ ماه (۵ جلسه)',
      sessions: '۵ جلسه ۹۰ دقیقه‌ای',
      price: '۸,۵۰۰,۰۰۰ تومان',
      features: ['آموزش گام به گام', 'تمرین با موزیک‌های اختصاصی'],
      instructor: 'استاد پرنیان شاهین',
      musicPlaylistId: 'playlist-arabic',
      featured: true,
      active: true,
      buttonText: 'مشاهده جزئیات',
      order: soloStyles.length + 1,
    };
    setEditingStyle(newStyle);
    setIsAdding(true);
  };

  const handleSaveStyle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStyle) return;
    saveSoloStyle(editingStyle);
    setEditingStyle(null);
    setIsAdding(false);
    triggerNotice();
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این سبک تک‌نفره اطمینان دارید؟')) {
      deleteSoloStyle(id);
      triggerNotice();
    }
  };

  return (
    <div className="space-y-10 text-right">
      {savedNotice && (
        <div className="bg-[#063b2f] border border-[#e9c349] text-[#e2e3e0] px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#e9c349]" />
          <span className="text-xs font-bold">تغییرات با موفقیت ذخیره شد.</span>
        </div>
      )}

      {/* Section Header Settings */}
      <div className="bg-[#111413] border border-[#e9c349]/20 p-6 rounded-3xl space-y-4">
        <h3 className="font-display text-lg font-bold text-[#e9c349] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#e9c349]" />
          <span>تنظیمات عمومی و عنوان صفحه رقص‌های تک‌نفره</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#c0c8c4] mb-1 block">بج بالایی هدر (Badge):</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full bg-[#181a19] border border-white/10 text-xs text-[#e2e3e0] p-3 rounded-xl outline-none focus:border-[#e9c349]"
            />
          </div>

          <div>
            <label className="text-xs text-[#c0c8c4] mb-1 block">عنوان اصلی صفحه (H1):</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full bg-[#181a19] border border-white/10 text-xs text-[#e2e3e0] p-3 rounded-xl outline-none focus:border-[#e9c349]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-[#c0c8c4] mb-1 block">توضیحات زیر عنوان (Subtitle):</label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full bg-[#181a19] border border-white/10 text-xs text-[#e2e3e0] p-3 rounded-xl outline-none focus:border-[#e9c349]"
            />
          </div>
        </div>

        <button
          onClick={handleSaveHeader}
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/30 text-xs px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره عنوان و هدر</span>
        </button>
      </div>

      {/* Solo Dance Styles List & Management */}
      <div className="bg-[#111413] border border-[#e9c349]/20 p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#e9c349] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#e9c349]" />
              <span>مدیریت سبک‌های رقص تک‌نفره (Solo Styles)</span>
            </h3>
            <p className="text-xs text-[#c0c8c4] mt-1">
              شما می‌توانید سبک‌های موجود را ویرایش کنید یا سبک‌های جدید تک‌نفره اضافه نمایید.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن سبک تک‌نفره جدید</span>
          </button>
        </div>

        {/* Form Modal / Inline Editor */}
        {editingStyle && (
          <form
            onSubmit={handleSaveStyle}
            className="bg-[#181a19] border-2 border-[#e9c349] p-6 rounded-3xl space-y-4 animate-fade-in"
          >
            <h4 className="font-bold text-sm text-[#e9c349] border-b border-white/10 pb-2">
              {isAdding ? 'افزودن سبک جدید' : `ویرایش سبک: ${editingStyle.title}`}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#c0c8c4] mb-1 block">عنوان سبک:</label>
                <input
                  type="text"
                  value={editingStyle.title}
                  onChange={(e) => setEditingStyle({ ...editingStyle, title: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#c0c8c4] mb-1 block">نام انگلیسی (Slug):</label>
                <input
                  type="text"
                  value={editingStyle.slug}
                  onChange={(e) => setEditingStyle({ ...editingStyle, slug: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#c0c8c4] mb-1 block">سطح دوره:</label>
                <input
                  type="text"
                  value={editingStyle.level}
                  onChange={(e) => setEditingStyle({ ...editingStyle, level: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                />
              </div>

              <div>
                <label className="text-xs text-[#c0c8c4] mb-1 block">تعداد جلسات:</label>
                <input
                  type="text"
                  value={editingStyle.sessions}
                  onChange={(e) => setEditingStyle({ ...editingStyle, sessions: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                />
              </div>

              <div>
                <label className="text-xs text-[#c0c8c4] mb-1 block">شهریه (تومان):</label>
                <input
                  type="text"
                  value={editingStyle.price}
                  onChange={(e) => setEditingStyle({ ...editingStyle, price: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                />
              </div>

              <div>
                <label className="text-xs text-[#c0c8c4] mb-1 block">استاد / مربی دوره:</label>
                <input
                  type="text"
                  value={editingStyle.instructor}
                  onChange={(e) => setEditingStyle({ ...editingStyle, instructor: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                />
              </div>

              <div>
                <label className="text-xs text-[#c0c8c4] mb-1 block">آدرس تصویر کاور (URL):</label>
                <input
                  type="text"
                  value={editingStyle.image}
                  onChange={(e) => setEditingStyle({ ...editingStyle, image: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                />
              </div>

              <div>
                <label className="text-xs text-[#c0c8c4] mb-1 block">پلی‌لیست صوتی متصل:</label>
                <select
                  value={editingStyle.musicPlaylistId}
                  onChange={(e) => setEditingStyle({ ...editingStyle, musicPlaylistId: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                >
                  <option value="">بدون پلی‌لیست متصل</option>
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.title} ({pl.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-[#c0c8c4] mb-1 block">توضیح کوتاه خلاصه:</label>
                <input
                  type="text"
                  value={editingStyle.shortDescription}
                  onChange={(e) => setEditingStyle({ ...editingStyle, shortDescription: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-[#c0c8c4] mb-1 block">توضیحات کامل دوره:</label>
                <textarea
                  rows={3}
                  value={editingStyle.fullDescription}
                  onChange={(e) => setEditingStyle({ ...editingStyle, fullDescription: e.target.value })}
                  className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-[#e2e3e0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStyle.active}
                    onChange={(e) => setEditingStyle({ ...editingStyle, active: e.target.checked })}
                    className="accent-[#e9c349]"
                  />
                  <span>فعال و نمایش داده شود</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#e2e3e0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStyle.featured}
                    onChange={(e) => setEditingStyle({ ...editingStyle, featured: e.target.checked })}
                    className="accent-[#e9c349]"
                  />
                  <span>نمایش در بخش منتخب صفحه اصلی</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingStyle(null)}
                className="bg-[#111413] text-[#c0c8c4] border border-white/10 text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {/* Styles Cards Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soloStyles.map((style) => (
            <div
              key={style.id}
              className="bg-[#181a19] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={style.image}
                  alt={style.title}
                  className="w-14 h-14 rounded-xl object-cover border border-[#e9c349]/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-[#e9c349] truncate">{style.title}</h5>
                    {!style.active && (
                      <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded">
                        غیرفعال
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#c0c8c4] truncate">{style.shortDescription}</p>
                  <span className="text-[10px] text-[#a0d1c0] font-mono">{style.price}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingStyle(style)}
                  className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] p-2 rounded-xl border border-[#e9c349]/30 transition-all cursor-pointer"
                  title="ویرایش"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(style.id)}
                  className="bg-red-950/40 hover:bg-red-900/60 text-red-300 p-2 rounded-xl border border-red-800/40 transition-all cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
