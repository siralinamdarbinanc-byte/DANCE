import { DanceStyle, Instructor, GalleryItem, PackageOption, MusicTrack, Testimonial, SoloDanceStyle, MusicCategory, TrackItem, Playlist } from '../types';

export const TANGO_HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhTpgTVhrUHaI-p9qXpl_Y5V8tZsroi7neWKxY4EwzS77rq54fgY1eCTNnrgXB25gKXLvcWp5Rb2LRrSDYgNLKtRhrN5CWM9ELdVuRhLwwI3zqRGf4VwXjc8hssCk-aVRL8Zn1Akfw3bW6xlCIS69GfnLOaGZs6R2pjphWw_wWH3f2Vn5eKNbsSa_VCubXoB5KV5xdspqHc0faGp2KiOgneo24ppCMemVZAD-ULpWSpjlZW5V4i16-';
export const TANGO_FEET_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfwGBUuLZEAOvqzdX07g4Rp6CepnUcNYCVkHP7HmenQpeRMvRRaHxorU0eNC_Nyr-jYqqCeORPJOZ9x2WyVOvQkwDvBbETCVgnLvebcaaFqTlEmP15yX9q5YwIAJkjn4luF2uIhmpWNlt1OAE6aBWNFh2BIYjcVVAX-C64Vk4D4y8A-V2lAh4HA7Sbzx7Wyf2cnX0YNA_HwdAOawJy0aBBVUpJUvQGRLVO_yfvknBrMbzjxCBrRH6l';

