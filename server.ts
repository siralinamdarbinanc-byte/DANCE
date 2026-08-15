import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Database & Storage Simulation for Local Dev / Container
const adminToken = 'dance_academy_jwt_session_token_2026';
let bookingsStore: any[] = [];
let customersStore: Map<string, any> = new Map();
let interactionsStore: any[] = [];
let contentStore: any = null;
let mediaAssetsStore: any[] = [
  {
    id: 'r2-media-1',
    filename: 'tango_masterclass_banner.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    url: '/images/tango_masterclass_banner.jpg',
    rawUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    path: 'public/images/tango_masterclass_banner.jpg',
    sizeBytes: 420000,
    createdAt: '1403/05/20',
    lastModified: '1403/05/20',
    source: 'local',
  },
  {
    id: 'r2-media-2',
    filename: 'wedding_valse_golden_edit.mp3',
    fileType: 'audio',
    mimeType: 'audio/mpeg',
    url: '/audio/wedding_valse_golden_edit.mp3',
    rawUrl: 'https://cdn.freesound.org/previews/530/530415_1648170-lq.mp3',
    path: 'public/audio/wedding_valse_golden_edit.mp3',
    sizeBytes: 3800000,
    createdAt: '1403/05/22',
    lastModified: '1403/05/22',
    source: 'local',
  },
  {
    id: 'r2-media-3',
    filename: 'bride_solo_entrance_preview.mp4',
    fileType: 'video',
    mimeType: 'video/mp4',
    url: '/videos/bride_solo_entrance_preview.mp4',
    rawUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bride-walking-down-the-aisle-41716-large.mp4',
    path: 'public/videos/bride_solo_entrance_preview.mp4',
    sizeBytes: 12400000,
    createdAt: '1403/05/24',
    lastModified: '1403/05/24',
    source: 'local',
  },
];

const ALLOWED_DIRECTORIES = ['public/images', 'public/audio', 'public/videos'] as const;
const ALLOWED_EXTENSIONS = {
  image: ['.jpg', '.jpeg', '.png', '.webp'],
  audio: ['.mp3', '.wav', '.m4a'],
  video: ['.mp4', '.webm', '.mov'],
};
const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};
const MAX_MEDIA_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

function sanitizeAndValidateMediaPath(rawPath: string) {
  if (!rawPath || typeof rawPath !== 'string') {
    return { valid: false, error: 'مسیر فایل نامعتبر است.' };
  }
  const decoded = decodeURIComponent(rawPath).trim();
  if (
    decoded.includes('..') ||
    decoded.includes('\\') ||
    decoded.includes('//') ||
    /[\x00-\x1f\x7f]/.test(decoded)
  ) {
    return { valid: false, error: 'مسیر حاوی کاراکترهای غیرمجاز است.' };
  }
  let path = decoded.replace(/^\/+/, '');
  if (path.startsWith('images/') || path.startsWith('audio/') || path.startsWith('videos/')) {
    path = `public/${path}`;
  }
  const matchingFolder = ALLOWED_DIRECTORIES.find((dir) => path === dir || path.startsWith(`${dir}/`));
  if (!matchingFolder) {
    return { valid: false, error: 'فقط پوشه‌های public/images, public/audio و public/videos مجاز هستند.' };
  }
  const filename = path.split('/').pop() || '';
  if (!filename || filename === matchingFolder.split('/').pop()) {
    return { valid: true, normalizedPath: path, folder: matchingFolder };
  }
  const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
  if (!extMatch) {
    return { valid: false, error: 'فایل بدون پسوند مجاز نیست.' };
  }
  const ext = `.${extMatch[1].toLowerCase()}`;
  let fileType: 'image' | 'audio' | 'video';
  if (matchingFolder === 'public/images') {
    if (!ALLOWED_EXTENSIONS.image.includes(ext)) {
      return { valid: false, error: `پسوند ${ext} برای تصاویر مجاز نیست.` };
    }
    fileType = 'image';
  } else if (matchingFolder === 'public/audio') {
    if (!ALLOWED_EXTENSIONS.audio.includes(ext)) {
      return { valid: false, error: `پسوند ${ext} برای صدا مجاز نیست.` };
    }
    fileType = 'audio';
  } else {
    if (!ALLOWED_EXTENSIONS.video.includes(ext)) {
      return { valid: false, error: `پسوند ${ext} برای ویدیو مجاز نیست.` };
    }
    fileType = 'video';
  }
  return {
    valid: true,
    normalizedPath: path,
    folder: matchingFolder,
    fileType,
    mimeType: MIME_MAP[extMatch[1].toLowerCase()] || 'application/octet-stream',
    filename,
  };
}

