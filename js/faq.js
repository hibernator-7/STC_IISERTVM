// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Toggle active class on the clicked question
            this.classList.toggle('active');
            
            // Toggle active class on the parent faq-item
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');

            // Toggle active class on the answer
            const answer = this.nextElementSibling;
            if (answer) {
                answer.classList.toggle('active');
            }
            
            // Close other FAQ items
            const allFaqItems = document.querySelectorAll('.faq-item');
            allFaqItems.forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.faq-question').classList.remove('active');
                    const answer = item.querySelector('.faq-answer');
                    if (answer) {
                        answer.classList.remove('active');
                    }
                }
            });
        });
    });
});