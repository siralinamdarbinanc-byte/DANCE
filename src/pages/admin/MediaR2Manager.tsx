import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Search,
  Plus,
  Info,
  Link as LinkIcon,
  RefreshCw,
  Edit2,
  Play,
  Pause,
  Volume2,
  FolderTree,
  FileCode,
  ArrowUpDown,
  Maximize2,
  X,
  AlertTriangle,
  FileCheck2,
  FolderGit2,
} from 'lucide-react';

interface MediaR2ManagerProps {
  onNotify: (msg: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';

export const MediaR2Manager: React.FC<MediaR2ManagerProps> = ({ onNotify }) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // GitHub status
  const [ghStatus, setGhStatus] = useState<{
    githubConfigured: boolean;
    owner: string;
    repo: string;
    branch: string;
    directories: string[];
    maxSizeBytes: number;
  }>({
    githubConfigured: false,
    owner: 'siralinamdarinc-byte',
    repo: 'DANCE',
    branch: 'main',
    directories: ['public/images', 'public/audio', 'public/videos'],
    maxSizeBytes: 104857600,
  });

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState<'public/images' | 'public/audio' | 'public/videos'>('public/images');
  const [customUploadName, setCustomUploadName] = useState<string>('');

  // Upload Progress & Status States
  const [uploadProgress, setUploadProgress] = useState<{
    loaded: number;
    total: number;
    percentage: number;
  }>({ loaded: 0, total: 0, percentage: 0 });
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'uploading' | 'verifying' | 'success' | 'error'>('idle');
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string>('');

  const [showAddUrlModal, setShowAddUrlModal] = useState<boolean>(false);
  const [newUrl, setNewUrl] = useState<string>('');
  const [newUrlFilename, setNewUrlFilename] = useState<string>('');
  const [newUrlFileType, setNewUrlFileType] = useState<'image' | 'audio' | 'video'>('image');
  const [submittingUrl, setSubmittingUrl] = useState<boolean>(false);

  const [renameAsset, setRenameAsset] = useState<MediaAsset | null>(null);
  const [newRenameFilename, setNewRenameFilename] = useState<string>('');
  const [renaming, setRenaming] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Lightbox / Image Preview Modal
  const [previewImage, setPreviewImage] = useState<{ url: string; filename: string } | null>(null);

  // Audio Playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState<{ url: string; filename: string } | null>(null);

  const headerFileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadMedia = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statusData, mediaList] = await Promise.all([
        api.fetchMediaStatus(),
        api.fetchMediaList(),
      ]);

      if (statusData) {
        setGhStatus(statusData);
      }

