(() => {
  'use strict';

  const setCurrentYear = () => {
    const yearTarget = document.getElementById('year');
    if (yearTarget) {
      yearTarget.textContent = new Date().getFullYear();
    }
  };

  const initFAQ = () => {
    const items = document.querySelectorAll('.faq-accordion-item');
    if (!items.length) {
      return;
    }

    const closeAll = () => {
      items.forEach((item) => {
        const btn = item.querySelector('button');
        const panelId = btn?.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!btn || !panel) {
          return;
        }
        btn.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0px';
        panel.setAttribute('aria-hidden', 'true');
      });
    };

    const openItem = (item) => {
      const btn = item.querySelector('button');
      const panelId = btn?.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!btn || !panel) {
        return;
      }
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    };

    items.forEach((item) => {
      const btn = item.querySelector('button');
      const panelId = btn?.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!btn || !panel) {
        return;
      }
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        closeAll();
        if (!expanded) {
          openItem(item);
        }
      });
    });

    closeAll();
    const initiallyOpen = Array.from(items).find((item) => {
      const btn = item.querySelector('button');
      return btn?.getAttribute('aria-expanded') === 'true';
    });
    if (initiallyOpen) {
      openItem(initiallyOpen);
    } else {
      openItem(items[0]);
    }

    let resizeTimeout;
    const recalcHeight = () => {
      const currentBtn = document.querySelector('.faq-accordion-item button[aria-expanded="true"]');
      const panelId = currentBtn?.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) {
        return;
      }
      panel.style.maxHeight = panel.scrollHeight + 'px';
    };

    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(recalcHeight, 150);
    });
  };

  const initSmoothScroll = () => {
    const triggers = document.querySelectorAll('[data-scroll-to]');
    if (!triggers.length) {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const focusTarget = (target) => {
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const previousTabIndex = target.getAttribute('tabindex');
      if (previousTabIndex === null) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
      const cleanup = () => {
        if (previousTabIndex === null) {
          target.removeAttribute('tabindex');
        }
        target.removeEventListener('blur', cleanup);
      };
      target.addEventListener('blur', cleanup);
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        const selector = trigger.getAttribute('data-scroll-to');
        if (!selector) {
          return;
        }
        const target = document.querySelector(selector);
        if (!target) {
          return;
        }
        event.preventDefault();
        const behavior = motionQuery.matches ? 'auto' : 'smooth';
        target.scrollIntoView({ behavior, block: 'start' });
        if (motionQuery.matches) {
          focusTarget(target);
        } else {
          window.setTimeout(() => focusTarget(target), 400);
        }
      });
    });
  };

  const initLottie = () => {
    const player = document.querySelector('[data-lottie]');
    if (!player) {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;

    const pauseAnimation = () => {
      if (typeof player.pause === 'function') {
        player.pause();
      }
    };

    const playAnimation = () => {
      if (motionQuery.matches) {
        pauseAnimation();
        return;
      }
      if (typeof player.play === 'function') {
        player.play();
      }
    };

    const applyMotionPreference = () => {
      if (motionQuery.matches) {
        player.setAttribute('aria-hidden', 'true');
        pauseAnimation();
      } else {
        player.removeAttribute('aria-hidden');
      }
    };

    const observe = () => {
      if (motionQuery.matches) {
        if (observer) {
          observer.disconnect();
        }
        return;
      }

      if (!('IntersectionObserver' in window)) {
        playAnimation();
        return;
      }

      if (observer) {
        observer.disconnect();
      }

      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playAnimation();
              obs.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );

      observer.observe(player);
    };

    const whenDefined =
      typeof customElements !== 'undefined' && typeof customElements.whenDefined === 'function'
        ? customElements.whenDefined('lottie-player')
        : Promise.resolve();

    whenDefined.then(() => {
      const setup = () => {
        applyMotionPreference();
        observe();
      };

      if (typeof player.addEventListener === 'function') {
        let initialized = false;
        const once = () => {
          if (initialized) {
            return;
          }
          initialized = true;
          setup();
        };
        player.addEventListener('ready', once, { once: true });
        player.addEventListener('load', once, { once: true });
        window.setTimeout(once, 800);
      } else {
        setup();
      }
    });

    const handlePreferenceChange = () => {
      applyMotionPreference();
      if (motionQuery.matches) {
        if (observer) {
          observer.disconnect();
        }
      } else {
        observe();
        playAnimation();
      }
    };

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handlePreferenceChange);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(handlePreferenceChange);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseAnimation();
      } else {
        playAnimation();
      }
    });
  };

  const initMobileNav = () => {
    const header = document.querySelector('[data-header]');
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');

    if (!header || !toggle || !nav) {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 769px)');
    const navLinks = Array.from(nav.querySelectorAll('a'));

    const setExpandedState = (isOpen) => {
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      header.classList.toggle('site-header--menu-open', isOpen);
      nav.classList.toggle('is-open', isOpen);

      if (mediaQuery.matches) {
        nav.removeAttribute('aria-hidden');
      } else {
        nav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      }
    };

    const closeNav = ({ focusToggle = false } = {}) => {
      setExpandedState(false);
      if (focusToggle) {
        toggle.focus();
      }
    };

    const openNav = () => {
      setExpandedState(true);
    };

    const handleToggle = () => {
      if (nav.classList.contains('is-open')) {
        closeNav();
      } else {
        openNav();
      }
    };

    const handleMediaChange = (event) => {
      if (event.matches) {
        setExpandedState(false);
      } else {
        setExpandedState(nav.classList.contains('is-open'));
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav({ focusToggle: true });
      }
    };

    const handleDocumentClick = (event) => {
      if (!nav.classList.contains('is-open')) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && (nav.contains(target) || toggle.contains(target))) {
        return;
      }

      closeNav();
    };

    toggle.addEventListener('click', handleToggle);

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) {
          closeNav();
        }
      });
    });

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleDocumentClick);

    header.classList.add('site-header--nav-ready');
    setExpandedState(false);
    handleMediaChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleMediaChange);
    }
  };

  const initImageLightbox = () => {
    const lightbox = document.querySelector('[data-image-lightbox]');
    const triggers = document.querySelectorAll('[data-image-lightbox-trigger]');

    if (!lightbox || !triggers.length) {
      return;
    }

    const overlay = lightbox.querySelector('[data-image-lightbox-overlay]');
    const closeBtn = lightbox.querySelector('[data-image-lightbox-close]');
    const image = lightbox.querySelector('[data-image-lightbox-img]');

    if (!closeBtn || !image) {
      return;
    }

    let activeTrigger = null;
    let lastFocusedElement = null;
    let isOpen = false;

    const lockScroll = () => {
      document.body.classList.add('is-lightbox-open');
    };

    const unlockScroll = () => {
      document.body.classList.remove('is-lightbox-open');
    };

    const closeLightbox = () => {
      if (!isOpen) {
        return;
      }

      isOpen = false;
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.setAttribute('hidden', '');
      unlockScroll();
      document.removeEventListener('keydown', handleKeydown);

      const focusTarget = activeTrigger || lastFocusedElement;
      activeTrigger = null;

      if (focusTarget && typeof focusTarget.focus === 'function') {
        window.requestAnimationFrame(() => {
          focusTarget.focus();
        });
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        if (typeof closeBtn.focus === 'function') {
          window.requestAnimationFrame(() => closeBtn.focus({ preventScroll: true }));
        }
      }
    };

    const openLightbox = (trigger) => {
      if (isOpen) {
        return;
      }

      const src = trigger.getAttribute('data-image-lightbox-src');
      if (!src) {
        return;
      }

      const imageElement = trigger.querySelector('img');
      const alt =
        trigger.getAttribute('data-image-lightbox-alt') ||
        (imageElement ? imageElement.getAttribute('alt') : '') ||
        '';

      lastFocusedElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      activeTrigger = trigger;

      image.setAttribute('src', src);
      if (alt) {
        image.setAttribute('alt', alt);
      } else {
        image.removeAttribute('alt');
      }

      lightbox.removeAttribute('hidden');
      lightbox.setAttribute('aria-hidden', 'false');
      isOpen = true;
      lockScroll();

      document.addEventListener('keydown', handleKeydown);

      window.requestAnimationFrame(() => {
        if (!isOpen) {
          return;
        }

        if (typeof closeBtn.focus === 'function') {
          closeBtn.focus({ preventScroll: true });
        }
      });
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        openLightbox(trigger);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    overlay?.addEventListener('click', closeLightbox);
  };

  const init = () => {
    setCurrentYear();
    initFAQ();
    initSmoothScroll();
    initLottie();
    initMobileNav();
    initImageLightbox();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
