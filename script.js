// === Sean Khozin Website — Interactions ===

(function () {
  'use strict';

  // Nav scroll effect
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  // Close mobile menu on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });

  // Scroll-triggered fade-in animations
  const faders = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && faders.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    faders.forEach(el => observer.observe(el));
  }

  // Research accordion expand/collapse
  document.querySelectorAll('.research-accordion-header').forEach(header => {
    const handler = () => {
      const accordion = header.closest('.research-accordion');
      const isOpen = accordion.classList.toggle('open');
      header.setAttribute('aria-expanded', isOpen);
    };
    header.addEventListener('click', handler);
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });

  // Collapsible publication lists (show more / show fewer)
  document.querySelectorAll('.research-pub-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = btn.closest('.research-pub-list');
      const isExpanded = list.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', isExpanded);
      const total = list.querySelectorAll('.research-pub').length;
      btn.textContent = isExpanded ? 'Show fewer' : 'Show all ' + total + ' publications';
    });
  });

  // Auto-add fade-in to section children
  document.querySelectorAll('.section').forEach(section => {
    const header = section.querySelector('.section-header');
    const cards = section.querySelectorAll(
      '.role-card, .timeline-item, .research-accordion, .media-card, .board-item, .highlight-card, .pillar, .contact-link'
    );

    if (header) header.classList.add('fade-in');
    cards.forEach((card, i) => {
      card.classList.add('fade-in');
      card.style.transitionDelay = `${i * 80}ms`;
    });
  });

  // Re-observe after adding classes
  const allFaders = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && allFaders.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    allFaders.forEach(el => observer.observe(el));
  }
})();
