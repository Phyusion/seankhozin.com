// ================================================================
//  INFORMED figures, made interactive
//  1. The four V's capacity map  (Khozin, Kim & Pazdur, NRDD 2017, Fig. 1)
//  2. Traditional vs systems view (Khozin, Pazdur & Shah, NRDD 2018, Fig. 1)
// ================================================================
(function () {
  'use strict';

  var root = document.getElementById('informed-figures');
  if (!root) return;

  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function polar(cx, cy, r, deg) {
    var a = deg * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function arcPath(cx, cy, r, a0, a1) {
    var p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1);
    var large = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }
  function wedgePath(cx, cy, r, a0, a1) {
    var p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1);
    var large = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + cx + ' ' + cy + ' L' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) + ' Z';
  }

  // ---------- Tabs ----------
  var tabs = root.querySelectorAll('.informed-tab');
  var panels = root.querySelectorAll('.informed-fig');
  function showTab(id) {
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('aria-controls') === id;
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[i].setAttribute('tabindex', on ? '0' : '-1');
    }
    for (var j = 0; j < panels.length; j++) panels[j].hidden = panels[j].id !== id;
  }
  for (var t = 0; t < tabs.length; t++) {
    (function (tab) {
      tab.addEventListener('click', function () { showTab(tab.getAttribute('aria-controls')); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var idx = Array.prototype.indexOf.call(tabs, tab);
          var next = tabs[(idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          showTab(next.getAttribute('aria-controls')); next.focus();
        }
      });
    })(tabs[t]);
  }

  // ================================================================
  //  1. The four V's
  // ================================================================
  var AXES = [
    { key: 'velocity', name: 'Velocity', sub: 'data flow and processing', angle: 225, rot: -45,
      levels: ['Batch', 'Intermittent', 'Near-real time', 'Real time'],
      notes: [
        'Batch. Data assembled and analysed after the fact, one submission at a time.',
        'Intermittent. The 2017 baseline: data processed intermittently as part of regulatory submissions.',
        'Near-real time. INFORMED digitized premarket adverse-event reporting, replacing paper and PDF forms with data sets that can be analysed for safety signals as they arrive.',
        'Real time. Continuous monitoring at the point of routine care, where most of the population is under active treatment. The tempo of a learning health system.'
      ] },
    { key: 'volume', name: 'Volume', sub: 'data size', angle: 315, rot: 45,
      levels: ['MB', 'GB', 'TB', 'PB'],
      notes: [
        'Megabytes. Case report forms and spreadsheets.',
        'Gigabytes. The 2017 baseline: data sets supporting approval decisions were usually no more than a few gigabytes.',
        'Terabytes. Pooled trial data and imaging. INFORMED’s data-sharing symposia with Project Data Sphere aggregated open-access trial data to build external control arms.',
        'Petabytes. Population-scale, continuous streams that require high-performance computing to manage and analyse.'
      ] },
    { key: 'veracity', name: 'Veracity', sub: 'data noise and uncertainty', angle: 45, rot: -45,
      levels: ['Structured', 'Mostly structured', 'Mostly unstructured', 'Undefined'],
      notes: [
        'Structured. The 2017 baseline: clean, curated fields designed for analysis.',
        'Mostly structured. Data elements built to support billing rather than clinical research. New standards and quality control are needed before they can carry evidence.',
        'Mostly unstructured. Physician notes and free text. Capturing clinically relevant variables from vast volumes of unstructured EHR content was named as a central challenge.',
        'Undefined. No schema at all: raw sensor streams, and biomedical content still living on paper and in PDF files awaiting digitization.'
      ] },
    { key: 'variety', name: 'Variety', sub: 'data type', angle: 135, rot: 45,
      levels: ['Tables', 'Databases', 'Clinical trials', 'Electronic health records'],
      notes: [
        'Tables. Single, flat data sets.',
        'Databases. Relational stores of structured trial and registry data.',
        'Clinical trials. The 2017 baseline: approval decisions rested mainly on clinical trials and preclinical studies.',
        'Electronic health records. INFORMED’s collaborations with Flatiron Health and CancerLinQ studied advanced cancers using real-world data from EHRs. Past the edge lie sensors and wearables, video, omics, social data and the Internet of things, the substrate of the NCI digital-biomarker work using biometric sensors, computer vision and voice recognition.'
      ] }
  ];
  var RINGS = [72, 126, 180, 234];
  var CX = 320, CY = 330;
  var BASELINE = { velocity: 2, volume: 2, veracity: 1, variety: 3 };
  var BASELINE_NUM = { variety: 1, veracity: 2, volume: 3, velocity: 4 };
  var PRESETS = {
    baseline: { name: '2017 baseline', levels: BASELINE,
      title: 'Where regulatory data stood in 2017',
      text: 'Approval decisions rested on data of limited variety, mainly clinical trials and preclinical studies, that were mostly structured, in data sets of a few gigabytes, processed intermittently as part of regulatory submissions. The numbered markers are the paper’s own placement of that baseline.' },
    portfolio: { name: 'INFORMED portfolio', levels: { velocity: 3, volume: 3, veracity: 3, variety: 4 },
      title: 'Where the incubator’s projects pushed',
      text: 'A mapping of the work described in the two papers onto the four axes: real-world data from electronic health records, digitized premarket safety reporting, open-access trial data pooled for external control arms, and digital biomarkers from sensors, computer vision and voice. Each step outward called for new organizational and technical capacity.' },
    holistic: { name: 'Holistic edge', levels: { velocity: 4, volume: 4, veracity: 4, variety: 4 },
      title: 'Big data as smart data',
      text: 'The end state the 2017 paper describes: a holistic approach to personalization of therapies that takes patient, disease and environmental characteristics into account, replacing the reductionist model of a single drug against a single driver mutation, proven in a traditional trial.' }
  };

  var fourv = document.getElementById('fourv-figure');
  var fourvPanel = document.getElementById('fourv-panel');
  var state = { levels: {}, preset: 'baseline', focus: null };
  for (var a0 = 0; a0 < AXES.length; a0++) state.levels[AXES[a0].key] = BASELINE[AXES[a0].key];
  var shown = {}; for (var a1 = 0; a1 < AXES.length; a1++) shown[AXES[a1].key] = RINGS[state.levels[AXES[a1].key] - 1];

  function buildFourV() {
    var svg = el('svg', { viewBox: '0 0 640 660', class: 'fourv-svg', role: 'img', 'aria-label': 'Interactive capacity map with four axes: velocity, volume, veracity and variety' }, fourv);
    var defs = el('defs', {}, svg);
    var marker = el('marker', { id: 'fourv-arrow', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 z', class: 'fourv-arrowhead' }, marker);

    // rings
    for (var r = 0; r < RINGS.length; r++) {
      el('circle', { cx: CX, cy: CY, r: RINGS[r], class: 'fourv-ring' + (r === RINGS.length - 1 ? ' edge' : '') }, svg);
    }
    // grey expansion lines beyond the edge, as in the original
    for (var g = 0; g < AXES.length; g++) {
      var p1 = polar(CX, CY, RINGS[3] + 4, AXES[g].angle), p2 = polar(CX, CY, RINGS[3] + 42, AXES[g].angle);
      el('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: 'fourv-expand', 'marker-end': 'url(#fourv-arrow)' }, svg);
    }
    // axes
    var axesG = el('g', {}, svg);
    for (var i = 0; i < AXES.length; i++) {
      var ax = AXES[i];
      var end = polar(CX, CY, RINGS[3], ax.angle);
      el('line', { x1: CX, y1: CY, x2: end[0], y2: end[1], class: 'fourv-axis' }, axesG);
      var lp = polar(CX, CY, RINGS[3] + 66, ax.angle);
      var lab = el('text', { x: lp[0], y: lp[1], class: 'fourv-axis-label', 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, axesG);
      lab.textContent = ax.name;
      // ring labels
      for (var l = 0; l < 4; l++) {
        var pt = polar(CX, CY, RINGS[l], ax.angle);
        // offset perpendicular to the axis so the label sits beside the marker
        var perp = polar(0, 0, 21, ax.angle + (ax.angle === 225 || ax.angle === 45 ? 90 : -90));
        var tx = pt[0] + perp[0], ty = pt[1] + perp[1];
        var t = el('text', { x: tx, y: ty, class: 'fourv-ring-label', 'text-anchor': 'middle', 'dominant-baseline': 'middle', transform: 'rotate(' + ax.rot + ' ' + tx + ' ' + ty + ')', 'data-axis': ax.key, 'data-level': l + 1 }, axesG);
        t.textContent = ax.levels[l];
      }
    }
    // variety edge callout
    var vc = polar(CX, CY, RINGS[3] + 30, 135);
    var callout = el('text', { x: vc[0] - 96, y: vc[1] - 64, class: 'fourv-callout' }, svg);
    var extras = ['Beyond the edge:', 'Internet of things', 'Social', 'Video', 'Sensors and wearables', 'Omics'];
    for (var e = 0; e < extras.length; e++) {
      var ts = el('tspan', { x: vc[0] - 96, dy: e === 0 ? 0 : 13 }, callout);
      if (e === 0) ts.setAttribute('class', 'head');
      ts.textContent = extras[e];
    }
    // centre / edge labels
    el('circle', { cx: CX, cy: CY, r: 5, class: 'fourv-centre' }, svg);
    var cl = el('text', { x: CX, y: CY + 20, class: 'fourv-small', 'text-anchor': 'middle' }, svg); cl.textContent = 'Reductionist centre';
    var elb = el('text', { x: CX, y: CY - RINGS[3] - 10, class: 'fourv-small', 'text-anchor': 'middle' }, svg); elb.textContent = 'Holistic edge';

    // capacity polygon
    var poly = el('path', { class: 'fourv-poly', d: '' }, svg);
    var vertexG = el('g', {}, svg);
    // baseline markers
    for (var b = 0; b < AXES.length; b++) {
      var bp = polar(CX, CY, RINGS[BASELINE[AXES[b].key] - 1], AXES[b].angle);
      var bg = el('g', { class: 'fourv-baseline' }, svg);
      el('circle', { cx: bp[0], cy: bp[1], r: 9 }, bg);
      var bt = el('text', { x: bp[0], y: bp[1], 'text-anchor': 'middle', 'dominant-baseline': 'central' }, bg);
      bt.textContent = BASELINE_NUM[AXES[b].key];
    }
    // hit targets
    var hitG = el('g', {}, svg);
    for (var h = 0; h < AXES.length; h++) {
      for (var hl = 1; hl <= 4; hl++) {
        var hp = polar(CX, CY, RINGS[hl - 1], AXES[h].angle);
        var hit = el('circle', { cx: hp[0], cy: hp[1], r: 15, class: 'fourv-hit', role: 'button', tabindex: '0', 'data-axis': AXES[h].key, 'data-level': hl, 'aria-label': AXES[h].name + ': ' + AXES[h].levels[hl - 1] }, hitG);
        (function (axis, level) {
          hit.addEventListener('click', function () { setLevel(axis, level); });
          hit.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setLevel(axis, level); }
          });
        })(AXES[h].key, hl);
      }
    }
    var vertices = {};
    for (var v = 0; v < AXES.length; v++) vertices[AXES[v].key] = el('circle', { r: 6, class: 'fourv-vertex' }, vertexG);

    function draw() {
      var d = '';
      for (var k = 0; k < AXES.length; k++) {
        var p = polar(CX, CY, shown[AXES[k].key], AXES[k].angle);
        d += (k === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2);
        vertices[AXES[k].key].setAttribute('cx', p[0]); vertices[AXES[k].key].setAttribute('cy', p[1]);
      }
      poly.setAttribute('d', d + 'Z');
    }
    var anim = null;
    function animateTo() {
      var from = {}, to = {}, k;
      for (k in shown) { from[k] = shown[k]; to[k] = RINGS[state.levels[k] - 1]; }
      if (reduceMotion) { shown = to; draw(); return; }
      var t0 = null; if (anim) cancelAnimationFrame(anim);
      function step(ts) {
        if (!t0) t0 = ts;
        var u = Math.min(1, (ts - t0) / 380); var ease = 1 - Math.pow(1 - u, 3);
        for (var kk in from) shown[kk] = from[kk] + (to[kk] - from[kk]) * ease;
        draw();
        if (u < 1) anim = requestAnimationFrame(step);
      }
      anim = requestAnimationFrame(step);
    }
    function refreshLabels() {
      var labels = svg.querySelectorAll('.fourv-ring-label');
      for (var i = 0; i < labels.length; i++) {
        var on = Number(labels[i].getAttribute('data-level')) === state.levels[labels[i].getAttribute('data-axis')];
        labels[i].classList.toggle('on', on);
      }
      var hits = svg.querySelectorAll('.fourv-hit');
      for (var j = 0; j < hits.length; j++) {
        hits[j].setAttribute('aria-pressed', Number(hits[j].getAttribute('data-level')) === state.levels[hits[j].getAttribute('data-axis')] ? 'true' : 'false');
      }
    }
    draw(); refreshLabels();
    return { animateTo: animateTo, refreshLabels: refreshLabels };
  }

  function coverage() {
    var r = [], i;
    for (i = 0; i < AXES.length; i++) r.push(RINGS[state.levels[AXES[i].key] - 1]);
    var area = 0; for (i = 0; i < 4; i++) area += r[i] * r[(i + 1) % 4];
    return Math.round(100 * area / (4 * RINGS[3] * RINGS[3]));
  }
  function matchPreset() {
    for (var p in PRESETS) {
      var ok = true;
      for (var k in PRESETS[p].levels) if (PRESETS[p].levels[k] !== state.levels[k]) ok = false;
      if (ok) return p;
    }
    return null;
  }
  function renderFourVPanel() {
    var p = state.preset ? PRESETS[state.preset] : null;
    var h = '<div class="fig-fade">';
    h += '<span class="fig-tag">Capacity envelope · ' + (p ? esc(p.name) : 'Custom') + '</span>';
    h += '<div class="fig-stat"><span class="fig-stat-num">' + coverage() + '%</span><span class="fig-stat-label">of the holistic edge</span></div>';
    h += '<h5>' + (p ? esc(p.title) : 'A custom envelope') + '</h5>';
    h += '<p>' + (p ? esc(p.text) : 'Move any axis by clicking a ring. The shaded area is the organizational and technical capacity the data would demand.') + '</p>';
    h += '<ul class="fourv-axes">';
    for (var i = 0; i < AXES.length; i++) {
      var ax = AXES[i], lv = state.levels[ax.key];
      var open = state.focus === ax.key;
      h += '<li class="' + (open ? 'open' : '') + '"><button type="button" class="fourv-axis-row" data-axis="' + ax.key + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
           '<span class="fourv-axis-name">' + esc(ax.name) + ' <em>' + esc(ax.sub) + '</em></span>' +
           '<span class="fourv-axis-level">' + esc(ax.levels[lv - 1]) + '<i>' + lv + '/4</i></span></button>' +
           '<p class="fourv-axis-note">' + esc(ax.notes[lv - 1]) + '</p></li>';
    }
    h += '</ul></div>';
    fourvPanel.innerHTML = h;
    var rows = fourvPanel.querySelectorAll('.fourv-axis-row');
    for (var r = 0; r < rows.length; r++) {
      (function (row) {
        row.addEventListener('click', function () {
          var k = row.getAttribute('data-axis');
          state.focus = state.focus === k ? null : k;
          renderFourVPanel();
        });
      })(rows[r]);
    }
    var pb = root.querySelectorAll('.fourv-preset');
    for (var q = 0; q < pb.length; q++) pb[q].setAttribute('aria-pressed', pb[q].getAttribute('data-preset') === state.preset ? 'true' : 'false');
  }
  var chart = buildFourV();
  function setLevel(axis, level) {
    state.levels[axis] = level;
    state.preset = matchPreset();
    state.focus = axis;
    chart.animateTo(); chart.refreshLabels(); renderFourVPanel();
  }
  function applyPreset(name) {
    for (var k in PRESETS[name].levels) state.levels[k] = PRESETS[name].levels[k];
    state.preset = name; state.focus = null;
    chart.animateTo(); chart.refreshLabels(); renderFourVPanel();
  }
  var presetBtns = root.querySelectorAll('.fourv-preset');
  for (var pbtn = 0; pbtn < presetBtns.length; pbtn++) {
    (function (b) { b.addEventListener('click', function () { applyPreset(b.getAttribute('data-preset')); }); })(presetBtns[pbtn]);
  }
  renderFourVPanel();

  // ================================================================
  //  2. Traditional vs systems view
  // ================================================================
  var STAGES = [
    { key: 'pre', name: 'Preclinical', sub: 'in vitro → in vivo', lx: 60, a0: -90, a1: 30, mid: -30 },
    { key: 'clin', name: 'Clinical', sub: 'Phase 1 → 2 → 3', lx: 240, a0: 30, a1: 150, mid: 90 },
    { key: 'post', name: 'Post-market', sub: 'spontaneous “passive” reporting', lx: 420, a0: 150, a1: 270, mid: 210 }
  ];
  var STEPS = [
    { key: 'linear', label: 'Linear', tag: 'Traditional view',
      title: 'A pipeline with landmarks',
      text: 'Traditional drug development is linear and distinct from healthcare delivery. Sequential boundaries between the preclinical, clinical and post-market stages serve as landmarks for making development decisions and securing private and public investment. Evidence moves in one direction, and what happens in routine care after approval is captured mostly through spontaneous, passive reporting.' },
    { key: 'micro', label: 'Micro', tag: 'Systems view · micro level',
      title: 'Systems biology blurs preclinical and clinical',
      text: 'At the micro level, systems biology dissolves the line between the preclinical and clinical stages. Data from in vivo, in vitro and clinical pipelines are used together to understand biological systems and inform early development decisions. In silico modelling over these integrated data assets can sharpen target identification and validation, and optimize dose selection and escalation in first-in-human trials.' },
    { key: 'meso', label: 'Meso', tag: 'Systems view · learning health system',
      title: 'The learning health system blurs trials and care',
      text: 'The learning health system is an approach to clinical evidence generation that blurs the line between traditional trials and healthcare delivery. It draws on electronic health records, digital health devices and omics pipelines to support new discoveries while improving routine care. By shifting evidence generation toward the point of care, where most of the population is under active monitoring and treatment, it can reduce the cost of evidence while raising its quality.' },
    { key: 'macro', label: 'Macro', tag: 'Systems view · macro level',
      title: 'Network analysis, causal dynamics and game theory',
      text: 'At the outermost level, systems theory brings network analysis, causal dynamics and game theory to bear on policy development and on the optimization of public and private investment in the biomedical enterprise. Combined with the data from the inner layers, financial, regulatory and legal metrics can be used to construct an interconnected model with predictive capabilities.' }
  ];
  var sysFig = document.getElementById('systems-figure');
  var sysPanel = document.getElementById('systems-panel');
  var sysStep = 0;
  var SCX = 320, SCY = 268, SR = 108, R_MICRO = 132, R_MACRO = 164;

  function buildSystems() {
    var svg = el('svg', { viewBox: '0 0 640 460', class: 'systems-svg', role: 'img', 'aria-label': 'Drug development shown as a linear pipeline that reorganizes into a systems view with micro, meso and macro layers' }, sysFig);
    var defs = el('defs', {}, svg);
    var mk = el('marker', { id: 'sys-arrow', viewBox: '0 0 10 10', refX: '6', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 z', class: 'sys-arrowhead' }, mk);
    var mkg = el('marker', { id: 'sys-arrow-gold', viewBox: '0 0 10 10', refX: '6', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 z', class: 'sys-arrowhead gold' }, mkg);

    // wedges (systems mode)
    var wedges = el('g', { class: 'sys-wedges' }, svg);
    for (var w = 0; w < STAGES.length; w++) {
      el('path', { d: wedgePath(SCX, SCY, SR, STAGES[w].a0, STAGES[w].a1), class: 'sys-wedge ' + STAGES[w].key }, wedges);
    }
    // micro / meso arcs
    var arcs = el('g', { class: 'sys-arcs' }, svg);
    function labelledArc(id, r, a0, a1, text, cls, stepIdx) {
      var d = arcPath(SCX, SCY, r, a0, a1);
      var g = el('g', { class: 'sys-arc ' + cls, role: 'button', tabindex: '0', 'aria-label': text, 'data-step': stepIdx }, arcs);
      el('path', { id: id, d: d, class: 'sys-arc-path' }, g);
      el('path', { d: arcPath(SCX, SCY, r, a0, a1), class: 'sys-arc-hit' }, g);
      var t = el('text', { class: 'sys-arc-label', dy: '-7' }, g);
      var tp = el('textPath', { href: '#' + id, startOffset: '50%', 'text-anchor': 'middle' }, t);
      tp.textContent = text;
      g.addEventListener('click', function () { setStep(stepIdx); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setStep(stepIdx); } });
      return g;
    }
    labelledArc('sys-sb', R_MICRO, -32, 92, 'Systems biology', 'micro', 1);
    labelledArc('sys-lhs', R_MICRO, 96, 236, 'Learning health system', 'meso', 2);
    labelledArc('sys-net', R_MACRO, 206, 334, 'Network analysis', 'macro', 3);
    labelledArc('sys-cd', R_MACRO, -26, 100, 'Causal dynamics', 'macro', 3);
    labelledArc('sys-gt', R_MACRO, 104, 202, 'Game theory', 'macro', 3);
    // circulation arrows on the macro ring
    var flow = el('g', { class: 'sys-flow' }, svg);
    var flowAngles = [[334, 352], [100, 118], [202, 220]];
    for (var f = 0; f < flowAngles.length; f++) {
      el('path', { d: arcPath(SCX, SCY, R_MACRO, flowAngles[f][0], flowAngles[f][1]), class: 'sys-flow-path', 'marker-end': 'url(#sys-arrow-gold)' }, flow);
    }

    // linear arrows
    var linArrows = el('g', { class: 'sys-linear-arrows' }, svg);
    el('line', { x1: 222, y1: 74, x2: 236, y2: 74, class: 'sys-linear-arrow', 'marker-end': 'url(#sys-arrow)' }, linArrows);
    el('line', { x1: 402, y1: 74, x2: 416, y2: 74, class: 'sys-linear-arrow', 'marker-end': 'url(#sys-arrow)' }, linArrows);

    // ghost of the pipeline, left behind when the stages travel into the circle
    var ghost = el('g', { class: 'sys-ghost' }, svg);
    for (var gh = 0; gh < STAGES.length; gh++) {
      el('rect', { x: STAGES[gh].lx, y: 42, width: 160, height: 64, rx: 6, class: 'sys-ghost-box' }, ghost);
    }
    el('line', { x1: 222, y1: 74, x2: 236, y2: 74, class: 'sys-ghost-arrow' }, ghost);
    el('line', { x1: 402, y1: 74, x2: 416, y2: 74, class: 'sys-ghost-arrow' }, ghost);
    var ghostNote = el('text', { x: 320, y: 128, class: 'sys-ghost-note', 'text-anchor': 'middle' }, ghost);
    ghostNote.textContent = 'the same three stages, folded into one system';

    // stages: boxes that travel into the wedges
    var stagesG = el('g', { class: 'sys-stages' }, svg);
    for (var s = 0; s < STAGES.length; s++) {
      var st = STAGES[s];
      var g = el('g', { class: 'sys-stage ' + st.key, 'data-key': st.key }, stagesG);
      el('rect', { x: -80, y: -32, width: 160, height: 64, rx: 6, class: 'sys-stage-box' }, g);
      var name = el('text', { x: 0, y: -4, class: 'sys-stage-name', 'text-anchor': 'middle' }, g); name.textContent = st.name;
      var sub = el('text', { x: 0, y: 16, class: 'sys-stage-sub', 'text-anchor': 'middle' }, g); sub.textContent = st.sub;
      st.node = g;
    }
    var cap = el('text', { x: 32, y: 32, class: 'sys-mode-label' }, svg); cap.textContent = 'Traditional';
    var cap2 = el('text', { x: 32, y: 160, class: 'sys-mode-label' }, svg); cap2.textContent = 'Systems';

    function layout() {
      var systems = sysStep > 0;
      svg.classList.toggle('systems', systems);
      svg.setAttribute('data-step', sysStep);
      for (var i = 0; i < STAGES.length; i++) {
        var st = STAGES[i], tx, ty;
        if (systems) { var p = polar(SCX, SCY, 58, st.mid); tx = p[0]; ty = p[1]; }
        else { tx = st.lx + 80; ty = 74; }
        st.node.setAttribute('transform', 'translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')');
      }
      var arcNodes = svg.querySelectorAll('.sys-arc');
      for (var j = 0; j < arcNodes.length; j++) {
        var stepIdx = Number(arcNodes[j].getAttribute('data-step'));
        arcNodes[j].classList.toggle('shown', sysStep >= stepIdx);
        arcNodes[j].classList.toggle('active', sysStep === stepIdx);
        arcNodes[j].setAttribute('tabindex', sysStep >= stepIdx ? '0' : '-1');
      }
    }
    layout();
    return { layout: layout };
  }
  var sys = buildSystems();
  function renderSystemsPanel() {
    var s = STEPS[sysStep];
    sysPanel.innerHTML = '<div class="fig-fade"><span class="fig-tag">' + esc(s.tag) + '</span><h5>' + esc(s.title) + '</h5><p>' + esc(s.text) + '</p></div>';
    var btns = root.querySelectorAll('.systems-step');
    for (var i = 0; i < btns.length; i++) {
      var idx = Number(btns[i].getAttribute('data-step'));
      btns[i].setAttribute('aria-pressed', idx === sysStep ? 'true' : 'false');
      btns[i].classList.toggle('done', idx < sysStep);
    }
    var prev = root.querySelector('.systems-prev'), next = root.querySelector('.systems-next');
    if (prev) prev.disabled = sysStep === 0;
    if (next) next.disabled = sysStep === STEPS.length - 1;
  }
  function setStep(i) {
    sysStep = Math.max(0, Math.min(STEPS.length - 1, i));
    sys.layout(); renderSystemsPanel();
  }
  var stepBtns = root.querySelectorAll('.systems-step');
  for (var sb = 0; sb < stepBtns.length; sb++) {
    (function (b) { b.addEventListener('click', function () { setStep(Number(b.getAttribute('data-step'))); }); })(stepBtns[sb]);
  }
  var prevBtn = root.querySelector('.systems-prev'), nextBtn = root.querySelector('.systems-next');
  if (prevBtn) prevBtn.addEventListener('click', function () { setStep(sysStep - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { setStep(sysStep + 1); });
  renderSystemsPanel();
})();
