(() => {
  'use strict';

  
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  
  const updateCurrentYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  };

  
  const initSmoothScroll = () => {
    const links = document.querySelectorAll('a[href^="#"]');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const behavior = motionQuery.matches ? 'auto' : 'smooth';
        target.scrollIntoView({ behavior, block: 'start' });

        // Update focus for accessibility
        const focusTarget = target;
        const previousTabIndex = focusTarget.getAttribute('tabindex');
        
        if (previousTabIndex === null) {
          focusTarget.setAttribute('tabindex', '-1');
        }
        
        focusTarget.focus({ preventScroll: true });
        
        // Clean up tabindex
        const cleanup = () => {
          if (previousTabIndex === null) {
            focusTarget.removeAttribute('tabindex');
          }
          focusTarget.removeEventListener('blur', cleanup);
        };
        
        focusTarget.addEventListener('blur', cleanup);

        // Close mobile nav if open
        const nav = document.querySelector('[data-nav]');
        if (nav && nav.classList.contains('is-open')) {
          const toggle = document.querySelector('[data-nav-toggle]');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('is-open');
            document.body.style.overflow = '';
          }
        }
      });
    });
  };

  // =============================================
  // FAQ Accordion
  // =============================================
  
  const initFAQ = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((item, index) => {
      const trigger = item.querySelector('.faq-item__trigger');
      const content = item.querySelector('.faq-item__content');
      
      if (!trigger || !content) return;

      // Set initial state
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      content.style.maxHeight = isExpanded ? `${content.scrollHeight}px` : '0';

      trigger.addEventListener('click', () => {
        const isCurrentlyExpanded = trigger.getAttribute('aria-expanded') === 'true';
        
        // Close all other items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            const otherTrigger = otherItem.querySelector('.faq-item__trigger');
            const otherContent = otherItem.querySelector('.faq-item__content');
            
            if (otherTrigger && otherContent) {
              otherTrigger.setAttribute('aria-expanded', 'false');
              otherContent.style.maxHeight = '0';
            }
          }
        });

        // Toggle current item
        if (isCurrentlyExpanded) {
          trigger.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0';
        } else {
          trigger.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = `${content.scrollHeight}px`;
        }
      });

      // Recalculate height on window resize
      window.addEventListener('resize', debounce(() => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          content.style.maxHeight = `${content.scrollHeight}px`;
        }
      }, 200));
    });
  };

  // =============================================
  // Header Scroll Effect
  // =============================================
  
  const initHeaderScroll = () => {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    let lastScroll = 0;
    const threshold = 50;

    const handleScroll = throttle(() => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > threshold) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
      } else {
        header.style.boxShadow = 'none';
      }

      lastScroll = currentScroll;
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
  };

  // =============================================
  // Lazy Load Images
  // =============================================
  
  const initLazyLoad = () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if (!images.length) return;

    // Native lazy loading is supported, but we can enhance with blur-up
    images.forEach(img => {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    });
  };

  // =============================================
  // External Links Security
  // =============================================
  
  const secureExternalLinks = () => {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    
    externalLinks.forEach(link => {
      // Ensure rel attributes for security
      const currentRel = link.getAttribute('rel') || '';
      if (!currentRel.includes('noopener')) {
        link.setAttribute('rel', `${currentRel} noopener noreferrer`.trim());
      }
    });
  };

  // =============================================
  // Performance Monitoring (Optional)
  // =============================================
  
  const monitorPerformance = () => {
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          // Log or send to analytics
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Silently fail if not supported
      }

      // Monitor Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          console.log('CLS:', clsValue);
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Silently fail if not supported
      }
    }
  };

  // =============================================
  // Initialize Everything
  // =============================================
  
  const init = () => {
    updateCurrentYear();
    initSmoothScroll();
    initFAQ();
    initHeaderScroll();
    initLazyLoad();
    secureExternalLinks();
    
    // Only monitor performance in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      monitorPerformance();
    }

    // Log that everything is initialized
    console.log('✨ MyGrab website initialized');
  };

  // =============================================
  // Run on DOM Ready
  // =============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
