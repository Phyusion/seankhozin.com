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

  // NPV calculator: NPV = sum over t = 1..T of CF_t / (1 + r)^t
  const devIn = document.getElementById('lever-dev');
  if (devIn) {
    const costIn = document.getElementById('lever-cost');
    const profitIn = document.getElementById('lever-profit');
    const marketIn = document.getElementById('lever-market');
    const rIn = document.getElementById('lever-r');
    const npvOut = document.getElementById('roundtable-ratio');
    const verdictOut = document.getElementById('roundtable-verdict');
    const result = npvOut.closest('.roundtable-result');
    const bars = document.getElementById('npv-bars');
    const SVG = 'http://www.w3.org/2000/svg';
    const fmtMoney = millions => {
      const sign = millions < 0 ? '\u2212' : '';
      const m = Math.abs(millions);
      return sign + (m >= 995 ? '$' + (m / 1000).toFixed(1) + 'B' : '$' + Math.round(m) + 'M');
    };
    const term = (cf, rPct, t) => fmtMoney(cf) + ' \u00f7 ' + (1 + rPct / 100).toFixed(rPct % 1 ? 3 : 2) + '<sup>' + t + '</sup>';
    const setTerm = (id, html) => {
      const el = document.getElementById(id);
      if (el.innerHTML === html) return;
      el.innerHTML = html;
      el.classList.add('is-changing');
      clearTimeout(el.flashTimer);
      el.flashTimer = setTimeout(() => el.classList.remove('is-changing'), 220);
    };
    const update = () => {
      const dev = parseInt(devIn.value, 10);
      const cost = parseFloat(costIn.value);
      const profit = parseFloat(profitIn.value);
      const market = parseInt(marketIn.value, 10);
      const rPct = parseFloat(rIn.value);
      const r = rPct / 100;
      const T = dev + market;
      const flows = [];
      let devPV = 0, mktPV = 0;
      for (let t = 1; t <= T; t++) {
        const cf = t <= dev ? -cost : profit;
        const pv = cf / Math.pow(1 + r, t);
        if (t <= dev) devPV += pv; else mktPV += pv;
        flows.push({ cf, pv });
      }
      const npv = devPV + mktPV;
      document.getElementById('lever-dev-out').textContent = dev;
      document.getElementById('lever-cost-out').textContent = fmtMoney(cost);
      document.getElementById('lever-profit-out').textContent = fmtMoney(profit);
      document.getElementById('lever-market-out').textContent = market;
      document.getElementById('lever-r-out').textContent = rPct.toFixed(rPct % 1 ? 1 : 0) + '%';
      setTerm('eq-first', term(flows[0].cf, rPct, 1));
      setTerm('eq-last', term(flows[T - 1].cf, rPct, T));
      npvOut.textContent = fmtMoney(npv);
      const fundable = npv > 0;
      result.classList.toggle('is-below', !fundable);
      verdictOut.textContent = fundable ? 'Worth funding: NPV is positive' : 'Not worth funding: NPV is negative';
      document.getElementById('npv-dev-years').textContent = dev;
      document.getElementById('npv-mkt-years').textContent = (dev + 1) + '\u2013' + T;
      document.getElementById('npv-dev').textContent = fmtMoney(devPV);
      document.getElementById('npv-mkt').textContent = fmtMoney(mktPV);
      document.getElementById('npv-axis-end').textContent = 'Year ' + T;
      // Bars: outline is the year's cash flow, solid is its value today
      const max = Math.max(profit, 1), min = cost;
      const H = 100, zero = H * max / (max + min), scale = H / (max + min), W = 10;
      bars.setAttribute('viewBox', '0 0 ' + T * W + ' ' + H);
      bars.setAttribute('aria-label', 'Cash flow by year, years 1 to ' + T + ': ' + dev + ' years of development costs, then ' + market + ' years of profit');
      bars.textContent = '';
      const rect = (cls, x, v) => {
        const el = document.createElementNS(SVG, 'rect');
        el.setAttribute('class', cls);
        el.setAttribute('x', x);
        el.setAttribute('width', W * 0.7);
        el.setAttribute('y', v >= 0 ? zero - v * scale : zero);
        el.setAttribute('height', Math.abs(v) * scale);
        el.setAttribute('vector-effect', 'non-scaling-stroke');
        bars.appendChild(el);
      };
      flows.forEach((f, i) => {
        rect('pv' + (f.cf < 0 ? ' neg' : ''), i * W + W * 0.15, f.pv);
        rect('raw', i * W + W * 0.15, f.cf);
      });
      const line = document.createElementNS(SVG, 'line');
      line.setAttribute('class', 'zero');
      line.setAttribute('x1', 0); line.setAttribute('x2', T * W);
      line.setAttribute('y1', zero); line.setAttribute('y2', zero);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      bars.appendChild(line);
    };
    [devIn, costIn, profitIn, marketIn, rIn].forEach(input => input.addEventListener('input', update));
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
