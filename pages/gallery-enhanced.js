// Enhanced Gallery Script with Image Optimization
class GalleryManager {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item-full');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        this.lightboxClose = document.querySelector('.lightbox-close');
        this.loadedImages = new Set();
        this.imageObserver = null;
        
        this.init();
    }
    
    init() {
        console.log('Gallery Manager initialized');
        console.log('Filter buttons:', this.filterButtons.length);
        console.log('Gallery items:', this.galleryItems.length);
        
        this.setupFilterButtons();
        this.setupLightbox();
        this.setupImageOptimization();
        this.preloadVisibleImages();
    }
    
    setupFilterButtons() {
        if (this.filterButtons.length === 0) return;
        
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.dataset.filter;
                console.log('Filter clicked:', filter);
                
                this.setActiveButton(button);
                this.filterItems(filter);
            });
        });
    }
    
    setActiveButton(activeButton) {
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
    }
    
    filterItems(filter) {
        let visibleCount = 0;
        
        this.galleryItems.forEach((item, index) => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            // Add staggered animation delay
            const delay = index * 50;
            
            setTimeout(() => {
                if (shouldShow) {
                    item.style.display = 'block';
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8) translateY(20px)';
                    
                    // Trigger reflow
                    item.offsetHeight;
                    
                    item.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1) translateY(0)';
                    
                    visibleCount++;
                    
                    // Preload this image if not already loaded
                    this.preloadImage(item.querySelector('img'));
                } else {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8) translateY(-20px)';
                    
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            }, delay);
        });
        
        console.log(`Filtering completed for: ${filter}, visible items: ${visibleCount}`);
    }
    
    setupLightbox() {
        if (!this.lightbox) return;
        
        this.galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) {
                    this.openLightbox(img.src, img.alt);
                }
            });
        });
        
        if (this.lightboxClose) {
            this.lightboxClose.addEventListener('click', () => {
                this.closeLightbox();
            });
        }
        
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.style.display === 'block') {
                this.closeLightbox();
            }
        });
    }
    
    openLightbox(src, alt) {
        // Show loading state
        this.lightboxImg.style.opacity = '0';
        this.lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Create high-resolution image
        const highResImg = new Image();
        
        highResImg.onload = () => {
            this.lightboxImg.src = highResImg.src;
            this.lightboxImg.alt = alt;
            this.lightboxImg.style.transition = 'opacity 0.3s ease';
            this.lightboxImg.style.opacity = '1';
        };
        
        highResImg.onerror = () => {
            // Fallback to original image
            this.lightboxImg.src = src;
            this.lightboxImg.alt = alt;
            this.lightboxImg.style.opacity = '1';
        };
        
        // Try to load higher resolution version first
        const highResSrc = this.getHighResolutionSrc(src);
        highResImg.src = highResSrc;
    }
    
    closeLightbox() {
        this.lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.lightboxImg.src = '';
    }
    
    getHighResolutionSrc(src) {
        // Try to get higher resolution version
        // This is a simple approach - you might want to implement a more sophisticated system
        return src.replace('-thumb', '').replace('-small', '').replace('-medium', '');
    }
    
    setupImageOptimization() {
        // Create intersection observer for lazy loading
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.optimizeImage(img);
                    this.imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Observe all images
        this.galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                this.imageObserver.observe(img);
            }
        });
    }
    
    optimizeImage(img) {
        if (this.loadedImages.has(img.src)) return;
        
        const originalSrc = img.src;
        
        // Add loading placeholder
        img.style.filter = 'blur(5px)';
        img.style.transition = 'filter 0.3s ease';
        
        // Create optimized image
        const optimizedImg = new Image();
        
        optimizedImg.onload = () => {
            img.src = optimizedImg.src;
            img.style.filter = 'none';
            this.loadedImages.add(img.src);
        };
        
        optimizedImg.onerror = () => {
            // Fallback to original
            img.style.filter = 'none';
            this.loadedImages.add(originalSrc);
        };
        
        // Load optimized version
        optimizedImg.src = this.getOptimizedSrc(originalSrc);
    }
    
    getOptimizedSrc(src) {
        // For laptop optimization, we want medium-sized images
        const isLaptop = window.innerWidth >= 1024 && window.innerWidth <= 1920;
        
        if (isLaptop) {
            // Use medium resolution for laptops
            return src.replace(/\.(jpg|jpeg|png)$/i, '-medium.$1');
        }
        
        return src;
    }
    
    preloadImage(img) {
        if (!img || this.loadedImages.has(img.src)) return;
        
        const preloadImg = new Image();
        preloadImg.onload = () => {
            this.loadedImages.add(img.src);
        };
        preloadImg.src = img.src;
    }
    
    preloadVisibleImages() {
        // Preload images that are currently visible or will be visible soon
        const visibleItems = Array.from(this.galleryItems).filter(item => {
            const rect = item.getBoundingClientRect();
            return rect.top < window.innerHeight + 200; // 200px buffer
        });
        
        visibleItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                this.preloadImage(img);
            }
        });
    }
    
    // Public method to manually trigger optimization
    optimizeAllImages() {
        this.galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                this.optimizeImage(img);
            }
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on gallery page
    if (window.location.pathname.includes('gallery.html')) {
        window.galleryManager = new GalleryManager();
    }
});

// Progressive Enhancement: Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('gallery.html') && !window.galleryManager) {
            window.galleryManager = new GalleryManager();
        }
    });
} else {
    if (window.location.pathname.includes('gallery.html') && !window.galleryManager) {
        window.galleryManager = new GalleryManager();
    }
}
