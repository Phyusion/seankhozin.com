// ================================================================
//  Topology — interactive figures for the themes
//  1. Timelines (eighty years of AI; how cancer got its names; the ruler)
//  2. RG7112 pipeline stepper
//  3. Today's toolkit: see / miss
//  4. Eroom's law slider
//  5. Reveal, sliver grid, and the contents scrollspy
//  6. From Organs to Algorithms: number needed to benefit, lung cancer
//     splits, re-sorting tumors, Definition 1 on a solution landscape
//  7. The Broken Instrument: reading a scan, attenuation, waterfalls,
//     the coin flip at the cutoff
//  8. There Is No Average Patient: the Reweight the Trial calculator
//  9. The Patient-Centered Estimand: one hazard ratio across prognoses,
//     a mixed population, endpoints, the frontier, Translate the Trial
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
    ] },
    'ruler-timeline': { start: 2, periods: [
      { year: '1976', kind: 'Warning', title: 'Sixteen oncologists, twelve spheres', text: 'Asked to measure simulated tumors, experienced oncologists produced “responses” from measurement error alone: 7–8% at a 50% shrinkage criterion, 19–25% at 25%.' },
      { year: '1981', kind: 'WHO', title: 'Two diameters', text: 'WHO criteria standardize response reporting using the product of two perpendicular diameters.' },
      { year: '2000', kind: 'RECIST', title: 'One diameter', text: 'An international collaboration (EORTC, the US National Cancer Institute and the National Cancer Institute of Canada) moves to a single longest diameter: up to ten target lesions, summed and compared with baseline.' },
      { year: '2009', kind: 'RECIST 1.1', title: 'Five lesions, and a decision to wait', text: 'At most five target lesions, two per organ; progression now also needs a 5 mm absolute increase. The working group considered volumetric and functional imaging and concluded there was not yet enough standardization to abandon the diameter.' },
      { year: '2017', kind: 'iRECIST', title: 'Immunotherapy breaks the rules', text: 'Pseudoprogression and delayed responses lead to a modified guideline for immunotherapy trials.' },
      { year: '2017', kind: 'FDA', title: '13,677 paired reads', text: 'Pooling a decade of registration trials, FDA analysts find two expert readers agree on the response category in 69.5% of cases.' },
      { year: 'Now', kind: 'Volumetric', title: 'A replaceable substrate', text: 'Volumetric segmentation and imaging foundation models make continuous, machine-read tumor burden feasible in trials and in routine care.' }
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
  //     non-small cell lung cancer.
  var SPLITS = [
    { year: 2011, marker: 'ALK', drug: 'crizotinib' },
    { year: 2013, marker: 'EGFR exon 19 / L858R', drug: 'erlotinib, first line' },
    { year: 2014, marker: 'ALK, after crizotinib', drug: 'ceritinib' },
    { year: 2015, marker: 'EGFR T790M', drug: 'osimertinib' },
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
      li.className = 'split-chip';
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

  // 6d. Testing Definition 1 on a solution landscape. Quality h is a
  //     mixture of Gaussian peaks over a 2-D space; human knowledge is an
  //     isotropic Gaussian prior (center c, spread sigma) and H is its 95%
  //     highest-density region, a disc of radius 2.448 sigma. P(s* | human
  //     knowledge) is the prior tail probability exp(-r^2 / 2 sigma^2).
  (function () {
  var alien = document.getElementById('alien');
  if (alien) {
    var AW = 1.6, AH = 1, GX = 160, GY = 100, VW = 600, VH = 380, R95 = Math.sqrt(-2 * Math.log(0.05));
    var LANDS = {
      far: { c: [0.45, 0.55], sigma: 0.1, peaks: [[0.47, 0.52, 0.72, 0.16], [1.22, 0.3, 1, 0.085], [0.92, 0.8, 0.45, 0.12], [0.18, 0.2, 0.3, 0.12], [1.42, 0.82, 0.35, 0.1]] },
      edge: { c: [0.6, 0.5], sigma: 0.1, peaks: [[0.6, 0.5, 0.8, 0.14], [0.87, 0.48, 1, 0.07], [1.3, 0.25, 0.4, 0.12], [0.25, 0.8, 0.35, 0.12]] },
      inside: { c: [0.6, 0.5], sigma: 0.1, peaks: [[0.68, 0.44, 1, 0.1], [1.3, 0.3, 0.8, 0.1], [0.25, 0.78, 0.35, 0.12]] }
    };
    var land, field, hMin, hMax, sStar;
    var canvas = alien.querySelector('.al-canvas');
    var asvg = alien.querySelector('.al-svg');
    var epsIn = alien.querySelector('[name="eps"]'), delIn = alien.querySelector('[name="delta"]');
    var ax = function (x) { return x / AW * VW; };
    var ay = function (y) { return (1 - y / AH) * VH; };
    var hAt = function (x, y) {
      var v = 0;
      land.peaks.forEach(function (p) { var dx = x - p[0], dy = y - p[1]; v += p[2] * Math.exp(-(dx * dx + dy * dy) / (2 * p[3] * p[3])); });
      return v;
    };
    var gx = function (i) { return (i + 0.5) / GX * AW; };
    var gy = function (j) { return (j + 0.5) / GY * AH; };

    var buildField = function () {
      field = new Float64Array(GX * GY); hMin = Infinity; hMax = -Infinity;
      var best = -1;
      for (var j = 0; j < GY; j++) for (var i = 0; i < GX; i++) {
        var v = hAt(gx(i), gy(j)); field[j * GX + i] = v;
        if (v < hMin) hMin = v;
        if (v > hMax) { hMax = v; best = j * GX + i; }
      }
      sStar = [gx(best % GX), gy(Math.floor(best / GX))];
    };

    // shading: paper to cobalt by normalized quality
    var paintField = function () {
      var off = document.createElement('canvas'); off.width = GX; off.height = GY;
      var octx = off.getContext('2d'), img = octx.createImageData(GX, GY);
      var lo = [248, 245, 237], mid = [168, 186, 226], hi = [11, 55, 158];
      for (var j = 0; j < GY; j++) for (var i = 0; i < GX; i++) {
        var q = (field[j * GX + i] - hMin) / (hMax - hMin), a, b, t;
        if (q < 0.5) { a = lo; b = mid; t = q / 0.5; } else { a = mid; b = hi; t = (q - 0.5) / 0.5; }
        var k = ((GY - 1 - j) * GX + i) * 4;
        img.data[k] = a[0] + (b[0] - a[0]) * t; img.data[k + 1] = a[1] + (b[1] - a[1]) * t; img.data[k + 2] = a[2] + (b[2] - a[2]) * t; img.data[k + 3] = 255;
      }
      octx.putImageData(img, 0, 0);
      var r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
    };

    // iso-quality contours by marching squares on the grid
    var contourPath = function (level) {
      var d = '';
      var P = function (i, j) { return [ax(gx(i)), ay(gy(j))]; };
      var lerp = function (a, b, va, vb) { var t = (level - va) / (vb - va); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
      for (var j = 0; j < GY - 1; j++) for (var i = 0; i < GX - 1; i++) {
        var v0 = field[j * GX + i], v1 = field[j * GX + i + 1], v2 = field[(j + 1) * GX + i + 1], v3 = field[(j + 1) * GX + i];
        var c = (v0 > level ? 1 : 0) | (v1 > level ? 2 : 0) | (v2 > level ? 4 : 0) | (v3 > level ? 8 : 0);
        if (c === 0 || c === 15) continue;
        var p0 = P(i, j), p1 = P(i + 1, j), p2 = P(i + 1, j + 1), p3 = P(i, j + 1);
        var e = [lerp(p0, p1, v0, v1), lerp(p1, p2, v1, v2), lerp(p2, p3, v2, v3), lerp(p3, p0, v3, v0)];
        var segs = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 2], [0, 1]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 10: [[0, 3], [1, 2]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[0, 3]] }[c];
        segs.forEach(function (sg) { var a = e[sg[0]], b = e[sg[1]]; d += 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1); });
      }
      return d;
    };

    var gStatic, gDyn;
    var drawStatic = function () {
      asvg.innerHTML = '';
      gStatic = svgEl('g', {}, asvg);
      [0.2, 0.35, 0.5, 0.65, 0.8, 0.9].forEach(function (f) {
        svgEl('path', { d: contourPath(hMin + f * (hMax - hMin)), class: 'al-iso' + (f >= 0.8 ? ' is-high' : '') }, gStatic);
      });
      svgEl('text', { x: VW - 8, y: VH - 8, class: 'al-axis', 'text-anchor': 'end' }, gStatic).textContent = 'latent dimension 1 →';
      svgEl('text', { x: 10, y: 18, class: 'al-axis' }, gStatic).textContent = '↑ latent dimension 2';
      gDyn = svgEl('g', {}, asvg);
    };

    var aout = function (k, v) { var el = alien.querySelector('[data-out="' + k + '"]'); if (el) el.innerHTML = v; };
    var fmtP = function (p) { return p >= 0.01 ? p.toFixed(3) : p.toExponential(1).replace('e-', ' × 10<sup>−') + '</sup>'; };
    var mark = function (n, pass, text) {
      var li = alien.querySelector('[data-c="' + n + '"]');
      li.classList.toggle('is-pass', pass); li.classList.toggle('is-fail', !pass);
      aout('c' + n, (pass ? '✓ ' : '✗ ') + text);
    };

    var update = function () {
      var eps = +epsIn.value, delta = Math.pow(10, +delIn.value);
      aout('eps', eps.toFixed(3)); aout('delta', fmtP(delta));
      var c = land.c, sg = land.sigma, R = R95 * sg;
      var r = Math.hypot(sStar[0] - c[0], sStar[1] - c[1]);
      var inH = r <= R, dmin = Math.max(0, r - R), P = Math.exp(-r * r / (2 * sg * sg));
      // best solution inside H
      var bestH = -Infinity, bh = null;
      for (var j = 0; j < GY; j++) for (var i = 0; i < GX; i++) {
        var x = gx(i), y = gy(j);
        if (Math.hypot(x - c[0], y - c[1]) <= R && field[j * GX + i] > bestH) { bestH = field[j * GX + i]; bh = [x, y]; }
      }
      // overlay
      gDyn.innerHTML = '';
      var cx = ax(c[0]), cy = ay(c[1]), sx = VW / AW;
      // the epsilon band: solutions within epsilon of H fail condition 3
      if (eps > 0) svgEl('circle', { cx: cx, cy: cy, r: (R + eps / 2) * sx, 'stroke-width': eps * sx, class: 'al-eps' }, gDyn);
      [1, 2].forEach(function (k) { svgEl('circle', { cx: cx, cy: cy, r: k * sg * sx, class: 'al-ring' }, gDyn); });
      var disc = svgEl('circle', { cx: cx, cy: cy, r: R * sx, class: 'al-h' }, gDyn);
      disc.dataset.drag = 'move';
      svgEl('text', { x: cx, y: cy - R * sx - 8, class: 'al-label', 'text-anchor': 'middle' }, gDyn).textContent = 'H · 95% of human prior';
      svgEl('circle', { cx: cx, cy: cy, r: 3, class: 'al-centre' }, gDyn);
      if (bh) {
        svgEl('rect', { x: ax(bh[0]) - 5, y: ay(bh[1]) - 5, width: 10, height: 10, class: 'al-best' }, gDyn);
        svgEl('text', { x: ax(bh[0]) + 9, y: ay(bh[1]) + 18, class: 'al-label al-label-sm' }, gDyn).textContent = 'best in H';
      }
      var ssx = ax(sStar[0]), ssy = ay(sStar[1]);
      if (!inH) {
        var ux = (sStar[0] - c[0]) / r, uy = (sStar[1] - c[1]) / r;
        var ex = ax(c[0] + ux * R), ey = ay(c[1] + uy * R);
        svgEl('line', { x1: ex, y1: ey, x2: ssx, y2: ssy, class: 'al-dist' }, gDyn);
        svgEl('text', { x: (ex + ssx) / 2, y: (ey + ssy) / 2 - 8, class: 'al-label al-label-sm', 'text-anchor': 'middle' }, gDyn).textContent = 'd = ' + dmin.toFixed(3);
      }
      svgEl('circle', { cx: ssx, cy: ssy, r: 9, class: 'al-star' }, gDyn);
      svgEl('text', { x: ssx, y: ssy - 15, class: 'al-label', 'text-anchor': 'middle' }, gDyn).textContent = 's*';
      var handle = svgEl('circle', { cx: cx + R * sx, cy: cy, r: 8, class: 'al-handle' }, gDyn);
      handle.dataset.drag = 'size';

      mark(1, true, 'h = ' + (hMax).toFixed(2) + ', grid maximum');
      mark(2, !inH, inH ? 'inside H' : 'r = ' + (r / sg).toFixed(2) + 'σ > 2.45σ');
      mark(3, dmin > eps, 'd = ' + dmin.toFixed(3) + (dmin > eps ? ' > ' : ' ≤ ') + 'ε');
      mark(4, P < delta, 'P = ' + fmtP(P) + (P < delta ? ' < ' : ' ≥ ') + 'δ');
      var fails = [!inH, dmin > eps, P < delta].map(function (ok, k) { return ok ? null : k + 2; }).filter(Boolean);
      aout('verdict', fails.length ? 'Not alien: fails condition' + (fails.length > 1 ? 's ' : ' ') + (fails.length > 1 ? fails.slice(0, -1).join(', ') + ' and ' + fails[fails.length - 1] : fails[0]) + '.' : '<b>s* is an alien construction.</b>');
      alien.querySelector('.al-verdict').classList.toggle('is-alien', !fails.length);
      aout('hh', bestH.toFixed(2)); aout('hs', hMax.toFixed(2));
      aout('gain', bestH >= hMax - 1e-9 ? 'none' : '+' + Math.round((hMax / bestH - 1) * 100) + '%');
    };

    var setLand = function (key) {
      land = JSON.parse(JSON.stringify(LANDS[key]));
      alien.querySelectorAll('[data-land]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.land === key)); });
      buildField(); paintField(); drawStatic(); update();
    };

    // drag the human region (move) or its edge handle (widen)
    var drag = null;
    var toData = function (ev) {
      var pt = asvg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var q = pt.matrixTransform(asvg.getScreenCTM().inverse());
      return [q.x / VW * AW, (1 - q.y / VH) * AH];
    };
    asvg.addEventListener('pointerdown', function (ev) {
      var mode = ev.target.dataset && ev.target.dataset.drag;
      if (!mode) return;
      drag = { mode: mode, start: toData(ev), c0: land.c.slice() };
      asvg.setPointerCapture(ev.pointerId); ev.preventDefault();
    });
    asvg.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var p = toData(ev);
      if (drag.mode === 'move') {
        land.c = [Math.min(AW - 0.05, Math.max(0.05, drag.c0[0] + p[0] - drag.start[0])), Math.min(AH - 0.05, Math.max(0.05, drag.c0[1] + p[1] - drag.start[1]))];
      } else {
        land.sigma = Math.min(0.4, Math.max(0.03, Math.hypot(p[0] - land.c[0], p[1] - land.c[1]) / R95));
      }
      update();
    });
    var endDrag = function () { drag = null; };
    asvg.addEventListener('pointerup', endDrag);
    asvg.addEventListener('pointercancel', endDrag);

    epsIn.addEventListener('input', update);
    delIn.addEventListener('input', update);
    alien.querySelectorAll('[data-land]').forEach(function (b) { b.addEventListener('click', function () { setLand(b.dataset.land); }); });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(paintField, 150); });
    setLand('far');
  }
  })();

  // ---------------------------------------------------------------
  // 7. The Broken Instrument
  // ---------------------------------------------------------------
  function normCdf(z) {
    // Abramowitz and Stegun 7.1.26
    var t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
  }
  function recistCategory(pct) {
    if (pct <= -100) return 'CR';
    if (pct <= -30) return 'PR';
    if (pct >= 20) return 'PD';
    return 'SD';
  }
  var CATEGORY_NAMES = { CR: 'Complete response', PR: 'Partial response', SD: 'Stable disease', PD: 'Progressive disease' };

  // 7a. Read a scan: percent change in the sum of diameters -> category
  var readFig = document.getElementById('recist-read');
  if (readFig) {
    var rIn = readFig.querySelector('input');
    var rPct = readFig.querySelector('.read-pct');
    var rCat = readFig.querySelector('.read-cat');
    var rMark = readFig.querySelector('.read-mark');
    var updateRead = function () {
      var v = +rIn.value;
      var c = recistCategory(v);
      rPct.textContent = (v > 0 ? '+' : '') + v + '%';
      rCat.textContent = CATEGORY_NAMES[c];
      rCat.dataset.cat = c;
      rMark.style.left = ((v + 100) / 160 * 100) + '%';
      rIn.setAttribute('aria-valuetext', v + '%, ' + CATEGORY_NAMES[c]);
    };
    rIn.addEventListener('input', updateRead);
    updateRead();
  }

  // 7b. Attenuation: observed difference = true difference x (1 - 2m)
  var att = document.getElementById('attenuation');
  if (att) {
    var mIn = att.querySelector('[name="m"]');
    var dIn = att.querySelector('[name="delta"]');
    var out = function (k) { return att.querySelector('[data-out="' + k + '"]'); };
    var updateAtt = function () {
      var m = +mIn.value / 100;
      var d = +dIn.value;
      var f = 1 - 2 * m;
      var obs = d * f;
      var mult = 1 / (f * f);
      out('m').textContent = Math.round(m * 100) + '%';
      out('delta').textContent = d + ' pts';
      out('obs').textContent = obs.toFixed(1) + ' pts';
      out('lost').textContent = Math.round((1 - f) * 100) + '%';
      out('mult').textContent = mult < 10 ? mult.toFixed(1) + '×' : Math.round(mult) + '×';
      out('n').textContent = Math.round(200 * mult).toLocaleString('en-US');
      att.querySelector('.att-true').style.width = (d / 40 * 100) + '%';
      att.querySelector('.att-obs').style.width = (obs / 40 * 100) + '%';
      mIn.setAttribute('aria-valuetext', Math.round(m * 100) + '% misclassified');
      dIn.setAttribute('aria-valuetext', d + ' percentage points');
    };
    mIn.addEventListener('input', updateAtt);
    dIn.addEventListener('input', updateAtt);
    att.querySelectorAll('[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () { mIn.value = b.dataset.preset; updateAtt(); });
    });
    updateAtt();
  }

  // 7c. Four boxes for a continuous world: simulated waterfall plots
  function seeded(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var wf = document.getElementById('waterfall');
  if (wf) {
    var N = 30;
    var gen = {
      uniform: function (r) { return -21 - r() * 8; },
      deep: function (r, i) { return i < 6 ? -40 - r() * 35 : 4 + r() * 32; },
      none: function (r) { return -8 + r() * 46; }
    };
    var DRUGS = {
      uniform: { label: 'Drug A', note: 'Every patient’s tumors shrink by 21–29%. A real, reliable effect, and an objective response rate of zero.' },
      deep: { label: 'Drug B', note: 'One patient in five responds deeply; the rest progress. The response rate looks like a signal, and it is the one the instrument rewards.' },
      none: { label: 'Drug C', note: 'No consistent effect. Most tumors grow.' }
    };
    var data = {};
    Object.keys(gen).forEach(function (k, j) {
      var r = seeded(97 + j * 31);
      var arr = [];
      for (var i = 0; i < N; i++) arr.push(Math.round(gen[k](r, i)));
      data[k] = arr.sort(function (a, b) { return b - a; });
    });
    // Bars are drawn in a stretchable SVG; labels are HTML so they never distort.
    var W = 600, H = 240, top = 12, bottom = 12;
    var yOf = function (v) { return top + (45 - v) / 125 * (H - top - bottom); };
    var chart = wf.querySelector('.wf-chart');
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', class: 'wf-svg', role: 'img', 'aria-label': 'Waterfall plot of simulated percent change in tumor size' });
    [[0, '0', 'wf-zero'], [-30, 'PR −30%', 'wf-thresh'], [20, 'PD +20%', 'wf-thresh']].forEach(function (t) {
      svgEl('line', { x1: 0, x2: W, y1: yOf(t[0]), y2: yOf(t[0]), class: t[2], 'vector-effect': 'non-scaling-stroke' }, svg);
      var lab = document.createElement('span');
      lab.className = 'wf-label';
      lab.style.top = (yOf(t[0]) / H * 100) + '%';
      lab.textContent = t[1];
      chart.appendChild(lab);
    });
    var bars = [];
    var bw = W / N;
    for (var i = 0; i < N; i++) bars.push(svgEl('rect', { x: i * bw + 2, width: bw - 4, class: 'wf-bar', 'vector-effect': 'non-scaling-stroke' }, svg));
    var plot = document.createElement('div');
    plot.className = 'wf-plot';
    plot.appendChild(svg);
    chart.appendChild(plot);
    var wfBtns = wf.querySelectorAll('.seg-btn');
    var drawWf = function (k) {
      var arr = data[k];
      var resp = 0, sum = 0, shrank = 0;
      arr.forEach(function (v, i) {
        var y0 = yOf(0), y1 = yOf(v);
        bars[i].setAttribute('y', Math.min(y0, y1));
        bars[i].setAttribute('height', Math.max(1, Math.abs(y1 - y0)));
        bars[i].setAttribute('class', 'wf-bar' + (v <= -30 ? ' is-resp' : v < 0 ? ' is-shrink' : ''));
        if (v <= -30) resp++;
        if (v < 0) shrank++;
        sum += v;
      });
      wf.querySelector('[data-out="orr"]').textContent = Math.round(resp / N * 100) + '%';
      wf.querySelector('[data-out="shrank"]').textContent = Math.round(shrank / N * 100) + '%';
      wf.querySelector('[data-out="mean"]').textContent = (sum / N > 0 ? '+' : '') + Math.round(sum / N) + '%';
      wf.querySelector('.wf-note').textContent = DRUGS[k].note;
      wfBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.drug === k)); });
    };
    wfBtns.forEach(function (b) { b.addEventListener('click', function () { drawWf(b.dataset.drug); }); });
    drawWf('uniform');
  }

  // 7d. A coin flip at the cutoff: probability each category is read
  var coin = document.getElementById('coinflip');
  if (coin) {
    var tIn = coin.querySelector('[name="true"]');
    var sIn = coin.querySelector('[name="sd"]');
    var updateCoin = function () {
      var t = +tIn.value, sd = +sIn.value;
      var pPR = normCdf((-30 - t) / sd);
      var pPD = 1 - normCdf((20 - t) / sd);
      var pSD = Math.max(0, 1 - pPR - pPD);
      [['PR', pPR], ['SD', pSD], ['PD', pPD]].forEach(function (x) {
        var row = coin.querySelector('[data-cat="' + x[0] + '"]');
        row.querySelector('.coin-fill').style.width = (x[1] * 100) + '%';
        row.querySelector('.coin-val').textContent = Math.round(x[1] * 100) + '%';
      });
      coin.querySelector('[data-out="true"]').textContent = (t > 0 ? '+' : '') + t + '%';
      coin.querySelector('[data-out="sd"]').textContent = '±' + sd + ' pts';
      coin.querySelector('[data-out="truth"]').textContent = CATEGORY_NAMES[recistCategory(t)];
      tIn.setAttribute('aria-valuetext', 'True change ' + t + '%');
      sIn.setAttribute('aria-valuetext', 'Reader variation ' + sd + ' points');
    };
    tIn.addEventListener('input', updateCoin);
    sIn.addEventListener('input', updateCoin);
    updateCoin();
  }

  // ---------------------------------------------------------------
  // 8. There Is No Average Patient: Reweight the Trial
  //    Reweights subgroup results from the trial's mix to the mix of
  //    patients actually treated (Khozin & Stein, BBA Rev Cancer 2022).
  // ---------------------------------------------------------------
  var rw = document.getElementById('reweight');
  if (rw) {
    var PRESETS = {
      same: { mode: 'same', scale: 'rr', common: 10, groups: [
        { n: 'Group A', t: 30, r: 1.1, c: 80, e: 10 },
        { n: 'Group B', t: 0, r: 33.5, c: 16.7, e: 10 },
        { n: 'Group C', t: 70, r: 65.3, c: 75, e: 10 } ] },
      differ: { mode: 'each', scale: 'rr', common: 10, groups: [
        { n: 'Group A', t: 30, r: 1.1, c: 80, e: 10 },
        { n: 'Group B', t: 0, r: 33.5, c: 16.7, e: 0 },
        { n: 'Group C', t: 70, r: 65.3, c: 75, e: 10 } ] },
      blank: { mode: 'same', scale: 'rr', common: 20, groups: [
        { n: 'Younger than 70', t: 80, r: 55, c: 40, e: 20 },
        { n: '70 and older', t: 20, r: 45, c: 55, e: 20 } ] }
    };
    var COLORS = ['var(--ink)', 'var(--cobalt)', 'var(--signal)', 'var(--stone)', 'var(--vermilion)', 'var(--cobalt-tint)'];
    var state = JSON.parse(JSON.stringify(PRESETS.same));
    try {
      var qs = new URLSearchParams(location.search).get('rw');
      if (qs) { var parsed = JSON.parse(qs); if (parsed && parsed.groups && parsed.groups.length >= 2) state = parsed; }
    } catch (e) { /* ignore a malformed link */ }

    var body = rw.querySelector('.rw-rows');
    var q = function (sel) { return rw.querySelector(sel); };
    var clamp = function (v, lo, hi) { v = parseFloat(v); return isNaN(v) ? lo : Math.min(hi, Math.max(lo, v)); };
    var pct = function (x, d) { return (x * 100).toFixed(d === undefined ? 1 : d) + '%'; };
    var treated = function (c, e) {
      if (state.scale === 'or') { var o = Math.max(0.0001, e); return o * c / (1 - c + o * c); }
      return Math.min(1, Math.max(0, c * (1 - e / 100)));
    };
    var nntText = function (arr) {
      if (Math.abs(arr) < 1e-9) return { big: '—', note: 'No difference between arms' };
      if (arr > 0) return { big: String(Math.round(1 / arr)), note: 'treated for one to benefit' };
      return { big: String(Math.round(-1 / arr)), note: 'treated for one to be harmed' };
    };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); };

    var drawRows = function () {
      body.innerHTML = '';
      state.groups.forEach(function (g, i) {
        var row = document.createElement('div');
        row.className = 'rw-row';
        row.innerHTML =
          '<span class="rw-swatch" style="background:' + COLORS[i % COLORS.length] + '"></span>' +
          '<label class="rw-cell rw-name"><span>Group</span><input type="text" data-k="n" value="' + esc(g.n) + '" maxlength="40"></label>' +
          '<label class="rw-cell"><span>Share of trial, %</span><input type="number" data-k="t" min="0" max="100" step="0.1" value="' + g.t + '"></label>' +
          '<label class="rw-cell"><span>Share of real world, %</span><input type="number" data-k="r" min="0" max="100" step="0.1" value="' + g.r + '"></label>' +
          '<label class="rw-cell"><span>Event rate untreated, %</span><input type="number" data-k="c" min="0" max="100" step="0.1" value="' + g.c + '"></label>' +
          '<label class="rw-cell rw-effect"><span>' + (state.scale === 'or' ? 'Odds ratio' : 'Relative reduction, %') + '</span><input type="number" data-k="e" step="' + (state.scale === 'or' ? '0.01' : '1') + '" value="' + g.e + '"></label>' +
          '<button class="rw-remove" type="button" aria-label="Remove ' + esc(g.n) + '"' + (state.groups.length <= 2 ? ' disabled' : '') + '>&times;</button>';
        row.querySelectorAll('input').forEach(function (inp) {
          inp.addEventListener('input', function () {
            var k = inp.dataset.k;
            if (k === 'n') g.n = inp.value || ('Group ' + (i + 1));
            else if (k === 'e') g.e = state.scale === 'or' ? clamp(inp.value, 0.01, 20) : clamp(inp.value, -200, 100);
            else g[k] = clamp(inp.value, 0, 100);
            compute(false);
          });
        });
        row.querySelector('.rw-remove').addEventListener('click', function () { state.groups.splice(i, 1); drawAll(); });
        body.appendChild(row);
      });
      rw.classList.toggle('is-same', state.mode === 'same');
      q('.rw-add').disabled = state.groups.length >= 6;
    };

    var syncControls = function () {
      rw.querySelectorAll('[name="rw-mode"]').forEach(function (r) { r.checked = r.value === state.mode; });
      rw.querySelectorAll('[name="rw-scale"]').forEach(function (r) { r.checked = r.value === state.scale; });
      var ce = q('[name="rw-common"]');
      ce.value = state.common;
      ce.step = state.scale === 'or' ? '0.01' : '1';
      q('.rw-common-label').textContent = state.scale === 'or' ? 'Odds ratio for every group' : 'Relative reduction for every group, %';
    };

    var linkTimer;
    var compute = function (fromLoad) {
      var G = state.groups;
      var sumT = 0, sumR = 0;
      G.forEach(function (g) { sumT += g.t; sumR += g.r; });
      var warn = [];
      if (sumT <= 0 || sumR <= 0) {
        q('.rw-results').classList.add('is-empty');
        q('.rw-warnings').innerHTML = '<li>Enter at least one group with a share above zero in both the trial and the real world.</li>';
        return;
      }
      q('.rw-results').classList.remove('is-empty');
      var calc = function (key, sum) {
        var C = 0, T = 0;
        G.forEach(function (g) {
          var w = g[key] / sum, c = g.c / 100;
          var e = state.mode === 'same' ? state.common : g.e;
          C += w * c; T += w * treated(c, e);
        });
        return { C: C, T: T, arr: C - T };
      };
      var tr = calc('t', sumT), rl = calc('r', sumR);
      var put = function (k, v) { var el = q('[data-out="' + k + '"]'); if (el) el.textContent = v; };
      put('tr-c', pct(tr.C)); put('tr-t', pct(tr.T)); put('tr-arr', pct(tr.arr));
      put('rl-c', pct(rl.C)); put('rl-t', pct(rl.T)); put('rl-arr', pct(rl.arr));
      var nt = nntText(tr.arr), nr = nntText(rl.arr);
      put('tr-nnt', nt.big); put('tr-nnt-note', nt.note); put('rl-nnt', nr.big); put('rl-nnt-note', nr.note);
      var diff = '';
      if (tr.arr > 0 && rl.arr > 0) {
        // compare the rounded numbers people see, as the paper does
        var ch = (Math.round(1 / rl.arr) / Math.round(1 / tr.arr) - 1) * 100;
        diff = Math.abs(ch) < 0.5 ? 'The same benefit as the trial reports'
          : (ch > 0 ? '+' + Math.round(ch) + '% more patients treated per benefit than the trial reports'
                    : Math.round(-ch) + '% fewer patients treated per benefit than the trial reports');
      } else if (tr.arr > 0 && rl.arr <= 0) diff = 'The benefit reported in the trial disappears in this population';
      put('diff', diff);

      // composition bars and representation
      ['t', 'r'].forEach(function (key) {
        var bar = q('.rw-bar[data-pop="' + key + '"] .rw-bar-fill');
        var sum = key === 't' ? sumT : sumR;
        bar.innerHTML = G.map(function (g, i) {
          var w = g[key] / sum * 100;
          return w > 0 ? '<i style="width:' + w + '%;background:' + COLORS[i % COLORS.length] + '" title="' + esc(g.n) + ': ' + w.toFixed(1) + '%"></i>' : '';
        }).join('');
      });
      var rep = q('.rw-rep');
      rep.innerHTML = G.map(function (g, i) {
        var t = g.t / sumT, r = g.r / sumR;
        var ratio = r > 0 ? t / r : null;
        var tag = ratio === null ? 'Not in the real-world mix' : t === 0 ? 'Absent from the trial' : ratio < 0.5 ? 'Under-represented' : ratio > 2 ? 'Over-represented' : 'Roughly proportional';
        var cls = t === 0 ? 'is-absent' : (ratio !== null && ratio < 0.5) ? 'is-under' : '';
        return '<li class="' + cls + '"><span class="rw-swatch" style="background:' + COLORS[i % COLORS.length] + '"></span><b>' + esc(g.n) + '</b><span>' + (t * 100).toFixed(1) + '% of trial vs ' + (r * 100).toFixed(1) + '% of real world' + (ratio !== null && t > 0 ? ' (' + ratio.toFixed(2) + '×)' : '') + '</span><em>' + tag + '</em></li>';
      }).join('');

      G.forEach(function (g) {
        if (g.t === 0 && g.r > 0) warn.push('<b>' + esc(g.n) + '</b> was not in the trial. Its treatment effect is an assumption, not evidence: test a range of values.');
      });
      if (Math.abs(sumT - 100) > 0.5) warn.push('Trial shares add up to ' + sumT.toFixed(1) + '%. They have been rescaled to 100%.');
      if (Math.abs(sumR - 100) > 0.5) warn.push('Real-world shares add up to ' + sumR.toFixed(1) + '%. They have been rescaled to 100%.');
      q('.rw-warnings').innerHTML = warn.map(function (w) { return '<li>' + w + '</li>'; }).join('');

      // one patient
      var sel = q('.rw-patient select');
      var keep = sel.value;
      sel.innerHTML = G.map(function (g, i) { return '<option value="' + i + '">' + esc(g.n) + '</option>'; }).join('');
      if (keep !== '' && +keep < G.length) sel.value = keep;
      var pg = G[+sel.value || 0];
      var pc = pg.c / 100, pt = treated(pc, state.mode === 'same' ? state.common : pg.e);
      var pn = nntText(pc - pt);
      put('pt-c', pct(pc)); put('pt-t', pct(pt)); put('pt-arr', pct(pc - pt)); put('pt-nnt', pn.big); put('pt-nnt-note', pn.note);
      put('pt-flag', pg.t === 0 ? 'This group was absent from the trial: treat this estimate as a hypothesis.' : '');

      if (!fromLoad) {
        clearTimeout(linkTimer);
        linkTimer = setTimeout(function () {
          try {
            var u = new URL(location.href);
            u.searchParams.set('rw', JSON.stringify(state));
            history.replaceState(null, '', u.pathname + u.search + '#rw-tool');
          } catch (e) { /* history unavailable */ }
        }, 300);
      }
    };
    var drawAll = function (fromLoad) { syncControls(); drawRows(); compute(fromLoad); };

    rw.querySelectorAll('[name="rw-mode"]').forEach(function (r) {
      r.addEventListener('change', function () { state.mode = r.value; drawAll(); });
    });
    rw.querySelectorAll('[name="rw-scale"]').forEach(function (r) {
      r.addEventListener('change', function () {
        state.scale = r.value;
        // switch to a neutral default on the new scale
        state.common = state.scale === 'or' ? 0.7 : 10;
        state.groups.forEach(function (g) { g.e = state.common; });
        drawAll();
      });
    });
    q('[name="rw-common"]').addEventListener('input', function (ev) {
      state.common = state.scale === 'or' ? clamp(ev.target.value, 0.01, 20) : clamp(ev.target.value, -200, 100);
      compute(false);
    });
    q('.rw-add').addEventListener('click', function () {
      state.groups.push({ n: 'Group ' + String.fromCharCode(65 + state.groups.length), t: 0, r: 0, c: 50, e: state.common });
      drawAll();
    });
    rw.querySelectorAll('[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () { state = JSON.parse(JSON.stringify(PRESETS[b.dataset.preset])); drawAll(); });
    });
    q('.rw-patient select').addEventListener('change', function () { compute(false); });
    q('[data-rw="copy"]').addEventListener('click', function (ev) {
      var btn = ev.currentTarget;
      var done = function () { btn.textContent = 'Link copied'; setTimeout(function () { btn.textContent = 'Copy link to these numbers'; }, 1800); };
      try { navigator.clipboard.writeText(location.href).then(done, function () { window.prompt('Copy this link:', location.href); }); }
      catch (e) { window.prompt('Copy this link:', location.href); }
    });
    q('[data-rw="print"]').addEventListener('click', function () { printOnly('print-rw'); });

    // Quick estimate: trial rates plus a real-world baseline (appendix A.2)
    var quick = q('.rw-quick');
    var updQuick = function () {
      var p = clamp(quick.querySelector('[name="qp"]').value, 0.1, 99.9) / 100;
      var a = clamp(quick.querySelector('[name="qa"]').value, 0.1, 99.9) / 100;
      var r = clamp(quick.querySelector('[name="qr"]').value, 0.1, 99.9) / 100;
      var odds = function (x) { return x / (1 - x); };
      var orT = odds(a) / odds(p);
      var xOR = orT * odds(r) / (1 + orT * odds(r));
      var xRR = Math.min(1, r * a / p);
      var setq = function (k, v) { quick.querySelector('[data-q="' + k + '"]').textContent = v; };
      setq('trial-arr', pct(p - a)); setq('trial-nnt', nntText(p - a).big);
      setq('or-t', pct(xOR)); setq('or-arr', pct(r - xOR)); setq('or-nnt', nntText(r - xOR).big);
      setq('rr-t', pct(xRR)); setq('rr-arr', pct(r - xRR)); setq('rr-nnt', nntText(r - xRR).big);
    };
    quick.querySelectorAll('input').forEach(function (i) { i.addEventListener('input', updQuick); });
    updQuick();

    // Tabs
    var tabs = rw.querySelectorAll('.rw-tab');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) { var on = o === t; o.setAttribute('aria-selected', String(on)); document.getElementById(o.getAttribute('aria-controls')).hidden = !on; });
      });
    });

    drawAll(true);
    if (new URLSearchParams(location.search).get('rw') && location.hash === '#rw-tool') {
      setTimeout(function () { var el = document.getElementById('rw-tool'); if (el) el.scrollIntoView(); }, 50);
    }
  }

  // ---------------------------------------------------------------
  // 9. The Patient-Centered Estimand. Survival is modeled from the
  //    median with a constant hazard, S(t) = 0.5^(t/median); under
  //    proportional hazards the treated arm is S(t)^HR, and the number
  //    needed to benefit is 1 / (S^HR - S) (Altman & Andersen 1999).
  // ---------------------------------------------------------------
  var survAt = function (t, median) { return Math.pow(0.5, t / median); };
  var fmtN = function (n) { return n < 10 ? n.toFixed(1) : String(Math.round(n)); };
  var signed = function (x) { var r = Math.round(x); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r); };

  // 9a. One hazard ratio, five prognoses (benefit at 12 months)
  var sameHr = document.getElementById('same-hr');
  if (sameHr) {
    var hrIn = sameHr.querySelector('[name="hr"]');
    var barsHost = sameHr.querySelector('.hr-bars');
    var MEDIANS = [3, 6, 12, 24, 60];
    barsHost.innerHTML = MEDIANS.map(function (m) {
      return '<div class="hr-row"><span class="hr-label">Median ' + m + ' months</span><span class="hr-track"><i></i></span><span class="hr-val"></span></div>';
    }).join('');
    var updHr = function () {
      var hr = +hrIn.value / 100;
      sameHr.querySelector('[data-out="hr"]').textContent = hr.toFixed(2);
      hrIn.setAttribute('aria-valuetext', 'hazard ratio ' + hr.toFixed(2));
      var vals = MEDIANS.map(function (m) { var s = survAt(12, m); return Math.pow(s, hr) - s; });
      var best = Math.max.apply(null, vals);
      barsHost.querySelectorAll('.hr-row').forEach(function (row, i) {
        var d = vals[i];
        row.querySelector('i').style.width = Math.min(100, d * 100 / 50 * 100) + '%';
        row.classList.toggle('is-best', d === best);
        row.querySelector('.hr-val').innerHTML = '<b>+' + Math.round(d * 100) + '</b> per 100 &middot; <b>' + fmtN(1 / d) + '</b> treated';
      });
    };
    hrIn.addEventListener('input', updHr);
    updHr();
  }

  // 9b. A mixed population: subgroup hazard ratios from IPASS, one
  //     illustrative control median for both groups.
  var mix = document.getElementById('mixture');
  if (mix) {
    var pIn = mix.querySelector('[name="p"]');
    var MW = 560, MH = 260, ML = 44, MR = 14, MT = 14, MB = 34, TMAX = 24, YMIN = -40, YMAX = 30;
    var msvg = svgEl('svg', { viewBox: '0 0 ' + MW + ' ' + MH, class: 'mix-svg', role: 'img', 'aria-label': 'Extra patients free of progression per 100 treated, over 24 months' }, mix.querySelector('.mix-chart'));
    var mx = function (t) { return ML + t / TMAX * (MW - ML - MR); };
    var my = function (v) { return MT + (YMAX - v) / (YMAX - YMIN) * (MH - MT - MB); };
    [-40, -20, 0, 20].forEach(function (v) {
      svgEl('line', { x1: ML, x2: MW - MR, y1: my(v), y2: my(v), class: v === 0 ? 'ax-zero' : 'ax-grid' }, msvg);
      svgEl('text', { x: ML - 8, y: my(v) + 4, class: 'ax-label', 'text-anchor': 'end' }, msvg).textContent = (v > 0 ? '+' : '') + v;
    });
    [0, 6, 12, 18, 24].forEach(function (t) {
      svgEl('text', { x: mx(t), y: MH - 12, class: 'ax-label', 'text-anchor': 'middle' }, msvg).textContent = t + (t === 24 ? ' mo' : '');
    });
    var pathFor = function (fn) {
      var d = '';
      for (var t = 0; t <= TMAX + 1e-9; t += 0.25) d += (t === 0 ? 'M' : 'L') + mx(t).toFixed(1) + ' ' + my(fn(t) * 100).toFixed(1);
      return d;
    };
    var gainPos = function (t) { var s = survAt(t, 6); return Math.pow(s, 0.48) - s; };
    var gainNeg = function (t) { var s = survAt(t, 6); return Math.pow(s, 2.85) - s; };
    svgEl('path', { d: pathFor(gainPos), class: 'mix-line mix-pos' }, msvg);
    svgEl('path', { d: pathFor(gainNeg), class: 'mix-line mix-neg' }, msvg);
    var crossLine = svgEl('line', { y1: MT, y2: MH - MB, class: 'mix-cross' }, msvg);
    var allPath = svgEl('path', { class: 'mix-line mix-all' }, msvg);
    var mout = function (k, v) { mix.querySelector('[data-out="' + k + '"]').textContent = v; };
    var updMix = function () {
      var p = +pIn.value / 100;
      var all = function (t) { return p * gainPos(t) + (1 - p) * gainNeg(t); };
      allPath.setAttribute('d', pathFor(all));
      mout('p', Math.round(p * 100) + '%');
      pIn.setAttribute('aria-valuetext', Math.round(p * 100) + '% with the mutation');
      var minV = 0, minT = 0, cross = null, prev = 0;
      for (var t = 0.25; t <= TMAX + 1e-9; t += 0.25) {
        var v = all(t);
        if (v < minV) { minV = v; minT = t; }
        if (cross === null && prev < 0 && v >= 0) cross = t;
        prev = v;
      }
      mout('early', minV < -0.005 ? signed(minV * 100) : 'None');
      mout('early-t', minV < -0.005 ? minT.toFixed(1).replace('.0', '') + ' months' : 'no point');
      mout('cross', minV >= -0.005 || cross === null ? '—' : (Math.round(cross * 2) / 2).toString());
      mout('cross-note', minV >= -0.005 ? 'No early harm to turn around' : cross === null ? 'Harm does not turn into benefit within 24 months' : 'Months until harm turns into benefit');
      crossLine.style.display = cross === null || minV >= -0.005 ? 'none' : '';
      if (cross !== null) { crossLine.setAttribute('x1', mx(cross)); crossLine.setAttribute('x2', mx(cross)); }
      var d12 = all(12);
      if (Math.abs(d12) < 0.0005) { mout('nnb12', '—'); mout('nnb12-note', 'no difference'); }
      else if (d12 > 0) { mout('nnb12', fmtN(1 / d12)); mout('nnb12-note', 'treated for one more to be free of progression'); }
      else { mout('nnb12', fmtN(-1 / d12)); mout('nnb12-note', 'treated for one more to progress'); }
    };
    pIn.addEventListener('input', updMix);
    updMix();
  }

  // 9c. Which ruler? NNB point estimates for the thirty trials in Table 1
  //     of Raju, Khozin, et al. 2020. g: e = approved, molecularly
  //     selected; n = approved, unselected; w = withdrawn or not approved.
  var epHost = document.querySelector('#endpoints .ep-chart');
  if (epHost) {
    var TRIALS = [
      ['Gefitinib', 'Study 39 (single arm)', 'ORR', 9.5, 'n', 2003], ['Gefitinib', 'ISEL', 'OS', 25.2, 'w', 2005],
      ['Gefitinib', 'IPASS', 'PFS', 10.1, 'n', 2015], ['Gefitinib', 'IFUM (single arm)', 'ORR', 1.9, 'e', 2015],
      ['Erlotinib', 'BR.21', 'OS', 9.7, 'n', 2004], ['Erlotinib', 'EURTAC', 'PFS', 3.4, 'e', 2013],
      ['Cetuximab + chemotherapy', 'FLEX', 'OS', 21.4, 'w', 2005], ['Bevacizumab + chemotherapy', 'E4599', 'OS', 13.5, 'n', 2006],
      ['Pemetrexed', 'JMEN', 'PFS', 4.8, 'n', 2009], ['Crizotinib', 'Study 1001 (single arm)', 'ORR', 3.1, 'e', 2011],
      ['Crizotinib', 'Study 1005 (single arm)', 'ORR', 4.6, 'e', 2011], ['Crizotinib', 'Study 1007', 'PFS', 4.7, 'e', 2013],
      ['Crizotinib', 'PROFILE 1001, ROS1 (single arm)', 'ORR', 1.8, 'e', 2016], ['Afatinib', 'LUX-Lung 3 (1200.32)', 'PFS', 5.9, 'e', 2013],
      ['Afatinib', 'LUX-Lung 8', 'PFS', 14.2, 'n', 2016], ['Ceritinib', 'X2101 (single arm)', 'ORR', 4.2, 'e', 2014],
      ['Ceritinib', 'ASCEND-4', 'PFS', 5.5, 'e', 2017], ['Ramucirumab + docetaxel', 'REVEL', 'OS', 19.6, 'n', 2014],
      ['Nivolumab', 'CheckMate 017', 'OS', 6.1, 'n', 2015], ['Nivolumab', 'CheckMate 057', 'OS', 9.7, 'n', 2015],
      ['Necitumumab + chemotherapy', 'SQUIRE', 'OS', 17.3, 'n', 2015], ['Osimertinib', 'AURA 2 (single arm)', 'ORR', 3.3, 'e', 2015],
      ['Osimertinib', 'AURA 3', 'PFS', 3.2, 'e', 2017], ['Alectinib', 'NP28761 (single arm)', 'ORR', 3.6, 'e', 2015],
      ['Alectinib', 'NP28763 (single arm)', 'ORR', 3.3, 'e', 2015], ['Alectinib', 'ALEX', 'PFS', 4.5, 'e', 2017],
      ['Pembrolizumab', 'KEYNOTE-001 (single arm)', 'ORR', 2.5, 'e', 2015], ['Pembrolizumab', 'KEYNOTE-024', 'PFS', 4.8, 'e', 2016],
      ['Atezolizumab', 'OAK', 'OS', 9.7, 'n', 2016], ['Dabrafenib + trametinib', 'BRF113928 (single arm)', 'ORR', 2.2, 'e', 2017]
    ];
    var EP = { ORR: 'Response rate', PFS: 'Progression-free survival', OS: 'Overall survival' };
    var GROUP = { e: 'approved, molecularly selected population', n: 'approved, unselected population', w: 'withdrawn or not approved' };
    var xPct = function (v) { return Math.log(v) / Math.log(30) * 100; };
    var html = '';
    ['ORR', 'PFS', 'OS'].forEach(function (ep) {
      var rows = TRIALS.map(function (t, i) { return { t: t, i: i }; }).filter(function (o) { return o.t[2] === ep; })
        .sort(function (a, b) { return a.t[3] - b.t[3]; });
      var lanes = [];
      var mean = rows.reduce(function (s, o) { return s + o.t[3]; }, 0) / rows.length;
      var dots = rows.map(function (o) {
        var x = xPct(o.t[3]), lane = 0;
        while (lanes[lane] !== undefined && x - lanes[lane] < 3.2) lane++;
        lanes[lane] = x;
        return '<button type="button" class="ep-dot is-' + o.t[4] + '" style="left:' + x.toFixed(2) + '%;--lane:' + lane + '" data-i="' + o.i + '" aria-label="' +
          o.t[0] + ', ' + o.t[1] + ': ' + o.t[3] + ' treated per benefit"></button>';
      }).join('');
      html += '<div class="ep-row"><span class="ep-name">' + EP[ep] + '<em>avg ' + mean.toFixed(1) + '</em></span><div class="ep-track">' +
        '<i class="ep-mean" style="left:' + xPct(mean).toFixed(2) + '%"></i>' + dots + '</div></div>';
    });
    html += '<div class="ep-row ep-axis" aria-hidden="true"><span></span><div class="ep-track">' + [1, 2, 3, 5, 10, 20, 30].map(function (v) {
      return '<span style="left:' + xPct(v).toFixed(2) + '%">' + v + '</span>';
    }).join('') + '</div></div>';
    epHost.innerHTML = html;
    var readout = document.querySelector('#endpoints .ep-readout');
    epHost.querySelectorAll('.ep-dot').forEach(function (b) {
      var show = function () {
        var t = TRIALS[+b.dataset.i];
        epHost.querySelectorAll('.ep-dot').forEach(function (o) { o.classList.toggle('is-on', o === b); });
        readout.innerHTML = '<b>' + t[0] + '</b> &middot; ' + t[1] + ' &middot; ' + EP[t[2]] + ' &middot; <b>' + t[3] + '</b> treated per benefit &middot; ' + GROUP[t[4]] + ', FDA decision ' + t[5];
      };
      b.addEventListener('click', show);
      b.addEventListener('focus', show);
      b.addEventListener('mouseenter', show);
    });
  }

  // 9d. The frontier: NNB at the untreated median (6 months) from the
  //     best available median, with the implied HR = 6 / median.
  var fr = document.getElementById('frontier');
  if (fr) {
    var fIn = fr.querySelector('[name="m"]');
    var FW = 560, FH = 240, FL = 40, FR = 16, FT = 14, FB = 34, X0 = 8, X1 = 48, Y1 = 11;
    var fsvg = svgEl('svg', { viewBox: '0 0 ' + FW + ' ' + FH, class: 'fr-svg', role: 'img', 'aria-label': 'Patients treated per benefit falls toward a floor of 2 as median survival rises' }, fr.querySelector('.fr-chart'));
    var fx = function (m) { return FL + (m - X0) / (X1 - X0) * (FW - FL - FR); };
    var fy = function (n) { return FT + (Y1 - n) / Y1 * (FH - FT - FB); };
    var nnbAt = function (m) { return 1 / (Math.pow(0.5, 6 / m) - 0.5); };
    [0, 2, 4, 6, 8, 10].forEach(function (n) {
      svgEl('line', { x1: FL, x2: FW - FR, y1: fy(n), y2: fy(n), class: n === 2 ? 'ax-floor' : 'ax-grid' }, fsvg);
      svgEl('text', { x: FL - 8, y: fy(n) + 4, class: 'ax-label', 'text-anchor': 'end' }, fsvg).textContent = n;
    });
    svgEl('text', { x: FL + 8, y: fy(2) + 16, class: 'ax-label ax-floor-label' }, fsvg).textContent = 'Floor: 2';
    [8, 18, 28, 38, 48].forEach(function (m) {
      svgEl('text', { x: fx(m), y: FH - 12, class: 'ax-label', 'text-anchor': 'middle' }, fsvg).textContent = m + (m === 48 ? ' mo' : '');
    });
    var fd = '';
    for (var m = X0; m <= X1 + 1e-9; m += 0.25) fd += (m === X0 ? 'M' : 'L') + fx(m).toFixed(1) + ' ' + fy(Math.min(Y1, nnbAt(m))).toFixed(1);
    svgEl('path', { d: fd, class: 'fr-line' }, fsvg);
    [[9, '2003'], [39.7, '2017']].forEach(function (pt) {
      svgEl('circle', { cx: fx(pt[0]), cy: fy(nnbAt(pt[0])), r: 5, class: 'fr-mark' }, fsvg);
      svgEl('text', { x: fx(pt[0]) + 10, y: fy(nnbAt(pt[0])) - 10, class: 'ax-label fr-mark-label' }, fsvg).textContent = pt[1] + ': ' + nnbAt(pt[0]).toFixed(1);
    });
    var fDot = svgEl('circle', { r: 8, class: 'fr-dot' }, fsvg);
    var fo = function (k, v) { fr.querySelector('[data-out="' + k + '"]').textContent = v; };
    var updFr = function () {
      var mv = +fIn.value, hr = 6 / mv, n = nnbAt(mv);
      fDot.setAttribute('cx', fx(mv)); fDot.setAttribute('cy', fy(Math.min(Y1, n)));
      fo('m', mv.toFixed(1) + ' months'); fo('hr', hr.toFixed(2)); fo('arr', '+' + Math.round((Math.pow(0.5, hr) - 0.5) * 100)); fo('nnb', n.toFixed(1));
      fIn.setAttribute('aria-valuetext', mv.toFixed(1) + ' months');
    };
    fIn.addEventListener('input', updFr);
    fr.querySelectorAll('[data-m]').forEach(function (b) { b.addEventListener('click', function () { fIn.value = b.dataset.m; updFr(); }); });
    updFr();
  }

  // Printing one tool at a time: the body class scopes the print styles
  function printOnly(cls) {
    document.body.classList.add(cls);
    var done = function () { document.body.classList.remove(cls); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  }

  // 9e. Translate the trial
  var tt = document.getElementById('translate');
  if (tt) {
    var TT_PRESETS = {
      ras302: { ep: 'os', hr: 0.40, m: 6.6, t: 12, hl: 'Grade 3+ treatment-related adverse events', hc: 57.5, ht: 43.6,
        src: 'RASolute 302: daraxonrasib vs chemotherapy, previously treated metastatic pancreatic cancer, RAS G12 population. Adverse events are for the whole randomized population.',
        land: { t: 12, c: 18.7, x: 53.3 } },
      cm017: { ep: 'os', hr: 0.59, m: 6.0, t: 12, hl: 'Grade 3–4 treatment-related adverse events', hc: 55, ht: 7,
        src: 'CheckMate 017: nivolumab vs docetaxel, previously treated squamous non-small cell lung cancer.',
        land: { t: 12, c: 24, x: 42 } },
      cm057: { ep: 'os', hr: 0.73, m: 9.4, t: 12, hl: 'Grade 3–4 treatment-related adverse events', hc: 54, ht: 10,
        src: 'CheckMate 057: nivolumab vs docetaxel, previously treated nonsquamous non-small cell lung cancer. The survival curves crossed early, so constant hazards fit poorly before 6 months.',
        land: { t: 12, c: 39, x: 51 } },
      kn024: { ep: 'pfs', hr: 0.50, m: 6.0, t: 12, hl: 'Grade 3–5 treatment-related adverse events', hc: 53.3, ht: 26.6,
        src: 'KEYNOTE-024: pembrolizumab vs platinum chemotherapy, first-line non-small cell lung cancer with PD-L1 at 50% or more.' },
      alex: { ep: 'pfs', hr: 0.47, m: 11.6, t: 12, hl: 'Grade 3–5 adverse events', hc: 50, ht: 41,
        src: 'ALEX: alectinib vs crizotinib, untreated ALK-positive non-small cell lung cancer. Control median estimated from the reported 48.7% progression-free at 12 months.',
        land: { t: 12, c: 48.7, x: 68.4 } },
      flex: { ep: 'os', hr: 0.871, m: 10.1, t: 12, hl: 'Grade 3 acne-like rash', hc: 0, ht: 10,
        src: 'FLEX: cetuximab plus chemotherapy vs chemotherapy, first-line non-small cell lung cancer. Rash rate on the control arm set to 0% for illustration.' }
    };
    var tst = JSON.parse(JSON.stringify(TT_PRESETS.ras302));
    tst.preset = 'ras302';
    try {
      var tq = new URLSearchParams(location.search).get('tt');
      if (tq) { var tp = JSON.parse(tq); if (tp && tp.hr && tp.m) tst = tp; }
    } catch (e) { /* ignore a malformed link */ }

    var tget = function (s) { return tt.querySelector(s); };
    var tput = function (k, v) { var el = tget('[data-out="' + k + '"]'); if (el) el.textContent = v; };
    var tclamp = function (v, lo, hi, dflt) { v = parseFloat(v); return isNaN(v) ? dflt : Math.min(hi, Math.max(lo, v)); };
    var tesc = function (s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); };
    var months = function (t) { return t + (t === 1 ? ' month' : ' months'); };

    var CW = 560, CH = 230, CL = 40, CR = 16, CT = 12, CB = 32;
    var csvg = svgEl('svg', { viewBox: '0 0 ' + CW + ' ' + CH, class: 'tt-svg' }, tget('.tt-chart'));
    var cg = svgEl('g', {}, csvg);

    var syncInputs = function () {
      tget('[name="ep"]').value = tst.ep;
      ['hr', 'm', 'hl', 'hc', 'ht', 't'].forEach(function (k) { tget('[name="' + k + '"]').value = tst[k]; });
      tt.querySelectorAll('[data-preset]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.preset === tst.preset)); });
      var p = TT_PRESETS[tst.preset];
      tput('source', p ? p.src : 'Custom numbers.');
    };

    var ttTimer;
    var computeTT = function (fromLoad) {
      var hr = tst.hr, m = tst.m, t = tst.t;
      var os = tst.ep === 'os';
      var word = os ? 'alive' : 'alive without progression';
      var sc = survAt(t, m), sx = Math.pow(sc, hr), d = sx - sc;
      tput('t', months(t)); tput('t2', months(t));
      tput('lbl-c', (os ? 'Alive' : 'Progression-free') + ' on control');
      tput('lbl-t', (os ? 'Alive' : 'Progression-free') + ' on treatment');
      tput('sc', (sc * 100).toFixed(1) + '%'); tput('st', (sx * 100).toFixed(1) + '%');
      tput('d100', signed(d * 100));
      tput('mt', months(Math.round(m / hr * 10) / 10));
      tput('floor', 'Even a drug that prevented every event could do no better than ' + fmtN(1 / Math.max(1e-6, 1 - sc)) + ' treated per benefit at this time point.');

      if (Math.abs(d) < 0.0005) { tput('nnb', '—'); tput('nnb-note', 'No difference in patients ' + word); }
      else if (d > 0) { tput('nnb', fmtN(1 / d)); tput('nnb-note', 'treated for one more patient to be ' + word + ' at ' + months(t)); }
      else { tput('nnb', fmtN(-1 / d)); tput('nnb-note', 'treated for one fewer patient to be ' + word + ' at ' + months(t)); }

      var hd = (tst.ht - tst.hc) / 100, hl = (tst.hl || 'the adverse event').toLowerCase();
      if (Math.abs(hd) < 0.0005) { tput('nnh', '—'); tput('nnh-note', 'No difference in ' + hl); }
      else if (hd > 0) { tput('nnh', fmtN(1 / hd)); tput('nnh-note', 'treated for one more patient to have ' + hl); }
      else { tput('nnh', fmtN(-1 / hd)); tput('nnh-note', 'treated for one fewer patient to have ' + hl); }

      var gain = Math.round(d * 100), hpp = Math.round(hd * 100);
      tput('ledger', 'Per 100 patients treated: ' + (gain >= 0 ? gain + ' more' : -gain + ' fewer') + ' ' + word + ' at ' + months(t) + '; ' +
        (hpp === 0 ? 'no difference in ' + hl : (hpp > 0 ? hpp + ' more' : -hpp + ' fewer') + ' with ' + hl) + '.');

      // the curves
      cg.innerHTML = '';
      var xmax = Math.min(60, Math.max(24, Math.ceil(Math.max(t * 1.2, m * 2.5) / 6) * 6));
      var cx = function (v) { return CL + v / xmax * (CW - CL - CR); };
      var cy = function (v) { return CT + (1 - v) * (CH - CT - CB); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
        svgEl('line', { x1: CL, x2: CW - CR, y1: cy(v), y2: cy(v), class: 'ax-grid' }, cg);
        svgEl('text', { x: CL - 8, y: cy(v) + 4, class: 'ax-label', 'text-anchor': 'end' }, cg).textContent = Math.round(v * 100) + '%';
      });
      for (var k = 0; k <= xmax; k += xmax <= 36 ? 6 : 12) {
        svgEl('text', { x: cx(k), y: CH - 10, class: 'ax-label', 'text-anchor': 'middle' }, cg).textContent = k + (k + (xmax <= 36 ? 6 : 12) > xmax ? ' mo' : '');
      }
      var ctl = '', trt = '', area = '';
      for (var u = 0; u <= xmax + 1e-9; u += xmax / 120) {
        var a = survAt(u, m), b = Math.pow(a, hr);
        ctl += (u === 0 ? 'M' : 'L') + cx(u).toFixed(1) + ' ' + cy(a).toFixed(1);
        trt += (u === 0 ? 'M' : 'L') + cx(u).toFixed(1) + ' ' + cy(b).toFixed(1);
      }
      area = trt + ctl.replace(/M/, 'L').split('L').slice(1).reverse().map(function (p) { return 'L' + p; }).join('') + 'Z';
      svgEl('path', { d: area, class: 'tt-gap' }, cg);
      svgEl('path', { d: ctl, class: 'tt-line tt-ctl' }, cg);
      svgEl('path', { d: trt, class: 'tt-line tt-trt' }, cg);
      svgEl('line', { x1: cx(t), x2: cx(t), y1: CT, y2: CH - CB, class: 'tt-at' }, cg);
      svgEl('circle', { cx: cx(t), cy: cy(sc), r: 5, class: 'tt-pt tt-pt-c' }, cg);
      svgEl('circle', { cx: cx(t), cy: cy(sx), r: 5, class: 'tt-pt tt-pt-t' }, cg);
      // treatment label above and to the right, control label below and to the left, clear of both curves
      var right = cx(t) > CW - 150, left = cx(t) < CL + 130;
      svgEl('text', { x: cx(t) + (right ? -10 : 10), y: cy(sx) - 10, class: 'ax-label tt-lab-t', 'text-anchor': right ? 'end' : 'start' }, cg).textContent = 'Treatment ' + Math.round(sx * 100) + '%';
      svgEl('text', { x: cx(t) + (left ? 10 : -10), y: cy(sc) + 20, class: 'ax-label tt-lab-c', 'text-anchor': left ? 'start' : 'end' }, cg).textContent = 'Control ' + Math.round(sc * 100) + '%';

      // one hundred patients
      var base = Math.round(Math.min(sc, sx) * 100), top = Math.round(Math.max(sc, sx) * 100);
      var diffCells = top - base, better = sx >= sc;
      var cells = '';
      for (var i = 0; i < 100; i++) cells += '<i class="' + (i < base ? 'is-base' : i < top ? (better ? 'is-gain' : 'is-loss') : 'is-none') + '"></i>';
      var grid = tget('.tt-grid');
      grid.innerHTML = cells;
      tput('k-base', base + ' ' + word + ' at ' + months(t) + ' either way');
      tput('k-gain', better ? diffCells + ' ' + word + ' because of the treatment' : diffCells + ' ' + word + ' only without the treatment');
      tput('k-none', (100 - top) + ' not ' + word + ' either way');
      tt.querySelector('.key-sq.is-gain').classList.toggle('is-loss', !better);
      grid.setAttribute('aria-label', 'Of 100 patients treated: ' + base + ' ' + word + ' either way, ' + diffCells + (better ? ' because of the treatment, ' : ' only without it, ') + (100 - top) + ' not either way.');

      // other time points
      tget('.tt-times tbody').innerHTML = [6, 12, 18, 24, 36].map(function (tp) {
        var a = survAt(tp, m), b = Math.pow(a, hr), dd = b - a;
        var n = Math.abs(dd) < 0.0005 ? '—' : dd > 0 ? fmtN(1 / dd) : fmtN(-1 / dd) + ' (harm)';
        return '<tr' + (tp === t ? ' class="is-now"' : '') + '><th scope="row">' + months(tp) + '</th><td>' + (a * 100).toFixed(1) + '%</td><td>' + (b * 100).toFixed(1) + '%</td><td>' + signed(dd * 100) + '</td><td>' + n + '</td></tr>';
      }).join('');

      // check against what the trial reported
      var pr = TT_PRESETS[tst.preset];
      var matches = pr && pr.land && Math.abs(pr.hr - hr) < 1e-9 && Math.abs(pr.m - m) < 1e-9;
      if (matches) {
        var L = pr.land, rep = 100 / (L.x - L.c), mod = survAt(L.t, m), modD = Math.pow(mod, hr) - mod;
        tput('check', 'Check against the trial: it reported ' + L.x + '% vs ' + L.c + '% ' + word + ' at ' + months(L.t) + ', or ' + fmtN(rep) + ' treated per benefit. The model gives ' + fmtN(1 / modD) + ' at the same time point.');
      } else tput('check', '');

      var warn = [];
      if (hr > 1) warn.push('A hazard ratio above 1 means events come faster on treatment. The tool reports the loss.');
      if (t > 3 * m) warn.push('This time point is more than three control medians out. Few control patients remain, and constant hazards are least reliable in the tail of a curve.');
      tget('.rw-warnings').innerHTML = warn.map(function (w) { return '<li>' + tesc(w) + '</li>'; }).join('');

      if (!fromLoad) {
        clearTimeout(ttTimer);
        ttTimer = setTimeout(function () {
          try {
            var url = new URL(location.href);
            url.searchParams.set('tt', JSON.stringify(tst));
            history.replaceState(null, '', url.pathname + url.search + '#tt-tool');
          } catch (e) { /* history unavailable */ }
        }, 300);
      }
    };

    var LIMITS = { hr: [0.05, 5, 0.7], m: [0.5, 240, 12], hc: [0, 100, 0], ht: [0, 100, 0], t: [1, 60, 12] };
    tt.querySelectorAll('input, select').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var k = inp.name;
        if (k === 'ep' || k === 'hl') tst[k] = inp.value;
        else tst[k] = tclamp(inp.value, LIMITS[k][0], LIMITS[k][1], LIMITS[k][2]);
        if (k === 't') tst.t = Math.round(tst.t);
        if (k !== 't' && k !== 'hl') {
          // edited numbers no longer describe the named trial
          var p = TT_PRESETS[tst.preset];
          if (p && (p.hr !== tst.hr || p.m !== tst.m || p.ep !== tst.ep || p.hc !== tst.hc || p.ht !== tst.ht)) {
            tst.preset = '';
            tt.querySelectorAll('[data-preset]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
            tput('source', 'Custom numbers.');
          }
        }
        computeTT(false);
      });
    });
    tt.querySelectorAll('[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () {
        tst = JSON.parse(JSON.stringify(TT_PRESETS[b.dataset.preset]));
        tst.preset = b.dataset.preset;
        delete tst.src; delete tst.land;
        syncInputs(); computeTT(false);
      });
    });
    tget('[data-tt="copy"]').addEventListener('click', function (ev) {
      var btn = ev.currentTarget;
      var done = function () { btn.textContent = 'Link copied'; setTimeout(function () { btn.textContent = 'Copy link to these numbers'; }, 1800); };
      try { navigator.clipboard.writeText(location.href).then(done, function () { window.prompt('Copy this link:', location.href); }); }
      catch (e) { window.prompt('Copy this link:', location.href); }
    });
    tget('[data-tt="print"]').addEventListener('click', function () { printOnly('print-tt'); });

    delete tst.src; delete tst.land;
    syncInputs();
    computeTT(true);
    if (new URLSearchParams(location.search).get('tt') && location.hash === '#tt-tool') {
      setTimeout(function () { var el = document.getElementById('tt-tool'); if (el) el.scrollIntoView(); }, 50);
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
