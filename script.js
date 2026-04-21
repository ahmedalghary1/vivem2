/**
 * VIVEM — Premium Global Marketing Agency
 * script.js — Vanilla JS, modular, performant
 *
 * Modules:
 * 1. Header (scroll behavior + mobile menu)
 * 2. Language switching (EN / AR)
 * 3. Scroll reveal animations
 * 4. FAQ accordion
 * 5. Portfolio filter
 * 6. Contact form
 * 7. Smooth scroll
 */

'use strict';

/* ════════════════════════════════════════════
   1. HEADER
   Sticky header with solid background on scroll
   Mobile menu open/close
════════════════════════════════════════════ */
const Header = (() => {
  const header = document.getElementById('site-header');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu?.querySelectorAll('.mobile-nav-link, .mobile-cta');

  // Scroll: add/remove .scrolled class
  const handleScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  };

  // Mobile menu toggle
  const toggleMenu = () => {
    const isOpen = mobileMenu?.classList.toggle('open');
    mobileBtn?.setAttribute('aria-expanded', String(isOpen));
    mobileMenu?.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    mobileMenu?.classList.remove('open');
    mobileBtn?.setAttribute('aria-expanded', 'false');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const init = () => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    mobileBtn?.addEventListener('click', toggleMenu);

    // Close on link click
    mobileLinks?.forEach(link => link.addEventListener('click', closeMenu));

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (mobileMenu?.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !mobileBtn?.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  };

  return { init };
})();

/* ════════════════════════════════════════════
   2. LANGUAGE SWITCHER
   Toggles English ↔ Arabic (EN/AR)
   Updates dir, lang, all data-en/data-ar text
   Updates placeholders
   Stores preference in localStorage

   NOTE FOR SEO PRODUCTION:
   In production, use separate URL paths:
   - / (English)
   - /ar/ (Arabic)
   instead of JS-only switching.
   This JS approach works for demo/prototype.
════════════════════════════════════════════ */
const LangSwitcher = (() => {
  let currentLang = localStorage.getItem('vivem_lang') || 'en';

  const updatePage = (lang) => {
    const isAr = lang === 'ar';
    const html = document.documentElement;

    // Update HTML attributes
    html.setAttribute('lang', isAr ? 'ar' : 'en');
    html.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.body.classList.toggle('lang-ar', isAr);

    // Update all text nodes with data-en / data-ar
    document.querySelectorAll('[data-en]').forEach(el => {
      const text = isAr ? el.getAttribute('data-ar') : el.getAttribute('data-en');
      if (text) el.textContent = text;
    });

    // Update placeholder attributes
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
      const ph = isAr
        ? el.getAttribute('data-placeholder-ar')
        : el.getAttribute('data-placeholder-en');
      if (ph) el.setAttribute('placeholder', ph);
    });

    // Update select options
    document.querySelectorAll('select option').forEach(opt => {
      const text = isAr ? opt.getAttribute('data-ar') : opt.getAttribute('data-en');
      if (text) opt.textContent = text;
    });

    // Update lang toggle button highlighting
    document.querySelectorAll('.lang-toggle, .footer-lang').forEach(btn => {
      const enEl = btn.querySelector('.lang-en');
      const arEl = btn.querySelector('.lang-ar');
      if (enEl && arEl) {
        enEl.style.fontWeight = isAr ? '400' : '700';
        enEl.style.color = isAr ? 'inherit' : 'var(--blue-primary)';
        arEl.style.fontWeight = isAr ? '700' : '400';
        arEl.style.color = isAr ? 'var(--blue-primary)' : 'inherit';
      }
    });

    // Store preference
    localStorage.setItem('vivem_lang', lang);
    currentLang = lang;
  };

  const toggle = () => {
    updatePage(currentLang === 'en' ? 'ar' : 'en');
  };

  const init = () => {
    // Attach toggle to both language buttons
    document.querySelectorAll('#lang-toggle, #footer-lang-toggle').forEach(btn => {
      btn?.addEventListener('click', toggle);
    });

    // Apply stored or default language
    updatePage(currentLang);
  };

  return { init, updatePage };
})();

/* ════════════════════════════════════════════
   3. SCROLL REVEAL
   Uses IntersectionObserver for performance
   Adds .in-view class when element enters viewport
════════════════════════════════════════════ */
const ScrollReveal = (() => {
  const init = () => {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
        el.classList.add('in-view');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  };

  return { init };
})();

