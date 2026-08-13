import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { Instructor } from '../../types';
import { Plus, Trash2, Edit, Save, X, User } from 'lucide-react';

interface InstructorsEditorProps {
  onNotify: (msg: string) => void;
}

export const InstructorsEditor: React.FC<InstructorsEditorProps> = ({ onNotify }) => {
  const { content, saveInstructor, deleteInstructor } = useContent();
  const [editingInst, setEditingInst] = useState<Instructor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNewInstructor = () => {
    setEditingInst({
      id: `inst-${Date.now()}`,
      name: 'استاد جدید',
      title: 'طراح رقص بین‌المللی',
      specialty: 'تانگو و طراحی ورودی عروس',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80',
      bio: 'توضیحات بیوگرافی استاد و سابقه فعالیت هنری...',
      experienceYears: 8,
      choreographiesCount: 150,
      featuredStyles: ['تانگوی عروس', 'سولو عروس'],
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst) return;
    saveInstructor(editingInst);
    setEditingInst(null);
    onNotify('اطلاعات استاد با موفقیت ذخیره شد');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteInstructor(deleteId);
      setDeleteId(null);
      onNotify('استاد با موفقیت حذف شد');
    }
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">مدیریت اساتید و مربیان</h2>
          <p className="text-xs text-[#c0c8c4]">
            افزودن و ویرایش رزومه اساتید، عکس پروفایل، سال‌های سابقه و تعداد طراحی رقص‌ها
          </p>
        </div>
        <button
          onClick={openNewInstructor}
          className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-5 py-2.5 rounded-xl border border-[#e9c349]/40 hover-gold-glow cursor-pointer transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#e9c349]" />
          <span>افزودن استاد جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.instructors.map((inst) => (
          <div
            key={inst.id}
            className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-56 overflow-hidden bg-[#111413]">
              <img src={inst.image} alt={inst.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181a19] via-transparent to-transparent" />
            </div>

            <div className="p-5 space-y-2 flex-1">
              <h3 className="text-lg font-bold text-[#e2e3e0] font-display">{inst.name}</h3>
              <p className="text-xs text-[#e9c349] font-semibold">{inst.title}</p>
              <p className="text-xs text-[#c0c8c4] line-clamp-3 leading-relaxed">{inst.bio}</p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#a0d1c0] font-mono">
                <span>{inst.experienceYears} سال سابقه</span>
                <span>{inst.choreographiesCount}+ طراحی رقص</span>
              </div>
            </div>

            <div className="p-3 bg-[#111413]/50 border-t border-[#e9c349]/10 flex gap-2">
              <button
                onClick={() => setEditingInst(inst)}
                className="flex-1 py-1.5 bg-[#111413] hover:bg-white/5 border border-[#e9c349]/30 text-[#e2e3e0] text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#e9c349]" />
                <span>ویرایش استاد</span>
              </button>
              <button
                onClick={() => setDeleteId(inst.id)}
                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Instructor Modal */}
      {editingInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-xl bg-[#181a19] border border-[#e9c349]/30 rounded-2xl p-6 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingInst(null)}
              className="absolute top-4 left-4 p-2 text-[#c0c8c4] hover:text-[#e9c349] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#e9c349] font-display mb-4">ویرایش رزومه استاد</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    required
                    value={editingInst.name}
                    onChange={(e) => setEditingInst({ ...editingInst, name: e.target.value })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">عنوان شغلی / افتخار *</label>
                  <input
                    type="text"
                    required
                    value={editingInst.title}
                    onChange={(e) => setEditingInst({ ...editingInst, title: e.target.value })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">تخصص اصلی</label>
                <input
                  type="text"
                  value={editingInst.specialty}
                  onChange={(e) => setEditingInst({ ...editingInst, specialty: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">بیوگرافی و سوابق *</label>
                <textarea
                  rows={4}
                  required
                  value={editingInst.bio}
                  onChange={(e) => setEditingInst({ ...editingInst, bio: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#c0c8c4] mb-1">لینک تصویر عکس (URL) *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={editingInst.image}
                  onChange={(e) => setEditingInst({ ...editingInst, image: e.target.value })}
                  className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">سابقه (سال)</label>
                  <input
                    type="number"
                    value={editingInst.experienceYears}
                    onChange={(e) => setEditingInst({ ...editingInst, experienceYears: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#c0c8c4] mb-1">تعداد طراحی رقص موفق</label>
                  <input
                    type="number"
                    value={editingInst.choreographiesCount}
                    onChange={(e) => setEditingInst({ ...editingInst, choreographiesCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e9c349]/20">
                <button
                  type="button"
                  onClick={() => setEditingInst(null)}
                  className="px-4 py-2 bg-transparent text-[#c0c8c4] text-xs hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs rounded-xl border border-[#e9c349]/40 hover-gold-glow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#e9c349]" />
                  <span>ذخیره استاد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#181a19] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full text-right space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-red-400">حذف استاد</h3>
            <p className="text-xs text-[#c0c8c4]">آیا از حذف این استاد اطمینان دارید؟</p>
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
