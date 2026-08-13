export type NavigationPage = 
  | 'home'
  | 'tango'
  | 'bride-solo'
  | 'solo-dance'
  | 'styles'
  | 'gallery'
  | 'instructors'
  | 'contact'
  | 'music'
  | 'admin';

export interface SoloDanceStyle {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  category: string;
  level: string;
  duration: string;
  sessions: string;
  price: string;
  features: string[];
  instructor: string;
  musicPlaylistId: string;
  featured: boolean;
  active: boolean;
  buttonText: string;
  order?: number;
}

export interface MusicCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  category: string;
  coverImage: string;
  audioUrl: string;
  duration: string;
  description?: string;
  downloadable: boolean;
  downloadUrl?: string;
  featured: boolean;
  active: boolean;
  order: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  tracks: string[];
  featured: boolean;
  active: boolean;
  order: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  style: string;
  duration: string;
  bpm: number;
  previewType: 'tango' | 'waltz' | 'solo' | 'fusion';
}

export interface DanceStyle {
  id: string;
  titleFa: string;
  titleEn: string;
  shortDesc: string;
  fullDesc: string;
  heroImage: string;
  secondaryImage: string;
  badge: string;
  recommendedSessions: number;
  difficulty: 'آسان' | 'متوسط' | 'پیشرفته';
  features: string[];
  recommendedMusic: string[];
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  experienceYears: number;
  choreographiesCount: number;
  featuredStyles: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'tango' | 'bride-solo' | 'group' | 'backstage';
  imageUrl: string;
  coupleName?: string;
  dateStr?: string;
  videoUrl?: string;
}

export interface PackageOption {
  id: string;
  title: string;
  subtitle: string;
  sessions: number;
  price: string;
  isPopular?: boolean;
  features: string[];
}

export interface BookingForm {
  coupleName: string;
  phone: string;
  danceStyle: string;
  weddingDate: string;
  preferredTime: string;
  notes: string;
}

export type BookingStatus = 'New' | 'Contacted' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface BookingRequest extends BookingForm {
  id: string;
  createdAt: string;
  status: BookingStatus;
  branch?: string;
}

export interface Testimonial {
  id: string;
  coupleName: string;
  date: string;
  style: string;
  text: string;
  image: string;
  rating: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'tango' | 'general' | 'solo' | 'pricing';
  order: number;
  active: boolean;
}

export interface BranchInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  mobile: string;
  workingHours: string;
  mapLink?: string;
  latitude?: number;
  longitude?: number;
}

export interface AcademyInfo {
  name: string;
  logoText: string;
  tagline: string;
  phoneMain: string;
  phoneMobile: string;
  email: string;
  copyright: string;
  generalAddress: string;
  workingHours: string;
}

export interface SocialLinks {
  instagram: string;
  whatsapp: string;
  telegram: string;
  youtube: string;
  website: string;
}

export interface NavigationLabels {
  home: string;
  tango: string;
  brideSolo: string;
  soloDance?: string;
  styles: string;
  gallery: string;
  instructors: string;
  contact: string;
  music?: string;
  admin: string;
  bookBtn: string;
}

export interface HomeContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
  };
  stats: {
    couplesCount: string;
    experienceYears: string;
    branchesCount: string;
    guaranteeText: string;
  };
  quickStyles: {
    badge: string;
    title: string;
    allStylesBtn: string;
  };
  calculator: {
    badge: string;
    title: string;
    description: string;
    labelRemaining: string;
    labelSuggestion: string;
    buttonText: string;
  };
  instructorsHeader: {
    badge: string;
    title: string;
    subtitle: string;
    buttonText: string;
  };
  testimonialsHeader: {
    badge: string;
    title: string;
  };
}

export interface TangoContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    buttonText: string;
  };
  whyTango: {
    title: string;
    description: string;
    features: string[];
    cardBadge: string;
    cardTitle: string;
  };
  musicSection: {
    badge: string;
    title: string;
  };
  packagesSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  faqTitle: string;
}

export interface BrideSoloContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    buttonText: string;
  };
  details: {
    title: string;
    description: string;
    benefits: { title: string; desc: string }[];
  };
}

export interface SeoContent {
  pageTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

export interface SoloPageContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  benefitsTitle: string;
  benefits: { title: string; desc: string }[];
}

export interface CentralAcademyContent {
  academy: AcademyInfo;
  social: SocialLinks;
  navigation: NavigationLabels;
  home: HomeContent;
  tango: TangoContent;
  brideSolo: BrideSoloContent;
  soloContent?: SoloPageContent;
  styles: DanceStyle[];
  soloDance?: SoloDanceStyle[];
  musicCategories?: MusicCategory[];
  tracks?: TrackItem[];
  playlists?: Playlist[];
  gallery: GalleryItem[];
  instructors: Instructor[];
  packages: PackageOption[];
  musicTracks: MusicTrack[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  branches: BranchInfo[];
  bookings: BookingRequest[];
  seo: Record<NavigationPage, SeoContent>;
}

