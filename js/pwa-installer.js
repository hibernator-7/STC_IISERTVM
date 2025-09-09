// PWA Installation Manager
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstallable = false;
        this.isInstalled = false;
        this.installButton = null;
        
        this.init();
    }
    
    init() {
        // Check if app is already installed
        this.checkInstallStatus();
        
        // Initialize welcome banner
        this.initWelcomeBanner();
        
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.isInstallable = true;
            this.showWelcomeBanner();
            this.showInstallButton();
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.hideWelcomeBanner();
            this.showSuccessMessage();
        });
        
        // Check if running as PWA
        this.detectPWAMode();
        
        // Register service worker
        this.registerServiceWorker();
    }
    
    checkInstallStatus() {
        // Check if running in standalone mode (installed)
        if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('[PWA] App is running as installed PWA');
        }
    }
    
    detectPWAMode() {
        const isStandalone = window.navigator.standalone || 
                           window.matchMedia('(display-mode: standalone)').matches ||
                           window.matchMedia('(display-mode: minimal-ui)').matches;
        
        if (isStandalone) {
            document.body.classList.add('pwa-mode');
            this.addPWAStyles();
        }
    }
    
    addPWAStyles() {
        // Add specific styles for PWA mode
        const style = document.createElement('style');
        style.textContent = `
            .pwa-mode {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
            }
            
            .pwa-status-bar {
                height: env(safe-area-inset-top);
                background: var(--primary-dark, #5f1dd1);
            }
        `;
        document.head.appendChild(style);
    }
    
    initWelcomeBanner() {
        // Initialize welcome banner event listeners
        const banner = document.getElementById('pwa-welcome-banner');
        const installBtn = document.getElementById('pwa-banner-install');
        const closeBtn = document.getElementById('pwa-banner-close');
        
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.install();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideWelcomeBanner();
                // Don't show banner again for this session
                sessionStorage.setItem('pwa-banner-dismissed', 'true');
            });
        }
    }
    
    showWelcomeBanner() {
        if (this.isInstalled || sessionStorage.getItem('pwa-banner-dismissed')) {
            return;
        }
        
        const banner = document.getElementById('pwa-welcome-banner');
        if (banner) {
            banner.style.display = 'block';
            
            // Auto-hide on mobile after 10 seconds
            if (this.isMobile()) {
                setTimeout(() => {
                    if (banner.style.display !== 'none') {
                        this.hideWelcomeBanner();
                    }
                }, 10000);
            }
        }
    }
    
    hideWelcomeBanner() {
        const banner = document.getElementById('pwa-welcome-banner');
        if (banner) {
            banner.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        }
    }
    
    createInstallButton() {
        if (this.installButton) return this.installButton;
        
        const button = document.createElement('button');
        button.id = 'pwa-install-button';
        button.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Install App</span>
        `;
        button.className = 'pwa-install-btn';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .pwa-install-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--primary-dark, #5f1dd1), #7c3aed);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                font-size: 14px;
                box-shadow: 0 4px 15px rgba(95, 29, 209, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: slideInFromRight 0.5s ease-out;
            }
            
            .pwa-install-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(95, 29, 209, 0.4);
                background: linear-gradient(135deg, #7c3aed, var(--primary-dark, #5f1dd1));
            }
            
            .pwa-install-btn:active {
                transform: translateY(0);
            }
            
            .pwa-install-btn i {
                font-size: 16px;
            }
            
            @keyframes slideInFromRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .pwa-install-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .pwa-install-modal.show {
                opacity: 1;
            }
            
            .pwa-modal-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                transform: scale(0.8);
                transition: transform 0.3s ease;
            }
            
            .pwa-install-modal.show .pwa-modal-content {
                transform: scale(1);
            }
            
            .pwa-modal-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, var(--primary-dark, #5f1dd1), #7c3aed);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 30px;
            }
            
            .pwa-modal-buttons {
                display: flex;
                gap: 15px;
                margin-top: 25px;
            }
            
            .pwa-modal-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .pwa-modal-btn.primary {
                background: var(--primary-dark, #5f1dd1);
                color: white;
            }
            
            .pwa-modal-btn.primary:hover {
                background: #7c3aed;
            }
            
            .pwa-modal-btn.secondary {
                background: #f3f4f6;
                color: #374151;
            }
            
            .pwa-modal-btn.secondary:hover {
                background: #e5e7eb;
            }
            
            @media (max-width: 768px) {
                .pwa-install-btn {
                    top: 10px;
                    right: 10px;
                    padding: 10px 16px;
                    font-size: 13px;
                }
                
                .pwa-modal-content {
                    margin: 20px;
                    padding: 25px;
                }
                
                .pwa-modal-buttons {
                    flex-direction: column;
                }
            }
        `;
        
        if (!document.getElementById('pwa-install-styles')) {
            style.id = 'pwa-install-styles';
            document.head.appendChild(style);
        }
        
        button.addEventListener('click', () => this.showInstallModal());
        
        this.installButton = button;
        return button;
    }
    
    showInstallButton() {
        if (this.isInstalled || !this.isInstallable) return;
        
        // Don't show on mobile if it's likely to be prompted automatically
        if (this.isMobile() && !this.hasShownMobilePrompt) {
            this.hasShownMobilePrompt = true;
            setTimeout(() => this.showInstallButton(), 3000); // Show after 3 seconds
            return;
        }
        
        const button = this.createInstallButton();
        
        // Remove existing button
        const existingButton = document.getElementById('pwa-install-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        document.body.appendChild(button);
        
        // Auto-hide after some time on mobile
        if (this.isMobile()) {
            setTimeout(() => {
                if (button && button.parentNode) {
                    button.style.opacity = '0.7';
                }
            }, 10000);
        }
    }
    
    hideInstallButton() {
        const button = document.getElementById('pwa-install-button');
        if (button) {
            button.style.animation = 'slideOutToRight 0.5s ease-in';
            setTimeout(() => button.remove(), 500);
        }
    }
    
    showInstallModal() {
        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal';
        modal.innerHTML = `
            <div class="pwa-modal-content">
                <div class="pwa-modal-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <h3 style="margin: 0 0 15px 0; color: var(--text-primary, #1f2937);">Install STC IISER TVM</h3>
                <p style="margin: 0 0 20px 0; color: var(--text-secondary, #6b7280); line-height: 1.5;">
                    Get quick access to the Science and Technology Council website. Install it on your device for a better experience.
                </p>
                <div class="pwa-modal-buttons">
                    <button class="pwa-modal-btn secondary" onclick="this.closest('.pwa-install-modal').remove()">
                        Later
                    </button>
                    <button class="pwa-modal-btn primary" onclick="pwaInstaller.install()">
                        Install
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async install() {
        if (!this.deferredPrompt) {
            this.showManualInstallInstructions();
            return;
        }
        
        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user's response
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`[PWA] User response: ${outcome}`);
            
            if (outcome === 'accepted') {
                this.hideInstallButton();
            }
            
            // Clean up
            this.deferredPrompt = null;
            this.isInstallable = false;
            
            // Remove modal
            const modal = document.querySelector('.pwa-install-modal');
            if (modal) modal.remove();
            
        } catch (error) {
            console.error('[PWA] Install error:', error);
            this.showManualInstallInstructions();
        }
    }
    
    showManualInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                <div style="text-align: left;">
                    <p><strong>To install on iOS:</strong></p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Tap the Share button <i class="fas fa-share"></i></li>
                        <li>Scroll down and tap "Add to Home Screen"</li>
                        <li>Tap "Add" to confirm</li>
                    </ol>
                </div>
            `;
        } else if (isAndroid) {
            instructions = `
                <div style="text-align: left;">
                    <p><strong>To install on Android:</strong></p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Tap the menu button (⋮) in your browser</li>
                        <li>Tap "Add to Home screen" or "Install app"</li>
                        <li>Tap "Add" to confirm</li>
                    </ol>
                </div>
            `;
        } else {
            instructions = `
                <div style="text-align: left;">
                    <p><strong>To install on Desktop:</strong></p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Look for the install icon in your browser's address bar</li>
                        <li>Or use the browser menu and select "Install STC IISER TVM"</li>
                        <li>Click "Install" to confirm</li>
                    </ol>
                </div>
            `;
        }
        
        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal show';
        modal.innerHTML = `
            <div class="pwa-modal-content">
                <div class="pwa-modal-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <h3 style="margin: 0 0 15px 0; color: var(--text-primary, #1f2937);">Manual Installation</h3>
                ${instructions}
                <div class="pwa-modal-buttons" style="margin-top: 25px;">
                    <button class="pwa-modal-btn primary" onclick="this.closest('.pwa-install-modal').remove()" style="width: 100%;">
                        Got it!
                    </button>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.querySelector('.pwa-install-modal');
        if (existingModal) existingModal.remove();
        
        document.body.appendChild(modal);
    }
    
    showSuccessMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            animation: slideInFromRight 0.5s ease-out;
        `;
        message.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            App installed successfully!
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutToRight 0.5s ease-in';
            setTimeout(() => message.remove(), 500);
        }, 3000);
    }
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('[PWA] Service Worker registered:', registration);
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'CACHE_UPDATED') {
                        console.log('[PWA] Cache updated by service worker');
                        this.showContentUpdateNotification();
                    }
                });
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    this.showUpdateNotification();
                                }
                            }
                        });
                    }
                });
                
                // Periodic cache update when online
                this.startPeriodicCacheUpdate(registration);
                
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        }
    }
    
    startPeriodicCacheUpdate(registration) {
        // Update cache every 5 minutes when user is active
        setInterval(() => {
            if (navigator.onLine && !document.hidden && registration.active) {
                console.log('[PWA] Requesting cache update...');
                registration.active.postMessage({
                    type: 'SYNC_CACHE',
                    timestamp: Date.now()
                });
            }
        }, 5 * 60 * 1000); // 5 minutes
        
        // Also update when user becomes active
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && navigator.onLine && registration.active) {
                // Wait a bit for user to settle, then update
                setTimeout(() => {
                    console.log('[PWA] User active - requesting cache update...');
                    registration.active.postMessage({
                        type: 'SYNC_CACHE',
                        timestamp: Date.now()
                    });
                }, 2000);
            }
        });
    }
    
    showContentUpdateNotification() {
        // Only show if not on offline page
        if (window.location.pathname === '/offline.html') return;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            animation: slideInFromRight 0.5s ease-out;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-sync-alt"></i>
                <span>Content updated successfully</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            max-width: 400px;
            margin: 0 auto;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-sync-alt" style="color: var(--primary-dark, #5f1dd1);"></i>
                <div style="flex: 1;">
                    <strong>Update Available</strong>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">
                        A new version is ready to install.
                    </p>
                </div>
                <button onclick="window.location.reload()" style="
                    background: var(--primary-dark, #5f1dd1);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                ">Update</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
}

// Initialize PWA installer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaInstaller = new PWAInstaller();
    });
} else {
    window.pwaInstaller = new PWAInstaller();
}

// Add additional styles for slideOut animation
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes slideOutToRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(additionalStyles);
