// MyGrab 4.0 - Enhanced JavaScript
// ===================================

(function() {
    'use strict';
    
    // Mobile Navigation Toggle
    const initMobileNav = () => {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenuWrapper = document.querySelector('.nav-menu-wrapper');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (!navToggle || !navMenuWrapper) return;
        
        const closeMenu = () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenuWrapper.classList.remove('active');
            document.body.style.overflow = '';
        };
        
        const openMenu = () => {
            navToggle.setAttribute('aria-expanded', 'true');
            navMenuWrapper.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            isExpanded ? closeMenu() : openMenu();
        });
        
        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
        
        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenuWrapper.classList.contains('active')) {
                closeMenu();
                navToggle.focus();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenuWrapper.classList.contains('active') && 
                !navMenuWrapper.contains(e.target) && 
                !navToggle.contains(e.target)) {
                closeMenu();
            }
        });
        
        // Close menu on window resize to desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 768 && navMenuWrapper.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });
    };
    
    // FAQ Accordion
    const initFAQ = () => {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) return;
            
            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                
                // Toggle current FAQ
                question.setAttribute('aria-expanded', !isExpanded);
                answer.hidden = isExpanded;
                
                // Smooth scroll to opened FAQ if on mobile
                if (!isExpanded && window.innerWidth < 768) {
                    setTimeout(() => {
                        question.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'nearest' 
                        });
                    }, 100);
                }
            });
        });
    };
    
    // Smooth Scroll for Anchor Links
    const initSmoothScroll = () => {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip if href is just "#"
                if (href === '#' || href === '#!') return;
                
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    // Different header offset for mobile and desktop
                    const headerOffset = window.innerWidth < 768 ? 70 : 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                    
                    // Focus target for accessibility
                    target.focus({ preventScroll: true });
                    if (!target.hasAttribute('tabindex')) {
                        target.setAttribute('tabindex', '-1');
                    }
                }
            });
        });
    };
    
    // Intersection Observer for Scroll Animations
    const initScrollAnimations = () => {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return;
        
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) return;
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements
        const animateElements = document.querySelectorAll('.feature-card, .step, .pricing-card');
        animateElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    };
    
    // Header scroll effect
    const initHeaderScroll = () => {
        const header = document.querySelector('.header');
        if (!header) return;
        
        let lastScroll = 0;
        let ticking = false;
        
        const updateHeader = (currentScroll) => {
            if (currentScroll > 50) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
            
            lastScroll = currentScroll;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateHeader(currentScroll);
                });
                ticking = true;
            }
        }, { passive: true });
    };
    
    // Lazy load images
    const initLazyLoad = () => {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        } else {
            // Fallback for browsers that don't support native lazy loading
            if (!('IntersectionObserver' in window)) return;
            
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    };
    
    // Touch device detection and optimization
    const initTouchOptimizations = () => {
        // Add touch class to body for CSS targeting
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.body.classList.add('touch-device');
        }
        
        // Prevent double-tap zoom on buttons
        const buttons = document.querySelectorAll('.btn, button');
        buttons.forEach(button => {
            button.addEventListener('touchend', (e) => {
                // Prevent default only for actual touch events
                if (e.cancelable) {
                    e.preventDefault();
                    button.click();
                }
            }, { passive: false });
        });
    };
    
    // Handle viewport height on mobile (for fixed nav issues)
    const initViewportHeight = () => {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVh();
        
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setVh, 100);
        });
    };
    
    // Enhance accessibility
    const initAccessibility = () => {
        // Add keyboard navigation for custom interactive elements
        const interactiveElements = document.querySelectorAll('[role="button"]:not(button)');
        
        interactiveElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    };
    
    // Performance monitoring (optional, for debugging)
    const logPerformance = () => {
        if ('performance' in window && 'getEntriesByType' in window.performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const connectTime = perfData.responseEnd - perfData.requestStart;
                    
                    console.log('Performance Metrics:');
                    console.log(`Page Load Time: ${pageLoadTime}ms`);
                    console.log(`Server Response Time: ${connectTime}ms`);
                }, 0);
            });
        }
    };
    
    // Initialize all modules when DOM is ready
    const init = () => {
        initMobileNav();
        initFAQ();
        initSmoothScroll();
        initScrollAnimations();
        initHeaderScroll();
        initLazyLoad();
        initTouchOptimizations();
        initViewportHeight();
        initAccessibility();
        
        // Only log performance in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            logPerformance();
        }
        
        console.log('✅ MyGrab 4.0 initialized successfully');
    };
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose debug info in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.MyGrab = {
            version: '4.0',
            mobile: window.innerWidth < 768,
            touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }
    
})();