export const DANCE_STYLES: DanceStyle[] = [
  {
    id: 'tango',
    titleFa: 'تانگوی عروس و داماد',
    titleEn: 'Bridal Tango',
    shortDesc: 'رقصی پرشور، دراماتیک و سینمایی که اوج هماهنگی و عشق شما را جاودانه می‌سازد.',
    fullDesc: 'تانگو فراتر از یک رقص است؛ این یک مکالمه بدون کلام بین دو عاشق است. انتخاب تانگو برای رقص عروسی، نشان‌دهنده جسارت، ظرافت و ارتباط عمیق شماست. این سبک با حرکات کلاسیک و تاثیرگذار خود، لحظاتی فراموش‌نشدنی را برای فیلم عروسی شما خلق می‌کند.',
    heroImage: TANGO_HERO_IMG,
    secondaryImage: TANGO_FEET_IMG,
    badge: 'محبوب‌ترین سبک سینمایی',
    recommendedSessions: 6,
    difficulty: 'متوسط',
    features: [
      'نمایش اوج هماهنگی و ارتباط عاطفی زوج',
      'خلق صحنه‌های خیره‌کننده و سینمایی برای فیلم عروسی',
      'حرکات کلاسیک، قدرتمند و تاثیرگذار',
      'تنظیم اختصاصی موزیک با میکس افکت‌های صوتی و لایتینگ',
    ],
    recommendedMusic: ['Por Una Cabeza', 'Libertango - Piazzolla', 'Persian Tango Wedding Mix'],
  },
  {
    id: 'bride-solo',
    titleFa: 'عروس سولو (Solo Bride)',
    titleEn: 'Solo Bride Dance',
    shortDesc: 'رقصی رویایی و شاهانه برای ورودی عروس با طراحی متناسب با مدل لباس و تور.',
    fullDesc: 'لحظه‌ای که تمام پروژکتورها روی عروس قفل می‌شوند. طراحی رقص سولو عروس با در نظر گرفتن نوع لباس (پف‌دار، دنباله‌دار یا دنباله ماهی)، وزن تور و میزان راحتی کفش انجام می‌شود تا عروس مانند یک پرنسس بر روی استیج بدرخشد.',
    heroImage: 'https://images.unsplash.com/photo-1545959570-a942ee4ee74a?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    badge: 'شکوه و ظرافت زنانه',
    recommendedSessions: 5,
    difficulty: 'آسان',
    features: [
      'طراحی تمرینات ویژه حرکت با تور و دنباله لباس',
      'تمرکز بر ژست‌های صورت، دست‌ها و فیگور عکاسی',
      'طراحی حرکت بر اساس میزان انعطاف و استعداد ذاتی عروس',
      'همراهی با ساقدوش‌ها در بخش پایانی رقص',
    ],
    recommendedMusic: ['Dance of the Princess', 'Persian Romantic Solo Mix', 'A Thousand Years Solo Violin'],
  },
  {
    id: 'waltz',
    titleFa: 'الس و رقص ملایم دو نفره',
    titleEn: 'Romantic Slow Waltz',
    shortDesc: 'رقصی کلاسیک و رمانتیک با چرخش‌های نرم و شاعرانه در میان یخ خشک و آتش‌بازی.',
    fullDesc: 'الس کلاسیک انتخاب ایده‌آل برای زوج‌هایی است که به دنبال سادگی در عین باکلاسی هستند. چرخش‌های نرم ۳/۴ ریتمیک همراه با مه سنگین (Direct Ice) حس پرواز روی ابرها را بازسازی می‌کند.',
    heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: TANGO_HERO_IMG,
    badge: 'کلاسیک و جاودانه',
    recommendedSessions: 4,
    difficulty: 'آسان',
    features: [
      'یادگیری سریع و بدون استرس در کمترین تعداد جلسه',
      'سازگاری کامل با انواع لباس عروس',
      'ایجاد قاب‌های رومانتیک برای عکاسی و تصویربرداری هلی‌شات',
      'شامل فیگور اسپین و لیفت ملایم پایان رقص',
    ],
    recommendedMusic: ['The Second Waltz - Shostakovich', 'Persian Waltz Mashup'],
  },
  {
    id: 'persian-fusion',
    titleFa: 'رقص ایرانی و تلفیقی سنتی',
    titleEn: 'Persian Fusion & Classical',
    shortDesc: 'ترکیب حرکات اصیل ایرانی با مینیاتورهای مدرن دست و فیگورهای شیک.',
    fullDesc: 'رقص ایرانی اصیل با ژست‌های مدرن اصطلاحاً فیوژن نامیده می‌شود. در این سبک، حرکات ناز دست‌ها، ناز چشمان و فیگورهای کمر ایرانی با هارمونی معاصر ترکیب شده تا اصالت ایرانی به زیباترین شکل نمایش داده شود.',
    heroImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1545959570-a942ee4ee74a?q=80&w=1200&auto=format&fit=crop',
    badge: 'اصالت و ناز ایرانی',
    recommendedSessions: 5,
    difficulty: 'آسان',
    features: [
      'آموزش ناز دست و شانه و هماهنگی با آهنگ‌های ماندگار ایرانی',
      'امکان طراحی دونفره یا گروهی با ساقدوش‌ها',
      'تناسب عالی با مراسم عقد و حنابندان',
    ],
    recommendedMusic: ['جان مریم فیوژن', 'گل سنگم مدرن', 'عاشقانه سنتور و ویولن'],
  },
  {
    id: 'knife-dance',
    titleFa: 'رقص چاقوی عروسی با ساقدوش‌ها',
    titleEn: 'Knife Dance (Rags-e Chaqo)',
    shortDesc: 'طراحی رقص شاد و ژست‌های بانمک و شوخ‌طبعانه برای بریدن کیک.',
    fullDesc: 'رقص چاقو یکی از شادترین و صمیمی‌ترین بخش‌های عروسی ایرانی است. ما این بخش را از حالت سنتی به یک اجرای سناریومحور و جذاب با حضور خواهران، دوستان و ساقدوش‌ها تبدیل می‌کنیم.',
    heroImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    badge: 'شاد و شوخ‌طبعانه',
    recommendedSessions: 3,
    difficulty: 'آسان',
    features: [
      'سناریوی طنز و جذاب بین ساقدوش‌ها و داماد',
      'طراحی حرکات سریع و شاد',
      'تمرین با چاقوی تزئینی و هماهنگی کامل موسیقی',
    ],
    recommendedMusic: ['ریمیکس رقص چاقو VIP', 'آهنگ شاد رقص کیک'],
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 'arasham-nazanin',
    name: 'استاد آرشام و نازنین',
    title: 'مدرسین ارشد تانگو و والس سینمایی',
    specialty: 'تانگوی آرژانتینی، والس کلاسیک و طراحی رقص‌های دو نفره',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    bio: 'با بیش از ۱۲ سال تجربه تخصصی در آموزش رقص‌های بین‌المللی عروسی و طراحی بیش از ۵۰۰ طراحی رقص ماندگار برای زوج‌ها در ایران و خارج از کشور.',
    experienceYears: 12,
    choreographiesCount: 520,
    featuredStyles: ['تانگو', 'والس', 'رقص دو نفره'],
  },
  {
    id: 'parnian',
    name: 'استاد پرنیان شاهین',
    title: 'طراح ارشد رقص سولو عروس و فیوژن',
    specialty: 'سولو عروس، رقص ایرانی اصیل و فیوژن معاصر',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    bio: 'فارغ‌التحصیل طراحی حرکت با سابقه همکاری با کارگردانان ویدیوهای عروسی. تخصص ویژه در تطبیق حرکات رقص با ژست‌های عکاسی و لایتینگ.',
    experienceYears: 9,
    choreographiesCount: 380,
    featuredStyles: ['عروس سولو', 'رقص ایرانی', 'فیوژن'],
  },
  {
    id: 'bardia',
    name: 'استاد بردیا کامران',
    title: 'طراح رقص گروهی و ساقدوش‌ها',
    specialty: 'رقص چاقو، گروه ساقدوش‌ها و میکس‌های شاد مدرن',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    bio: 'متخصص ایجاد انرژی، صمیمیت و شوخ‌طبعی در برنامه‌های گروهی عروسی. آموزش سریع حرکات هماهنگ حتی برای کسانی که سابقه رقص ندارند.',
    experienceYears: 7,
    choreographiesCount: 290,
    featuredStyles: ['رقص چاقو', 'ساقدوش‌ها', 'میکس مدرن'],
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'تانگوی سینمایی در تالار همایش‌های الهیه',
    category: 'tango',
    imageUrl: TANGO_HERO_IMG,
    coupleName: 'سامان و فرنوش',
    dateStr: 'اردیبهشت ۱۴۰۳',
  },
  {
    id: 'g2',
    title: 'لحظه حساس فیگور تانگو و تمرکز نور سپید',
    category: 'tango',
    imageUrl: TANGO_FEET_IMG,
    coupleName: 'امیرحسین و شکیبا',
    dateStr: 'فروردین ۱۴۰۳',
  },
  {
    id: 'g3',
    title: 'رقص سولو عروس با تور سه متری',
    category: 'bride-solo',
    imageUrl: 'https://images.unsplash.com/photo-1545959570-a942ee4ee74a?q=80&w=1200&auto=format&fit=crop',
    coupleName: 'درسا',
    dateStr: 'خرداد ۱۴۰۳',
  },
  {
    id: 'g4',
    title: 'والس رویایی در میان ابرهای یخ خشک',
    category: 'tango',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    coupleName: 'پوریا و نیکی',
    dateStr: 'تیر ۱۴۰۳',
  },
  {
    id: 'g5',
    title: 'اجرای شاد ساقدوش‌ها و رقص چاقو',
    category: 'group',
    imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200&auto=format&fit=crop',
    coupleName: 'گروه ساقدوش‌های کیمیا',
    dateStr: 'مرداد ۱۴۰۳',
  },
  {
    id: 'g6',
    title: 'پشت صحنه تمرین خصوصی در استودیو VIP',
    category: 'backstage',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    coupleName: 'پشت صحنه آکادمی',
    dateStr: 'مرداد ۱۴۰۳',
  }
];