// Helper middleware for Admin Auth verification
const verifyAdminAuth = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'دسترسی غیرمجاز. لطفا ابتدا وارد شوید.' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'توکن نامعتبر است.' });
  }
  next();
};

// -------------------------------------------------------------
// 0. HEALTH CHECK
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    runtime: 'Node.js Fullstack Server (D1 & R2 Ready)',
    hasD1: true,
    hasR2: false,
    r2Status: 'optional_disabled',
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 1. AUTH API ENDPOINTS
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const pass = password?.trim();
  if (pass === 'admin' || pass === 'admin1234' || pass === '123456') {
    return res.json({ success: true, token: adminToken, username: 'admin' });
  }
  return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
});

app.get('/api/auth/verify', verifyAdminAuth, (req: Request, res: Response) => {
  res.json({ success: true, valid: true });
});

// -------------------------------------------------------------
// 2. BOOKINGS & CRM API ENDPOINTS
// -------------------------------------------------------------
app.get('/api/bookings', verifyAdminAuth, (req: Request, res: Response) => {
  res.json(bookingsStore);
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const { coupleName, phone, danceStyle, weddingDate, preferredTime, notes, branch } = req.body;
  if (!coupleName || !phone) {
    return res.status(400).json({ error: 'نام زوج و شماره تماس الزامی است.' });
  }

  const createdAt = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  const newBooking = {
    id: `book-${Date.now()}`,
    coupleName,
    phone,
    danceStyle: danceStyle || 'رقص عروسی',
    weddingDate: weddingDate || '',
    preferredTime: preferredTime || '',
    notes: notes || '',
    status: 'New',
    branch: branch || 'شعبه اصلی',
    createdAt,
  };

  bookingsStore.unshift(newBooking);

  // Auto-Upsert into CRM Customers Table
  let customer = customersStore.get(phone);
  if (customer) {
    customer.totalBookings += 1;
    customer.coupleName = coupleName || customer.coupleName;
    customer.danceStyle = danceStyle || customer.danceStyle;
    customer.weddingDate = weddingDate || customer.weddingDate;
    customer.totalBookings += 1;
    customer.status = 'New';
    customer.isArchived = false;
    customer.updatedAt = createdAt;
  } else {
    customer = {
      id: `cust-${Date.now()}`,
      phone,
      coupleName,
      danceStyle: danceStyle || 'رقص عروسی',
      weddingDate: weddingDate || '',
      status: 'New',
      totalBookings: 1,
      internalNotes: notes ? `یادداشت اولیه رزرو: ${notes}` : '',
      tags: [danceStyle || 'رقص عروسی', 'مشتری جدید'],
      isArchived: false,
      createdAt,
      updatedAt: createdAt,
    };
  }
  customersStore.set(phone, customer);

  // Add interaction history log
  interactionsStore.unshift({
    id: `log-${Date.now()}`,
    customerPhone: phone,
    type: 'meeting',
    note: `ثبت درخواست مشاوره جدید (${danceStyle}) - خروج از بایگانی و فعال‌سازی`,
    author: 'سیستم رزرو آنلاین',
    createdAt,
  });

  res.status(201).json(newBooking);
});

app.put('/api/bookings/:id/status', verifyAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = bookingsStore.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'درخواست رزرو یافت نشد.' });
  }

  booking.status = status;

  // Sync status to CRM customer
  const customer = customersStore.get(booking.phone);
  if (customer) {
    customer.status = status;
    customer.updatedAt = new Date().toLocaleDateString('fa-IR');
  }

  // Log interaction
  interactionsStore.unshift({
    id: `log-${Date.now()}`,
    customerPhone: booking.phone,
    type: 'status_change',
    note: `تغییر وضعیت رزرو به: ${status}`,
    author: 'مدیریت آکادمی',
    createdAt: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
  });

  res.json({ success: true, booking });
});

app.delete('/api/bookings/:id', verifyAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  bookingsStore = bookingsStore.filter((b) => b.id !== id);
  res.json({ success: true, id });
});

// -------------------------------------------------------------
// 3. CRM CUSTOMERS & INTERACTIONS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/crm/customers', verifyAdminAuth, (req: Request, res: Response) => {
  const customersList = Array.from(customersStore.values()).sort((a, b) => {
    if (Boolean(a.isArchived) !== Boolean(b.isArchived)) {
      return a.isArchived ? 1 : -1;
    }
    if ((a.status === 'New') !== (b.status === 'New')) {
      return a.status === 'New' ? -1 : 1;
    }
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });
  res.json(customersList);
});

