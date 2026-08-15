import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Multer memory storage configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// GitHub API Environment Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'siralinamdarbinanc-byte';
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'DANCE';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

// Helper function to query GitHub Contents API
async function callGitHubContentsApi(
  endpointPath: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  if (!GITHUB_TOKEN) {
    return {
      ok: false,
      status: 400,
      data: {
        error: 'کلید دسترسی گیت‌هاب (GITHUB_TOKEN) در متغیرهای محیطی سرور تنظیم نشده است.',
        code: 'GITHUB_TOKEN_NOT_CONFIGURED',
      },
    };
  }

  const cleanPath = endpointPath.replace(/^\/+/, '');
  let url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${cleanPath}`;
  if (!options.method || options.method === 'GET') {
    url += `${url.includes('?') ? '&' : '?'}ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  }

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'DanceAcademy-Server/1.0',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });

    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return {
      ok: false,
      status: 500,
      data: { error: err?.message || 'خطا در برقراری ارتباط با GitHub API' },
    };
  }
}

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
  const hasToken = Boolean(GITHUB_TOKEN && GITHUB_TOKEN.trim().length > 0);
  res.json({
    githubConfigured: hasToken,
    owner: GITHUB_REPO_OWNER,
    repo: GITHUB_REPO_NAME,
    branch: GITHUB_BRANCH,
    directories: ALLOWED_DIRECTORIES,
    maxSizeBytes: MAX_MEDIA_SIZE_BYTES,
  });
});

app.get('/api/media', async (req: Request, res: Response) => {
  const { category, search } = req.query as { category?: string; search?: string };
  let allAssets: any[] = [];

  if (GITHUB_TOKEN) {
    const folderPromises = ALLOWED_DIRECTORIES.map(async (dir) => {
      const ghRes = await callGitHubContentsApi(dir);
      if (!ghRes.ok || !Array.isArray(ghRes.data)) {
        return [];
      }
      return ghRes.data
        .filter((item: any) => item.type === 'file')
        .map((file: any) => {
          const validation = sanitizeAndValidateMediaPath(file.path);
          const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
          const ext = extMatch ? extMatch[1].toLowerCase() : '';
          const fileType = dir === 'public/images' ? 'image' : dir === 'public/audio' ? 'audio' : 'video';
          const mimeType = MIME_MAP[ext] || (validation.valid && validation.mimeType) || 'application/octet-stream';
          const cleanUrl = `/${file.path.replace(/^public\//, '')}`;
          const rawUrl =
            file.download_url ||
            `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${file.path}`;

          return {
            id: `gh-${file.sha?.slice(0, 10) || Date.now()}-${file.name}`,
            filename: file.name,
            fileType,
            mimeType,
            url: cleanUrl,
            rawUrl,
            path: file.path,
            sha: file.sha,
            sizeBytes: file.size || 0,
            createdAt: new Date().toLocaleDateString('fa-IR'),
            lastModified: new Date().toLocaleDateString('fa-IR'),
            source: 'github',
          };
        });
    });

    const results = await Promise.allSettled(folderPromises);
    for (const result of results) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allAssets.push(...result.value);
      }
    }
  }

  // Merge any external URL assets from memory
  const urlOnlyAssets = mediaAssetsStore.filter((m) => m.source === 'url' || m.id.startsWith('url-'));
  for (const item of urlOnlyAssets) {
    if (!allAssets.some((a) => a.url === item.url || a.filename === item.filename)) {
      allAssets.push(item);
    }
  }

  if (category && ['image', 'audio', 'video'].includes(category)) {
    allAssets = allAssets.filter((m) => m.fileType === category);
  }
  if (search) {
    const q = search.toLowerCase().trim();
    allAssets = allAssets.filter((m) => (m.filename || '').toLowerCase().includes(q) || (m.path || '').toLowerCase().includes(q));
  }

  res.json(allAssets);
});

