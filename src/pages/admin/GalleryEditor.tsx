import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { GalleryItem } from '../../types';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';

interface GalleryEditorProps {
  onNotify: (msg: string) => void;
}

export const GalleryEditor: React.FC<GalleryEditorProps> = ({ onNotify }) => {
  const { content, saveGalleryItem, deleteGalleryItem } = useContent();
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useModalBackHandler(!!editingItem, () => setEditingItem(null), 'galEditorModal');
  useModalBackHandler(!!deleteId, () => setDeleteId(null), 'galEditorDeleteModal');

  const openNewItem = () => {
    setEditingItem({
      id: `gal-${Date.now()}`,
      title: 'عنوان تصویر...',
      category: 'tango',
      imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80',
      coupleName: 'سامان و فرنوش',
      dateStr: '۱۴۰۲/۱۲/۲۰',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    saveGalleryItem(editingItem);
    setEditingItem(null);
    onNotify('تصویر گالری با موفقیت ذخیره شد');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGalleryItem(deleteId);
      setDeleteId(null);
      onNotify('تصویر با موفقیت حذف شد');
    }
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">مدیریت گالری تصاویر و پروژه‌ها</h2>
          <p className="text-xs text-[#c0c8c4]">
            اضافه کردن نمونه کارها، عکس زوج‌ها و اجراهای استودیو
          </p>
        </div>
        <button
          onClick={openNewItem}
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-5 py-2.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#e9c349]" />
          <span>افزودن تصویر جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {content.gallery.map((item) => (
          <div
            key={item.id}
            className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-48 overflow-hidden bg-[#111413]">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 bg-[#111413]/80 border border-[#e9c349]/30 text-[#e9c349] text-[10px] px-2.5 py-0.5 rounded-full">
                {item.category}
              </span>
            </div>

            <div className="p-4 space-y-1.5 flex-1">
              <h3 className="text-sm font-bold text-[#e2e3e0]">{item.title}</h3>
              {item.coupleName && <p className="text-xs text-[#c0c8c4]">زوج: {item.coupleName}</p>}
              {item.dateStr && <p className="text-[11px] text-[#e9c349]/70">{item.dateStr}</p>}
            </div>

            <div className="p-3 bg-[#111413]/50 border-t border-[#e9c349]/10 flex gap-2">
              <button
                onClick={() => setEditingItem(item)}
                className="flex-1 py-1.5 bg-[#111413] hover:bg-white/5 border border-[#e9c349]/30 text-[#e2e3e0] text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#e9c349]" />
                <span>ویرایش</span>
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Gallery Modal */}
      {editingItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up overflow-y-auto"
        >
          <div className="relative w-full max-w-lg bg-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 shadow-2xl text-right my-auto">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 left-4 p-2 text-[#c0c8c4] hover:text-[#e9c349] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#e9c349] font-display mb-4">ویرایش تصویر گالری</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">عنوان تصویر *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">لینک آدرس تصویر (URL) *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={editingItem.imageUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">دسته‌بندی</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  >
                    <option value="tango">تانگو</option>
                    <option value="bride-solo">سولو عروس</option>
                    <option value="group">گروهی و ساقدوش</option>
                    <option value="backstage">پشت صحنه استودیو</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">نام زوج (اختیاری)</label>
                  <input
                    type="text"
                    value={editingItem.coupleName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, coupleName: e.target.value })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e9c349]/20">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-transparent text-[#c0c8c4] text-xs hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs rounded-xl border border-[#e9c349]/40 hover-gold-glow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#e9c349]" />
                  <span>ذخیره تصویر</span>
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
            <h3 className="text-lg font-bold text-red-400">حذف تصویر گالری</h3>
            <p className="text-xs text-[#c0c8c4]">آیا از حذف این تصویر اطمینان دارید؟</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-xs text-[#c0c8c4]">
                انصراف
              </button>
              <button onClick={handleDelete} className="px-5 py-2 bg-red-800 text-white font-bold text-xs rounded-xl">
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
