import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { DanceStyle } from '../../types';
import { Plus, Trash2, Edit, Save, X, AlertTriangle } from 'lucide-react';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';

interface StylesEditorProps {
  onNotify: (msg: string) => void;
}

export const StylesEditor: React.FC<StylesEditorProps> = ({ onNotify }) => {
  const { content, saveStyle, deleteStyle } = useContent();
  const [editingStyle, setEditingStyle] = useState<DanceStyle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useModalBackHandler(!!editingStyle, () => setEditingStyle(null), 'styleEditorModal');
  useModalBackHandler(!!deleteId, () => setDeleteId(null), 'styleEditorDeleteModal');

  const openNewStyle = () => {
    setEditingStyle({
      id: `style-${Date.now()}`,
      titleFa: 'سبک جدید',
      titleEn: 'New Dance Style',
      badge: 'ویژه عروسی',
      shortDesc: 'توضیح کوتاه سبک رقص...',
      fullDesc: 'توضیحات جامع و کامل درباره حرکت‌ها و موسیقی سبک...',
      heroImage: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80',
      secondaryImage: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80',
      recommendedSessions: 6,
      difficulty: 'متوسط',
      features: ['طراحی اختصاصی', 'تمرین با کفش اصلی'],
      recommendedMusic: ['Por Una Cabeza', 'La Cumparsita'],
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStyle) return;
    saveStyle(editingStyle);
    setEditingStyle(null);
    onNotify('سبک رقص با موفقیت ذخیره شد');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteStyle(deleteId);
      setDeleteId(null);
      onNotify('سبک رقص با موفقیت حذف شد');
    }
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">مدیریت سبک‌های رقص (Dance Styles)</h2>
          <p className="text-xs text-[#c0c8c4]">
            اضافه کردن سبک‌های جدید (تانگو، والس، ایرانی تلفیقی، رقص چاقو، ساقدوش‌ها) و ویرایش جزئیات
          </p>
        </div>
        <button
          onClick={openNewStyle}
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-5 py-2.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#e9c349]" />
          <span>افزودن سبک رقص جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.styles.map((style) => (
          <div
            key={style.id}
            className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-40 overflow-hidden">
              <img src={style.heroImage} alt={style.titleFa} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181a19] via-transparent to-transparent" />
              <span className="absolute top-3 right-3 bg-[#e9c349] text-[#3c2f00] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {style.badge}
              </span>
            </div>

            <div className="p-5 space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#e2e3e0] font-display">{style.titleFa}</h3>
                <span className="text-xs font-mono text-[#e9c349] opacity-80">{style.titleEn}</span>
              </div>
              <p className="text-xs text-[#c0c8c4] line-clamp-2 leading-relaxed">{style.shortDesc}</p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-[#a0d1c0]">
                <span>تعداد جلسات: {style.recommendedSessions} جلسه</span>
                <span>درجه سختی: {style.difficulty}</span>
              </div>
            </div>

            <div className="p-4 bg-[#111413]/50 border-t border-[#e9c349]/10 flex gap-2">
              <button
                onClick={() => setEditingStyle(style)}
                className="flex-1 py-2 bg-[#111413] hover:bg-white/5 border border-[#e9c349]/30 text-[#e2e3e0] text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Edit className="w-3.5 h-3.5 text-[#e9c349]" />
                <span>ویرایش سبک</span>
              </button>
              <button
                onClick={() => setDeleteId(style.id)}
                className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl cursor-pointer"
                title="حذف سبک"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Style Modal */}
      {editingStyle && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingStyle(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 shadow-2xl text-right max-h-[90vh] overflow-y-auto my-auto">
            <button
              onClick={() => setEditingStyle(null)}
              className="absolute top-4 left-4 p-2 text-[#c0c8c4] hover:text-[#e9c349] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#e9c349] font-display mb-4">ویرایش اطلاعات سبک رقص</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">عنوان فارسی *</label>
                  <input
                    type="text"
                    required
                    value={editingStyle.titleFa}
                    onChange={(e) => setEditingStyle({ ...editingStyle, titleFa: e.target.value })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">عنوان انگلیسی</label>
                  <input
                    type="text"
                    value={editingStyle.titleEn}
                    onChange={(e) => setEditingStyle({ ...editingStyle, titleEn: e.target.value })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] text-left font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">برچسب (Badge)</label>
                <input
                  type="text"
                  value={editingStyle.badge}
                  onChange={(e) => setEditingStyle({ ...editingStyle, badge: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">توضیح کوتاه خلاصه</label>
                <input
                  type="text"
                  value={editingStyle.shortDesc}
                  onChange={(e) => setEditingStyle({ ...editingStyle, shortDesc: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">توضیحات کامل جامع</label>
                <textarea
                  rows={3}
                  value={editingStyle.fullDesc}
                  onChange={(e) => setEditingStyle({ ...editingStyle, fullDesc: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">لینک تصویر اصلی (Hero Image)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingStyle.heroImage}
                    onChange={(e) => setEditingStyle({ ...editingStyle, heroImage: e.target.value })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] text-left font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">لینک تصویر دوم (Secondary Image)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingStyle.secondaryImage}
                    onChange={(e) => setEditingStyle({ ...editingStyle, secondaryImage: e.target.value })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] text-left font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">تعداد جلسات پیشنهادی</label>
                  <input
                    type="number"
                    value={editingStyle.recommendedSessions}
                    onChange={(e) => setEditingStyle({ ...editingStyle, recommendedSessions: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">درجه سختی</label>
                  <select
                    value={editingStyle.difficulty}
                    onChange={(e) => setEditingStyle({ ...editingStyle, difficulty: e.target.value as any })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  >
                    <option value="آسان">آسان</option>
                    <option value="متوسط">متوسط</option>
                    <option value="پیشرفته">پیشرفته</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e9c349]/20">
                <button
                  type="button"
                  onClick={() => setEditingStyle(null)}
                  className="px-4 py-2 bg-transparent text-[#c0c8c4] text-xs hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs rounded-xl border border-[#e9c349]/40 hover-gold-glow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#e9c349]" />
                  <span>ذخیره اطلاعات سبک</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteId(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="bg-[#181a19] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full text-right space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">حذف سبک رقص</h3>
            </div>
            <p className="text-xs text-[#c0c8c4]">آیا از حذف این سبک رقص اطمینان دارید؟</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-xs text-[#c0c8c4]">
                انصراف
              </button>
              <button onClick={handleDelete} className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-xl">
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