app.put('/api/crm/customers/:phone', verifyAdminAuth, (req: Request, res: Response) => {
  const { phone } = req.params;
  const { internalNotes, tags, isArchived, status } = req.body;
  const nowFa = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

  let customer = customersStore.get(phone);
  if (!customer) {
    customer = {
      id: `cust-${Date.now()}`,
      phone,
      coupleName: 'هنرجو',
      danceStyle: 'رقص عروسی',
      weddingDate: '',
      status: status || 'New',
      totalBookings: 1,
      internalNotes: internalNotes || '',
      tags: tags || [],
      isArchived: Boolean(isArchived),
      createdAt: nowFa,
      updatedAt: nowFa,
    };
    customersStore.set(phone, customer);
  } else {
    const oldArchived = customer.isArchived;
    if (internalNotes !== undefined) customer.internalNotes = internalNotes;
    if (tags !== undefined) customer.tags = tags;
    if (isArchived !== undefined) customer.isArchived = Boolean(isArchived);
    if (status !== undefined) customer.status = status;
    customer.updatedAt = nowFa;

    if (isArchived !== undefined && Boolean(oldArchived) !== Boolean(isArchived)) {
      interactionsStore.unshift({
        id: `log-${Date.now()}`,
        customerPhone: phone,
        type: 'status_change',
        note: isArchived ? 'پرونده مشتری به بایگانی منتقل شد' : 'پرونده مشتری از بایگانی بازگردانده و فعال شد',
        author: 'مدیریت آکادمی',
        createdAt: nowFa,
      });
    }
  }

  res.json({ success: true, customer });
});

app.get('/api/crm/customers/:phone/interactions', verifyAdminAuth, (req: Request, res: Response) => {
  const { phone } = req.params;
  const list = interactionsStore.filter((i) => i.customerPhone === phone);
  res.json(list);
});

app.post('/api/crm/customers/:phone/interactions', verifyAdminAuth, (req: Request, res: Response) => {
  const { phone } = req.params;
  const { note, type, author } = req.body;

  if (!note) {
    return res.status(400).json({ error: 'متن یادداشت نمی‌تواند خالی باشد.' });
  }

  const newLog = {
    id: `log-${Date.now()}`,
    customerPhone: phone,
    type: type || 'note',
    note,
    author: author || 'مدیریت',
    createdAt: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
  };

  interactionsStore.unshift(newLog);
  res.status(201).json(newLog);
});

// -------------------------------------------------------------
// 4. CONTENT CMS SYNC ENDPOINT
// -------------------------------------------------------------
app.get('/api/content', (req: Request, res: Response) => {
  res.json(contentStore || {});
});

app.post('/api/content', verifyAdminAuth, (req: Request, res: Response) => {
  contentStore = req.body;
  res.json({ success: true, message: 'محتوا در دیتابیس همگام‌سازی شد.' });
});

// -------------------------------------------------------------
// 5. GITHUB REPOSITORY MEDIA MANAGER ENDPOINTS
// -------------------------------------------------------------
app.get('/api/media/status', (req: Request, res: Response) => {
  res.json({
    githubConfigured: false,
    owner: 'aliinndd',
    repo: 'dance',
    branch: 'main',
    directories: ALLOWED_DIRECTORIES,
    maxSizeBytes: MAX_MEDIA_SIZE_BYTES,
  });
});

app.get('/api/media', (req: Request, res: Response) => {
  const { category, search } = req.query as { category?: string; search?: string };
  let list = [...mediaAssetsStore];
  if (category && ['image', 'audio', 'video'].includes(category)) {
    list = list.filter((m) => m.fileType === category);
  }
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter((m) => (m.filename || '').toLowerCase().includes(q) || (m.path || '').toLowerCase().includes(q));
  }
  res.json(list);
});

