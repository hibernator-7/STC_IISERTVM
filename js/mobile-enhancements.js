/**
 * Mobile enhancements for STC IISER TVM website
 * Adds touch-friendly interactions and improves mobile menu functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Enhanced touch interactions for mobile
    const addTouchInteractions = () => {
        // Add touch feedback to buttons and interactive elements
        const interactiveElements = document.querySelectorAll(
            '.dropbtn, .nav-links a, .filter-button, .team-member-card, .gallery-grid-small img, .event-list li'
        );
        
        interactiveElements.forEach(element => {
            // Add active state on touch
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, {passive: true});
            
            // Remove active state after touch
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            }, {passive: true});
            
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            }, {passive: true});
        });
        
        // Improve scrolling experience on mobile
        document.querySelectorAll('.team-grid, .gallery-grid-small, .event-list').forEach(container => {
            if (window.innerWidth <= 768) {
                container.style.webkitOverflowScrolling = 'touch'; // Enable momentum scrolling on iOS
            }
        });
    };
    
    // Enhance mobile menu functionality
    const enhanceMobileMenu = () => {
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            const navLinks = document.querySelector('.nav-links');
            const hamburger = document.querySelector('.hamburger');
            
            if (navLinks && hamburger && window.innerWidth <= 992) {
                if (navLinks.classList.contains('active') || navLinks.classList.contains('nav-active')) {
                    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                        navLinks.classList.remove('active');
                        navLinks.classList.remove('nav-active');
                        
                        // Update aria-expanded attribute if it exists
                        if (hamburger.hasAttribute('aria-expanded')) {
                            hamburger.setAttribute('aria-expanded', 'false');
                        }
                    }
                }
            }
        });
        
        // Add swipe to close for mobile menu
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            let touchStartX = 0;
            let touchEndX = 0;
            
            navLinks.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, {passive: true});
            
            navLinks.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, {passive: true});
            
            const handleSwipe = () => {
                // Detect left swipe (close menu)
                if (touchEndX < touchStartX - 50) {
                    navLinks.classList.remove('active');
                    navLinks.classList.remove('nav-active');
                    
                    // Update hamburger button state
                    const hamburger = document.querySelector('.hamburger');
                    if (hamburger && hamburger.hasAttribute('aria-expanded')) {
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                }
            };
        }
    };
    
    // Initialize mobile enhancements
    addTouchInteractions();
    enhanceMobileMenu();
    
    // Re-initialize on window resize
    window.addEventListener('resize', function() {
        addTouchInteractions();
    });
});