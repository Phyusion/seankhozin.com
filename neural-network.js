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
    formula:  [60, 90, 130],
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
    W = window.innerWidth;
    H = window.innerHeight;
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

  function createFormula(startFromCenter) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.06 + Math.random() * 0.12;
    var cx = W / 2;
    var cy = H / 2;
    var dist = startFromCenter ? 0 : (Math.random() * Math.max(W, H) * 0.5);
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      text: FORMULA_TEXTS[Math.floor(Math.random() * FORMULA_TEXTS.length)],
      opacity: 0,
      maxOpacity: 0.45 + Math.random() * 0.25,
      fadeIn: true,
      fadeSpeed: 0.001 + Math.random() * 0.001,
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
  //  MOUSE INTERACTION
  // ============================================================
  var mouse = { x: -9999, y: -9999 };
  canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // #1 — Parallax: vertical shift based on mouse Y position
    parallax.targetY = ((e.clientY / H) - 0.5) * PARALLAX_STRENGTH * -1;
  });
  canvas.addEventListener('mouseleave', function() {
    mouse.x = -9999;
    mouse.y = -9999;
    parallax.targetY = 0;
  });

  // ============================================================
  //  SCROLL PARALLAX — translate background image on scroll
  // ============================================================
  var heroBg = document.getElementById('hero-bg');
  window.addEventListener('scroll', function() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (heroBg) {
      heroBg.style.transform = 'translateY(' + (scrollY * 0.35) + 'px)';
    }
  }, { passive: true });

  // ============================================================
  //  ANIMATION LOOP
  // ============================================================
  var frame = 0;

  function update() {
    frame++;
    updateParallax();

    if (frame % 6 === 0) spawnSignals();

    // Update node positions with parallax (#1)
    for (var ni = 0; ni < networks.length; ni++) {
      var net = networks[ni];
      var depth = net.depth;
      for (var ndi = 0; ndi < net.nodes.length; ndi++) {
        var node = net.nodes[ndi];
        node.x = node.baseX;
        node.y = node.baseY + parallax.y * depth;
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
      f.x += f.vx;
      f.y += f.vy;
      if (f.fadeIn) {
        f.opacity += f.fadeSpeed;
        if (f.opacity >= f.maxOpacity) { f.opacity = f.maxOpacity; f.fadeIn = false; }
      } else {
        f.opacity -= f.fadeSpeed * 0.5;
      }
      if (f.opacity <= 0 || f.y < -30 || f.y > H + 30 || f.x < -200 || f.x > W + 200) {
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

    // Formulas (with parallax)
    for (var fi = 0; fi < formulas.length; fi++) {
      var f = formulas[fi];
      if (f.opacity <= 0.01) continue;
      ctx.font = f.size + "px 'Courier New', monospace";
      ctx.fillStyle = f.useGold ? rgba(COL.goldLight, f.opacity) : rgba(COL.formula, f.opacity);
      ctx.fillText(f.text, f.x, f.y + parallax.y * 0.15);
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

      // Nodes (#3 layer-by-layer entrance)
      for (var ndi = 0; ndi < net.nodes.length; ndi++) {
        var node = net.nodes[ndi];
        var entrAlpha = layerEntrance(node.layer, totalLayers);
        if (entrAlpha <= 0) continue;

        var pulse = 0.6 + 0.4 * Math.sin(node.pulsePhase);
        var r = node.radius;
        var entrScale = 0.3 + 0.7 * entrAlpha;
        var drawR = r * entrScale;

        // Outer glow
        var glowGrad = ctx.createRadialGradient(node.x, node.y, drawR, node.x, node.y, drawR * 6);
        glowGrad.addColorStop(0, rgba(COL.node, 0.05 * pulse * entrAlpha));
        glowGrad.addColorStop(1, rgba(COL.node, 0));
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawR * 6, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Node fill — bold and visible
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(COL.node, (0.15 + 0.12 * node.activation * pulse) * entrAlpha);
        ctx.fill();
        ctx.strokeStyle = rgba(COL.node, (0.2 + 0.15 * pulse) * entrAlpha);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner core — bright
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(COL.signal, 0.25 * node.activation * pulse * entrAlpha);
        ctx.fill();
      }

      // Mouse interaction
      for (var mi = 0; mi < net.nodes.length; mi++) {
        var mnode = net.nodes[mi];
        var mdx = mouse.x - mnode.x;
        var mdy = mouse.y - mnode.y;
        var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 150) {
          var malpha = (1 - mdist / 150) * 0.4;
          ctx.beginPath();
          ctx.moveTo(mnode.x, mnode.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = rgba(COL.goldLight, malpha);
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.font = '9px monospace';
          ctx.fillStyle = rgba(COL.goldLight, malpha);
          ctx.fillText('w=' + mnode.weight, mnode.x + mnode.radius + 5, mnode.y - 6);
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
