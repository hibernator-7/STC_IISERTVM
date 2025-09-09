// PWA Installation Manager
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstallable = false;
        this.hasEngaged = false;
        this.userInteractions = 0;
        this.isInstalled = false;
        this.showOpenInAppOption = false;
        this.init();
    }
    
    init() {
        // Check if app is already installed
        this.checkInstallStatus();
        
        // Initialize welcome banner
        this.initWelcomeBanner();
        
        // Add debugging info
        this.debugPWAReadiness();
        
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
            localStorage.setItem('pwa-installed', 'true');
            this.isInstalled = true;
            this.hideInstallButton();
            this.hideWelcomeBanner();
            this.showSuccessMessage();
        });
        
        // Check if running as PWA
        this.detectPWAMode();
        
        // Register service worker
        this.registerServiceWorker();
        
        // Force show install button for testing (remove in production)
        setTimeout(() => {
            if (!this.isInstallable && !this.isInstalled) {
                console.warn('[PWA] Install prompt not triggered - showing manual install button');
                this.showInstallButton();
            }
        }, 3000);
        
        // Simulate user engagement for install prompt
        this.simulateUserEngagement();
    }
    
    trackUserEngagement() {
        // Track various user engagement activities
        const events = ['click', 'scroll', 'keydown', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.userInteractions++;
                this.hasEngaged = true;
                console.log(`User engagement detected: ${event} (${this.userInteractions} total interactions)`);
                
                // Try to trigger install prompt after sufficient engagement
                if (this.userInteractions >= 3 && this.deferredPrompt) {
                    setTimeout(() => this.showInstallButton(), 1000);
                }
            }, { passive: true });
        });

        // Track time spent on site
        setTimeout(() => {
            this.hasEngaged = true;
            console.log('User has spent sufficient time on site');
        }, 30000); // 30 seconds
    }
    
    checkInstallStatus() {
        // Check if running in standalone mode (installed)
        const isStandalone = window.navigator.standalone || 
                           window.matchMedia('(display-mode: standalone)').matches ||
                           window.matchMedia('(display-mode: minimal-ui)').matches;
        
        // Check if app was installed via beforeinstallprompt
        const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
        
        // Check if we're in a PWA context
        const isPWAContext = isStandalone || wasInstalled;
        
        if (isPWAContext) {
            this.isInstalled = true;
            console.log('[PWA] App is detected as installed');
            
            // If we're not in standalone mode but app is installed, user is browsing in regular browser
            if (!isStandalone && wasInstalled) {
                this.showOpenInAppOption = true;
                console.log('[PWA] App is installed but user is browsing in regular browser');
            }
        }
        
        // Also check if the app is available for installation
        this.checkInstallAvailability();
    }

    checkInstallAvailability() {
        // Check if app can be installed via getInstalledRelatedApps API
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(apps => {
                if (apps.length > 0) {
                    this.isInstalled = true;
                    this.showOpenInAppOption = true;
                    console.log('[PWA] App detected via getInstalledRelatedApps:', apps);
                }
            }).catch(err => {
                console.log('[PWA] getInstalledRelatedApps not available or failed:', err);
            });
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
    
    debugPWAReadiness() {
        console.group('🔧 PWA Installation Debug');
        
        // Browser detection
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isEdge = /Edg/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        console.log('🌐 Browser Info:', {
            userAgent: navigator.userAgent,
            isChrome, isEdge, isFirefox, isSafari,
            platform: navigator.platform,
            standalone: window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
        });
        
        // PWA Requirements Check
        console.log('📋 PWA Requirements:');
        console.log('  Service Worker:', 'serviceWorker' in navigator ? '✅' : '❌');
        console.log('  Manifest:', document.querySelector('link[rel="manifest"]') ? '✅' : '❌');
        console.log('  HTTPS:', (location.protocol === 'https:' || location.hostname === 'localhost') ? '✅' : '❌');
        console.log('  Install prompt:', this.deferredPrompt ? '✅' : '❌');
        console.log('  User engagement:', this.hasEngaged ? '✅' : '❌');
        console.log('  Interactions count:', this.userInteractions);
        console.log('  App installed:', this.isInstalled ? '✅' : '❌');
        console.log('  Show open in app option:', this.showOpenInAppOption ? '✅' : '❌');
        console.log('  localStorage pwa-installed:', localStorage.getItem('pwa-installed'));
        
        // Chrome-specific checks
        if (isChrome) {
            console.log('🎯 Chrome-specific checks:');
            console.log('  beforeinstallprompt fired:', this.deferredPrompt ? '✅' : '❌');
            console.log('  Site engagement sufficient:', this.hasEngaged ? '✅' : '❌');
            
            // Check if already installed
            if (window.matchMedia('(display-mode: standalone)').matches) {
                console.log('  App status: Already installed ✅');
            } else {
                console.log('  App status: Not installed');
            }
        }
        
        // Manual installation guidance
        if (!this.deferredPrompt && isChrome) {
            console.log('💡 Chrome manual install options:');
            console.log('  1. Look for install icon (+) in address bar');
            console.log('  2. Chrome menu → "Install STC IISER TVM..."');
            console.log('  3. Right-click page → "Install STC IISER TVM..."');
        }
        
        console.groupEnd();
    }
    
    async validateManifest(manifestUrl) {
        try {
            const response = await fetch(manifestUrl);
            const manifest = await response.json();
            
            console.log('[PWA Debug] Manifest content:', manifest);
            
            // Check required fields
            const required = ['name', 'start_url', 'display', 'icons'];
            const missing = required.filter(field => !manifest[field]);
            
            if (missing.length === 0) {
                console.log('✅ Manifest has all required fields');
            } else {
                console.warn('❌ Manifest missing fields:', missing);
            }
            
            // Check icons
            if (manifest.icons && manifest.icons.length > 0) {
                const hasLargeIcon = manifest.icons.some(icon => {
                    const sizes = icon.sizes.split('x');
                    return parseInt(sizes[0]) >= 192;
                });
                
                if (hasLargeIcon) {
                    console.log('✅ Manifest has required icon sizes');
                } else {
                    console.warn('❌ Manifest missing large icons (>=192px)');
                }
            }
            
        } catch (error) {
            console.error('[PWA Debug] Failed to validate manifest:', error);
        }
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
        
        button.addEventListener('click', () => {
            const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            
            if (this.deferredPrompt) {
                this.install();
            } else if (isChrome) {
                this.showChromeInstallGuide();
            } else {
                this.showInstallModal();
            }
        });
        
        this.installButton = button;
        return button;
    }

    createOpenInAppButton() {
        if (this.openAppButton) return this.openAppButton;
        
        const button = document.createElement('button');
        button.id = 'pwa-open-app-button';
        button.innerHTML = `
            <i class="fas fa-external-link-alt"></i>
            <span>Open in App</span>
        `;
        button.className = 'pwa-open-app-btn';
        
        // Add styles for open app button
        const style = document.createElement('style');
        style.textContent = `
            .pwa-open-app-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                font-size: 14px;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: slideInFromRight 0.5s ease-out;
            }
            
            .pwa-open-app-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                background: linear-gradient(135deg, #059669, #047857);
            }
            
            .pwa-open-app-btn:active {
                transform: translateY(0);
            }
            
            .pwa-open-app-btn i {
                font-size: 16px;
            }
            
            @media (max-width: 768px) {
                .pwa-open-app-btn {
                    top: 10px;
                    right: 10px;
                    padding: 10px 16px;
                    font-size: 13px;
                }
            }
        `;
        
        if (!document.getElementById('pwa-open-app-styles')) {
            style.id = 'pwa-open-app-styles';
            document.head.appendChild(style);
        }
        
        button.addEventListener('click', () => this.openInApp());
        
        this.openAppButton = button;
        return button;
    }

    openInApp() {
        console.log('[PWA] Attempting to open in app...');
        
        // Try to redirect to app scheme first
        const appUrl = window.location.href;
        
        // For mobile devices, try app scheme
        if (this.isMobile()) {
            // Create a hidden link that attempts to open the app
            const appLink = document.createElement('a');
            appLink.href = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.chrome.beta;action=android.intent.action.VIEW;end`;
            appLink.style.display = 'none';
            document.body.appendChild(appLink);
            appLink.click();
            document.body.removeChild(appLink);
            
            // Fallback: Show instructions after a delay
            setTimeout(() => {
                this.showOpenAppInstructions();
            }, 3000);
        } else {
            // For desktop, show instructions
            this.showOpenAppInstructions();
        }
    }

    showOpenAppInstructions() {
        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal';
        
        const isAndroid = /Android/.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const isDesktop = !this.isMobile();
        
        let instructions = '';
        
        if (isDesktop) {
            instructions = `
                <p><strong>Desktop:</strong></p>
                <p>• Look for the STC IISER TVM app in your applications/programs</p>
                <p>• Or search for "STC IISER TVM" in your system search</p>
                <p>• You can also bookmark this page for quick access</p>
            `;
        } else if (isAndroid) {
            instructions = `
                <p><strong>Android:</strong></p>
                <p>• Look for the STC IISER TVM app on your home screen</p>
                <p>• Or check your app drawer</p>
                <p>• If not found, you may need to reinstall the app</p>
            `;
        } else if (isIOS) {
            instructions = `
                <p><strong>iOS:</strong></p>
                <p>• Look for the STC IISER TVM app on your home screen</p>
                <p>• Swipe down and search for "STC IISER TVM"</p>
                <p>• If not found, you may need to re-add it to home screen</p>
            `;
        }
        
        modal.innerHTML = `
            <div class="pwa-modal-content">
                <div class="pwa-modal-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <h3>Open in Installed App</h3>
                <div style="text-align: left; margin: 20px 0;">
                    ${instructions}
                </div>
                <div class="pwa-modal-buttons">
                    <button class="pwa-modal-btn secondary" onclick="this.closest('.pwa-install-modal').remove()">Got it</button>
                    <button class="pwa-modal-btn primary" onclick="window.pwaInstaller.reinstallApp(); this.closest('.pwa-install-modal').remove();">Reinstall App</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    reinstallApp() {
        // Clear the installed flag and show install options
        localStorage.removeItem('pwa-installed');
        this.isInstalled = false;
        this.showOpenInAppOption = false;
        
        // Hide current button and show install button
        const openAppBtn = document.getElementById('pwa-open-app-button');
        if (openAppBtn) {
            openAppBtn.remove();
        }
        
        // Show install options
        this.showInstallButton();
        
        console.log('[PWA] App marked for reinstallation');
    }
    
    showInstallButton() {
        // If app is installed and user is in standalone mode, don't show any button
        if (this.isInstalled && !this.showOpenInAppOption) return;
        
        // Create appropriate button based on install status
        const button = this.showOpenInAppOption ? this.createOpenInAppButton() : this.createInstallButton();
        
        // Remove existing button
        const existingButton = document.getElementById('pwa-install-button') || document.getElementById('pwa-open-app-button');
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
        console.log('[PWA] Install attempt - deferredPrompt available:', !!this.deferredPrompt);
        
        if (!this.deferredPrompt) {
            console.log('[PWA] No deferred prompt - showing manual instructions');
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
                // Mark app as installed
                localStorage.setItem('pwa-installed', 'true');
                this.isInstalled = true;
                console.log('[PWA] App installed successfully and marked in localStorage');
                
                // Show success notification
                this.showNotification('App installed successfully! 🎉', 'success');
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
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isEdge = /Edg/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                <div style="text-align: left;">
                    <p><strong>To install on iOS Safari:</strong></p>
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
                    <p><strong>To install on Android Chrome:</strong></p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Tap the menu button (⋮) in your browser</li>
                        <li>Tap "Add to Home screen" or "Install app"</li>
                        <li>Tap "Add" to confirm</li>
                    </ol>
                </div>
            `;
        } else if (isChrome) {
            instructions = `
                <div style="text-align: left;">
                    <p><strong>To install on Chrome Desktop:</strong></p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Look for the install icon <i class="fas fa-plus"></i> in the address bar (right side)</li>
                        <li>Or click the three-dot menu → "Install STC IISER TVM..."</li>
                        <li>Click "Install" in the popup</li>
                        <li>The app will appear in your applications/Start menu</li>
                    </ol>
                    <p style="margin-top: 15px; font-size: 14px; color: #666;">
                        <strong>Note:</strong> If you don't see the install option, try refreshing the page or visiting the site more frequently.
                    </p>
                </div>
            `;
        } else if (isEdge) {
            instructions = `
                <div style="text-align: left;">
                    <p><strong>To install on Microsoft Edge:</strong></p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Click the three-dot menu (⋯) → "Apps" → "Install this site as an app"</li>
                        <li>Or look for the install icon in the address bar</li>
                        <li>Click "Install" to confirm</li>
                    </ol>
                </div>
            `;
        } else if (isFirefox) {
            instructions = `
                <div style="text-align: left;">
                    <p><strong>Firefox doesn't support PWA installation yet.</strong></p>
                    <p style="margin: 10px 0;">You can:</p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Bookmark this page for quick access</li>
                        <li>Use Chrome or Edge for full PWA experience</li>
                    </ol>
                </div>
            `;
        } else {
            instructions = `
                <div style="text-align: left;">
                    <p><strong>To install as an app:</strong></p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Look for an install option in your browser menu</li>
                        <li>Or bookmark this page for quick access</li>
                        <li>For best experience, use Chrome or Edge</li>
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
                // Unregister any existing service workers that might be causing issues
                const registrations = await navigator.serviceWorker.getRegistrations();
                const existingRegistration = registrations.find(reg => 
                    reg.scope === window.location.origin + '/' || 
                    reg.scope === window.location.origin
                );
                
                if (existingRegistration) {
                    console.log('[PWA] Found existing service worker, updating...');
                    await existingRegistration.update();
                } else {
                    console.log('[PWA] Registering new service worker...');
                }
                
                // Use PWA config to get correct paths for GitHub Pages compatibility
                const swPath = window.pwaConfig ? window.pwaConfig.getServiceWorkerPath() : './sw.js';
                const scope = window.pwaConfig ? window.pwaConfig.getScope() : '/';
                
                const registration = await navigator.serviceWorker.register(swPath, {
                    scope: scope
                });
                
                console.log('[PWA] Service Worker registered successfully:', registration);
                
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
                                } else {
                                    console.log('[PWA] Service worker installed for the first time');
                                }
                            }
                        });
                    }
                });
                
                // Periodic cache update when online
                this.startPeriodicCacheUpdate(registration);
                
                // Force update check
                if (registration.waiting) {
                    console.log('[PWA] Service worker waiting, activating...');
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
                // Don't block the app if service worker fails
                this.handleServiceWorkerError(error);
            }
        } else {
            console.warn('[PWA] Service Worker not supported in this browser');
        }
    }
    
    handleServiceWorkerError(error) {
        // Show a non-intrusive notification about SW issues
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #f59e0b;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-size: 13px;
            max-width: 300px;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Offline features unavailable. App will work normally.</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
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

    showChromeInstallGuide() {
        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal';
        modal.innerHTML = `
            <div class="pwa-modal-content">
                <div class="pwa-modal-icon">
                    <i class="fab fa-chrome"></i>
                </div>
                <h3>Install on Chrome Desktop</h3>
                <div style="text-align: left; margin: 20px 0;">
                    <p><strong>Option 1:</strong> Look for the install icon (+) in the address bar</p>
                    <p><strong>Option 2:</strong> Chrome menu (⋮) → "Install STC IISER TVM..."</p>
                    <p><strong>Option 3:</strong> Right-click this page → "Install STC IISER TVM..."</p>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                    If you don't see install options, try refreshing the page or visiting more pages on this site.
                </p>
                <div class="pwa-modal-buttons">
                    <button class="pwa-modal-btn secondary" onclick="this.closest('.pwa-install-modal').remove()">Got it</button>
                    <button class="pwa-modal-btn primary" onclick="this.closest('.pwa-install-modal').remove(); window.open('https://support.google.com/chrome/answer/9658361', '_blank')">Learn More</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    showManualInstallGuide() {
        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal';
        
        const userAgent = navigator.userAgent;
        let instructions = '';
        
        if (/Firefox/.test(userAgent)) {
            instructions = `
                <p><strong>Firefox:</strong></p>
                <p>• Look for "Install" option in address bar</p>
                <p>• Or use page menu for install options</p>
            `;
        } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
            instructions = `
                <p><strong>Safari:</strong></p>
                <p>• Tap Share button</p>
                <p>• Select "Add to Home Screen"</p>
            `;
        } else if (/Edge/.test(userAgent)) {
            instructions = `
                <p><strong>Microsoft Edge:</strong></p>
                <p>• Look for app install icon in address bar</p>
                <p>• Or use Edge menu → "Apps" → "Install this site as an app"</p>
            `;
        } else {
            instructions = `
                <p>Look for install options in your browser's menu or address bar.</p>
                <p>Most modern browsers support installing web apps.</p>
            `;
        }
        
        modal.innerHTML = `
            <div class="pwa-modal-content">
                <div class="pwa-modal-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <h3>Install as App</h3>
                <div style="text-align: left; margin: 20px 0;">
                    ${instructions}
                </div>
                <div class="pwa-modal-buttons">
                    <button class="pwa-modal-btn primary" onclick="this.closest('.pwa-install-modal').remove()">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
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