      if (mediaList && Array.isArray(mediaList)) {
        setAssets(mediaList);
      }
    } catch (err) {
      console.error('Error loading media assets:', err);
      onNotify('خطا در دریافت لیست رسانه‌ها از مخزن');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  // Handle Drag and Drop for Upload Modal
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileSelection = (file: File) => {
    if (file.size > ghStatus.maxSizeBytes) {
      onNotify(`حجم فایل بیشتر از سقف مجاز ۱۰۰ مگابایت است (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }
    setUploadFile(file);
    setCustomUploadName(file.name);

    if (file.type.startsWith('image/')) {
      setUploadFolder('public/images');
    } else if (file.type.startsWith('audio/')) {
      setUploadFolder('public/audio');
    } else if (file.type.startsWith('video/')) {
      setUploadFolder('public/videos');
    }
    setShowUploadModal(true);
  };

  const handleNativeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
    e.target.value = '';
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || uploading) return;

    setUploading(true);
    setUploadPhase('uploading');
    setUploadProgress({ loaded: 0, total: uploadFile.size, percentage: 0 });
    setUploadStatusMessage(`در حال ارسال فایل ${uploadFile.name}...`);

    try {
      const res = await api.uploadMedia(
        uploadFile,
        uploadFolder,
        customUploadName.trim() || uploadFile.name,
        (progress) => {
          setUploadProgress(progress);
          if (progress.percentage >= 100) {
            setUploadPhase('verifying');
            setUploadStatusMessage('در حال ثبت در گیتهاب...');
          } else {
            setUploadStatusMessage(`در حال آپلود... (${progress.percentage}%)`);
          }
        }
      );

      if (res.success && (res.asset || res.file)) {
        setUploadPhase('success');
        setUploadStatusMessage('فایل با موفقیت در گیت‌هاب بارگذاری و تأیید شد.');
        const uploadedName = res.asset?.filename || res.file?.name || uploadFile.name;
        onNotify(`فایل «${uploadedName}» با موفقیت در مخزن گیت‌هاب بارگذاری و تأیید شد.`);

        // Deterministic flow: refresh entire media list from GitHub
        await loadMedia(true);

        setTimeout(() => {
          setShowUploadModal(false);
          setUploadFile(null);
          setCustomUploadName('');
          setUploadPhase('idle');
          setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
          setUploadStatusMessage('');
        }, 1200);
      } else {
        const errorMsg = res.error || 'خطا در ثبت فایل در مخزن گیت‌هاب';
        setUploadPhase('error');
        setUploadStatusMessage(errorMsg);
        onNotify(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'خطا در ارسال فایل به سرور';
      setUploadPhase('error');
      setUploadStatusMessage(errorMsg);
      onNotify(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleAddDirectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      onNotify('لطفاً آدرس اینترنتی فایل را وارد کنید');
      return;
    }

    setSubmittingUrl(true);
    try {
      const created = await api.addMediaUrl(
        newUrl.trim(),
        newUrlFilename.trim() || 'رسانه اختصاصی',
        newUrlFileType
      );

      if (created) {
        setAssets((prev) => [created, ...prev]);
        onNotify('رسانه با موفقیت در لیست ذخیره شد.');
        setShowAddUrlModal(false);
        setNewUrl('');
        setNewUrlFilename('');
      } else {
        onNotify('خطا در ثبت لینک رسانه');
      }
    } catch (err) {
      onNotify('خطا در ارتباط با سرور');
    } finally {
      setSubmittingUrl(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameAsset || !newRenameFilename.trim()) return;

    setRenaming(true);
    try {
      const oldPath = renameAsset.path || `public/${renameAsset.fileType === 'audio' ? 'audio' : renameAsset.fileType === 'video' ? 'videos' : 'images'}/${renameAsset.filename}`;
      const res = await api.renameMedia(oldPath, newRenameFilename.trim());

      if (res.success && res.asset) {
        setAssets((prev) =>
          prev.map((a) => (a.id === renameAsset.id || a.path === oldPath ? res.asset! : a))
        );
        onNotify(`نام فایل به «${res.asset.filename}» تغییر یافت.`);
        setRenameAsset(null);
        setNewRenameFilename('');
      } else {
        onNotify(res.error || 'خطا در تغییر نام فایل');
      }
    } catch (err: any) {
      onNotify(err?.message || 'خطا در ویرایش نام فایل');
    } finally {
      setRenaming(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const targetPath = deleteTarget.path || deleteTarget.id;
      const res = await api.deleteMedia(targetPath, deleteTarget.sha);

      if (res.success) {
        setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id && a.path !== deleteTarget.path));
        onNotify(`فایل «${deleteTarget.filename}» با موفقیت حذف شد.`);
        setDeleteTarget(null);
      } else {
        onNotify(res.error || 'خطا در حذف فایل از مخزن');
      }
    } catch (err: any) {
      onNotify(err?.message || 'خطا در حذف فایل');
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = (id: string, url: string, customMsg?: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onNotify(customMsg || 'آدرس فایل در کلیپ‌بورد کپی شد.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePlayAudio = (id: string, url: string) => {
    if (playingAudioId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => onNotify('خطا در پخش فایل صوتی'));
      setPlayingAudioId(id);

      audio.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return 'لینک خارجی';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Filter and Sort Pipeline
  const filteredAndSortedAssets = useMemo(() => {
    let list = [...assets];

    // Filter by type
    if (filterType !== 'ALL') {
      list = list.filter((item) => item.fileType === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.filename.toLowerCase().includes(q) ||
          (item.path || '').toLowerCase().includes(q) ||
          (item.mimeType || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'oldest') {
        return (a.id || '').localeCompare(b.id || '');
      }
      if (sortBy === 'name-asc') {
        return a.filename.localeCompare(b.filename);
      }
      if (sortBy === 'name-desc') {
        return b.filename.localeCompare(a.filename);
      }
      if (sortBy === 'size-desc') {
        return (b.sizeBytes || 0) - (a.sizeBytes || 0);
      }
      if (sortBy === 'size-asc') {
        return (a.sizeBytes || 0) - (b.sizeBytes || 0);
      }
      return 0;
    });

    return list;
  }, [assets, filterType, searchQuery, sortBy]);

  const counts = useMemo(() => {
    return {
      all: assets.length,
      image: assets.filter((a) => a.fileType === 'image').length,
      audio: assets.filter((a) => a.fileType === 'audio').length,
      video: assets.filter((a) => a.fileType === 'video').length,
    };
  }, [assets]);

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e9c349]/20 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#e9c349] text-xs font-semibold mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>مدیریت فایل‌های مخزن پروژه (GitHub Contents API)</span>
          </div>
          <h2 className="text-2xl font-bold text-[#e2e3e0] font-display">
            مدیریت فایل‌ها و رسانه‌های آکادمی
          </h2>
          <p className="text-xs text-[#c0c8c4] mt-0.5">
            فایل‌های موجود در پوشه‌های <code className="text-[#e9c349] font-mono">public/images</code>، <code className="text-[#e9c349] font-mono">public/audio</code> و <code className="text-[#e9c349] font-mono">public/videos</code> را مدیریت، آپلود، ویرایش و پخش کنید.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadMedia(true)}
            disabled={refreshing}
            className="p-2.5 bg-[#181a19] hover:bg-[#063b2f] text-[#c0c8c4] hover:text-[#e9c349] border border-[#e9c349]/20 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs"
            title="بازخوانی لیست از گیت‌هاب"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#e9c349]' : ''}`} />
            <span className="hidden sm:inline">همگام‌سازی</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddUrlModal(true)}
            className="bg-[#181a19] hover:bg-[#063b2f] text-[#e9c349] border border-[#e9c349]/30 font-bold px-3.5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن لینک خارجی</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (headerFileInputRef.current) {
                headerFileInputRef.current.click();
              } else {
                setShowUploadModal(true);
              }
            }}
            disabled={uploading}
            className="bg-gradient-to-r from-[#e9c349] to-[#c9a329] text-[#111413] hover:brightness-110 font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-lg flex items-center gap-2 text-xs shrink-0 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>آپلود فایل جدید</span>
          </button>
          <input
            type="file"
            ref={headerFileInputRef}
            accept="image/*,audio/*,video/*"
            onChange={handleNativeFileInput}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>

      {/* GitHub Repository Status Banner */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#063b2f] border border-[#e9c349]/30 rounded-xl text-[#e9c349]">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#e2e3e0]">مسیر مخزن گیت‌هاب:</span>
              <span className="text-[11px] font-mono text-[#e9c349] bg-[#111413] px-2 py-0.5 rounded border border-[#e9c349]/20">
                {ghStatus.owner}/{ghStatus.repo} ({ghStatus.branch})
              </span>
              {ghStatus.githubConfigured ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3" />
                  <span>اتصال گیت‌هاب فعال</span>
                </span>
              ) : (
                <span className="text-[10px] bg-[#e9c349]/20 text-[#e9c349] px-2 py-0.5 rounded-full border border-[#e9c349]/30 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>حالت محلی / شبیه‌ساز (توکن گیت‌هاب با wrangler secret put GITHUB_TOKEN تنظیم می‌شود)</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#c0c8c4] mt-1">
              پوشه‌های مجاز: <code className="text-[#e9c349] font-mono">public/images</code> (تصاویر) | <code className="text-[#e9c349] font-mono">public/audio</code> (صوت) | <code className="text-[#e9c349] font-mono">public/videos</code> (ویدیو)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-[#111413] px-3 py-1.5 rounded-xl border border-[#e9c349]/20 text-center">
            <span className="text-[#c0c8c4] block text-[10px]">تعداد کل:</span>
            <span className="text-[#e9c349] font-bold">{counts.all} فایل</span>
          </div>
        </div>
      </div>

      {/* Filters, Search & Sort Toolbar */}
      <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-[#e9c349]" />
          <input
            type="text"
            placeholder="جستجو در نام فایل، مسیر یا فرمت..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:outline-none focus:border-[#e9c349]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-[#c0c8c4] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'ALL', label: 'همه', count: counts.all },
            { id: 'image', label: 'تصاویر (Images)', icon: ImageIcon, count: counts.image },
            { id: 'audio', label: 'موزیک (Audio)', icon: Music, count: counts.audio },
            { id: 'video', label: 'ویدیو (Video)', icon: Video, count: counts.video },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
                filterType === item.id
                  ? 'bg-[#e9c349] text-[#111413] font-bold shadow-md'
                  : 'bg-[#111413] text-[#c0c8c4] hover:bg-white/5 border border-[#e9c349]/10'
              }`}
            >
              {item.icon && <item.icon className="w-3.5 h-3.5" />}
              <span>{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterType === item.id ? 'bg-[#111413]/20 font-mono' : 'bg-white/10 font-mono'}`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#e9c349]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-[#111413] border border-[#e9c349]/20 text-[#e2e3e0] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#e9c349] cursor-pointer"
          >
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="name-asc">نام فایل (الف - ی)</option>
            <option value="name-desc">نام فایل (ی - الف)</option>
            <option value="size-desc">حجم فایل (بزرگ به کوچک)</option>
            <option value="size-asc">حجم فایل (کوچک به بزرگ)</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#181a19] border border-[#e9c349]/10 rounded-2xl p-4 space-y-4 animate-pulse">
              <div className="aspect-video bg-[#111413] rounded-xl" />
              <div className="h-4 bg-[#111413] rounded w-3/4" />
              <div className="h-3 bg-[#111413] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedAssets.length === 0 ? (
        /* Empty State */
        <div className="bg-[#181a19] border border-[#e9c349]/20 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#063b2f] border border-[#e9c349]/30 rounded-2xl flex items-center justify-center mx-auto text-[#e9c349]">
            <FolderTree className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#e2e3e0]">فایلی در این دسته‌بندی یافت نشد</h3>
            <p className="text-xs text-[#c0c8c4] mt-1 max-w-md mx-auto">
              {searchQuery
                ? 'هیچ رسانه‌ای با عبارت جستجو شده تطابق ندارد. لطفاً فیلتر یا متن جستجو را تغییر دهید.'
                : 'می‌توانید با استفاده از دکمه «آپلود فایل جدید» فایل‌های عکس، موزیک یا ویدیو را در پوشه‌های مخزن گیت‌هاب قرار دهید.'}
            </p>
          </div>
        </div>
      ) : (
        /* Assets Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedAssets.map((asset) => {
            const cleanUrl = asset.url || `/${asset.path?.replace(/^public\//, '')}`;
            const displayRawUrl = asset.rawUrl || cleanUrl;

            return (
              <div
                key={asset.id}
                className="bg-[#181a19] border border-[#e9c349]/20 hover:border-[#e9c349]/50 rounded-2xl overflow-hidden space-y-3 transition-all flex flex-col justify-between group shadow-lg"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video bg-[#111413] flex items-center justify-center overflow-hidden">
                  {asset.fileType === 'image' && (
                    <>
                      <img
                        src={displayRawUrl}
                        alt={asset.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setPreviewImage({ url: displayRawUrl, filename: asset.filename })}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        onClick={() => setPreviewImage({ url: displayRawUrl, filename: asset.filename })}
                        className="absolute bottom-2 left-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="مشاهده تصویر در اندازه کامل"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#e9c349]" />
                      </button>
                    </>
                  )}

                  {asset.fileType === 'audio' && (
                    <div className="flex flex-col items-center justify-center text-[#e9c349] p-4 space-y-3 w-full">
                      <button
                        onClick={() => togglePlayAudio(asset.id, displayRawUrl)}
                        className="p-4 bg-[#063b2f] hover:bg-[#084d3d] border border-[#e9c349]/40 rounded-full text-[#e9c349] transition-all cursor-pointer shadow-lg hover:scale-105 flex items-center justify-center"
                        title={playingAudioId === asset.id ? 'توقف پخش' : 'پخش آنلاین موزیک'}
                      >
                        {playingAudioId === asset.id ? (
                          <Pause className="w-6 h-6 text-[#e9c349] animate-pulse" />
                        ) : (
                          <Play className="w-6 h-6 text-[#e9c349] translate-x-[-1px]" />
                        )}
                      </button>
                      <div className="text-center">
                        <span className="text-[11px] text-[#e2e3e0] font-mono block">فایل صوتی</span>
                        <span className="text-[10px] text-[#a0d1c0] flex items-center justify-center gap-1 mt-0.5">
                          <Volume2 className="w-3 h-3 text-[#e9c349]" />
                          {playingAudioId === asset.id ? 'در حال پخش...' : 'برای پخش کلیک کنید'}
                        </span>
                      </div>
                    </div>
                  )}

                  {asset.fileType === 'video' && (
                    <div className="flex flex-col items-center justify-center text-[#e9c349] p-4 space-y-2 w-full">
                      <button
                        onClick={() => setPreviewVideo({ url: displayRawUrl, filename: asset.filename })}
                        className="p-4 bg-[#063b2f] hover:bg-[#084d3d] border border-[#e9c349]/40 rounded-full text-[#e9c349] transition-all cursor-pointer shadow-lg hover:scale-105"
                        title="پخش ویدیو"
                      >
                        <Video className="w-6 h-6 text-[#e9c349]" />
                      </button>
                      <span className="text-[11px] text-[#c0c8c4] font-mono">پیش‌نمایش ویدیو</span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <span className="absolute top-2 right-2 bg-black/75 text-[#e9c349] text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10 font-mono">
                    {asset.fileType.toUpperCase()}
                  </span>

                  {/* Path Tag */}
                  {asset.path && (
                    <span className="absolute top-2 left-2 bg-[#063b2f]/90 text-[#a0d1c0] text-[9px] px-2 py-0.5 rounded-md backdrop-blur-sm border border-[#e9c349]/20 font-mono" dir="ltr">
                      {asset.path.split('/')[1] || ''}
                    </span>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className="text-xs font-bold text-[#e2e3e0] truncate font-mono flex-1"
                        title={asset.filename}
                        dir="ltr"
                      >
                        {asset.filename}
                      </h4>
                      <button
                        onClick={() => {
                          setRenameAsset(asset);
                          setNewRenameFilename(asset.filename);
                        }}
                        className="p-1 text-[#c0c8c4] hover:text-[#e9c349] hover:bg-white/5 rounded transition-colors"
                        title="تغییر نام فایل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#c0c8c4] mt-2 font-mono">
                      <span>حجم: {formatSize(asset.sizeBytes)}</span>
                      <span>تاریخ: {asset.lastModified || asset.createdAt || 'اخیر'}</span>
                    </div>

                    {asset.path && (
                      <div className="mt-1 text-[10px] text-[#a0d1c0]/80 font-mono truncate" dir="ltr" title={asset.path}>
                        {asset.path}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#e9c349]/10 flex items-center justify-between gap-1.5">
                    {/* Copy clean relative path button */}
                    <button
                      onClick={() => copyUrl(asset.id, cleanUrl, `مسیر «${cleanUrl}» کپی شد.`)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        copiedId === asset.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#111413] hover:bg-[#063b2f] text-[#a0d1c0] border border-[#e9c349]/20'
                      }`}
                      title="کپی آدرس داخلی فایل (جهت استفاده در سایت)"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>کپی شد!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#e9c349]" />
                          <span>کپی آدرس</span>
                        </>
                      )}
                    </button>

                    {/* Direct External Link */}
                    <a
                      href={displayRawUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-[#111413] hover:bg-white/5 border border-white/10 text-[#c0c8c4] hover:text-[#e9c349] rounded-lg text-xs"
                      title="مشاهده لینک مستقیم"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteTarget(asset)}
                      className="p-1.5 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 text-red-400 rounded-lg text-xs cursor-pointer"
                      title="حذف فایل از مخزن"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181a19] border border-[#e9c349]/40 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-[#e9c349]/20 pb-3">
              <div className="flex items-center gap-2 text-[#e9c349]">
                <Upload className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#e2e3e0]">آپلود رسانه جدید در مخزن گیت‌هاب</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                }}
                className="text-[#c0c8c4] hover:text-white text-xs cursor-pointer px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Selector Dropzone / Picker */}
              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">
                  فایل انتخابی:
                </label>
                <div
                  onClick={() => modalFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    uploadFile
                      ? 'border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-950/30'
                      : 'border-[#e9c349]/40 bg-[#111413] hover:border-[#e9c349] hover:bg-white/5'
                  }`}
                >
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    accept="image/*,audio/*,video/*"
                    onChange={handleNativeFileInput}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploadFile ? (
                    <div className="flex items-center justify-between gap-2 text-right">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                          {uploadFile.type.startsWith('audio/') ? (
                            <Music className="w-5 h-5" />
                          ) : uploadFile.type.startsWith('video/') ? (
                            <Video className="w-5 h-5" />
                          ) : (
                            <ImageIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#e2e3e0] truncate max-w-[240px]" dir="ltr">
                            {uploadFile.name}
                          </p>
                          <p className="text-[11px] text-[#c0c8c4] font-mono mt-0.5">
                            {formatSize(uploadFile.size)} • {uploadFile.type || 'فایل استاندارد'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white/10 hover:bg-white/20 text-[#e9c349] px-2.5 py-1 rounded-lg transition-colors">
                        تغییر فایل
                      </span>
                    </div>
                  ) : (
                    <div className="py-3 flex flex-col items-center justify-center gap-2 text-[#c0c8c4]">
                      <Upload className="w-6 h-6 text-[#e9c349] animate-bounce" />
                      <p className="text-xs font-bold text-[#e2e3e0]">
                        برای انتخاب فایل از دستگاه اینجا کلیک کنید
                      </p>
                      <p className="text-[10px] text-[#c0c8c4]/80">
                        تصاویر (JPG, PNG, WEBP, GIF) • موزیک (MP3, WAV) • ویدیو (MP4, WEBM)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">
                  پوشه مقصد در پروژه:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { folder: 'public/images' as const, label: 'تصاویر (images)', icon: ImageIcon },
                    { folder: 'public/audio' as const, label: 'موزیک (audio)', icon: Music },
                    { folder: 'public/videos' as const, label: 'ویدیو (videos)', icon: Video },
                  ].map((item) => (
                    <button
                      key={item.folder}
                      type="button"
                      onClick={() => setUploadFolder(item.folder)}
                      className={`p-2.5 rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        uploadFolder === item.folder
                          ? 'bg-[#e9c349] text-[#111413] font-bold shadow-md'
                          : 'bg-[#111413] text-[#c0c8c4] border border-[#e9c349]/20'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">
                  نام فایل ذخیره‌شده (با پسوند):
                </label>
                <input
                  type="text"
                  required
                  value={customUploadName}
                  onChange={(e) => setCustomUploadName(e.target.value)}
                  dir="ltr"
                  className="w-full px-3 py-2 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:outline-none focus:border-[#e9c349] font-mono text-left"
                />
                <p className="text-[10px] text-[#c0c8c4] mt-1">
                  مسیر نهایی: <span className="text-[#e9c349] font-mono" dir="ltr">{uploadFolder}/{customUploadName || 'filename.ext'}</span>
                </p>
              </div>

              {uploadFile && (
                <div className="bg-[#111413] p-3 rounded-xl border border-[#e9c349]/15 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#c0c8c4] truncate max-w-[200px]" dir="ltr">{uploadFile.name}</span>
                    <span className="text-[#e9c349] font-bold">{formatSize(uploadFile.size)}</span>
                  </div>

                  {/* Upload Progress Bar & Status */}
                  {uploading && (
                    <div className="space-y-2 pt-2 border-t border-[#e9c349]/10">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#e9c349] font-medium flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin text-[#e9c349]" />
                          <span>{uploadStatusMessage}</span>
                        </span>
                        <span className="text-[#e9c349] font-bold">
                          {uploadPhase === 'verifying' ? 'در انتظار تأیید' : `${uploadProgress.percentage}%`}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-[#e9c349]/20 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${
                            uploadPhase === 'verifying'
                              ? 'bg-amber-400 animate-pulse w-full'
                              : uploadPhase === 'success'
                              ? 'bg-emerald-500 w-full'
                              : uploadPhase === 'error'
                              ? 'bg-red-500'
                              : 'bg-gradient-to-r from-[#e9c349] to-emerald-400'
                          }`}
                          style={{
                            width: uploadPhase === 'verifying' || uploadPhase === 'success' ? '100%' : `${uploadProgress.percentage}%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#c0c8c4]">
                        <span>
                          {formatSize(uploadProgress.loaded)} / {formatSize(uploadProgress.total || uploadFile.size)}
                        </span>
                        <span>
                          {uploadPhase === 'verifying'
                            ? 'بررسی سلامت و ثبت در شاخه main'
                            : `${uploadProgress.percentage}% آپلود شده`}
                        </span>
                      </div>
                    </div>
                  )}

                  {!uploading && uploadPhase === 'error' && (
                    <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{uploadStatusMessage}</span>
                    </div>
                  )}

                  {!uploading && uploadPhase === 'success' && (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{uploadStatusMessage}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadPhase('idle');
                    setUploadStatusMessage('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-[#c0c8c4] hover:bg-white/5 disabled:opacity-50 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#e9c349] text-[#111413] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{uploadPhase === 'verifying' ? 'در حال ثبت در گیتهاب...' : 'در حال آپلود...'}</span>
                    </>
                  ) : (
                    <span>تأیید و آپلود فایل</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename File Modal */}
      {renameAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181a19] border border-[#e9c349]/40 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-[#e9c349]/20 pb-3">
              <div className="flex items-center gap-2 text-[#e9c349]">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#e2e3e0]">تغییر نام فایل در مخزن گیت‌هاب</h3>
              </div>
              <button
                type="button"
                onClick={() => setRenameAsset(null)}
                className="text-[#c0c8c4] hover:text-white text-xs cursor-pointer px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">
                  نام جدید فایل (به همراه پسوند):
                </label>
                <input
                  type="text"
                  required
                  value={newRenameFilename}
                  onChange={(e) => setNewRenameFilename(e.target.value)}
                  dir="ltr"
                  className="w-full px-3 py-2 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:outline-none focus:border-[#e9c349] font-mono text-left"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameAsset(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#c0c8c4] hover:bg-white/5 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={renaming}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#e9c349] text-[#111413] hover:brightness-110 cursor-pointer shadow-lg flex items-center gap-2"
                >
                  {renaming ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>در حال ویرایش در گیت‌هاب...</span>
                    </>
                  ) : (
                    <span>ذخیره نام جدید</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181a19] border border-red-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-2 text-red-400 border-b border-red-500/20 pb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-red-200">تأیید حذف فایل از مخزن</h3>
            </div>

            <p className="text-xs text-[#c0c8c4]">
              آیا از حذف دائمی فایل زیر از مخزن گیت‌هاب اطمینان دارید؟
            </p>

            <div className="bg-[#111413] p-3 rounded-xl border border-red-500/20 text-xs font-mono text-red-300" dir="ltr">
              {deleteTarget.path || deleteTarget.filename}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#c0c8c4] hover:bg-white/5 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-lg flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال حذف از مخزن...</span>
                  </>
                ) : (
                  <span>بله، حذف فایل</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">نوع رسانه:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'image' as const, label: 'تصویر (Image)', icon: ImageIcon },
                    { type: 'audio' as const, label: 'موزیک (Audio)', icon: Music },
                    { type: 'video' as const, label: 'ویدیو (Video)', icon: Video },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setNewUrlFileType(item.type)}
                      className={`p-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        newUrlFileType === item.type
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
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">نام یا عنوان رسانه:</label>
                <input
                  type="text"
                  placeholder="مثال: کاور دوره تانگو"
                  value={newUrlFilename}
                  onChange={(e) => setNewUrlFilename(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111413] border border-[#e9c349]/20 rounded-xl text-xs text-[#e2e3e0] focus:outline-none focus:border-[#e9c349]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c0c8c4] mb-1">آدرس اینترنتی فایل (Direct URL):</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/photo.jpg"
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
                  {submittingUrl ? 'در حال ثبت...' : 'ثبت رسانه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#181a19] border border-[#e9c349]/40 rounded-3xl p-4 overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-[#e9c349]/20 pb-2 mb-3">
              <span className="text-xs font-bold text-[#e2e3e0] font-mono truncate" dir="ltr">
                {previewImage.filename}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-[#c0c8c4] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewImage.url}
              alt={previewImage.filename}
              className="max-h-[75vh] w-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#181a19] border border-[#e9c349]/40 rounded-3xl p-4 overflow-hidden flex flex-col items-center w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-[#e9c349]/20 pb-2 mb-3">
              <span className="text-xs font-bold text-[#e2e3e0] font-mono truncate" dir="ltr">
                {previewVideo.filename}
              </span>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-[#c0c8c4] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <video
              src={previewVideo.url}
              controls
              autoPlay
              className="max-h-[70vh] w-full rounded-2xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};


