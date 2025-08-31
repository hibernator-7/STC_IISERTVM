// Service Worker for Image Caching and Performance
const CACHE_NAME = 'stc-gallery-v1';
const IMAGE_CACHE_NAME = 'stc-images-v1';
const STATIC_CACHE_NAME = 'stc-static-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/pages/gallery.html',
    '/css/style.css',
    '/pages/navbar.css',
    '/pages/gallery-enhanced.css',
    '/pages/gallery-enhanced.js',
    '/js/script.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old caches
                        if (cacheName !== CACHE_NAME && 
                            cacheName !== IMAGE_CACHE_NAME && 
                            cacheName !== STATIC_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-HTTP requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Handle different types of requests
    if (request.destination === 'image') {
        // Image requests - cache first strategy
        event.respondWith(handleImageRequest(request));
    } else if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
        // Static assets - cache first strategy
        event.respondWith(handleStaticRequest(request));
    } else {
        // Other requests - network first strategy
        event.respondWith(handleNetworkFirst(request));
    }
});

// Handle image requests with optimized caching
async function handleImageRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Check image cache first
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('Image served from cache:', url.pathname);
            return cachedResponse;
        }
        
        // Try to fetch the image
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            console.log('Image cached:', url.pathname);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        // If original image fails, try to serve optimized version
        if (url.pathname.includes('/images/gallery/')) {
            const optimizedUrl = getOptimizedImageUrl(url.pathname);
            if (optimizedUrl !== url.pathname) {
                console.log('Trying optimized version:', optimizedUrl);
                const optimizedRequest = new Request(optimizedUrl);
                const optimizedResponse = await fetch(optimizedRequest);
                
                if (optimizedResponse.ok) {
                    cache.put(optimizedRequest, optimizedResponse.clone());
                    return optimizedResponse;
                }
            }
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Image request failed:', error);
        
        // Try to serve from cache as fallback
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const fallbackResponse = await cache.match(request);
        
        if (fallbackResponse) {
            return fallbackResponse;
        }
        
        // Return a placeholder or error response
        return new Response('Image not available', { 
            status: 404, 
            statusText: 'Image Not Found' 
        });
    }
}

// Handle static asset requests
async function handleStaticRequest(request) {
    try {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        return cachedResponse || new Response('Asset not available', { status: 404 });
    }
}

// Handle other requests with network-first strategy
async function handleNetworkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        return cachedResponse || new Response('Content not available', { 
            status: 404,
            statusText: 'Offline' 
        });
    }
}

// Get optimized image URL based on device capabilities
function getOptimizedImageUrl(originalPath) {
    // Don't optimize if already optimized
    if (originalPath.includes('-small') || 
        originalPath.includes('-medium') || 
        originalPath.includes('-large')) {
        return originalPath;
    }
    
    // Simple optimization logic - you can enhance this
    const pathParts = originalPath.split('.');
    const extension = pathParts.pop();
    const basePath = pathParts.join('.');
    
    // Check if we're on a mobile device or slow connection
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlow = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    const isSmallScreen = self.screen && self.screen.width <= 768;
    
    if (isSlow || isSmallScreen) {
        // Use small version for slow connections or small screens
        return `${basePath}-small.${extension}`;
    } else if (self.screen && self.screen.width <= 1024) {
        // Use medium version for tablets/laptops
        return `${basePath}-medium.${extension}`;
    } else {
        // Use large version for desktop
        return `${basePath}-large.${extension}`;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_IMAGES') {
        // Pre-cache critical images
        const imagesToCache = event.data.images || [];
        cacheImages(imagesToCache);
    }
});

// Function to pre-cache images
async function cacheImages(imageUrls) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    
    const cachePromises = imageUrls.map(async url => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
                console.log('Pre-cached image:', url);
            }
        } catch (error) {
            console.error('Failed to cache image:', url, error);
        }
    });
    
    await Promise.all(cachePromises);
    console.log('Pre-caching completed');
}