// Upload Media Handler (Supports multipart file and base64 JSON)
const handleUploadMediaRequest = async (req: Request, res: Response) => {
  let fileBuffer: Buffer | null = null;
  let originalName = '';
  let targetFolder: 'public/images' | 'public/audio' | 'public/videos' = 'public/images';
  let customFilename = '';

  if (req.file) {
    fileBuffer = req.file.buffer;
    originalName = req.file.originalname;
    if (req.body.folder && ALLOWED_DIRECTORIES.includes(req.body.folder)) {
      targetFolder = req.body.folder;
    }
    customFilename = req.body.filename || '';
  } else if (req.body && req.body.contentBase64) {
    originalName = req.body.filename || 'file.jpg';
    if (req.body.folder && ALLOWED_DIRECTORIES.includes(req.body.folder)) {
      targetFolder = req.body.folder;
    }
    customFilename = req.body.customFilename || req.body.filename || '';
    try {
      fileBuffer = Buffer.from(req.body.contentBase64, 'base64');
    } catch {
      return res.status(400).json({ error: 'محتوای فایل base64 نامعتبر است.' });
    }
  } else {
    return res.status(400).json({ error: 'هیچ فایلی برای آپلود ارسال نشده است.' });
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    return res.status(400).json({ error: 'فایل ارسالی خالی است.' });
  }

  if (fileBuffer.length > MAX_MEDIA_SIZE_BYTES) {
    return res.status(400).json({
      error: `حجم فایل بیشتر از سقف مجاز ۱۰۰ مگابایت است (${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB).`,
    });
  }

  // Clean and sanitize filename
  const safeName = (customFilename || originalName)
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .trim();

  const extMatch = safeName.match(/\.([a-zA-Z0-9]+)$/);
  if (!extMatch) {
    return res.status(400).json({ error: 'فایل فاقد پسوند مجاز است.' });
  }
  const ext = `.${extMatch[1].toLowerCase()}`;

  if (ALLOWED_EXTENSIONS.image.includes(ext)) {
    targetFolder = 'public/images';
  } else if (ALLOWED_EXTENSIONS.audio.includes(ext)) {
    targetFolder = 'public/audio';
  } else if (ALLOWED_EXTENSIONS.video.includes(ext)) {
    targetFolder = 'public/videos';
  } else {
    return res.status(400).json({
      error: `پسوند ${ext} پشتیبانی نمی‌شود. پسوندهای مجاز: تصاویر (jpg, jpeg, png, webp) | موزیک (mp3, wav, m4a) | ویدیو (mp4, webm, mov)`,
    });
  }

  const fullRepoPath = `${targetFolder}/${safeName}`;
  const validation = sanitizeAndValidateMediaPath(fullRepoPath);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  if (!GITHUB_TOKEN) {
    return res.status(400).json({
      error: 'کلید دسترسی گیت‌هاب (GITHUB_TOKEN) در سرور تنظیم نشده است. لطفاً متغیر GITHUB_TOKEN را به متغیرهای محیطی اضافه فرمایید.',
      code: 'GITHUB_TOKEN_NOT_CONFIGURED',
    });
  }

  const base64Content = fileBuffer.toString('base64');

  // Step 1: Check if file already exists in GitHub to retrieve existing SHA
  const checkRes = await callGitHubContentsApi(fullRepoPath);
  let existingSha: string | undefined;
  if (checkRes.ok && checkRes.data && checkRes.data.sha) {
    existingSha = checkRes.data.sha;
  }

  // Step 2: PUT file to GitHub Contents API
  const putRes = await callGitHubContentsApi(fullRepoPath, {
    method: 'PUT',
    body: {
      message: `Upload media asset: ${safeName} via Admin Media Manager`,
      content: base64Content,
      branch: GITHUB_BRANCH,
      ...(existingSha ? { sha: existingSha } : {}),
    },
  });

  if (!putRes.ok) {
    const errMsg = putRes.data?.message || 'خطا در ثبت فایل در مخزن گیت‌هاب';
    return res.status(putRes.status || 500).json({
      error: `خطا از سوی GitHub API (${putRes.status}): ${errMsg}`,
      details: putRes.data,
    });
  }

  // Step 3: Verification - GET GitHub contents again to verify that the file actually exists
  const verifyRes = await callGitHubContentsApi(fullRepoPath);
  if (!verifyRes.ok || !verifyRes.data) {
    return res.status(500).json({
      error: 'فایل به گیت‌هاب ارسال شد اما در اعتبارسنجی نهایی مخزن یافت نشد.',
    });
  }

  const verifiedFile = verifyRes.data;
  const createdSha = verifiedFile.sha || putRes.data?.content?.sha || existingSha || 'sha-verified';
  const cleanUrl = `/${fullRepoPath.replace(/^public\//, '')}`;
  const rawUrl =
    verifiedFile.download_url ||
    `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${fullRepoPath}`;

  const nowFa = new Date().toLocaleDateString('fa-IR');
  const newAsset = {
    id: `gh-${createdSha.slice(0, 10)}-${safeName}`,
    filename: safeName,
    fileType: validation.fileType || 'image',
    mimeType: validation.mimeType || 'application/octet-stream',
    url: cleanUrl,
    rawUrl,
    path: fullRepoPath,
    sha: createdSha,
    sizeBytes: verifiedFile.size || fileBuffer.length,
    createdAt: nowFa,
    lastModified: nowFa,
    source: 'github',
  };

  return res.status(201).json({ success: true, asset: newAsset });
};

app.post('/api/media/upload', verifyAdminAuth, upload.single('file'), handleUploadMediaRequest);
app.post('/api/upload', verifyAdminAuth, upload.single('file'), handleUploadMediaRequest);

