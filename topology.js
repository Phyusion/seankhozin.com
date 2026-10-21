// ================================================================
//  Topology — interactive figures for the themes
//  1. Timelines (eighty years of AI; how cancer got its names; the ruler)
//  2. RG7112 pipeline stepper
//  3. Today's toolkit: see / miss
//  4. Eroom's law slider
//  5. Reveal, sliver grid, and the contents scrollspy
//  6. From Organs to Algorithms: number needed to benefit, lung cancer
//     splits, re-sorting tumors, the alien solution
//  7. The Broken Instrument: reading a scan, attenuation, waterfalls,
//     the coin flip at the cutoff
//  8. There Is No Average Patient: the Reweight the Trial calculator
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
    q('[data-rw="print"]').addEventListener('click', function () { window.print(); });

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
