// PWA Configuration for GitHub Pages and other deployments
class PWAConfig {
    constructor() {
        this.basePath = this.detectBasePath();
        this.isGitHubPages = this.detectGitHubPages();
        console.log(`[PWA Config] Base path: ${this.basePath}, GitHub Pages: ${this.isGitHubPages}`);
    }

    detectBasePath() {
        // Check if we're on GitHub Pages with a repository name in the path
        const pathname = window.location.pathname;
        
        // GitHub Pages patterns:
        // - username.github.io/repo-name/ (repo pages)
        // - username.github.io/ (user/org pages)
        if (this.detectGitHubPages()) {
            const pathParts = pathname.split('/').filter(part => part);
            
            // If there's a path part and it looks like a repo name, use it as base
            if (pathParts.length > 0 && !pathParts[0].endsWith('.html')) {
                return `/${pathParts[0]}`;
            }
        }
        
        // For other deployments or root deployments
        return '';
    }

    detectGitHubPages() {
        const hostname = window.location.hostname;
        return hostname.includes('github.io') || hostname.includes('github.com');
    }

    // Get absolute path with base path
    getPath(relativePath) {
        // Remove leading slash if present
        const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
        
        // If no base path, just add leading slash
        if (!this.basePath) {
            return `/${cleanPath}`;
        }
        
        // Add base path
        return `${this.basePath}/${cleanPath}`;
    }

    // Get service worker path
    getServiceWorkerPath() {
        return this.getPath('sw.js');
    }

    // Get manifest path
    getManifestPath() {
        return this.getPath('site.webmanifest');
    }

    // Get scope for service worker
    getScope() {
        return this.basePath || '/';
    }

    // Update manifest start_url and scope dynamically
    updateManifestPaths() {
        // This will be used by the service worker to update cached manifest
        const manifestUpdates = {
            start_url: this.getPath(''),
            scope: this.getScope()
        };
        
        return manifestUpdates;
    }

    // Get all core assets with proper paths
    getCoreAssets() {
        const assets = [
            '',
            'index.html',
            'offline.html',
            'css/style.css',
            'css/home.css',
            'css/main.css',
            'css/mobile.css',
            'pages/navbar.css',
            'js/script.js',
            'js/home.js',
            'js/main.js',
            'js/mobile-enhancements.js',
            'js/pwa-installer.js',
            'js/pwa-config.js',
            'js/smart-sync.js',
            'pages/navbar.html',
            'header.html',
            'footer.html',
            'android-chrome-192x192.png',
            'android-chrome-512x512.png',
            'apple-touch-icon.png',
            'favicon-32x32.png',
            'favicon-16x16.png',
            'site.webmanifest'
        ];

        return assets.map(asset => this.getPath(asset));
    }

    // Get pages to cache with proper paths
    getPagesToCache() {
        const pages = [
            'pages/about.html',
            'pages/clubs.html',
            'pages/events.html',
            'pages/gallery.html',
            'pages/contact.html',
            'pages/leadership.html',
            'pages/credits.html',
            'pages/faq.html',
            'pages/anvesha.html'
        ];

        return pages.map(page => this.getPath(page));
    }
}

// Make it globally available
window.PWAConfig = PWAConfig;
window.pwaConfig = new PWAConfig();

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAConfig;
}
