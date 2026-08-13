import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { BookingStatus, BookingRequest } from '../../types';
import { Phone, Calendar, Clock, Trash2, CheckCircle2, MessageSquare, AlertCircle, Search, Filter } from 'lucide-react';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';

interface BookingsManagerProps {
  onNotify: (msg: string) => void;
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({ onNotify }) => {
  const { content, updateBookingStatus, deleteBooking } = useContent();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useModalBackHandler(!!deleteId, () => setDeleteId(null), 'bookingDeleteModal');

  const statusBadges: Record<BookingStatus, { label: string; color: string }> = {
    New: { label: 'جدید (بررسی نشده)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    Contacted: { label: 'تماس گرفته شد', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    Confirmed: { label: 'تایید شده / رزرو نهایی', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    Completed: { label: 'کلاس برگزار شد', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    Cancelled: { label: 'لغو شده', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
  };

  const filteredBookings = (content.bookings || []).filter((b) => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesSearch =
      b.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.danceStyle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    updateBookingStatus(id, newStatus);
    onNotify(`وضعیت درخواست به «${statusBadges[newStatus].label}» تغییر یافت`);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBooking(deleteId);
      setDeleteId(null);
      onNotify('درخواست رزرو با موفقیت حذف شد');
    }
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">مدیریت درخواست‌های رزرو و مشاوره</h2>
          <p className="text-xs text-[#c0c8c4]">
            مشاهده، پیگیری و تغییر وضعیت درخواست‌های مشاوره اولیه ثبت‌شده از سمت کاربران
          </p>
        </div>
        <div className="bg-[#181a19] border border-[#e9c349]/30 px-4 py-2 rounded-xl text-xs text-[#e9c349] font-bold">
          مجموع درخواست‌ها: {(content.bookings || []).length} مورد
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-[#e9c349]" />
          <input
            type="text"
            placeholder="جستجوی نام زوج، تلفن یا سبک..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#e9c349] shrink-0" />
          <span className="text-xs text-[#c0c8c4]">فیلتر وضعیت:</span>
          {['ALL', 'New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                filterStatus === st
                  ? 'bg-[#e9c349] text-[#3c2f00] font-bold'
                  : 'bg-[#111413] text-[#c0c8c4] hover:bg-white/5 border border-[#e9c349]/10'
              }`}
            >
              {st === 'ALL' ? 'همه' : statusBadges[st as BookingStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Table / Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-12 text-center text-[#c0c8c4] space-y-2">
            <AlertCircle className="w-8 h-8 text-[#e9c349] mx-auto opacity-60" />
            <p className="text-sm">هیچ درخواستی با مشخصات جستجو یافت نشد.</p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-5 space-y-4 hover:border-[#e9c349]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#e9c349]/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#e9c349] animate-pulse" />
                  <h3 className="text-base font-bold text-[#e2e3e0]">{b.coupleName}</h3>
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full border font-semibold ${
                      statusBadges[b.status].color
                    }`}
                  >
                    {statusBadges[b.status].label}
                  </span>
                </div>

                <div className="text-xs text-[#c0c8c4] font-mono flex items-center gap-1.5 opacity-70">
                  <Clock className="w-3.5 h-3.5 text-[#e9c349]" />
                  <span>ثبت شده در: {b.createdAt}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[#c0c8c4] block">شماره تماس (واتس‌اپ):</span>
                  <a
                    href={`https://wa.me/98${b.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[#e9c349] font-bold flex items-center gap-1 hover:underline"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{b.phone}</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-[#c0c8c4] block">سبک رقص درخواستی:</span>
                  <span className="text-[#e2e3e0] font-bold">{b.danceStyle}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#c0c8c4] block">تاریخ تقریبی عروسی:</span>
                  <span className="text-[#e2e3e0] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#e9c349]" />
                    <span>{b.weddingDate || 'ثبت نشده'}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#c0c8c4] block">زمان پیشنهادی:</span>
                  <span className="text-[#e2e3e0]">{b.preferredTime}</span>
                </div>
              </div>

              {b.notes && (
                <div className="bg-[#111413] p-3 rounded-xl border border-[#e9c349]/10 text-xs text-[#c0c8c4] flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-[#e9c349] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#e9c349] font-semibold block">توضیحات تکمیلی کاربر:</span>
                    <p className="mt-0.5">{b.notes}</p>
                  </div>
                </div>
              )}

              {/* Status change actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9c349]/10">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-[#c0c8c4] ml-2">تغییر وضعیت:</span>
                  {(['New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'] as BookingStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(b.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                        b.status === st
                          ? 'bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/40 font-bold'
                          : 'bg-[#111413] text-[#c0c8c4] hover:bg-white/5'
                      }`}
                    >
                      {statusBadges[st].label.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setDeleteId(b.id)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl cursor-pointer text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف درخواست</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteId(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="bg-[#181a19] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full text-right space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-red-400">حذف درخواست رزرو</h3>
            <p className="text-xs text-[#c0c8c4]">آیا از حذف این درخواست مشاوره اطمینان دارید؟</p>
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
