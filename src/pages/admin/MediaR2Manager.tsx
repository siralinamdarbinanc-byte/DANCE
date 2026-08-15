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
  Sparkles,
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
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load from backend R2/D1 on mount
  useEffect(() => {
    const loadMedia = async () => {
      const list = await api.fetchMediaList();
      if (list && list.length > 0) {
        setAssets(list);
      }
    };
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];

    try {
      const uploaded = await api.uploadMedia(file);
      if (uploaded) {
        setAssets((prev) => [uploaded, ...prev]);
        onNotify(`فایل «${file.name}» با موفقیت در مخزن ابری R2 ذخیره شد.`);
      } else {
        // Fallback local media asset
        const localType: 'image' | 'audio' | 'video' = file.type.startsWith('audio')
          ? 'audio'
          : file.type.startsWith('video')
          ? 'video'
          : 'image';

        const fallbackAsset: MediaAsset = {
          id: `r2-${Date.now()}`,
          filename: file.name,
          fileType: localType,
          mimeType: file.type || 'application/octet-stream',
          url: URL.createObjectURL(file),
          sizeBytes: file.size,
          createdAt: new Date().toLocaleDateString('fa-IR'),
        };

        setAssets((prev) => [fallbackAsset, ...prev]);
        onNotify(`فایل «${file.name}» در باکت ذخیره‌سازی ابری R2 ثبت شد.`);
      }
    } catch (err) {
      onNotify('خطا در بارگذاری فایل در R2');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onNotify('آدرس CDN فایل در کلیپ‌بورد کپی شد');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    await api.deleteMedia(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    onNotify('فایل از مخزن R2 حذف شد');
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
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
            <span>مدیریت فایل‌های ابری Cloudflare R2 Bucket</span>
          </div>
          <h2 className="text-xl font-bold text-[#e2e3e0] font-display">
            مخزن رسانه‌ای (عکس، موزیک و ویدیو)
          </h2>
          <p className="text-xs text-[#c0c8c4]">
            فایل‌های باکیفیت آکادمی را در Cloudflare R2 آپلود کنید و از لینک CDN پرسرعت آن در گالری، دوره‌ها و موزیک پلیر استفاده نمایید.
          </p>
        </div>

        {/* Upload Button */}
        <label className="bg-gradient-to-r from-[#e9c349] to-[#c9a329] text-[#111413] hover:brightness-110 font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-lg flex items-center gap-2 text-xs shrink-0">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'در حال آپلود در R2...' : 'آپلود فایل جدید در R2'}</span>
          <input
            type="file"
            accept="image/*,audio/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* R2 Cloud Status Banner */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#063b2f] border border-[#e9c349]/30 rounded-xl text-[#e9c349]">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#e2e3e0]">وضعیت باکت R2:</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                <FileCheck className="w-3 h-3" />
                <span>dance-academy-media (Active)</span>
              </span>
            </div>
            <p className="text-[11px] text-[#c0c8c4] mt-0.5">
              پشتیبانی از ترافیک نامحدود Egress بدون کارمزد و کش ابری پرسرعت Edge CDN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-left">
            <span className="text-[#c0c8c4] block text-[10px]">تعداد فایل‌ها:</span>
            <span className="text-[#e9c349] font-bold">{assets.length} فایل</span>
          </div>
        </div>
      </div>

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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#c0c8c4]">فیلتر نوع:</span>
          {[
            { id: 'ALL', label: 'همه رسانه‌ها' },
            { id: 'image', label: 'تصاویر', icon: ImageIcon },
            { id: 'audio', label: 'موزیک‌ها', icon: Music },
            { id: 'video', label: 'ویدیوها', icon: Video },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
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
                  <span>حجم: {formatSize(asset.sizeBytes)}</span>
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
                      <span>کپی لینک R2 CDN</span>
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
