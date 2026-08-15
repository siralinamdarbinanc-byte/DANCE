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
];

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
    note: `ثبت درخواست مشاوره جدید (${danceStyle})`,
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
  const customersList = Array.from(customersStore.values());
  res.json(customersList);
});

app.put('/api/crm/customers/:phone', verifyAdminAuth, (req: Request, res: Response) => {
  const { phone } = req.params;
  const { internalNotes, tags } = req.body;

  let customer = customersStore.get(phone);
  if (!customer) {
    customer = {
      id: `cust-${Date.now()}`,
      phone,
      coupleName: 'هنرجو',
      danceStyle: 'رقص عروسی',
      weddingDate: '',
      status: 'New',
      totalBookings: 1,
      internalNotes: internalNotes || '',
      tags: tags || [],
      createdAt: new Date().toLocaleDateString('fa-IR'),
      updatedAt: new Date().toLocaleDateString('fa-IR'),
    };
    customersStore.set(phone, customer);
  } else {
    if (internalNotes !== undefined) customer.internalNotes = internalNotes;
    if (tags !== undefined) customer.tags = tags;
    customer.updatedAt = new Date().toLocaleDateString('fa-IR');
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
// 5. R2 MEDIA ASSETS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/media', (req: Request, res: Response) => {
  res.json(mediaAssetsStore);
});

app.post('/api/upload', verifyAdminAuth, (req: Request, res: Response) => {
  const sampleMedia = {
    id: `r2-${Date.now()}`,
    filename: `upload_${Date.now()}.jpg`,
    fileType: 'image',
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    sizeBytes: 245000,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  mediaAssetsStore.unshift(sampleMedia);
  res.status(201).json(sampleMedia);
});

app.delete('/api/media/:id', verifyAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  mediaAssetsStore = mediaAssetsStore.filter((m) => m.id !== id);
  res.json({ success: true, id });
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
