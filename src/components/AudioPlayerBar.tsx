import React, { useRef, useEffect, useState } from 'react';
import { useContent } from '../context/ContentContext';
import { Play, Pause, SkipForward, SkipBack, Download, X, Volume2, VolumeX, Music } from 'lucide-react';

export const AudioPlayerBar: React.FC = () => {
  const { currentTrack, isPlaying, pauseTrack, resumeTrack, nextTrack, prevTrack } = useContent();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio play error:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0f0e]/95 backdrop-blur-md border-t border-[#e9c349]/30 text-[#e2e3e0] shadow-2xl transition-all animate-fade-in-up">
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-right">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <img
            src={currentTrack.coverImage || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200'}
            alt={currentTrack.title}
            className="w-12 h-12 rounded-xl object-cover border border-[#e9c349]/30 shrink-0 shadow-md"
          />
          <div className="min-w-0 flex-1">
            <h5 className="text-sm font-bold text-[#e9c349] truncate">{currentTrack.title}</h5>
            <p className="text-xs text-[#c0c8c4] truncate">{currentTrack.artist}</p>
          </div>
          <span className="hidden sm:inline-block text-[10px] bg-[#063b2f] border border-[#e9c349]/30 text-[#a0d1c0] px-2 py-0.5 rounded-full shrink-0">
            {currentTrack.category}
          </span>
        </div>

        {/* Player Controls & Progress */}
        <div className="flex flex-col items-center gap-1 w-full md:w-2/5">
          <div className="flex items-center gap-4 dir-ltr">
            <button
              onClick={prevTrack}
              className="p-1.5 text-[#c0c8c4] hover:text-[#e9c349] transition-colors cursor-pointer"
              title="قبلی"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="w-10 h-10 rounded-full bg-[#063b2f] border border-[#e9c349] text-[#e9c349] flex items-center justify-center hover:scale-105 transition-all shadow-lg cursor-pointer"
              title={isPlaying ? 'توقف' : 'پخش'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-[#c0c8c4] hover:text-[#e9c349] transition-colors cursor-pointer"
              title="بعدی"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full text-[11px] font-mono dir-ltr text-[#c0c8c4]">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-[#e9c349] h-1 bg-[#181a19] rounded-lg cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          <div className="hidden lg:flex items-center gap-2 dir-ltr">
            <button onClick={toggleMute} className="text-[#c0c8c4] hover:text-[#e9c349] transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 accent-[#e9c349] h-1 bg-[#181a19] rounded-lg cursor-pointer"
            />
          </div>

          {/* Download button if permission is allowed */}
          {currentTrack.downloadable && (currentTrack.downloadUrl || currentTrack.audioUrl) ? (
            <a
              href={currentTrack.downloadUrl || currentTrack.audioUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#063b2f] hover:bg-[#084b3c] text-[#e9c349] border border-[#e9c349]/40 text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-md"
              title="دانلود موزیک"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دانلود</span>
            </a>
          ) : (
            <span className="text-[10px] text-[#c0c8c4]/60 bg-[#181a19] px-2.5 py-1 rounded-full border border-white/5">
              فقط پخش آنلاین
            </span>
          )}

          <button
            onClick={pauseTrack}
            className="p-1.5 text-[#c0c8c4] hover:text-red-400 transition-colors cursor-pointer"
            title="بستن پخش‌کننده"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