export const PACKAGES: PackageOption[] = [
  {
    id: 'express',
    title: 'پکیج اکسپرس (فشرده)',
    subtitle: 'ویژه زوج‌هایی که کمتر از ۲ هفته تا عروسی زمان دارند',
    sessions: 3,
    price: '۱۲,۵۰۰,۰۰۰ تومان',
    features: [
      '۳ جلسه تمرین خصوصی ۹۰ دقیقه‌ای',
      'آموزش ۱ رقص اصلی (تانگو یا والس ساده)',
      'میکس و ادیت رایگان موزیک مورد علاقه',
      'فیلمبرداری تمرین برای مرور در منزل',
      'تضمین آمادگی سریع و بدون استرس',
    ],
  },
  {
    id: 'cinema-vip',
    title: 'پکیج سینمایی VIP (پرطرفدارترین)',
    subtitle: 'آموزش کامل تانگو + رقص ورودی + فیگورهای حرفه‌ای',
    sessions: 6,
    price: '۲۲,۰۰۰,۰۰۰ تومان',
    isPopular: true,
    features: [
      '۶ جلسه تمرین اختصاصی در استودیوی آکادمی',
      'طراحی ۱ رقص اصلی تانگو + ورودیه یا والس',
      'میکس اختصاصی صوتی همراه با صدای شما روی موزیک',
      'یک جلسه تمرین پرو با لباس عروسی و تور (Pro-Rehearsal)',
      'مشاوره افکت‌های نور و یخ خشک با تیم فیلمبرداری شما',
      'پشتیبانی مستقیم استادی تا روز مراسم',
    ],
  },
  {
    id: 'master-grand',
    title: 'پکیج گرند مستر (VIP کامل)',
    subtitle: 'کامل‌ترین پکیج شامل رقص تانگو، سولو عروس و ساقدوش‌ها',
    sessions: 10,
    price: '۳۴,۰۰۰,۰۰۰ تومان',
    features: [
      '۱۰ جلسه تمرین کاملاً تخصصی و خصوصی',
      'طراحی کامل تانگو + سولو عروس + رقص چاقو/ساقدوش‌ها',
      'میکس ۲ موزیک اختصاصی و ساخت دکلمه کوتاه زوج',
      'حضور استاد در جلسه ژنرال یا تالار (در صورت درخواست)',
      'ارائه لیست کامل ژست‌های هلی‌شات و عکاسی',
      'رزرو اولویت‌دار ساعت‌های استودیو در آخر هفته',
    ],
  }
];

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'm1',
    title: 'Por Una Cabeza (کلاسیک تانگو)',
    artist: 'Carlos Gardel / Royal Strings',
    style: 'تانگو سینمایی',
    duration: '02:45',
    bpm: 120,
    previewType: 'tango',
  },
  {
    id: 'm2',
    title: 'Libertango - Passionate Edit',
    artist: 'Astor Piazzolla',
    style: 'تانگو آرژانتینی دراماتیک',
    duration: '03:10',
    bpm: 132,
    previewType: 'tango',
  },
  {
    id: 'm3',
    title: 'Dance of the Persian Princess',
    artist: 'Symphonic Strings',
    style: 'عروس سولو شاهانه',
    duration: '02:30',
    bpm: 90,
    previewType: 'solo',
  },
  {
    id: 'm4',
    title: 'Second Waltz - Golden Strings',
    artist: 'Dmitri Shostakovich',
    style: 'والس رویاگون',
    duration: '03:20',
    bpm: 108,
    previewType: 'waltz',
  },
  {
    id: 'm5',
    title: 'Persian Wedding Romantic Medley',
    artist: 'Dance Academy Exclusive Mix',
    style: 'تلفیقی پاپ و تانگو',
    duration: '03:45',
    bpm: 115,
    previewType: 'fusion',
  }
];

