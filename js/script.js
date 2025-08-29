document.addEventListener("DOMContentLoaded", function() {
    const isPagesDirectory = window.location.pathname.includes('/pages/');
    const basePath = isPagesDirectory ? '../' : '';

    // Enhanced loading with smooth transitions
    const loadPartial = (selector, url) => {
        const container = document.querySelector(selector);
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
        }
        
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Could not load ${url}`);
                return response.text();
            })
            .then(data => {
                if (container) {
                    container.innerHTML = data;
                    // Smooth fade-in animation
                    requestAnimationFrame(() => {
                        container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        container.style.opacity = '1';
                        container.style.transform = 'translateY(0)';
                    });
                }
            });
    };

    // Enhanced page loading animation
    const showPageLoader = () => {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">Loading...</div>
            </div>
        `;
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000; transition: opacity 0.5s ease;
        `;
        document.body.appendChild(loader);
        return loader;
    };

    const hidePageLoader = (loader) => {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    };

    const loader = showPageLoader();

    Promise.all([
        loadPartial('header', `${basePath}header.html`),
        loadPartial('footer', `${basePath}footer.html`)
    ]).then(() => {
        hidePageLoader(loader);

        // --- ENHANCED NAVIGATION ---
        // Fix links with smooth hover effects
        document.querySelectorAll('[data-link="root"]').forEach(link => {
            const originalHref = link.getAttribute('href');
            if (isPagesDirectory) {
                if (originalHref.startsWith('pages/')) {
                    link.setAttribute('href', originalHref.replace('pages/', ''));
                } else {
                    link.setAttribute('href', `../${originalHref}`);
                }
            }
            
            // Add smooth hover animation
            link.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-2px)';
                link.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0)';
                link.style.boxShadow = 'none';
            });
        });

        // Enhanced Hamburger Menu with cool animations
        const hamburgerButton = document.getElementById('hamburger-button');
        const mainNav = document.getElementById('main-nav');
        if (hamburgerButton && mainNav) {
            // Add morphing animation styles
            const style = document.createElement('style');
            style.textContent = `
                .hamburger-morph { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
                .hamburger-active .hamburger-morph:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
                .hamburger-active .hamburger-morph:nth-child(2) { opacity: 0; transform: scale(0); }
                .hamburger-active .hamburger-morph:nth-child(3) { transform: rotate(-45deg) translate(7px, -6px); }
                .nav-slide-in { animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);

            hamburgerButton.addEventListener('click', () => {
                const isActive = mainNav.classList.contains('nav-active');
                
                if (!isActive) {
                    mainNav.classList.add('nav-active', 'nav-slide-in');
                    hamburgerButton.classList.add('hamburger-active');
                } else {
                    mainNav.classList.remove('nav-active', 'nav-slide-in');
                    hamburgerButton.classList.remove('hamburger-active');
                }
                
                hamburgerButton.setAttribute('aria-expanded', !isActive);
            });
        }

        // --- ENHANCED PAGE-SPECIFIC FEATURES ---
        const pagePath = window.location.pathname;

        // Enhanced FAQ with smooth accordions
        if (pagePath.includes('about.html')) {
            document.querySelectorAll('.faq-item .faq-question').forEach(button => {
                button.style.transition = 'all 0.3s ease';
                
                button.addEventListener('click', () => {
                    const answer = button.nextElementSibling;
                    const isActive = button.classList.contains('active');
                    
                    // Close all other FAQ items with animation
                    document.querySelectorAll('.faq-item .faq-question').forEach(otherButton => {
                        if (otherButton !== button) {
                            otherButton.classList.remove('active');
                            const otherAnswer = otherButton.nextElementSibling;
                            otherAnswer.style.maxHeight = null;
                            otherAnswer.style.opacity = '0';
                        }
                    });
                    
                    // Toggle current item
                    button.classList.toggle('active');
                    
                    if (!isActive) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        answer.style.opacity = '1';
                        answer.style.transform = 'translateY(0)';
                        // Add stagger animation for content
                        setTimeout(() => {
                            const content = answer.querySelector('*');
                            if (content) {
                                content.style.animation = 'fadeInUp 0.4s ease forwards';
                            }
                        }, 100);
                    } else {
                        answer.style.maxHeight = null;
                        answer.style.opacity = '0';
                        answer.style.transform = 'translateY(-10px)';
                    }
                });
            });
        }

        // Enhanced Gallery with cool filters and lightbox
        if (pagePath.includes('gallery.html')) {
            const filterButtons = document.querySelectorAll('.filter-btn');
            const galleryItems = document.querySelectorAll('.gallery-item-full');
            
            if (filterButtons.length > 0) {
                filterButtons.forEach(button => {
                    button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    
                    button.addEventListener('click', () => {
                        // Enhanced filter button animation
                        filterButtons.forEach(btn => {
                            btn.classList.remove('active');
                            btn.style.transform = 'scale(1)';
                        });
                        
                        button.classList.add('active');
                        button.style.transform = 'scale(1.1)';
                        
                        const filter = button.dataset.filter;
                        
                        // Smooth gallery item transitions
                        galleryItems.forEach((item, index) => {
                            const shouldShow = filter === 'all' || item.dataset.category.includes(filter);
                            
                            if (shouldShow) {
                                item.style.animation = `fadeInScale 0.5s ease ${index * 0.1}s forwards`;
                                item.style.display = 'block';
                            } else {
                                item.style.animation = 'fadeOutScale 0.3s ease forwards';
                                setTimeout(() => {
                                    item.style.display = 'none';
                                }, 300);
                            }
                        });
                    });
                });
            }

            // Enhanced Lightbox with smooth transitions
            const lightbox = document.getElementById('lightbox');
            if (lightbox) {
                const lightboxImg = document.getElementById('lightbox-img');
                const closeBtn = document.querySelector('.lightbox-close');
                
                // Add enhanced lightbox styles
                const lightboxStyles = document.createElement('style');
                lightboxStyles.textContent = `
                    @keyframes fadeInScale { 
                        from { opacity: 0; transform: scale(0.8); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    @keyframes fadeOutScale { 
                        from { opacity: 1; transform: scale(1); }
                        to { opacity: 0; transform: scale(0.8); }
                    }
                    .lightbox-open { animation: fadeInScale 0.3s ease forwards; }
                    .lightbox-close-anim { animation: fadeOutScale 0.3s ease forwards; }
                `;
                document.head.appendChild(lightboxStyles);

                galleryItems.forEach(item => {
                    item.style.cursor = 'pointer';
                    item.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                    
                    item.addEventListener('mouseenter', () => {
                        item.style.transform = 'scale(1.05)';
                        item.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                    });
                    
                    item.addEventListener('mouseleave', () => {
                        item.style.transform = 'scale(1)';
                        item.style.boxShadow = 'none';
                    });
                    
                    item.addEventListener('click', () => {
                        lightbox.style.display = 'block';
                        lightbox.classList.add('lightbox-open');
                        lightboxImg.src = item.querySelector('img').src;
                        lightboxImg.style.animation = 'fadeInScale 0.4s ease forwards';
                    });
                });

                const closeLightbox = () => {
                    lightbox.classList.add('lightbox-close-anim');
                    setTimeout(() => {
                        lightbox.style.display = 'none';
                        lightbox.classList.remove('lightbox-open', 'lightbox-close-anim');
                    }, 300);
                };

                if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
                lightbox.addEventListener('click', e => {
                    if (e.target === lightbox) closeLightbox();
                });
            }
        }
        
        // Enhanced Leadership Page with staggered animations
        if (pagePath.includes('leadership.html')) {
            const directorContainer = document.getElementById('director-section');
            const leadershipContainer = document.getElementById('leadership-grid-container');
            const councilContainer = document.getElementById('council-grid-container');
            const formerAdvisorsContainer = document.getElementById('former-advisors-container');
            const pastSecretariesContainer = document.getElementById('past-secretaries-container');

            if (typeof leadershipData !== 'undefined') {
                if (directorContainer && leadershipData.director) {
                    const { director } = leadershipData;
                    directorContainer.innerHTML = `<div class="director-card animate-card"><img src="${director.imageUrl}" alt="${director.name}"><div class="leadership-details"><h3>${director.name}</h3><h4>${director.title}</h4><p>"${director.message}"</p></div></div>`;
                }
                
                if (leadershipContainer) {
                    let leadershipHtml = '';
                    if (leadershipData.dosa) {
                        const { dosa } = leadershipData;
                        leadershipHtml += `<div class="leadership-card animate-card"><img src="${dosa.imageUrl}" alt="${dosa.name}"><div class="leadership-details"><h3>${dosa.name}</h3><h4>${dosa.title}</h4><p>"${dosa.message}"</p></div></div>`;
                    }
                    if (leadershipData.currentAdvisors) {
                        leadershipData.currentAdvisors.forEach(advisor => {
                            leadershipHtml += `<div class="leadership-card animate-card"><img src="${advisor.imageUrl}" alt="${advisor.name}"><div class="leadership-details"><h3>${advisor.name}</h3><h4>${advisor.title}</h4><p>"${advisor.message}"</p></div></div>`;
                        });
                    }
                    leadershipContainer.innerHTML = leadershipHtml;
                }
                
                if (formerAdvisorsContainer && leadershipData.formerAdvisors) {
                    let listHtml = '<ul class="animate-list">';
                    leadershipData.formerAdvisors.forEach(adv => listHtml += `<li class="animate-list-item">${adv.name}</li>`);
                    formerAdvisorsContainer.innerHTML = listHtml + '</ul>';
                }
            }
            
            if (councilContainer && typeof councilMembers !== 'undefined') {
                councilMembers.forEach(member => {
                    councilContainer.innerHTML += `<div class="team-member-card animate-card"><img src="${member.imageUrl}" alt="${member.name}"><h4>${member.name}</h4><p>${member.position}</p></div>`;
                });
            }
            
            if (pastSecretariesContainer && typeof pastSecretaries !== 'undefined') {
                let listHtml = '<ul class="animate-list">';
                pastSecretaries.forEach(sec => listHtml += `<li class="animate-list-item"><strong>${sec.year}:</strong> ${sec.name}</li>`);
                pastSecretariesContainer.innerHTML = listHtml + '</ul>';
            }
        }

        // Enhanced Club Pages Team Sections
        if (pagePath.includes('club-')) {
            const teamContainer = document.getElementById('team-grid-container');
            if (teamContainer && typeof clubTeams !== 'undefined') {
                const clubAcronym = pagePath.split('club-')[1].split('.html')[0];
                const team = clubTeams[clubAcronym];
                if (team && team.length > 0) {
                    team.forEach(member => {
                        teamContainer.innerHTML += `<div class="team-member-card animate-card"><img src="${member.imageUrl}" alt="${member.name}"><h4>${member.name}</h4><p>${member.position}</p></div>`;
                    });
                } else {
                    teamContainer.innerHTML = "<p class='coming-soon-text'>Team member information coming soon.</p>";
                }
            }
        }

        // Enhanced Events with timeline animations
        const upcomingEventsTimeline = document.getElementById('upcoming-events-timeline');
        if (upcomingEventsTimeline && typeof upcomingEvents !== 'undefined') {
            upcomingEvents.slice(0, 2).forEach((event, index) => {
                const [day, month] = event.date.split(' ');
                upcomingEventsTimeline.innerHTML += `<div class="event animate-timeline" style="animation-delay: ${index * 0.2}s"><div class="event-date pulse-animation"><span>${day}</span><span>${month}</span></div><div class="event-details"><h3>${event.title}</h3><p>${event.description}</p><a href="pages/events.html" class="learn-more hover-effect">Learn More</a></div></div>`;
            });
        }
        
        const upcomingEventsContainer = document.getElementById('upcoming-events-container');
        if (upcomingEventsContainer && typeof upcomingEvents !== 'undefined') {
            upcomingEvents.forEach((event, index) => {
                const [day, month] = event.date.split(' ');
                upcomingEventsContainer.innerHTML += `<div class="event-item animate-slide-in" style="animation-delay: ${index * 0.1}s"><div class="event-item-date pulse-animation"><span>${day}</span><span>${month}</span></div><div class="event-item-details"><h3>${event.title}</h3><p>${event.description}</p></div></div>`;
            });
        }
        
        const pastEventsContainer = document.getElementById('past-events-container');
        if (pastEventsContainer && typeof pastEvents !== 'undefined') {
            pastEvents.forEach((event, index) => {
                const [day, month] = event.date.split(' ');
                pastEventsContainer.innerHTML += `<div class="event-item past animate-slide-in" style="animation-delay: ${index * 0.1}s"><div class="event-item-date"><span>${day}</span><span>${month}</span></div><div class="event-item-details"><h3>${event.title}</h3><p>${event.description}</p></div></div>`;
            });
        }

        // Enhanced Updates with card animations
        const latestUpdatesGrid = document.getElementById('latest-updates-grid');
        if (latestUpdatesGrid && typeof latestUpdates !== 'undefined') {
            latestUpdates.slice(0, 3).forEach((update, index) => {
                latestUpdatesGrid.innerHTML += `<article class="update-card animate-card hover-lift" style="animation-delay: ${index * 0.2}s"><img src="${update.imageUrl}" alt="Image for ${update.title}"><div class="update-card-content"><h4>${update.title}</h4><p>${update.excerpt}</p><a href="${update.link}" class="hover-effect">Read More</a></div></article>`;
            });
        }
        
        const updatesListContainer = document.getElementById('updates-list-container');
        if (updatesListContainer && typeof latestUpdates !== 'undefined') {
            latestUpdates.forEach((update, index) => {
                updatesListContainer.innerHTML += `<article class="update-item animate-slide-in" style="animation-delay: ${index * 0.1}s"><img src="${update.imageUrl}" alt="Image for ${update.title}"><div class="update-item-content"><div class="update-item-date badge-animation">${update.date}</div><h3>${update.title}</h3><p>${update.excerpt}</p><a href="${update.link}" class="learn-more hover-effect">Read Full Article</a></div></article>`;
            });
        }

        // Enhanced Scroll-to-Reveal Animation with Intersection Observer
        const sectionsToAnimate = document.querySelectorAll('.fade-in-section');
        if (sectionsToAnimate.length > 0) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        
                        // Add staggered animation to child elements
                        const children = entry.target.querySelectorAll('.animate-card, .animate-list-item');
                        children.forEach((child, index) => {
                            setTimeout(() => {
                                child.style.animation = `slideInUp 0.6s ease ${index * 0.1}s forwards`;
                            }, index * 100);
                        });
                        
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            sectionsToAnimate.forEach(section => observer.observe(section));
        }

        // Add enhanced CSS animations
        const enhancedStyles = document.createElement('style');
        enhancedStyles.textContent = `
            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            .animate-card {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.3s ease;
            }
            
            .animate-card:hover {
                transform: translateY(-10px) !important;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            
            .animate-timeline {
                animation: slideInUp 0.6s ease forwards;
            }
            
            .animate-slide-in {
                animation: slideInUp 0.6s ease forwards;
            }
            
            .pulse-animation {
                animation: pulse 2s ease-in-out infinite;
            }
            
            .hover-lift:hover {
                transform: translateY(-5px);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .hover-effect {
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .hover-effect::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s ease;
            }
            
            .hover-effect:hover::before {
                left: 100%;
            }
            
            .badge-animation {
                animation: float 3s ease-in-out infinite;
            }
            
            .coming-soon-text {
                animation: pulse 2s ease-in-out infinite;
                color: #666;
                font-style: italic;
            }
        `;
        document.head.appendChild(enhancedStyles);

        // Enhanced page transition effects
        const addPageTransitions = () => {
            document.querySelectorAll('a[href]').forEach(link => {
                if (!link.href.startsWith('mailto:') && !link.href.startsWith('tel:') && !link.href.includes('#')) {
                    link.addEventListener('click', (e) => {
                        if (link.target !== '_blank') {
                            e.preventDefault();
                            
                            // Create transition overlay
                            const overlay = document.createElement('div');
                            overlay.style.cssText = `
                                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                                z-index: 9999; opacity: 0;
                                transition: opacity 0.5s ease;
                                display: flex; align-items: center; justify-content: center;
                                color: white; font-size: 1.2rem;
                            `;
                            overlay.innerHTML = '<div style="animation: pulse 1s ease-in-out infinite;">Loading...</div>';
                            
                            document.body.appendChild(overlay);
                            
                            requestAnimationFrame(() => {
                                overlay.style.opacity = '1';
                                setTimeout(() => {
                                    window.location.href = link.href;
                                }, 500);
                            });
                        }
                    });
                }
            });
        };
        
        addPageTransitions();

        // Performance optimization: Lazy load images
        const lazyImages = document.querySelectorAll('img[data-src]');
        if (lazyImages.length > 0) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }

        // Add smooth scrolling for anchor links
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

        console.log('🎉 Enhanced UI/UX loaded successfully!');

    }).catch(error => {
        hidePageLoader(loader);
        console.error("Error loading partials or executing scripts:", error);
    });
});
