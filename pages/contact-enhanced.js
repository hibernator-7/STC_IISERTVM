// Enhanced Contact Page JavaScript with Email Functionality

class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = document.getElementById('send-btn');
        this.statusDiv = document.getElementById('form-status');
        
        // EmailJS configuration (you'll need to set up EmailJS account)
        this.emailJSConfig = {
            serviceId: 'service_stc_contact', // Replace with your EmailJS service ID
            templateId: 'template_stc_contact', // Replace with your EmailJS template ID
            publicKey: 'your_emailjs_public_key' // Replace with your EmailJS public key
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeEmailJS();
        this.setupFormValidation();
    }
    
    initializeEmailJS() {
        // Initialize EmailJS (uncomment when you have valid credentials)
        // emailjs.init(this.emailJSConfig.publicKey);
        console.log('EmailJS initialized (demo mode)');
    }
    
    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
        
        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
        }
        
        // Dynamic subject based on category
        const categorySelect = document.getElementById('category');
        const subjectInput = document.getElementById('subject');
        if (categorySelect && subjectInput) {
            categorySelect.addEventListener('change', (e) => {
                this.updateSubjectSuggestion(e.target.value, subjectInput);
            });
        }
    }
    
    setupFormValidation() {
        // Add custom validation messages
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.showFieldError(field, this.getValidationMessage(field));
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = `${this.getFieldLabel(field)} is required`;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        
        // Phone validation (optional field)
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }
        
        // Message length validation
        if (field.name === 'message' && value.length < 10) {
            isValid = false;
            message = 'Message must be at least 10 characters long';
        }
        
        if (!isValid) {
            this.showFieldError(field, message);
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    getFieldLabel(field) {
        const label = field.parentNode.querySelector('label');
        return label ? label.textContent.replace(/^\s*\S+\s*/, '').trim() : field.name;
    }
    
    getValidationMessage(field) {
        if (field.validity.valueMissing) {
            return `${this.getFieldLabel(field)} is required`;
        }
        if (field.validity.typeMismatch) {
            return `Please enter a valid ${field.type}`;
        }
        return 'Please check your input';
    }
    
    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 10) {
            // Format as +91 XXXXX XXXXX
            if (value.startsWith('91') && value.length === 12) {
                value = `+${value.slice(0, 2)} ${value.slice(2, 7)} ${value.slice(7)}`;
            } else if (value.length === 10) {
                value = `+91 ${value.slice(0, 5)} ${value.slice(5)}`;
            }
        }
        e.target.value = value;
    }
    
    updateSubjectSuggestion(category, subjectInput) {
        const suggestions = {
            'general': 'General Inquiry - ',
            'events': 'Event/Workshop Inquiry - ',
            'clubs': 'Club Information Request - ',
            'collaboration': 'Collaboration Proposal - ',
            'feedback': 'Feedback - ',
            'technical': 'Technical Support - '
        };
        
        if (category && suggestions[category]) {
            if (!subjectInput.value || Object.values(suggestions).some(s => subjectInput.value.startsWith(s))) {
                subjectInput.value = suggestions[category];
            }
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const formData = new FormData(this.form);
        const fields = Array.from(this.form.querySelectorAll('input, textarea, select'));
        let isFormValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showStatus('Please fix the errors above', 'error');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Prepare email data
            const emailData = {
                to_name: 'STC Team',
                from_name: formData.get('name'),
                from_email: formData.get('email'),
                phone: formData.get('phone') || 'Not provided',
                category: formData.get('category'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                timestamp: new Date().toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata'
                })
            };
            
            // Send email using EmailJS (demo mode for now)
            await this.sendEmail(emailData);
            
            // Show success message
            this.showStatus('Message sent successfully! We\'ll get back to you soon.', 'success');
            this.form.reset();
            
            // Track form submission (if analytics is available)
            this.trackFormSubmission(emailData.category);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showStatus('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async sendEmail(data) {
        // Demo mode - simulate email sending
        console.log('Sending email with data:', data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Uncomment below when you have valid EmailJS credentials
        /*
        try {
            const response = await emailjs.send(
                this.emailJSConfig.serviceId,
                this.emailJSConfig.templateId,
                data
            );
            console.log('Email sent successfully:', response);
            return response;
        } catch (error) {
            console.error('EmailJS error:', error);
            throw error;
        }
        */
        
        // For demo, always succeed
        return { status: 200, text: 'Demo mode - email would be sent' };
    }
    
    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<div class="loading"></div> Sending...';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
    }
    
    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `form-status ${type}`;
        this.statusDiv.style.display = 'block';
        
        // Hide status after 5 seconds for success, 8 seconds for error
        const timeout = type === 'success' ? 5000 : 8000;
        setTimeout(() => {
            this.statusDiv.style.display = 'none';
        }, timeout);
        
        // Scroll to status message
        this.statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    trackFormSubmission(category) {
        // Track form submission with analytics (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Contact',
                event_label: category,
                value: 1
            });
        }
    }
}

// Animation and Interaction Enhancements
class ContactPageEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupCopyToClipboard();
        this.setupSocialLinkTracking();
    }
    
    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Animate contact cards
        const animatedElements = document.querySelectorAll('.contact-card, .social-link, .address-card');
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }
    
    setupHoverEffects() {
        // Enhanced hover effects for contact cards
        const contactCards = document.querySelectorAll('.contact-card');
        contactCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    setupCopyToClipboard() {
        // Add copy-to-clipboard functionality for email addresses and phone numbers
        const contactLinks = document.querySelectorAll('.contact-link');
        contactLinks.forEach(link => {
            if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const text = link.href.startsWith('mailto:') 
                        ? link.href.replace('mailto:', '')
                        : link.href.replace('tel:', '');
                    
                    this.copyToClipboard(text, link);
                });
            }
        });
    }
    
    async copyToClipboard(text, element) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess(element);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text, element);
        }
    }
    
    fallbackCopyToClipboard(text, element) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess(element);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    showCopySuccess(element) {
        const originalText = element.textContent;
        element.textContent = 'Copied!';
        element.style.color = '#10b981';
        
        setTimeout(() => {
            element.textContent = originalText;
            element.style.color = '';
        }, 2000);
    }
    
    setupSocialLinkTracking() {
        // Track social media link clicks
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = link.classList[1]; // Gets the platform class (instagram, linkedin, etc.)
                
                // Track with analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'social_link_click', {
                        event_category: 'Social Media',
                        event_label: platform,
                        value: 1
                    });
                }
                
                console.log(`Social link clicked: ${platform}`);
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the contact page
    if (document.getElementById('contact-form')) {
        new ContactFormManager();
        new ContactPageEnhancements();
        
        console.log('Contact page enhancements loaded');
    }
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContactFormManager, ContactPageEnhancements };
}