export const SOLO_DANCE_STYLES: SoloDanceStyle[] = [
  {
    id: 'arabic',
    title: 'رقص عربی (Arabic)',
    slug: 'arabic',
    shortDescription: 'رقص عربی انفرادی با حرکات موزون ایقاع، شانه و کمر.',
    fullDescription: 'آموزش گام‌به‌گام رقص عربی از مقدماتی تا پیشرفته. این دوره شامل تکنیک‌های لرزش شانه‌ها، حرکات خلیجی و مصری، کنترل عضلات و ایقاع‌شناسی است.',
    image: 'https://images.unsplash.com/photo-1545959570-a942ee4ee74a?q=80&w=1200&auto=format&fit=crop',
    category: 'solo',
    level: 'مقدماتی تا پیشرفته',
    duration: '۱ ماه (۵ جلسه)',
    sessions: '۵ جلسه ۹۰ دقیقه‌ای',
    price: '۸,۵۰۰,۰۰۰ تومان',
    features: [
      'آموزش ایقاع‌شناسی و ریتم‌خوانی',
      'تکنیک لرزش شانه و ناز دست‌ها',
      'ژست‌های اختصاصی عکاسی و فیلمبرداری',
      'ارائه موزیک‌های تمرینی'
    ],
    instructor: 'استاد پرنیان شاهین',
    musicPlaylistId: 'playlist-arabic',
    featured: true,
    active: true,
    buttonText: 'مشاهده جزئیات',
    order: 1
  },
  {
    id: 'bandari',
    title: 'رقص بندری (Bandari)',
    slug: 'bandari',
    shortDescription: 'رقص شاد و پرانرژی بندری با حرکات ریتمیک دست و شانه.',
    fullDescription: 'رقص بندری یکی از اصیل‌ترین و پرانرژی‌ترین رقص‌های ایرانی است. در این دوره حرکات پایه نی‌انبان، چرخش‌های ریتمیک، ضرب‌پا و هماهنگی با تمپوی بالا آموزش داده می‌شود.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    category: 'solo',
    level: 'مقدماتی تا متوسط',
    duration: '۴ جلسه',
    sessions: '۴ جلسه ۶۰ دقیقه‌ای',
    price: '۷,۵۰۰,۰۰۰ تومان',
    features: [
      'یادگیری تکنیک‌های حرکتی شانه و دست',
      'افزایش انرژی و شادابی در اجرای فردی',
      'تمرین با ریمیکس‌های بندری شاد',
      'مناسب جشن‌ها و مهمانی‌ها'
    ],
    instructor: 'استاد بردیا کامران',
    musicPlaylistId: 'playlist-bandari',
    featured: true,
    active: true,
    buttonText: 'مشاهده جزئیات',
    order: 2
  },
  {
    id: 'persian',
    title: 'رقص ایرانی (Persian)',
    slug: 'persian',
    shortDescription: 'رقص اصیل ایرانی با ظرافت دست‌ها، ناز چشمان و فیگورهای مینیاتوری.',
    fullDescription: 'رقص کلاسیک و مینیاتوری ایرانی ترکیبی از ناز، وقار و زیبایی است. در این دوره ژست‌های شکیل، چرخش‌های ملایم، ناز چشم و هماهنگی کامل با موزیک‌های سنتی و فیوژن ایرانی آموزش داده می‌شود.',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=1200&auto=format&fit=crop',
    category: 'solo',
    level: 'مقدماتی تا پیشرفته',
    duration: '۱ ماه',
    sessions: '۵ جلسه ۹۰ دقیقه‌ای',
    price: '۸,۰۰۰,۰۰۰ تومان',
    features: [
      'فیگورهای اصیل مینیاتور ایرانی',
      'کنترل احساسات صورت و ژست‌ها',
      'هماهنگی با موزیک‌های ماندگار ایرانی',
      'مناسب عروسی و مراسم اصیل'
    ],
    instructor: 'استاد پرنیان شاهین',
    musicPlaylistId: 'playlist-persian',
    featured: true,
    active: true,
    buttonText: 'مشاهده جزئیات',
    order: 3
  },
  {
    id: 'heels',
    title: 'رقص هیلز (Heels)',
    slug: 'heels',
    shortDescription: 'رقص جذاب و مدرن با کفش پاشنه‌دار با تمرکز بر حفظ تعادل و فرم بدن.',
    fullDescription: 'سبک هیلز (Heels Dance) تلفیقی از رقص جاز، هیپ‌هاپ و فیگورهای مدرن با کفش پاشنه‌دار است. این دوره باعث تقویت اعتمادبه‌نفس، حفظ تعادل روی پاشنه و افزایش جذابیت حرکتی می‌شود.',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop',
    category: 'solo',
    level: 'متوسط تا پیشرفته',
    duration: '۵ جلسه',
    sessions: '۵ جلسه ۹۰ دقیقه‌ای',
    price: '۹,۰۰۰,۰۰۰ تومان',
    features: [
      'آموزش راه‌رفتن و فیگور روی پاشنه بلند',
      'تمرینات استقامت عضلات پا و تعادل',
      'کوریوگرافی مدرن و جذاب',
      'افزایش فوق‌العاده اعتمادبه‌نفس'
    ],
    instructor: 'استاد پرنیان شاهین',
    musicPlaylistId: 'playlist-heels',
    featured: true,
    active: true,
    buttonText: 'مشاهده جزئیات',
    order: 4
  },
  {
    id: 'twerk',
    title: 'رقص توئرک (Twerk)',
    slug: 'twerk',
    shortDescription: 'رقص ریتمیک و پرانرژی با تمرکز بر تکنیک‌های عضلات پایین‌تنه.',
    fullDescription: 'سبک توئرک (Twerk) یک رقص بدنسازی-ریتمیک مدرن است که علاوه بر سوزاندن کالری بالا، تکنیک‌های کنترل عضلات لگن و ران، ایقاع‌شناسی ریتم‌های بیس‌دار و انعطاف‌پذیری را آموزش می‌دهد.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
    category: 'solo',
    level: 'مقدماتی تا متوسط',
    duration: '۴ جلسه',
    sessions: '۴ جلسه ۶۰ دقیقه‌ای',
    price: '۸,۵۰۰,۰۰۰ تومان',
    features: [
      'تقویت عضلات کور و فرم‌دهی پایین‌تنه',
      'آموزش ایلیز و ایقاع بیس موزیک',
      'تمرینات کششی و انعطاف‌پذیری',
      'محیطی کاملاً خصوصی و زنانه'
    ],
    instructor: 'استاد پرنیان شاهین',
    musicPlaylistId: 'playlist-twerk',
    featured: false,
    active: true,
    buttonText: 'مشاهده جزئیات',
    order: 5
  }
];

