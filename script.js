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
  // Measured on scroll rather than with an IntersectionObserver, so a jump past a
  // section (nav link, scroll restore) still lands with the header in the right state.
  const stickyHeaders = [];
  document.querySelectorAll('.section-header').forEach(header => {
    var sentinel = document.createElement('div');
    sentinel.className = 'section-header-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    header.parentElement.insertBefore(sentinel, header);
    stickyHeaders.push({ header, sentinel });
  });
  // The headers stay in flow at full size; a fixed running head under the nav
  // carries the current section's tag and title, so nothing shifts while scrolling.
  const runner = document.createElement('div');
  runner.className = 'section-runner';
  runner.setAttribute('aria-hidden', 'true');
  runner.innerHTML = '<div class="section-runner-inner"><span class="section-runner-title"></span><span class="section-runner-tag"></span></div>';
  document.body.appendChild(runner);
  const runnerTitle = runner.querySelector('.section-runner-title');
  const runnerTag = runner.querySelector('.section-runner-tag');
  let runnerFor = null;

  let stickyQueued = false;
  const updateStuck = () => {
    stickyQueued = false;
    const navH = nav.getBoundingClientRect().height || navHeight;
    let current = null;
    stickyHeaders.forEach(item => {
      const { header, sentinel } = item;
      const passed = header.getBoundingClientRect().bottom < navH;
      header.classList.toggle('stuck', passed);
      const section = header.closest('.section');
      if (passed && section && section.getBoundingClientRect().bottom > navH + 60) current = item;
    });
    if (current && current !== runnerFor) {
      const label = current.header.querySelector('.section-label');
      const title = current.header.querySelector('.section-title');
      runnerTag.innerHTML = label ? label.innerHTML : '';
      runnerTitle.innerHTML = title ? title.innerHTML : '';
      runner.dataset.section = current.header.closest('.section').id || '';
    }
    runnerFor = current;
    runner.classList.toggle('visible', !!current);
  };
  const queueStuck = () => {
    if (!stickyQueued) { stickyQueued = true; requestAnimationFrame(updateStuck); }
  };
  window.addEventListener('scroll', queueStuck, { passive: true });
  window.addEventListener('resize', queueStuck);
  updateStuck();

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
    var fallbackSrc = 'https://www.youtube.com/embed/videoseries?list=UUaFDT_bRrAwsNo4WFUteVjw';
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=UCaFDT_bRrAwsNo4WFUteVjw'))
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

  // Expandable board cards: the heading is a real button; a click anywhere else
  // on the card does the same, except on the website link inside it.
  document.querySelectorAll('.board-item').forEach(item => {
    const head = item.querySelector('.board-head');
    if (!head) return;
    const toggleItem = () => {
      const isOpen = item.classList.toggle('expanded');
      head.setAttribute('aria-expanded', String(isOpen));
    };
    head.addEventListener('click', toggleItem);
    item.addEventListener('click', e => {
      if (e.target.closest('a, .board-head')) return;
      toggleItem();
    });
  });

  // Financing frameworks: each row expands to its technical definition
  document.querySelectorAll('.framework-head').forEach(head => {
    const body = document.getElementById(head.getAttribute('aria-controls'));
    head.addEventListener('click', () => {
      const isOpen = head.getAttribute('aria-expanded') !== 'true';
      head.setAttribute('aria-expanded', String(isOpen));
      body.hidden = !isOpen;
    });
  });

  // CEORT roundtable: NPV x P / C calculator
  const npvIn = document.getElementById('lever-npv');
  const pIn = document.getElementById('lever-p');
  const cIn = document.getElementById('lever-c');
  if (npvIn && pIn && cIn) {
    const ratioOut = document.getElementById('roundtable-ratio');
    const verdictOut = document.getElementById('roundtable-verdict');
    const result = ratioOut.closest('.roundtable-result');
    const presets = document.querySelectorAll('.roundtable-preset');
    const fmtMoney = millions => millions >= 1000 ? '$' + (millions / 1000).toFixed(1) + 'B' : '$' + Math.round(millions) + 'M';
    const update = () => {
      const npv = parseFloat(npvIn.value) * 1000; // millions
      const p = parseFloat(pIn.value) / 100;
      const c = parseFloat(cIn.value);
      const ratio = npv * p / c;
      document.getElementById('lever-npv-out').textContent = fmtMoney(npv);
      document.getElementById('lever-p-out').textContent = Math.round(p * 100) + '%';
      document.getElementById('lever-c-out').textContent = fmtMoney(c);
      ratioOut.textContent = ratio.toFixed(2);
      const fundable = ratio > 1;
      result.classList.toggle('is-below', !fundable);
      verdictOut.textContent = fundable ? 'Fundable: expected value exceeds cost' : 'Not fundable: cost exceeds expected value';
      presets.forEach(b => b.setAttribute('aria-pressed', String(
        +b.dataset.npv === parseFloat(npvIn.value) && +b.dataset.p === parseFloat(pIn.value) && +b.dataset.c === parseFloat(cIn.value))));
    };
    [npvIn, pIn, cIn].forEach(input => input.addEventListener('input', update));
    presets.forEach(b => b.addEventListener('click', () => {
      npvIn.value = b.dataset.npv; pIn.value = b.dataset.p; cIn.value = b.dataset.c;
      update();
    }));
    update();
  }

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
