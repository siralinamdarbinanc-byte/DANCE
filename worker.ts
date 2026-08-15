/**
 * Cloudflare Worker Native Backend
 * Full-Stack API Router with Cloudflare D1 Database & Cloudflare R2 Storage bindings
 * Strict Security, Auth Verification, CRM Engine & CMS Synchronization
 */

export interface D1Database {
  prepare: (query: string) => {
    bind: (...params: any[]) => {
      run: () => Promise<{ success: boolean; meta?: any }>;
      all: () => Promise<{ results?: any[]; success?: boolean }>;
      first: <T = any>() => Promise<T | null>;
    };
    all: () => Promise<{ results?: any[]; success?: boolean }>;
    run: () => Promise<{ success: boolean; meta?: any }>;
    first: <T = any>() => Promise<T | null>;
  };
}

export interface R2Bucket {
  put: (key: string, value: any, options?: any) => Promise<any>;
  get: (key: string) => Promise<any>;
  delete: (key: string) => Promise<void>;
  list: (options?: any) => Promise<{ objects: Array<{ key: string; size: number; uploaded: Date; httpMetadata?: any }> }>;
}

export interface Fetcher {
  fetch: (request: Request | string, init?: RequestInit) => Promise<Response>;
}

export interface Env {
  DB?: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  ASSETS?: Fetcher;
  ENVIRONMENT?: string;
  JWT_SECRET?: string;
  GITHUB_TOKEN?: string;
  GITHUB_REPO_OWNER?: string;
  GITHUB_REPO_NAME?: string;
  GITHUB_BRANCH?: string;
}

// In-Memory Fallbacks for instances where D1/R2 is not bound during local test
const memoryStore = {
  content: null as any,
  bookings: [] as any[],
  customers: new Map<string, any>(),
  interactions: [] as any[],
  media: [
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
  ] as any[],
};

// ===========================================================================
// GITHUB CONTENTS API HELPERS & STRICT PATH VALIDATION
// ===========================================================================
const ALLOWED_DIRECTORIES = ['public/images', 'public/audio', 'public/videos'] as const;

const ALLOWED_EXTENSIONS: Record<'image' | 'audio' | 'video', string[]> = {
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

const MAX_MEDIA_SIZE_BYTES = 100 * 1024 * 1024; // 100MB strictly enforced

function sanitizeAndValidateMediaPath(rawPath: string): {
  valid: boolean;
  error?: string;
  normalizedPath?: string;
  folder?: (typeof ALLOWED_DIRECTORIES)[number];
  fileType?: 'image' | 'audio' | 'video';
  mimeType?: string;
  filename?: string;
} {
  if (!rawPath || typeof rawPath !== 'string') {
    return { valid: false, error: 'مسیر فایل نامعتبر است.' };
  }

  const decoded = decodeURIComponent(rawPath).trim();
  // Reject traversal patterns and forbidden control characters
  if (
    decoded.includes('..') ||
    decoded.includes('\\') ||
    decoded.includes('//') ||
    /[\x00-\x1f\x7f]/.test(decoded)
  ) {
    return { valid: false, error: 'مسیر حاوی کاراکترهای غیرمجاز یا تلاش برای Path Traversal است.' };
  }

  // Normalize: remove leading slashes
  let path = decoded.replace(/^\/+/, '');

  // Auto-prefix public/ if needed
  if (path.startsWith('images/') || path.startsWith('audio/') || path.startsWith('videos/')) {
    path = `public/${path}`;
  }

  const matchingFolder = ALLOWED_DIRECTORIES.find((dir) => path === dir || path.startsWith(`${dir}/`));
  if (!matchingFolder) {
    return {
      valid: false,
      error: 'مسیر نامعتبر است. فقط پوشه‌های public/images, public/audio و public/videos مجاز هستند.',
    };
  }

  const filename = path.split('/').pop() || '';
  if (!filename || filename === matchingFolder.split('/').pop()) {
    return { valid: true, normalizedPath: path, folder: matchingFolder };
  }

  const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
  if (!extMatch) {
    return { valid: false, error: 'فایل باید دارای پسوند معتبر باشد.' };
  }

  const ext = `.${extMatch[1].toLowerCase()}`;
  const extKey = extMatch[1].toLowerCase();

  let fileType: 'image' | 'audio' | 'video';
  if (matchingFolder === 'public/images') {
    if (!ALLOWED_EXTENSIONS.image.includes(ext)) {
      return { valid: false, error: `پسوند ${ext} برای تصاویر مجاز نیست. پسوندهای مجاز: jpg, jpeg, png, webp` };
    }
    fileType = 'image';
  } else if (matchingFolder === 'public/audio') {
    if (!ALLOWED_EXTENSIONS.audio.includes(ext)) {
      return { valid: false, error: `پسوند ${ext} برای موزیک و صدا مجاز نیست. پسوندهای مجاز: mp3, wav, m4a` };
    }
    fileType = 'audio';
  } else {
    if (!ALLOWED_EXTENSIONS.video.includes(ext)) {
      return { valid: false, error: `پسوند ${ext} برای ویدیوها مجاز نیست. پسوندهای مجاز: mp4, webm, mov` };
    }
    fileType = 'video';
  }

  return {
    valid: true,
    normalizedPath: path,
    folder: matchingFolder,
    fileType,
    mimeType: MIME_MAP[extKey] || 'application/octet-stream',
    filename,
  };
}

async function fetchFromGitHubContents(
  endpointPath: string,
  env: Env,
  options: { method?: string; body?: any; headers?: Record<string, string> } = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    return { ok: false, status: 500, data: { error: 'GITHUB_TOKEN_NOT_SET' } };
  }

  const owner = env.GITHUB_REPO_OWNER || 'siralinamdarinc-byte';
  const repo = env.GITHUB_REPO_NAME || 'DANCE';
  const branch = env.GITHUB_BRANCH || 'main';

  const cleanPath = endpointPath.replace(/^\/+/, '');
  let url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
  if (!options.method || options.method === 'GET') {
    url += `${url.includes('?') ? '&' : '?'}ref=${encodeURIComponent(branch)}`;
  }

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2026-03-10',
        'User-Agent': 'DanceAcademy-CloudflareWorker/1.0',
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });

    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 500, data: { error: err?.message || 'Network error connecting to GitHub API' } };
  }
}

