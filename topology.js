// ================================================================
//  Topology — interactive figures for the themes
//  1. Timelines (eighty years of AI; how cancer got its names)
//  2. RG7112 pipeline stepper
//  3. Today's toolkit: see / miss
//  4. Eroom's law slider
//  5. Reveal, sliver grid, and the contents scrollspy
//  6. From Organs to Algorithms: number needed to benefit, lung cancer
//     splits, re-sorting tumors, the alien solution
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
  // 1. Timelines. Edit TIMELINES to change copy; keyed by figure id,
  //    with the period selected on load.
  // ---------------------------------------------------------------
  var TIMELINES = {
    'ai-timeline': { start: 1, periods: [
      { year: '1943', kind: 'Foundations', title: 'Neurons as logic units', text: 'McCulloch and Pitts model the neuron as a logic unit, the first bridge between brain and computation.' },
      { year: '1956', kind: 'Founding', title: 'The Dartmouth workshop', text: 'A summer workshop at Dartmouth founds the field and gives it a name: artificial intelligence.' },
      { year: '1970s', kind: 'Winter', winter: true, title: 'The first winter', text: 'The Lighthill report in the UK and the US Congress end funding for undirected AI research. Expectations had run ahead of the methods.' },
      { year: '1980s', kind: 'Revival', title: 'Expert systems', text: 'Rule-based expert systems and Japan’s national computing initiative revive investment.' },
      { year: '1990s', kind: 'Winter', winter: true, title: 'The second winter', text: 'Expert systems prove brittle and expensive to maintain. Enthusiasm wanes again.' },
      { year: '2000s', kind: 'Return', title: 'Machine learning returns', text: 'Faster hardware and big data bring learning from examples back to the center of the field.' },
      { year: '2024', kind: 'Biology', title: 'AlphaFold 3 and a Nobel Prize', text: 'AlphaFold 3 predicts the structures of molecular complexes, and protein structure prediction and design share the Nobel Prize in Chemistry.' }
    ] },
    'names-timeline': { start: 2, periods: [
      { year: 'Antiquity', kind: 'Description', title: 'Egyptian papyri', text: 'The earliest documented descriptions of cancer appear in ancient Egyptian medical papyri.' },
      { year: 'c. 400 BCE', kind: 'Naming', title: 'Carcinos', text: 'Hippocrates introduces the terms “carcinos” and “carcinoma” for solid tumors. Cancer is named for what it looks like.' },
      { year: '1700s–1800s', kind: 'Anatomy', title: 'The surgeon’s map', text: 'Surgical treatment codifies an anatomical classification: tumors are sorted by where they sit and how they look to the naked eye. “Lung cancer” is a name from this era.' },
      { year: 'Late 1800s', kind: 'Histology', title: 'The microscope', text: 'Microscopy brings histological classification: cancers are sorted by the shapes of their cells. “Small cell” and “non-small cell” are names from this layer.' },
      { year: '1900s', kind: 'Staining', title: 'Immunohistochemistry', text: 'Stains that bind specific proteins refine what the microscope can distinguish, but the categories stay anchored to organ and appearance.' },
      { year: '2000s', kind: 'Molecular', title: 'Sequencing and single cells', text: 'Next-generation sequencing, transcriptomics and single-cell proteomics reveal that tumors in different organs can share drivers, while tumors in one organ can be strikingly different.' },
      { year: 'Now', kind: 'Algorithms', title: 'Classification from the bottom up', text: 'AI can integrate molecular, histopathological, imaging and clinical data at once, and find features no human defined. The daily system is still the surgeon’s and the microscope’s.' }
    ] }
  };

  Object.keys(TIMELINES).forEach(function (id) {
    var tl = document.getElementById(id);
    if (!tl) return;
    var periods = TIMELINES[id].periods;
    var track = tl.querySelector('.tl-track');
    var panel = tl.querySelector('.tl-panel');
    var selectPeriod;
    var tabs = periods.map(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tl-item' + (p.winter ? ' is-winter' : '');
      b.setAttribute('role', 'tab');
      b.innerHTML = '<span class="tl-year">' + p.year + '</span><span class="tl-kind">' + p.kind + '</span>';
      b.addEventListener('click', function () { selectPeriod(i, true); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); selectPeriod((i + d + periods.length) % periods.length, true); }
      });
      track.appendChild(b);
      return b;
    });
    selectPeriod = function (i, focus) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', String(i === j));
        t.tabIndex = i === j ? 0 : -1;
      });
      if (focus) tabs[i].focus();
      var p = periods[i];
      panel.innerHTML = '<div class="fig-fade"><h5>' + p.title + '</h5><p>' + p.text + '</p></div>';
    };
    selectPeriod(TIMELINES[id].start, false);
  });

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

  // ---------------------------------------------------------------
  // 6. From Organs to Algorithms
  // ---------------------------------------------------------------

  // 6a. Number needed to benefit: one filled figure per row of N
  document.querySelectorAll('.nnb-dots').forEach(function (row) {
    var n = +row.dataset.n;
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i');
      if (i === 0) d.className = 'is-benefit';
      row.appendChild(d);
    }
  });

  // 6b. Lung cancer, split by split. Biomarker-defined FDA approvals in
  //     non-small cell lung cancer; `khozin` marks his FDA approval summaries.
  var SPLITS = [
    { year: 2011, marker: 'ALK', drug: 'crizotinib' },
    { year: 2013, marker: 'EGFR exon 19 / L858R', drug: 'erlotinib, first line', khozin: true },
    { year: 2014, marker: 'ALK, after crizotinib', drug: 'ceritinib', khozin: true },
    { year: 2015, marker: 'EGFR T790M', drug: 'osimertinib', khozin: true },
    { year: 2016, marker: 'ROS1', drug: 'crizotinib' },
    { year: 2016, marker: 'PD-L1 high', drug: 'pembrolizumab, first line' },
    { year: 2017, marker: 'BRAF V600E', drug: 'dabrafenib + trametinib' },
    { year: 2018, marker: 'NTRK fusion', drug: 'larotrectinib, any tumor' },
    { year: 2020, marker: 'MET exon 14', drug: 'capmatinib' },
    { year: 2020, marker: 'RET fusion', drug: 'selpercatinib' },
    { year: 2021, marker: 'KRAS G12C', drug: 'sotorasib' },
    { year: 2021, marker: 'EGFR exon 20', drug: 'amivantamab' },
    { year: 2022, marker: 'HER2 mutation', drug: 'trastuzumab deruxtecan' }
  ];
  var split = document.getElementById('nsclc-split');
  if (split) {
    var chips = split.querySelector('.split-chips');
    var countOut = split.querySelector('.split-count');
    var yearOut = split.querySelector('.split-year');
    var range = split.querySelector('input');
    SPLITS.forEach(function (sp) {
      var li = document.createElement('li');
      li.className = 'split-chip' + (sp.khozin ? ' is-khozin' : '');
      li.innerHTML = '<span class="split-chip-year">' + sp.year + '</span><b>' + sp.marker + '</b><span>' + sp.drug + '</span>';
      chips.appendChild(li);
      sp.el = li;
    });
    var updateSplit = function () {
      var y = +range.value;
      var n = 0;
      SPLITS.forEach(function (sp) { var on = sp.year <= y; sp.el.classList.toggle('is-on', on); if (on) n++; });
      yearOut.textContent = y;
      countOut.textContent = n === 0 ? 'One disease: “non-small cell lung cancer”' : n + ' molecularly defined ' + (n === 1 ? 'subset' : 'subsets') + ' with an approved targeted or biomarker-selected therapy';
      range.setAttribute('aria-valuetext', y + ': ' + n + ' subsets');
    };
    range.addEventListener('input', updateSplit);
    updateSplit();
  }

  // 6c. Re-sort the tumors: the same tiles grouped by organ or by driver.
  //     Agnostic: the year of the first FDA approval for any tumor with the driver.
  var TUMORS = [
    ['Lung', 'EGFR'], ['Lung', 'ALK'], ['Lung', 'BRAF V600E'], ['Lung', 'KRAS'], ['Lung', 'RET'], ['Lung', 'NTRK'], ['Lung', 'HER2'],
    ['Colorectum', 'MSI-H'], ['Colorectum', 'BRAF V600E'], ['Colorectum', 'KRAS'], ['Colorectum', 'HER2'],
    ['Melanoma', 'BRAF V600E'],
    ['Thyroid', 'BRAF V600E'], ['Thyroid', 'RET'], ['Thyroid', 'NTRK'],
    ['Stomach', 'HER2'], ['Stomach', 'MSI-H'],
    ['Breast', 'HER2'],
    ['Endometrium', 'MSI-H'],
    ['Pancreas', 'KRAS'],
    ['Salivary gland', 'NTRK']
  ];
  var AGNOSTIC = {
    'MSI-H': '2017 · pembrolizumab, any solid tumor',
    'NTRK': '2018 · larotrectinib, any solid tumor',
    'BRAF V600E': '2022 · dabrafenib + trametinib, any solid tumor',
    'RET': '2022 · selpercatinib, any solid tumor',
    'HER2': '2024 · trastuzumab deruxtecan, any HER2-positive solid tumor'
  };
  var resort = document.getElementById('resort');
  if (resort) {
    var board = resort.querySelector('.resort-board');
    var note = resort.querySelector('.resort-note');
    var btns = resort.querySelectorAll('.seg-btn');
    var drawResort = function (by) {
      var keyOf = by === 'organ' ? function (t) { return t[0]; } : function (t) { return t[1]; };
      var labelOf = by === 'organ' ? function (t) { return t[1]; } : function (t) { return t[0]; };
      var groups = [];
      var index = {};
      TUMORS.forEach(function (t) {
        var k = keyOf(t);
        if (!(k in index)) { index[k] = groups.length; groups.push({ key: k, items: [] }); }
        groups[index[k]].items.push(t);
      });
      board.innerHTML = '';
      groups.forEach(function (g) {
        var box = document.createElement('div');
        box.className = 'resort-group fig-fade';
        var extra = by === 'driver' && AGNOSTIC[g.key] ? '<span class="resort-agnostic">' + AGNOSTIC[g.key] + '</span>' : '';
        box.innerHTML = '<h5>' + g.key + '</h5>' + extra + '<ul>' + g.items.map(function (t) {
          return '<li data-driver="' + t[1] + '">' + labelOf(t) + '</li>';
        }).join('') + '</ul>';
        board.appendChild(box);
      });
      board.dataset.by = by;
      note.textContent = by === 'organ'
        ? 'Grouped by organ, each group mixes tumors with different drivers, and the same driver turns up in many groups.'
        : 'Grouped by driver, tumors from different organs share a target. Five of these drivers now carry an FDA approval for any solid tumor that has them.';
      btns.forEach(function (o) { o.setAttribute('aria-pressed', String(o.dataset.by === by)); });
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { drawResort(b.dataset.by); }); });
    drawResort('organ');
  }

  // 6d. The alien solution: reveal the point outside the human set
  var alien = document.getElementById('alien');
  if (alien) {
    var abtn = alien.querySelector('[data-alien]');
    abtn.addEventListener('click', function () {
      var on = alien.classList.toggle('is-revealed');
      abtn.setAttribute('aria-pressed', String(on));
      abtn.textContent = on ? 'Hide the alien solution' : 'Show the alien solution';
    });
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
