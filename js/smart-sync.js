// Smart Sync Manager for Real-time Content Updates
class SmartSyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.lastSyncTime = localStorage.getItem('contentLastSync') || 0;
        this.syncIndicator = null;
        this.syncInProgress = false;
        this.syncQueue = new Set();
        
        this.init();
    }
    
    init() {
        this.createSyncIndicator();
        this.setupEventListeners();
        this.startIntelligentSync();
    }
    
    createSyncIndicator() {
        if (this.syncIndicator) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'smart-sync-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            z-index: 10001;
            display: none;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: slideDown 0.3s ease-out;
        `;
        
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div class="sync-spinner"></div>
                <span>Updating content...</span>
            </div>
        `;
        
        // Add spinner styles
        const style = document.createElement('style');
        style.textContent = `
            .sync-spinner {
                width: 14px;
                height: 14px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            }
        `;
        
        if (!document.getElementById('smart-sync-styles')) {
            style.id = 'smart-sync-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(indicator);
        this.syncIndicator = indicator;
    }
    
    setupEventListeners() {
        // Online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.triggerSmartSync('connection_restored');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.hideSyncIndicator();
        });
        
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.triggerSmartSync('page_visible');
            }
        });
        
        // Focus events
        window.addEventListener('focus', () => {
            if (this.isOnline) {
                this.triggerSmartSync('page_focus');
            }
        });
        
        // User interactions
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.isOnline && this.shouldSyncOnUserActivity()) {
                    this.triggerSmartSync('user_activity');
                }
            }, { passive: true, once: true });
        });
        
        // Service worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data?.type === 'CACHE_UPDATED') {
                    this.onSyncComplete();
                } else if (event.data?.type === 'SYNC_PROGRESS') {
                    this.updateSyncProgress(event.data.progress);
                }
            });
        }
    }
    
    shouldSyncOnUserActivity() {
        const timeSinceLastSync = Date.now() - this.lastSyncTime;
        return timeSinceLastSync > 2 * 60 * 1000; // 2 minutes
    }
    
    triggerSmartSync(reason) {
        if (this.syncInProgress || !this.isOnline) return;
        
        console.log(`[SmartSync] Triggering sync due to: ${reason}`);
        this.syncQueue.add(reason);
        
        // Debounce rapid triggers
        clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => {
            this.performSmartSync();
        }, 500);
    }
    
    async performSmartSync() {
        if (this.syncInProgress || !this.isOnline) return;
        
        this.syncInProgress = true;
        this.showSyncIndicator();
        
        try {
            // Check if we actually have connectivity
            await this.verifyConnectivity();
            
            // Prioritize sync based on current page
            const currentPage = window.location.pathname;
            const syncPriority = this.getSyncPriority(currentPage);
            
            // Sync with priority
            await this.syncWithPriority(syncPriority);
            
            // Update last sync time
            this.lastSyncTime = Date.now();
            localStorage.setItem('contentLastSync', this.lastSyncTime);
            
            console.log('[SmartSync] Sync completed successfully');
            
        } catch (error) {
            console.warn('[SmartSync] Sync failed:', error);
        } finally {
            this.syncInProgress = false;
            this.syncQueue.clear();
            setTimeout(() => this.hideSyncIndicator(), 1000);
        }
    }
    
    async verifyConnectivity() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        try {
            // Use relative path for GitHub Pages compatibility
            const faviconPath = window.pwaConfig ? window.pwaConfig.getPath('favicon-16x16.png') : './favicon-16x16.png';
            const response = await fetch(faviconPath, {
                cache: 'no-cache',
                signal: controller.signal,
                mode: 'no-cors' // Allow checking even if CORS fails
            });
            clearTimeout(timeoutId);
            
            // For no-cors mode, we can't check response.ok, so just check if we got a response
            return true;
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Try a different approach - check if we can reach the same origin
            try {
                const rootPath = window.pwaConfig ? window.pwaConfig.getPath('') : './';
                const simpleCheck = await fetch(rootPath, {
                    method: 'HEAD',
                    cache: 'no-cache',
                    signal: controller.signal
                });
                return simpleCheck.ok;
            } catch (secondError) {
                console.warn('[SmartSync] Connectivity check failed:', error);
                throw error;
            }
        }
    }
    
    getSyncPriority(currentPage) {
        const priorities = {
            '/': ['/', '/pages/clubs.html', '/pages/events.html'],
            '/pages/clubs.html': ['/pages/clubs.html', '/', '/pages/about.html'],
            '/pages/events.html': ['/pages/events.html', '/', '/pages/gallery.html'],
            '/pages/gallery.html': ['/pages/gallery.html', '/pages/events.html'],
            '/pages/about.html': ['/pages/about.html', '/', '/pages/leadership.html']
        };
        
        return priorities[currentPage] || ['/', '/pages/clubs.html', '/pages/events.html'];
    }
    
    async syncWithPriority(pages) {
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            try {
                await this.syncPage(page);
                this.updateSyncProgress((i + 1) / pages.length * 100);
            } catch (error) {
                console.warn(`[SmartSync] Failed to sync ${page}:`, error);
            }
        }
        
        // Sync critical resources
        await this.syncCriticalResources();
    }
    
    async syncPage(page) {
        try {
            const response = await fetch(page, { 
                cache: 'no-cache',
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (response.ok && 'caches' in window) {
                const cache = await caches.open('stc-dynamic-v1');
                await cache.put(page, response);
                console.log(`[SmartSync] Successfully synced: ${page}`);
            } else {
                console.warn(`[SmartSync] Failed to sync ${page}: ${response.status}`);
            }
        } catch (error) {
            console.warn(`[SmartSync] Error syncing ${page}:`, error);
            // Don't throw error, just log and continue
        }
    }
    
    async syncCriticalResources() {
        const resources = [
            '/css/style.css',
            '/js/script.js',
            '/js/pwa-installer.js'
        ];
        
        for (const resource of resources) {
            try {
                const response = await fetch(resource, { cache: 'no-cache' });
                if (response.ok && 'caches' in window) {
                    const cache = await caches.open('stc-static-v1');
                    await cache.put(resource, response);
                    console.log(`[SmartSync] Successfully synced resource: ${resource}`);
                }
            } catch (error) {
                console.warn(`[SmartSync] Failed to sync resource ${resource}:`, error);
                // Continue with other resources even if one fails
            }
        }
    }
    
    showSyncIndicator() {
        if (this.syncIndicator) {
            this.syncIndicator.style.display = 'block';
        }
    }
    
    hideSyncIndicator() {
        if (this.syncIndicator) {
            this.syncIndicator.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => {
                this.syncIndicator.style.display = 'none';
                this.syncIndicator.style.animation = 'slideDown 0.3s ease-out';
            }, 300);
        }
    }
    
    updateSyncProgress(progress) {
        // Could add progress bar to indicator if needed
        console.log(`[SmartSync] Progress: ${progress}%`);
    }
    
    onSyncComplete() {
        // Show subtle success indication
        if (this.syncIndicator) {
            const originalContent = this.syncIndicator.innerHTML;
            this.syncIndicator.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-check" style="color: #10b981;"></i>
                    <span>Content updated</span>
                </div>
            `;
            
            setTimeout(() => {
                this.syncIndicator.innerHTML = originalContent;
                this.hideSyncIndicator();
            }, 1500);
        }
    }
    
    startIntelligentSync() {
        // Periodic background sync every 10 minutes
        setInterval(() => {
            if (this.isOnline && !document.hidden) {
                this.triggerSmartSync('periodic');
            }
        }, 10 * 60 * 1000);
        
        // Quick sync on initial load if content is stale
        if (this.isOnline && this.isContentStale()) {
            setTimeout(() => {
                this.triggerSmartSync('stale_content');
            }, 2000);
        }
    }
    
    isContentStale() {
        const staleThreshold = 30 * 60 * 1000; // 30 minutes
        return (Date.now() - this.lastSyncTime) > staleThreshold;
    }
}

// Initialize Smart Sync Manager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname !== '/offline.html') {
            window.smartSyncManager = new SmartSyncManager();
        }
    });
} else {
    if (window.location.pathname !== '/offline.html') {
        window.smartSyncManager = new SmartSyncManager();
    }
}