app.put('/api/media/rename', verifyAdminAuth, async (req: Request, res: Response) => {
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

  if (!GITHUB_TOKEN) {
    return res.status(400).json({
      error: 'کلید دسترسی گیت‌هاب (GITHUB_TOKEN) در سرور تنظیم نشده است.',
      code: 'GITHUB_TOKEN_NOT_CONFIGURED',
    });
  }

  // 1. Fetch old file from GitHub to get content base64 and sha
  const oldFileRes = await callGitHubContentsApi(oldValidation.normalizedPath);
  if (!oldFileRes.ok || !oldFileRes.data) {
    return res.status(oldFileRes.status || 404).json({
      error: `فایل اصلی در مخزن گیت‌هاب یافت نشد: ${oldFileRes.data?.message || ''}`,
    });
  }

  const oldContentBase64 = oldFileRes.data.content?.replace(/\s+/g, '') || '';
  const oldSha = oldFileRes.data.sha;

  // 2. Put new file with the content
  const putNewRes = await callGitHubContentsApi(fullNewPath, {
    method: 'PUT',
    body: {
      message: `Rename ${oldValidation.filename} to ${safeName} via Admin Media Manager`,
      content: oldContentBase64,
      branch: GITHUB_BRANCH,
    },
  });

  if (!putNewRes.ok) {
    return res.status(putNewRes.status || 500).json({
      error: `خطا در ایجاد فایل با نام جدید: ${putNewRes.data?.message || ''}`,
    });
  }

  // 3. Delete old file
  if (oldValidation.normalizedPath !== fullNewPath && oldSha) {
    await callGitHubContentsApi(oldValidation.normalizedPath, {
      method: 'DELETE',
      body: {
        message: `Remove old file after rename to ${safeName}`,
        sha: oldSha,
        branch: GITHUB_BRANCH,
      },
    });
  }

  // 4. Verify new file exists
  const verifyRes = await callGitHubContentsApi(fullNewPath);
  const finalFile = verifyRes.ok && verifyRes.data ? verifyRes.data : putNewRes.data?.content;

  const cleanUrl = `/${fullNewPath.replace(/^public\//, '')}`;
  const rawUrl =
    finalFile?.download_url ||
    `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${fullNewPath}`;

  const nowFa = new Date().toLocaleDateString('fa-IR');
  const updatedAsset = {
    id: `gh-${finalFile?.sha?.slice(0, 10) || Date.now()}-${safeName}`,
    filename: safeName,
    fileType: newValidation.fileType || 'image',
    mimeType: newValidation.mimeType || 'application/octet-stream',
    url: cleanUrl,
    rawUrl,
    path: fullNewPath,
    sha: finalFile?.sha,
    sizeBytes: oldFileRes.data.size || 0,
    createdAt: nowFa,
    lastModified: nowFa,
    source: 'github',
  };

  res.json({ success: true, asset: updatedAsset });
});

app.delete('/api/media', verifyAdminAuth, async (req: Request, res: Response) => {
  const targetPath = (req.query.path as string) || req.body?.path;
  const providedSha = (req.query.sha as string) || req.body?.sha;

  if (!targetPath) {
    return res.status(400).json({ error: 'مسیر فایل جهت حذف الزامی است.' });
  }
  const validation = sanitizeAndValidateMediaPath(targetPath);
  if (!validation.valid || !validation.normalizedPath) {
    return res.status(400).json({ error: validation.error });
  }

  if (!GITHUB_TOKEN) {
    return res.status(400).json({
      error: 'کلید دسترسی گیت‌هاب (GITHUB_TOKEN) در سرور تنظیم نشده است.',
      code: 'GITHUB_TOKEN_NOT_CONFIGURED',
    });
  }

  let sha = providedSha;
  if (!sha) {
    const fileRes = await callGitHubContentsApi(validation.normalizedPath);
    if (!fileRes.ok || !fileRes.data?.sha) {
      return res.status(fileRes.status || 404).json({
        error: `فایل جهت حذف در مخزن گیت‌هاب یافت نشد: ${fileRes.data?.message || ''}`,
      });
    }
    sha = fileRes.data.sha;
  }

  const deleteRes = await callGitHubContentsApi(validation.normalizedPath, {
    method: 'DELETE',
    body: {
      message: `Delete media asset: ${validation.filename || validation.normalizedPath} via Admin Media Manager`,
      sha,
      branch: GITHUB_BRANCH,
    },
  });

  if (!deleteRes.ok) {
    return res.status(deleteRes.status || 500).json({
      error: `خطا در حذف فایل از گیت‌هاب: ${deleteRes.data?.message || ''}`,
    });
  }

  res.json({ success: true, path: validation.normalizedPath });
});

app.delete('/api/media/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  // If it is a url- media, remove from in-memory store
  if (id.startsWith('url-') || id.startsWith('r2-media')) {
    mediaAssetsStore = mediaAssetsStore.filter((m) => m.id !== id);
    return res.json({ success: true, id });
  }

  return res.status(400).json({ error: 'برای حذف فایل از پارامتر path استفاده فرمایید.' });
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
    source: 'url',
  };

  mediaAssetsStore.unshift(newAsset);
  res.status(201).json({ success: true, asset: newAsset });
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
