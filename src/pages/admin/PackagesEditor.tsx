import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { PackageOption } from '../../types';
import { Plus, Trash2, Edit, Save, Check, Sparkles, X, AlertTriangle } from 'lucide-react';

interface PackagesEditorProps {
  onNotify: (msg: string) => void;
}

export const PackagesEditor: React.FC<PackagesEditorProps> = ({ onNotify }) => {
  const { content, savePackage, deletePackage } = useContent();
  const [editingPkg, setEditingPkg] = useState<PackageOption | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState<string>('');

  const openNewPackage = () => {
    setEditingPkg({
      id: `pkg-${Date.now()}`,
      title: 'پکیج جدید',
      subtitle: 'توضیحات کوتاه پکیج',
      sessions: 5,
      price: '۱۵,۰۰۰,۰۰۰ تومان',
      isPopular: false,
      features: ['۵ جلسه تمرین اختصاصی', 'طراحی رقص ویژه'],
    });
    setFeatureInput('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    savePackage(editingPkg);
    setEditingPkg(null);
    onNotify('پکیج و قیمت با موفقیت ذخیره شد');
  };

  const handleDelete = () => {
    if (deleteModalId) {
      deletePackage(deleteModalId);
      setDeleteModalId(null);
      onNotify('پکیج با موفقیت حذف شد');
    }
  };

  const addFeature = () => {
    if (!featureInput.trim() || !editingPkg) return;
    setEditingPkg({
      ...editingPkg,
      features: [...editingPkg.features, featureInput.trim()],
    });
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    if (!editingPkg) return;
    setEditingPkg({
      ...editingPkg,
      features: editingPkg.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">مدیریت پکیج‌ها و قیمت‌ها</h2>
          <p className="text-xs text-[#c0c8c4]">
            قیمت‌ها و ویژگی‌های کلیه پکیج‌ها را ویرایش کنید. تغییرات بلافاصله در تمام صفحات سایت اعمال می‌شود.
          </p>
        </div>
        <button
          onClick={openNewPackage}
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-5 py-2.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#e9c349]" />
          <span>افزودن پکیج جدید</span>
        </button>
      </div>

      {/* Package List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(content.packages || []).map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-[#181a19] border rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
              pkg.isPopular ? 'border-[#e9c349] shadow-lg shadow-[#063b2f]/40' : 'border-[#e9c349]/20'
            }`}
          >
            {pkg.isPopular && (
              <span className="absolute -top-3 right-4 bg-[#e9c349] text-[#3c2f00] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                محبوب‌ترین
              </span>
            )}

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#e2e3e0] font-display">{pkg.title}</h3>
              <p className="text-xs text-[#c0c8c4]">{pkg.subtitle}</p>

              <div className="bg-[#111413] p-3 rounded-xl border border-[#e9c349]/15 text-center my-3">
                <span className="text-xl font-bold text-[#e9c349]">{pkg.price}</span>
                <span className="block text-[11px] text-[#c0c8c4] mt-0.5">{pkg.sessions} جلسه تمرین</span>
              </div>

              <ul className="space-y-1.5 text-xs text-[#c0c8c4]">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#e9c349] shrink-0" />
                    <span className="line-clamp-1">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 mt-6 border-t border-[#e9c349]/10 flex gap-2">
              <button
                onClick={() => setEditingPkg(pkg)}
                className="flex-1 py-2 bg-[#111413] hover:bg-white/5 border border-[#e9c349]/30 text-[#e2e3e0] text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Edit className="w-3.5 h-3.5 text-[#e9c349]" />
                <span>ویرایش</span>
              </button>
              <button
                onClick={() => setDeleteModalId(pkg.id)}
                className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs rounded-xl transition-all cursor-pointer"
                title="حذف پکیج"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-xl bg-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingPkg(null)}
              className="absolute top-4 left-4 p-2 text-[#c0c8c4] hover:text-[#e9c349] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#e9c349] font-display mb-4">
              ویرایش اطلاعات پکیج
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">نام پکیج *</label>
                <input
                  type="text"
                  required
                  value={editingPkg.title}
                  onChange={(e) => setEditingPkg({ ...editingPkg, title: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">توضیح کوتاه یا زیرعنوان</label>
                <input
                  type="text"
                  value={editingPkg.subtitle}
                  onChange={(e) => setEditingPkg({ ...editingPkg, subtitle: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">قیمت نمایش داده شده (تومان) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً ۲۲,۰۰۰,۰۰۰ تومان"
                    value={editingPkg.price}
                    onChange={(e) => setEditingPkg({ ...editingPkg, price: e.target.value })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e9c349] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">تعداد جلسات</label>
                  <input
                    type="number"
                    min={1}
                    value={editingPkg.sessions}
                    onChange={(e) => setEditingPkg({ ...editingPkg, sessions: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={editingPkg.isPopular || false}
                  onChange={(e) => setEditingPkg({ ...editingPkg, isPopular: e.target.checked })}
                  className="accent-[#e9c349] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isPopular" className="text-xs text-[#e2e3e0] cursor-pointer">
                  علامت‌گذاری به عنوان «پکیج محبوب پیشنهاد آکادمی»
                </label>
              </div>

              {/* Features List Manager */}
              <div className="space-y-2 pt-2 border-t border-[#e9c349]/15">
                <label className="block text-xs font-bold text-[#e9c349]">ویژگی‌ها و خدمات پکیج</label>
                <div className="space-y-1.5">
                  {editingPkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#111413] p-2 rounded-lg border border-[#e9c349]/10">
                      <span className="text-xs text-[#c0c8c4] flex-1">{feat}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="افزودن ویژگی جدید..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    className="flex-1 p-2 bg-[#111413] border border-[#e9c349]/20 rounded-lg text-xs text-[#e2e3e0]"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-[#063b2f] text-[#a0d1c0] font-bold text-xs rounded-lg border border-[#e9c349]/30"
                  >
                    افزودن
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e9c349]/20">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 bg-transparent text-[#c0c8c4] text-xs hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs rounded-xl border border-[#e9c349]/40 hover-gold-glow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#e9c349]" />
                  <span>ذخیره پکیج</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#181a19] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full text-right space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">تایید حذف پکیج</h3>
            </div>
            <p className="text-xs text-[#c0c8c4] leading-relaxed">
              آیا از حذف این پکیج اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 text-xs text-[#c0c8c4] hover:text-white"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
