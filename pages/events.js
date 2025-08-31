// Events page JavaScript for loading data from data.js
document.addEventListener('DOMContentLoaded', function() {
    loadUpcomingEvents();
    loadPastEvents();
    updateAnveshaSection();
});

// Load upcoming events from data.js
function loadUpcomingEvents() {
    const upcomingContainer = document.getElementById('upcoming-events-container');
    
    if (!upcomingContainer) return;
    
    // Check if upcomingEvents data is available
    if (typeof upcomingEvents === 'undefined' || !Array.isArray(upcomingEvents)) {
        upcomingContainer.innerHTML = `
            <div class="event-card">
                <p>No upcoming events data available.</p>
            </div>
        `;
        return;
    }
    
    // Clear container
    upcomingContainer.innerHTML = '';
    
    if (upcomingEvents.length === 0) {
        upcomingContainer.innerHTML = `
            <div class="event-card">
                <p>No upcoming events scheduled at the moment. Stay tuned for exciting events!</p>
            </div>
        `;
        return;
    }
    
    // Create event cards
    upcomingEvents.forEach(event => {
        const eventCard = createEventCard(event, 'upcoming');
        upcomingContainer.appendChild(eventCard);
    });
}

// Load past events from data.js
function loadPastEvents() {
    const pastContainer = document.getElementById('past-events-container');
    
    if (!pastContainer) return;
    
    // Check if pastEvents data is available
    if (typeof pastEvents === 'undefined' || !Array.isArray(pastEvents)) {
        pastContainer.innerHTML = `
            <div class="event-card">
                <p>No past events data available.</p>
            </div>
        `;
        return;
    }
    
    // Clear container
    pastContainer.innerHTML = '';
    
    if (pastEvents.length === 0) {
        pastContainer.innerHTML = `
            <div class="event-card">
                <p>No past events to display.</p>
            </div>
        `;
        return;
    }
    
    // Create event cards
    pastEvents.forEach(event => {
        const eventCard = createEventCard(event, 'past');
        pastContainer.appendChild(eventCard);
    });
}

// Create an event card element
function createEventCard(event, type) {
    const eventCard = document.createElement('div');
    eventCard.className = `event-card ${type}-event`;
    
    // Format the date
    const eventDate = event.date || 'TBA';
    const eventTitle = event.title || 'Event Title';
    const eventDescription = event.description || 'Event description not available.';
    const eventLink = event.link || '#';
    const eventLocation = event.location || '';
    const eventTime = event.time || '';
    const eventOrganizer = event.organizer || '';
    
    // Create card HTML
    eventCard.innerHTML = `
        <div class="event-header">
            <div class="event-date">
                <span class="date-text">${eventDate}</span>
            </div>
            <div class="event-status ${type}">
                ${type === 'upcoming' ? 'Upcoming' : 'Past Event'}
            </div>
        </div>
        <div class="event-content">
            <h3 class="event-title">${eventTitle}</h3>
            <p class="event-description">${eventDescription}</p>
            ${eventLocation ? `<div class="event-detail"><strong>Location:</strong> ${eventLocation}</div>` : ''}
            ${eventTime ? `<div class="event-detail"><strong>Time:</strong> ${eventTime}</div>` : ''}
            ${eventOrganizer ? `<div class="event-detail"><strong>Organized by:</strong> ${eventOrganizer}</div>` : ''}
        </div>
        <div class="event-actions">
            ${type === 'upcoming' && eventLink !== '#' ? 
                `<a href="${eventLink}" class="event-btn primary">Learn More</a>` : 
                type === 'past' && eventLink !== '#' ? 
                `<a href="${eventLink}" class="event-btn secondary">View Details</a>` : 
                ''
            }
            ${type === 'upcoming' ? `<button class="event-btn secondary" onclick="addToCalendar('${eventTitle}', '${eventDate}', '${eventDescription}')">Add to Calendar</button>` : ''}
        </div>
    `;
    
    return eventCard;
}

// Update Anvesha section with latest information
function updateAnveshaSection() {
    // Check if latestUpdates contains Anvesha information
    if (typeof latestUpdates !== 'undefined' && Array.isArray(latestUpdates)) {
        const anveshaUpdate = latestUpdates.find(update => 
            update.title && update.title.toLowerCase().includes('anvesha')
        );
        
        if (anveshaUpdate) {
            const anveshaText = document.querySelector('#anvesha-promo .anvesha-text p');
            if (anveshaText && anveshaUpdate.excerpt) {
                anveshaText.textContent = anveshaUpdate.excerpt;
            }
        }
    }
    
    // Update the Anvesha link to point to the new Anvesha page
    const anveshaLink = document.querySelector('#anvesha-promo .cta-button');
    if (anveshaLink) {
        anveshaLink.href = 'anvesha.html';
        anveshaLink.textContent = 'Visit Anvesha Page';
    }
}

// Add to calendar functionality (basic implementation)
function addToCalendar(title, date, description) {
    // Create a basic calendar event URL (Google Calendar)
    const eventTitle = encodeURIComponent(title);
    const eventDescription = encodeURIComponent(description);
    const eventDate = encodeURIComponent(date);
    
    // Simple alert for now - can be enhanced with actual calendar integration
    alert(`Calendar event would be created:\nTitle: ${title}\nDate: ${date}\nDescription: ${description}\n\nThis feature can be enhanced to integrate with actual calendar applications.`);
    
    // Uncomment below for Google Calendar integration
    // const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDescription}&dates=${eventDate}`;
    // window.open(googleCalendarUrl, '_blank');
}

// Filter events functionality (for future enhancement)
function filterEvents(category) {
    const allEvents = document.querySelectorAll('.event-card');
    
    allEvents.forEach(event => {
        if (category === 'all') {
            event.style.display = 'block';
        } else {
            // This can be enhanced when categories are added to events data
            event.style.display = 'block';
        }
    });
}

// Search events functionality (for future enhancement)
function searchEvents(searchTerm) {
    const allEvents = document.querySelectorAll('.event-card');
    const searchLower = searchTerm.toLowerCase();
    
    allEvents.forEach(event => {
        const title = event.querySelector('.event-title').textContent.toLowerCase();
        const description = event.querySelector('.event-description').textContent.toLowerCase();
        
        if (title.includes(searchLower) || description.includes(searchLower)) {
            event.style.display = 'block';
        } else {
            event.style.display = 'none';
        }
    });
}
