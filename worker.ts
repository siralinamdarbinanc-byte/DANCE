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
  ] as any[],
};

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
      // 6. CLOUDFLARE R2 MEDIA STORAGE (OPTIONAL)
      // -------------------------------------------------------------
      // 6.1 Media List
      if (url.pathname === '/api/media' && request.method === 'GET') {
        if (env.DB) {
          const results = await env.DB.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all();
          const mapped = (results.results || []).map((r: any) => ({
            id: r.id,
            filename: r.filename,
            fileType: r.file_type,
            mimeType: r.mime_type,
            url: r.url,
            sizeBytes: r.size_bytes,
            createdAt: r.created_at,
          }));
          return new Response(JSON.stringify(mapped), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        return new Response(JSON.stringify(memoryStore.media), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 6.2 Raw Media Stream from R2 Bucket (if bound)
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
        return new Response('مخزن R2 فعال نیست (اختیاری)', { status: 404, headers: corsHeaders });
      }

      // 6.3 Add Media by External URL (Works directly with D1 even without R2)
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
        const fileType = body.fileType || 'image';
        const mimeType = fileType === 'audio' ? 'audio/mpeg' : fileType === 'video' ? 'video/mp4' : 'image/jpeg';
        const createdAt = new Date().toLocaleDateString('fa-IR');

        const newAsset = {
          id: fileId,
          filename,
          fileType,
          mimeType,
          url: body.url,
          sizeBytes: 0,
          createdAt,
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

      // 6.4 Upload Media to R2 Bucket (with graceful fallback if R2 is not enabled)
      if (url.pathname === '/api/upload' && request.method === 'POST') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز برای آپلود فایل.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
          return new Response(JSON.stringify({ error: 'فایلی ارسال نشده است.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // If R2 is not bound in production, notify gracefully without crashing
        if (!env.MEDIA_BUCKET) {
          return new Response(
            JSON.stringify({
              success: false,
              r2Active: false,
              error: 'فضای ابری R2 در حال حاضر فعال نیست (اختیاری). لطفاً از دکمه افزودن لینک مستقیم رسانه استفاده نمایید.',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const fileId = `r2-${Date.now()}`;
        const key = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const mimeType = file.type || 'application/octet-stream';
        const fileType = mimeType.startsWith('audio') ? 'audio' : mimeType.startsWith('video') ? 'video' : 'image';
        const createdAt = new Date().toLocaleDateString('fa-IR');
        let fileUrl = `/api/media/raw/${key}`;

        const buffer = await file.arrayBuffer();
        await env.MEDIA_BUCKET.put(key, buffer, {
          httpMetadata: { contentType: mimeType },
        });

        const newAsset = {
          id: fileId,
          filename: file.name,
          fileType,
          mimeType,
          url: fileUrl,
          sizeBytes: file.size,
          createdAt,
        };

        if (env.DB) {
          await env.DB.prepare(
            'INSERT INTO media_assets (id, filename, file_type, mime_type, url, size_bytes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(fileId, file.name, fileType, mimeType, fileUrl, file.size, createdAt)
            .run();
        } else {
          memoryStore.media.unshift(newAsset);
        }

        return new Response(JSON.stringify(newAsset), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 6.5 Delete Media
      const deleteMediaMatch = url.pathname.match(/^\/api\/media\/([^/]+)$/);
      if (deleteMediaMatch && request.method === 'DELETE') {
        const auth = await isAuthorized(request, env);
        if (!auth.authorized) {
          return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        const mediaId = deleteMediaMatch[1];
        if (env.DB) {
          await env.DB.prepare('DELETE FROM media_assets WHERE id = ?').bind(mediaId).run();
        } else {
          memoryStore.media = memoryStore.media.filter((m) => m.id !== mediaId);
        }
        return new Response(JSON.stringify({ success: true, id: mediaId }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
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

