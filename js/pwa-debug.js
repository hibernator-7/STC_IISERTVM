// PWA Debug Utility
class PWADebugger {
    constructor() {
        this.init();
    }
    
    init() {
        // Add debug commands to window for easy access
        window.PWADebug = {
            checkStatus: () => this.checkPWAStatus(),
            clearCaches: () => this.clearAllCaches(),
            unregisterSW: () => this.unregisterServiceWorker(),
            testConnectivity: () => this.testConnectivity(),
            forceCacheUpdate: () => this.forceCacheUpdate(),
            showInfo: () => this.showPWAInfo()
        };
        
        // Log PWA status on load
        setTimeout(() => this.checkPWAStatus(), 2000);
    }
    
    async checkPWAStatus() {
        console.group('🔍 PWA Debug Status');
        
        // Service Worker status
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                console.log('✅ Service Worker supported');
                console.log(`📝 Registrations: ${registrations.length}`);
                
                registrations.forEach((reg, index) => {
                    console.log(`SW ${index + 1}:`, {
                        scope: reg.scope,
                        state: reg.active?.state,
                        updateViaCache: reg.updateViaCache
                    });
                });
                
                if (navigator.serviceWorker.controller) {
                    console.log('🎮 SW Controller active');
                } else {
                    console.warn('⚠️ No SW controller');
                }
            } catch (error) {
                console.error('❌ SW Registration error:', error);
            }
        } else {
            console.warn('❌ Service Worker not supported');
        }
        
        // Cache status
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                console.log('📦 Cache API supported');
                console.log('📝 Cache names:', cacheNames);
                
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const keys = await cache.keys();
                    console.log(`📦 ${cacheName}: ${keys.length} items`);
                }
            } catch (error) {
                console.error('❌ Cache error:', error);
            }
        } else {
            console.warn('❌ Cache API not supported');
        }
        
        // PWA installation status
        const isStandalone = window.navigator.standalone || 
                           window.matchMedia('(display-mode: standalone)').matches;
        console.log(isStandalone ? '📱 Running as PWA' : '🌐 Running in browser');
        
        // Manifest status
        try {
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (manifestLink) {
                console.log('📋 Manifest link found:', manifestLink.href);
                const response = await fetch(manifestLink.href);
                if (response.ok) {
                    const manifest = await response.json();
                    console.log('📋 Manifest loaded:', manifest);
                } else {
                    console.warn('⚠️ Manifest fetch failed:', response.status);
                }
            } else {
                console.warn('⚠️ No manifest link found');
            }
        } catch (error) {
            console.error('❌ Manifest error:', error);
        }
        
        // Network status
        console.log(navigator.onLine ? '🌐 Online' : '📴 Offline');
        
        console.groupEnd();
    }
    
    async clearAllCaches() {
        try {
            const cacheNames = await caches.keys();
            const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
            await Promise.all(deletePromises);
            console.log('🗑️ All caches cleared');
            
            // Force reload
            window.location.reload();
        } catch (error) {
            console.error('❌ Error clearing caches:', error);
        }
    }
    
    async unregisterServiceWorker() {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            const unregisterPromises = registrations.map(reg => reg.unregister());
            await Promise.all(unregisterPromises);
            console.log('🗑️ All service workers unregistered');
            
            // Clear caches and reload
            await this.clearAllCaches();
        } catch (error) {
            console.error('❌ Error unregistering SW:', error);
        }
    }
    
    async testConnectivity() {
        console.group('🔗 Testing Connectivity');
        
        const tests = [
            { name: 'Homepage', url: '/' },
            { name: 'Favicon', url: '/favicon-16x16.png' },
            { name: 'Manifest', url: '/site.webmanifest' },
            { name: 'Service Worker', url: '/sw.js' },
            { name: 'CSS', url: '/css/style.css' }
        ];
        
        for (const test of tests) {
            try {
                const start = performance.now();
                const response = await fetch(test.url, { cache: 'no-cache' });
                const time = Math.round(performance.now() - start);
                
                console.log(`${response.ok ? '✅' : '❌'} ${test.name}: ${response.status} (${time}ms)`);
            } catch (error) {
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        console.groupEnd();
    }
    
    async forceCacheUpdate() {
        try {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SYNC_CACHE',
                    timestamp: Date.now()
                });
                console.log('🔄 Cache update requested');
            } else {
                console.warn('⚠️ No service worker controller available');
            }
        } catch (error) {
            console.error('❌ Error requesting cache update:', error);
        }
    }
    
    showPWAInfo() {
        const info = {
            'PWA Support': 'serviceWorker' in navigator && 'caches' in window,
            'Install Support': 'BeforeInstallPromptEvent' in window,
            'Notification Support': 'Notification' in window,
            'Background Sync': 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            'Push Support': 'serviceWorker' in navigator && 'PushManager' in window,
            'Standalone Mode': window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches,
            'Online Status': navigator.onLine,
            'User Agent': navigator.userAgent
        };
        
        console.table(info);
    }
}

// Initialize debugger
if (window.location.search.includes('debug') || localStorage.getItem('pwa-debug') === 'true') {
    new PWADebugger();
    console.log('🔧 PWA Debugger loaded. Use PWADebug.showInfo() for status.');
}

// Add keyboard shortcut for debugging (Ctrl+Shift+P)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        if (!window.PWADebug) {
            new PWADebugger();
        }
        window.PWADebug.showInfo();
    }
});
