/* ===================================
   Portfolio Website - JavaScript
   Apple/DeepMind-style Scroll Animations
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initTypingEffect();
    initTextReveal();
    initScrollAnimations();
    initStickySkills();
    initHorizontalEducation();
    initParallaxProjects();
});

/* ===================================
   Navigation
   =================================== */
function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect for nav
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ===================================
   Hero Typing Effect
   =================================== */
function initTypingEffect() {
    const typingElement = document.getElementById('typing-text');
    const phrases = [
        'AI/ML Engineering Student',
        'Machine Learning Enthusiast',
        'Data Science Explorer',
        'Future AI Innovator'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            typingSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before next phrase
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

/* ===================================
   About Section - Text Reveal
   =================================== */
function initTextReveal() {
    const textElements = document.querySelectorAll('.reveal-text');

    textElements.forEach(element => {
        // Wrap each word in a span
        const text = element.textContent;
        const words = text.split(' ');
        element.innerHTML = words.map(word =>
            `<span class="word">${word}</span>`
        ).join(' ');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const words = entry.target.querySelectorAll('.word');
                words.forEach((word, index) => {
                    setTimeout(() => {
                        word.classList.add('revealed');
                    }, index * 80); // Stagger reveal
                });
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });

    textElements.forEach(el => observer.observe(el));
}

/* ===================================
   General Scroll Animations
   =================================== */
function initScrollAnimations() {
    // Elements that fade/slide in on scroll
    const animatedElements = document.querySelectorAll(
        '.stat-item, .strength-item, .contact-card, .cert-card, .project-card'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

/* ===================================
   Skills Section - Sticky Wheel Reveal
   =================================== */
function initStickySkills() {
    const skillsSection = document.querySelector('.skills');
    const skillCategories = document.querySelectorAll('.skill-category');
    const progressBar = document.querySelector('.skills-progress .progress-bar');

    if (!skillsSection || !skillCategories.length) return;

    function updateSkillsAnimation() {
        const rect = skillsSection.getBoundingClientRect();
        const sectionHeight = skillsSection.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate scroll progress through the section
        const scrollProgress = Math.max(0, Math.min(1,
            -rect.top / (sectionHeight - viewportHeight)
        ));

        // Update progress bar
        if (progressBar) {
            progressBar.style.setProperty('--progress', `${scrollProgress * 100}%`);
        }

        // Reveal skill categories based on scroll progress
        const revealThresholds = [0.1, 0.3, 0.5, 0.7];
        skillCategories.forEach((category, index) => {
            if (scrollProgress >= revealThresholds[index]) {
                category.classList.add('visible');
            } else {
                category.classList.remove('visible');
            }
        });
    }

    window.addEventListener('scroll', updateSkillsAnimation);
    updateSkillsAnimation(); // Initial check
}

/* ===================================
   Education Section - Horizontal Scroll
   =================================== */
function initHorizontalEducation() {
    const educationSection = document.querySelector('.education');
    const educationCards = document.querySelector('.education-cards');
    const dots = document.querySelectorAll('.education-progress .dot');

    if (!educationSection || !educationCards) return;

    function updateEducationScroll() {
        const rect = educationSection.getBoundingClientRect();
        const sectionHeight = educationSection.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate scroll progress through the section
        const scrollProgress = Math.max(0, Math.min(1,
            -rect.top / (sectionHeight - viewportHeight)
        ));

        // Calculate horizontal translation
        // Move cards from right to left as user scrolls down
        const cards = educationCards.children;
        const cardWidth = cards[0]?.offsetWidth || 400;
        const gap = 48; // var(--space-xl)
        const totalWidth = (cardWidth + gap) * (cards.length - 1);

        // Calculate offset based on viewport centering
        const containerWidth = educationSection.offsetWidth;
        const startOffset = (containerWidth - cardWidth) / 2;

        const translateX = startOffset - (scrollProgress * totalWidth);
        educationCards.style.transform = `translateX(${translateX}px)`;

        // Update progress dots
        const activeIndex = Math.min(
            cards.length - 1,
            Math.floor(scrollProgress * cards.length)
        );

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    window.addEventListener('scroll', updateEducationScroll);
    updateEducationScroll(); // Initial position

    // Click on dots to navigate
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const sectionHeight = educationSection.offsetHeight;
            const viewportHeight = window.innerHeight;
            const targetProgress = index / (dots.length - 1);
            const targetScroll = educationSection.offsetTop +
                (targetProgress * (sectionHeight - viewportHeight));

            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        });
    });
}

/* ===================================
   Projects Section - Parallax Effect
   =================================== */
function initParallaxProjects() {
    const projectCards = document.querySelectorAll('.project-card[data-parallax]');

    if (!projectCards.length) return;

    function updateParallax() {
        projectCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate how far the card is from center of viewport
            const cardCenter = rect.top + rect.height / 2;
            const viewportCenter = viewportHeight / 2;
            const distanceFromCenter = cardCenter - viewportCenter;

            // Apply subtle parallax to the image/icon
            const parallaxAmount = distanceFromCenter * 0.05;
            const image = card.querySelector('.project-image');
            if (image) {
                image.style.transform = `translateY(${parallaxAmount}px)`;
            }
        });
    }

    window.addEventListener('scroll', updateParallax);
    updateParallax();
}

/* ===================================
   Smooth Scroll Polyfill & Utilities
   =================================== */

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttling to scroll handlers
window.addEventListener('load', () => {
    // Re-trigger animations in case of cache
    const allAnimated = document.querySelectorAll('.visible');
    allAnimated.forEach(el => {
        el.classList.remove('visible');
    });

    // Trigger scroll to update all animations
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 100);
});