// ===========================================================================
// CRYPTOGRAPHY & AUTHENTICATION HELPERS (Web Crypto API Native)
// ===========================================================================

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const iterations = 100000;

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `pbkdf2$${iterations}$${saltHex}$${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false;
    }
    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const originalHashHex = parts[3];

    if (isNaN(iterations) || !saltHex || !originalHashHex) {
      return false;
    }

    const salt = new Uint8Array(
      saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const enc = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      passwordKey,
      256
    );

    const derivedBytes = new Uint8Array(derivedBits);
    const originalBytes = new Uint8Array(
      originalHashHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    if (derivedBytes.length !== originalBytes.length) {
      return false;
    }

    let diff = 0;
    for (let i = 0; i < derivedBytes.length; i++) {
      diff |= derivedBytes[i] ^ originalBytes[i];
    }
    return diff === 0;
  } catch {
    return false;
  }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function stringToBase64Url(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

function base64UrlToString(str: string): string {
  return new TextDecoder().decode(base64UrlDecode(str));
}

export async function signJwt(payload: Record<string, any>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = stringToBase64Url(JSON.stringify(header));
  const encodedPayload = stringToBase64Url(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const encodedSignature = base64UrlEncode(new Uint8Array(signature));

  return `${dataToSign}.${encodedSignature}`;
}

export async function verifyJwt(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: any }> {
  try {
    if (!token || !secret) {
      return { valid: false };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const headerStr = base64UrlToString(encodedHeader);
    const header = JSON.parse(headerStr);
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      return { valid: false };
    }

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const dataToVerify = enc.encode(`${encodedHeader}.${encodedPayload}`);
    const signatureBytes = base64UrlDecode(encodedSignature);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataToVerify
    );

    if (!isValid) {
      return { valid: false };
    }

    const payloadStr = base64UrlToString(encodedPayload);
    const payload = JSON.parse(payloadStr);

    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
      typeof payload.exp !== 'number' ||
      nowSeconds >= payload.exp
    ) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// Helper: Verify Admin Authentication Token from Request Header
async function isAuthorized(
  request: Request,
  env: Env
): Promise<{ authorized: boolean; payload?: any }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return { authorized: false };
  }

  const secret = env.JWT_SECRET;
  if (!secret) {
    return { authorized: false };
  }

  const result = await verifyJwt(token, secret);
  if (!result.valid || !result.payload) {
    return { authorized: false };
  }

  return { authorized: true, payload: result.payload };
}

export default {
  async fetch(request: Request, env: Env, ctx?: any): Promise<Response> {
    const url = new URL(request.url);

    // Standard CORS Headers for Worker
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // -------------------------------------------------------------
      // 1. HEALTH CHECK & STATUS
      // -------------------------------------------------------------
      if (url.pathname === '/api/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            runtime: 'Cloudflare Worker Native',
            hasD1: !!env.DB,
            hasR2: !!env.MEDIA_BUCKET,
            r2Status: env.MEDIA_BUCKET ? 'active' : 'optional_disabled',
            timestamp: new Date().toISOString(),
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // -------------------------------------------------------------
      // 2. AUTHENTICATION & SECURITY (D1 admin_users & Real JWT)
      // -------------------------------------------------------------
      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        if (!env.JWT_SECRET) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'تنظیمات امنیتی سرور ناقص است (JWT_SECRET تعریف نشده است).',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const body = (await request.json()) as { username?: string; password?: string };
        const username = body.username?.trim();
        const password = body.password;

        if (!username || !password) {
          return new Response(
            JSON.stringify({ success: false, error: 'نام کاربری و رمز عبور الزامی است.' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        let adminUser: { id: string; username: string; password_hash: string } | null = null;

        if (env.DB) {
          adminUser = await env.DB.prepare(
            'SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1'
          )
            .bind(username)
            .first<{ id: string; username: string; password_hash: string }>();
        }

        if (!adminUser || !adminUser.password_hash) {
          return new Response(
            JSON.stringify({ success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const isPasswordValid = await verifyPassword(password, adminUser.password_hash);
        if (!isPasswordValid) {
          return new Response(
            JSON.stringify({ success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const nowSeconds = Math.floor(Date.now() / 1000);
        const expSeconds = nowSeconds + 24 * 60 * 60; // 24 hours valid session

        const token = await signJwt(
          {
            sub: adminUser.id,
            username: adminUser.username,
            role: 'SUPER_ADMIN',
            iat: nowSeconds,
            exp: expSeconds,
          },
          env.JWT_SECRET
        );

        return new Response(
          JSON.stringify({
            success: true,
            token,
            user: {
              username: adminUser.username,
              role: 'SUPER_ADMIN',
            },
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (url.pathname === '/api/auth/verify' && request.method === 'GET') {
        const auth = await isAuthorized(request, env);
        if (auth.authorized && auth.payload) {
          return new Response(
            JSON.stringify({
              success: true,
              valid: true,
              user: {
                username: auth.payload.username,
                role: auth.payload.role || 'SUPER_ADMIN',
              },
            }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        return new Response(JSON.stringify({ success: false, valid: false }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // -------------------------------------------------------------
      // 3. BOOKINGS MANAGEMENT
      // -------------------------------------------------------------
      // 3.1 Public Booking Creation (Couples booking online)
      if (url.pathname === '/api/bookings' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const id = `book-${Date.now()}`;
        const createdAt = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

        if (env.DB) {
          await env.DB.prepare(
            `INSERT INTO bookings (id, couple_name, phone, dance_style, wedding_date, preferred_time, notes, status, branch, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'New', ?, ?)`
          )
            .bind(
              id,
              body.coupleName || 'نامشخص',
              body.phone || '',
              body.danceStyle || 'رقص عروسی',
              body.weddingDate || '',
              body.preferredTime || '',
              body.notes || '',
              body.branch || 'شعبه اصلی',
              createdAt
            )
            .run();

          // Auto-Upsert into CRM Customers in D1 with unarchive & New status on new booking
          await env.DB.prepare(
            `INSERT INTO crm_customers (id, phone, couple_name, dance_style, wedding_date, status, total_bookings, internal_notes, tags, is_archived, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 'New', 1, ?, ?, 0, ?, ?)
             ON CONFLICT(phone) DO UPDATE SET 
               total_bookings = total_bookings + 1,
               status = 'New',
               is_archived = 0,
               couple_name = excluded.couple_name,
               dance_style = excluded.dance_style,
               wedding_date = excluded.wedding_date,
               updated_at = ?`
          )
            .bind(
              `cust-${id}`,
              body.phone || '',
              body.coupleName || 'نامشخص',
              body.danceStyle || 'رقص عروسی',
              body.weddingDate || '',
              body.notes ? `یادداشت رزرو: ${body.notes}` : '',
              JSON.stringify([body.danceStyle || 'رقص عروسی', 'مشتری جدید']),
              createdAt,
              createdAt,
              createdAt
            )
            .run();

          // Insert initial CRM interaction log
          await env.DB.prepare(
            `INSERT INTO crm_interactions (id, customer_phone, type, note, author, created_at)
             VALUES (?, ?, 'meeting', ?, 'سیستم آنلاین', ?)`
          )
            .bind(`log-${Date.now()}`, body.phone || '', `ثبت درخواست نوبت رقص (${body.danceStyle}) - خروج خودکار از بایگانی و فعال‌سازی`, createdAt)
            .run();
        } else {
          // Memory fallback
          const newBooking = {
            id,
            coupleName: body.coupleName || 'نامشخص',
            phone: body.phone || '',
            danceStyle: body.danceStyle || 'رقص عروسی',
            weddingDate: body.weddingDate || '',
            preferredTime: body.preferredTime || '',
            notes: body.notes || '',
            status: 'New',
            branch: body.branch || 'شعبه اصلی',
            createdAt,
          };
          memoryStore.bookings.unshift(newBooking);

          // Update or create memory customer
          const existingCust = memoryStore.customers.get(body.phone || '');
          if (existingCust) {
            existingCust.totalBookings = (existingCust.totalBookings || 1) + 1;
            existingCust.status = 'New';
            existingCust.isArchived = false;
            existingCust.coupleName = body.coupleName || existingCust.coupleName;
            existingCust.danceStyle = body.danceStyle || existingCust.danceStyle;
            existingCust.weddingDate = body.weddingDate || existingCust.weddingDate;
            existingCust.updatedAt = createdAt;
          } else {
            memoryStore.customers.set(body.phone || '', {
              id: `cust-${id}`,
              phone: body.phone || '',
              coupleName: body.coupleName || 'نامشخص',
              danceStyle: body.danceStyle || 'رقص عروسی',
              weddingDate: body.weddingDate || '',
              status: 'New',
              totalBookings: 1,
              internalNotes: body.notes ? `یادداشت رزرو: ${body.notes}` : '',
              tags: [body.danceStyle || 'رقص عروسی', 'مشتری جدید'],
              isArchived: false,
              createdAt,
              updatedAt: createdAt,
            });
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            booking: {
              id,
              coupleName: body.coupleName,
              phone: body.phone,
              danceStyle: body.danceStyle,
              weddingDate: body.weddingDate,
              preferredTime: body.preferredTime,
              notes: body.notes,
              status: 'New',
              createdAt,
            },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // 3.2 Fetch All Bookings (Admin only protected)
      if (url.pathname === '/api/bookings' && request.method === 'GET') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز. لطفا وارد شوید.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        if (env.DB) {
          const results = await env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
          const mapped = (results.results || []).map((row: any) => ({
            id: row.id,
            coupleName: row.couple_name,
            phone: row.phone,
            danceStyle: row.dance_style,
            weddingDate: row.wedding_date,
            preferredTime: row.preferred_time,
            notes: row.notes,
            status: row.status,
            branch: row.branch,
            createdAt: row.created_at,
          }));
          return new Response(JSON.stringify(mapped), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify(memoryStore.bookings), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 3.3 Update Booking Status / Delete (Admin only)
      const bookingStatusMatch = url.pathname.match(/^\/api\/bookings\/([^/]+)\/status$/);
      if (bookingStatusMatch && request.method === 'PUT') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        const bookingId = bookingStatusMatch[1];
        const { status } = (await request.json()) as { status: string };

        if (env.DB) {
          await env.DB.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(status, bookingId)
            .run();
        } else {
          const b = memoryStore.bookings.find((item) => item.id === bookingId);
          if (b) b.status = status;
        }

        return new Response(JSON.stringify({ success: true, id: bookingId, status }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const bookingDeleteMatch = url.pathname.match(/^\/api\/bookings\/([^/]+)$/);
      if (bookingDeleteMatch && request.method === 'DELETE') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        const bookingId = bookingDeleteMatch[1];
        if (env.DB) {
          await env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(bookingId).run();
        } else {
          memoryStore.bookings = memoryStore.bookings.filter((b) => b.id !== bookingId);
        }
        return new Response(JSON.stringify({ success: true, id: bookingId }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // -------------------------------------------------------------
      // 4. CRM CUSTOMERS & INTERACTIONS (Admin Protected)
      // -------------------------------------------------------------
      if (url.pathname === '/api/crm/customers' && request.method === 'GET') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز به پرونده‌های CRM.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        if (env.DB) {
          const results = await env.DB.prepare(
            `SELECT * FROM crm_customers 
             ORDER BY 
               is_archived ASC,
               (CASE WHEN status = 'New' THEN 0 ELSE 1 END) ASC,
               updated_at DESC,
               created_at DESC`
          ).all();
          const customers = (results.results || []).map((row: any) => ({
            id: row.id,
            phone: row.phone,
            coupleName: row.couple_name,
            danceStyle: row.dance_style,
            weddingDate: row.wedding_date,
            status: row.status,
            totalBookings: row.total_bookings,
            internalNotes: row.internal_notes,
            tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : row.tags || [],
            isArchived: Boolean(row.is_archived),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          return new Response(JSON.stringify(customers), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const memList = Array.from(memoryStore.customers.values()).sort((a, b) => {
          if (Boolean(a.isArchived) !== Boolean(b.isArchived)) {
            return a.isArchived ? 1 : -1;
          }
          if ((a.status === 'New') !== (b.status === 'New')) {
            return a.status === 'New' ? -1 : 1;
          }
          return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        });

        return new Response(JSON.stringify(memList), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const crmCustomerMatch = url.pathname.match(/^\/api\/crm\/customers\/([^/]+)$/);
      if (crmCustomerMatch && request.method === 'PUT') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        const phone = decodeURIComponent(crmCustomerMatch[1]);
        const body = (await request.json()) as {
          internalNotes?: string;
          tags?: string[];
          isArchived?: boolean;
          status?: string;
        };

        const nowFa = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

        if (env.DB) {
          const existing = await env.DB.prepare('SELECT * FROM crm_customers WHERE phone = ?').bind(phone).first<any>();

          const isArchivedVal = body.isArchived !== undefined ? (body.isArchived ? 1 : 0) : (existing?.is_archived ?? 0);
          const newStatus = body.status || existing?.status || 'New';
          const newNotes = body.internalNotes !== undefined ? body.internalNotes : (existing?.internal_notes || '');
          const newTags = body.tags !== undefined ? JSON.stringify(body.tags) : (existing?.tags || '[]');

          await env.DB.prepare(
            `UPDATE crm_customers SET 
               internal_notes = ?, 
               tags = ?, 
               is_archived = ?, 
               status = ?, 
               updated_at = ? 
             WHERE phone = ?`
          )
            .bind(newNotes, newTags, isArchivedVal, newStatus, nowFa, phone)
            .run();

          // Log interaction if archive state changed
          if (existing && body.isArchived !== undefined && Boolean(existing.is_archived) !== Boolean(body.isArchived)) {
            const logNote = body.isArchived
              ? 'پرونده مشتری به بایگانی منتقل شد'
              : 'پرونده مشتری از بایگانی بازگردانده و فعال شد';
            await env.DB.prepare(
              'INSERT INTO crm_interactions (id, customer_phone, type, note, author, created_at) VALUES (?, ?, ?, ?, ?, ?)'
            )
              .bind(`log-${Date.now()}`, phone, 'status_change', logNote, 'مدیریت آکادمی', nowFa)
              .run();
          }
        } else {
          const cust = memoryStore.customers.get(phone);
          if (cust) {
            const oldArchived = cust.isArchived;
            if (body.internalNotes !== undefined) cust.internalNotes = body.internalNotes;
            if (body.tags !== undefined) cust.tags = body.tags;
            if (body.isArchived !== undefined) cust.isArchived = body.isArchived;
            if (body.status !== undefined) cust.status = body.status;
            cust.updatedAt = nowFa;

            if (body.isArchived !== undefined && Boolean(oldArchived) !== Boolean(body.isArchived)) {
              memoryStore.interactions.unshift({
                id: `log-${Date.now()}`,
                customerPhone: phone,
                type: 'status_change',
                note: body.isArchived ? 'پرونده مشتری به بایگانی منتقل شد' : 'پرونده مشتری از بایگانی بازگردانده و فعال شد',
                author: 'مدیریت آکادمی',
                createdAt: nowFa,
              });
            }
          }
        }

        return new Response(JSON.stringify({ success: true, phone, isArchived: body.isArchived }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const interactionsMatch = url.pathname.match(/^\/api\/crm\/customers\/([^/]+)\/interactions$/);
      if (interactionsMatch) {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        const phone = decodeURIComponent(interactionsMatch[1]);

        if (request.method === 'GET') {
          if (env.DB) {
            const results = await env.DB.prepare(
              'SELECT * FROM crm_interactions WHERE customer_phone = ? ORDER BY created_at DESC'
            )
              .bind(phone)
              .all();
            const mapped = (results.results || []).map((row: any) => ({
              id: row.id,
              customerPhone: row.customer_phone,
              type: row.type,
              note: row.note,
              author: row.author,
              createdAt: row.created_at,
            }));
            return new Response(JSON.stringify(mapped), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          const list = memoryStore.interactions.filter((i) => i.customerPhone === phone);
          return new Response(JSON.stringify(list), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        if (request.method === 'POST') {
          const body = (await request.json()) as any;
          const id = `log-${Date.now()}`;
          const createdAt = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

          if (env.DB) {
            await env.DB.prepare(
              'INSERT INTO crm_interactions (id, customer_phone, type, note, author, created_at) VALUES (?, ?, ?, ?, ?, ?)'
            )
              .bind(id, phone, body.type || 'note', body.note || '', body.author || 'مدیریت', createdAt)
              .run();
          } else {
            memoryStore.interactions.unshift({
              id,
              customerPhone: phone,
              type: body.type || 'note',
              note: body.note || '',
              author: body.author || 'مدیریت',
              createdAt,
            });
          }

          return new Response(
            JSON.stringify({
              id,
              customerPhone: phone,
              type: body.type || 'note',
              note: body.note,
              author: body.author || 'مدیریت',
              createdAt,
            }),
            { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }

      // -------------------------------------------------------------
      // 5. CMS CONTENT SYNC (D1 Table `content_store`)
      // -------------------------------------------------------------
      if (url.pathname === '/api/content') {
        if (request.method === 'GET') {
          if (env.DB) {
            const row = await env.DB.prepare(
              "SELECT json_data FROM content_store WHERE id = 'central_cms_v1' LIMIT 1"
            ).first<{ json_data: string }>();
            if (row && row.json_data) {
              return new Response(row.json_data, {
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              });
            }
          }
          return new Response(JSON.stringify(memoryStore.content || {}), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        if (request.method === 'POST') {
          const auth = await isAuthorized(request, env);
          if (!auth.authorized) {
            return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          const contentJson = await request.text();
          if (env.DB) {
            await env.DB.prepare(
              `INSERT INTO content_store (id, json_data, updated_at)
               VALUES ('central_cms_v1', ?, CURRENT_TIMESTAMP)
               ON CONFLICT(id) DO UPDATE SET json_data = ?, updated_at = CURRENT_TIMESTAMP`
            )
              .bind(contentJson, contentJson)
              .run();
          } else {
            memoryStore.content = JSON.parse(contentJson);
          }

          return new Response(JSON.stringify({ success: true, message: 'محتوا در دیتابیس D1 ذخیره شد.' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }

      // -------------------------------------------------------------
      // 6. GITHUB REPOSITORY MEDIA MANAGER API & R2/D1 INTEGRATION
      // -------------------------------------------------------------

      // 6.0 Media GitHub Status Check
      if (url.pathname === '/api/media/status' && request.method === 'GET') {
        const hasToken = Boolean(env.GITHUB_TOKEN && env.GITHUB_TOKEN.trim().length > 0);
        return new Response(
          JSON.stringify({
            githubConfigured: hasToken,
            owner: env.GITHUB_REPO_OWNER || 'siralinamdarbinanc-byte',
            repo: env.GITHUB_REPO_NAME || 'DANCE',
            branch: env.GITHUB_BRANCH || 'main',
            directories: ALLOWED_DIRECTORIES,
            maxSizeBytes: MAX_MEDIA_SIZE_BYTES,
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // 6.1 Media List (From GitHub public/images, public/audio, public/videos + D1 sync)
      if (url.pathname === '/api/media' && request.method === 'GET') {
        const categoryFilter = url.searchParams.get('category'); // 'image' | 'audio' | 'video'
        const searchFilter = url.searchParams.get('search')?.toLowerCase().trim();

        let allAssets: any[] = [];
        const hasToken = Boolean(env.GITHUB_TOKEN && env.GITHUB_TOKEN.trim().length > 0);

        if (hasToken) {
          const owner = env.GITHUB_REPO_OWNER || 'siralinamdarbinanc-byte';
          const repo = env.GITHUB_REPO_NAME || 'DANCE';
          const branch = env.GITHUB_BRANCH || 'main';

          // Query the 3 folders in parallel
          const folderPromises = ALLOWED_DIRECTORIES.map(async (dir) => {
            const res = await fetchFromGitHubContents(dir, env);
            if (!res.ok || !Array.isArray(res.data)) {
              return [];
            }
            return res.data
              .filter((item: any) => item.type === 'file')
              .map((file: any) => {
                const validation = sanitizeAndValidateMediaPath(file.path);
                const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
                const ext = extMatch ? extMatch[1].toLowerCase() : '';
                const fileType = dir === 'public/images' ? 'image' : dir === 'public/audio' ? 'audio' : 'video';
                const mimeType = MIME_MAP[ext] || (validation.valid && validation.mimeType) || 'application/octet-stream';
                const cleanUrl = `/${file.path.replace(/^public\//, '')}`;
                const rawUrl = file.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;

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

        // Also merge any external URL media from D1 or memory if present
        if (env.DB) {
          try {
            const dbResults = await env.DB.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all();
            const d1Mapped = (dbResults.results || []).map((r: any) => ({
              id: r.id,
              filename: r.filename,
              fileType: r.file_type,
              mimeType: r.mime_type,
              url: r.url,
              rawUrl: r.url,
              path: r.path || '',
              sizeBytes: r.size_bytes || 0,
              createdAt: r.created_at,
              source: 'd1',
            }));
            // Merge without duplicates by filename
            const existingFilenames = new Set(allAssets.map((a) => a.filename));
            for (const d1Item of d1Mapped) {
              if (!existingFilenames.has(d1Item.filename)) {
                allAssets.push(d1Item);
                existingFilenames.add(d1Item.filename);
              }
            }
          } catch {
            // DB fallback ignored
          }
        } else if (allAssets.length === 0) {
          allAssets = [...memoryStore.media];
        }

        // Apply filters
        if (categoryFilter && ['image', 'audio', 'video'].includes(categoryFilter)) {
          allAssets = allAssets.filter((a) => a.fileType === categoryFilter);
        }
        if (searchFilter) {
          allAssets = allAssets.filter(
            (a) =>
              (a.filename || '').toLowerCase().includes(searchFilter) ||
              (a.path || '').toLowerCase().includes(searchFilter)
          );
        }

        return new Response(JSON.stringify(allAssets), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 6.2 Upload Media to GitHub Repository (POST /api/media/upload or /api/upload)
      if ((url.pathname === '/api/media/upload' || url.pathname === '/api/upload') && request.method === 'POST') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز برای آپلود رسانه.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const hasToken = Boolean(env.GITHUB_TOKEN && env.GITHUB_TOKEN.trim().length > 0);
        if (!hasToken) {
          return new Response(
            JSON.stringify({
              error: 'کلید دسترسی گیت‌هاب (GITHUB_TOKEN) در کلودفلر یا سرور تنظیم نشده است.',
              code: 'GITHUB_TOKEN_NOT_CONFIGURED',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const contentType = request.headers.get('content-type') || '';
        let fileBuffer: ArrayBuffer | null = null;
        let originalName = '';
        let targetFolder: 'public/images' | 'public/audio' | 'public/videos' = 'public/images';
        let customFilename = '';

        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file') as File | null;
          if (!file) {
            return new Response(JSON.stringify({ error: 'هیچ فایلی برای آپلود انتخاب نشده است.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          if (file.size > MAX_MEDIA_SIZE_BYTES) {
            return new Response(
              JSON.stringify({ error: `حجم فایل بیشتر از سقف مجاز ۱۰۰ مگابایت است (${(file.size / 1024 / 1024).toFixed(1)}MB).` }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          fileBuffer = await file.arrayBuffer();
          originalName = file.name;
          const folderParam = formData.get('folder') as string;
          if (folderParam && ALLOWED_DIRECTORIES.includes(folderParam as any)) {
            targetFolder = folderParam as any;
          }
          customFilename = (formData.get('filename') as string) || '';
        } else if (contentType.includes('application/json')) {
          const jsonBody = (await request.json()) as any;
          if (!jsonBody.contentBase64 || !jsonBody.filename) {
            return new Response(JSON.stringify({ error: 'محتوای فایل و نام فایل الزامی است.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          originalName = jsonBody.filename;
          if (jsonBody.folder && ALLOWED_DIRECTORIES.includes(jsonBody.folder)) {
            targetFolder = jsonBody.folder;
          }

          const binaryString = atob(jsonBody.contentBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          fileBuffer = bytes.buffer;

          if (fileBuffer.byteLength > MAX_MEDIA_SIZE_BYTES) {
            return new Response(
              JSON.stringify({ error: 'حجم فایل بیشتر از سقف مجاز ۱۰۰ مگابایت است.' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
        } else {
          return new Response(JSON.stringify({ error: 'نوع داده ارسالی نامعتبر است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Clean and sanitize filename
        const safeName = (customFilename || originalName)
          .replace(/[\\/:*?"<>|]/g, '_')
          .replace(/\s+/g, '_')
          .trim();

        // Auto-assign appropriate folder based on extension if not explicitly set
        const extMatch = safeName.match(/\.([a-zA-Z0-9]+)$/);
        if (!extMatch) {
          return new Response(JSON.stringify({ error: 'فایل فاقد پسوند مجاز است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        const ext = `.${extMatch[1].toLowerCase()}`;

        if (ALLOWED_EXTENSIONS.image.includes(ext)) {
          targetFolder = 'public/images';
        } else if (ALLOWED_EXTENSIONS.audio.includes(ext)) {
          targetFolder = 'public/audio';
        } else if (ALLOWED_EXTENSIONS.video.includes(ext)) {
          targetFolder = 'public/videos';
        } else {
          return new Response(
            JSON.stringify({
              error: `پسوند ${ext} پشتیبانی نمی‌شود. پسوندهای مجاز: تصاویر (jpg, jpeg, png, webp) | موزیک (mp3, wav, m4a) | ویدیو (mp4, webm, mov)`,
            }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const fullRepoPath = `${targetFolder}/${safeName}`;
        const validation = sanitizeAndValidateMediaPath(fullRepoPath);
        if (!validation.valid) {
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const owner = env.GITHUB_REPO_OWNER || 'siralinamdarinc-byte';
        const repo = env.GITHUB_REPO_NAME || 'DANCE';
        const branch = env.GITHUB_BRANCH || 'main';
        const nowFa = new Date().toLocaleDateString('fa-IR');

        // Convert array buffer to base64
        const uint8Array = new Uint8Array(fileBuffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + chunkSize)));
        }
        const base64Content = btoa(binary);

        // Step 1: Check if file already exists in GitHub to retrieve existing SHA
        const checkRes = await fetchFromGitHubContents(fullRepoPath, env);
        let existingSha: string | undefined;
        if (checkRes.ok && checkRes.data && checkRes.data.sha) {
          existingSha = checkRes.data.sha;
        }

        // Step 2: PUT file to GitHub Contents API
        const putRes = await fetchFromGitHubContents(fullRepoPath, env, {
          method: 'PUT',
          body: {
            message: `media: upload ${safeName}`,
            content: base64Content,
            branch,
            ...(existingSha ? { sha: existingSha } : {}),
          },
        });

        if (!putRes.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `GitHub rejected the upload: ${putRes.data?.message || 'نامشخص'}`,
              github_status: putRes.status,
              github_message: putRes.data?.message,
              status: putRes.status || 500,
            }),
            { status: putRes.status || 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // Step 3: Verification - GET GitHub contents again to verify that the file actually exists
        const verifyRes = await fetchFromGitHubContents(fullRepoPath, env);
        if (!verifyRes.ok || !verifyRes.data || verifyRes.data.type !== 'file' || !verifyRes.data.sha) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'فایل به گیت‌هاب ارسال شد اما در اعتبارسنجی نهایی مخزن تأیید نشد.',
              status: 500,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const verifiedFile = verifyRes.data;
        const createdSha = verifiedFile.sha || putRes.data?.content?.sha || existingSha || 'sha-verified';
        const cleanUrl = `/${fullRepoPath.replace(/^public\//, '')}`;
        const rawUrl =
          verifiedFile.download_url ||
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fullRepoPath}`;

        const newAsset = {
          id: `gh-${createdSha.slice(0, 10)}-${safeName}`,
          filename: safeName,
          fileType: validation.fileType || 'image',
          mimeType: validation.mimeType || 'application/octet-stream',
          url: cleanUrl,
          rawUrl,
          download_url: verifiedFile.download_url || rawUrl,
          path: fullRepoPath,
          sha: createdSha,
          sizeBytes: verifiedFile.size || fileBuffer.byteLength,
          createdAt: nowFa,
          lastModified: nowFa,
          source: 'github',
        };

        // Also record in D1 if available
        if (env.DB) {
          try {
            await env.DB.prepare(
              'INSERT INTO media_assets (id, filename, file_type, mime_type, url, size_bytes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
            )
              .bind(newAsset.id, newAsset.filename, newAsset.fileType, newAsset.mimeType, newAsset.url, newAsset.sizeBytes, nowFa)
              .run();
          } catch {
            // ignore D1 insert error
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            file: {
              name: safeName,
              path: fullRepoPath,
              size: verifiedFile.size || fileBuffer.byteLength,
              sha: createdSha,
              download_url: verifiedFile.download_url || rawUrl,
            },
            asset: newAsset,
          }),
          {
            status: 201,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // 6.3 Rename / Move Media in GitHub Repository (PUT /api/media/rename or PUT /api/media)
      if (
        (url.pathname === '/api/media/rename' || url.pathname === '/api/media' || url.pathname.startsWith('/api/media/')) &&
        request.method === 'PUT'
      ) {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const hasToken = Boolean(env.GITHUB_TOKEN && env.GITHUB_TOKEN.trim().length > 0);
        if (!hasToken) {
          return new Response(
            JSON.stringify({
              error: 'کلید دسترسی گیت‌هاب (GITHUB_TOKEN) تنظیم نشده است.',
              code: 'GITHUB_TOKEN_NOT_CONFIGURED',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const body = (await request.json()) as {
          oldPath?: string;
          newFilename?: string;
          newPath?: string;
          targetFolder?: string;
        };

        const oldPathRaw = body.oldPath || url.pathname.replace(/^\/api\/media\/?/, '');
        if (!oldPathRaw) {
          return new Response(JSON.stringify({ error: 'مسیر فعلی فایل مشخص نشده است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const oldValidation = sanitizeAndValidateMediaPath(oldPathRaw);
        if (!oldValidation.valid || !oldValidation.normalizedPath) {
          return new Response(JSON.stringify({ error: oldValidation.error || 'مسیر فعلی نامعتبر است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        let newTargetFolder = oldValidation.folder || 'public/images';
        if (body.targetFolder && ALLOWED_DIRECTORIES.includes(body.targetFolder as any)) {
          newTargetFolder = body.targetFolder as any;
        }

        let newFilename = body.newFilename || '';
        if (body.newPath) {
          newFilename = body.newPath.split('/').pop() || '';
        }
        if (!newFilename) {
          return new Response(JSON.stringify({ error: 'نام جدید فایل الزامی است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Preserve or validate extension
        const oldExt = oldValidation.filename?.match(/\.[a-zA-Z0-9]+$/)?.[0] || '';
        if (!newFilename.includes('.') && oldExt) {
          newFilename += oldExt;
        }

        const safeNewFilename = newFilename.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').trim();
        const fullNewPath = `${newTargetFolder}/${safeNewFilename}`;

        const newValidation = sanitizeAndValidateMediaPath(fullNewPath);
        if (!newValidation.valid || !newValidation.normalizedPath) {
          return new Response(JSON.stringify({ error: newValidation.error || 'نام یا پسوند جدید نامعتبر است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const owner = env.GITHUB_REPO_OWNER || 'siralinamdarbinanc-byte';
        const repo = env.GITHUB_REPO_NAME || 'DANCE';
        const branch = env.GITHUB_BRANCH || 'main';
        const nowFa = new Date().toLocaleDateString('fa-IR');

        // 1. Get old file content and sha
        const oldFileRes = await fetchFromGitHubContents(oldValidation.normalizedPath, env);
        if (!oldFileRes.ok || !oldFileRes.data || !oldFileRes.data.content) {
          return new Response(
            JSON.stringify({ error: 'فایل اصلی در مخزن گیت‌هاب یافت نشد یا دسترسی به آن امکان‌پذیر نیست.' }),
            { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const oldSha = oldFileRes.data.sha;
        const oldBase64Content = oldFileRes.data.content.replace(/\n/g, '');

        // 2. Put new file with old content
        const createRes = await fetchFromGitHubContents(fullNewPath, env, {
          method: 'PUT',
          body: {
            message: `Rename media from ${oldValidation.filename} to ${safeNewFilename} via Admin Media Manager`,
            content: oldBase64Content,
            branch,
          },
        });

        if (!createRes.ok) {
          return new Response(
            JSON.stringify({ error: `خطا در ایجاد فایل با نام جدید: ${createRes.data?.message || 'نامشخص'}` }),
            { status: createRes.status || 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // 3. Delete old file
        await fetchFromGitHubContents(oldValidation.normalizedPath, env, {
          method: 'DELETE',
          body: {
            message: `Remove old file after rename: ${oldValidation.filename}`,
            sha: oldSha,
            branch,
          },
        });

        // 4. Verify new file exists
        const verifyRes = await fetchFromGitHubContents(fullNewPath, env);
        const finalFile = verifyRes.ok && verifyRes.data ? verifyRes.data : createRes.data?.content;

        const cleanUrl = `/${fullNewPath.replace(/^public\//, '')}`;
        const rawUrl =
          finalFile?.download_url ||
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fullNewPath}`;

        const updatedAsset = {
          id: `gh-${finalFile?.sha?.slice(0, 10) || Date.now()}-${safeNewFilename}`,
          filename: safeNewFilename,
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

        return new Response(JSON.stringify({ success: true, asset: updatedAsset }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 6.4 Delete Media from GitHub Repository (DELETE /api/media/* or DELETE /api/media)
      if (
        (url.pathname === '/api/media' || url.pathname.startsWith('/api/media/')) &&
        request.method === 'DELETE'
      ) {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        let targetPath = url.searchParams.get('path') || '';
        let sha = url.searchParams.get('sha') || '';
        let idParam = '';

        if (!targetPath) {
          const pathSegment = url.pathname.replace(/^\/api\/media\/?/, '');
          if (pathSegment) {
            targetPath = decodeURIComponent(pathSegment);
          }
        }

        // Check if JSON body with path/sha was provided
        if (!targetPath) {
          try {
            const body = (await request.json().catch(() => ({}))) as any;
            targetPath = body.path || '';
            sha = sha || body.sha || '';
            idParam = body.id || '';
          } catch {
            // body optional
          }
        }

        // If targetPath was passed as a simple ID like 'r2-media-1'
        if (targetPath && !targetPath.includes('/') && !targetPath.includes('.')) {
          idParam = targetPath;
          const found = memoryStore.media.find((m) => m.id === idParam);
          if (found && found.path) {
            targetPath = found.path;
          }
        }

        if (!targetPath) {
          return new Response(JSON.stringify({ error: 'مسیر فایل جهت حذف مشخص نشده است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const validation = sanitizeAndValidateMediaPath(targetPath);
        if (!validation.valid || !validation.normalizedPath) {
          return new Response(JSON.stringify({ error: validation.error || 'مسیر فایل نامعتبر است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const hasToken = Boolean(env.GITHUB_TOKEN && env.GITHUB_TOKEN.trim().length > 0);
        if (!hasToken) {
          return new Response(
            JSON.stringify({
              error: 'کلید دسترسی گیت‌هاب (GITHUB_TOKEN) تنظیم نشده است.',
              code: 'GITHUB_TOKEN_NOT_CONFIGURED',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const branch = env.GITHUB_BRANCH || 'main';

        // If SHA not provided by client, query file info from GitHub first
        if (!sha) {
          const fileInfo = await fetchFromGitHubContents(validation.normalizedPath, env);
          if (fileInfo.ok && fileInfo.data?.sha) {
            sha = fileInfo.data.sha;
          }
        }

        if (sha) {
          const deleteRes = await fetchFromGitHubContents(validation.normalizedPath, env, {
            method: 'DELETE',
            body: {
              message: `Delete media: ${validation.filename} via Admin Media Manager`,
              sha,
              branch,
            },
          });

          if (!deleteRes.ok && deleteRes.status !== 404) {
            return new Response(
              JSON.stringify({ error: `خطا در حذف فایل از گیت‌هاب: ${deleteRes.data?.message || 'نامشخص'}` }),
              { status: deleteRes.status || 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          // Verify file is deleted
          const verifyDeleteRes = await fetchFromGitHubContents(validation.normalizedPath, env);
          if (verifyDeleteRes.ok && verifyDeleteRes.status === 200) {
            return new Response(
              JSON.stringify({ error: 'درخواست حذف ارسال شد اما فایل همچنان در مخزن گیت‌هاب یافت می‌شود.' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
        }

        // Also clean up from D1 / memoryStore
        if (env.DB) {
          try {
            await env.DB.prepare('DELETE FROM media_assets WHERE filename = ? OR id = ?')
              .bind(validation.filename, idParam || targetPath)
              .run();
          } catch {
            // ignore
          }
        }
        memoryStore.media = memoryStore.media.filter(
          (m) => m.path !== validation.normalizedPath && m.filename !== validation.filename && m.id !== idParam
        );

        return new Response(
          JSON.stringify({ success: true, path: validation.normalizedPath, message: 'فایل با موفقیت حذف شد.' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // 6.5 Add Media by Direct External URL (Kept for full backward compatibility)
      if (url.pathname === '/api/media/add-url' && request.method === 'POST') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const body = (await request.json()) as { url?: string; filename?: string; fileType?: string };
        if (!body.url) {
          return new Response(JSON.stringify({ error: 'آدرس لینک فایل الزامی است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const fileId = `url-media-${Date.now()}`;
        const filename = body.filename || 'رسانه اختصاصی';
        const fileType = (body.fileType as any) || 'image';
        const mimeType = fileType === 'audio' ? 'audio/mpeg' : fileType === 'video' ? 'video/mp4' : 'image/jpeg';
        const createdAt = new Date().toLocaleDateString('fa-IR');

        const newAsset = {
          id: fileId,
          filename,
          fileType,
          mimeType,
          url: body.url,
          rawUrl: body.url,
          path: '',
          sizeBytes: 0,
          createdAt,
          lastModified: createdAt,
          source: 'd1',
        };

        if (env.DB) {
          await env.DB.prepare(
            'INSERT INTO media_assets (id, filename, file_type, mime_type, url, size_bytes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(fileId, filename, fileType, mimeType, body.url, 0, createdAt)
            .run();
        } else {
          memoryStore.media.unshift(newAsset);
        }

        return new Response(JSON.stringify({ success: true, asset: newAsset }), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 6.6 Raw Media Stream (Optional R2 compatibility)
      const rawMediaMatch = url.pathname.match(/^\/api\/media\/raw\/([^/]+)$/);
      if (rawMediaMatch && request.method === 'GET') {
        const key = rawMediaMatch[1];
        if (env.MEDIA_BUCKET) {
          const object = await env.MEDIA_BUCKET.get(key);
          if (!object) {
            return new Response('File Not Found in R2 Bucket', { status: 404, headers: corsHeaders });
          }
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          return new Response(object.body, { headers });
        }
        return new Response('مخزن R2 فعال نیست', { status: 404, headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 7. STATIC ASSETS & REACT SPA FRONTEND SERVING (dist)
      // -------------------------------------------------------------
      if (url.pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ success: false, message: 'API Route Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // If Cloudflare Workers Static Assets binding is present
      if (env.ASSETS) {
        const response = await env.ASSETS.fetch(request);
        if (response.status !== 404) {
          return response;
        }

        // SPA Navigation Fallback: For GET/HEAD requests to client-side routes (/admin, /tango, etc.), serve /index.html
        if (request.method === 'GET' || request.method === 'HEAD') {
          const indexUrl = new URL('/index.html', request.url);
          const indexReq = new Request(indexUrl.toString(), request);
          const spaIndexResponse = await env.ASSETS.fetch(indexReq);
          if (spaIndexResponse.status !== 404) {
            return spaIndexResponse;
          }
        }

        return response;
      }

      return new Response('Dance Academy Cloudflare Worker Backend Ready', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err?.message || 'Internal Worker Error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  },
};

