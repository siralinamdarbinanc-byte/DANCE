import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CentralAcademyContent,
  BookingRequest,
  BookingStatus,
  FaqItem,
  PackageOption,
  DanceStyle,
  Instructor,
  GalleryItem,
  SoloDanceStyle,
  TrackItem,
  Playlist,
  MusicCategory,
} from '../types';
import { INITIAL_ACADEMY_CONTENT } from '../data/initialContent';

const STORAGE_KEY = 'dance_academy_cms_data_v1';

interface ContentContextType {
  content: CentralAcademyContent;
  updateContent: (newContent: CentralAcademyContent) => void;
  updateSection: <K extends keyof CentralAcademyContent>(key: K, data: CentralAcademyContent[K]) => void;
  resetToDefaults: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
  
  // Audio Player State
  currentTrack: TrackItem | null;
  isPlaying: boolean;
  queue: TrackItem[];
  playTrack: (track: TrackItem, trackQueue?: TrackItem[]) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;

  // Solo Dance actions
  saveSoloStyle: (style: SoloDanceStyle) => void;
  deleteSoloStyle: (id: string) => void;

  // Music actions
  saveMusicTrack: (track: TrackItem) => void;
  deleteMusicTrack: (id: string) => void;

  // Playlist actions
  savePlaylist: (playlist: Playlist) => void;
  deletePlaylist: (id: string) => void;

  // Category actions
  saveMusicCategory: (category: MusicCategory) => void;
  deleteMusicCategory: (id: string) => void;

  // Package actions
  savePackage: (pkg: PackageOption) => void;
  deletePackage: (id: string) => void;

  // FAQ actions
  saveFaq: (faq: FaqItem) => void;
  deleteFaq: (id: string) => void;

  // Instructor actions
  saveInstructor: (inst: Instructor) => void;
  deleteInstructor: (id: string) => void;

  // Style actions
  saveStyle: (style: DanceStyle) => void;
  deleteStyle: (id: string) => void;

  // Gallery actions
  saveGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;

