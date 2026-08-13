import { CentralAcademyContent } from '../types';
import {
  DANCE_STYLES,
  INSTRUCTORS,
  GALLERY_ITEMS,
  PACKAGES,
  MUSIC_TRACKS,
  TESTIMONIALS,
  SOLO_DANCE_STYLES,
  MUSIC_CATEGORIES_DATA,
  TRACKS_DATA,
  PLAYLISTS_DATA,
} from './mockData';

export const INITIAL_ACADEMY_CONTENT: CentralAcademyContent = {
  academy: {
    name: 'DANCE ACADEMY',
    logoText: 'DANCE ACADEMY',
    tagline: 'آکادمی تخصصی رقص عروسی',
    phoneMain: '۰۲۱-۲۲۶۵۹۰۸۰',
    phoneMobile: '۰۹۱۲-۸۸۸۳۰۰۲',
    email: 'info@weddingdance.ir',
    copyright: '© ۲۰۲۶ آکادمی رقص عروسی DANCE ACADEMY. تمامی حقوق محفوظ است.',
    generalAddress: 'تهران، الهیه، خیابان فرشته، برج داریوش / شعبه نیاوران',
    workingHours: 'شنبه تا پنج‌شنبه ۱۰:۰۰ الی ۲۱:۰۰ (جمعه‌ها VIP با هماهنگی)',
  },

  social: {
    instagram: 'https://instagram.com/danceacademy_wedding',
    whatsapp: 'https://wa.me/989128883002',
    telegram: 'https://t.me/danceacademy_admin',
    youtube: 'https://youtube.com',
    website: 'https://danceacademy.ir',
  },

  navigation: {
    home: 'خانه',
    tango: 'تانگو',
    brideSolo: 'عروس سولو',
    soloDance: 'رقص‌های تک‌نفره',
    styles: 'سبک‌ها',
    gallery: 'گالری',
    instructors: 'اساتید',
    music: 'موزیک‌ها',
    contact: 'تماس',
    admin: 'مدیریت',
    bookBtn: 'رزرو مشاوره',
  },

  home: {
    hero: {
      badge: 'آکادمی بین‌المللی رقص عروس و داماد DANCE ACADEMY',
      title: 'خلق درخشان‌ترین صحنه فیلم عروسی شما',
      subtitle:
        'آموزش اختصاصی تانگوی سینمایی، رقص سولو عروس و والس کلاسیک در محیطی کاملاً خصوصی و لاکچری با اساتید بین‌المللی.',
      primaryButton: 'رزرو جلسه تست و مشاوره رایگان',
      secondaryButton: 'مشاهده پکیج‌های تانگو',
    },
    stats: {
      couplesCount: '+۵۰۰',
      experienceYears: '۱۲ سال',
      branchesCount: '۲ شعبه',
      guaranteeText: '۱۰۰٪ تضمین آمادگی',
    },
    quickStyles: {
      badge: 'سبک‌های رقص آکادمی',
      title: 'سبک اختصاصی عروسی خود را کشف کنید',
      allStylesBtn: 'مشاهده جزئیات همه سبک‌ها',
    },
    calculator: {
      badge: 'محاسبه‌گر هوشمند زمان تمرین',
      title: 'چند جلسه تمرین برای رقص عروسی شما کافی است؟',
      description:
        'بر اساس تعداد هفته‌های باقی‌مانده تا تاریخ مراسم، برنامه زمان‌بندی پیشنهادی آکادمی را دریافت کنید:',
      labelRemaining: 'زمان باقی‌مانده تا عروسی:',
      labelSuggestion: 'پیشنهاد آکادمی برای شما:',
      buttonText: 'رزرو مشاوره این پکیج',
    },
    instructorsHeader: {
      badge: 'اساتید بین‌المللی آکادمی',
      title: 'کادر طراحان و مربیان برجسته',
      subtitle:
        'تمرین تحت نظر بااستعدادترین اساتید رقص بین‌المللی با صبوری و دقت بالا',
      buttonText: 'مشاهده پروفایل کامل مربیان',
    },
    testimonialsHeader: {
      badge: 'تجربه هنرجویان آکادمی',
      title: 'نظرات زوج‌های DANCE ACADEMY',
    },
  },

  tango: {
    hero: {
      badge: 'تخصصی‌ترین مرکز آموزش رقص عروس و داماد',
      title: 'تانگوی عروس و داماد',
      subtitle:
        'رقصی پرشور و دراماتیک که اوج هماهنگی و عشق شما را در قاب سینمایی عروسی‌تان جاودانه می‌کند.',
      buttonText: 'رزرو جلسه تانگو',
    },
    whyTango: {
      title: 'چرا تانگو؟',
      description:
        'تانگو فراتر از یک رقص است؛ این یک مکالمه بدون کلام بین دو عاشق است. انتخاب تانگو برای رقص عروسی، نشان‌دهنده جسارت، ظرافت و ارتباط عمیق شماست. این سبک با حرکات کلاسیک و تاثیرگذار خود، لحظاتی فراموش‌نشدنی را برای فیلم عروسی شما خلق می‌کند.',
      features: [
        'نمایش اوج هماهنگی و ارتباط عاطفی زوج',
        'خلق صحنه‌های خیره‌کننده و سینمایی برای فیلم عروسی',
        'حرکات کلاسیک، قدرتمند و تاثیرگذار',
      ],
      cardBadge: 'استودیو اختصاصی DANCE ACADEMY',
      cardTitle: 'تمرین تخصصی گام‌ها و فیگورهای پای تانگو',
    },
    musicSection: {
      badge: 'آرشیو موزیک‌های ماندگار',
      title: 'پیش‌نمایش صوتی قطعات تانگو و والس',
    },
    packagesSection: {
      badge: 'پکیج‌های تمرینی تانگو',
      title: 'پکیج متناسب با زمان و نیاز خود را انتخاب کنید',
      subtitle:
        'کلیه کلاس‌ها به صورت کاملاً خصوصی در سالن VIP با سیستم صوتی حرفه‌ای و نورپردازی استودیو برگزار می‌شود.',
    },
    faqTitle: 'سوالات متداول درباره آموزش تانگوی عروس و داماد',
  },

  brideSolo: {
    hero: {
      badge: 'طراحی تخصصی ورودی و رقص سولو عروس',
      title: 'رقص سولو عروس (Solo Bride)',
      subtitle:
        'لحظه‌ای رویایی که تمام نگاه‌ها مقهور شکوه، ناز و وقار شما می‌شوند. طراحی ویژه متناسب با مدل لباس عروس، تور و کفش.',
      buttonText: 'رزرو جلسه مشاوره سولو عروس',
    },
    details: {
      title: 'نکات کلیدی در طراحی رقص سولو عروس',
      description:
        'رقص سولو عروس نیازمند ظرافت ویژه در حرکت دست‌ها، چرخش‌های کنترل‌شده با لباس سنگین و حالت‌های چهره است. مربیان آکادمی با تجربه بالا تمام ریزه‌کاری‌های زوایای فیلمبرداری و نورپردازی را در طراحی حرکت شما لحاظ می‌کنند.',
      benefits: [
        {
          title: 'تطبیق با وزن و مدل لباس عروس',
          desc: 'تمرین چگونگی مدیریت دنباله لباس و تور بدون گیج شدن یا گیر کردن پای عروس.',
        },
        {
          title: 'ناز دست‌ها و فیگورهای مینیاتوری',
          desc: 'تمرین حرکات نرم و روان دست‌ها متناسب با زیورآلات و دسته گل عروس.',
        },
        {
          title: 'هماهنگی با ورودیه داماد یا ساقدوش‌ها',
          desc: 'اتصال روان بخش سولو به ورود داماد یا ساقدوش‌ها برای یک اجرای باشکوه.',
        },
      ],
    },
  },

  styles: DANCE_STYLES,

  soloDance: SOLO_DANCE_STYLES,

  musicCategories: MUSIC_CATEGORIES_DATA,

  tracks: TRACKS_DATA,

  playlists: PLAYLISTS_DATA,

  soloContent: {
    hero: {
      badge: 'دوره تخصصی رقص‌های تک‌نفره (Solo Dance)',
      title: 'آموزش رقص‌های تک‌نفره و انفرادی',
      subtitle: 'یادگیری حرفه‌ای سبک‌های عربی، بندری، ایرانی اصیل، هیلز و توئرک با اساتید مجرب در محیطی کاملاً خصوصی.',
    },
    benefitsTitle: 'چرا دوره رقص‌های تک‌نفره DANCE ACADEMY؟',
    benefits: [
      { title: 'امکان اضافه کردن سبک‌های جدید', desc: 'معماری منعطف آموزشی برای یادگیری سبک‌های متنوع و بروز.' },
      { title: 'برنامه تمرینی اختصاصی', desc: 'برنامه‌ریزی دقیق بر اساس سطح استعداد، انعطاف و زمان هنرجو.' },
      { title: 'اتصال به آرشیو موزیک و پلی‌لیست', desc: 'دسترسی آنلاین و کامل به موزیک‌های اختصاصی تمرینی هر سبک.' },
    ],
  },

  gallery: GALLERY_ITEMS,

  instructors: INSTRUCTORS,

  packages: PACKAGES,

  musicTracks: MUSIC_TRACKS,

  testimonials: TESTIMONIALS,

  faqs: [
    {
      id: 'faq-1',
      question:
        'اگر من و همسرم هیچ سابقه رقصی نداشته باشیم، می‌توانیم تانگو یاد بگیریم؟',
      answer:
        'کاملاً! بیش از ۸۰٪ زوج‌های آکادمی ما هیچ سابقه قبلی رقص نداشته‌اند. متد آموزشی ما از صفر مطلق و بر اساس توانمندی فیزیکی شما طراحی می‌شود و با تمرینات گام به گام در ۶ جلسه به آمادگی کامل می‌رسید.',
      category: 'tango',
      order: 1,
      active: true,
    },
    {
      id: 'faq-2',
      question:
        'آیا رقص تانگو با مدل لباس عروس پف‌دار یا دنباله‌دار سازگار است؟',
      answer:
        'بله. در آکادمی رقص عروسی، طراح رقص در جلسات نهایی اندازه و وزن دنباله لباس و حتی ارتفاع کفش شما را شبیه‌سازی می‌کند. فیگورهای تانگو به‌گونه‌ای تنظیم می‌شوند که تور و دنباله لباس مانع چرخش‌ها نشوند.',
      category: 'tango',
      order: 2,
      active: true,
    },
    {
      id: 'faq-3',
      question: 'انتخاب موزیک تانگو چگونه انجام می‌شود؟',
      answer:
        'شما می‌توانید از آرشیو موزیک‌های ماندگار تانگو آرژانتینی، تانگوی بی‌کلام یا میکس‌های پاپ سفارشی انتخاب کنید. همچنین تیم استودیو ما موزیک انتخابی شما را با افکت‌های صوتی لایتینگ ادیت می‌کند.',
      category: 'tango',
      order: 3,
      active: true,
    },
    {
      id: 'faq-4',
      question: 'چند هفته قبل از عروسی باید کلاس‌ها را شروع کنیم؟',
      answer:
        'بهترین زمان بین ۳ تا ۶ هفته قبل از عروسی است تا استرس نداشته باشید. اما در صورتی که زمان کمی دارید، پکیج ۳ جلسه‌ای فشرده (اکسپرس) ما برای شما عالی خواهد بود.',
      category: 'tango',
      order: 4,
      active: true,
    },
    {
      id: 'faq-5',
      question: 'آیا امکان تمرین با لباس یا تور اصلی عروسی وجود دارد؟',
      answer:
        'بله! در تمام پکیج‌های VIP یک جلسه تمرین ویژه با لباس عروسی، ژپون و کفش اصلی برگزار می‌شود تا کنترل کامل روی حركات به دست آید.',
      category: 'general',
      order: 5,
      active: true,
    },
  ],

  branches: [
    {
      id: 'branch-1',
      name: 'شعبه الهیه (مرکزی VIP)',
      address:
        'تهران، خیابان فرشته (شهید بیدارلو)، برج تجاری-اداری داریوش، طبقه ۶، واحد ۶۰۴',
      phone: '۰۲۱-۲۲۶۵۹۰۸۰',
      mobile: '۰۹۱۲-۸۸۸۳۰۰۲',
      workingHours: '۱۰:۰۰ الی ۲۱:۰۰',
    },
    {
      id: 'branch-2',
      name: 'شعبه نیاوران',
      address:
        'تهران، نیاوران، خیابان شهید باهنر، نرسیده به میدان باهنر، مجتمع VIP البرز',
      phone: '۰۲۱-۲۶۱۱۴۵۹۰',
      mobile: '۰۹۱۲-۸۸۸۳۰۰۲',
      workingHours: '۱۰:۰۰ الی ۲۱:۰۰',
    },
  ],

  bookings: [
    {
      id: 'book-101',
      coupleName: 'سامان و فرنوش',
      phone: '09121112233',
      danceStyle: 'تانگوی عروس و داماد',
      weddingDate: '۱۵ اردیبهشت ۱۴۰۳',
      preferredTime: 'عصرها (۱۷ الی ۲۱)',
      notes: 'علاقه‌مند به موزیک Por Una Cabeza، لباس عروس پف‌دار',
      createdAt: '2026-08-10 14:30',
      status: 'Confirmed',
      branch: 'شعبه الهیه (مرکزی VIP)',
    },
    {
      id: 'book-102',
      coupleName: 'نیما و درسا',
      phone: '09123334455',
      danceStyle: 'عروس سولو',
      weddingDate: '۲۰ خرداد ۱۴۰۳',
      preferredTime: 'صبح‌ها (۱۰ الی ۱۳)',
      notes: 'ورودی سولو + ساقدوش‌ها',
      createdAt: '2026-08-12 11:15',
      status: 'New',
      branch: 'شعبه نیاوران',
    },
  ],

  seo: {
    home: {
      pageTitle: 'آکادمی تخصصی رقص عروس و داماد | DANCE ACADEMY',
      metaDescription:
        'آموزش تخصصی تانگوی سینمایی، رقص سولو عروس و والس کلاسیک در محیطی کاملاً خصوصی و لاکچری با اساتید بین‌المللی.',
      ogTitle: 'DANCE ACADEMY | آکادمی رقص عروسی',
      ogDescription: 'خلق درخشان‌ترین صحنه فیلم عروسی شما با DANCE ACADEMY',
    },
    tango: {
      pageTitle: 'آموزش تخصصی تانگوی عروس و داماد | DANCE ACADEMY',
      metaDescription:
        'رقص تانگوی پرشور و سینمایی برای زوج‌ها. آموزش گام به گام از صفر با اساتید ارشد.',
      ogTitle: 'تانگوی عروس و داماد | DANCE ACADEMY',
      ogDescription: 'رقص دراماتیک و سینمایی تانگو ویژه شب عروسی',
    },
    'bride-solo': {
      pageTitle: 'آموزش رقص سولو عروس (Solo Bride) | DANCE ACADEMY',
      metaDescription:
        'طراحی تخصصی ورودی و رقص سولو عروس متناسب با لباس، تور و کفش.',
      ogTitle: 'رقص سولو عروس | DANCE ACADEMY',
      ogDescription: 'شکوه و ظرافت شاهانه ورودی عروس',
    },
    'solo-dance': {
      pageTitle: 'رقص‌های تک‌نفره (Solo Dance) | DANCE ACADEMY',
      metaDescription: 'آموزش رقص‌های عربی، بندری، ایرانی، هیلز و توئرک با اساتید مجرب.',
      ogTitle: 'رقص‌های تک‌نفره | DANCE ACADEMY',
      ogDescription: 'آموزش انفرادی سبک‌های پرطرفدار رقص',
    },
    styles: {
      pageTitle: 'سبک‌های رقص عروسی | DANCE ACADEMY',
      metaDescription: 'کاتالوگ جامع سبک‌های تانگو، والس، ایرانی تلفیقی و رقص چاقو.',
      ogTitle: 'سبک‌های رقص عروسی',
      ogDescription: 'سبک اختصاصی عروسی خود را پیدا کنید',
    },
    music: {
      pageTitle: 'آرشیو موزیک و پلی‌لیست رقص | DANCE ACADEMY',
      metaDescription: 'استماع آنلاین و دانلود موزیک‌های تانگو، بندری، ایرانی و عربی.',
      ogTitle: 'موزیک و پلی‌لیست رقص',
      ogDescription: 'آرشیو تخصصی موزیک‌های رقص آکادمی',
    },
    gallery: {
      pageTitle: 'گالری عکس و ویدیو | DANCE ACADEMY',
      metaDescription: 'نمونه کارها و تصاویری از اجرای هنرجویان DANCE ACADEMY.',
      ogTitle: 'گالری اجراها',
      ogDescription: 'لحظات ثبت شده هنرجویان آکادمی',
    },
    instructors: {
      pageTitle: 'اساتید و مربیان بین‌المللی | DANCE ACADEMY',
      metaDescription: 'معرفی طراحان ارشد رقص و مربیان آکادمی.',
      ogTitle: 'کادر آموزشی آکادمی',
      ogDescription: 'با اساتید برجسته DANCE ACADEMY آشنا شوید',
    },
    contact: {
      pageTitle: 'تماس با ما | DANCE ACADEMY',
      metaDescription: 'اطلاعات شعب الهیه و نیاوران، شماره تماس و مشاوره حضوری.',
      ogTitle: 'ارتباط با آکادمی',
      ogDescription: 'رزرو مشاوره حضوری در استودیو VIP',
    },
    admin: {
      pageTitle: 'پنل مدیریت محتوا | DANCE ACADEMY',
      metaDescription: 'پنل مدیریت محتوا، قیمت‌ها و درخواست‌های رزرو.',
      ogTitle: 'Admin Panel',
      ogDescription: 'مدیریت سایت DANCE ACADEMY',
    },
  },
};
