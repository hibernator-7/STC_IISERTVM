// Hero Background Image Rotation
const heroBackgroundImages = [
    'images/gallery/Events/Anvesha/Inauguration/img1.jpg',
    'images/gallery/Events/Anvesha/Afficionados/img1.jpg',
    'images/gallery/Events/Crucible/img6.jpeg',
    'images/gallery/Events/National Science Day/img2.jpg',
    'images/gallery/Events/Panel Discussion/img1.jpg',
    'images/gallery/Events/Anvesha/BahFest/img1.jpg',
    'images/gallery/Events/Anvesha/Blender Workshop/img1.jpg'
];

let currentHeroImageIndex = 0;

function rotateHeroBackground() {
    const hero = document.getElementById('hero');
    if (hero) {
        currentHeroImageIndex = (currentHeroImageIndex + 1) % heroBackgroundImages.length;
        // Use the current image from the array instead of hardcoded path
        hero.style.setProperty('--hero-bg-image', `url('${heroBackgroundImages[currentHeroImageIndex]}')`);
    }
}

// Start hero background rotation
setInterval(rotateHeroBackground, 8000); // Change every 8 seconds

// Gallery Slider Functionality
const slider = document.getElementById('gallerySlider');
const slides = slider.querySelectorAll('.gallery-slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('galleryDots');

let currentSlide = 0;
const totalSlides = slides.length;

// Create dots
for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
}

const dots = dotsContainer.querySelectorAll('.dot');

function updateSlider() {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSlider();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Auto-play functionality
let autoPlayInterval;

function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Start auto-play when page loads
startAutoPlay();

// Pause auto-play when user hovers over gallery
const galleryContainer = document.querySelector('.gallery-container');
if (galleryContainer) {
    galleryContainer.addEventListener('mouseenter', stopAutoPlay);
    galleryContainer.addEventListener('mouseleave', startAutoPlay);
}

// Pause auto-play when user interacts with controls
prevBtn.addEventListener('click', () => {
    stopAutoPlay();
    setTimeout(startAutoPlay, 3000); // Restart after 3 seconds
});

nextBtn.addEventListener('click', () => {
    stopAutoPlay();
    setTimeout(startAutoPlay, 3000); // Restart after 3 seconds
});

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        stopAutoPlay();
        setTimeout(startAutoPlay, 3000); // Restart after 3 seconds
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
});

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

if (galleryContainer) {
    galleryContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    galleryContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections with fade-in-section class
document.querySelectorAll('.fade-in-section').forEach(section => {
    observer.observe(section);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Sample data for events and updates (replace with actual data from data.js)
function loadSampleEvents() {
    const eventsContainer = document.getElementById('upcoming-events-grid');
    const sampleEvents = [
        {
            date: 'December 15, 2024',
            title: 'Quantum Computing Workshop',
            description: 'Introduction to quantum algorithms and programming with hands-on coding sessions.',
            link: 'pages/events.html#quantum-workshop'
        },
        {
            date: 'December 20, 2024',
            title: 'AI/ML Symposium',
            description: 'Latest trends in artificial intelligence and machine learning with industry experts.',
            link: 'pages/events.html#ai-symposium'
        },
        {
            date: 'January 5, 2025',
            title: 'Anvesha 2025 Launch',
            description: 'Kickoff event for the annual science fest featuring competitions and exhibitions.',
            link: 'pages/events.html#anvesha'
        },
        {
            date: 'January 12, 2025',
            title: 'Research Presentation Day',
            description: 'Students present their ongoing research projects to faculty and peers.',
            link: 'pages/events.html#research-day'
        },
        {
            date: 'January 18, 2025',
            title: 'Innovation Challenge',
            description: 'Interdisciplinary competition for developing solutions to real-world problems.',
            link: 'pages/events.html#innovation-challenge'
        },
        {
            date: 'February 2, 2025',
            title: 'Guest Lecture Series',
            description: 'Renowned scientists and researchers share their insights and experiences.',
            link: 'pages/events.html#guest-lectures'
        }
    ];
    
    if (eventsContainer && eventsContainer.children.length === 0) {
        sampleEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'stc-event-card';
            eventCard.innerHTML = `
                <div class="stc-event-date">${event.date}</div>
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <a href="${event.link}" class="stc-event-cta" aria-label="Learn more about ${event.title}">
                    Learn More
                </a>
            `;
            eventsContainer.appendChild(eventCard);
        });
    }
}

function loadSampleUpdates() {
    const updatesContainer = document.getElementById('latest-updates-grid');
    const sampleUpdates = [
        {
            date: 'Dec 10, 2024',
            category: 'CCIT',
            title: 'Hackathon Winners Announced',
            description: 'Congratulations to Team Alpha for winning the 48-hour coding marathon with their innovative healthcare solution.'
        },
        {
            date: 'Dec 8, 2024',
            category: 'Parsec',
            title: 'Meteor Shower Observation',
            description: 'Join us for a special night sky observation session to witness the Geminids meteor shower.'
        },
        {
            date: 'Dec 5, 2024',
            category: 'Proteus',
            title: 'New Research Publication',
            description: 'Our members have published groundbreaking research on CRISPR gene editing in Nature Biotechnology.'
        }
    ];
    
    if (updatesContainer && updatesContainer.children.length === 0) {
        sampleUpdates.forEach(update => {
            const updateCard = document.createElement('div');
            updateCard.className = 'update-card';
            updateCard.innerHTML = `
                <div class="update-meta">
                    <span>${update.date}</span>
                    <span>${update.category}</span>
                </div>
                <h3>${update.title}</h3>
                <p>${update.description}</p>
            `;
            updatesContainer.appendChild(updateCard);
        });
    }
}

// Load sample data on page load
loadSampleEvents();
loadSampleUpdates();

// Add fast loading for images with fade-in effect
document.querySelectorAll('img').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease-in-out';
    
    const imageLoad = () => {
        img.style.opacity = '1';
    };
    
    if (img.complete) {
        imageLoad();
    } else {
        img.addEventListener('load', imageLoad);
        img.addEventListener('error', () => {
            img.style.opacity = '0.5';
            console.warn('Failed to load image:', img.src);
        });
    }
});

// Performance optimization: Enhanced lazy loading with fast intersection detection
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px', // Load images 50px before they come into view
        threshold: 0.1
    });
    
    document.querySelectorAll('.gallery-slide img').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add parallax effect to hero section (Optimized with requestAnimationFrame)
const hero = document.getElementById('hero');
let isTicking = false;

function parallaxHero() {
    const scrolled = window.pageYOffset;
    if (hero && scrolled < window.innerHeight) {
        // The Ken Burns effect is on the ::before pseudo-element, so transforming the hero element is okay.
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    isTicking = false;
}

window.addEventListener('scroll', () => {
    if (!isTicking) {
        window.requestAnimationFrame(parallaxHero);
        isTicking = true;
    }
}, { passive: true });
