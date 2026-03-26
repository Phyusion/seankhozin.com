(function() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const DPR = window.devicePixelRatio || 1;

  const COL = {
    bg:       [255, 255, 255],
    node:     [30, 58, 95],
    nodeDim:  [45, 90, 142],
    gold:     [176, 141, 87],
    goldLight:[160, 120, 60],
    wire:     [30, 58, 95],
    signal:   [45, 90, 142],
    formula:  [100, 130, 165],
  };

  function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

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
  const networks = [];

  function buildNetworks() {
    networks.length = 0;
    const configs = [
      { cx: W * 0.15, cy: H * 0.35, layers: [3, 5, 6, 4, 2], scale: 0.85, rotation: -0.1 },
      { cx: W * 0.82, cy: H * 0.6,  layers: [2, 4, 5, 3],    scale: 0.7,  rotation: 0.15 },
      { cx: W * 0.5,  cy: H * 0.8,  layers: [4, 6, 6, 5, 3], scale: 0.55, rotation: 0.05 },
    ];

    for (const cfg of configs) {
      const net = { nodes: [], connections: [], signals: [], ...cfg };
      const layerCount = cfg.layers.length;
      const layerSpacing = 90 * cfg.scale;
      const nodeSpacing = 50 * cfg.scale;
      const startX = cfg.cx - ((layerCount - 1) * layerSpacing) / 2;

      for (let l = 0; l < layerCount; l++) {
        const count = cfg.layers[l];
        const x = startX + l * layerSpacing;
        const startY = cfg.cy - ((count - 1) * nodeSpacing) / 2;
        for (let n = 0; n < count; n++) {
          const y = startY + n * nodeSpacing;
          const dx = x - cfg.cx;
          const dy = y - cfg.cy;
          const cos = Math.cos(cfg.rotation);
          const sin = Math.sin(cfg.rotation);
          net.nodes.push({
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

      let nodeIdx = 0;
      for (let l = 0; l < layerCount - 1; l++) {
        const currCount = cfg.layers[l];
        const nextCount = cfg.layers[l + 1];
        const currStart = nodeIdx;
        const nextStart = nodeIdx + currCount;
        for (let a = 0; a < currCount; a++) {
          for (let b = 0; b < nextCount; b++) {
            net.connections.push({ from: currStart + a, to: nextStart + b, weight: Math.random() });
          }
        }
        nodeIdx += currCount;
      }

      networks.push(net);
    }
  }

  function spawnSignals() {
    for (const net of networks) {
      if (net.signals.length > 25) continue;
      const conn = net.connections[Math.floor(Math.random() * net.connections.length)];
      net.signals.push({
        conn, t: 0,
        speed: 0.006 + Math.random() * 0.01,
        value: (Math.random() * 2 - 1).toFixed(2),
        bright: Math.random() > 0.5,
      });
    }
  }

  // ============================================================
  //  FLOATING MATHEMATICAL FORMULAS
  // ============================================================
  const formulas = [];
  const FORMULA_TEXTS = [
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
    const count = Math.max(18, Math.floor((W * H) / 50000));
    for (let i = 0; i < count; i++) {
      formulas.push(createFormula(false));
    }
  }

  function createFormula(startFromCenter) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.25 + Math.random() * 0.5;
    const cx = W / 2;
    const cy = H / 2;
    const dist = startFromCenter ? 0 : (Math.random() * Math.max(W, H) * 0.5);
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      text: FORMULA_TEXTS[Math.floor(Math.random() * FORMULA_TEXTS.length)],
      opacity: 0,
      maxOpacity: 0.2 + Math.random() * 0.2,
      fadeIn: true,
      fadeSpeed: 0.002 + Math.random() * 0.003,
      size: 11 + Math.floor(Math.random() * 5),
      useGold: Math.random() < 0.25,
    };
  }

  // ============================================================
  //  FLOATING PARTICLES
  // ============================================================
  const particles = [];
  function initParticles() {
    particles.length = 0;
    const count = Math.floor((W * H) / 12000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 0.5 + Math.random() * 1.2,
        alpha: 0.1 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // ============================================================
  //  MOUSE INTERACTION
  // ============================================================
  const mouse = { x: -9999, y: -9999 };
  canvas.addEventListener('mousemove', function(e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  canvas.addEventListener('mouseleave', function() { mouse.x = -9999; mouse.y = -9999; });

  // ============================================================
  //  ANIMATION LOOP
  // ============================================================
  let frame = 0;

  function update() {
    frame++;
    if (frame % 6 === 0) spawnSignals();

    for (const net of networks) {
      for (let i = net.signals.length - 1; i >= 0; i--) {
        net.signals[i].t += net.signals[i].speed;
        if (net.signals[i].t > 1) net.signals.splice(i, 1);
      }
      for (const node of net.nodes) {
        node.pulsePhase += 0.02;
        node.activation = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(node.pulsePhase));
      }
    }

    for (let i = 0; i < formulas.length; i++) {
      const f = formulas[i];
      f.x += f.vx;
      f.y += f.vy;
      if (f.fadeIn) {
        f.opacity += f.fadeSpeed;
        if (f.opacity >= f.maxOpacity) { f.opacity = f.maxOpacity; f.fadeIn = false; }
      } else {
        f.opacity -= f.fadeSpeed * 0.5;
      }
      if (f.opacity <= 0 || f.y < -30 || f.y > H + 30 || f.x < -200 || f.x > W + 200) {
        formulas[i] = createFormula(true);
      }
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.015;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        p.vx += (dx / dist) * 0.05;
        p.vy += (dy / dist) * 0.05;
      }
      p.vx *= 0.99;
      p.vy *= 0.99;
    }
  }

  function draw() {
    ctx.fillStyle = rgba(COL.bg, 1);
    ctx.fillRect(0, 0, W, H);

    var grad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.7);
    grad.addColorStop(0, rgba([232, 238, 245], 0.5));
    grad.addColorStop(1, rgba(COL.bg, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    for (var pi = 0; pi < particles.length; pi++) {
      var p = particles[pi];
      var flicker = 0.7 + 0.3 * Math.sin(p.phase);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(COL.nodeDim, p.alpha * flicker);
      ctx.fill();
    }

    for (var fi = 0; fi < formulas.length; fi++) {
      var f = formulas[fi];
      if (f.opacity <= 0.01) continue;
      ctx.font = f.size + "px 'Courier New', monospace";
      ctx.fillStyle = f.useGold ? rgba(COL.goldLight, f.opacity) : rgba(COL.formula, f.opacity);
      ctx.fillText(f.text, f.x, f.y);
    }

    for (var ni = 0; ni < networks.length; ni++) {
      var net = networks[ni];

      for (var ci = 0; ci < net.connections.length; ci++) {
        var conn = net.connections[ci];
        var a = net.nodes[conn.from];
        var b = net.nodes[conn.to];
        var alpha = 0.12 + conn.weight * 0.14;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rgba(COL.wire, alpha);
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

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
        ctx.strokeStyle = rgba(trailCol, fade * 0.4);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(sig.bright ? COL.goldLight : COL.signal, fade * 0.95);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fillStyle = rgba(sig.bright ? COL.gold : COL.node, fade * 0.12);
        ctx.fill();

        if (fade > 0.5) {
          ctx.font = '8px monospace';
          ctx.fillStyle = rgba(COL.signal, fade * 0.5);
          ctx.fillText(sig.value, px + 7, py - 4);
        }
      }

      for (var ndi = 0; ndi < net.nodes.length; ndi++) {
        var node = net.nodes[ndi];
        var pulse = 0.6 + 0.4 * Math.sin(node.pulsePhase);
        var r = node.radius;

        var glowGrad = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r * 5);
        glowGrad.addColorStop(0, rgba(COL.node, 0.1 * pulse));
        glowGrad.addColorStop(1, rgba(COL.node, 0));
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(COL.node, 0.25 + 0.45 * node.activation * pulse);
        ctx.fill();
        ctx.strokeStyle = rgba(COL.node, 0.5 + 0.5 * pulse);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = rgba(COL.signal, 0.5 * node.activation * pulse);
        ctx.fill();
      }

      for (var mi = 0; mi < net.nodes.length; mi++) {
        var mnode = net.nodes[mi];
        var mdx = mouse.x - mnode.x;
        var mdy = mouse.y - mnode.y;
        var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 150) {
          var malpha = (1 - mdist / 150) * 0.3;
          ctx.beginPath();
          ctx.moveTo(mnode.x, mnode.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = rgba(COL.goldLight, malpha);
          ctx.lineWidth = 0.5;
          ctx.stroke();

          ctx.font = '9px monospace';
          ctx.fillStyle = rgba(COL.goldLight, malpha);
          ctx.fillText('w=' + mnode.weight, mnode.x + mnode.radius + 5, mnode.y - 6);
        }
      }
    }

    var vig = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.25, W * 0.5, H * 0.5, W * 0.8);
    vig.addColorStop(0, 'rgba(255,255,255,0)');
    vig.addColorStop(1, 'rgba(245,245,244,0.5)');
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
