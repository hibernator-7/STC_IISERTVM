// PWA Validation Script for GitHub Pages
class PWAValidator {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.successes = [];
    }

    async validatePWA() {
        console.group('🔍 PWA Validation for GitHub Pages');
        
        await this.validateManifest();
        await this.validateServiceWorker();
        await this.validateIcons();
        this.validatePaths();
        this.validateHTTPS();
        
        this.displayResults();
        console.groupEnd();
        
        return {
            issues: this.issues,
            warnings: this.warnings,
            successes: this.successes,
            isValid: this.issues.length === 0
        };
    }

    async validateManifest() {
        try {
            const manifestPath = window.pwaConfig ? window.pwaConfig.getManifestPath() : './site.webmanifest';
            const response = await fetch(manifestPath);
            
            if (!response.ok) {
                this.issues.push(`Manifest not accessible: ${response.status}`);
                return;
            }

            const manifest = await response.json();
            
            // Check required fields
            const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
            const missingFields = requiredFields.filter(field => !manifest[field]);
            
            if (missingFields.length > 0) {
                this.issues.push(`Manifest missing required fields: ${missingFields.join(', ')}`);
            } else {
                this.successes.push('Manifest has all required fields');
            }

            // Check start_url and scope for GitHub Pages compatibility
            if (manifest.start_url && manifest.start_url.startsWith('/') && manifest.start_url !== './') {
                this.warnings.push('Manifest start_url uses absolute path - may cause issues on GitHub Pages');
            }

            if (manifest.scope && manifest.scope.startsWith('/') && manifest.scope !== './') {
                this.warnings.push('Manifest scope uses absolute path - may cause issues on GitHub Pages');
            }

            // Check icons
            if (manifest.icons && manifest.icons.length > 0) {
                const hasRequiredSizes = manifest.icons.some(icon => 
                    icon.sizes === '192x192' || icon.sizes === '512x512'
                );
                
                if (hasRequiredSizes) {
                    this.successes.push('Manifest has required icon sizes');
                } else {
                    this.warnings.push('Manifest missing recommended icon sizes (192x192, 512x512)');
                }

                // Check icon paths
                const absoluteIconPaths = manifest.icons.filter(icon => 
                    icon.src.startsWith('/')
                );
                
                if (absoluteIconPaths.length > 0) {
                    this.warnings.push(`${absoluteIconPaths.length} icons use absolute paths - may fail on GitHub Pages`);
                }
            }

        } catch (error) {
            this.issues.push(`Manifest validation failed: ${error.message}`);
        }
    }

    async validateServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            this.issues.push('Service Worker not supported in this browser');
            return;
        }

        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            if (registrations.length === 0) {
                this.warnings.push('No Service Worker registered yet');
                return;
            }

            const registration = registrations[0];
            
            if (registration.active) {
                this.successes.push('Service Worker is active');
                
                // Check if SW is controlling the page
                if (navigator.serviceWorker.controller) {
                    this.successes.push('Service Worker is controlling this page');
                } else {
                    this.warnings.push('Service Worker not yet controlling this page (refresh may be needed)');
                }
            } else {
                this.warnings.push('Service Worker registered but not active');
            }

        } catch (error) {
            this.issues.push(`Service Worker validation failed: ${error.message}`);
        }
    }

    async validateIcons() {
        const iconSizes = ['192x192', '512x512'];
        const iconPromises = iconSizes.map(async (size) => {
            try {
                const iconPath = window.pwaConfig ? 
                    window.pwaConfig.getPath(`android-chrome-${size}.png`) : 
                    `./android-chrome-${size}.png`;
                    
                const response = await fetch(iconPath, { method: 'HEAD' });
                
                if (response.ok) {
                    this.successes.push(`Icon ${size} is accessible`);
                } else {
                    this.issues.push(`Icon ${size} not accessible: ${response.status}`);
                }
            } catch (error) {
                this.issues.push(`Icon ${size} validation failed: ${error.message}`);
            }
        });

        await Promise.all(iconPromises);
    }

    validatePaths() {
        const basePath = window.pwaConfig ? window.pwaConfig.basePath : '';
        
        if (window.location.pathname !== '/' && !basePath) {
            this.warnings.push('Site may be in subdirectory but PWA config not detecting base path');
        }

        if (basePath) {
            this.successes.push(`PWA config detected base path: ${basePath}`);
        } else {
            this.successes.push('PWA config using root path');
        }
    }

    validateHTTPS() {
        if (location.protocol === 'https:') {
            this.successes.push('Site served over HTTPS');
        } else if (location.hostname === 'localhost') {
            this.successes.push('Site on localhost (HTTPS not required)');
        } else {
            this.issues.push('Site not served over HTTPS (required for PWA in production)');
        }
    }

    displayResults() {
        console.log('\n📊 PWA Validation Results:');
        
        if (this.successes.length > 0) {
            console.log('\n✅ Successes:');
            this.successes.forEach(success => console.log(`  ✅ ${success}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            this.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
        }

        if (this.issues.length > 0) {
            console.log('\n❌ Issues:');
            this.issues.forEach(issue => console.log(`  ❌ ${issue}`));
        }

        console.log(`\n📈 Overall Status: ${this.issues.length === 0 ? '✅ Valid' : '❌ Has Issues'}`);
        console.log(`   Issues: ${this.issues.length}, Warnings: ${this.warnings.length}, Successes: ${this.successes.length}`);
    }

    // Generate GitHub Pages deployment checklist
    generateDeploymentChecklist() {
        const checklist = {
            'Repository Settings': [
                'Repository is public (or GitHub Pro/Team for private)',
                'GitHub Pages is enabled in repository settings',
                'Source is set to correct branch (main/gh-pages)',
                'Custom domain configured (if using)'
            ],
            'PWA Configuration': [
                'Manifest uses relative paths (./)',
                'Service Worker registration uses relative paths',
                'All asset URLs use relative paths',
                'Base path detection is working',
                'Icons are accessible and properly sized'
            ],
            'Deployment Files': [
                'All PWA files are in repository root or configured path',
                'site.webmanifest is in the correct location',
                'sw.js is in the correct location',
                'All icon files are present',
                'offline.html uses relative paths'
            ],
            'Testing': [
                'Test PWA on actual GitHub Pages URL',
                'Verify service worker registration',
                'Test offline functionality',
                'Test install prompt',
                'Test on multiple devices/browsers'
            ]
        };

        console.group('📋 GitHub Pages Deployment Checklist');
        Object.entries(checklist).forEach(([category, items]) => {
            console.log(`\n${category}:`);
            items.forEach(item => console.log(`  ☐ ${item}`));
        });
        console.groupEnd();

        return checklist;
    }
}

// Make available globally
window.PWAValidator = PWAValidator;

// Auto-run validation if not in debug mode
if (!window.location.pathname.includes('pwa-debug')) {
    document.addEventListener('DOMContentLoaded', async () => {
        // Wait a bit for PWA config to load
        setTimeout(async () => {
            const validator = new PWAValidator();
            await validator.validatePWA();
        }, 2000);
    });
}