app.post('/api/media/upload', verifyAdminAuth, (req: Request, res: Response) => {
  const { filename, folder, contentBase64, customFilename } = req.body;
  const safeName = (customFilename || filename || `file_${Date.now()}.jpg`).replace(/[\\/:*?"<>|]/g, '_').trim();
  const targetFolder = folder && ALLOWED_DIRECTORIES.includes(folder) ? folder : 'public/images';
  const fullPath = `${targetFolder}/${safeName}`;
  const validation = sanitizeAndValidateMediaPath(fullPath);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const nowFa = new Date().toLocaleDateString('fa-IR');
  const cleanUrl = `/${fullPath.replace(/^public\//, '')}`;
  const newAsset = {
    id: `local-${Date.now()}-${safeName}`,
    filename: safeName,
    fileType: validation.fileType || 'image',
    mimeType: validation.mimeType || 'application/octet-stream',
    url: cleanUrl,
    rawUrl: cleanUrl,
    path: fullPath,
    sizeBytes: contentBase64 ? Math.round((contentBase64.length * 3) / 4) : 250000,
    createdAt: nowFa,
    lastModified: nowFa,
    source: 'local',
  };

  mediaAssetsStore.unshift(newAsset);
  res.status(201).json({ success: true, asset: newAsset });
});

app.put('/api/media/rename', verifyAdminAuth, (req: Request, res: Response) => {
  const { oldPath, newFilename, targetFolder } = req.body;
  if (!oldPath || !newFilename) {
    return res.status(400).json({ error: 'مسیر قبلی و نام جدید الزامی است.' });
  }

  const oldValidation = sanitizeAndValidateMediaPath(oldPath);
  if (!oldValidation.valid || !oldValidation.normalizedPath) {
    return res.status(400).json({ error: oldValidation.error });
  }

  const destFolder = targetFolder || oldValidation.folder || 'public/images';
  let safeName = newFilename.replace(/[\\/:*?"<>|]/g, '_').trim();
  const oldExt = oldValidation.filename?.match(/\.[a-zA-Z0-9]+$/)?.[0] || '';
  if (!safeName.includes('.') && oldExt) {
    safeName += oldExt;
  }

  const fullNewPath = `${destFolder}/${safeName}`;
  const newValidation = sanitizeAndValidateMediaPath(fullNewPath);
  if (!newValidation.valid) {
    return res.status(400).json({ error: newValidation.error });
  }

  const idx = mediaAssetsStore.findIndex((m) => m.path === oldValidation.normalizedPath || m.filename === oldValidation.filename);
  const nowFa = new Date().toLocaleDateString('fa-IR');
  const cleanUrl = `/${fullNewPath.replace(/^public\//, '')}`;

  const updatedAsset = {
    id: `local-${Date.now()}-${safeName}`,
    filename: safeName,
    fileType: newValidation.fileType || 'image',
    mimeType: newValidation.mimeType || 'application/octet-stream',
    url: cleanUrl,
    rawUrl: cleanUrl,
    path: fullNewPath,
    sizeBytes: idx >= 0 ? mediaAssetsStore[idx].sizeBytes : 150000,
    createdAt: nowFa,
    lastModified: nowFa,
    source: 'local',
  };

  if (idx >= 0) {
    mediaAssetsStore[idx] = updatedAsset;
  } else {
    mediaAssetsStore.unshift(updatedAsset);
  }

  res.json({ success: true, asset: updatedAsset });
});

app.delete('/api/media', verifyAdminAuth, (req: Request, res: Response) => {
  const targetPath = (req.query.path as string) || req.body?.path;
  if (!targetPath) {
    return res.status(400).json({ error: 'مسیر فایل جهت حذف الزامی است.' });
  }
  const validation = sanitizeAndValidateMediaPath(targetPath);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  mediaAssetsStore = mediaAssetsStore.filter((m) => m.path !== validation.normalizedPath && m.filename !== validation.filename);
  res.json({ success: true, path: validation.normalizedPath });
});

app.delete('/api/media/:id', verifyAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  mediaAssetsStore = mediaAssetsStore.filter((m) => m.id !== id && m.path !== id && m.filename !== id);
  res.json({ success: true, id });
});

app.post('/api/media/add-url', verifyAdminAuth, (req: Request, res: Response) => {
  const { url, filename, fileType } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'آدرس لینک فایل الزامی است.' });
  }

  const type = fileType || 'image';
  const newAsset = {
    id: `url-media-${Date.now()}`,
    filename: filename || 'رسانه اختصاصی',
    fileType: type,
    mimeType: type === 'audio' ? 'audio/mpeg' : type === 'video' ? 'video/mp4' : 'image/jpeg',
    url,
    rawUrl: url,
    path: '',
    sizeBytes: 0,
    createdAt: new Date().toLocaleDateString('fa-IR'),
    lastModified: new Date().toLocaleDateString('fa-IR'),
    source: 'local',
  };

  mediaAssetsStore.unshift(newAsset);
  res.status(201).json({ success: true, asset: newAsset });
});

app.post('/api/upload', verifyAdminAuth, (req: Request, res: Response) => {
  const sampleMedia = {
    id: `local-${Date.now()}`,
    filename: `upload_${Date.now()}.jpg`,
    fileType: 'image',
    mimeType: 'image/jpeg',
    url: '/images/tango_masterclass_banner.jpg',
    rawUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    path: `public/images/upload_${Date.now()}.jpg`,
    sizeBytes: 245000,
    createdAt: new Date().toLocaleDateString('fa-IR'),
    lastModified: new Date().toLocaleDateString('fa-IR'),
    source: 'local',
  };

  mediaAssetsStore.unshift(sampleMedia);
  res.status(201).json({ success: true, asset: sampleMedia });
});

// -------------------------------------------------------------
// 6. VITE / STATIC SERVING PIPELINE
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express API & Vite Dev Server running on http://localhost:${PORT}`);
  });
}

startServer();
