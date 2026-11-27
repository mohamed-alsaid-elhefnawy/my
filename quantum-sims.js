/**
 * QUANTUM SIMULATION ENGINES
 * High-performance scientific simulators for:
 * 1. Wave-Particle Duality (Double Slit Experiment & Wavefunction Collapse)
 * 2. Bloch Sphere & Quantum Superposition Measurement
 * 3. Heisenberg Uncertainty Principle (Fourier conjugate variables)
 * 4. Schrödinger Equation (1D Quantum Potential Well)
 * 5. Quantum Entanglement & Bell State Correlation
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DOUBLE-SLIT QUANTUM SIMULATION
  // =========================================================================
  const DoubleSlit = {
    canvas: null,
    ctx: null,
    mode: 'particles', // 'wave', 'particles', 'observer'
    wavelength: 35,
    slitDistance: 45,
    slitWidth: 10,
    particles: [],
    hits: [],
    animationId: null,
    lastTime: 0,
    isFiring: true,

    init() {
      this.canvas = document.getElementById('double-slit-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.bindControls();
      this.animate();
    },

    resize() {
      if (!this.canvas || !this.canvas.parentElement) return;
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = 360;
    },

    bindControls() {
      const modeBtns = document.querySelectorAll('[data-ds-mode]');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          modeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.mode = btn.dataset.dsMode;
          this.resetHits();
        });
      });

      const lambdaSlider = document.getElementById('ds-slider-lambda');
      if (lambdaSlider) {
        lambdaSlider.addEventListener('input', (e) => {
          this.wavelength = parseFloat(e.target.value);
          const valEl = document.getElementById('ds-val-lambda');
          if (valEl) valEl.textContent = `${this.wavelength} nm`;
        });
      }

      const slitSlider = document.getElementById('ds-slider-dist');
      if (slitSlider) {
        slitSlider.addEventListener('input', (e) => {
          this.slitDistance = parseFloat(e.target.value);
          const valEl = document.getElementById('ds-val-dist');
          if (valEl) valEl.textContent = `${this.slitDistance} µm`;
        });
      }

      const resetBtn = document.getElementById('ds-btn-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetHits());
      }
    },

    resetHits() {
      this.hits = [];
      this.particles = [];
      const hitCountEl = document.getElementById('ds-hit-counter');
      if (hitCountEl) hitCountEl.textContent = '0 hits';
    },

    // Calculate quantum probability of landing at vertical position y on detector screen
    getProbability(y, height) {
      const cy = height / 2;
      const normalizedY = (y - cy) / (height * 0.4); // angle approximation
      const k = (2 * Math.PI) / (this.wavelength * 0.1);
      const d = this.slitDistance * 0.1;
      const a = this.slitWidth * 0.05;

      const alpha = (k * a * normalizedY) / 2;
      const beta = (k * d * normalizedY) / 2;

      // Single-slit diffraction envelope
      const diffraction = alpha === 0 ? 1 : Math.pow(Math.sin(alpha) / alpha, 2);

      if (this.mode === 'observer') {
        // Wavefunction collapsed! No phase interference term: I = I1 + I2 (two separate classical gaussian bands)
        const slit1Center = -d * 4;
        const slit2Center = d * 4;
        const p1 = Math.exp(-Math.pow(y - (cy + slit1Center), 2) / (2 * 450));
        const p2 = Math.exp(-Math.pow(y - (cy + slit2Center), 2) / (2 * 450));
        return (p1 + p2) * 0.5;
      } else {
        // Full Quantum Interference: I ~ cos²(beta) * diffraction
        const interference = Math.pow(Math.cos(beta), 2);
        return Math.max(0, diffraction * interference);
      }
    },

    animate(timestamp) {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
      if (!this.ctx) return;

      const w = this.canvas.width;
      const h = this.canvas.height;
      const ctx = this.ctx;

      // Dark background
      ctx.fillStyle = '#060A17';
      ctx.fillRect(0, 0, w, h);

      const barrierX = w * 0.38;
      const detectorX = w * 0.88;
      const gunX = w * 0.06;
      const cy = h / 2;

      // 1. Draw Particle Gun / Source
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gunX, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('EMITTER', gunX - 20, cy + 28);

      // 2. Draw Double-Slit Barrier
      const slitOffset = this.slitDistance * 0.7;
      const s1Y = cy - slitOffset;
      const s2Y = cy + slitOffset;
      const halfSlit = this.slitWidth * 0.5;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      // Top segment
      ctx.beginPath();
      ctx.moveTo(barrierX, 0);
      ctx.lineTo(barrierX, s1Y - halfSlit);
      ctx.stroke();

      // Middle segment
      ctx.beginPath();
      ctx.moveTo(barrierX, s1Y + halfSlit);
      ctx.lineTo(barrierX, s2Y - halfSlit);
      ctx.stroke();

      // Bottom segment
      ctx.beginPath();
      ctx.moveTo(barrierX, s2Y + halfSlit);
      ctx.lineTo(barrierX, h);
      ctx.stroke();

      // Observer Detector indicator if in observer mode
      if (this.mode === 'observer') {
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.arc(barrierX + 10, s1Y, 7, 0, Math.PI * 2);
        ctx.arc(barrierX + 10, s2Y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F472B6';
        ctx.font = '9px JetBrains Mono';
        ctx.fillText('👁 DETECTOR ACTIVE', barrierX - 45, 25);
      }

      // 3. Draw Detector Screen
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(detectorX, 10);
      ctx.lineTo(detectorX, h - 10);
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('DETECTOR SCREEN', detectorX - 45, h - 15);

      // 4. Render Mode Specific Visuals
      if (this.mode === 'wave') {
        // Continuous Quantum Wavefronts
        const t = (timestamp || 0) * 0.003;
        ctx.save();
        ctx.lineWidth = 1.5;

        // Wave from source to slits
        for (let r = (t * 20) % 25; r < (barrierX - gunX); r += 25) {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(gunX, cy, r, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
        }

        // Waves emerging from slit 1 & slit 2
        for (let r = (t * 25) % 25; r < (detectorX - barrierX); r += 25) {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
          ctx.beginPath();
          ctx.arc(barrierX, s1Y, r, -Math.PI / 2.5, Math.PI / 2.5);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
          ctx.beginPath();
          ctx.arc(barrierX, s2Y, r, -Math.PI / 2.5, Math.PI / 2.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Particle Generation & Propagation
      if (this.isFiring && Math.random() < 0.45) {
        this.particles.push({
          x: gunX,
          y: cy + (Math.random() - 0.5) * 4,
          vx: 4.5 + Math.random(),
          vy: (Math.random() - 0.5) * 1.5,
          passedBarrier: false,
          chosenSlit: Math.random() > 0.5 ? 1 : 2
        });
      }

      // Update active particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle wave-packet
        ctx.fillStyle = this.mode === 'observer' ? '#EC4899' : '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Reach detector screen
        if (p.x >= detectorX) {
          // Sample landing position based on quantum probability distribution
          let landingY = cy;
          let found = false;
          let tries = 0;
          while (!found && tries < 30) {
            tries++;
            const candidateY = Math.random() * (h - 40) + 20;
            const prob = this.getProbability(candidateY, h);
            if (Math.random() < prob) {
              landingY = candidateY;
              found = true;
            }
          }

          this.hits.push({ y: landingY, alpha: 0.95 });
          if (this.hits.length > 900) this.hits.shift();

          const hitCountEl = document.getElementById('ds-hit-counter');
          if (hitCountEl) hitCountEl.textContent = `${this.hits.length} hits recorded`;

          this.particles.splice(i, 1);
        }
      }

      // 5. Draw Accumulated Hits on Screen
      this.hits.forEach(hit => {
        ctx.fillStyle = this.mode === 'observer' ? 'rgba(236, 72, 153, 0.7)' : 'rgba(0, 240, 255, 0.75)';
        ctx.fillRect(detectorX - 2, hit.y - 1, 6, 2);
      });

      // 6. Draw Continuous Mathematical Probability Curve on right margin
      ctx.strokeStyle = this.mode === 'observer' ? '#EC4899' : '#00F0FF';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let y = 10; y < h - 10; y += 3) {
        const p = this.getProbability(y, h);
        const curveX = detectorX + 15 + p * 45;
        if (y === 10) ctx.moveTo(curveX, y);
        else ctx.lineTo(curveX, y);
      }
      ctx.stroke();
    }
  };

  // =========================================================================
  // 2. BLOCH SPHERE & QUANTUM SUPERPOSITION SIMULATION
  // =========================================================================
  const BlochSphere = {
    canvas: null,
    ctx: null,
    theta: Math.PI / 3, // Polar angle (0 to PI)
    phi: Math.PI / 4,   // Azimuthal phase (0 to 2PI)
    isCollapsed: false,
    collapsedState: null,
    measureLog: [],

    init() {
      this.canvas = document.getElementById('bloch-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.bindControls();
      this.updateState();
      this.render();
    },

    resize() {
      if (!this.canvas || !this.canvas.parentElement) return;
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = 340;
      this.render();
    },

    bindControls() {
      const thetaSlider = document.getElementById('bloch-slider-theta');
      if (thetaSlider) {
        thetaSlider.addEventListener('input', (e) => {
          this.theta = (parseFloat(e.target.value) / 180) * Math.PI;
          this.isCollapsed = false;
          this.updateState();
          this.render();
        });
      }

      const phiSlider = document.getElementById('bloch-slider-phi');
      if (phiSlider) {
        phiSlider.addEventListener('input', (e) => {
          this.phi = (parseFloat(e.target.value) / 180) * Math.PI;
          this.isCollapsed = false;
          this.updateState();
          this.render();
        });
      }

      // State preset buttons
      const presets = document.querySelectorAll('[data-bloch-preset]');
      presets.forEach(btn => {
        btn.addEventListener('click', () => {
          presets.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const p = btn.dataset.blochPreset;
          if (p === '0') { this.theta = 0; this.phi = 0; }
          else if (p === '1') { this.theta = Math.PI; this.phi = 0; }
          else if (p === 'plus') { this.theta = Math.PI / 2; this.phi = 0; }
          else if (p === 'minus') { this.theta = Math.PI / 2; this.phi = Math.PI; }
          else if (p === 'i') { this.theta = Math.PI / 2; this.phi = Math.PI / 2; }

          this.isCollapsed = false;
          this.syncSliders();
          this.updateState();
          this.render();
        });
      });

      // Measure button
      const measureBtn = document.getElementById('bloch-btn-measure');
      if (measureBtn) {
        measureBtn.addEventListener('click', () => this.performMeasurement());
      }
    },

    syncSliders() {
      const thetaSlider = document.getElementById('bloch-slider-theta');
      const phiSlider = document.getElementById('bloch-slider-phi');
      if (thetaSlider) thetaSlider.value = Math.round((this.theta / Math.PI) * 180);
      if (phiSlider) phiSlider.value = Math.round((this.phi / Math.PI) * 180);
    },

    updateState() {
      // Amplitudes: α = cos(θ/2), β = e^(iφ)sin(θ/2)
      const p0 = Math.pow(Math.cos(this.theta / 2), 2);
      const p1 = Math.pow(Math.sin(this.theta / 2), 2);

      const p0Percent = (p0 * 100).toFixed(1);
      const p1Percent = (p1 * 100).toFixed(1);

      const bar0 = document.getElementById('bloch-bar-0');
      const bar1 = document.getElementById('bloch-bar-1');
      const text0 = document.getElementById('bloch-p0-val');
      const text1 = document.getElementById('bloch-p1-val');
      const ketEl = document.getElementById('bloch-state-ket');

      if (bar0) bar0.style.width = `${p0Percent}%`;
      if (bar1) bar1.style.width = `${p1Percent}%`;
      if (text0) text0.textContent = `${p0Percent}%`;
      if (text1) text1.textContent = `${p1Percent}%`;

      if (ketEl) {
        const a = Math.cos(this.theta / 2).toFixed(2);
        const b = Math.sin(this.theta / 2).toFixed(2);
        const phiDeg = Math.round((this.phi / Math.PI) * 180);
        ketEl.textContent = `|ψ⟩ = ${a}|0⟩ + (${b} e^(${phiDeg}° i))|1⟩`;
      }
    },

    performMeasurement() {
      // Born rule probability
      const p0 = Math.pow(Math.cos(this.theta / 2), 2);
      const outcome = Math.random() < p0 ? 0 : 1;
      this.isCollapsed = true;
      this.collapsedState = outcome;

      // Collapse state vector
      this.theta = outcome === 0 ? 0 : Math.PI;
      this.syncSliders();
      this.updateState();
      this.render();

      // Audio feedback if audio module is active
      if (window.QuantumAudio) {
        window.QuantumAudio.playMeasurementBeep(outcome);
      }

      // Log measurement
      const logEl = document.getElementById('bloch-measure-status');
      if (logEl) {
        logEl.innerHTML = `<span style="color:${outcome === 0 ? '#00F0FF' : '#EC4899'}; font-weight:700;">COLLAPSED TO |${outcome}⟩</span> (Born probability was ${(outcome === 0 ? p0 * 100 : (1 - p0) * 100).toFixed(1)}%)`;
      }
    },

    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(cx, cy) * 0.72;

      ctx.fillStyle = '#060A17';
      ctx.fillRect(0, 0, w, h);

      // Draw Sphere outline
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Equator ellipse
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Z-axis (Vertical: |0> top, |1> bottom)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r - 16);
      ctx.lineTo(cx, cy + r + 16);
      ctx.stroke();

      // X-axis & Y-axis guides
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(cx - r - 12, cy);
      ctx.lineTo(cx + r + 12, cy);
      ctx.stroke();

      // Labels
      ctx.font = '12px Space Grotesk';
      ctx.fillStyle = '#00F0FF';
      ctx.fillText('|0⟩ (Z+)', cx + 8, cy - r - 8);
      ctx.fillStyle = '#EC4899';
      ctx.fillText('|1⟩ (Z-)', cx + 8, cy + r + 18);

      // Calculate 3D to 2D projection of state vector
      // Cartesian: x = r*sin(theta)*cos(phi), y = r*sin(theta)*sin(phi), z = r*cos(theta)
      // Orthographic projection with slight perspective angle
      const sinT = Math.sin(this.theta);
      const cosT = Math.cos(this.theta);
      const sinP = Math.sin(this.phi);
      const cosP = Math.cos(this.phi);

      // Screen X, Y
      const sx = cx + r * sinT * cosP;
      const sy = cy - r * cosT + (r * sinT * sinP * 0.28);

      // Draw State Vector Line
      const stateGrad = ctx.createLinearGradient(cx, cy, sx, sy);
      stateGrad.addColorStop(0, '#3B82F6');
      stateGrad.addColorStop(1, this.isCollapsed ? (this.collapsedState === 0 ? '#00F0FF' : '#EC4899') : '#00F0FF');

      ctx.strokeStyle = stateGrad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sx, sy);
      ctx.stroke();

      // State Vector Arrowhead / Glow Tip
      ctx.fillStyle = this.isCollapsed ? (this.collapsedState === 0 ? '#00F0FF' : '#EC4899') : '#FFFFFF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Vector Label
      ctx.font = '11px JetBrains Mono';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('|ψ⟩', sx + 10, sy - 8);
    }
  };

  // =========================================================================
  // 3. HEISENBERG UNCERTAINTY PRINCIPLE SIMULATOR
  // =========================================================================
  const Heisenberg = {
    canvas: null,
    ctx: null,
    deltaX: 18, // Confinement parameter
    hbar: 1.0,

    init() {
      this.canvas = document.getElementById('heisenberg-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.bindControls();
      this.render();
    },

    resize() {
      if (!this.canvas || !this.canvas.parentElement) return;
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = 300;
      this.render();
    },

    bindControls() {
      const slider = document.getElementById('heisenberg-slider-dx');
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.deltaX = parseFloat(e.target.value);
          this.render();
        });
      }
    },

    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.fillStyle = '#060A17';
      ctx.fillRect(0, 0, w, h);

      // Delta P calculated from conjugate relation: Δp = ℏ / (2 * Δx)
      const deltaP = 400 / this.deltaX;
      const product = (this.deltaX * (deltaP / 400)).toFixed(2);

      // Update text indicators
      const dxEl = document.getElementById('heisenberg-val-dx');
      const dpEl = document.getElementById('heisenberg-val-dp');
      const prodEl = document.getElementById('heisenberg-val-prod');
      if (dxEl) dxEl.textContent = `${this.deltaX.toFixed(1)} nm`;
      if (dpEl) dpEl.textContent = `${(deltaP * 0.1).toFixed(2)} × 10⁻²⁴ kg·m/s`;
      if (prodEl) prodEl.textContent = `${product} ℏ`;

      const halfW = w / 2;

      // 1. Left Half: Position Space |ψ(x)|²
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(halfW, 20);
      ctx.lineTo(halfW, h - 20);
      ctx.stroke();

      ctx.font = '12px Space Grotesk';
      ctx.fillStyle = '#00F0FF';
      ctx.fillText('POSITION SPACE |ψ(x)|²', 25, 30);
      ctx.fillStyle = '#A855F7';
      ctx.fillText('MOMENTUM SPACE |φ(p)|²', halfW + 25, 30);

      // Position Gaussian Waveform
      const cy = h / 2 + 30;
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 20; x < halfW - 20; x++) {
        const relX = x - (halfW / 2);
        const val = Math.exp(-Math.pow(relX / this.deltaX, 2));
        const y = cy - val * 90;
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Slit confinement indicator
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      const leftBound = (halfW / 2) - this.deltaX;
      const rightBound = (halfW / 2) + this.deltaX;
      ctx.beginPath();
      ctx.moveTo(leftBound, cy - 100);
      ctx.lineTo(leftBound, cy + 20);
      ctx.moveTo(rightBound, cy - 100);
      ctx.lineTo(rightBound, cy + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`Δx = ${this.deltaX.toFixed(0)}`, (halfW / 2) - 15, cy + 32);

      // 2. Right Half: Momentum Space |φ(p)|²
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const pCenterX = halfW + (halfW / 2);
      for (let x = halfW + 20; x < w - 20; x++) {
        const relP = x - pCenterX;
        const val = Math.exp(-Math.pow(relP / (deltaP * 0.45), 2));
        const y = cy - val * 90;
        if (x === halfW + 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`Δp = ${(deltaP * 0.1).toFixed(1)}`, pCenterX - 15, cy + 32);
    }
  };

  // =========================================================================
  // 4. SCHRÖDINGER 1D INFINITE POTENTIAL WELL
  // =========================================================================
  const SchrodingerWell = {
    canvas: null,
    ctx: null,
    quantumN: 1,
    showProbability: true,
    time: 0,
    animationId: null,

    init() {
      this.canvas = document.getElementById('schrodinger-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.bindControls();
      this.animate();
    },

    resize() {
      if (!this.canvas || !this.canvas.parentElement) return;
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = 320;
    },

    bindControls() {
      const nButtons = document.querySelectorAll('[data-well-n]');
      nButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          nButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.quantumN = parseInt(btn.dataset.wellN, 10);
          this.updateEnergy();
        });
      });

      const modeToggle = document.getElementById('well-toggle-density');
      if (modeToggle) {
        modeToggle.addEventListener('click', () => {
          this.showProbability = !this.showProbability;
          modeToggle.classList.toggle('active', this.showProbability);
          modeToggle.textContent = this.showProbability ? 'Showing: Probability Density |ψ|²' : 'Showing: Wavefunction ψ(x,t)';
        });
      }
    },

    updateEnergy() {
      const n = this.quantumN;
      const energyEl = document.getElementById('well-val-energy');
      if (energyEl) {
        // En = n² * E1
        const e1 = 3.75;
        const en = (Math.pow(n, 2) * e1).toFixed(1);
        energyEl.textContent = `${en} eV (E_${n})`;
      }
    },

    animate() {
      this.animationId = requestAnimationFrame(() => this.animate());
      if (!this.ctx) return;

      this.time += 0.04;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const L = w * 0.7; // Well width
      const x0 = (w - L) / 2;
      const x1 = x0 + L;
      const cy = h / 2 + 20;

      ctx.fillStyle = '#060A17';
      ctx.fillRect(0, 0, w, h);

      // Draw Potential Well Barriers (V = ∞)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, 0, x0, h);
      ctx.fillRect(x1, 0, w - x1, h);

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, 20);
      ctx.lineTo(x0, h - 30);
      ctx.lineTo(x1, h - 30);
      ctx.lineTo(x1, 20);
      ctx.stroke();

      ctx.font = '11px JetBrains Mono';
      ctx.fillStyle = '#64748B';
      ctx.fillText('V = ∞', x0 - 45, 40);
      ctx.fillText('V = ∞', x1 + 10, 40);
      ctx.fillText('x = 0', x0 - 15, h - 12);
      ctx.fillText('x = L', x1 - 15, h - 12);
      ctx.fillText('V(x) = 0 inside well', (w / 2) - 50, h - 12);

      // Draw Wavefunction
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const n = this.quantumN;
      const phase = this.time * n * 0.8;

      if (this.showProbability) {
        // |ψ|²: Stationary, non-oscillating probability density
        ctx.strokeStyle = '#00F0FF';
        for (let x = x0; x <= x1; x++) {
          const frac = (x - x0) / L;
          const spatial = Math.sin(n * Math.PI * frac);
          const density = Math.pow(spatial, 2);
          const y = (h - 30) - density * 130;
          if (x === x0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Fill area under curve
        ctx.lineTo(x1, h - 30);
        ctx.lineTo(x0, h - 30);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.fill();

      } else {
        // Re[Ψ(x,t)] oscillating wave
        ctx.strokeStyle = '#A855F7';
        for (let x = x0; x <= x1; x++) {
          const frac = (x - x0) / L;
          const spatial = Math.sin(n * Math.PI * frac);
          const wave = spatial * Math.cos(phase);
          const y = cy - wave * 75;
          if (x === x0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  };

  // =========================================================================
  // 5. QUANTUM ENTANGLEMENT & BELL STATE CORRELATION
  // =========================================================================
  const EntanglementLab = {
    stateA: null,
    stateB: null,
    pairCount: 0,
    correlationCount: 0,

    init() {
      const btnGenerate = document.getElementById('entangle-btn-generate');
      const btnMeasureA = document.getElementById('entangle-btn-measureA');
      const btnMeasureB = document.getElementById('entangle-btn-measureB');

      if (btnGenerate) btnGenerate.addEventListener('click', () => this.generatePair());
      if (btnMeasureA) btnMeasureA.addEventListener('click', () => this.measureA());
      if (btnMeasureB) btnMeasureB.addEventListener('click', () => this.measureB());
    },

    generatePair() {
      this.stateA = 'superposition';
      this.stateB = 'superposition';
      this.pairCount++;

      this.updateUI();

      const beam = document.querySelector('.entanglement-beam');
      if (beam) {
        beam.style.opacity = '1';
        beam.style.boxShadow = '0 0 25px #00F0FF';
      }

      const log = document.getElementById('entangle-status-text');
      if (log) {
        log.innerHTML = `<span style="color:#00F0FF; font-weight:600;">NEW BELL PAIR CREATED</span>: |Ψ⁺⟩ = 1/√2 (|↑↓⟩ + |↓↑⟩). Both particles in entangled superposition.`;
      }
    },

    measureA() {
      if (!this.stateA) this.generatePair();
      if (this.stateA !== 'superposition') return; // already collapsed

      // Measure A: 50% Spin-Up, 50% Spin-Down
      const spinUp = Math.random() > 0.5;
      this.stateA = spinUp ? 'UP (↑)' : 'DOWN (↓)';
      // Entangled Bell singlet state ensures instant opposite spin
      this.stateB = spinUp ? 'DOWN (↓)' : 'UP (↑)';

      this.correlationCount++;
      this.updateUI();

      if (window.QuantumAudio) window.QuantumAudio.playBellChime();

      const log = document.getElementById('entangle-status-text');
      if (log) {
        log.innerHTML = `<span style="color:#00F0FF; font-weight:700;">MEASUREMENT COLLAPSED!</span> Alice measured Qubit A = <b>${this.stateA}</b>. Non-local wavefunction collapse instantly fixed Bob's Qubit B to <b>${this.stateB}</b> with 100% correlation.`;
      }
    },

    measureB() {
      this.measureA(); // symmetric in singlet state
    },

    updateUI() {
      const qA = document.getElementById('qubit-a-state');
      const qB = document.getElementById('qubit-b-state');
      const corrEl = document.getElementById('entangle-correlation-val');

      if (qA) qA.textContent = this.stateA === 'superposition' ? '|ψ⟩ = 1/√2(|↑⟩+|↓⟩)' : this.stateA;
      if (qB) qB.textContent = this.stateB === 'superposition' ? '|ψ⟩ = 1/√2(|↑⟩+|↓⟩)' : this.stateB;
      if (corrEl) corrEl.textContent = `100.0% (${this.correlationCount} pairs verified)`;
    }
  };

  // Initialize all simulation engines when page is ready
  function initAllSims() {
    DoubleSlit.init();
    BlochSphere.init();
    Heisenberg.init();
    SchrodingerWell.init();
    EntanglementLab.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSims);
  } else {
    initAllSims();
  }

  window.QuantumSims = {
    DoubleSlit,
    BlochSphere,
    Heisenberg,
    SchrodingerWell,
    EntanglementLab
  };
})();
