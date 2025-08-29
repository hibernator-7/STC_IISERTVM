document.addEventListener("DOMContentLoaded", function() {
    const isPagesDirectory = window.location.pathname.includes('/pages/');
    const basePath = isPagesDirectory ? '../' : '';

    // Function to load and process partials
    const loadPartial = (selector, url) => {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Could not load ${url}`);
                return response.text();
            })
            .then(data => {
                document.querySelector(selector).innerHTML = data;
                // Adjust links
                document.querySelectorAll(`${selector} [data-link="root"]`).forEach(link => {
                    const originalHref = link.getAttribute('href');
                    if (isPagesDirectory) {
                        // If in /pages/, need to go up one level
                        // e.g. 'pages/clubs.html' becomes 'clubs.html'
                        // e.g. 'index.html' becomes '../index.html'
                        if (originalHref.startsWith('pages/')) {
                            link.setAttribute('href', originalHref.replace('pages/', ''));
                        } else {
                            link.setAttribute('href', `../${originalHref}`);
                        }
                    }
                });
            })
            .catch(error => console.error(`Error loading partial: ${error}`));
    };

    // Load header and footer
    loadPartial('header', `${basePath}header.html`);
    loadPartial('footer', `${basePath}footer.html`);

    // Page-specific initializations
    const pagePath = window.location.pathname;

    // FAQ Page: Accordion
    if (pagePath.includes('faq.html')) {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const answer = item.querySelector('.faq-answer');
                const isActive = question.classList.contains('active');

                // Optional: Close all other answers first
                // document.querySelectorAll('.faq-question.active').forEach(q => q.classList.remove('active'));
                // document.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = null);

                if (isActive) {
                    question.classList.remove('active');
                    answer.style.maxHeight = null;
                } else {
                    question.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    }

    // Gallery Page: Filtering and Lightbox
    if (pagePath.includes('gallery.html')) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item-full');

        // Filtering logic
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    if (filter === 'all' || itemCategory.includes(filter)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // Lightbox logic
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            const lightboxImg = document.getElementById('lightbox-img');
            const closeBtn = document.querySelector('.lightbox-close');

            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    lightbox.style.display = 'block';
                    lightboxImg.src = item.querySelector('img').src;
                });
            });

            if(closeBtn) {
                closeBtn.addEventListener('click', () => {
                    lightbox.style.display = 'none';
                });
            }

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.style.display = 'none';
                }
            });
        }
    }

    // Leadership Page
    if (pagePath.includes('leadership.html')) {
        const directorContainer = document.getElementById('director-section');
        const leadershipContainer = document.getElementById('leadership-grid-container');
        const councilContainer = document.getElementById('council-grid-container');
        const formerAdvisorsContainer = document.getElementById('former-advisors-container');
        const pastSecretariesContainer = document.getElementById('past-secretaries-container');

        if (typeof leadershipData !== 'undefined') {
            // Populate Director
            if (directorContainer && leadershipData.director) {
                const { director } = leadershipData;
                directorContainer.innerHTML = `
                    <div class="director-card">
                        <img src="${director.imageUrl}" alt="${director.name}">
                        <div class="leadership-details">
                            <h3>${director.name}</h3>
                            <h4>${director.title}</h4>
                            <p>"${director.message}"</p>
                        </div>
                    </div>
                `;
            }

            // Populate Dean and Current Advisors
            if (leadershipContainer) {
                let leadershipHtml = '';
                if (leadershipData.dosa) {
                    const { dosa } = leadershipData;
                    leadershipHtml += `
                        <div class="leadership-card">
                            <img src="${dosa.imageUrl}" alt="${dosa.name}">
                            <div class="leadership-details">
                                <h3>${dosa.name}</h3>
                                <h4>${dosa.title}</h4>
                                <p>"${dosa.message}"</p>
                            </div>
                        </div>
                    `;
                }
                if (leadershipData.currentAdvisors) {
                    leadershipData.currentAdvisors.forEach(advisor => {
                        leadershipHtml += `
                        <div class="leadership-card">
                            <img src="${advisor.imageUrl}" alt="${advisor.name}">
                            <div class="leadership-details">
                                <h3>${advisor.name}</h3>
                                <h4>${advisor.title}</h4>
                                <p>"${advisor.message}"</p>
                            </div>
                        </div>
                    `;
                    });
                }
                leadershipContainer.innerHTML = leadershipHtml;
            }
            
            // Populate Former Advisors
            if (formerAdvisorsContainer && leadershipData.formerAdvisors) {
                let listHtml = '<ul>';
                leadershipData.formerAdvisors.forEach(adv => {
                    listHtml += `<li>${adv.name}</li>`;
                });
                listHtml += '</ul>';
                formerAdvisorsContainer.innerHTML = listHtml;
            }
        }

        // Populate Council Members
        if (councilContainer && typeof councilMembers !== 'undefined') {
            councilMembers.forEach(member => {
                councilContainer.innerHTML += `
                    <div class="team-member-card">
                        <img src="${member.imageUrl}" alt="${member.name}">
                        <h4>${member.name}</h4>
                        <p>${member.position}</p>
                    </div>
                `;
            });
        }

        // Populate Past Secretaries
        if (pastSecretariesContainer && typeof pastSecretaries !== 'undefined') {
            let listHtml = '<ul>';
            pastSecretaries.forEach(sec => {
                listHtml += `<li><strong>${sec.year}:</strong> ${sec.name}</li>`;
            });
            listHtml += '</ul>';
            pastSecretariesContainer.innerHTML = listHtml;
        }
    }

    // Club Pages
    if (pagePath.includes('club-')) {
        const teamContainer = document.getElementById('team-grid-container');
        if (teamContainer && typeof clubTeams !== 'undefined') {
            const urlParts = pagePath.split('/');
            const pageFile = urlParts[urlParts.length - 1]; // e.g., 'club-ccit.html'
            const clubAcronym = pageFile.replace('club-', '').replace('.html', ''); // e.g., 'ccit'

            const team = clubTeams[clubAcronym];
            if (team && team.length > 0) {
                team.forEach(member => {
                    teamContainer.innerHTML += `
                        <div class="team-member-card">
                            <img src="${member.imageUrl}" alt="${member.name}">
                            <h4>${member.name}</h4>
                            <p>${member.position}</p>
                        </div>
                    `;
                });
            } else {
                teamContainer.innerHTML = "<p>Team member information coming soon.</p>";
            }
        }
    }

    // --- DYNAMIC CONTENT LOADING ---

    // Populate Events on Homepage and Events Page
    const upcomingEventsTimeline = document.getElementById('upcoming-events-timeline');
    if (upcomingEventsTimeline && typeof upcomingEvents !== 'undefined') {
        upcomingEvents.slice(0, 2).forEach(event => { // Show max 2 on homepage
            const [day, month] = event.date.split(' ');
            upcomingEventsTimeline.innerHTML += `
                <div class="event">
                    <div class="event-date">
                        <span>${day}</span>
                        <span>${month}</span>
                    </div>
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <a href="pages/events.html" class="learn-more">Learn More</a>
                    </div>
                </div>
            `;
        });
    }

    const upcomingEventsContainer = document.getElementById('upcoming-events-container');
    if (upcomingEventsContainer && typeof upcomingEvents !== 'undefined') {
        upcomingEvents.forEach(event => {
            const [day, month] = event.date.split(' ');
            upcomingEventsContainer.innerHTML += `
                <div class="event-item">
                    <div class="event-item-date"><span>${day}</span><span>${month}</span></div>
                    <div class="event-item-details">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                    </div>
                </div>
            `;
        });
    }

    const pastEventsContainer = document.getElementById('past-events-container');
    if (pastEventsContainer && typeof pastEvents !== 'undefined') {
        pastEvents.forEach(event => {
            const [day, month] = event.date.split(' ');
            pastEventsContainer.innerHTML += `
                <div class="event-item past">
                    <div class="event-item-date"><span>${day}</span><span>${month}</span></div>
                    <div class="event-item-details">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                    </div>
                </div>
            `;
        });
    }

    // Populate Updates on Homepage and Updates Page
    const latestUpdatesGrid = document.getElementById('latest-updates-grid');
    if (latestUpdatesGrid && typeof latestUpdates !== 'undefined') {
        latestUpdates.slice(0, 3).forEach(update => { // Show max 3 on homepage
            latestUpdatesGrid.innerHTML += `
                <article class="update-card">
                    <img src="${update.imageUrl}" alt="Image for ${update.title}">
                    <div class="update-card-content">
                        <h4>${update.title}</h4>
                        <p>${update.excerpt}</p>
                        <a href="${update.link}">Read More</a>
                    </div>
                </article>
            `;
        });
    }

    const updatesListContainer = document.getElementById('updates-list-container');
    if (updatesListContainer && typeof latestUpdates !== 'undefined') {
        latestUpdates.forEach(update => {
            updatesListContainer.innerHTML += `
                <article class="update-item">
                    <img src="${update.imageUrl}" alt="Image for ${update.title}">
                    <div class="update-item-content">
                        <div class="update-item-date">${update.date}</div>
                        <h3>${update.title}</h3>
                        <p>${update.excerpt}</p>
                        <a href="${update.link}" class="learn-more">Read Full Article</a>
                    </div>
                </article>
            `;
        });
    }

    // --- SCROLL-TO-REVEAL ANIMATION ---
    const sectionsToAnimate = document.querySelectorAll('.fade-in-section');
    if (sectionsToAnimate.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Stop observing once it's visible
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        sectionsToAnimate.forEach(section => {
            observer.observe(section);
        });
    }
});