export const MUSIC_CATEGORIES_DATA: MusicCategory[] = [
  { id: 'tango', name: 'تانگو', icon: '🎵' },
  { id: 'bandari', name: 'بندری', icon: '🎵' },
  { id: 'persian', name: 'ایرانی', icon: '🎵' },
  { id: 'arabic', name: 'عربی', icon: '🎵' },
  { id: 'heels', name: 'هیلز', icon: '🎵' },
  { id: 'twerk', name: 'توئرک', icon: '🎵' },
];

export const TRACKS_DATA: TrackItem[] = [
  {
    id: 't1',
    title: 'Por Una Cabeza (Tango Special)',
    artist: 'Gardel / Strings Orchestra',
    category: 'tango',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_1e5987c2b3.mp3?filename=tango-passion-10825.mp3',
    duration: '3:15',
    description: 'موزیک استاندارد و کلاسیک تانگو ویژه تمرین گام‌ها و فیگورهای دو نفره.',
    downloadable: true,
    featured: true,
    active: true,
    order: 1
  },
  {
    id: 't2',
    title: 'Libertango Dramatic Passion',
    artist: 'Piazzolla Ensemble',
    category: 'tango',
    coverImage: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=dramatic-tango-112701.mp3',
    duration: '2:45',
    description: 'نسخه دراماتیک تانگو مناسب اجرای نهایی فیلم عروسی.',
    downloadable: false,
    featured: true,
    active: true,
    order: 2
  },
  {
    id: 't3',
    title: 'میکس شاد بندری VIP',
    artist: 'گروه رقص بندری آکادمی',
    category: 'bandari',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_273166d1f0.mp3?filename=arabic-oriental-dance-126282.mp3',
    duration: '3:40',
    description: 'موزیک نی‌انبان و ضرب شاد بندری مخصوص رقص‌های انفرادی و تالار.',
    downloadable: true,
    featured: true,
    active: true,
    order: 3
  },
  {
    id: 't4',
    title: 'عاشقانه مینیاتوری ایرانی',
    artist: 'ارکستر سنتی و ویولن',
    category: 'persian',
    coverImage: 'https://images.unsplash.com/photo-1545959570-a942ee4ee74a?auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9932145e6d.mp3?filename=middle-eastern-breeze-123498.mp3',
    duration: '4:10',
    description: 'موزیک ملایم اصیل ایرانی برای تمرین ناز دست و رقص سولو.',
    downloadable: true,
    featured: true,
    active: true,
    order: 4
  },
  {
    id: 't5',
    title: 'ایقاع طبل رقص عربی',
    artist: 'طبل و عود مصری',
    category: 'arabic',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=oriental-beat-18451.mp3',
    duration: '3:05',
    description: 'ریتم و ایقاع لرزش شانه و رقص عربی.',
    downloadable: true,
    featured: true,
    active: true,
    order: 5
  }
];

