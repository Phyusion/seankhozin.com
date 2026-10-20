// ================================================================
//  Topology — interactive figures for the themes
//  1. AI timeline (eighty years, two winters)
//  2. RG7112 pipeline stepper
//  3. Today's toolkit: see / miss
//  4. Eroom's law slider
//  5. Reveal, sliver grid, and the contents scrollspy
// ================================================================
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs, parent) {
    var el = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }

  // ---------------------------------------------------------------
  // 1. Timeline. Edit PERIODS to change copy.
  // ---------------------------------------------------------------
  var PERIODS = [
    { year: '1943', kind: 'Foundations', title: 'Neurons as logic units', text: 'McCulloch and Pitts model the neuron as a logic unit, the first bridge between brain and computation.' },
    { year: '1956', kind: 'Founding', title: 'The Dartmouth workshop', text: 'A summer workshop at Dartmouth founds the field and gives it a name: artificial intelligence.' },
    { year: '1970s', kind: 'Winter', winter: true, title: 'The first winter', text: 'The Lighthill report in the UK and the US Congress end funding for undirected AI research. Expectations had run ahead of the methods.' },
    { year: '1980s', kind: 'Revival', title: 'Expert systems', text: 'Rule-based expert systems and Japan’s national computing initiative revive investment.' },
    { year: '1990s', kind: 'Winter', winter: true, title: 'The second winter', text: 'Expert systems prove brittle and expensive to maintain. Enthusiasm wanes again.' },
    { year: '2000s', kind: 'Return', title: 'Machine learning returns', text: 'Faster hardware and big data bring learning from examples back to the center of the field.' },
    { year: '2024', kind: 'Biology', title: 'AlphaFold 3 and a Nobel Prize', text: 'AlphaFold 3 predicts the structures of molecular complexes, and protein structure prediction and design share the Nobel Prize in Chemistry.' }
  ];

  var tl = document.getElementById('ai-timeline');
  if (tl) {
    var track = tl.querySelector('.tl-track');
    var panel = tl.querySelector('.tl-panel');
    var tabs = PERIODS.map(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tl-item' + (p.winter ? ' is-winter' : '');
      b.setAttribute('role', 'tab');
      b.innerHTML = '<span class="tl-year">' + p.year + '</span><span class="tl-kind">' + p.kind + '</span>';
      b.addEventListener('click', function () { selectPeriod(i, true); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); selectPeriod((i + d + PERIODS.length) % PERIODS.length, true); }
      });
      track.appendChild(b);
      return b;
    });
    var selectPeriod = function (i, focus) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', String(i === j));
        t.tabIndex = i === j ? 0 : -1;
      });
      if (focus) tabs[i].focus();
      var p = PERIODS[i];
      panel.innerHTML = '<div class="fig-fade"><h5>' + p.title + '</h5><p>' + p.text + '</p></div>';
    };
    selectPeriod(1, false);
  }

  // ---------------------------------------------------------------
  // 2. RG7112 pipeline: step through the stages; the detail of the
  //    current stage is shown below the row.
  // ---------------------------------------------------------------
  var pipe = document.getElementById('rg-pipeline');
  if (pipe) {
    var stages = Array.prototype.slice.call(pipe.querySelectorAll('.pipe-stage'));
    var host = document.createElement('div');
    host.className = 'pipe-detail-host';
    host.setAttribute('aria-live', 'polite');
    pipe.querySelector('.pipe-stages').after(host);
    var prev = pipe.querySelector('[data-pipe="prev"]');
    var next = pipe.querySelector('[data-pipe="next"]');
    var progress = pipe.querySelector('.pipe-progress');
    var reached = 0;
    var current = 0;
    var show = function (i) {
      current = i;
      reached = Math.max(reached, i);
      stages.forEach(function (s, j) {
        s.classList.toggle('is-reached', j <= reached);
        s.classList.toggle('is-current', j === i);
        s.querySelector('.pipe-btn').setAttribute('aria-pressed', String(j === i));
      });
      host.innerHTML = '<div class="pipe-detail fig-fade">' + stages[i].querySelector('.pipe-detail').innerHTML + '</div>';
      prev.disabled = i === 0;
      var last = i === stages.length - 1;
      next.textContent = last ? 'Start again ↺' : i === stages.length - 2 ? 'Into the clinic →' : 'Next stage →';
      progress.textContent = 'Stage ' + (i + 1) + ' of ' + stages.length;
    };
    stages.forEach(function (s, j) {
      s.querySelector('.pipe-btn').addEventListener('click', function () { show(j); });
    });
    prev.addEventListener('click', function () { if (current > 0) show(current - 1); });
    next.addEventListener('click', function () {
      if (current === stages.length - 1) { reached = 0; show(0); } else show(current + 1);
    });
    show(0);
  }

  // ---------------------------------------------------------------
  // 3. Toolkit see / miss
  // ---------------------------------------------------------------
  var kit = document.getElementById('toolkit-test');
  if (kit) {
    var cols = kit.querySelector('.toolkit-cols');
    var segs = kit.querySelectorAll('.seg-btn');
    segs.forEach(function (b) {
      b.addEventListener('click', function () {
        cols.dataset.view = b.dataset.view;
        segs.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      });
    });
  }

  // ---------------------------------------------------------------
  // 4. Eroom's law. A schematic of the published trend: an 80-fold
  //    decline in drugs per inflation-adjusted R&D dollar, 1950–2010
  //    (halving roughly every nine years). No individual data points.
  // ---------------------------------------------------------------
  var eroom = document.getElementById('eroom');
  if (eroom) {
    var START = 1950, END = 2010, FOLD = 80;
    var fold = function (y) { return Math.pow(FOLD, (y - START) / (END - START)); };
    var W = 560, H = 300, L = 52, R = 30, T = 20, B = 34;
    var x = function (y) { return L + (y - START) / (END - START) * (W - L - R); };
    // y axis: drugs per dollar relative to 1950, log scale from 1 (top) to 1/80 (bottom)
    var yv = function (rel) { return T + (-Math.log10(rel) / Math.log10(FOLD)) * (H - T - B); };
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'eroom-svg', role: 'img', 'aria-label': 'Schematic: drugs approved per billion R&D dollars fell about 80-fold from 1950 to 2010, halving roughly every nine years' });
    [[1, '1×'], [0.1, '1/10'], [1 / FOLD, '1/80']].forEach(function (t) {
      svgEl('line', { x1: L, x2: W - R, y1: yv(t[0]), y2: yv(t[0]), class: 'eroom-grid' }, svg);
      svgEl('text', { x: L - 8, y: yv(t[0]) + 4, 'text-anchor': 'end', class: 'eroom-tick' }, svg).textContent = t[1];
    });
    for (var yr = START; yr <= END; yr += 10) {
      svgEl('text', { x: x(yr), y: H - 12, 'text-anchor': 'middle', class: 'eroom-tick' }, svg).textContent = yr;
    }
    svgEl('line', { x1: L, x2: L, y1: T, y2: H - B, class: 'eroom-axis' }, svg);
    svgEl('line', { x1: L, x2: W - R, y1: H - B, y2: H - B, class: 'eroom-axis' }, svg);
    var pts = function (to) {
      var d = [];
      for (var y = START; y <= to; y += 1) d.push((y === START ? 'M' : 'L') + x(y).toFixed(1) + ' ' + yv(1 / fold(y)).toFixed(1));
      return d.join(' ');
    };
    svgEl('path', { d: pts(END), class: 'eroom-line' }, svg);
    // One mark at each halving, about every nine and a half years
    var halfYears = (END - START) / (Math.log(FOLD) / Math.LN2);
    ['1/2', '1/4', '1/8', '1/16', '1/32', '1/64'].forEach(function (label, k) {
      var hy = START + halfYears * (k + 1);
      svgEl('circle', { cx: x(hy), cy: yv(1 / fold(hy)), r: 3.5, class: 'eroom-half' }, svg);
      svgEl('text', { x: x(hy) + 7, y: yv(1 / fold(hy)) - 7, class: 'eroom-note' }, svg).textContent = label;
    });
    var past = svgEl('path', { d: pts(START), class: 'eroom-past' }, svg);
    var guide = svgEl('line', { class: 'eroom-guide' }, svg);
    var dot = svgEl('circle', { r: 7, class: 'eroom-dot' }, svg);
    eroom.querySelector('.eroom-chart').appendChild(svg);

    var input = eroom.querySelector('input');
    var foldOut = eroom.querySelector('.eroom-fold');
    var textOut = eroom.querySelector('.eroom-text');
    var update = function () {
      var y = +input.value;
      var f = fold(y);
      past.setAttribute('d', pts(y));
      dot.setAttribute('cx', x(y));
      dot.setAttribute('cy', yv(1 / f));
      guide.setAttribute('x1', x(y)); guide.setAttribute('x2', x(y));
      guide.setAttribute('y1', yv(1 / f)); guide.setAttribute('y2', H - B);
      var n = f < 10 ? f.toFixed(1) : String(Math.round(f));
      foldOut.textContent = y === START ? '1950' : n + '× fewer';
      textOut.textContent = y === START ? 'The baseline: drugs approved per billion R&D dollars' : 'drugs per inflation-adjusted R&D dollar in ' + y + ' than in 1950';
      input.setAttribute('aria-valuetext', y === START ? '1950, baseline' : y + ', ' + n + ' times fewer drugs per dollar than 1950');
    };
    input.addEventListener('input', update);
    update();
  }

  // ---------------------------------------------------------------
  // 5a. Reveal buttons
  // ---------------------------------------------------------------
  document.querySelectorAll('[data-reveal]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('aria-controls'));
    if (!target) return;
    btn.addEventListener('click', function () {
      var open = target.hidden;
      target.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide' : 'Reveal the biosensor';
    });
  });

  // 5b. Sliver: 100 cells, 1 known and 4 possibly known
  var grid = document.querySelector('.sliver-grid');
  if (grid) {
    for (var i = 0; i < 100; i++) {
      var c = document.createElement('i');
      if (i === 0) c.className = 'is-known';
      else if (i < 5) c.className = 'is-maybe';
      grid.appendChild(c);
    }
  }

  // 5c. Contents: mark the part in view
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.theme-toc a'));
  var parts = tocLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var visible = new Set();
    var mark = function () {
      var idx = -1;
      parts.forEach(function (p, i) { if (p && visible.has(p) && idx === -1) idx = i; });
      if (idx === -1) return;
      tocLinks.forEach(function (a, i) {
        a.classList.toggle('is-current', i === idx);
        if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      mark();
    }, { rootMargin: '-35% 0px -55% 0px' });
    parts.forEach(function (p) { if (p) io.observe(p); });
  }
})();
