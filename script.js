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

        const focusTarget = target;
        const previousTabIndex = focusTarget.getAttribute('tabindex');
        if (previousTabIndex === null) {
          focusTarget.setAttribute('tabindex', '-1');
        }
        focusTarget.focus({ preventScroll: true });

        const cleanup = () => {
          if (previousTabIndex === null) {
            focusTarget.removeAttribute('tabindex');
          }
          focusTarget.removeEventListener('blur', cleanup);
        };
        focusTarget.addEventListener('blur', cleanup);

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
  // FAQ Accordion — ИСПРАВЛЕН forced reflow
  // =============================================
  const initFAQ = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    // Кешируем все высоты ДО изменения стилей (batch read)
    const heights = new Map();
    faqItems.forEach(item => {
      const content = item.querySelector('.faq-item__content');
      if (content) {
        heights.set(content, content.scrollHeight);
      }
    });

    // Теперь применяем стили (batch write)
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-item__trigger');
      const content = item.querySelector('.faq-item__content');
      if (!trigger || !content) return;

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      content.style.maxHeight = isExpanded ? `${heights.get(content)}px` : '0';

      trigger.addEventListener('click', () => {
        const isCurrentlyExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // Batch read: собираем высоту ТЕКУЩЕГО элемента до записи
        const targetHeight = content.scrollHeight;

        // Batch write: закрываем все остальные
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherTrigger = otherItem.querySelector('.faq-item__trigger');
            const otherContent = otherItem.querySelector('.faq-item__content');
            if (otherTrigger && otherContent) {
              otherTrigger.setAttribute('aria-expanded', 'false');
              otherContent.style.maxHeight = '0';
            }
          }
        });

        // Toggle current
        if (isCurrentlyExpanded) {
          trigger.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0';
        } else {
          trigger.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = `${targetHeight}px`;
        }
      });

      // Resize: используем requestAnimationFrame для безопасного чтения
      window.addEventListener('resize', debounce(() => {
        if (trigger.getAttribute('aria-expanded') === 'true') {
          requestAnimationFrame(() => {
            const newHeight = content.scrollHeight;
            content.style.maxHeight = `${newHeight}px`;
          });
        }
      }, 200));
    });
  };

  // =============================================
  // Header Scroll — оптимизирован
  // =============================================
  const initHeaderScroll = () => {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    const threshold = 50;
    let lastState = null;

    const handleScroll = throttle(() => {
      const isScrolled = window.pageYOffset > threshold;
      // Пишем в DOM только при изменении состояния
      if (isScrolled !== lastState) {
        header.style.boxShadow = isScrolled
          ? '0 2px 10px rgba(0, 0, 0, 0.05)'
          : 'none';
        lastState = isScrolled;
      }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  };

  // =============================================
  // Lazy Load Images
  // =============================================
  const initLazyLoad = () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if (!images.length) return;

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
      const currentRel = link.getAttribute('rel') || '';
      if (!currentRel.includes('noopener')) {
        link.setAttribute('rel', `${currentRel} noopener noreferrer`.trim());
      }
    });
  };

  // =============================================
  // Initialize
  // =============================================
  const init = () => {
    updateCurrentYear();
    initSmoothScroll();
    initFAQ();
    initHeaderScroll();
    initLazyLoad();
    secureExternalLinks();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
