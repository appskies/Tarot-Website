/**
 * Zodya Tarot - Main JavaScript
 * Handles animations, scroll effects, and interactivity
 */

// Debug log
console.log('Zodya Tarot JS loaded');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing...');

    // Initialize all features
    initNavbar();
    initScrollReveal();
    initSmoothScroll();
    initParallaxEffect();
    initCardHoverEffect();
});

/**
 * Navigation Bar functionality
 * Handles scroll effects and mobile menu toggle
 */
function initNavbar() {
    console.log('Initializing navbar...');

    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const navbarLinks = document.querySelectorAll('.navbar-link');

    // Scroll effect for navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');
            document.body.style.overflow = navbarMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navbarLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbar.contains(e.target) && navbarMenu.classList.contains('active')) {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    console.log('Navbar initialized');
}

/**
 * Scroll Reveal Animation
 * Reveals elements as they come into viewport
 */
function initScrollReveal() {
    console.log('Initializing scroll reveal...');

    // Elements to reveal on scroll
    const revealElements = document.querySelectorAll(
        '.feature-card, .benefit-card, .testimonial-card, .showcase-item, .rating-card'
    );

    // Add reveal class to elements
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });

    // Intersection Observer options
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Create observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing after reveal
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all reveal elements
    revealElements.forEach(el => {
        observer.observe(el);
    });

    console.log(`Observing ${revealElements.length} elements for reveal`);
}

/**
 * Smooth Scroll for anchor links
 */
function initSmoothScroll() {
    console.log('Initializing smooth scroll...');

    const links = document.querySelectorAll('a[href^="#"]');
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 70;

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Scroll to top if just "#"
            if (href === '#') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    console.log(`Added smooth scroll to ${links.length} links`);
}

/**
 * Parallax effect for hero section
 */
function initParallaxEffect() {
    console.log('Initializing parallax effect...');

    const hero = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image');

    if (!hero || !heroImage) {
        console.log('Hero elements not found, skipping parallax');
        return;
    }

    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const scrolled = window.pageYOffset;
                const heroHeight = hero.offsetHeight;

                // Only apply parallax within hero section
                if (scrolled < heroHeight) {
                    const parallaxValue = scrolled * 0.3;
                    heroImage.style.transform = `translateY(${parallaxValue}px)`;
                }

                ticking = false;
            });

            ticking = true;
        }
    });

    console.log('Parallax effect initialized');
}

/**
 * Enhanced hover effects for cards
 */
function initCardHoverEffect() {
    console.log('Initializing card hover effects...');

    const cards = document.querySelectorAll('.feature-card, .benefit-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    console.log(`Added hover effects to ${cards.length} cards`);
}

/**
 * Add loading animation class when page loads
 */
window.addEventListener('load', function() {
    console.log('Window loaded - Adding page-loaded class');
    document.body.classList.add('page-loaded');

    // Trigger initial reveal for elements already in viewport
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('active');
        }
    });
});

/**
 * Mobile menu toggle (if needed in future)
 */
function toggleMobileMenu() {
    const nav = document.querySelector('.nav-menu');
    if (nav) {
        nav.classList.toggle('active');
    }
}

/**
 * Utility: Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