export const PLAYLISTS_DATA: Playlist[] = [
  {
    id: 'playlist-tango',
    title: 'پلی‌لیست تانگوی سینمایی',
    description: 'مجموعه برترین موزیک‌های تانگو جهت تمرین و اجرای عروس و داماد.',
    category: 'tango',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80',
    tracks: ['t1', 't2'],
    featured: true,
    active: true,
    order: 1
  },
  {
    id: 'playlist-bandari',
    title: 'پلی‌لیست شاد بندری',
    description: 'پرانرژی‌ترین موزیک‌های بندری جهت رقص فردی و گروهی.',
    category: 'bandari',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80',
    tracks: ['t3'],
    featured: true,
    active: true,
    order: 2
  },
  {
    id: 'playlist-persian',
    title: 'پلی‌لیست رقص اصیل ایرانی',
    description: 'موزیک‌های مینیاتوری و ناز دست برای رقص ایرانی.',
    category: 'persian',
    coverImage: 'https://images.unsplash.com/photo-1545959570-a942ee4ee74a?auto=format&fit=crop&q=80',
    tracks: ['t4'],
    featured: true,
    active: true,
    order: 3
  },
  {
    id: 'playlist-arabic',
    title: 'پلی‌لیست رقص عربی و ایقاع',
    description: 'آهنگ‌ها و ریتم‌های پرانرژی رقص عربی انفرادی.',
    category: 'arabic',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
    tracks: ['t5'],
    featured: true,
    active: true,
    order: 4
  }
];

