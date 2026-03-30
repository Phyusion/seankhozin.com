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

  // Sticky section headers
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
  document.querySelectorAll('.section-header').forEach(header => {
    var sentinel = document.createElement('div');
    sentinel.className = 'section-header-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    header.parentElement.insertBefore(sentinel, header);

    var stickyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var isAbove = entry.boundingClientRect.top < navHeight;
          header.classList.toggle('stuck', !entry.isIntersecting && isAbove);
        });
      },
      { rootMargin: '-' + (navHeight + 1) + 'px 0px 0px 0px' }
    );
    stickyObserver.observe(sentinel);
  });

  // Expandable contact form
  const formTrigger = document.getElementById('contact-form-trigger');
  const formPanel = document.getElementById('contact-form-panel');
  if (formTrigger && formPanel) {
    formTrigger.addEventListener('click', () => {
      const isOpen = formPanel.classList.toggle('open');
      formTrigger.setAttribute('aria-expanded', isOpen);
    });
  }

  // Expandable podcast banner
  const podcastTrigger = document.getElementById('podcast-banner-trigger');
  const podcastPanel = document.getElementById('podcast-banner-panel');
  const podcastIframe = document.getElementById('podcast-iframe');
  var podcastLoaded = false;
  if (podcastTrigger && podcastPanel) {
    podcastTrigger.addEventListener('click', function () {
      var isOpen = podcastPanel.classList.toggle('open');
      podcastTrigger.setAttribute('aria-expanded', String(isOpen));
      if (isOpen && !podcastLoaded) {
        podcastLoaded = true;
        loadLatestEpisode();
      }
    });
  }

  // Fetch latest Precision Signals episode from YouTube RSS feed
  function loadLatestEpisode() {
    var fallbackSrc = 'https://www.youtube.com/embed/videoseries?list=UUgB_b-5uAnb_l-hxqfUBwkw';
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=UCgB_b-5uAnb_l-hxqfUBwkw'))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.items && data.items.length > 0) {
          var link = data.items[0].link;
          var match = link.match(/[?&]v=([^&]+)/);
          if (match) {
            podcastIframe.src = 'https://www.youtube.com/embed/' + match[1];
            return;
          }
        }
        podcastIframe.src = fallbackSrc;
      })
      .catch(function () {
        podcastIframe.src = fallbackSrc;
      });
  }

  // Expandable research cards (light theme)
  document.querySelectorAll('.research-card-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.research-card-expandable');
      const body = card.querySelector('.research-card-body');
      const isOpen = body.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
      btn.querySelector('.research-card-toggle-text').textContent = isOpen ? 'Show less' : 'Read more';
    });
  });

  // Collapsible publication lists
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
      '.role-card, .timeline-item, .research-card, .research-subsection, .media-card, .board-item, .highlight-card, .pillar, .contact-link, .podcast-banner'
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
