import React, { useState, useEffect } from 'react';
import { MediaAsset } from '../../types';
import { api } from '../../api/client';
import {
  Upload,
  Image as ImageIcon,
  Music,
  Video,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  HardDrive,
  Cloud,
  FileCheck,
  Search,
  Plus,
  Info,
  Link as LinkIcon,
} from 'lucide-react';

interface MediaR2ManagerProps {
  onNotify: (msg: string) => void;
}

export const MediaR2Manager: React.FC<MediaR2ManagerProps> = ({ onNotify }) => {
  const [assets, setAssets] = useState<MediaAsset[]>([
    {
      id: 'r2-media-1',
      filename: 'tango_masterclass_banner.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
      sizeBytes: 420000,
      createdAt: '1403/05/20',
    },
    {
      id: 'r2-media-2',
      filename: 'wedding_valse_golden_edit.mp3',
      fileType: 'audio',
      mimeType: 'audio/mpeg',
      url: 'https://cdn.freesound.org/previews/530/530415_1648170-lq.mp3',
      sizeBytes: 3800000,
      createdAt: '1403/05/22',
    },
    {
      id: 'r2-media-3',
      filename: 'bride_solo_entrance_preview.mp4',
      fileType: 'video',
      mimeType: 'video/mp4',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-bride-walking-down-the-aisle-41716-large.mp4',
      sizeBytes: 12400000,
      createdAt: '1403/05/24',
    },
  ]);

  const [uploading, setUploading] = useState<boolean>(false);
  const [r2Active, setR2Active] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Direct URL Add Modal/State
  const [showAddUrlModal, setShowAddUrlModal] = useState<boolean>(false);
  const [newUrl, setNewUrl] = useState<string>('');
  const [newFilename, setNewFilename] = useState<string>('');
  const [newFileType, setNewFileType] = useState<'image' | 'audio' | 'video'>('image');
  const [submittingUrl, setSubmittingUrl] = useState<boolean>(false);

  // Load from backend R2/D1 and check health on mount
  useEffect(() => {
    const loadMediaAndHealth = async () => {
      const health = await api.checkHealth();
      setR2Active(health.hasR2);

      const list = await api.fetchMediaList();
      if (list && list.length > 0) {
        setAssets(list);
      }
    };
    loadMediaAndHealth();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      const res = await api.uploadMedia(file);
      if (res && res.asset) {
        setAssets((prev) => [res.asset!, ...prev]);
        onNotify(`فایل «${file.name}» با موفقیت در مخزن ابری R2 ذخیره شد.`);
      } else if (res && res.r2Active === false) {
        onNotify(res.error || 'فضای ابری R2 غیرفعال است. می‌توانید از گزینه افزودن لینک مستقیم استفاده نمایید.');
      } else {
        // Fallback local media asset
        const localType: 'image' | 'audio' | 'video' = file.type.startsWith('audio')
          ? 'audio'
          : file.type.startsWith('video')
          ? 'video'
          : 'image';

        const fallbackAsset: MediaAsset = {
          id: `local-media-${Date.now()}`,
          filename: file.name,
          fileType: localType,
          mimeType: file.type || 'application/octet-stream',
          url: URL.createObjectURL(file),
          sizeBytes: file.size,
          createdAt: new Date().toLocaleDateString('fa-IR'),
        };

        setAssets((prev) => [fallbackAsset, ...prev]);
        onNotify(`فایل «${file.name}» به لیست رسانه‌ها اضافه شد.`);
      }
    } catch (err) {
      onNotify('خطا در پردازش فایل رسانه‌ای');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddDirectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      onNotify('لطفاً آدرس لینک فایل را وارد کنید');
      return;
    }

    setSubmittingUrl(true);
    try {
      const created = await api.addMediaUrl(
        newUrl.trim(),
        newFilename.trim() || 'رسانه اختصاصی',
        newFileType
      );

      if (created) {
        setAssets((prev) => [created, ...prev]);
        onNotify('رسانه جدید با موفقیت ذخیره شد.');
      } else {
        const fallback: MediaAsset = {
          id: `url-media-${Date.now()}`,
          filename: newFilename.trim() || 'رسانه جدید',
          fileType: newFileType,
          mimeType: newFileType === 'audio' ? 'audio/mpeg' : newFileType === 'video' ? 'video/mp4' : 'image/jpeg',
          url: newUrl.trim(),
          sizeBytes: 0,
          createdAt: new Date().toLocaleDateString('fa-IR'),
        };
        setAssets((prev) => [fallback, ...prev]);
        onNotify('رسانه جدید در لیست ثبت شد.');
      }

      setNewUrl('');
      setNewFilename('');
      setShowAddUrlModal(false);
    } catch (e) {
      onNotify('خطا در ثبت لینک رسانه');
    } finally {
      setSubmittingUrl(false);
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onNotify('آدرس فایل در کلیپ‌بورد کپی شد');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    await api.deleteMedia(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    onNotify('فایل از لیست رسانه‌ها حذف شد');
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return 'لینک مستقیم (CDN)';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredAssets = assets.filter((item) => {
    const matchesType = filterType === 'ALL' || item.fileType === filterType;
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#e9c349] text-xs font-semibold mb-1">
            <Cloud className="w-4 h-4" />
            <span>مدیریت فایل‌ها و رسانه‌ها (Cloudflare Storage & CDN)</span>
          </div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">
            مخزن رسانه‌ای (عکس، موزیک و ویدیو)
          </h2>
          <p className="text-xs text-[#c0c8c4]">
            فایل‌های باکیفیت آکادمی را مدیریت کنید و از لینک پرسرعت آن‌ها در بخش‌های مختلف سایت استفاده نمایید.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddUrlModal(true)}
            className="bg-[#181a19] hover:bg-[#063b2f] text-[#e9c349] border border-[#e9c349]/30 font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن با لینک مستقیم (URL)</span>
          </button>

          <label className="bg-gradient-to-r from-[#e9c349] to-[#c9a329] text-[#111413] hover:brightness-110 font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-lg flex items-center gap-2 text-xs shrink-0">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'در حال پردازش...' : 'آپلود فایل'}</span>
            <input
              type="file"
              accept="image/*,audio/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* R2 Cloud Status Banner */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#063b2f] border border-[#e9c349]/30 rounded-xl text-[#e9c349]">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#e2e3e0]">وضعیت ذخیره‌سازی ابری:</span>
              {r2Active ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <FileCheck className="w-3 h-3" />
                  <span>باکت Cloudflare R2 فعال</span>
                </span>
              ) : (
                <span className="text-[10px] bg-[#e9c349]/20 text-[#e9c349] px-2.5 py-0.5 rounded-full border border-[#e9c349]/30 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>اختیاری (فعال‌سازی در آینده بدون نیاز به تغییر کد)</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#c0c8c4] mt-0.5">
              {r2Active
                ? 'پشتیبانی از ترافیک نامحدود Egress بدون کارمزد و کش ابری پرسرعت Edge CDN'
                : 'سیستم آماده است و می‌توانید هم‌اکنون از لینک‌های پرسرعت CDN و تصاویر آنلاین استفاده فرمایید.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-left">
            <span className="text-[#c0c8c4] block text-[10px]">تعداد کل رسانه‌ها:</span>
            <span className="text-[#e9c349] font-bold">{assets.length} فایل</span>
          </div>
        </div>
      </div>

      {/* Add Direct URL Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181a19] border border-[#e9c349]/40 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-[#e9c349]/20 pb-3">
              <div className="flex items-center gap-2 text-[#e9c349]">
                <LinkIcon className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#e2e3e0]">افزودن رسانه با لینک مستقیم (URL)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUrlModal(false)}
                className="text-[#c0c8c4] hover:text-white text-xs cursor-pointer px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDirectUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">
                  نوع رسانه:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'image', label: 'تصویر (عکس)', icon: ImageIcon },
                    { type: 'audio', label: 'صوت (موزیک)', icon: Music },
                    { type: 'video', label: 'ویدیو', icon: Video },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setNewFileType(item.type as any)}
                      className={`p-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        newFileType === item.type
                          ? 'bg-[#e9c349] text-[#111413] font-bold'
                          : 'bg-[#111413] text-[#c0c8c4] border border-[#e9c349]/20'
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">
                  نام / عنوان رسانه:
                </label>
                <input
                  type="text"
                  placeholder="مثال: عکس کاور دوره تانگو"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:outline-none focus:border-[#e9c349]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">
                  آدرس اینترنتی فایل (Direct URL):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/photo.jpg یا https://cdn.com/track.mp3"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  dir="ltr"
                  className="w-full px-3 py-2 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:outline-none focus:border-[#e9c349] font-mono text-left"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUrlModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#c0c8c4] hover:bg-white/5 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submittingUrl}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#e9c349] text-[#111413] hover:brightness-110 cursor-pointer shadow-lg"
                >
                  {submittingUrl ? 'در حال ثبت...' : 'ثبت و ذخیره در دیتابیس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-[#e9c349]" />
          <input
            type="text"
            placeholder="جستجوی نام فایل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-[#c0c8c4] shrink-0">فیلتر نوع:</span>
          {[
            { id: 'ALL', label: 'همه رسانه‌ها' },
            { id: 'image', label: 'تصاویر', icon: ImageIcon },
            { id: 'audio', label: 'موزیک‌ها', icon: Music },
            { id: 'video', label: 'ویدیوها', icon: Video },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all shrink-0 ${
                filterType === item.id
                  ? 'bg-[#e9c349] text-[#3c2f00] font-bold'
                  : 'bg-[#111413] text-[#c0c8c4] hover:bg-white/5 border border-[#e9c349]/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/50 rounded-2xl overflow-hidden space-y-3 transition-all flex flex-col justify-between"
          >
            {/* Preview Box */}
            <div className="relative aspect-video bg-[#111413] flex items-center justify-center overflow-hidden group">
              {asset.fileType === 'image' && (
                <img
                  src={asset.url}
                  alt={asset.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              {asset.fileType === 'audio' && (
                <div className="flex flex-col items-center justify-center text-[#e9c349] p-4 space-y-2">
                  <div className="p-3 bg-[#063b2f] rounded-full">
                    <Music className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] text-[#c0c8c4] font-mono">فایل صوتی MP3</span>
                  <audio src={asset.url} controls className="w-48 h-8 opacity-80" />
                </div>
              )}

              {asset.fileType === 'video' && (
                <div className="flex flex-col items-center justify-center text-[#e9c349] p-4 space-y-2">
                  <div className="p-3 bg-[#063b2f] rounded-full">
                    <Video className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] text-[#c0c8c4] font-mono">فایل ویدیویی MP4</span>
                </div>
              )}

              <span className="absolute top-2 right-2 bg-black/70 text-[#e9c349] text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                {asset.fileType.toUpperCase()}
              </span>
            </div>

            {/* Asset Details */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#e2e3e0] truncate font-mono" title={asset.filename}>
                  {asset.filename}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-[#c0c8c4] mt-1 font-mono">
                  <span>اندازه: {formatSize(asset.sizeBytes)}</span>
                  <span>تاریخ: {asset.createdAt}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#e9c349]/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => copyUrl(asset.id, asset.url)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    copiedId === asset.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#111413] hover:bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/20'
                  }`}
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی لینک</span>
                    </>
                  )}
                </button>

                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-[#111413] hover:bg-white/5 border border-white/10 text-[#c0c8c4] hover:text-[#e9c349] rounded-lg text-xs"
                  title="مشاهده مستقیم"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleDelete(asset.id)}
                  className="p-1.5 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 text-red-400 rounded-lg text-xs cursor-pointer"
                  title="حذف فایل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