export const TESTIMONIALS = [
  {
    id: 't1',
    coupleName: 'سامان و فرنوش',
    date: 'خرداد ۱۴۰۳',
    style: 'پکیج سینمایی تانگو',
    text: 'ما اصلاً سابقه رقص نداشتیم و خیلی نگران تانگو بودیم. ولی اساتید با صبوری عجیب طی ۶ جلسه کاری کردند که همه مهمونامون فکر میکردن ما سال‌هاست تانگو کار می‌کنیم! فیلم عروسیمون عالی شد.',
    image: TANGO_HERO_IMG,
    rating: 5,
  },
  {
    id: 't2',
    coupleName: 'امیررضا و نسترن',
    date: 'اردیبهشت ۱۴۰۳',
    style: 'پکیج گرند مستر',
    text: 'تمرین با لباس عروس تو جلسات آخر معجزه کرد! روز عروسی هیچ استرسی بابت گیر کردن تور یا دنباله لباس نداشتم. مرسی از تیم حرفه‌ای آکادمی.',
    image: 'https://images.unsplash.com/photo-1545959570-a942ee4ee74a?q=80&w=1200&auto=format&fit=crop',
    rating: 5,
  },
  {
    id: 't3',
    coupleName: 'پویان و آتوسا',
    date: 'فروردین ۱۴۰۳',
    style: 'تلفیقی والس و تانگو',
    text: 'میکس صوتی اختصاصی که برامون ساختن عالی بود. لحظه‌ای که مه سرد روشن شد و ما چرخیدیم، کل تالار تشویق کردن. بهترین سرمایه‌گذاری عروسیمون همین کلاس بود.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    rating: 5,
  }
];
