// ================================================================
//  Section Band Animations — neural nets and formula tickers
// ================================================================
(function() {
  var bands = document.querySelectorAll('.section-band');
  if (!bands.length) return;
  var DPR = window.devicePixelRatio || 1;

  var COL = {
    node:    [30, 58, 95],
    wire:    [30, 58, 95],
    signal:  [45, 90, 142],
    gold:    [176, 141, 87],
    goldL:   [160, 120, 60],
    formula: [40, 65, 100],
  };
  function rgba(c, a) { return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }

  var FORMULA_TEXTS = [
    'f(x) = sigmoid(Wx + b)',
    'L = -1/N \u03A3 y\u1D62 log(\u0177\u1D62)',
    '\u2207W = \u2202L/\u2202W',
    'softmax(z\u1D62) = e^z\u1D62 / \u03A3e^z\u2C7C',
    'ReLU(x) = max(0, x)',
    'P(y|x) = \u03C3(W\u1D40x + b)',
    '\u03B1 = 0.001',
    'W\u209C\u208A\u2081 = W\u209C - \u03B1\u2207L',
    'z = W\u00B7x + b',
    'a = \u03C3(z)',
    'J(\u03B8) = 1/2m \u03A3(h\u03B8 - y)\u00B2',
    'GELU(x) = x\u03A6(x)',
    'Attention(Q,K,V)',
    'H(p,q) = -\u03A3 p log q',
    '\u03C3(x) = 1/(1 + e\u207B\u02E3)',
    'BatchNorm(x) = \u03B3x\u0302 + \u03B2',
    'dropout(x, p=0.5)',
    'Adam: m\u209C = \u03B2\u2081m + (1-\u03B2\u2081)g',
    'MSE = 1/n \u03A3(y - \u0177)\u00B2',
    'F1 = 2\u00B7P\u00B7R/(P+R)',
    'conv2d(x, k, stride=1)',
  ];

  // ============================================================
  //  Per-band state
  // ============================================================
  var allBands = [];

  function initBand(bandEl) {
    var canvas = bandEl.querySelector('.band-canvas');
    var ctx = canvas.getContext('2d');
    var type = bandEl.getAttribute('data-band');
    var state = { el: bandEl, canvas: canvas, ctx: ctx, type: type, W: 0, H: 0 };
    state.mouse = { x: -9999, y: -9999 };
    state.grabbed = null;

    function cXY(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    canvas.addEventListener('mousemove', function(e) {
      var p = cXY(e);
      state.mouse.x = p.x; state.mouse.y = p.y;
      if (state.grabbed) {
        state.grabbed.ref.x = p.x - state.grabbed.ox;
        state.grabbed.ref.y = p.y - state.grabbed.oy;
        if (state.grabbed.ref.vx !== undefined) state.grabbed.ref.vx = 0;
      }
    });
    canvas.addEventListener('mouseleave', function() {
      state.mouse.x = -9999; state.mouse.y = -9999;
      if (state.grabbed) { state.grabbed.ref.grabbed = false; state.grabbed = null; }
      canvas.style.cursor = '';
    });
    canvas.addEventListener('mousedown', function(e) {
      var p = cXY(e);
      if (type === 'formula') {
        for (var i = state.formulas.length - 1; i >= 0; i--) {
          var f = state.formulas[i];
          ctx.font = f.size + "px 'Courier New', monospace";
          var tw = ctx.measureText(f.text).width, pad = 6;
          if (p.x >= f.x-pad && p.x <= f.x+tw+pad && p.y >= f.y-f.size-pad && p.y <= f.y+pad) {
            f.grabbed = true;
            state.grabbed = { ref: f, ox: p.x-f.x, oy: p.y-f.y };
            canvas.style.cursor = 'grabbing'; return;
          }
        }
      } else if (state.nodes) {
        for (var ni = 0; ni < state.nodes.length; ni++) {
          var nd = state.nodes[ni];
          var dx = p.x-nd.x, dy = p.y-nd.y, hr = Math.max(nd.r*4, 14);
          if (dx*dx+dy*dy < hr*hr) {
            nd.grabbed = true;
            state.grabbed = { ref: nd, ox: p.x-nd.x, oy: p.y-nd.y };
            canvas.style.cursor = 'grabbing'; return;
          }
        }
      }
    });
    canvas.addEventListener('mouseup', function() {
      if (state.grabbed) { state.grabbed.ref.grabbed = false; state.grabbed = null; canvas.style.cursor = ''; }
    });

    // Touch — just highlight, don't interfere with scrolling
    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        var p = cXY(e.touches[0]);
        state.mouse.x = p.x; state.mouse.y = p.y;
      }
    }, { passive: true });
    canvas.addEventListener('touchend', function() {
      state.mouse.x = -9999; state.mouse.y = -9999;
    }, { passive: true });

    allBands.push(state);
    return state;
  }

  // ============================================================
  //  Build neural band — horizontal row of nodes with curved arcs
  // ============================================================
  function buildNeural(s) {
    s.nodes = []; s.connections = []; s.signals = [];
    var W = s.W, H = s.H;
    var padX = 20, padY = 8;
    // Repeat small multi-layer networks across the width
    var layerDef = [2, 4, 5, 4, 2]; // nodes per layer in each block
    var maxPerLayer = 5;
    var layerCount = layerDef.length;
    var layerSpacing = 50;
    var blockWidth = (layerCount - 1) * layerSpacing;
    var blockGap = 30;
    var numBlocks = Math.max(1, Math.floor((W - padX * 2 + blockGap) / (blockWidth + blockGap)));
    var totalWidth = numBlocks * blockWidth + (numBlocks - 1) * blockGap;
    var startX = (W - totalWidth) / 2;
    var nodeSpacing = (H - padY * 2) / (maxPerLayer - 1);

    for (var b = 0; b < numBlocks; b++) {
      var bx = startX + b * (blockWidth + blockGap);
      var blockStart = s.nodes.length;
      // Create nodes layer by layer
      for (var l = 0; l < layerCount; l++) {
        var count = layerDef[l];
        var x = bx + l * layerSpacing;
        var sy = H / 2 - ((count - 1) * nodeSpacing) / 2;
        for (var n = 0; n < count; n++) {
          s.nodes.push({
            x: x, y: sy + n * nodeSpacing,
            r: 2.5 + Math.random() * 1.5,
            phase: Math.random() * Math.PI * 2,
            weight: (Math.random() * 2 - 1).toFixed(2),
            layer: l,
          });
        }
      }
      // Connect adjacent layers within this block
      var idx = blockStart;
      for (var l2 = 0; l2 < layerCount - 1; l2++) {
        var cC = layerDef[l2], nC = layerDef[l2 + 1];
        var cS = idx, nS = idx + cC;
        for (var a = 0; a < cC; a++) {
          for (var bb = 0; bb < nC; bb++) {
            // Skip some connections for visual clarity
            if (Math.random() < 0.7) {
              s.connections.push({ from: cS + a, to: nS + bb, weight: Math.random() });
            }
          }
        }
        idx += cC;
      }
    }
  }

  // ============================================================
  //  Build formula band — ticker-style left-to-right
  // ============================================================
  function buildFormulas(s) {
    s.formulas = [];
    var W = s.W, H = s.H;
    var count = Math.max(6, Math.floor(W / 180));
    var spacing = W / count;
    for (var i = 0; i < count; i++) {
      s.formulas.push({
        x: i * spacing + Math.random() * 30,
        y: H/2 + (Math.random()-0.5) * H * 0.3 + 5,
        vx: 0.15 + Math.random() * 0.15,
        text: FORMULA_TEXTS[Math.floor(Math.random() * FORMULA_TEXTS.length)],
        size: 10 + Math.floor(Math.random() * 3),
        useGold: Math.random() < 0.25,
      });
    }
  }

  // ============================================================
  //  Resize
  // ============================================================
  function resizeBand(s) {
    var rect = s.el.getBoundingClientRect();
    s.W = rect.width; s.H = rect.height;
    s.canvas.width = s.W * DPR; s.canvas.height = s.H * DPR;
    s.canvas.style.width = s.W + 'px'; s.canvas.style.height = s.H + 'px';
    s.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (s.type === 'neural') buildNeural(s);
    else buildFormulas(s);
  }

  // ============================================================
  //  Update
  // ============================================================
  var frame = 0;

  function updateNeural(s) {
    for (var i = 0; i < s.nodes.length; i++) {
      if (!s.nodes[i].grabbed) s.nodes[i].phase += 0.008;
    }
    if (frame % 20 === 0 && s.signals.length < 8 && s.connections.length > 0) {
      var c = s.connections[Math.floor(Math.random() * s.connections.length)];
      s.signals.push({ conn: c, t: 0, speed: 0.003 + Math.random() * 0.004, bright: Math.random() > 0.5 });
    }
    for (var si = s.signals.length - 1; si >= 0; si--) {
      s.signals[si].t += s.signals[si].speed;
      if (s.signals[si].t > 1) s.signals.splice(si, 1);
    }
  }

  function updateFormulas(s) {
    for (var i = 0; i < s.formulas.length; i++) {
      var f = s.formulas[i];
      if (!f.grabbed) f.x += f.vx;
      if (!f.grabbed && f.x > s.W + 100) {
        f.x = -200;
        f.text = FORMULA_TEXTS[Math.floor(Math.random() * FORMULA_TEXTS.length)];
      }
    }
  }

  // ============================================================
  //  Draw neural band
  // ============================================================
  function drawNeural(s) {
    var ctx = s.ctx, mouse = s.mouse;
    ctx.clearRect(0, 0, s.W, s.H);

    // Find hovered node index
    var hovIdx = -1;
    if (!s.grabbed && mouse.x > -9000) {
      for (var hi = 0; hi < s.nodes.length; hi++) {
        var hd = s.nodes[hi];
        var hdx = mouse.x-hd.x, hdy = mouse.y-hd.y, hr = Math.max(hd.r*4, 14);
        if (hdx*hdx+hdy*hdy < hr*hr) { hovIdx = hi; break; }
      }
    }
    // Also check grabbed
    for (var gi = 0; gi < s.nodes.length; gi++) {
      if (s.nodes[gi].grabbed) { hovIdx = gi; break; }
    }

    // Connections — straight lines between layers
    for (var ci = 0; ci < s.connections.length; ci++) {
      var c = s.connections[ci];
      var a = s.nodes[c.from], b = s.nodes[c.to];
      var isHighlighted = (c.from === hovIdx || c.to === hovIdx);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = isHighlighted ? rgba(COL.gold, 0.8) : rgba(COL.wire, 0.08 + c.weight * 0.07);
      ctx.lineWidth = isHighlighted ? 1.8 : 0.5;
      ctx.stroke();
    }

    // Signals traveling left-to-right along connections
    for (var si = 0; si < s.signals.length; si++) {
      var sig = s.signals[si];
      var sa = s.nodes[sig.conn.from], sb = s.nodes[sig.conn.to];
      var t = sig.t;
      var px = sa.x + (sb.x - sa.x) * t;
      var py = sa.y + (sb.y - sa.y) * t;
      var fade = t < 0.15 ? t/0.15 : t > 0.85 ? (1-t)/0.15 : 1;

      // Trail
      var trT = Math.max(0, t - 0.12);
      ctx.beginPath();
      ctx.moveTo(sa.x + (sb.x-sa.x)*trT, sa.y + (sb.y-sa.y)*trT);
      ctx.lineTo(px, py);
      ctx.strokeStyle = rgba(sig.bright ? COL.gold : COL.signal, fade * 0.35);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dot
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2);
      ctx.fillStyle = rgba(sig.bright ? COL.gold : COL.signal, fade * 0.8);
      ctx.fill();
    }

    // Nodes
    for (var ni = 0; ni < s.nodes.length; ni++) {
      var nd = s.nodes[ni];
      var isAct = nd.grabbed || ni === hovIdx;
      var pulse = 0.6 + 0.4 * Math.sin(nd.phase);
      var r = nd.r * (isAct ? 1.4 : 1);

      ctx.beginPath(); ctx.arc(nd.x, nd.y, r, 0, Math.PI*2);
      ctx.fillStyle = rgba(COL.node, isAct ? 0.95 : 0.4 + 0.15*pulse);
      ctx.fill();
      ctx.strokeStyle = rgba(COL.node, isAct ? 1 : 0.5 + 0.2*pulse);
      ctx.lineWidth = isAct ? 2 : 1;
      ctx.stroke();

      ctx.beginPath(); ctx.arc(nd.x, nd.y, r*0.35, 0, Math.PI*2);
      ctx.fillStyle = rgba(COL.signal, isAct ? 1 : 0.35*pulse);
      ctx.fill();

      if (isAct) {
        ctx.font = '9px monospace';
        ctx.fillStyle = rgba(COL.goldL, 0.95);
        ctx.fillText('w='+nd.weight, nd.x+r+4, nd.y-3);
      }
    }
  }

  // ============================================================
  //  Draw formula band
  // ============================================================
  function drawFormulas(s) {
    var ctx = s.ctx, mouse = s.mouse;
    ctx.clearRect(0, 0, s.W, s.H);

    for (var fi = 0; fi < s.formulas.length; fi++) {
      var f = s.formulas[fi];
      ctx.font = f.size + "px 'Courier New', monospace";
      var tw = ctx.measureText(f.text).width, pad = 6;
      var isHov = !s.grabbed && mouse.x > -9000 &&
        mouse.x >= f.x-pad && mouse.x <= f.x+tw+pad &&
        mouse.y >= f.y-f.size-pad && mouse.y <= f.y+pad;
      var isAct = f.grabbed || isHov;

      var alpha = isAct ? 1 : 0.55;
      ctx.font = (isAct ? 'bold ' : '') + f.size + "px 'Courier New', monospace";
      ctx.fillStyle = f.useGold ? rgba(COL.goldL, alpha) : rgba(COL.formula, alpha);
      ctx.fillText(f.text, f.x, f.y);
    }
  }

  // ============================================================
  //  Visibility observer — only animate bands in viewport
  // ============================================================
  var visibleBands = new Set();
  var observer = null;
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var idx = -1;
        for (var i = 0; i < allBands.length; i++) {
          if (allBands[i].el === entry.target) { idx = i; break; }
        }
        if (idx >= 0) {
          if (entry.isIntersecting) visibleBands.add(idx);
          else visibleBands.delete(idx);
        }
      });
    }, { rootMargin: '100px' });
  }

  // ============================================================
  //  Init
  // ============================================================
  for (var bi = 0; bi < bands.length; bi++) {
    var s = initBand(bands[bi]);
    resizeBand(s);
    if (observer) observer.observe(bands[bi]);
    else visibleBands.add(allBands.length - 1);
  }

  window.addEventListener('resize', function() {
    for (var i = 0; i < allBands.length; i++) resizeBand(allBands[i]);
  });

  // ============================================================
  //  Main loop
  // ============================================================
  function animate() {
    frame++;
    visibleBands.forEach(function(idx) {
      var s = allBands[idx];
      if (s.type === 'neural') { updateNeural(s); drawNeural(s); }
      else { updateFormulas(s); drawFormulas(s); }
    });
    requestAnimationFrame(animate);
  }
  animate();

  // ============================================================
  //  Hero background parallax on scroll
  // ============================================================
  var heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    var onScroll = function() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      heroBg.style.transform = 'translate3d(0,' + (scrollY * 0.4) + 'px,0)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
