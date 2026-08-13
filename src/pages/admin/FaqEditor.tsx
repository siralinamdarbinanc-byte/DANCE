import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { FaqItem } from '../../types';
import { Plus, Trash2, Edit, Save, ToggleLeft, ToggleRight, X, AlertTriangle, HelpCircle } from 'lucide-react';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';

interface FaqEditorProps {
  onNotify: (msg: string) => void;
}

export const FaqEditor: React.FC<FaqEditorProps> = ({ onNotify }) => {
  const { content, saveFaq, deleteFaq } = useContent();
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useModalBackHandler(!!editingFaq, () => setEditingFaq(null), 'faqModal');
  useModalBackHandler(!!deleteId, () => setDeleteId(null), 'faqDeleteModal');

  const openNewFaq = () => {
    setEditingFaq({
      id: `faq-${Date.now()}`,
      question: 'سوال جدید...',
      answer: 'پاسخ سوال...',
      category: 'tango',
      order: (content.faqs || []).length + 1,
      active: true,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    saveFaq(editingFaq);
    setEditingFaq(null);
    onNotify('سوال متداول با موفقیت ذخیره شد');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteFaq(deleteId);
      setDeleteId(null);
      onNotify('سوال با موفقیت حذف شد');
    }
  };

  const toggleActive = (faq: FaqItem) => {
    saveFaq({ ...faq, active: !faq.active });
    onNotify(`وضعیت سوال ${!faq.active ? 'فعال' : 'غیرفعال'} شد`);
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">مدیریت سوالات متداول (FAQ)</h2>
          <p className="text-xs text-[#c0c8c4]">
            ایجاد، ویرایش، ترتیب‌بندی و فعال/غیرفعال‌سازی سوالات متداول کاربران
          </p>
        </div>
        <button
          onClick={openNewFaq}
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-5 py-2.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#e9c349]" />
          <span>افزودن سوال جدید</span>
        </button>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {(content.faqs || []).map((faq) => (
          <div
            key={faq.id}
            className={`bg-[#181a19] border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              faq.active ? 'border-[#e9c349]/20' : 'border-gray-800 opacity-60'
            }`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#e9c349] shrink-0" />
                <h3 className="text-sm md:text-base font-bold text-[#e2e3e0]">{faq.question}</h3>
                <span className="text-[10px] bg-[#111413] text-[#e9c349] border border-[#e9c349]/20 px-2 py-0.5 rounded-full">
                  دسته‌بندی: {faq.category}
                </span>
              </div>
              <p className="text-xs text-[#c0c8c4] leading-relaxed pr-6">{faq.answer}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#e9c349]/10">
              <button
                onClick={() => toggleActive(faq)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  faq.active
                    ? 'bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/30'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {faq.active ? <ToggleRight className="w-4 h-4 text-[#e9c349]" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{faq.active ? 'فعال' : 'غیرفعال'}</span>
              </button>

              <button
                onClick={() => setEditingFaq(faq)}
                className="p-2 bg-[#111413] hover:bg-white/5 border border-[#e9c349]/30 text-[#e2e3e0] rounded-xl cursor-pointer"
                title="ویرایش"
              >
                <Edit className="w-4 h-4 text-[#e9c349]" />
              </button>

              <button
                onClick={() => setDeleteId(faq.id)}
                className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl cursor-pointer"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit FAQ Modal */}
      {editingFaq && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingFaq(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 shadow-2xl text-right my-auto">
            <button
              onClick={() => setEditingFaq(null)}
              className="absolute top-4 left-4 p-2 text-[#c0c8c4] hover:text-[#e9c349] hover:bg-white/5 rounded-full flex items-center gap-1 text-xs"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#e9c349] font-display mb-4">ویرایش سوال متداول</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">صورت سوال *</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs md:text-sm text-[#e2e3e0]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">پاسخ سوال *</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full p-3 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">دسته‌بندی</label>
                  <select
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value as any })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  >
                    <option value="tango">تانگو</option>
                    <option value="solo">سولو عروس</option>
                    <option value="general">عمومی</option>
                    <option value="pricing">پکیج‌ها و قیمت‌ها</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={editingFaq.order}
                    onChange={(e) => setEditingFaq({ ...editingFaq, order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e9c349]/20">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 bg-transparent text-[#c0c8c4] text-xs hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs rounded-xl border border-[#e9c349]/40 hover-gold-glow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#e9c349]" />
                  <span>ذخیره سوال</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
              <h3 className="text-lg font-bold">حذف سوال متداول</h3>
            </div>
            <p className="text-xs text-[#c0c8c4]">آیا از حذف این سوال متداول اطمینان دارید؟</p>
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
