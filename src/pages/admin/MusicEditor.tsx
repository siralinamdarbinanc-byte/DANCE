import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { TrackItem, Playlist, MusicCategory } from '../../types';
import { Plus, Trash2, Edit3, Save, CheckCircle2, Music, Disc, ShieldCheck, Play, Pause, Layers } from 'lucide-react';

export const MusicEditor: React.FC = () => {
  const {
    content,
    saveMusicTrack,
    deleteMusicTrack,
    savePlaylist,
    deletePlaylist,
    saveMusicCategory,
    deleteMusicCategory,
  } = useContent();

  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'categories'>('tracks');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Editing Track State
  const [editingTrack, setEditingTrack] = useState<TrackItem | null>(null);
  const [isAddingTrack, setIsAddingTrack] = useState<boolean>(false);

  // Editing Playlist State
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState<boolean>(false);

  // Editing Category State
  const [editingCategory, setEditingCategory] = useState<MusicCategory | null>(null);

  const categories = content.musicCategories || [];
  const tracks = content.tracks || [];
  const playlists = content.playlists || [];

  const triggerNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Track Handlers
  const handleCreateTrack = () => {
    const newTrack: TrackItem = {
      id: `track-${Date.now()}`,
      title: 'عنوان موزیک جدید',
      artist: 'نام هنرمند / ارکستر',
      category: 'tango',
      coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_1e5987c2b3.mp3?filename=tango-passion-10825.mp3',
      duration: '3:20',
      description: 'توضیحات کوتاه موزیک تمرینی',
      downloadable: true,
      featured: true,
      active: true,
      order: tracks.length + 1,
    };
    setEditingTrack(newTrack);
    setIsAddingTrack(true);
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;
    saveMusicTrack(editingTrack);
    setEditingTrack(null);
    setIsAddingTrack(false);
    triggerNotice();
  };

  const handleDeleteTrack = (id: string) => {
    if (confirm('آیا از حذف این قطعه صوتی اطمینان دارید؟')) {
      deleteMusicTrack(id);
      triggerNotice();
    }
  };

  // Playlist Handlers
  const handleCreatePlaylist = () => {
    const newPl: Playlist = {
      id: `playlist-${Date.now()}`,
      title: 'پلی‌لیست جدید',
      description: 'توضیحات و کاربرد پلی‌لیست...',
      category: 'tango',
      coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80',
      tracks: tracks.length > 0 ? [tracks[0].id] : [],
      featured: true,
      active: true,
      order: playlists.length + 1,
    };
    setEditingPlaylist(newPl);
    setIsAddingPlaylist(true);
  };

  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist) return;
    savePlaylist(editingPlaylist);
    setEditingPlaylist(null);
    setIsAddingPlaylist(false);
    triggerNotice();
  };

  const handleDeletePlaylist = (id: string) => {
    if (confirm('آیا از حذف این پلی‌لیست اطمینان دارید؟')) {
      deletePlaylist(id);
      triggerNotice();
    }
  };

  const toggleTrackInPlaylist = (trackId: string) => {
    if (!editingPlaylist) return;
    const exists = editingPlaylist.tracks.includes(trackId);
    let updated: string[];
    if (exists) {
      updated = editingPlaylist.tracks.filter((t) => t !== trackId);
    } else {
      updated = [...editingPlaylist.tracks, trackId];
    }
    setEditingPlaylist({ ...editingPlaylist, tracks: updated });
  };

  return (
    <div className="space-y-8 text-right">
      {savedNotice && (
        <div className="bg-[#063b2f] border border-[#e9c349] text-[#e2e3e0] px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#e9c349]" />
          <span className="text-xs font-bold">تغییرات بخش موزیک با موفقیت ذخیره شد.</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`text-xs md:text-sm px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tracks'
              ? 'bg-[#063b2f] text-[#e9c349] border border-[#e9c349]'
              : 'bg-[#181a19] text-[#c0c8c4] hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>مدیریت قطعات صوتی ({tracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`text-xs md:text-sm px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'playlists'
              ? 'bg-[#063b2f] text-[#e9c349] border border-[#e9c349]'
              : 'bg-[#181a19] text-[#c0c8c4] hover:text-white'
          }`}
        >
          <Disc className="w-4 h-4" />
          <span>مدیریت پلی‌لیست‌ها ({playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`text-xs md:text-sm px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#063b2f] text-[#e9c349] border border-[#e9c349]'
              : 'bg-[#181a19] text-[#c0c8c4] hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>دسته‌بندی‌های موزیک ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: TRACKS */}
      {activeTab === 'tracks' && (
        <div className="bg-[#111413] border border-[#e9c349]/20 p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="font-display text-lg font-bold text-[#e9c349] flex items-center gap-2">
              <Music className="w-5 h-5 text-[#e9c349]" />
              <span>فهرست موزیک‌های آکادمی</span>
            </h3>

            <button
              onClick={handleCreateTrack}
              className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن قطعه صوتی جدید</span>
            </button>
          </div>

          {/* Edit Track Form */}
          {editingTrack && (
            <form
              onSubmit={handleSaveTrack}
              className="bg-[#181a19] border-2 border-[#e9c349] p-6 rounded-3xl space-y-4 animate-fade-in"
            >
              <h4 className="font-bold text-sm text-[#e9c349] border-b border-white/10 pb-2">
                {isAddingTrack ? 'افزودن قطعه جدید' : `ویرایش موزیک: ${editingTrack.title}`}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#c0c8c4] mb-1 block">عنوان موزیک:</label>
                  <input
                    type="text"
                    value={editingTrack.title}
                    onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c0c8c4] mb-1 block">نام هنرمند / ارکستر:</label>
                  <input
                    type="text"
                    value={editingTrack.artist}
                    onChange={(e) => setEditingTrack({ ...editingTrack, artist: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c0c8c4] mb-1 block">دسته‌بندی سبک:</label>
                  <select
                    value={editingTrack.category}
                    onChange={(e) => setEditingTrack({ ...editingTrack, category: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#c0c8c4] mb-1 block">مدت زمان ( e.g. 3:15 ):</label>
                  <input
                    type="text"
                    value={editingTrack.duration}
                    onChange={(e) => setEditingTrack({ ...editingTrack, duration: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c0c8c4] mb-1 block">آدرس فایل صوتی (Audio URL):</label>
                  <input
                    type="text"
                    value={editingTrack.audioUrl}
                    onChange={(e) => setEditingTrack({ ...editingTrack, audioUrl: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c0c8c4] mb-1 block">آدرس کاور تصویر (Cover URL):</label>
                  <input
                    type="text"
                    value={editingTrack.coverImage}
                    onChange={(e) => setEditingTrack({ ...editingTrack, coverImage: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-[#c0c8c4] mb-1 block">توضیح کوتاه درباره موزیک:</label>
                  <input
                    type="text"
                    value={editingTrack.description || ''}
                    onChange={(e) => setEditingTrack({ ...editingTrack, description: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                  />
                </div>

                {/* Download Permission Checkbox */}
                <div className="md:col-span-2 p-4 bg-[#063b2f]/40 border border-[#e9c349]/30 rounded-2xl space-y-2">
                  <label className="flex items-center gap-3 text-sm font-bold text-[#e9c349] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTrack.downloadable}
                      onChange={(e) => setEditingTrack({ ...editingTrack, downloadable: e.target.checked })}
                      className="accent-[#e9c349] w-4 h-4"
                    />
                    <ShieldCheck className="w-5 h-5" />
                    <span>مجوز دانلود فایل برای کاربران فعال باشد (حق نشر آکادمی)</span>
                  </label>
                  <p className="text-xs text-[#c0c8c4] pr-7">
                    اگر این تیک فعال باشد، دکمه دانلود موزیک در سایت نمایش داده می‌شود. در غیر این صورت فقط امکان استماع آنلاین وجود خواهد داشت.
                  </p>
                </div>

                <div className="md:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs text-[#e2e3e0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTrack.active}
                      onChange={(e) => setEditingTrack({ ...editingTrack, active: e.target.checked })}
                      className="accent-[#e9c349]"
                    />
                    <span>فعال و قابل پخش</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs px-5 py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  ذخیره موزیک
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="bg-[#111413] text-[#c0c8c4] border border-white/10 text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}

          {/* Tracks List */}
          <div className="space-y-3">
            {tracks.map((tr) => (
              <div
                key={tr.id}
                className="bg-[#181a19] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={tr.coverImage}
                    alt={tr.title}
                    className="w-12 h-12 rounded-xl object-cover border border-[#e9c349]/30 shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-[#e2e3e0] truncate">{tr.title}</h5>
                      <span className="text-[10px] bg-[#063b2f] text-[#a0d1c0] px-2 py-0.5 rounded-full">
                        {tr.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#c0c8c4] truncate">{tr.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${
                    tr.downloadable
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {tr.downloadable ? 'دانلود مجاز' : 'فقط آنلاین'}
                  </span>

                  <button
                    onClick={() => setEditingTrack(tr)}
                    className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] p-2 rounded-xl border border-[#e9c349]/30 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteTrack(tr.id)}
                    className="bg-red-950/40 hover:bg-red-900/60 text-red-300 p-2 rounded-xl border border-red-800/40 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PLAYLISTS */}
      {activeTab === 'playlists' && (
        <div className="bg-[#111413] border border-[#e9c349]/20 p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="font-display text-lg font-bold text-[#e9c349] flex items-center gap-2">
              <Disc className="w-5 h-5 text-[#e9c349]" />
              <span>مدیریت پلی‌لیست‌های آکادمی</span>
            </h3>

            <button
              onClick={handleCreatePlaylist}
              className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد پلی‌لیست جدید</span>
            </button>
          </div>

          {/* Edit Playlist Form */}
          {editingPlaylist && (
            <form
              onSubmit={handleSavePlaylist}
              className="bg-[#181a19] border-2 border-[#e9c349] p-6 rounded-3xl space-y-4 animate-fade-in"
            >
              <h4 className="font-bold text-sm text-[#e9c349] border-b border-white/10 pb-2">
                {isAddingPlaylist ? 'ایجاد پلی‌لیست جدید' : `ویرایش پلی‌لیست: ${editingPlaylist.title}`}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#c0c8c4] mb-1 block">عنوان پلی‌لیست:</label>
                  <input
                    type="text"
                    value={editingPlaylist.title}
                    onChange={(e) => setEditingPlaylist({ ...editingPlaylist, title: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c0c8c4] mb-1 block">دسته‌بندی (Category):</label>
                  <select
                    value={editingPlaylist.category}
                    onChange={(e) => setEditingPlaylist({ ...editingPlaylist, category: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-[#c0c8c4] mb-1 block">توضیحات کوتاه:</label>
                  <input
                    type="text"
                    value={editingPlaylist.description}
                    onChange={(e) => setEditingPlaylist({ ...editingPlaylist, description: e.target.value })}
                    className="w-full bg-[#111413] border border-white/10 text-xs text-[#e2e3e0] p-2.5 rounded-xl outline-none focus:border-[#e9c349]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-[#c0c8c4] mb-1 block">انتخاب قطعات این پلی‌لیست:</label>
                  <div className="bg-[#111413] border border-white/10 p-3 rounded-2xl max-h-48 overflow-y-auto space-y-2">
                    {tracks.map((tr) => {
                      const isSelected = editingPlaylist.tracks.includes(tr.id);
                      return (
                        <label
                          key={tr.id}
                          className="flex items-center justify-between bg-[#181a19] p-2 rounded-xl text-xs text-[#e2e3e0] cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTrackInPlaylist(tr.id)}
                              className="accent-[#e9c349]"
                            />
                            <span>{tr.title} ({tr.artist})</span>
                          </div>
                          <span className="text-[10px] text-[#c0c8c4]">{tr.category}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs px-5 py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  ذخیره پلی‌لیست
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="bg-[#111413] text-[#c0c8c4] border border-white/10 text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}

          {/* Playlists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="bg-[#181a19] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={pl.coverImage}
                    alt={pl.title}
                    className="w-14 h-14 rounded-xl object-cover border border-[#e9c349]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-sm text-[#e9c349] truncate">{pl.title}</h5>
                    <p className="text-xs text-[#c0c8c4] truncate">{pl.description}</p>
                    <span className="text-[10px] text-[#a0d1c0]">تعداد تراک: {pl.tracks.length}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingPlaylist(pl)}
                    className="bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] p-2 rounded-xl border border-[#e9c349]/30 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlaylist(pl.id)}
                    className="bg-red-950/40 hover:bg-red-900/60 text-red-300 p-2 rounded-xl border border-red-800/40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-[#111413] border border-[#e9c349]/20 p-6 rounded-3xl space-y-6">
          <h3 className="font-display text-lg font-bold text-[#e9c349] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#e9c349]" />
            <span>دسته‌بندی‌های موزیک</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#181a19] border border-white/10 p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon || '🎵'}</span>
                  <span className="text-sm font-bold text-[#e2e3e0]">{cat.name}</span>
                  <span className="text-[10px] text-[#c0c8c4]">({cat.id})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
