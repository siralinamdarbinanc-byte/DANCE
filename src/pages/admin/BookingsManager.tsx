import React, { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import { BookingStatus, BookingRequest, CrmCustomer, CrmInteraction } from '../../types';
import {
  Phone,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Search,
  Filter,
  User,
  Tag,
  Plus,
  History,
  FileText,
  Send,
  Sparkles,
  Users,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';
import { api } from '../../api/client';

interface BookingsManagerProps {
  onNotify: (msg: string) => void;
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({ onNotify }) => {
  const { content, updateBookingStatus, deleteBooking } = useContent();
  const [viewMode, setViewMode] = useState<'bookings' | 'crm'>('bookings');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // CRM State
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CrmCustomer | null>(null);
  const [customerInteractions, setCustomerInteractions] = useState<CrmInteraction[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [newNoteType, setNewNoteType] = useState<CrmInteraction['type']>('note');
  const [internalNotesEdit, setInternalNotesEdit] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');

  useModalBackHandler(!!deleteId, () => setDeleteId(null), 'bookingDeleteModal');
  useModalBackHandler(!!selectedCustomer, () => setSelectedCustomer(null), 'crmCustomerModal');

  // Load CRM Customers
  useEffect(() => {
    const loadCrm = async () => {
      const apiCusts = await api.fetchCrmCustomers();
      if (apiCusts && apiCusts.length > 0) {
        setCustomers(apiCusts);
      } else {
        // Derive from current bookings in content
        const derivedMap = new Map<string, CrmCustomer>();
        (content.bookings || []).forEach((b) => {
          if (!derivedMap.has(b.phone)) {
            derivedMap.set(b.phone, {
              id: `cust-${b.id}`,
              phone: b.phone,
              coupleName: b.coupleName,
              danceStyle: b.danceStyle,
              weddingDate: b.weddingDate || 'ثبت نشده',
              status: b.status,
              totalBookings: 1,
              internalNotes: b.notes ? `یادداشت اولیه: ${b.notes}` : '',
              tags: [b.danceStyle || 'رقص عروسی', 'مشتری جدید'],
              createdAt: b.createdAt,
              updatedAt: b.createdAt,
            });
          } else {
            const existing = derivedMap.get(b.phone)!;
            existing.totalBookings += 1;
          }
        });
        setCustomers(Array.from(derivedMap.values()));
      }
    };

    loadCrm();
  }, [content.bookings]);

  // Load interactions when a customer is opened
  const handleOpenCustomer = async (cust: CrmCustomer) => {
    setSelectedCustomer(cust);
    setInternalNotesEdit(cust.internalNotes || '');
    const logs = await api.fetchInteractions(cust.phone);
    if (logs && logs.length > 0) {
      setCustomerInteractions(logs);
    } else {
      // Sample initial interaction timeline
      setCustomerInteractions([
        {
          id: `log-init-${Date.now()}`,
          customerPhone: cust.phone,
          type: 'meeting',
          note: `ثبت درخواست مشاوره اولیه رقص (${cust.danceStyle})`,
          author: 'سیستم آنلاین',
          createdAt: cust.createdAt || '1403/05/20',
        },
      ]);
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    const res = await api.addInteraction(selectedCustomer.phone, newNote.trim(), newNoteType);
    const newLog: CrmInteraction = res || {
      id: `log-${Date.now()}`,
      customerPhone: selectedCustomer.phone,
      type: newNoteType,
      note: newNote.trim(),
      author: 'مدیریت آکادمی',
      createdAt: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setCustomerInteractions((prev) => [newLog, ...prev]);
    setNewNote('');
    onNotify('یادداشت جدید به پرونده مشتری اضافه شد');
  };

  const handleSaveInternalNotes = async () => {
    if (!selectedCustomer) return;
    await api.updateCustomerNotes(selectedCustomer.phone, internalNotesEdit, selectedCustomer.tags);
    setCustomers((prev) =>
      prev.map((c) => (c.phone === selectedCustomer.phone ? { ...c, internalNotes: internalNotesEdit } : c))
    );
    setSelectedCustomer((prev) => (prev ? { ...prev, internalNotes: internalNotesEdit } : null));
    onNotify('یادداشت‌های پرونده ذخیره شد');
  };

  const handleAddTag = () => {
    if (!selectedCustomer || !tagInput.trim()) return;
    const updatedTags = [...(selectedCustomer.tags || []), tagInput.trim()];
    setSelectedCustomer({ ...selectedCustomer, tags: updatedTags });
    setCustomers((prev) =>
      prev.map((c) => (c.phone === selectedCustomer.phone ? { ...c, tags: updatedTags } : c))
    );
    api.updateCustomerNotes(selectedCustomer.phone, selectedCustomer.internalNotes, updatedTags);
    setTagInput('');
  };

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

  const filteredCustomers = customers.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.danceStyle.toLowerCase().includes(searchQuery.toLowerCase());
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
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#e9c349] text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>سامانه یکپارچه مدیریت ارتباط با مشتریان (CRM) و رزروها</span>
          </div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">
            مدیریت مشتریان و نوبت‌های رقص
          </h2>
          <p className="text-xs text-[#c0c8c4]">
            پیگیری پرونده زوج‌ها، تاریخچه تماس‌ها، وضعیت رزرو و یادداشت‌های اختصاصی هر هنرجو
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-[#181a19] border border-[#e9c349]/30 p-1.5 rounded-2xl flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setViewMode('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'bookings'
                ? 'bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/40 shadow-md'
                : 'text-[#c0c8c4] hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#e9c349]" />
            <span>لیست درخواست‌های رزرو ({(content.bookings || []).length})</span>
          </button>

          <button
            onClick={() => setViewMode('crm')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'crm'
                ? 'bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/40 shadow-md'
                : 'text-[#c0c8c4] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#e9c349]" />
            <span>پرونده مشتریان CRM ({customers.length})</span>
          </button>
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

      {/* VIEW 1: BOOKINGS LIST */}
      {viewMode === 'bookings' && (
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

                {/* Status change & CRM Open actions */}
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const targetCust = customers.find((c) => c.phone === b.phone) || {
                          id: `cust-${b.id}`,
                          phone: b.phone,
                          coupleName: b.coupleName,
                          danceStyle: b.danceStyle,
                          weddingDate: b.weddingDate || 'ثبت نشده',
                          status: b.status,
                          totalBookings: 1,
                          internalNotes: b.notes || '',
                          tags: [b.danceStyle],
                          createdAt: b.createdAt,
                          updatedAt: b.createdAt,
                        };
                        handleOpenCustomer(targetCust);
                      }}
                      className="px-3 py-1.5 bg-[#063b2f] hover:bg-[#084b3c] border border-[#e9c349]/30 text-[#a0d1c0] rounded-xl cursor-pointer text-xs flex items-center gap-1.5 font-bold"
                    >
                      <User className="w-3.5 h-3.5 text-[#e9c349]" />
                      <span>مشاهده پرونده CRM</span>
                    </button>

                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl cursor-pointer text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: CRM CUSTOMERS GRID */}
      {viewMode === 'crm' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.phone}
              onClick={() => handleOpenCustomer(cust)}
              className="bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#063b2f] border border-[#e9c349]/40 flex items-center justify-center text-[#e9c349]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#e2e3e0] group-hover:text-[#e9c349] transition-colors">
                        {cust.coupleName}
                      </h4>
                      <span className="text-[11px] text-[#c0c8c4] font-mono">{cust.phone}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${statusBadges[cust.status].color}`}>
                    {statusBadges[cust.status].label.split(' ')[0]}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#c0c8c4] bg-[#111413] p-3 rounded-xl border border-[#e9c349]/10">
                  <div className="flex items-center justify-between">
                    <span>سبک انتخابی:</span>
                    <span className="text-[#e2e3e0] font-bold">{cust.danceStyle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تاریخ عروسی:</span>
                    <span className="text-[#e2e3e0]">{cust.weddingDate}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {(cust.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-[#063b2f]/60 text-[#a0d1c0] border border-[#e9c349]/20 px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#e9c349]/10 flex items-center justify-between text-xs text-[#e9c349] font-bold">
                <span>باز کردن پرونده کامل و تاریخچه</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRM Customer Profile & Timeline Modal */}
      {selectedCustomer && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCustomer(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <div className="bg-[#181a19] border border-[#e9c349]/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-right space-y-6 shadow-2xl relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e9c349]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#063b2f] border border-[#e9c349]/40 rounded-2xl text-[#e9c349]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#e2e3e0] font-display">
                    پرونده مشتری: {selectedCustomer.coupleName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#c0c8c4] mt-0.5">
                    <span className="font-mono text-[#e9c349]">{selectedCustomer.phone}</span>
                    <span>• سبک: {selectedCustomer.danceStyle}</span>
                    <span>• تاریخ عروسی: {selectedCustomer.weddingDate}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3 py-1.5 bg-[#111413] hover:bg-white/5 border border-white/10 text-[#c0c8c4] rounded-full text-xs font-bold"
              >
                بستن
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-[#111413] p-3 rounded-2xl border border-[#e9c349]/20">
              <a
                href={`https://wa.me/98${selectedCustomer.phone.replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/30 text-xs px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#084b3c]"
              >
                <Phone className="w-4 h-4 text-[#e9c349]" />
                <span>پیام در واتس‌اپ</span>
              </a>

              <a
                href={`tel:${selectedCustomer.phone}`}
                className="bg-[#181a19] text-[#e2e3e0] border border-white/10 text-xs px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5"
              >
                <Phone className="w-4 h-4 text-[#e9c349]" />
                <span>تماس مستقیم</span>
              </a>
            </div>

            {/* Tags Management */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#e2e3e0] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#e9c349]" />
                <span>برچسب‌های مشتری (Tags):</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {(selectedCustomer.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/30 px-3 py-1 rounded-xl"
                  >
                    #{t}
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="برچسب جدید..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="bg-[#111413] border border-[#e9c349]/20 text-xs text-white px-2.5 py-1 rounded-lg w-28 outline-none"
                  />
                  <button
                    onClick={handleAddTag}
                    className="p-1 bg-[#e9c349] text-[#111413] rounded-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#e2e3e0] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#e9c349]" />
                <span>یادداشت‌های محرمانه پرسنل و مربی:</span>
              </label>
              <textarea
                rows={3}
                value={internalNotesEdit}
                onChange={(e) => setInternalNotesEdit(e.target.value)}
                placeholder="نکات مهم مانند: آهنگ مورد علاقه، محدودیت حرکتی، سطح آمادگی، ترجیح تایم و..."
                className="w-full bg-[#111413] border border-[#e9c349]/20 rounded-xl p-3 text-xs text-[#e2e3e0] outline-none focus:border-[#e9c349]"
              />
              <button
                onClick={handleSaveInternalNotes}
                className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] border border-[#e9c349]/30 text-xs px-4 py-1.5 rounded-xl font-bold cursor-pointer"
              >
                ذخیره یادداشت پرونده
              </button>
            </div>

            {/* Interactions Timeline */}
            <div className="space-y-3 pt-2 border-t border-[#e9c349]/15">
              <h4 className="text-xs font-bold text-[#e2e3e0] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#e9c349]" />
                <span>تاریخچه تعاملات و پیگیری‌ها:</span>
              </h4>

              {/* Add Interaction Form */}
              <form onSubmit={handleAddInteraction} className="flex gap-2">
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as any)}
                  className="bg-[#111413] border border-[#e9c349]/20 text-xs text-[#e2e3e0] rounded-xl px-2 outline-none"
                >
                  <option value="call">تماس تلفنی</option>
                  <option value="meeting">جلسه حضوری / تست</option>
                  <option value="music_choice">انتخاب موزیک</option>
                  <option value="note">یادداشت کلی</option>
                </select>

                <input
                  type="text"
                  placeholder="ثبت گزارش پیگیری جدید..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 bg-[#111413] border border-[#e9c349]/20 text-xs text-white px-3 py-2 rounded-xl outline-none"
                />

                <button
                  type="submit"
                  className="bg-[#e9c349] text-[#111413] px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 hover:brightness-110 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ثبت</span>
                </button>
              </form>

              {/* Timeline Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customerInteractions.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#111413] border border-[#e9c349]/10 rounded-xl p-3 text-xs text-[#c0c8c4] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#e2e3e0]">
                          {log.type === 'call' && '📞 تماس تلفنی'}
                          {log.type === 'meeting' && '🤝 جلسه / تست حضوری'}
                          {log.type === 'music_choice' && '🎵 انتخاب موزیک'}
                          {log.type === 'note' && '📝 یادداشت پیگیری'}
                          {log.type === 'status_change' && '🔄 تغییر وضعیت'}
                        </span>
                        <span className="text-[10px] text-[#e9c349]">توسط {log.author}</span>
                      </div>
                      <p className="text-[#e2e3e0] text-xs">{log.note}</p>
                    </div>
                    <span className="text-[10px] font-mono opacity-60 shrink-0">{log.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
