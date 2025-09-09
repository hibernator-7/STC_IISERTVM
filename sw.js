// Service Worker for STC IISER TVM PWA
const CACHE_NAME = 'stc-pwa-v1';
const STATIC_CACHE_NAME = 'stc-static-v1';
const DYNAMIC_CACHE_NAME = 'stc-dynamic-v1';
const IMAGE_CACHE_NAME = 'stc-images-v1';

// Core assets to cache immediately
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/css/style.css',
    '/css/home.css',
    '/css/main.css',
    '/css/mobile.css',
    '/pages/navbar.css',
    '/js/script.js',
    '/js/home.js',
    '/js/main.js',
    '/js/mobile-enhancements.js',
    '/js/pwa-installer.js',
    '/js/smart-sync.js',
    '/pages/navbar.html',
    '/header.html',
    '/footer.html',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/site.webmanifest'
];

// Assets to cache on demand
const PAGES_TO_CACHE = [
    '/pages/about.html',
    '/pages/clubs.html',
    '/pages/events.html',
    '/pages/gallery.html',
    '/pages/contact.html',
    '/pages/leadership.html',
    '/pages/credits.html',
    '/pages/faq.html',
    '/pages/anvesha.html'
];

// Install event - cache core assets
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        Promise.all([
            // Cache core assets
            caches.open(STATIC_CACHE_NAME)
                .then(cache => {
                    console.log('[SW] Caching core assets');
                    return cache.addAll(CORE_ASSETS);
                }),
            // Pre-cache important pages
            caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => {
                    console.log('[SW] Pre-caching important pages');
                    return cache.addAll(PAGES_TO_CACHE.slice(0, 3)); // Cache first 3 pages
                })
        ])
        .then(() => {
            console.log('[SW] Core assets cached successfully');
            return self.skipWaiting();
        })
        .catch(error => {
            console.error('[SW] Failed to cache core assets:', error);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME && 
                            cacheName !== IMAGE_CACHE_NAME &&
                            cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients
            self.clients.claim()
        ])
        .then(() => {
            console.log('[SW] Service Worker activated and ready');
        })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests (except for fonts and essential CDN resources)
    if (url.origin !== location.origin && !isAllowedExternalResource(url)) {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

function isAllowedExternalResource(url) {
    const allowedDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com'
    ];
    return allowedDomains.some(domain => url.hostname.includes(domain));
}

async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache First for static assets
        if (isStaticAsset(url.pathname)) {
            return await cacheFirst(request, STATIC_CACHE_NAME);
        }
        
        // Strategy 2: Stale While Revalidate for images
        if (isImage(url.pathname)) {
            return await staleWhileRevalidate(request, IMAGE_CACHE_NAME);
        }
        
        // Strategy 3: Network First for HTML pages
        if (isHTMLPage(url.pathname)) {
            return await networkFirst(request, DYNAMIC_CACHE_NAME);
        }
        
        // Strategy 4: Network First for API calls and dynamic content
        return await networkFirst(request, DYNAMIC_CACHE_NAME);
        
    } catch (error) {
        console.error('[SW] Fetch error:', error);
        
                // Fallback for HTML pages
        if (isHTMLPage(url.pathname) || request.headers.get('accept')?.includes('text/html')) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            const cachedResponse = await cache.match('/index.html');
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // If no cached content, redirect to offline page with return URL
            const offlineCache = await caches.open(STATIC_CACHE_NAME);
            const offlinePage = await offlineCache.match('/offline.html');
            if (offlinePage) {
                // Clone response and modify to include return URL in search params
                const offlineContent = await offlinePage.text();
                const modifiedContent = offlineContent.replace(
                    "const returnUrl = urlParams.get('return') || '/';",
                    `const returnUrl = urlParams.get('return') || '${url.pathname}';`
                );
                
                return new Response(modifiedContent, {
                    status: 200,
                    statusText: 'OK',
                    headers: { 'Content-Type': 'text/html' }
                });
            }
        }
        
        // Return a generic error response
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    const response = await fetch(request);
    if (response.status === 200) {
        cache.put(request, response.clone());
    }
    return response;
}

// Network First strategy
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const response = await fetch(request);
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        throw error;
    }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        // Silently fail for background updates
    });
    
    return cached || fetchPromise;
}

// Helper functions
function isStaticAsset(pathname) {
    return pathname.match(/\.(css|js|woff|woff2|ttf|otf|ico|png|jpg|jpeg|gif|svg|webp)$/) ||
           pathname === '/site.webmanifest';
}

function isImage(pathname) {
    return pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/);
}

function isHTMLPage(pathname) {
    return pathname.endsWith('.html') || 
           pathname === '/' || 
           (!pathname.includes('.') && pathname.endsWith('/'));
}

// Handle background sync for form submissions (if needed)
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    // Implementation for offline form submission sync
    console.log('[SW] Syncing contact form data...');
}

// Handle push notifications (for future use)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/android-chrome-192x192.png',
            badge: '/favicon-32x32.png',
            data: data.url
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.notification.data) {
        event.waitUntil(
            clients.openWindow(event.notification.data)
        );
    }
});

// Log service worker events for debugging
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'SYNC_CACHE') {
        console.log('[SW] Cache sync requested from offline page');
        event.waitUntil(syncCacheFromOfflinePage());
    }
});

// Handle cache sync requests from offline page
async function syncCacheFromOfflinePage() {
    try {
        console.log('[SW] Starting cache sync...');
        
        // Update critical pages
        const criticalPages = [
            '/',
            '/index.html',
            '/pages/about.html',
            '/pages/clubs.html',
            '/pages/events.html',
            '/pages/gallery.html'
        ];
        
        const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
        
        for (const page of criticalPages) {
            try {
                const response = await fetch(page, { cache: 'reload' });
                if (response.ok) {
                    await dynamicCache.put(page, response);
                    console.log(`[SW] Updated cache for: ${page}`);
                }
            } catch (error) {
                console.warn(`[SW] Failed to update cache for ${page}:`, error);
            }
        }
        
        // Update static resources
        const staticResources = [
            '/css/style.css',
            '/js/script.js',
            '/js/pwa-installer.js'
        ];
        
        const staticCache = await caches.open(STATIC_CACHE_NAME);
        
        for (const resource of staticResources) {
            try {
                const response = await fetch(resource, { cache: 'reload' });
                if (response.ok) {
                    await staticCache.put(resource, response);
                    console.log(`[SW] Updated cache for resource: ${resource}`);
                }
            } catch (error) {
                console.warn(`[SW] Failed to update cache for resource ${resource}:`, error);
            }
        }
        
        console.log('[SW] Cache sync completed');
        
        // Notify all clients about the update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'CACHE_UPDATED',
                timestamp: Date.now()
            });
        });
        
    } catch (error) {
        console.error('[SW] Cache sync failed:', error);
    }
}

console.log('[SW] Service Worker script loaded');