/* ════════════════════════════════════════════
   4. FAQ ACCORDION
   Accessible open/close per item
   aria-expanded + hidden panel
════════════════════════════════════════════ */
const FAQ = (() => {
  const init = () => {
    const faqList = document.getElementById('faq-list');
    if (!faqList) return;

    // Event delegation
    faqList.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);

      // Close all other items first
      faqList.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(openBtn => {
        if (openBtn !== btn) {
          openBtn.setAttribute('aria-expanded', 'false');
          const otherAnswerId = openBtn.getAttribute('aria-controls');
          const otherAnswer = document.getElementById(otherAnswerId);
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (answer) answer.hidden = isExpanded;
    });
  };

  return { init };
})();

/* ════════════════════════════════════════════
   5. PORTFOLIO FILTER
   Filter cards by category
   Smooth show/hide with CSS transitions
════════════════════════════════════════════ */
const PortfolioFilter = (() => {
  const init = () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.portfolio-card');

    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        // Update button states
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Filter cards
        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          const show = filter === 'all' || category === filter;
          card.style.opacity = show ? '' : '0.2';
          card.style.pointerEvents = show ? '' : 'none';
          card.style.transform = show ? '' : 'scale(0.97)';
        });
      });
    });
  };

  return { init };
})();

/* ════════════════════════════════════════════
   6. CONTACT FORM
   Basic validation + success/error state
   Replace with actual form submission handler
════════════════════════════════════════════ */
const ContactForm = (() => {
  const init = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const isAr = document.documentElement.getAttribute('lang') === 'ar';

      // Get values
      const name = form.querySelector('#contact-name')?.value.trim();
      const email = form.querySelector('#contact-email')?.value.trim();
      const message = form.querySelector('#contact-message')?.value.trim();

      // Basic validation
      if (!name || !email || !message) {
        const msg = isAr
          ? 'يرجى ملء الحقول المطلوبة'
          : 'Please fill in all required fields';
        showFormFeedback(form, msg, 'error');
        return;
      }

      // Email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const msg = isAr
          ? 'يرجى إدخال بريد إلكتروني صحيح'
          : 'Please enter a valid email address';
        showFormFeedback(form, msg, 'error');
        return;
      }

      // Simulate submission (replace with real API call)
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isAr ? 'جارٍ الإرسال...' : 'Sending...';
      }

      setTimeout(() => {
        const successMsg = isAr
          ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
          : 'Your message was sent successfully! We\'ll be in touch shortly.';
        showFormFeedback(form, successMsg, 'success');
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = isAr ? 'أرسل استفساركم' : 'Send Your Inquiry';
        }
      }, 1200);
    });
  };

  const showFormFeedback = (form, message, type) => {
    // Remove existing feedback
    const existing = form.querySelector('.form-feedback');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'form-feedback';
    div.setAttribute('role', 'alert');
    div.style.cssText = `
      padding: 0.875rem 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      ${type === 'success'
        ? 'background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d;'
        : 'background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;'}
    `;
    div.textContent = message;
    form.appendChild(div);

    // Auto-remove after 5s
    setTimeout(() => div.remove(), 5000);
  };

  return { init };
})();

/* ════════════════════════════════════════════
   7. SMOOTH SCROLL (enhanced)
   Offsets anchor links to account for fixed header
════════════════════════════════════════════ */
const SmoothScroll = (() => {
  const init = () => {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72'
      );

      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  };

  return { init };
})();

/* ════════════════════════════════════════════
   8. HERO STATS COUNTER ANIMATION
   Animates numbers in hero stats
════════════════════════════════════════════ */
const StatsCounter = (() => {
  const init = () => {
    const statsEl = document.querySelector('.hero-stats');
    if (!statsEl) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        // Small animation: briefly scale up numbers
        const numbers = entry.target.querySelectorAll('.stat-number');
        numbers.forEach((num, i) => {
          setTimeout(() => {
            num.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s';
            num.style.transform = 'scale(1.12)';
            num.style.opacity = '0.7';
            setTimeout(() => {
              num.style.transform = 'scale(1)';
              num.style.opacity = '1';
            }, 200);
          }, i * 100);
        });
      });
    }, { threshold: 0.5 });

    observer.observe(statsEl);
  };

  return { init };
})();

/* ════════════════════════════════════════════
   INIT — Run all modules on DOM ready
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Header.init();
  LangSwitcher.init();
  ScrollReveal.init();
  FAQ.init();
  PortfolioFilter.init();
  ContactForm.init();
  SmoothScroll.init();
  StatsCounter.init();
});
