// ============================================================
// Service Worker — Escuelitaz SPF (Static Export PWA)
// Estrategias: Cache First (assets) + Network First (API)
// ============================================================

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `escuelitaz-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `escuelitaz-dynamic-${CACHE_VERSION}`;

// Endpoints de autenticación que NUNCA deben cachearse.
// Incluye refresco de token, OTP, login y logout de Supabase Auth.
// Si se sirvieran desde caché, el autoRefreshToken podría recibir
// un JWT expirado y cerrar la sesión del usuario incorrectamente.
const AUTH_BYPASS_PATTERNS = [
  '/auth/v1/token',
  '/auth/v1/otp',
  '/auth/v1/verify',
  '/auth/v1/logout',
  '/auth/v1/magiclink',
  '/auth/v1/user',
];

// Shell mínimo que se precachea en install
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando…');
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activado.');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Eliminando cache antiguo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptamos GET
  if (request.method !== 'GET') return;

  // ── Auth de Supabase → Siempre red, NUNCA caché ───────────
  // Garantiza que autoRefreshToken reciba siempre tokens frescos
  // y que los logins/logouts no fallen por respuestas cacheadas.
  if (
    url.hostname.includes('supabase') &&
    AUTH_BYPASS_PATTERNS.some((pattern) => url.pathname.includes(pattern))
  ) {
    return; // Sin respondWith: el navegador lo maneja directamente
  }

  // ── Supabase API general → Network First ──────────────────
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // ── Navegación (HTML) → Network First + offline fallback ─
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match('/offline.html')
          )
        )
    );
    return;
  }

  // ── Assets estáticos (JS, CSS, imágenes, fuentes) → Cache First
  event.respondWith(cacheFirst(request));
});

// ── Estrategia: Cache First ─────────────────────────────────
function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request).then((response) => {
      // Solo cacheamos respuestas válidas
      if (!response || response.status !== 200 || response.type === 'opaque') {
        return response;
      }
      const clone = response.clone();
      caches.open(STATIC_CACHE).then((cache) => {
        cache.put(request, clone);
      });
      return response;
    }).catch(() => {
      // Si es una imagen, podríamos devolver un placeholder
      // Por ahora simplemente fallamos silenciosamente
      return new Response('', { status: 408, statusText: 'Offline' });
    });
  });
}

// ── Estrategia: Network First ───────────────────────────────
function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, clone);
        });
      }
      return response;
    })
    .catch(() => caches.match(request));
}
