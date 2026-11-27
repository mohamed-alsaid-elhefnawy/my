/**
 * QUANTUM MECHANICS SCIENTIFIC UI & SIMULATION ENGINE
 * 
 * Modules:
 * 1. Ambient Floating Quantum Particles Canvas Network
 * 2. Three.js 3D Hydrogen Atom & Orbital Visualizer (Hero & Orbitals)
 * 3. Bohr Atomic Transitions & Photon Emission Canvas
 * 4. Wave-Particle Duality Double-Slit Experiment Canvas
 * 5. Schrödinger 1D Infinite Potential Well Wave Simulator
 * 6. Scientific Calculators (Planck Photon Energy & De Broglie Wavelength)
 * 7. Navigation Controller & Active Section Spy
 * 8. Quick Search Modal (Ctrl + K) & Academic Dossier Modal
 * 9. KaTeX Mathematical Notation Renderer
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. AMBIENT BACKGROUND QUANTUM PARTICLES CANVAS
  // =========================================================================
  const AmbientParticles = {
    canvas: null,
    ctx: null,
    particles: [],
    numParticles: 45,
    maxDistance: 130,
    animId: null,

    init() {
      this.canvas = document.getElementById('quantum-bg-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();

      window.addEventListener('resize', () => this.resize());

      // Create random particles
      this.particles = [];
      for (let i = 0; i < this.numParticles; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.8 + 0.8,
          alpha: Math.random() * 0.5 + 0.2
        });
      }

      this.animate();
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    animate() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Update and draw particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Particle orb
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles with subtle filament lines
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.maxDistance) {
            const lineAlpha = (1 - dist / this.maxDistance) * 0.12;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      this.animId = requestAnimationFrame(() => this.animate());
    }
  };

  // =========================================================================
  // 2. THREE.JS 3D HYDROGEN ATOM & ORBITAL VISUALIZER
  // =========================================================================
  const Atom3D = {
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    nucleusGroup: null,
    orbitalGroup: null,
    currentOrbital: '1s',
    clock: null,
    animId: null,

    orbitalData: {
      '1s': {
        name: 'Hydrogen Atom: 1s Ground State',
        n: 1, l: 0, energy: '-13.60 eV', L: '0.00 ℏ',
        desc: 'Spherically symmetric ground state with zero orbital angular momentum (l = 0). Maximum probability density |ψ|² surrounds the glowing nucleus.'
      },
      '2s': {
        name: '2s Excited State (Radial Node)',
        n: 2, l: 0, energy: '-3.40 eV', L: '0.00 ℏ',
        desc: 'Spherical orbital featuring an internal radial node at r = 2a₀ where ψ = 0, surrounded by an outer spherical electron shell.'
      },
      '2pz': {
        name: '2p_z Orbital (Dumbbell Lobes)',
        n: 2, l: 1, energy: '-3.40 eV', L: '1.41 ℏ (√2)',
        desc: 'Dumbbell-shaped orbital directed along the z-axis with an angular nodal plane in the xy-plane (z = 0) where detection probability is zero.'
      },
      '2px': {
        name: '2p_x Orbital (Lobed Symmetry)',
        n: 2, l: 1, energy: '-3.40 eV', L: '1.41 ℏ (√2)',
        desc: 'Dumbbell-shaped orbital directed along the x-axis with an angular nodal plane in the yz-plane (x = 0).'
      },
      '3dz2': {
        name: '3d_z² Orbital (Torus & Lobes)',
        n: 3, l: 2, energy: '-1.51 eV', L: '2.45 ℏ (√6)',
        desc: 'High angular momentum orbital consisting of two prominent z-axial lobes encircled by an equatorial toroidal probability donut.'
      }
    },

    init() {
      this.canvas = document.getElementById('quantum-atom-canvas');
      if (!this.canvas) return;

      if (typeof THREE === 'undefined') {
        console.warn('Three.js not found. Fallback to 2D scientific canvas.');
        return;
      }

      const container = this.canvas.parentElement;
      const w = container.clientWidth || 450;
      const h = container.clientHeight || 380;

      // Scene, Camera, Renderer
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x060B18, 0.018);

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
      this.camera.position.set(0, 16, 38);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // OrbitControls
      const OrbitControlsConstructor = THREE.OrbitControls || (typeof OrbitControls !== 'undefined' ? OrbitControls : null);
      if (OrbitControlsConstructor) {
        this.controls = new OrbitControlsConstructor(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.maxDistance = 75;
        this.controls.minDistance = 15;
      }

      this.clock = new THREE.Clock();

      // Create Nucleus
      this.createNucleus();

      // Build initial 1s orbital cloud
      this.rebuildOrbital(this.currentOrbital);

      // Event listeners for buttons
      document.querySelectorAll('[data-orbital-select]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-orbital-select]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const orb = btn.getAttribute('data-orbital-select');
          this.switchOrbital(orb);
        });
      });

      const recenterBtn = document.getElementById('btn-recenter-cam');
      if (recenterBtn) {
        recenterBtn.addEventListener('click', () => {
          this.camera.position.set(0, 16, 38);
          if (this.controls) this.controls.target.set(0, 0, 0);
        });
      }

      window.addEventListener('resize', () => this.onResize());
      this.animate();
    },

    createNucleus() {
      this.nucleusGroup = new THREE.Group();

      // Proton Core
      const coreGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x00F0FF,
        wireframe: false
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      this.nucleusGroup.add(coreMesh);

      // Outer Glowing Aura Shell
      const auraGeo = new THREE.SphereGeometry(2.1, 24, 24);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0x38BDF8,
        transparent: true,
        opacity: 0.22,
        wireframe: true
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      this.nucleusGroup.add(auraMesh);

      this.scene.add(this.nucleusGroup);
    },

    switchOrbital(mode) {
      if (!this.orbitalData[mode]) return;
      this.currentOrbital = mode;

      const data = this.orbitalData[mode];
      const nameEl = document.getElementById('hud-orbital-name');
      const nEl = document.getElementById('metric-n');
      const lEl = document.getElementById('metric-l');
      const energyEl = document.getElementById('metric-energy');
      const lValEl = document.getElementById('metric-l-val');
      const descEl = document.getElementById('orbital-desc-text');

      if (nameEl) nameEl.textContent = data.name;
      if (nEl) nEl.textContent = data.n;
      if (lEl) lEl.textContent = `${data.l} (${mode.slice(-1) === 's' ? 's' : (mode.includes('p') ? 'p' : 'd')})`;
      if (energyEl) energyEl.textContent = data.energy;
      if (lValEl) lValEl.textContent = data.L;
      if (descEl) descEl.textContent = data.desc;

      this.rebuildOrbital(mode);
    },

    rebuildOrbital(mode) {
      if (this.orbitalGroup) {
        this.scene.remove(this.orbitalGroup);
      }
      this.orbitalGroup = new THREE.Group();

      const particleCount = 2800;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorCyan = new THREE.Color(0x00F0FF);
      const colorBlue = new THREE.Color(0x38BDF8);
      const colorViolet = new THREE.Color(0x8B5CF6);

      let idx = 0;
      for (let i = 0; i < particleCount; i++) {
        let x = 0, y = 0, z = 0;
        let c = colorCyan;

        if (mode === '1s') {
          // Exponential spherical falloff
          const u = Math.random();
          const r = -Math.log(1 - u) * 7.5 + 1.5;
          const theta = Math.acos(2 * Math.random() - 1);
          const phi = Math.random() * Math.PI * 2;

          x = r * Math.sin(theta) * Math.cos(phi);
          y = r * Math.sin(theta) * Math.sin(phi);
          z = r * Math.cos(theta);
          c = r < 6 ? colorCyan : colorBlue;

        } else if (mode === '2s') {
          // Inner core and outer spherical shell with node
          const isOuter = Math.random() > 0.35;
          const r = isOuter
            ? Math.random() * 8 + 10 // outer shell
            : Math.random() * 4 + 1.5; // inner core
          const theta = Math.acos(2 * Math.random() - 1);
          const phi = Math.random() * Math.PI * 2;

          x = r * Math.sin(theta) * Math.cos(phi);
          y = r * Math.sin(theta) * Math.sin(phi);
          z = r * Math.cos(theta);
          c = isOuter ? colorBlue : colorCyan;

        } else if (mode === '2pz') {
          // Dumbbell lobes along z-axis (cos(theta))
          const u = Math.random();
          const r = Math.pow(u, 0.45) * 16 + 2;
          const sign = Math.random() > 0.5 ? 1 : -1;
          const cosTheta = Math.pow(Math.random(), 0.5) * sign;
          const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
          const phi = Math.random() * Math.PI * 2;

          x = r * sinTheta * Math.cos(phi) * 0.55;
          y = r * sinTheta * Math.sin(phi) * 0.55;
          z = r * cosTheta * 1.35;
          c = sign > 0 ? colorCyan : colorViolet;

        } else if (mode === '2px') {
          // Dumbbell lobes along x-axis
          const u = Math.random();
          const r = Math.pow(u, 0.45) * 16 + 2;
          const sign = Math.random() > 0.5 ? 1 : -1;
          const cosTheta = Math.pow(Math.random(), 0.5) * sign;
          const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
          const phi = Math.random() * Math.PI * 2;

          x = r * cosTheta * 1.35;
          y = r * sinTheta * Math.sin(phi) * 0.55;
          z = r * sinTheta * Math.cos(phi) * 0.55;
          c = sign > 0 ? colorCyan : colorViolet;

        } else if (mode === '3dz2') {
          // Torus in xy-plane + lobes along z
          const isTorus = Math.random() > 0.55;
          if (isTorus) {
            const rTorus = Math.random() * 5 + 7;
            const phi = Math.random() * Math.PI * 2;
            x = rTorus * Math.cos(phi);
            y = rTorus * Math.sin(phi);
            z = (Math.random() - 0.5) * 3;
            c = colorBlue;
          } else {
            const sign = Math.random() > 0.5 ? 1 : -1;
            const r = Math.random() * 12 + 4;
            const spread = Math.random() * 2.5;
            x = (Math.random() - 0.5) * spread;
            y = (Math.random() - 0.5) * spread;
            z = sign * r;
            c = colorCyan;
          }
        }

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        colors[idx * 3] = c.r;
        colors[idx * 3 + 1] = c.g;
        colors[idx * 3 + 2] = c.b;
        idx++;
      }

      const pointGeo = new THREE.BufferGeometry();
      pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const pointMat = new THREE.PointsMaterial({
        size: 0.75,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });

      const points = new THREE.Points(pointGeo, pointMat);
      this.orbitalGroup.add(points);
      this.scene.add(this.orbitalGroup);
    },

    onResize() {
      if (!this.canvas || !this.renderer || !this.camera) return;
      const container = this.canvas.parentElement;
      const w = container.clientWidth || 450;
      const h = container.clientHeight || 380;

      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    },

    animate() {
      this.animId = requestAnimationFrame(() => this.animate());

      const elapsed = this.clock ? this.clock.getElapsedTime() : 0;

      // Subtle slow rotation of orbital
      if (this.orbitalGroup) {
        this.orbitalGroup.rotation.y = elapsed * 0.12;
      }
      if (this.nucleusGroup) {
        this.nucleusGroup.rotation.y = elapsed * 0.35;
        this.nucleusGroup.rotation.x = elapsed * 0.18;
      }

      if (this.controls) this.controls.update();
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }
  };

  // =========================================================================
  // 3. EXACT MATHEMATICAL WAVEFUNCTION & HYDROGEN ATOM SIMULATION ENGINE
  // =========================================================================
  const HydrogenMath = {
    FACT_TABLE: [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800],

    fact(k) {
      if (k <= 0) return 1;
      if (k < this.FACT_TABLE.length) return this.FACT_TABLE[k];
      let res = this.FACT_TABLE[this.FACT_TABLE.length - 1];
      for (let i = this.FACT_TABLE.length; i <= k; i++) res *= i;
      return res;
    },

    // Associated Laguerre Polynomial L_k^alpha(x) via recurrence
    laguerre(k, alpha, x) {
      if (k <= 0) return 1.0;
      if (k === 1) return 1.0 + alpha - x;
      let L0 = 1.0;
      let L1 = 1.0 + alpha - x;
      let Lk = 0.0;
      for (let j = 2; j <= k; j++) {
        Lk = ((2 * j - 1 + alpha - x) * L1 - (j - 1 + alpha) * L0) / j;
        L0 = L1;
        L1 = Lk;
      }
      return L1;
    },

    // Associated Legendre Polynomial P_l^m(u) with u = cos(theta) in [-1, 1]
    legendre(l, m, u) {
      u = Math.max(-1.0, Math.min(1.0, u));
      const absM = Math.abs(m);
      if (absM > l) return 0.0;

      let pmm = 1.0;
      if (absM > 0) {
        const somx2 = Math.sqrt(Math.max(0.0, (1.0 - u) * (1.0 + u)));
        let factVal = 1.0;
        for (let i = 1; i <= absM; i++) {
          pmm *= -factVal * somx2;
          factVal += 2.0;
        }
      }
      if (l === absM) return pmm;

      let pmmp1 = u * (2 * absM + 1) * pmm;
      if (l === absM + 1) return pmmp1;

      let pll = 0.0;
      for (let ll = absM + 2; ll <= l; ll++) {
        pll = ((2 * ll - 1) * u * pmmp1 - (ll + absM - 1) * pmm) / (ll - absM);
        pmm = pmmp1;
        pmmp1 = pll;
      }
      return pll;
    },

    // Real Spherical Harmonics Y_l^m(theta, phi)
    realSphericalHarmonic(l, m, theta, phi) {
      const u = Math.cos(theta);
      const absM = Math.abs(m);
      const Plm = this.legendre(l, absM, u);
      const factRatio = this.fact(l - absM) / this.fact(l + absM);
      const normFactor = Math.sqrt(((2 * l + 1) / (m === 0 ? (4 * Math.PI) : (2 * Math.PI))) * factRatio);

      if (m === 0) {
        return normFactor * Plm;
      } else if (m > 0) {
        return normFactor * Plm * Math.cos(m * phi);
      } else {
        return normFactor * Plm * Math.sin(absM * phi);
      }
    },

    // Radial Wavefunction R_{n,l}(r) in atomic units a0 = 1
    radialWavefunction(n, l, r) {
      if (r < 0) r = 0;
      const a0 = 1.0;
      const rho = (2.0 * r) / (n * a0);
      const k = n - l - 1;
      const alpha = 2 * l + 1;
      const L = this.laguerre(k, alpha, rho);
      const normFactor = Math.sqrt(
        Math.pow(2.0 / (n * a0), 3) *
        (this.fact(n - l - 1) / (2.0 * n * Math.pow(this.fact(n + l), 3)))
      );
      return normFactor * Math.exp(-rho / 2.0) * Math.pow(rho, l) * L;
    },

    // Full 3D Spatial Wavefunction psi_{nlm}(x, y, z)
    wavefunction(n, l, m, x, y, z) {
      const r = Math.sqrt(x * x + y * y + z * z);
      if (r < 1e-8) {
        if (l === 0) {
          return this.radialWavefunction(n, 0, 0) * (1.0 / Math.sqrt(4 * Math.PI));
        }
        return 0.0;
      }
      const theta = Math.acos(Math.max(-1.0, Math.min(1.0, z / r)));
      const phi = Math.atan2(y, x);
      const R = this.radialWavefunction(n, l, r);
      const Y = this.realSphericalHarmonic(l, m, theta, phi);
      return R * Y;
    },

    // Probability Density |psi(x, y, z)|^2
    probDensity(n, l, m, x, y, z) {
      const psi = this.wavefunction(n, l, m, x, y, z);
      return psi * psi;
    },

    // Scientific Colormap RGB Interpolator
    getColormapRGB(t, scheme = 'plasma') {
      t = Math.max(0.0, Math.min(1.0, t));
      if (scheme === 'plasma') {
        if (t < 0.18) {
          const u = t / 0.18;
          return [Math.round(6 + u * 70), Math.round(11 + u * 18), Math.round(24 + u * 125)];
        } else if (t < 0.40) {
          const u = (t - 0.18) / 0.22;
          return [Math.round(76 + u * 71), Math.round(29 + u * 22), Math.round(149 + u * 85)];
        } else if (t < 0.65) {
          const u = (t - 0.40) / 0.25;
          return [Math.round(147 + u * 87), Math.round(51 + u * 37), Math.round(234 - u * 222)];
        } else if (t < 0.85) {
          const u = (t - 0.65) / 0.20;
          return [Math.round(234 + u * 16), Math.round(88 + u * 116), Math.round(12 + u * 9)];
        } else {
          const u = (t - 0.85) / 0.15;
          return [Math.round(250 + u * 5), Math.round(204 + u * 51), Math.round(21 + u * 234)];
        }
      } else if (scheme === 'cyan') {
        if (t < 0.5) {
          const u = t / 0.5;
          return [Math.round(6 - u * 4), Math.round(11 + u * 121), Math.round(24 + u * 175)];
        } else {
          const u = (t - 0.5) / 0.5;
          return [Math.round(2 + u * 253), Math.round(132 + u * 123), 255];
        }
      } else {
        const v = Math.round(t * 255);
        return [v, v, v];
      }
    },

    getOrbitalName(n, l, m) {
      const letters = ['s', 'p', 'd', 'f'];
      const letChar = letters[l] || 'x';
      if (l === 0) return `${n}s`;
      if (l === 1) {
        if (m === 0) return `${n}p_z`;
        if (m === 1) return `${n}p_x`;
        if (m === -1) return `${n}p_y`;
      }
      if (l === 2) {
        if (m === 0) return `${n}d_{z^2}`;
        if (m === 1) return `${n}d_{xz}`;
        if (m === -1) return `${n}d_{yz}`;
        if (m === 2) return `${n}d_{x^2-y^2}`;
        if (m === -2) return `${n}d_{xy}`;
      }
      return `${n}${letChar} (m = ${m})`;
    },

    getFormulaLaTeX(n, l, m) {
      if (n === 1 && l === 0) {
        return '$$\\psi_{100}(r) = \\frac{1}{\\sqrt{\\pi a_0^3}} e^{-r/a_0}$$';
      }
      if (n === 2 && l === 0) {
        return '$$\\psi_{200}(r) = \\frac{1}{4\\sqrt{2\\pi a_0^3}} \\left(2 - \\frac{r}{a_0}\\right) e^{-r/(2a_0)}$$';
      }
      if (n === 2 && l === 1 && m === 0) {
        return '$$\\psi_{210}(r,\\theta) = \\frac{1}{4\\sqrt{2\\pi a_0^3}} \\left(\\frac{r}{a_0}\\right) e^{-r/(2a_0)} \\cos\\theta$$';
      }
      if (n === 3 && l === 0) {
        return '$$\\psi_{300}(r) = \\frac{1}{81\\sqrt{3\\pi a_0^3}} \\left(27 - 18\\frac{r}{a_0} + 2\\frac{r^2}{a_0^2}\\right) e^{-r/(3a_0)}$$';
      }
      if (n === 3 && l === 2 && m === 0) {
        return '$$\\psi_{320}(r,\\theta) = \\frac{1}{81\\sqrt{6\\pi a_0^3}} \\left(\\frac{r}{a_0}\\right)^2 e^{-r/(3a_0)} (3\\cos^2\\theta - 1)$$';
      }
      return `$$\\psi_{${n}${l}${m}}(r,\\theta,\\phi) = R_{${n}${l}}(r) \\cdot Y_{${l}}^{${m}}(\\theta,\\phi)$$`;
    }
  };

  // =========================================================================
  // 4. ADVANCED HYDROGEN ATOM EXPLORER CONTROLLER
  // =========================================================================
  const HydrogenExplorer = {
    // Quantum Numbers & Visual Mode State
    n: 3,
    l: 2,
    m: 1,
    viewMode: '3d', // '3d', '2d', 'bohr'
    slicePlane: 'xz', // 'xz', 'yz', 'xy'
    colormap: 'plasma', // 'plasma', 'cyan', 'mono'
    cloudDensity: 6000,
    spinSpeed: 1.0,
    showNucleus: true,
    showAxes: true,
    showNodes: false,

    // Three.js 3D Environment
    canvas3D: null,
    renderer3D: null,
    scene3D: null,
    camera3D: null,
    controls3D: null,
    clock3D: null,
    nucleusGroup3D: null,
    axesGroup3D: null,
    nodesGroup3D: null,
    particleCloud3D: null,
    animId3D: null,

    // 2D Cross-section Canvas
    canvas2D: null,
    ctx2D: null,

    // Bohr Canvas Simulator
    canvasBohr: null,
    ctxBohr: null,
    bohrElectronAngle: 0,
    bohrPhotons: [],
    bohrRadiusInterp: 130,
    bohrTargetRadius: 130,
    bohrAnimId: null,

    // Gallery Orbitals Catalog (14 States)
    galleryOrbitals: [
      { n: 1, l: 0, m: 0, title: '1s Ground State', sub: 'Spherical' },
      { n: 2, l: 0, m: 0, title: '2s Orbital', sub: '1 Radial Node' },
      { n: 2, l: 1, m: 0, title: '2p_z Dumbbell', sub: 'xy Nodal Plane' },
      { n: 2, l: 1, m: 1, title: '2p_x Lobed', sub: 'yz Nodal Plane' },
      { n: 2, l: 1, m: -1, title: '2p_y Lobed', sub: 'xz Nodal Plane' },
      { n: 3, l: 0, m: 0, title: '3s Spherical', sub: '2 Radial Nodes' },
      { n: 3, l: 1, m: 0, title: '3p_z Orbital', sub: 'Radial + Angular' },
      { n: 3, l: 1, m: 1, title: '3p_x Orbital', sub: 'Radial + Angular' },
      { n: 3, l: 2, m: 0, title: '3d_{z^2} Torus', sub: '2 Conical Nodes' },
      { n: 3, l: 2, m: 1, title: '3d_{xz} Clover', sub: '2 Planar Nodes' },
      { n: 3, l: 2, m: -2, title: '3d_{xy} Clover', sub: '2 Planar Nodes' },
      { n: 4, l: 0, m: 0, title: '4s Spherical', sub: '3 Radial Nodes' },
      { n: 4, l: 1, m: 0, title: '4p_z Orbital', sub: '2 Radial Nodes' },
      { n: 4, l: 2, m: 0, title: '4d_{z^2} Torus', sub: '1 Radial Node' }
    ],

    init() {
      // 1. Initialize 3D Viewport
      this.init3D();

      // 2. Initialize 2D Cross-section Canvas
      this.init2D();

      // 3. Initialize Bohr Canvas
      this.initBohr();

      // 4. Initialize Controls & Listeners
      this.initControls();

      // 5. Build Orbitals Gallery
      this.buildGallery();

      // 6. Update Inspector & Views
      this.updateAll();
    },

    init3D() {
      this.canvas3D = document.getElementById('canvas-hydrogen-3d');
      if (!this.canvas3D || typeof THREE === 'undefined') return;

      const container = this.canvas3D.parentElement;
      const w = container.clientWidth || 550;
      const h = container.clientHeight || 480;

      this.scene3D = new THREE.Scene();
      this.scene3D.fog = new THREE.FogExp2(0x060B18, 0.012);

      this.camera3D = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
      this.camera3D.position.set(0, 18, 42);

      this.renderer3D = new THREE.WebGLRenderer({
        canvas: this.canvas3D,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer3D.setSize(w, h);
      this.renderer3D.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const OrbitControlsConstructor = THREE.OrbitControls || (typeof OrbitControls !== 'undefined' ? OrbitControls : null);
      if (OrbitControlsConstructor) {
        this.controls3D = new OrbitControlsConstructor(this.camera3D, this.renderer3D.domElement);
        this.controls3D.enableDamping = true;
        this.controls3D.dampingFactor = 0.06;
        this.controls3D.minDistance = 10;
        this.controls3D.maxDistance = 120;
      }

      this.clock3D = new THREE.Clock();

      // Create Sub-groups
      this.buildNucleus3D();
      this.buildAxes3D();
      this.nodesGroup3D = new THREE.Group();
      this.scene3D.add(this.nodesGroup3D);

      window.addEventListener('resize', () => this.onResize());
      this.animate3D();
    },

    buildNucleus3D() {
      if (this.nucleusGroup3D) this.scene3D.remove(this.nucleusGroup3D);
      this.nucleusGroup3D = new THREE.Group();

      // Glowing Proton Core
      const coreGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      this.nucleusGroup3D.add(coreMesh);

      // Outer Electric Field Glow Shell
      const auraGeo = new THREE.SphereGeometry(2.2, 24, 24);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0x38BDF8,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      this.nucleusGroup3D.add(auraMesh);

      this.nucleusGroup3D.visible = this.showNucleus;
      this.scene3D.add(this.nucleusGroup3D);
    },

    buildAxes3D() {
      if (this.axesGroup3D) this.scene3D.remove(this.axesGroup3D);
      this.axesGroup3D = new THREE.Group();

      const axisLen = 22;
      const makeAxis = (dir, colorHex) => {
        const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), axisLen, colorHex, 2.5, 1.2);
        arrow.line.material.linewidth = 1.5;
        return arrow;
      };

      // X: Cyan (+X, -X)
      this.axesGroup3D.add(makeAxis(new THREE.Vector3(1, 0, 0), 0x00F0FF));
      this.axesGroup3D.add(makeAxis(new THREE.Vector3(-1, 0, 0), 0x008088));
      // Y: Soft Blue (+Y, -Y)
      this.axesGroup3D.add(makeAxis(new THREE.Vector3(0, 1, 0), 0x38BDF8));
      this.axesGroup3D.add(makeAxis(new THREE.Vector3(0, -1, 0), 0x1E40AF));
      // Z: Purple (+Z, -Z)
      this.axesGroup3D.add(makeAxis(new THREE.Vector3(0, 0, 1), 0xA78BFA));
      this.axesGroup3D.add(makeAxis(new THREE.Vector3(0, 0, -1), 0x6D28D9));

      this.axesGroup3D.visible = this.showAxes;
      this.scene3D.add(this.axesGroup3D);
    },

    rebuild3DCloud() {
      if (!this.scene3D) return;
      if (this.particleCloud3D) {
        this.scene3D.remove(this.particleCloud3D);
        this.particleCloud3D.geometry.dispose();
        this.particleCloud3D.material.dispose();
      }

      const count = this.cloudDensity;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const n = this.n;
      const l = this.l;
      const m = this.m;

      // Scaling: Map atomic distance r (units of a0) to world units
      // Mean radius roughly n^2 * a0. Max sample extent ~ 3.5 * n^2
      const worldScale = 24.0 / (3.2 * n * n);
      const rMax = 3.6 * n * n;

      // Find approximate max probability density rhoMax by sampling
      let rhoMax = 1e-12;
      for (let s = 0; s < 120; s++) {
        const testR = (s / 120) * rMax;
        const testTheta = (Math.PI * s) / 120;
        const testPhi = (2 * Math.PI * s) / 120;
        const tx = testR * Math.sin(testTheta) * Math.cos(testPhi);
        const ty = testR * Math.sin(testTheta) * Math.sin(testPhi);
        const tz = testR * Math.cos(testTheta);
        const val = HydrogenMath.probDensity(n, l, m, tx, ty, tz);
        if (val > rhoMax) rhoMax = val;
      }
      if (rhoMax < 1e-12) rhoMax = 1e-4;

      // Rejection sampling for points
      let accepted = 0;
      let attempts = 0;
      const maxAttempts = count * 60;

      while (accepted < count && attempts < maxAttempts) {
        attempts++;
        // Sample in sphere of radius rMax with slight central bias
        const u = Math.random();
        const rCand = Math.pow(u, 0.6) * rMax;
        const thetaCand = Math.acos(2 * Math.random() - 1);
        const phiCand = Math.random() * Math.PI * 2;

        const xCand = rCand * Math.sin(thetaCand) * Math.cos(phiCand);
        const yCand = rCand * Math.sin(thetaCand) * Math.sin(phiCand);
        const zCand = rCand * Math.cos(thetaCand);

        const rho = HydrogenMath.probDensity(n, l, m, xCand, yCand, zCand);
        const pAccept = rho / rhoMax;

        if (Math.random() < pAccept) {
          positions[accepted * 3] = xCand * worldScale;
          positions[accepted * 3 + 1] = yCand * worldScale;
          positions[accepted * 3 + 2] = zCand * worldScale;

          // Normalized density for color
          const normT = Math.min(1.0, Math.pow(rho / rhoMax, 0.45));
          const rgb = HydrogenMath.getColormapRGB(normT, this.colormap);
          colors[accepted * 3] = rgb[0] / 255;
          colors[accepted * 3 + 1] = rgb[1] / 255;
          colors[accepted * 3 + 2] = rgb[2] / 255;

          accepted++;
        }
      }

      // Fill remaining if timeout reached
      while (accepted < count) {
        positions[accepted * 3] = 0;
        positions[accepted * 3 + 1] = 0;
        positions[accepted * 3 + 2] = 0;
        colors[accepted * 3] = 0;
        colors[accepted * 3 + 1] = 0;
        colors[accepted * 3 + 2] = 0;
        accepted++;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.95,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.particleCloud3D = new THREE.Points(geo, mat);
      this.scene3D.add(this.particleCloud3D);

      // Rebuild Nodal Surfaces
      this.rebuildNodalSurfaces();
    },

    rebuildNodalSurfaces() {
      if (!this.nodesGroup3D) return;
      while (this.nodesGroup3D.children.length > 0) {
        const obj = this.nodesGroup3D.children[0];
        this.nodesGroup3D.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      }

      if (!this.showNodes) return;

      const n = this.n;
      const l = this.l;
      const m = this.m;
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0x8B5CF6,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        wireframe: true
      });

      // Angular nodes:
      // p_z (l=1, m=0): xy-plane (z = 0)
      if (l === 1 && m === 0) {
        const planeGeo = new THREE.CircleGeometry(20, 32);
        const mesh = new THREE.Mesh(planeGeo, nodeMat);
        this.nodesGroup3D.add(mesh);
      } else if (l === 1 && m === 1) { // p_x: yz-plane (x = 0)
        const planeGeo = new THREE.CircleGeometry(20, 32);
        const mesh = new THREE.Mesh(planeGeo, nodeMat);
        mesh.rotation.y = Math.PI / 2;
        this.nodesGroup3D.add(mesh);
      } else if (l === 1 && m === -1) { // p_y: xz-plane (y = 0)
        const planeGeo = new THREE.CircleGeometry(20, 32);
        const mesh = new THREE.Mesh(planeGeo, nodeMat);
        mesh.rotation.x = Math.PI / 2;
        this.nodesGroup3D.add(mesh);
      } else if (l === 2 && m === 0) { // 3d_z2: conical surfaces 3cos^2 theta - 1 = 0 -> theta ~ 54.7 deg
        const coneGeo = new THREE.ConeGeometry(18, 14, 32, 1, true);
        const mesh1 = new THREE.Mesh(coneGeo, nodeMat);
        mesh1.position.y = 7;
        const mesh2 = new THREE.Mesh(coneGeo, nodeMat);
        mesh2.position.y = -7;
        mesh2.rotation.x = Math.PI;
        this.nodesGroup3D.add(mesh1);
        this.nodesGroup3D.add(mesh2);
      }
    },

    animate3D() {
      this.animId3D = requestAnimationFrame(() => this.animate3D());
      const elapsed = this.clock3D ? this.clock3D.getElapsedTime() : 0;
      const speed = this.spinSpeed * 0.12;

      if (this.particleCloud3D) {
        this.particleCloud3D.rotation.y = elapsed * speed;
      }
      if (this.nodesGroup3D) {
        this.nodesGroup3D.rotation.y = elapsed * speed;
      }
      if (this.nucleusGroup3D) {
        this.nucleusGroup3D.rotation.y = elapsed * 0.4;
      }

      if (this.controls3D) this.controls3D.update();
      if (this.renderer3D && this.scene3D && this.camera3D) {
        this.renderer3D.render(this.scene3D, this.camera3D);
      }
    },

    init2D() {
      this.canvas2D = document.getElementById('canvas-hydrogen-2d');
      if (!this.canvas2D) return;
      this.ctx2D = this.canvas2D.getContext('2d');
    },

    render2DSlice() {
      if (!this.canvas2D || !this.ctx2D) return;
      const canvas = this.canvas2D;
      const ctx = this.ctx2D;

      const container = canvas.parentElement;
      const w = container.clientWidth || 550;
      const h = container.clientHeight || 480;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      // Render at a balanced resolution (e.g., 200x200) and scale to full canvas for smooth 60fps
      const resW = 200;
      const resH = Math.round((h / w) * resW);

      const offCanvas = document.createElement('canvas');
      offCanvas.width = resW;
      offCanvas.height = resH;
      const offCtx = offCanvas.getContext('2d');
      const imgData = offCtx.createImageData(resW, resH);
      const data = imgData.data;

      const n = this.n;
      const l = this.l;
      const m = this.m;
      const plane = this.slicePlane;
      const cmap = this.colormap;

      const rMax = 3.6 * n * n;
      const cx = resW / 2;
      const cy = resH / 2;
      const scaleCoord = (2.0 * rMax) / resW;

      // Sample peak rho
      let rhoMax = 1e-12;
      for (let s = 0; s < 100; s++) {
        const tr = (s / 100) * rMax;
        const val = HydrogenMath.probDensity(n, l, m, tr, 0, 0);
        if (val > rhoMax) rhoMax = val;
      }
      if (rhoMax < 1e-12) rhoMax = 1e-4;

      let pIdx = 0;
      for (let j = 0; j < resH; j++) {
        const v = (cy - j) * scaleCoord;
        for (let i = 0; i < resW; i++) {
          const u = (i - cx) * scaleCoord;
          let x = 0, y = 0, z = 0;

          if (plane === 'xz') {
            x = u; y = 0; z = v;
          } else if (plane === 'yz') {
            x = 0; y = u; z = v;
          } else { // xy
            x = u; y = v; z = 0;
          }

          const rho = HydrogenMath.probDensity(n, l, m, x, y, z);
          const t = Math.min(1.0, Math.pow(rho / rhoMax, 0.42));
          const rgb = HydrogenMath.getColormapRGB(t, cmap);

          data[pIdx] = rgb[0];
          data[pIdx + 1] = rgb[1];
          data[pIdx + 2] = rgb[2];
          data[pIdx + 3] = 255;
          pIdx += 4;
        }
      }

      offCtx.putImageData(imgData, 0, 0);

      // Smooth render onto display canvas
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(offCanvas, 0, 0, w, h);

      // Draw Center Proton Crosshair
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 1;
      const dispCx = w / 2;
      const dispCy = h / 2;
      ctx.beginPath();
      ctx.moveTo(dispCx - 8, dispCy);
      ctx.lineTo(dispCx + 8, dispCy);
      ctx.moveTo(dispCx, dispCy - 8);
      ctx.lineTo(dispCx, dispCy + 8);
      ctx.stroke();

      // Axis label watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px JetBrains Mono, monospace';
      const planeLabel = plane === 'xz' ? 'Plane: XZ (y = 0)' : (plane === 'yz' ? 'Plane: YZ (x = 0)' : 'Plane: XY (z = 0)');
      ctx.fillText(planeLabel, 16, h - 16);
      ctx.fillText(`Scale: ±${rMax.toFixed(1)} a₀`, w - 130, h - 16);
    },

    initBohr() {
      this.canvasBohr = document.getElementById('canvas-hydrogen-bohr');
      if (!this.canvasBohr) return;
      this.ctxBohr = this.canvasBohr.getContext('2d');
      this.animateBohr();
    },

    animateBohr() {
      this.bohrAnimId = requestAnimationFrame(() => this.animateBohr());
      if (this.viewMode !== 'bohr' || !this.ctxBohr || !this.canvasBohr) return;

      const canvas = this.canvasBohr;
      const ctx = this.ctxBohr;
      const container = canvas.parentElement;
      const w = container.clientWidth || 550;
      const h = container.clientHeight || 480;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      const bohrRadii = { 1: 42, 2: 84, 3: 130, 4: 180 };
      this.bohrTargetRadius = bohrRadii[this.n] || 84;
      this.bohrRadiusInterp += (this.bohrTargetRadius - this.bohrRadiusInterp) * 0.08;

      // Draw Quantized Circular Orbits
      for (let level = 1; level <= 4; level++) {
        const r = bohrRadii[level];
        ctx.strokeStyle = level === this.n ? 'rgba(0, 240, 255, 0.65)' : 'rgba(56, 189, 248, 0.16)';
        ctx.lineWidth = level === this.n ? 2 : 1;
        ctx.setLineDash(level === this.n ? [] : [4, 4]);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = level === this.n ? '#00F0FF' : '#64748B';
        ctx.font = '11px JetBrains Mono, monospace';
        const eVal = (-13.6 / (level * level)).toFixed(2);
        ctx.fillText(`n=${level} (${eVal} eV)`, cx + r + 6, cy - 4);
      }

      // Draw Proton Core
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Orbiting Electron
      this.bohrElectronAngle += 0.03 * (5 / Math.sqrt(this.n));
      const ex = cx + Math.cos(this.bohrElectronAngle) * this.bohrRadiusInterp;
      const ey = cy + Math.sin(this.bohrElectronAngle) * this.bohrRadiusInterp;

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Traveling Transition Photons
      for (let i = this.bohrPhotons.length - 1; i >= 0; i--) {
        const p = this.bohrPhotons[i];
        p.dist += 4.5;
        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * p.dist;

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.stroke();

        if (p.dist > w / 1.5) {
          this.bohrPhotons.splice(i, 1);
        }
      }
    },

    initControls() {
      // 1. View Mode Switcher (3D / 2D / Bohr)
      document.querySelectorAll('[data-h-view]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-h-view]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mode = btn.getAttribute('data-h-view');
          this.setViewMode(mode);
        });
      });

      // 2. 2D Slice Plane Selector (XZ / YZ / XY)
      document.querySelectorAll('[data-h-plane]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-h-plane]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.slicePlane = btn.getAttribute('data-h-plane');
          if (this.viewMode === '2d') this.render2DSlice();
        });
      });

      // 3. Action Buttons (Nucleus, Axes, Nodes, Reset, Fullscreen)
      const btnNucleus = document.getElementById('btn-h-toggle-nucleus');
      if (btnNucleus) {
        btnNucleus.addEventListener('click', () => {
          this.showNucleus = !this.showNucleus;
          btnNucleus.classList.toggle('active', this.showNucleus);
          if (this.nucleusGroup3D) this.nucleusGroup3D.visible = this.showNucleus;
        });
      }

      const btnAxes = document.getElementById('btn-h-toggle-axes');
      if (btnAxes) {
        btnAxes.addEventListener('click', () => {
          this.showAxes = !this.showAxes;
          btnAxes.classList.toggle('active', this.showAxes);
          if (this.axesGroup3D) this.axesGroup3D.visible = this.showAxes;
        });
      }

      const btnNodes = document.getElementById('btn-h-toggle-nodes');
      if (btnNodes) {
        btnNodes.addEventListener('click', () => {
          this.showNodes = !this.showNodes;
          btnNodes.classList.toggle('active', this.showNodes);
          this.rebuildNodalSurfaces();
        });
      }

      const btnResetCam = document.getElementById('btn-h-cam-reset');
      if (btnResetCam) {
        btnResetCam.addEventListener('click', () => {
          if (this.camera3D) this.camera3D.position.set(0, 18, 42);
          if (this.controls3D) this.controls3D.target.set(0, 0, 0);
        });
      }

      const btnFullscreen = document.getElementById('btn-h-fullscreen');
      const canvasContainer = document.getElementById('h-canvas-container');
      if (btnFullscreen && canvasContainer) {
        btnFullscreen.addEventListener('click', () => {
          if (!document.fullscreenElement) {
            canvasContainer.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        });
      }

      // 4. Principal Number n Cluster
      document.querySelectorAll('[data-val-n]').forEach(btn => {
        btn.addEventListener('click', () => {
          const newN = parseInt(btn.getAttribute('data-val-n'), 10);
          this.setN(newN);
        });
      });

      // 5. Sliders: Cloud Density & Spin Speed
      const densitySlider = document.getElementById('slider-cloud-density');
      const densityLabel = document.getElementById('lbl-cloud-density');
      if (densitySlider) {
        densitySlider.addEventListener('input', (e) => {
          this.cloudDensity = parseInt(e.target.value, 10);
          if (densityLabel) densityLabel.textContent = `${this.cloudDensity.toLocaleString()} points`;
          this.rebuild3DCloud();
        });
      }

      const speedSlider = document.getElementById('slider-spin-speed');
      const speedLabel = document.getElementById('lbl-spin-speed');
      if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10) / 10;
          this.spinSpeed = val;
          if (speedLabel) speedLabel.textContent = `${val.toFixed(1)}×`;
        });
      }

      // 6. Colormap Selector
      document.querySelectorAll('[data-h-cmap]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-h-cmap]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.colormap = btn.getAttribute('data-h-cmap');
          // Update track gradient visual
          const gradTrack = document.getElementById('h-colormap-gradient');
          if (gradTrack) {
            if (this.colormap === 'plasma') {
              gradTrack.style.background = 'linear-gradient(90deg, #060B18 0%, #4c1d95 18%, #9333ea 35%, #ea580c 60%, #facc15 85%, #ffffff 100%)';
            } else if (this.colormap === 'cyan') {
              gradTrack.style.background = 'linear-gradient(90deg, #060B18 0%, #1e3a8a 35%, #0284c7 70%, #00f0ff 100%)';
            } else {
              gradTrack.style.background = 'linear-gradient(90deg, #000000 0%, #888888 50%, #ffffff 100%)';
            }
          }
          this.rebuild3DCloud();
          if (this.viewMode === '2d') this.render2DSlice();
        });
      });

      // 7. Interactive Energy Ladder Rungs
      document.querySelectorAll('.h-ladder-rung[data-ladder-n]').forEach(rung => {
        rung.addEventListener('click', () => {
          const targetStr = rung.getAttribute('data-ladder-n');
          if (targetStr === 'inf') return;
          const targetN = parseInt(targetStr, 10);
          this.triggerTransition(this.n, targetN);
        });
      });
    },

    setViewMode(mode) {
      this.viewMode = mode;
      const c3d = document.getElementById('canvas-hydrogen-3d');
      const c2d = document.getElementById('canvas-hydrogen-2d');
      const cBohr = document.getElementById('canvas-hydrogen-bohr');
      const planeSelector = document.getElementById('h-plane-selector');
      const navHint = document.getElementById('h-nav-hint');

      if (c3d) c3d.style.display = mode === '3d' ? 'block' : 'none';
      if (c2d) c2d.style.display = mode === '2d' ? 'block' : 'none';
      if (cBohr) cBohr.style.display = mode === 'bohr' ? 'block' : 'none';

      if (planeSelector) planeSelector.style.display = mode === '2d' ? 'flex' : 'none';
      if (navHint) navHint.style.display = mode === '3d' ? 'flex' : 'none';

      if (mode === '3d') {
        this.onResize();
        this.rebuild3DCloud();
      } else if (mode === '2d') {
        this.render2DSlice();
      }
    },

    setN(newN) {
      if (newN === this.n) return;
      const oldN = this.n;
      this.n = newN;

      // Adjust l if current l is >= newN
      if (this.l >= newN) {
        this.l = newN - 1;
      }
      // Adjust m if current |m| > l
      if (Math.abs(this.m) > this.l) {
        this.m = 0;
      }

      this.updateAll();
      this.triggerTransition(oldN, newN);
    },

    setL(newL) {
      this.l = newL;
      if (Math.abs(this.m) > newL) {
        this.m = 0;
      }
      this.updateAll();
    },

    setM(newM) {
      this.m = newM;
      this.updateAll();
    },

    setState(n, l, m) {
      this.n = n;
      this.l = l;
      this.m = m;
      this.updateAll();
    },

    updateAll() {
      // 1. Update Quantum Number Buttons & Clusters
      this.updateQuantumClusters();

      // 2. Update HUD Chip & Text
      const hudState = document.getElementById('h-hud-state');
      const hudName = document.getElementById('h-hud-name');
      const activeStateTxt = document.getElementById('h-active-state-txt');
      const activeSubshellTag = document.getElementById('h-active-subshell-tag');
      const orbName = HydrogenMath.getOrbitalName(this.n, this.l, this.m);

      if (hudState) hudState.textContent = `(n, l, m) = (${this.n}, ${this.l}, ${this.m})`;
      if (hudName) hudName.textContent = `${orbName} Orbital`;
      if (activeStateTxt) activeStateTxt.textContent = `(n, l, m) = (${this.n}, ${this.l}, ${this.m})`;
      if (activeSubshellTag) activeSubshellTag.textContent = `${orbName} Orbital`;

      // 3. Update Wavefunction Inspector
      const mathEl = document.getElementById('h-math-formula');
      if (mathEl) {
        mathEl.innerHTML = HydrogenMath.getFormulaLaTeX(this.n, this.l, this.m);
        if (window.renderMathInElement) {
          window.renderMathInElement(mathEl, {
            delimiters: [{ left: "$$", right: "$$", display: true }]
          });
        }
      }

      // 4. Update Quantitative Metrics
      const eVal = (-13.6 / (this.n * this.n)).toFixed(2);
      const rNodes = this.n - this.l - 1;
      const aNodes = this.l;
      const tNodes = this.n - 1;
      const degen = this.n * this.n;
      const meanR = (this.n * this.n).toFixed(1);

      const metricEnergy = document.getElementById('h-metric-energy');
      const metricDegen = document.getElementById('h-metric-degen');
      const metricRNodes = document.getElementById('h-metric-rnodes');
      const metricANodes = document.getElementById('h-metric-anodes');
      const metricTNodes = document.getElementById('h-metric-tnodes');
      const metricRadius = document.getElementById('h-metric-radius');

      if (metricEnergy) metricEnergy.textContent = `${eVal} eV`;
      if (metricDegen) metricDegen.textContent = `${degen} states`;
      if (metricRNodes) metricRNodes.textContent = `${rNodes}`;
      if (metricANodes) metricANodes.textContent = `${aNodes}`;
      if (metricTNodes) metricTNodes.textContent = `${tNodes}`;
      if (metricRadius) metricRadius.textContent = `~${meanR} a₀`;

      // 5. Update Transition Banner Text
      const banner = document.getElementById('h-transition-banner');
      if (banner) {
        banner.innerHTML = `<strong>Active State:</strong> Occupying \\(${orbName}\\) subshell (\\(n=${this.n}, l=${this.l}, m=${this.m}\\)). Electronic wave packet exhibits \\(${rNodes}\\) radial nodal surfaces and \\(${aNodes}\\) angular nodal planes/cones where detection probability vanishes identically.`;
        if (window.renderMathInElement) {
          window.renderMathInElement(banner, {
            delimiters: [{ left: "\\(", right: "\\)", display: false }]
          });
        }
      }

      // 6. Update Active Energy Ladder Rung
      document.querySelectorAll('.h-ladder-rung[data-ladder-n]').forEach(rung => {
        const rungN = parseInt(rung.getAttribute('data-ladder-n'), 10);
        rung.classList.toggle('active', rungN === this.n);
      });

      // 7. Update Gallery Card Selection
      document.querySelectorAll('.h-orbital-card').forEach(card => {
        const cn = parseInt(card.getAttribute('data-card-n'), 10);
        const cl = parseInt(card.getAttribute('data-card-l'), 10);
        const cm = parseInt(card.getAttribute('data-card-m'), 10);
        card.classList.toggle('active', cn === this.n && cl === this.l && cm === this.m);
      });

      // 8. Re-render Visualizers
      if (this.viewMode === '3d') {
        this.rebuild3DCloud();
      } else if (this.viewMode === '2d') {
        this.render2DSlice();
      }
    },

    updateQuantumClusters() {
      // Principal n buttons
      document.querySelectorAll('[data-val-n]').forEach(btn => {
        const val = parseInt(btn.getAttribute('data-val-n'), 10);
        btn.classList.toggle('active', val === this.n);
      });
      const dispN = document.getElementById('disp-val-n');
      if (dispN) dispN.textContent = `n = ${this.n}`;

      // Azimuthal l cluster (0 ... n-1)
      const clusterL = document.getElementById('cluster-l');
      const dispL = document.getElementById('disp-val-l');
      const letters = ['s', 'p', 'd', 'f'];

      if (clusterL) {
        clusterL.innerHTML = '';
        for (let lVal = 0; lVal < this.n; lVal++) {
          const btn = document.createElement('button');
          btn.className = `h-pill-btn ${lVal === this.l ? 'active' : ''}`;
          btn.textContent = `l = ${lVal} (${letters[lVal]})`;
          btn.addEventListener('click', () => this.setL(lVal));
          clusterL.appendChild(btn);
        }
      }
      if (dispL) dispL.textContent = `l = ${this.l} (${letters[this.l]})`;

      // Magnetic m cluster (-l ... +l)
      const clusterM = document.getElementById('cluster-m');
      const dispM = document.getElementById('disp-val-m');

      if (clusterM) {
        clusterM.innerHTML = '';
        for (let mVal = -this.l; mVal <= this.l; mVal++) {
          const btn = document.createElement('button');
          btn.className = `h-pill-btn ${mVal === this.m ? 'active' : ''}`;
          btn.textContent = `m = ${mVal > 0 ? '+' + mVal : mVal}`;
          btn.addEventListener('click', () => this.setM(mVal));
          clusterM.appendChild(btn);
        }
      }
      if (dispM) dispM.textContent = `m = ${this.m}`;
    },

    triggerTransition(nOld, nNew) {
      if (nOld === nNew) return;
      this.n = nNew;

      const eOld = -13.6 / (nOld * nOld);
      const eNew = -13.6 / (nNew * nNew);
      const deltaE = Math.abs(eNew - eOld);
      const deltaEJoules = deltaE * 1.60218e-19;
      const lambdaNm = 1239.84 / deltaE;
      const freqHz = deltaEJoules / 6.62607e-34;

      const isEmission = nNew < nOld;
      const transType = isEmission ? 'Spontaneous Photon Emission' : 'Resonant Photon Absorption';
      const transTypeColor = isEmission ? '#10B981' : '#38BDF8';

      // Series classification
      const finalN = Math.min(nOld, nNew);
      let series = 'Optical Transition';
      if (finalN === 1) series = 'Lyman Series (Ultraviolet)';
      else if (finalN === 2) series = 'Balmer Series (Optical Visible)';
      else if (finalN === 3) series = 'Paschen Series (Infrared)';
      else if (finalN === 4) series = 'Brackett Series (Far Infrared)';

      // Swatch color matching wavelength
      let swatchColor = '#FFFFFF';
      let swatchDesc = '';
      if (lambdaNm < 400) {
        swatchColor = '#8B5CF6';
        swatchDesc = `Ultraviolet Emission line (λ = ${lambdaNm.toFixed(1)} nm)`;
      } else if (lambdaNm <= 440) {
        swatchColor = '#6366F1';
        swatchDesc = `Violet-Blue Spectral Line (λ = ${lambdaNm.toFixed(1)} nm)`;
      } else if (lambdaNm <= 500) {
        swatchColor = '#06B6D4';
        swatchDesc = `Cyan-Blue H-Beta Line (λ = ${lambdaNm.toFixed(1)} nm)`;
      } else if (lambdaNm <= 590) {
        swatchColor = '#22C55E';
        swatchDesc = `Green Optical Emission (λ = ${lambdaNm.toFixed(1)} nm)`;
      } else if (lambdaNm <= 700) {
        swatchColor = '#EF4444';
        swatchDesc = `Red Hydrogen Alpha (H-α) Line (λ = ${lambdaNm.toFixed(1)} nm)`;
      } else {
        swatchColor = '#991B1B';
        swatchDesc = `Infrared Radiation (λ = ${lambdaNm.toFixed(1)} nm)`;
      }

      // Update UI readout
      const labelEl = document.getElementById('h-trans-label');
      const typeEl = document.getElementById('h-trans-type');
      const deltaEl = document.getElementById('h-trans-delta-e');
      const lambdaEl = document.getElementById('h-trans-lambda');
      const seriesEl = document.getElementById('h-trans-series');
      const freqEl = document.getElementById('h-trans-freq');
      const swatchIndicator = document.getElementById('h-swatch-indicator');
      const swatchDescEl = document.getElementById('h-swatch-desc');

      if (labelEl) labelEl.textContent = `n = ${nOld} → n = ${nNew} (${series.split(' ')[0]})`;
      if (typeEl) {
        typeEl.textContent = transType;
        typeEl.style.color = transTypeColor;
      }
      if (deltaEl) deltaEl.textContent = `${deltaE.toFixed(3)} eV (${deltaEJoules.toExponential(3)} J)`;
      if (lambdaEl) lambdaEl.textContent = `${lambdaNm.toFixed(1)} nm`;
      if (seriesEl) seriesEl.textContent = series;
      if (freqEl) freqEl.textContent = `${freqHz.toExponential(2)} Hz`;
      if (swatchIndicator) {
        swatchIndicator.style.backgroundColor = swatchColor;
        swatchIndicator.style.boxShadow = `0 0 15px ${swatchColor}`;
      }
      if (swatchDescEl) swatchDescEl.textContent = swatchDesc;

      // Spawn photon on Bohr canvas
      if (this.canvasBohr) {
        this.bohrPhotons.push({
          angle: this.bohrElectronAngle,
          dist: 40 * nOld,
          color: swatchColor
        });
      }

      this.updateAll();
    },

    buildGallery() {
      const grid = document.getElementById('h-gallery-grid');
      if (!grid) return;
      grid.innerHTML = '';

      this.galleryOrbitals.forEach(orb => {
        const card = document.createElement('div');
        card.className = `h-orbital-card ${orb.n === this.n && orb.l === this.l && orb.m === this.m ? 'active' : ''}`;
        card.setAttribute('data-card-n', orb.n);
        card.setAttribute('data-card-l', orb.l);
        card.setAttribute('data-card-m', orb.m);

        const canvas = document.createElement('canvas');
        canvas.className = 'gallery-thumb-canvas';
        canvas.width = 110;
        canvas.height = 110;

        const title = document.createElement('h4');
        title.className = 'h-orb-card-title';
        title.textContent = orb.title;

        const tuple = document.createElement('div');
        tuple.className = 'h-orb-card-tuple';
        tuple.textContent = `(${orb.n}, ${orb.l}, ${orb.m})`;

        const rNodes = orb.n - orb.l - 1;
        const aNodes = orb.l;
        const nodes = document.createElement('div');
        nodes.className = 'h-orb-card-nodes';
        nodes.textContent = `Radial: ${rNodes} • Angular: ${aNodes}`;

        const energy = document.createElement('div');
        energy.className = 'h-orb-card-energy';
        energy.textContent = `${(-13.6 / (orb.n * orb.n)).toFixed(2)} eV`;

        card.appendChild(canvas);
        card.appendChild(title);
        card.appendChild(tuple);
        card.appendChild(nodes);
        card.appendChild(energy);

        card.addEventListener('click', () => {
          this.setState(orb.n, orb.l, orb.m);
          // Scroll smoothly to visualizer if on mobile/small screen
          const stage = document.getElementById('hydrogen-explorer');
          if (stage && window.innerWidth < 860) {
            stage.scrollIntoView({ behavior: 'smooth' });
          }
        });

        grid.appendChild(card);

        // Pre-render 2D thumbnail
        this.renderThumbnail(canvas, orb.n, orb.l, orb.m);
      });
    },

    renderThumbnail(canvas, n, l, m) {
      const ctx = canvas.getContext('2d');
      const w = 110;
      const h = 110;
      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;

      const rMax = 3.6 * n * n;
      const cx = w / 2;
      const cy = h / 2;
      const scaleCoord = (2.0 * rMax) / w;

      // Approximate rhoMax
      let rhoMax = 1e-12;
      for (let s = 0; s < 40; s++) {
        const tr = (s / 40) * rMax;
        const val = HydrogenMath.probDensity(n, l, m, tr, 0, 0);
        if (val > rhoMax) rhoMax = val;
      }
      if (rhoMax < 1e-12) rhoMax = 1e-4;

      let pIdx = 0;
      for (let j = 0; j < h; j++) {
        const z = (cy - j) * scaleCoord;
        for (let i = 0; i < w; i++) {
          const x = (i - cx) * scaleCoord;
          const rho = HydrogenMath.probDensity(n, l, m, x, 0, z);
          const t = Math.min(1.0, Math.pow(rho / rhoMax, 0.42));
          const rgb = HydrogenMath.getColormapRGB(t, 'plasma');

          data[pIdx] = rgb[0];
          data[pIdx + 1] = rgb[1];
          data[pIdx + 2] = rgb[2];
          data[pIdx + 3] = 255;
          pIdx += 4;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    },

    onResize() {
      if (!this.canvas3D || !this.renderer3D || !this.camera3D) return;
      const container = this.canvas3D.parentElement;
      const w = container.clientWidth || 550;
      const h = container.clientHeight || 480;

      this.camera3D.aspect = w / h;
      this.camera3D.updateProjectionMatrix();
      this.renderer3D.setSize(w, h);
    }
  };

  // =========================================================================
  // 5. DOUBLE-SLIT WAVE-PARTICLE EXPERIMENT SIMULATOR
  // =========================================================================
  const DoubleSlit = {
    canvas: null,
    ctx: null,
    mode: 'wave', // 'wave', 'particles', 'observer'
    wavelength: 35,
    slitDist: 45,
    hits: [],
    animId: null,

    init() {
      this.canvas = document.getElementById('double-slit-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();

      document.querySelectorAll('[data-ds-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-ds-mode]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.mode = btn.getAttribute('data-ds-mode');
          this.updateInsightText();
        });
      });

      const lambdaSlider = document.getElementById('slider-ds-lambda');
      const lambdaLbl = document.getElementById('lbl-ds-lambda');
      if (lambdaSlider) {
        lambdaSlider.addEventListener('input', (e) => {
          this.wavelength = parseFloat(e.target.value);
          if (lambdaLbl) lambdaLbl.textContent = `${this.wavelength} nm`;
        });
      }

      const distSlider = document.getElementById('slider-ds-dist');
      const distLbl = document.getElementById('lbl-ds-dist');
      if (distSlider) {
        distSlider.addEventListener('input', (e) => {
          this.slitDist = parseFloat(e.target.value);
          if (distLbl) distLbl.textContent = `${this.slitDist} µm`;
        });
      }

      const resetBtn = document.getElementById('btn-reset-slit');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.hits = [];
          const hitCount = document.getElementById('ds-hits-count');
          if (hitCount) hitCount.textContent = 'Accumulated: 0 hits';
        });
      }

      window.addEventListener('resize', () => this.resize());
      this.animate();
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = this.canvas.parentElement.clientWidth || 600;
      this.canvas.height = 260;
    },

    updateInsightText() {
      const el = document.getElementById('ds-insight-text');
      if (!el) return;
      if (this.mode === 'wave') {
        el.innerHTML = '<strong>Continuous Wave Interference:</strong> Coherent wave trains pass through both slits, superimposing their phases. Constructive crest-on-crest alignment produces bright intensity fringes; destructive crest-on-trough cancellation yields complete darkness.';
      } else if (this.mode === 'particles') {
        el.innerHTML = '<strong>Discrete Particle Detection:</strong> Individual subatomic particles register one-by-one as localized dots on the detector. Strikingly, their collective statistics reproduce the exact wave interference fringes—each particle interferes with itself!';
      } else {
        el.innerHTML = '<strong>Wavefunction Collapse by Observer:</strong> Placing which-way detectors at the slits to determine the particle trajectory entangles the system with the apparatus, destroying phase coherence. The interference fringes vanish into two classical clusters.';
      }
    },

    animate() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.fillStyle = '#060B18';
      ctx.fillRect(0, 0, w, h);

      const barrierX = 85;
      const screenX = w - 45;

      // Double Slit Barrier
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(barrierX, 0);
      ctx.lineTo(barrierX, h * 0.36);
      ctx.moveTo(barrierX, h * 0.44);
      ctx.lineTo(barrierX, h * 0.56);
      ctx.moveTo(barrierX, h * 0.64);
      ctx.lineTo(barrierX, h);
      ctx.stroke();

      // Slits Label
      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('Slit A', barrierX - 44, h * 0.4);
      ctx.fillText('Slit B', barrierX - 44, h * 0.63);

      // Detection Screen
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screenX, 10);
      ctx.lineTo(screenX, h - 10);
      ctx.stroke();

      if (this.mode === 'wave') {
        // Draw wavefronts and screen intensity
        const d = this.slitDist * 0.9;
        const lambda = this.wavelength * 0.8;

        for (let x = barrierX + 10; x < screenX; x += 18) {
          const prog = (x - barrierX) / (screenX - barrierX);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 + prog * 0.28})`;
          ctx.beginPath();
          for (let y = 0; y < h; y += 4) {
            const yOffset = y - h / 2;
            const intensity = Math.pow(Math.cos((Math.PI * d * yOffset) / (lambda * (x - barrierX + 45))), 2);
            if (y === 0) ctx.moveTo(x + intensity * 6, y);
            else ctx.lineTo(x + intensity * 6, y);
          }
          ctx.stroke();
        }

        // Intensity curve on screen
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let y = 10; y < h - 10; y++) {
          const yNorm = (y - h / 2) / 20;
          const beta = (yNorm * d) / lambda;
          const alpha = yNorm * 0.28;
          const sinc = alpha === 0 ? 1 : Math.sin(alpha) / alpha;
          const intensity = Math.pow(Math.cos(beta), 2) * Math.pow(sinc, 2);
          const px = screenX - intensity * 40;
          if (y === 10) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();

      } else if (this.mode === 'particles') {
        // Add random particle hit based on probability
        if (this.hits.length < 450) {
          for (let k = 0; k < 3; k++) {
            const ry = Math.random() * (h - 24) + 12;
            const yNorm = (ry - h / 2) / 20;
            const beta = (yNorm * this.slitDist * 0.9) / (this.wavelength * 0.8);
            const prob = Math.pow(Math.cos(beta), 2);
            if (Math.random() < prob) {
              this.hits.push({ y: ry });
            }
          }
          const counter = document.getElementById('ds-hits-count');
          if (counter) counter.textContent = `Accumulated: ${this.hits.length} hits`;
        }

        this.hits.forEach(pt => {
          ctx.fillStyle = '#00F0FF';
          ctx.beginPath();
          ctx.arc(screenX - 2, pt.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (this.mode === 'observer') {
        // Twin classical Gaussian bands
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let y = 10; y < h - 10; y++) {
          const y1 = y - h * 0.4;
          const y2 = y - h * 0.6;
          const p1 = Math.exp(-Math.pow(y1 / 18, 2));
          const p2 = Math.exp(-Math.pow(y2 / 18, 2));
          const px = screenX - (p1 + p2) * 35;
          if (y === 10) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.font = '11px JetBrains Mono';
        ctx.fillText('⚡ Observer Detector ACTIVE at Slits', barrierX + 20, 24);
      }

      this.animId = requestAnimationFrame(() => this.animate());
    }
  };

  // =========================================================================
  // 6. SCHRÖDINGER 1D POTENTIAL BOX SIMULATOR
  // =========================================================================
  const SchrodingerWell = {
    canvas: null,
    ctx: null,
    n: 1,
    showDensity: true,
    time: 0,
    animId: null,

    init() {
      this.canvas = document.getElementById('schrodinger-well-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();

      document.querySelectorAll('[data-well-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-well-mode]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.n = parseInt(btn.getAttribute('data-well-mode'), 10);
          this.updateMetrics();
        });
      });

      const toggleBtn = document.getElementById('btn-toggle-well-type');
      const toggleTxt = document.getElementById('txt-well-type');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.showDensity = !this.showDensity;
          if (toggleTxt) {
            toggleTxt.textContent = this.showDensity ? 'Mode: Probability Density |ψ|²' : 'Mode: Wavefunction ψ(x)';
          }
        });
      }

      window.addEventListener('resize', () => this.resize());
      this.animate();
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = this.canvas.parentElement.clientWidth || 600;
      this.canvas.height = 280;
    },

    updateMetrics() {
      const baseE = 3.76;
      const energy = (this.n * this.n * baseE).toFixed(2);
      const disp = document.getElementById('disp-well-ev');
      if (disp) {
        disp.textContent = `E_${this.n} = ${energy} eV (${this.n === 1 ? 'Ground State' : `${this.n - 1}th Excited State`})`;
      }
    },

    animate() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.time += 0.04;

      ctx.fillStyle = '#060B18';
      ctx.fillRect(0, 0, w, h);

      const leftWall = 80;
      const rightWall = w - 80;
      const boxW = rightWall - leftWall;
      const baselineY = h * 0.72;

      // Draw potential barrier walls
      ctx.fillStyle = '#0A1128';
      ctx.fillRect(0, 0, leftWall, h);
      ctx.fillRect(rightWall, 0, w - rightWall, h);

      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftWall, 0);
      ctx.lineTo(leftWall, h);
      ctx.moveTo(rightWall, 0);
      ctx.lineTo(rightWall, h);
      ctx.stroke();

      // Zero energy baseline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftWall, baselineY);
      ctx.lineTo(rightWall, baselineY);
      ctx.stroke();

      ctx.beginPath();
      if (this.showDensity) {
        // Probability density standing wave |ψ|²
        ctx.strokeStyle = '#00F0FF';
        ctx.fillStyle = 'rgba(0, 240, 255, 0.16)';
        ctx.lineWidth = 2.5;
        ctx.moveTo(leftWall, baselineY);

        for (let x = leftWall; x <= rightWall; x++) {
          const normX = (x - leftWall) / boxW;
          const psi = Math.sin(this.n * Math.PI * normX);
          const density = Math.pow(psi, 2);
          const y = baselineY - density * 125;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(rightWall, baselineY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else {
        // Time-dependent wavefunction oscillation ψ(x, t)
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 2.5;
        const phase = Math.cos(this.time * (this.n * 0.75));

        for (let x = leftWall; x <= rightWall; x++) {
          const normX = (x - leftWall) / boxW;
          const psi = Math.sin(this.n * Math.PI * normX) * phase;
          const y = baselineY - psi * 75;
          if (x === leftWall) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Axis labels
      ctx.fillStyle = '#64748B';
      ctx.font = '11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('x = 0', leftWall, h - 12);
      ctx.fillText('x = L', rightWall, h - 12);
      ctx.fillStyle = '#38BDF8';
      ctx.fillText(`State: n = ${this.n} (${this.showDensity ? '|ψ_n(x)|² Probability Density' : 'ψ_n(x,t) Phase Wavefunction'})`, w / 2, 28);

      this.animId = requestAnimationFrame(() => this.animate());
    }
  };

  // =========================================================================
  // 7. SCIENTIFIC CALCULATORS (Planck Photon & De Broglie Solver)
  // =========================================================================
  const ScientificSolvers = {
    init() {
      // Planck Calculator
      const freqInput = document.getElementById('calc-freq-val');
      const bandSelect = document.getElementById('calc-freq-band');
      if (freqInput) freqInput.addEventListener('input', () => this.calcPlanck());
      if (bandSelect) bandSelect.addEventListener('change', () => this.calcPlanck());
      this.calcPlanck();

      // De Broglie Calculator
      const massSelect = document.getElementById('db-mass-select');
      const velInput = document.getElementById('db-vel-input');
      if (massSelect) massSelect.addEventListener('change', () => this.calcDeBroglie());
      if (velInput) velInput.addEventListener('input', () => this.calcDeBroglie());
      this.calcDeBroglie();
    },

    calcPlanck() {
      const val = parseFloat(document.getElementById('calc-freq-val')?.value || 5.5);
      const band = parseFloat(document.getElementById('calc-freq-band')?.value || 1e14);
      const freq = val * band;

      const h = 6.62607015e-34;
      const e = 1.602176634e-19;

      const energyJ = h * freq;
      const energyEv = energyJ / e;

      const evEl = document.getElementById('calc-result-ev');
      const jEl = document.getElementById('calc-result-j');
      const specEl = document.getElementById('calc-result-spectrum');

      if (evEl) evEl.textContent = `${energyEv.toFixed(3)} eV`;
      if (jEl) jEl.textContent = `${energyJ.toExponential(3)} Joules`;

      if (specEl) {
        if (freq >= 3e16) specEl.textContent = 'Hard X-Ray Radiation';
        else if (freq >= 7.5e14) specEl.textContent = 'Ultraviolet Radiation';
        else if (freq >= 4.3e14) specEl.textContent = 'Optical Visible Light';
        else if (freq >= 3e11) specEl.textContent = 'Infrared Spectrum';
        else specEl.textContent = 'Microwave / Radio Waves';
      }
    },

    calcDeBroglie() {
      const mass = parseFloat(document.getElementById('db-mass-select')?.value || 9.109e-31);
      const vel = parseFloat(document.getElementById('db-vel-input')?.value || 1000000);

      const h = 6.62607015e-34;
      const p = mass * vel;
      const lambdaMeters = h / p;

      const outEl = document.getElementById('db-calc-output');
      if (outEl) {
        if (lambdaMeters < 1e-12) {
          outEl.textContent = `${(lambdaMeters * 1e12).toFixed(3)} pm (Picometers)`;
        } else if (lambdaMeters < 1e-9) {
          outEl.textContent = `${(lambdaMeters * 1e9).toFixed(3)} nm (Nanometers)`;
        } else {
          outEl.textContent = `${(lambdaMeters * 1e6).toFixed(3)} µm`;
        }
      }
    }
  };

  // =========================================================================
  // 8. NAVIGATION, SEARCH & DOSSIER MODALS
  // =========================================================================
  const Navigation = {
    init() {
      const navbar = document.getElementById('site-navbar');
      const toggle = document.getElementById('btn-mobile-toggle');
      const closeBtn = document.getElementById('btn-mobile-close');
      const drawer = document.getElementById('mobile-drawer');
      const backdrop = document.getElementById('mobile-drawer-backdrop');

      // 1. Scrolled State Glassmorphic Elevation
      const handleScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 20) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();

      // 2. Mobile Drawer & Animated Hamburger Toggle
      const openDrawer = () => {
        if (drawer) drawer.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        if (toggle) {
          toggle.classList.add('is-active');
          toggle.setAttribute('aria-expanded', 'true');
        }
      };

      const closeDrawer = () => {
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        if (toggle) {
          toggle.classList.remove('is-active');
          toggle.setAttribute('aria-expanded', 'false');
        }
      };

      if (toggle) {
        toggle.addEventListener('click', () => {
          if (drawer && drawer.classList.contains('open')) {
            closeDrawer();
          } else {
            openDrawer();
          }
        });
      }

      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
      if (backdrop) backdrop.addEventListener('click', closeDrawer);

      document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', closeDrawer);
      });

      // 3. Section Mapping for Active Spy
      const sectionToNav = {
        'home': 'home',
        'basics': 'introduction',
        'introduction': 'introduction',
        'atomic-structure': 'hydrogen-explorer',
        'hydrogen-explorer': 'hydrogen-explorer',
        'quantum-concepts': 'quantum-concepts',
        'quantum-concepts-sec': 'quantum-concepts',
        'duality': 'experiments',
        'experiments': 'experiments',
        'schrodinger': 'experiments'
      };

      const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

      const setActiveNav = (navKey) => {
        navLinks.forEach(link => {
          const key = link.getAttribute('data-nav');
          if (key === navKey) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      };

      // 4. Active Section Spy with IntersectionObserver
      const sections = document.querySelectorAll('section[id]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            const targetNav = sectionToNav[id] || id;
            setActiveNav(targetNav);
          }
        });
      }, { rootMargin: '-20% 0px -65% 0px' });

      sections.forEach(sec => observer.observe(sec));

      // 5. Smooth Scroll with Exact Header Offset for Anchors
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href === '#' || href === '') return;
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            const navbarEl = document.getElementById('site-navbar');
            const headerOffset = navbarEl ? Math.round(navbarEl.offsetHeight + 24) : 88;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            // Update URL hash without jumping
            if (history.pushState) {
              history.pushState(null, '', href);
            }
          }
        });
      });
    }
  };

  const Modals = {
    searchIndex: [
      { title: "Animated 3D Hydrogen Atom", anchor: "#home", desc: "Interactive Three.js 3D atom with glowing nucleus and probability cloud." },
      { title: "Energy Quantization (E = hν)", anchor: "#basics", desc: "Max Planck resolution of blackbody radiation." },
      { title: "Hydrogen Atom Explorer", anchor: "#hydrogen-explorer", desc: "Interactive 3D probability clouds, 2D wavefunction slice heatmaps, and orbital gallery." },
      { title: "Hydrogen Orbitals Gallery (1s to 4d)", anchor: "#hydrogen-explorer", desc: "Analytically calculated orbital probability density plots." },
      { title: "Energy Level Ladder & Transitions", anchor: "#hydrogen-explorer", desc: "Quantized energy state ladder, photon emission and absorption." },
      { title: "Quantum Numbers (n, l, ml, ms)", anchor: "#quantum-concepts", desc: "Principal, azimuthal, magnetic, and electron spin numbers." },
      { title: "Wave-Particle Duality", anchor: "#duality", desc: "Double-slit experiment, matter waves, and de Broglie equation." },
      { title: "The Schrödinger Wave Equation", anchor: "#schrodinger", desc: "Time-dependent formulation and anatomical operator breakdown." },
      { title: "Particle in a 1D Box", anchor: "#schrodinger", desc: "Infinite potential well standing wave solutions and eigen-energies." }
    ],

    init() {
      const searchModal = document.getElementById('search-modal');
      const searchTrigger = document.getElementById('btn-search-trigger');
      const searchInput = document.getElementById('global-search-input');
      const clearSearch = document.getElementById('btn-clear-search');

      if (searchTrigger) searchTrigger.addEventListener('click', () => this.openSearch());

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.openSearch();
        } else if (e.key === 'Escape') {
          this.closeSearch();
          this.closeDossier();
        }
      });

      if (searchModal) {
        searchModal.addEventListener('click', (e) => {
          if (e.target === searchModal) this.closeSearch();
        });
      }

      if (clearSearch && searchInput) {
        clearSearch.addEventListener('click', () => {
          searchInput.value = '';
          this.renderSearchResults('');
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', (e) => this.renderSearchResults(e.target.value));
      }

      // Dossier Modal
      const dossierModal = document.getElementById('dossier-modal');
      const openDossierBtns = [
        document.getElementById('btn-nav-dossier'),
        document.getElementById('btn-mobile-dossier')
      ].filter(Boolean);
      const closeDossierBtns = [
        document.getElementById('btn-close-dossier'),
        document.getElementById('btn-dismiss-modal')
      ].filter(Boolean);

      openDossierBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => this.openDossier());
      });

      closeDossierBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => this.closeDossier());
      });

      if (dossierModal) {
        dossierModal.addEventListener('click', (e) => {
          if (e.target === dossierModal) this.closeDossier();
        });
      }

      const printModalBtn = document.getElementById('btn-print-modal');
      if (printModalBtn) printModalBtn.addEventListener('click', () => window.print());
    },

    openSearch() {
      const modal = document.getElementById('search-modal');
      const input = document.getElementById('global-search-input');
      if (modal) {
        modal.classList.add('open');
        if (input) {
          input.value = '';
          input.focus();
        }
        this.renderSearchResults('');
      }
    },

    closeSearch() {
      const modal = document.getElementById('search-modal');
      if (modal) modal.classList.remove('open');
    },

    renderSearchResults(query) {
      const container = document.getElementById('search-results-container');
      if (!container) return;

      const q = query.toLowerCase().trim();
      const results = q === ''
        ? this.searchIndex.slice(0, 6)
        : this.searchIndex.filter(item =>
            item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
          );

      if (results.length === 0) {
        container.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No matching quantum topics found.</div>';
        return;
      }

      container.innerHTML = results.map(item => `
        <div class="search-res-item" data-search-target="${item.anchor}">
          <div class="res-title">${item.title}</div>
          <div class="res-desc">${item.desc}</div>
          <span class="res-badge">Jump to Section</span>
        </div>
      `).join('');

      container.querySelectorAll('.search-res-item').forEach(el => {
        el.addEventListener('click', () => {
          const target = el.getAttribute('data-search-target');
          this.closeSearch();
          const targetEl = document.querySelector(target);
          if (targetEl) {
            const navbarEl = document.getElementById('site-navbar');
            const headerOffset = navbarEl ? Math.round(navbarEl.offsetHeight + 24) : 88;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        });
      });
    },

    openDossier() {
      const drawer = document.getElementById('mobile-drawer');
      const backdrop = document.getElementById('mobile-drawer-backdrop');
      const toggle = document.getElementById('btn-mobile-toggle');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      if (toggle) {
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
      }
      const modal = document.getElementById('dossier-modal');
      if (modal) modal.classList.add('open');
    },

    closeDossier() {
      const modal = document.getElementById('dossier-modal');
      if (modal) modal.classList.remove('open');
    }
  };

  // =========================================================================
  // 9. RENDER HELPER (KaTeX & Lucide)
  // =========================================================================
  const RenderHelper = {
    init() {
      if (window.lucide) {
        window.lucide.createIcons();
      }
      this.renderMath();
    },

    renderMath() {
      if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      }
    },

    renderMathIn(el) {
      if (window.renderMathInElement && el) {
        window.renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      }
    }
  };

  // =========================================================================
  // 10. APP INITIALIZATION
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    AmbientParticles.init();
    Atom3D.init();
    HydrogenExplorer.init();
    DoubleSlit.init();
    SchrodingerWell.init();
    ScientificSolvers.init();
    Navigation.init();
    Modals.init();

    setTimeout(() => {
      RenderHelper.init();
    }, 100);
  });

})();
