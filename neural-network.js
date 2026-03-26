(function() {
  var canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H;
  var DPR = window.devicePixelRatio || 1;

  var COL = {
    bg:       [255, 255, 255],
    node:     [30, 58, 95],
    nodeDim:  [45, 90, 142],
    gold:     [176, 141, 87],
    goldLight:[160, 120, 60],
    wire:     [30, 58, 95],
    signal:   [45, 90, 142],
    formula:  [40, 65, 100],
  };

  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  // ============================================================
  //  #1 — PARALLAX (mouse-driven depth shift)
  // ============================================================
  var parallax = { y: 0, targetY: 0 };
  var PARALLAX_STRENGTH = 25;

  function updateParallax() {
    parallax.y += (parallax.targetY - parallax.y) * 0.06;
  }

  // ============================================================
  //  #3 — ENTRANCE ANIMATION (layer-by-layer reveal)
  // ============================================================
  var entranceStart = Date.now();
  var ENTRANCE_DURATION = 3000;

  function getEntranceProgress() {
    return Math.min((Date.now() - entranceStart) / ENTRANCE_DURATION, 1);
  }

  function layerEntrance(layerIndex, totalLayers) {
    var progress = getEntranceProgress();
    var layerStart = (layerIndex / totalLayers) * 0.6;
    var layerEnd = layerStart + 0.3;
    return Math.max(0, Math.min(1, (progress - layerStart) / (layerEnd - layerStart)));
  }

  function connectionEntrance() {
    var progress = getEntranceProgress();
    return Math.max(0, Math.min(1, (progress - 0.3) / 0.4));
  }

  function signalsAllowed() {
    return getEntranceProgress() > 0.6;
  }

  // ============================================================
  //  #4 — ANIMATED MESH GRADIENT (slowly shifting color blobs)
  // ============================================================
  var meshPhase = 0;

  function drawMeshGradient() {
    meshPhase += 0.0007;

    var cx1 = W * (0.3 + 0.15 * Math.sin(meshPhase * 0.7));
    var cy1 = H * (0.3 + 0.1 * Math.cos(meshPhase * 0.5));
    var cx2 = W * (0.7 + 0.1 * Math.cos(meshPhase * 0.6));
    var cy2 = H * (0.6 + 0.15 * Math.sin(meshPhase * 0.8));
    var cx3 = W * (0.5 + 0.2 * Math.sin(meshPhase * 0.4));
    var cy3 = H * (0.8 + 0.1 * Math.cos(meshPhase * 0.9));

    // Blob 1 — soft blue
    var g1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, W * 0.55);
    g1.addColorStop(0, 'rgba(200, 220, 245, 0.55)');
    g1.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    // Blob 2 — lavender
    var g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, W * 0.5);
    g2.addColorStop(0, 'rgba(215, 210, 240, 0.4)');
    g2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // Blob 3 — warm gold
    var g3 = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, W * 0.4);
    g3.addColorStop(0, 'rgba(235, 225, 200, 0.35)');
    g3.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);
  }

  // ============================================================
  //  RESIZE
  // ============================================================
  function resize() {
    var hero = canvas.parentElement;
    W = hero ? hero.offsetWidth : window.innerWidth;
    H = hero ? hero.offsetHeight : window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildNetworks();
    buildFormulas();
  }

  // ============================================================
  //  MULTI-LAYER NEURAL NETWORKS
  // ============================================================
  var networks = [];

  function buildNetworks() {
    networks.length = 0;
    var configs = [
      { cx: W * 0.15, cy: H * 0.35, layers: [3, 5, 6, 4, 2], scale: 0.85, rotation: -0.1, depth: 1.0 },
      { cx: W * 0.82, cy: H * 0.6,  layers: [2, 4, 5, 3],    scale: 0.7,  rotation: 0.15, depth: 0.6 },
    ];

    for (var ci = 0; ci < configs.length; ci++) {
      var cfg = configs[ci];
      var net = { nodes: [], connections: [], signals: [], cx: cfg.cx, cy: cfg.cy,
                  layers: cfg.layers, scale: cfg.scale, rotation: cfg.rotation, depth: cfg.depth };
      var layerCount = cfg.layers.length;
      var layerSpacing = 90 * cfg.scale;
      var nodeSpacing = 50 * cfg.scale;
      var startX = cfg.cx - ((layerCount - 1) * layerSpacing) / 2;

      for (var l = 0; l < layerCount; l++) {
        var count = cfg.layers[l];
        var x = startX + l * layerSpacing;
        var startY = cfg.cy - ((count - 1) * nodeSpacing) / 2;
        for (var n = 0; n < count; n++) {
          var y = startY + n * nodeSpacing;
          var dx = x - cfg.cx;
          var dy = y - cfg.cy;
          var cos = Math.cos(cfg.rotation);
          var sin = Math.sin(cfg.rotation);
          net.nodes.push({
            baseX: cfg.cx + dx * cos - dy * sin,
            baseY: cfg.cy + dx * sin + dy * cos,
            x: cfg.cx + dx * cos - dy * sin,
            y: cfg.cy + dx * sin + dy * cos,
            layer: l, index: n,
            radius: (3.5 + Math.random()) * cfg.scale,
            activation: Math.random(),
            pulsePhase: Math.random() * Math.PI * 2,
            weight: (Math.random() * 2 - 1).toFixed(2),
          });
        }
      }

      var nodeIdx = 0;
      for (var l2 = 0; l2 < layerCount - 1; l2++) {
        var currCount = cfg.layers[l2];
        var nextCount = cfg.layers[l2 + 1];
        var currStart = nodeIdx;
        var nextStart = nodeIdx + currCount;
        for (var a = 0; a < currCount; a++) {
          for (var b = 0; b < nextCount; b++) {
            net.connections.push({ from: currStart + a, to: nextStart + b, weight: Math.random() });
          }
        }
        nodeIdx += currCount;
      }

      networks.push(net);
    }
  }

  function spawnSignals() {
    if (!signalsAllowed()) return;
    for (var ni = 0; ni < networks.length; ni++) {
      var net = networks[ni];
      if (net.signals.length > 25) continue;
      var conn = net.connections[Math.floor(Math.random() * net.connections.length)];
      net.signals.push({
        conn: conn, t: 0,
        speed: 0.0005 + Math.random() * 0.001,
        value: (Math.random() * 2 - 1).toFixed(2),
        bright: Math.random() > 0.5,
      });
    }
  }

  // ============================================================
  //  FLOATING MATHEMATICAL FORMULAS
  // ============================================================
  var formulas = [];
  var FORMULA_TEXTS = [
    'f(x) = sigmoid(Wx + b)',
    'L = -1/N \u03A3 y\u1D62 log(\u0177\u1D62)',
    '\u2207W = \u2202L/\u2202W',
    'softmax(z\u1D62) = e^z\u1D62 / \u03A3e^z\u2C7C',
    'ReLU(x) = max(0, x)',
    'h\u209C = tanh(W\u2095h\u209C\u208B\u2081 + W\u2093x\u209C)',
    'P(y|x) = \u03C3(W\u1D40x + b)',
    '\u03B1 = 0.001',
    'W\u209C\u208A\u2081 = W\u209C - \u03B1\u2207L',
    'z = W\u00B7x + b',
    'a = \u03C3(z)',
    '\u03B4\u02E1 = (a\u02E1 - y) \u2299 \u03C3\'(z\u02E1)',
    'J(\u03B8) = 1/2m \u03A3(h\u03B8 - y)\u00B2',
    'GELU(x) = x\u03A6(x)',
    'Attention(Q,K,V)',
    'H(p,q) = -\u03A3 p log q',
    'KL(p||q) = \u03A3 p log(p/q)',
    '\u03C3(x) = 1/(1 + e\u207B\u02E3)',
    'BatchNorm(x) = \u03B3x\u0302 + \u03B2',
    'dropout(x, p=0.5)',
    'Adam: m\u209C = \u03B2\u2081m + (1-\u03B2\u2081)g',
    'LayerNorm(x)',
    'MSE = 1/n \u03A3(y - \u0177)\u00B2',
    'F1 = 2\u00B7P\u00B7R/(P+R)',
    'AUC-ROC',
    'conv2d(x, k, stride=1)',
    'x\u0302 = (x - \u03BC) / \u03C3',
  ];

  function buildFormulas() {
    formulas.length = 0;
    var count = Math.max(20, Math.floor((W * H) / 40000));
    for (var i = 0; i < count; i++) {
      formulas.push(createFormula(false));
    }
  }

  function createFormula(fromBottom) {
    var x = Math.random() * W;
    var y = fromBottom ? H + 10 + Math.random() * 40 : H * 0.3 + Math.random() * H * 0.7;
    return {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.04,
      vy: -(0.03 + Math.random() * 0.06),
      text: FORMULA_TEXTS[Math.floor(Math.random() * FORMULA_TEXTS.length)],
      baseOpacity: 0.75 + Math.random() * 0.25,
      size: 11 + Math.floor(Math.random() * 5),
      useGold: Math.random() < 0.25,
    };
  }

  // ============================================================
  //  FLOATING PARTICLES
  // ============================================================
  var particles = [];
  function initParticles() {
    particles.length = 0;
    var count = Math.floor((W * H) / 12000);
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        r: 0.5 + Math.random() * 1.2,
        alpha: 0.1 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // ============================================================
  //  MOUSE INTERACTION + CLICK-TO-GRAB
  // ============================================================
  var mouse = { x: -9999, y: -9999 };
  var grabbed = null;

  function canvasXY(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener('mousemove', function(e) {
    var pos = canvasXY(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
    parallax.targetY = ((pos.y / H) - 0.5) * PARALLAX_STRENGTH * -1;

    if (grabbed) {
      if (grabbed.type === 'formula') {
        grabbed.ref.x = pos.x - grabbed.offsetX;
        grabbed.ref.y = pos.y - grabbed.offsetY;
        grabbed.ref.vx = 0;
        grabbed.ref.vy = 0;
      } else if (grabbed.type === 'node') {
        grabbed.ref.baseX = pos.x - grabbed.offsetX;
        grabbed.ref.baseY = pos.y - grabbed.offsetY;
        grabbed.ref.x = grabbed.ref.baseX;
        grabbed.ref.y = grabbed.ref.baseY;
      }
    }
  });

  canvas.addEventListener('mouseleave', function() {
    mouse.x = -9999;
    mouse.y = -9999;
    parallax.targetY = 0;
    if (grabbed) { grabbed.ref.grabbed = false; grabbed = null; }
    canvas.style.cursor = '';
  });

  canvas.addEventListener('mousedown', function(e) {
    var pos = canvasXY(e);
    var mx = pos.x, my = pos.y;

    for (var fi = formulas.length - 1; fi >= 0; fi--) {
      var f = formulas[fi];
      var tw = f.text.length * f.size * 0.55;
      var th = f.size;
      var fdy = f.y + (f.grabbed ? 0 : parallax.y * 0.15);
      if (mx >= f.x && mx <= f.x + tw && my >= fdy - th && my <= fdy) {
        f.grabbed = true;
        grabbed = { type: 'formula', ref: f, offsetX: mx - f.x, offsetY: my - f.y };
        canvas.style.cursor = 'grabbing';
        return;
      }
    }

    for (var ni = 0; ni < networks.length; ni++) {
      var net = networks[ni];
      for (var ndi = 0; ndi < net.nodes.length; ndi++) {
        var node = net.nodes[ndi];
        var dx = mx - node.x;
        var dy = my - node.y;
        var hitR = Math.max(node.radius * 3, 12);
        if (dx * dx + dy * dy < hitR * hitR) {
          node.grabbed = true;
          grabbed = { type: 'node', ref: node, offsetX: mx - node.baseX, offsetY: my - node.baseY };
          canvas.style.cursor = 'grabbing';
          return;
        }
      }
    }
  });

  canvas.addEventListener('mouseup', function() {
    if (grabbed) {
      grabbed.ref.grabbed = false;
      grabbed = null;
      canvas.style.cursor = '';
    }
  });

  // ============================================================
  //  SCROLL PARALLAX — translate background image on scroll
  // ============================================================
  var heroBg = document.getElementById('hero-bg');
  function onScrollParallax() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (heroBg) {
      heroBg.style.transform = 'translate3d(0,' + (scrollY * 0.5) + 'px,0)';
    }
  }
  window.addEventListener('scroll', onScrollParallax, { passive: true });
  onScrollParallax();

  // ============================================================
  //  ANIMATION LOOP
  // ============================================================
  var frame = 0;

  function update() {
    frame++;
    updateParallax();

    if (frame % 6 === 0) spawnSignals();

    // Update node positions with parallax (#1); skip parallax for grabbed nodes
    for (var ni = 0; ni < networks.length; ni++) {
      var net = networks[ni];
      var depth = net.depth;
      for (var ndi = 0; ndi < net.nodes.length; ndi++) {
        var node = net.nodes[ndi];
        if (!node.grabbed) {
          node.x = node.baseX;
          node.y = node.baseY + parallax.y * depth;
        }
        node.pulsePhase += 0.005;
        node.activation = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(node.pulsePhase));
      }

      for (var si = net.signals.length - 1; si >= 0; si--) {
        net.signals[si].t += net.signals[si].speed;
        if (net.signals[si].t > 1) net.signals.splice(si, 1);
      }
    }

    for (var fi = 0; fi < formulas.length; fi++) {
      var f = formulas[fi];
      if (!f.grabbed) {
        f.x += f.vx;
        f.y += f.vy;
      }
      // Respawn from bottom when off top (never respawn grabbed)
      if (!f.grabbed && (f.y < -30 || f.x < -200 || f.x > W + 200)) {
        formulas[fi] = createFormula(true);
      }
    }

    for (var pi = 0; pi < particles.length; pi++) {
      var p = particles[pi];
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.004;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      var pdx = p.x - mouse.x;
      var pdy = p.y - mouse.y;
      var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pdist < 120 && pdist > 0) {
        p.vx += (pdx / pdist) * 0.05;
        p.vy += (pdy / pdist) * 0.05;
      }
      p.vx *= 0.99;
      p.vy *= 0.99;
    }
  }

  function draw() {
    // Clear with semi-transparent white so NYC.jpg shows through at ~20%
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(0, 0, W, H);

    // #4 — Animated mesh gradient
    drawMeshGradient();

    // Ambient particles (with parallax)
    for (var pi = 0; pi < particles.length; pi++) {
      var p = particles[pi];
      var flicker = 0.7 + 0.3 * Math.sin(p.phase);
      ctx.beginPath();
      ctx.arc(p.x, p.y + parallax.y * 0.2, p.r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(COL.nodeDim, p.alpha * flicker);
      ctx.fill();
    }

    // Formulas — opaque at bottom, fade as they rise; hover/grab = full opacity
    for (var fi = 0; fi < formulas.length; fi++) {
      var f = formulas[fi];
      // Hit test for hover
      var tw = f.text.length * f.size * 0.55;
      var th = f.size;
      var fDrawY = f.y + (f.grabbed ? 0 : parallax.y * 0.15);
      var isHoveredF = !grabbed && mouse.x > -9000 &&
        mouse.x >= f.x && mouse.x <= f.x + tw &&
        mouse.y >= fDrawY - th && mouse.y <= fDrawY + 4;
      var isActiveF = f.grabbed || isHoveredF;
      var alpha;
      if (isActiveF) {
        alpha = 1;
      } else {
        var posAlpha = Math.max(0, Math.min(1, f.y / H));
        alpha = f.baseOpacity * posAlpha;
      }
      if (alpha <= 0.01) continue;
      ctx.font = (isActiveF ? 'bold ' : '') + f.size + "px 'Courier New', monospace";
      ctx.fillStyle = f.useGold ? rgba(COL.goldLight, alpha) : rgba(COL.formula, alpha);
      ctx.fillText(f.text, f.x, f.y + (f.grabbed ? 0 : parallax.y * 0.15));
    }

    // Neural networks
    var connEntr = connectionEntrance();
    for (var ni = 0; ni < networks.length; ni++) {
      var net = networks[ni];
      var totalLayers = net.layers.length;

      // Connections (#3 entrance fade)
      if (connEntr > 0) {
        for (var ci = 0; ci < net.connections.length; ci++) {
          var conn = net.connections[ci];
          var a = net.nodes[conn.from];
          var b = net.nodes[conn.to];
          var alpha = (0.04 + conn.weight * 0.06) * connEntr;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = rgba(COL.wire, alpha);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Signals
      for (var si = 0; si < net.signals.length; si++) {
        var sig = net.signals[si];
        var sa = net.nodes[sig.conn.from];
        var sb = net.nodes[sig.conn.to];
        var px = sa.x + (sb.x - sa.x) * sig.t;
        var py = sa.y + (sb.y - sa.y) * sig.t;
        var fade = sig.t < 0.15 ? sig.t / 0.15 : sig.t > 0.85 ? (1 - sig.t) / 0.15 : 1;

        var trailT = Math.max(0, sig.t - 0.15);
        var tx = sa.x + (sb.x - sa.x) * trailT;
        var ty = sa.y + (sb.y - sa.y) * trailT;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        var trailCol = sig.bright ? COL.gold : COL.signal;
        ctx.strokeStyle = rgba(trailCol, fade * 0.25);
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(sig.bright ? COL.goldLight : COL.signal, fade * 0.5);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = rgba(sig.bright ? COL.gold : COL.node, fade * 0.1);
        ctx.fill();

        if (fade > 0.5) {
          ctx.font = '9px monospace';
          ctx.fillStyle = rgba(COL.signal, fade * 0.6);
          ctx.fillText(sig.value, px + 8, py - 5);
        }
      }

      // Nodes (#3 layer-by-layer entrance; grabbed = full opacity)
      for (var ndi = 0; ndi < net.nodes.length; ndi++) {
        var node = net.nodes[ndi];
        var entrAlpha = layerEntrance(node.layer, totalLayers);
        if (entrAlpha <= 0) continue;

        var nodeHitR = Math.max(node.radius * 3, 12);
        var isHovered = !grabbed && mouse.x > -9000 &&
          (mouse.x - node.x) * (mouse.x - node.x) + (mouse.y - node.y) * (mouse.y - node.y) < nodeHitR * nodeHitR;
        var isActive = node.grabbed || isHovered;
        var nodeAlpha = isActive ? 1 : entrAlpha;
        var pulse = 0.6 + 0.4 * Math.sin(node.pulsePhase);
        var r = node.radius;
        var entrScale = isActive ? 1.3 : (0.3 + 0.7 * entrAlpha);
        var drawR = r * entrScale;

        // Outer glow
        var glowGrad = ctx.createRadialGradient(node.x, node.y, drawR, node.x, node.y, drawR * 6);
        glowGrad.addColorStop(0, rgba(COL.node, (isActive ? 0.3 : 0.05) * pulse * nodeAlpha));
        glowGrad.addColorStop(1, rgba(COL.node, 0));
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawR * 6, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Node fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(COL.node, isActive ? 0.85 : (0.15 + 0.12 * node.activation * pulse) * entrAlpha);
        ctx.fill();
        ctx.strokeStyle = rgba(COL.node, isActive ? 1 : (0.2 + 0.15 * pulse) * entrAlpha);
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.stroke();

        // Inner core
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(COL.signal, isActive ? 0.9 : 0.25 * node.activation * pulse * entrAlpha);
        ctx.fill();
      }

      // Hover: highlight all connections from/to hovered node
      for (var mi = 0; mi < net.nodes.length; mi++) {
        var mnode = net.nodes[mi];
        var mdx = mouse.x - mnode.x;
        var mdy = mouse.y - mnode.y;
        var hitR = Math.max(mnode.radius * 3, 12);
        if (mdx * mdx + mdy * mdy < hitR * hitR && mouse.x > -9000) {
          // Draw all connections involving this node at full visibility
          for (var hci = 0; hci < net.connections.length; hci++) {
            var hconn = net.connections[hci];
            if (hconn.from === mi || hconn.to === mi) {
              var ha = net.nodes[hconn.from];
              var hb = net.nodes[hconn.to];
              ctx.beginPath();
              ctx.moveTo(ha.x, ha.y);
              ctx.lineTo(hb.x, hb.y);
              ctx.strokeStyle = rgba(COL.gold, 0.6);
              ctx.lineWidth = 1.5;
              ctx.stroke();
              // Highlight connected node
              var other = hconn.from === mi ? hb : ha;
              ctx.beginPath();
              ctx.arc(other.x, other.y, other.radius * 1.3, 0, Math.PI * 2);
              ctx.fillStyle = rgba(COL.node, 0.5);
              ctx.fill();
              ctx.strokeStyle = rgba(COL.node, 0.8);
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
          // Show weight label
          ctx.font = '9px monospace';
          ctx.fillStyle = rgba(COL.goldLight, 0.8);
          ctx.fillText('w=' + mnode.weight, mnode.x + mnode.radius + 5, mnode.y - 6);
          break;
        }
      }
    }

    // Soft vignette
    var vig = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.3, W * 0.5, H * 0.5, W * 0.85);
    vig.addColorStop(0, 'rgba(255,255,255,0)');
    vig.addColorStop(1, 'rgba(250,250,249,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', function() {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  animate();
})();

// ================================================================
//  CONTACT SECTION — neural net + formulas (top-down) with interaction
// ================================================================
(function() {
  var canvas = document.getElementById('contact-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H;
  var DPR = window.devicePixelRatio || 1;

  var COL = {
    node: [30,58,95], wire: [30,58,95], signal: [45,90,142],
    gold: [176,141,87], formula: [40,65,100], goldL: [160,120,60],
  };
  function rgba(c, a) { return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }

  function resize() {
    var sec = canvas.parentElement;
    W = sec ? sec.offsetWidth : window.innerWidth;
    H = sec ? sec.offsetHeight : 600;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildNet(); buildFormulas();
  }

  // Network on the right
  var net = { nodes: [], connections: [], signals: [] };
  function buildNet() {
    net = { nodes: [], connections: [], signals: [] };
    var layers = [2, 4, 3, 2];
    var cx = W * 0.85, cy = H * 0.5, sc = 0.6, rot = 0.2;
    var lSp = 70 * sc, nSp = 40 * sc;
    var startX = cx - ((layers.length - 1) * lSp) / 2;
    for (var l = 0; l < layers.length; l++) {
      var count = layers[l], x = startX + l * lSp;
      var startY = cy - ((count - 1) * nSp) / 2;
      for (var n = 0; n < count; n++) {
        var y = startY + n * nSp;
        var dx = x - cx, dy = y - cy;
        var cos = Math.cos(rot), sin = Math.sin(rot);
        var nx = cx + dx * cos - dy * sin, ny = cy + dx * sin + dy * cos;
        net.nodes.push({ baseX: nx, baseY: ny, x: nx, y: ny,
          r: (2.5 + Math.random()) * sc, phase: Math.random() * Math.PI * 2,
          layer: l, weight: (Math.random()*2-1).toFixed(2), activation: Math.random() });
      }
    }
    var idx = 0;
    for (var l2 = 0; l2 < layers.length - 1; l2++) {
      var cC = layers[l2], nC = layers[l2+1], cS = idx, nS = idx + cC;
      for (var a = 0; a < cC; a++)
        for (var b = 0; b < nC; b++)
          net.connections.push({ from: cS+a, to: nS+b, weight: Math.random() });
      idx += cC;
    }
  }

  // Formulas descend from top
  var formulas = [];
  var TEXTS = [
    '\u2207W = \u2202L/\u2202W', 'ReLU(x)', '\u03C3(z)', 'softmax(z)',
    'Attention(Q,K,V)', 'z = W\u00B7x + b', '\u03B1 = 0.001',
    'H(p,q) = -\u03A3 p log q', 'dropout(p=0.5)', 'BatchNorm(x)',
    'GELU(x)', 'F1 = 2PR/(P+R)', 'conv2d(x,k)', 'LayerNorm(x)',
  ];
  function buildFormulas() {
    formulas.length = 0;
    var count = Math.max(8, Math.floor((W * H) / 80000));
    for (var i = 0; i < count; i++) formulas.push(makeFormula(false));
  }
  function makeFormula(fromTop) {
    return {
      x: Math.random() * W * 0.7,
      y: fromTop ? -10 - Math.random() * 30 : Math.random() * H,
      vx: (Math.random() - 0.5) * 0.01,
      vy: 0.02 + Math.random() * 0.04,
      text: TEXTS[Math.floor(Math.random() * TEXTS.length)],
      baseOpacity: 0.6 + Math.random() * 0.3,
      size: 10 + Math.floor(Math.random() * 4),
      useGold: Math.random() < 0.3,
    };
  }

  // Mouse + grab
  var mouse = { x: -9999, y: -9999 };
  var grabbed = null;
  function cXY(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX-r.left, y: e.clientY-r.top }; }

  canvas.addEventListener('mousemove', function(e) {
    var p = cXY(e); mouse.x = p.x; mouse.y = p.y;
    if (grabbed) {
      if (grabbed.type === 'formula') {
        grabbed.ref.x = p.x - grabbed.ox; grabbed.ref.y = p.y - grabbed.oy;
        grabbed.ref.vx = 0; grabbed.ref.vy = 0;
      } else {
        grabbed.ref.baseX = p.x - grabbed.ox; grabbed.ref.baseY = p.y - grabbed.oy;
        grabbed.ref.x = grabbed.ref.baseX; grabbed.ref.y = grabbed.ref.baseY;
      }
    }
  });
  canvas.addEventListener('mouseleave', function() {
    mouse.x = -9999; mouse.y = -9999;
    if (grabbed) { grabbed.ref.grabbed = false; grabbed = null; }
    canvas.style.cursor = '';
  });
  canvas.addEventListener('mousedown', function(e) {
    var p = cXY(e);
    for (var fi = formulas.length-1; fi >= 0; fi--) {
      var f = formulas[fi], tw = f.text.length * f.size * 0.55, th = f.size;
      if (p.x >= f.x && p.x <= f.x+tw && p.y >= f.y-th && p.y <= f.y) {
        f.grabbed = true;
        grabbed = { type:'formula', ref:f, ox:p.x-f.x, oy:p.y-f.y };
        canvas.style.cursor = 'grabbing'; return;
      }
    }
    for (var ni = 0; ni < net.nodes.length; ni++) {
      var nd = net.nodes[ni], dx = p.x-nd.x, dy = p.y-nd.y, hr = Math.max(nd.r*3,12);
      if (dx*dx+dy*dy < hr*hr) {
        nd.grabbed = true;
        grabbed = { type:'node', ref:nd, ox:p.x-nd.baseX, oy:p.y-nd.baseY };
        canvas.style.cursor = 'grabbing'; return;
      }
    }
  });
  canvas.addEventListener('mouseup', function() {
    if (grabbed) { grabbed.ref.grabbed = false; grabbed = null; canvas.style.cursor = ''; }
  });

  var frame = 0;
  function update() {
    frame++;
    if (frame % 12 === 0 && net.signals.length < 10) {
      var c = net.connections[Math.floor(Math.random() * net.connections.length)];
      net.signals.push({ conn:c, t:0, speed:0.0004+Math.random()*0.0008, bright:Math.random()>0.5, value:(Math.random()*2-1).toFixed(2) });
    }
    for (var si = net.signals.length-1; si >= 0; si--) {
      net.signals[si].t += net.signals[si].speed;
      if (net.signals[si].t > 1) net.signals.splice(si, 1);
    }
    for (var ni = 0; ni < net.nodes.length; ni++) {
      var nd = net.nodes[ni];
      nd.phase += 0.004;
      nd.activation = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(nd.phase));
    }
    for (var fi = 0; fi < formulas.length; fi++) {
      var f = formulas[fi];
      if (!f.grabbed) { f.x += f.vx; f.y += f.vy; }
      if (!f.grabbed && (f.y > H+20 || f.x < -150 || f.x > W+150)) formulas[fi] = makeFormula(true);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Formulas — opaque at top, fade toward bottom; hover/grab = full
    for (var fi = 0; fi < formulas.length; fi++) {
      var f = formulas[fi];
      var tw = f.text.length * f.size * 0.55, th = f.size;
      var isHov = !grabbed && mouse.x > -9000 &&
        mouse.x >= f.x && mouse.x <= f.x+tw && mouse.y >= f.y-th && mouse.y <= f.y+4;
      var isAct = f.grabbed || isHov;
      var alpha = isAct ? 1 : f.baseOpacity * Math.max(0, Math.min(1, 1 - f.y / H));
      if (alpha <= 0.01) continue;
      ctx.font = (isAct ? 'bold ' : '') + f.size + "px 'Courier New', monospace";
      ctx.fillStyle = f.useGold ? rgba(COL.goldL, alpha) : rgba(COL.formula, alpha);
      ctx.fillText(f.text, f.x, f.y);
    }

    // Connections
    for (var ci = 0; ci < net.connections.length; ci++) {
      var c = net.connections[ci], a = net.nodes[c.from], b = net.nodes[c.to];
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = rgba(COL.wire, 0.04 + c.weight * 0.05);
      ctx.lineWidth = 0.5; ctx.stroke();
    }

    // Signals
    for (var si = 0; si < net.signals.length; si++) {
      var s = net.signals[si];
      var sa = net.nodes[s.conn.from], sb = net.nodes[s.conn.to];
      var px = sa.x + (sb.x-sa.x)*s.t, py = sa.y + (sb.y-sa.y)*s.t;
      var fade = s.t < 0.15 ? s.t/0.15 : s.t > 0.85 ? (1-s.t)/0.15 : 1;
      var trT = Math.max(0, s.t-0.15);
      ctx.beginPath(); ctx.moveTo(sa.x+(sb.x-sa.x)*trT, sa.y+(sb.y-sa.y)*trT); ctx.lineTo(px, py);
      ctx.strokeStyle = rgba(s.bright ? COL.gold : COL.signal, fade*0.25); ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2);
      ctx.fillStyle = rgba(s.bright ? COL.goldL : COL.signal, fade*0.5); ctx.fill();
    }

    // Nodes with hover/grab highlight
    for (var ni = 0; ni < net.nodes.length; ni++) {
      var nd = net.nodes[ni];
      var hr = Math.max(nd.r*3, 12);
      var isHov = !grabbed && mouse.x > -9000 &&
        (mouse.x-nd.x)*(mouse.x-nd.x)+(mouse.y-nd.y)*(mouse.y-nd.y) < hr*hr;
      var isAct = nd.grabbed || isHov;
      var pulse = 0.6 + 0.4 * Math.sin(nd.phase);
      var drawR = nd.r * (isAct ? 1.3 : 1);

      var glow = ctx.createRadialGradient(nd.x, nd.y, drawR, nd.x, nd.y, drawR*6);
      glow.addColorStop(0, rgba(COL.node, (isAct ? 0.3 : 0.05) * pulse));
      glow.addColorStop(1, rgba(COL.node, 0));
      ctx.beginPath(); ctx.arc(nd.x, nd.y, drawR*6, 0, Math.PI*2);
      ctx.fillStyle = glow; ctx.fill();

      ctx.beginPath(); ctx.arc(nd.x, nd.y, drawR, 0, Math.PI*2);
      ctx.fillStyle = rgba(COL.node, isAct ? 0.85 : 0.12 + 0.1*pulse);
      ctx.fill();
      ctx.strokeStyle = rgba(COL.node, isAct ? 1 : 0.18 + 0.12*pulse);
      ctx.lineWidth = isAct ? 2 : 0.8; ctx.stroke();

      ctx.beginPath(); ctx.arc(nd.x, nd.y, drawR*0.4, 0, Math.PI*2);
      ctx.fillStyle = rgba(COL.signal, isAct ? 0.9 : 0.25*nd.activation*pulse);
      ctx.fill();
    }

    // Hover: highlight connections from hovered node
    for (var mi = 0; mi < net.nodes.length; mi++) {
      var mnd = net.nodes[mi];
      var mhr = Math.max(mnd.r*3, 12);
      if (mouse.x > -9000 && (mouse.x-mnd.x)*(mouse.x-mnd.x)+(mouse.y-mnd.y)*(mouse.y-mnd.y) < mhr*mhr) {
        for (var hci = 0; hci < net.connections.length; hci++) {
          var hc = net.connections[hci];
          if (hc.from === mi || hc.to === mi) {
            var ha = net.nodes[hc.from], hb = net.nodes[hc.to];
            ctx.beginPath(); ctx.moveTo(ha.x, ha.y); ctx.lineTo(hb.x, hb.y);
            ctx.strokeStyle = rgba(COL.gold, 0.6); ctx.lineWidth = 1.5; ctx.stroke();
            var other = hc.from === mi ? hb : ha;
            ctx.beginPath(); ctx.arc(other.x, other.y, other.r*1.3, 0, Math.PI*2);
            ctx.fillStyle = rgba(COL.node, 0.5); ctx.fill();
            ctx.strokeStyle = rgba(COL.node, 0.8); ctx.lineWidth = 1.5; ctx.stroke();
          }
        }
        ctx.font = '9px monospace';
        ctx.fillStyle = rgba(COL.goldL, 0.8);
        ctx.fillText('w='+mnd.weight, mnd.x+mnd.r+5, mnd.y-6);
        break;
      }
    }
  }

  function animate() { update(); draw(); requestAnimationFrame(animate); }
  window.addEventListener('resize', resize);
  resize();
  animate();
})();