  // Booking actions
  addBooking: (booking: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  deleteBooking: (id: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<CentralAcademyContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Fallback checks for complete structure
        return {
          ...INITIAL_ACADEMY_CONTENT,
          ...parsed,
          academy: { ...INITIAL_ACADEMY_CONTENT.academy, ...(parsed.academy || {}) },
          social: { ...INITIAL_ACADEMY_CONTENT.social, ...(parsed.social || {}) },
          navigation: { ...INITIAL_ACADEMY_CONTENT.navigation, ...(parsed.navigation || {}) },
          home: { ...INITIAL_ACADEMY_CONTENT.home, ...(parsed.home || {}) },
          tango: { ...INITIAL_ACADEMY_CONTENT.tango, ...(parsed.tango || {}) },
          brideSolo: { ...INITIAL_ACADEMY_CONTENT.brideSolo, ...(parsed.brideSolo || {}) },
          soloDance: parsed.soloDance && parsed.soloDance.length ? parsed.soloDance : INITIAL_ACADEMY_CONTENT.soloDance,
          musicCategories: parsed.musicCategories && parsed.musicCategories.length ? parsed.musicCategories : INITIAL_ACADEMY_CONTENT.musicCategories,
          tracks: parsed.tracks && parsed.tracks.length ? parsed.tracks : INITIAL_ACADEMY_CONTENT.tracks,
          playlists: parsed.playlists && parsed.playlists.length ? parsed.playlists : INITIAL_ACADEMY_CONTENT.playlists,
          soloContent: parsed.soloContent || INITIAL_ACADEMY_CONTENT.soloContent,
        };
      }
    } catch (e) {
      console.error('Failed to parse saved content from localStorage:', e);
    }
    return INITIAL_ACADEMY_CONTENT;
  });

  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState<TrackItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [queue, setQueue] = useState<TrackItem[]>([]);

  const playTrack = (track: TrackItem, trackQueue?: TrackItem[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (trackQueue && trackQueue.length) {
      setQueue(trackQueue);
    } else {
      setQueue([track]);
    }
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    if (currentTrack) {
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (!currentTrack || queue.length <= 1) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
      setIsPlaying(true);
    } else if (currentIndex === queue.length - 1) {
      setCurrentTrack(queue[0]);
      setIsPlaying(true);
    }
  };

  const prevTrack = () => {
    if (!currentTrack || queue.length <= 1) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
      setIsPlaying(true);
    } else if (currentIndex === 0) {
      setCurrentTrack(queue[queue.length - 1]);
      setIsPlaying(true);
    }
  };

  // Auto save to localStorage whenever content updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch (e) {
      console.error('Failed to save content to localStorage:', e);
    }
  }, [content]);

  const updateContent = (newContent: CentralAcademyContent) => {
    setContent(newContent);
  };

  const updateSection = <K extends keyof CentralAcademyContent>(key: K, data: CentralAcademyContent[K]) => {
    setContent((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  const resetToDefaults = () => {
    setContent(INITIAL_ACADEMY_CONTENT);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dance_academy_content_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object' && parsed.academy && parsed.home) {
        setContent({
          ...INITIAL_ACADEMY_CONTENT,
          ...parsed,
        });
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON content import', e);
    }
    return false;
  };

  // Solo Dance Management
  const saveSoloStyle = (style: SoloDanceStyle) => {
    setContent((prev) => {
      const list = prev.soloDance || [];
      const existingIdx = list.findIndex((s) => s.id === style.id);
      let updated = [...list];
      if (existingIdx >= 0) {
        updated[existingIdx] = style;
      } else {
        updated.push(style);
      }
      return { ...prev, soloDance: updated };
    });
  };

  const deleteSoloStyle = (id: string) => {
    setContent((prev) => ({
      ...prev,
      soloDance: (prev.soloDance || []).filter((s) => s.id !== id),
    }));
  };

  // Music Tracks Management
  const saveMusicTrack = (track: TrackItem) => {
    setContent((prev) => {
      const list = prev.tracks || [];
      const existingIdx = list.findIndex((t) => t.id === track.id);
      let updated = [...list];
      if (existingIdx >= 0) {
        updated[existingIdx] = track;
      } else {
        updated.push(track);
      }
      return { ...prev, tracks: updated };
    });
  };

  const deleteMusicTrack = (id: string) => {
    setContent((prev) => ({
      ...prev,
      tracks: (prev.tracks || []).filter((t) => t.id !== id),
    }));
  };

  // Playlist Management
  const savePlaylist = (playlist: Playlist) => {
    setContent((prev) => {
      const list = prev.playlists || [];
      const existingIdx = list.findIndex((p) => p.id === playlist.id);
      let updated = [...list];
      if (existingIdx >= 0) {
        updated[existingIdx] = playlist;
      } else {
        updated.push(playlist);
      }
      return { ...prev, playlists: updated };
    });
  };

  const deletePlaylist = (id: string) => {
    setContent((prev) => ({
      ...prev,
      playlists: (prev.playlists || []).filter((p) => p.id !== id),
    }));
  };

  // Music Categories Management
  const saveMusicCategory = (category: MusicCategory) => {
    setContent((prev) => {
      const list = prev.musicCategories || [];
      const existingIdx = list.findIndex((c) => c.id === category.id);
      let updated = [...list];
      if (existingIdx >= 0) {
        updated[existingIdx] = category;
      } else {
        updated.push(category);
      }
      return { ...prev, musicCategories: updated };
    });
  };

  const deleteMusicCategory = (id: string) => {
    setContent((prev) => ({
      ...prev,
      musicCategories: (prev.musicCategories || []).filter((c) => c.id !== id),
    }));
  };

  // Package Management
  const savePackage = (pkg: PackageOption) => {
    setContent((prev) => {
      const existingIdx = prev.packages.findIndex((p) => p.id === pkg.id);
      let updatedPackages = [...prev.packages];
      if (existingIdx >= 0) {
        updatedPackages[existingIdx] = pkg;
      } else {
        updatedPackages.push(pkg);
      }
      return { ...prev, packages: updatedPackages };
    });
  };

  const deletePackage = (id: string) => {
    setContent((prev) => ({
      ...prev,
      packages: prev.packages.filter((p) => p.id !== id),
    }));
  };

  // FAQ Management
  const saveFaq = (faq: FaqItem) => {
    setContent((prev) => {
      const existingIdx = prev.faqs.findIndex((f) => f.id === faq.id);
      let updatedFaqs = [...prev.faqs];
      if (existingIdx >= 0) {
        updatedFaqs[existingIdx] = faq;
      } else {
        updatedFaqs.push(faq);
      }
      return { ...prev, faqs: updatedFaqs };
    });
  };

  const deleteFaq = (id: string) => {
    setContent((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }));
  };

  // Instructor Management
  const saveInstructor = (inst: Instructor) => {
    setContent((prev) => {
      const existingIdx = prev.instructors.findIndex((i) => i.id === inst.id);
      let updated = [...prev.instructors];
      if (existingIdx >= 0) {
        updated[existingIdx] = inst;
      } else {
        updated.push(inst);
      }
      return { ...prev, instructors: updated };
    });
  };

  const deleteInstructor = (id: string) => {
    setContent((prev) => ({
      ...prev,
      instructors: prev.instructors.filter((i) => i.id !== id),
    }));
  };

  // Dance Styles Management
  const saveStyle = (style: DanceStyle) => {
    setContent((prev) => {
      const existingIdx = prev.styles.findIndex((s) => s.id === style.id);
      let updated = [...prev.styles];
      if (existingIdx >= 0) {
        updated[existingIdx] = style;
      } else {
        updated.push(style);
      }
      return { ...prev, styles: updated };
    });
  };

  const deleteStyle = (id: string) => {
    setContent((prev) => ({
      ...prev,
      styles: prev.styles.filter((s) => s.id !== id),
    }));
  };

  // Gallery Management
  const saveGalleryItem = (item: GalleryItem) => {
    setContent((prev) => {
      const existingIdx = prev.gallery.findIndex((g) => g.id === item.id);
      let updated = [...prev.gallery];
      if (existingIdx >= 0) {
        updated[existingIdx] = item;
      } else {
        updated.push(item);
      }
      return { ...prev, gallery: updated };
    });
  };

  const deleteGalleryItem = (id: string) => {
    setContent((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((g) => g.id !== id),
    }));
  };

  // Booking Requests
  const addBooking = (bookingData: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: BookingRequest = {
      ...bookingData,
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'New',
    };
    setContent((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
    }));
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setContent((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    }));
  };

  const deleteBooking = (id: string) => {
    setContent((prev) => ({
      ...prev,
      bookings: prev.bookings.filter((b) => b.id !== id),
    }));
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        updateContent,
        updateSection,
        resetToDefaults,
        exportJSON,
        importJSON,
        currentTrack,
        isPlaying,
        queue,
        playTrack,
        pauseTrack,
        resumeTrack,
        nextTrack,
        prevTrack,
        saveSoloStyle,
        deleteSoloStyle,
        saveMusicTrack,
        deleteMusicTrack,
        savePlaylist,
        deletePlaylist,
        saveMusicCategory,
        deleteMusicCategory,
        savePackage,
        deletePackage,
        saveFaq,
        deleteFaq,
        saveInstructor,
        deleteInstructor,
        saveStyle,
        deleteStyle,
        saveGalleryItem,
        deleteGalleryItem,
        addBooking,
        updateBookingStatus,
        deleteBooking,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
