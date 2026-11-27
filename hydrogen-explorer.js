/**
 * Hydrogen Atom Explorer — Full JavaScript Engine
 * Real quantum mechanical wavefunctions, 3D/2D visualization, Bohr model,
 * orbital gallery, energy level diagram, and interactive controls.
 *
 * Requires: Three.js r128 (global THREE), THREE.OrbitControls, KaTeX
 */
(function () {
  'use strict';

  // =========================================================================
  // MATH ENGINE — Real hydrogen wavefunctions
  // =========================================================================
  const MathEngine = {

    factorial(n) {
      if (n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    },

    // Associated Laguerre polynomial L_p^q(x) via recurrence
    associatedLaguerre(p, q, x) {
      if (p === 0) return 1;
      if (p === 1) return 1 + q - x;
      let L0 = 1, L1 = 1 + q - x;
      for (let k = 2; k <= p; k++) {
        const Lk = ((2 * k - 1 + q - x) * L1 - (k - 1 + q) * L0) / k;
        L0 = L1;
        L1 = Lk;
      }
      return L1;
    },

    // Radial wavefunction R_nl(r), a0=1
    radialWavefunction(n, l, r, a0 = 1) {
      if (r < 0) return 0;
      const rho = (2 * r) / (n * a0);
      const fac = this.factorial;
      const numer = fac(n - l - 1);
      const denom = 2 * n * Math.pow(fac(n + l), 3);
      if (denom === 0) return 0;
      const normFactor = Math.sqrt(Math.pow(2 / (n * a0), 3) * numer / denom);
      return normFactor * Math.exp(-rho / 2) * Math.pow(rho, l) *
        this.associatedLaguerre(n - l - 1, 2 * l + 1, rho);
    },

    // Real spherical harmonics Y_lm(theta, phi)
    sphericalHarmonic(l, m, theta, phi) {
      const sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt, PI = Math.PI;
      const st = sin(theta), ct = cos(theta);

      if (l === 0) {
        // Y_00
        return 1 / sqrt(4 * PI);
      }

      if (l === 1) {
        if (m === -1) return sqrt(3 / (4 * PI)) * st * sin(phi);
        if (m === 0)  return sqrt(3 / (4 * PI)) * ct;
        if (m === 1)  return sqrt(3 / (4 * PI)) * st * cos(phi);
      }

      if (l === 2) {
        if (m === -2) return 0.5 * sqrt(15 / PI) * st * st * sin(2 * phi);
        if (m === -1) return sqrt(15 / (4 * PI)) * st * ct * sin(phi);
        if (m === 0)  return 0.25 * sqrt(5 / PI) * (3 * ct * ct - 1);
        if (m === 1)  return sqrt(15 / (4 * PI)) * st * ct * cos(phi);
        if (m === 2)  return 0.25 * sqrt(15 / PI) * st * st * cos(2 * phi);
      }

      if (l === 3) {
        if (m === -3) return 0.25 * sqrt(35 / (2 * PI)) * st * st * st * sin(3 * phi);
        if (m === -2) return 0.5  * sqrt(105 / PI) * st * st * ct * sin(2 * phi);
        if (m === -1) return 0.25 * sqrt(21 / (2 * PI)) * st * (5 * ct * ct - 1) * sin(phi);
        if (m === 0)  return 0.25 * sqrt(7 / PI) * (5 * ct * ct * ct - 3 * ct);
        if (m === 1)  return 0.25 * sqrt(21 / (2 * PI)) * st * (5 * ct * ct - 1) * cos(phi);
        if (m === 2)  return 0.25 * sqrt(105 / PI) * st * st * ct * cos(2 * phi);
        if (m === 3)  return 0.25 * sqrt(35 / (2 * PI)) * st * st * st * cos(3 * phi);
      }

      // l = 4 (g orbitals)
      if (l === 4) {
        const st2 = st * st, ct2 = ct * ct, ct3 = ct2 * ct, ct4 = ct2 * ct2;
        if (m === -4) return (3/16) * sqrt(35 / (2 * PI)) * st2 * st2 * sin(4 * phi);
        if (m === -3) return (3/4)  * sqrt(35 / PI)       * st2 * st * ct * sin(3 * phi);
        if (m === -2) return (3/8)  * sqrt(5  / (2 * PI)) * st2 * (7 * ct2 - 1) * sin(2 * phi);
        if (m === -1) return (3/4)  * sqrt(5  / PI)       * st * (7 * ct3 - 3 * ct) * sin(phi);
        if (m === 0)  return (3/16) * sqrt(1  / PI)       * (35 * ct4 - 30 * ct2 + 3);
        if (m === 1)  return (3/4)  * sqrt(5  / PI)       * st * (7 * ct3 - 3 * ct) * cos(phi);
        if (m === 2)  return (3/8)  * sqrt(5  / (2 * PI)) * st2 * (7 * ct2 - 1) * cos(2 * phi);
        if (m === 3)  return (3/4)  * sqrt(35 / PI)       * st2 * st * ct * cos(3 * phi);
        if (m === 4)  return (3/16) * sqrt(35 / (2 * PI)) * st2 * st2 * cos(4 * phi);
      }

      // l = 5 (h orbitals)
      if (l === 5) {
        const st2 = st * st, ct2 = ct * ct, ct3 = ct2 * ct, ct4 = ct2 * ct2, ct5 = ct4 * ct;
        if (m === -5) return (3/16) * sqrt(77 / PI)       * st2 * st2 * st * sin(5 * phi);
        if (m === -4) return (3/8)  * sqrt(385/(2*PI))    * st2 * st2 * ct * sin(4 * phi);
        if (m === -3) return (1/16) * sqrt(385/PI)        * st2 * st * (9*ct2-1) * sin(3 * phi);
        if (m === -2) return (1/4)  * sqrt(1155/(2*PI))   * st2 * ct * (3*ct2-1) * sin(2 * phi);
        if (m === -1) return (1/16) * sqrt(165/(2*PI))    * st * (21*ct4-14*ct2+1) * sin(phi);
        if (m === 0)  return (1/16) * sqrt(11/PI)         * (63*ct5-70*ct3+15*ct);
        if (m === 1)  return (1/16) * sqrt(165/(2*PI))    * st * (21*ct4-14*ct2+1) * cos(phi);
        if (m === 2)  return (1/4)  * sqrt(1155/(2*PI))   * st2 * ct * (3*ct2-1) * cos(2 * phi);
        if (m === 3)  return (1/16) * sqrt(385/PI)        * st2 * st * (9*ct2-1) * cos(3 * phi);
        if (m === 4)  return (3/8)  * sqrt(385/(2*PI))    * st2 * st2 * ct * cos(4 * phi);
        if (m === 5)  return (3/16) * sqrt(77/PI)         * st2 * st2 * st * cos(5 * phi);
      }

      // l = 6 (i orbitals)
      if (l === 6) {
        const st2 = st * st, ct2 = ct * ct, ct3 = ct2 * ct, ct4 = ct2 * ct2, ct5 = ct4 * ct, ct6 = ct5 * ct;
        if (m === -6) return (1/64) * sqrt(3003/PI)       * st2 * st2 * st2 * sin(6 * phi);
        if (m === -5) return (3/32) * sqrt(1001/PI)       * st2 * st2 * st * ct * sin(5 * phi);
        if (m === -4) return (3/32) * sqrt(91/(2*PI))     * st2 * st2 * (11*ct2-1) * sin(4 * phi);
        if (m === -3) return (1/32) * sqrt(1365/PI)       * st2 * st * ct * (11*ct2-3) * sin(3 * phi);
        if (m === -2) return (1/64) * sqrt(1365/PI)       * st2 * (33*ct4-18*ct2+1) * sin(2 * phi);
        if (m === -1) return (1/16) * sqrt(273/(2*PI))    * st * (33*ct5-30*ct3+5*ct) * sin(phi);
        if (m === 0)  return (1/32) * sqrt(13/PI)         * (231*ct6-315*ct4+105*ct2-5);
        if (m === 1)  return (1/16) * sqrt(273/(2*PI))    * st * (33*ct5-30*ct3+5*ct) * cos(phi);
        if (m === 2)  return (1/64) * sqrt(1365/PI)       * st2 * (33*ct4-18*ct2+1) * cos(2 * phi);
        if (m === 3)  return (1/32) * sqrt(1365/PI)       * st2 * st * ct * (11*ct2-3) * cos(3 * phi);
        if (m === 4)  return (3/32) * sqrt(91/(2*PI))     * st2 * st2 * (11*ct2-1) * cos(4 * phi);
        if (m === 5)  return (3/32) * sqrt(1001/PI)       * st2 * st2 * st * ct * cos(5 * phi);
        if (m === 6)  return (1/64) * sqrt(3003/PI)       * st2 * st2 * st2 * cos(6 * phi);
      }

      return 0;
    },

    // Full wavefunction psi(n,l,m, r,theta,phi)
    hydrogenWavefunction(n, l, m, r, theta, phi) {
      return this.radialWavefunction(n, l, r) * this.sphericalHarmonic(l, m, theta, phi);
    },

    // Probability density |psi|^2
    probabilityDensity(n, l, m, r, theta, phi) {
      const psi = this.hydrogenWavefunction(n, l, m, r, theta, phi);
      return psi * psi;
    },

    // Cartesian → spherical
    cartToSpherical(x, y, z) {
      const r = Math.sqrt(x * x + y * y + z * z);
      if (r < 1e-12) return { r: 0, theta: 0, phi: 0 };
      const theta = Math.acos(Math.max(-1, Math.min(1, z / r)));
      const phi = Math.atan2(y, x);
      return { r, theta, phi };
    },

    // Sample 3D grid, return {positions, colors, maxDensity}
    sampleOrbital3D(n, l, m, resolution = 50) {
      const maxR = (n * n + n * l + 2) * 2.5;
      const step = (2 * maxR) / resolution;
      const rawPoints = [];
      let maxDensity = 0;

      for (let ix = 0; ix < resolution; ix++) {
        const x = -maxR + ix * step;
        for (let iy = 0; iy < resolution; iy++) {
          const y = -maxR + iy * step;
          for (let iz = 0; iz < resolution; iz++) {
            const z = -maxR + iz * step;
            const { r, theta, phi } = this.cartToSpherical(x, y, z);
            const density = this.probabilityDensity(n, l, m, r, theta, phi);
            if (density > 0) {
              rawPoints.push({ x, y, z, density });
              if (density > maxDensity) maxDensity = density;
            }
          }
        }
      }

      if (maxDensity === 0) return { points: [], maxDensity: 0 };

      const threshold = maxDensity * 0.04;
      const filtered = rawPoints.filter(p => p.density >= threshold);
      // Normalize
      filtered.forEach(p => { p.normDensity = p.density / maxDensity; });
      return { points: filtered, maxDensity };
    },

    // Sample 2D cross-section in xz-plane (phi=0 / phi=pi for m<0)
    sampleOrbital2D(n, l, m, resolution = 200) {
      const maxR = (n * n + n * l + 2) * 2.5;
      const step = (2 * maxR) / resolution;
      const grid = new Float32Array(resolution * resolution);
      let maxDensity = 0;

      for (let ix = 0; ix < resolution; ix++) {
        const x = -maxR + ix * step;
        for (let iz = 0; iz < resolution; iz++) {
          const z = -maxR + iz * step;
          const r = Math.sqrt(x * x + z * z);
          const theta = r < 1e-12 ? 0 : Math.acos(Math.max(-1, Math.min(1, z / r)));
          const phi = m < 0 ? Math.PI / 2 : 0;
          const density = this.probabilityDensity(n, l, m, r, theta, phi);
          grid[iz * resolution + ix] = density;
          if (density > maxDensity) maxDensity = density;
        }
      }

      if (maxDensity > 0) {
        for (let i = 0; i < grid.length; i++) grid[i] /= maxDensity;
      }

      return { grid, resolution, maxR };
    }
  };

  // =========================================================================
  // COLOR UTILS
  // =========================================================================
  function densityToRGB(t) {
    t = Math.max(0, Math.min(1, t));
    if (t < 0.33) {
      const u = t / 0.33;
      return [Math.round(123 * u), Math.round(47 * u), Math.round(190 * u)];
    } else if (t < 0.66) {
      const u = (t - 0.33) / 0.33;
      return [Math.round(123 + 126 * u), Math.round(47 + 49 * u), Math.round(190 - 168 * u)];
    } else {
      const u = (t - 0.66) / 0.34;
      return [Math.round(249 + 6 * u), Math.round(96 + 159 * u), Math.round(22 + 233 * u)];
    }
  }

  function densityToThreeColor(t) {
    const [r, g, b] = densityToRGB(t);
    return new THREE.Color(r / 255, g / 255, b / 255);
  }

  // =========================================================================
  // 3D VISUALIZER
  // =========================================================================
  const Visualizer3D = {
    scene: null, camera: null, renderer: null, controls: null,
    particleSystem: null, nucleusMesh: null, axesHelper: null,
    animId: null, active: false,
    currentN: 1, currentL: 0, currentM: 0,
    intensityScale: 1.0,

    init(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      this.canvas = canvas;
      const W = canvas.clientWidth || 500;
      const H = canvas.clientHeight || 400;

      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x060B18);

      // Camera
      this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 10000);
      this.camera.position.set(30, 20, 30);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      this.renderer.setSize(W, H);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Controls
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.minDistance = 2;
      this.controls.maxDistance = 500;

      // Nucleus
      const nucGeo = new THREE.SphereGeometry(0.6, 16, 16);
      const nucMat = new THREE.MeshStandardMaterial({
        color: 0x00F0FF,
        emissive: 0x00F0FF,
        emissiveIntensity: 1.5,
        roughness: 0.2,
        metalness: 0.3
      });
      this.nucleusMesh = new THREE.Mesh(nucGeo, nucMat);
      this.scene.add(this.nucleusMesh);

      // Nucleus glow (point light)
      const nucLight = new THREE.PointLight(0x00F0FF, 2, 60);
      this.scene.add(nucLight);

      // Ambient
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));

      // Axes
      this.axesHelper = new THREE.AxesHelper(15);
      this.axesHelper.visible = true;
      this.scene.add(this.axesHelper);

      // Resize handler
      this._resizeObs = new ResizeObserver(() => this._handleResize());
      this._resizeObs.observe(canvas.parentElement || canvas);

      this.active = true;
      this.animate();
    },

    _handleResize() {
      if (!this.canvas) return;
      const W = this.canvas.clientWidth || 500;
      const H = this.canvas.clientHeight || 400;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H);
    },

    updateOrbital(n, l, m) {
      this.currentN = n; this.currentL = l; this.currentM = m;
      if (!this.active) return;

      // Remove old particle system
      if (this.particleSystem) {
        this.scene.remove(this.particleSystem);
        this.particleSystem.geometry.dispose();
        this.particleSystem.material.dispose();
        this.particleSystem = null;
      }

      const { points } = MathEngine.sampleOrbital3D(n, l, m, 48);
      if (!points.length) return;

      // Build BufferGeometry
      const positions = new Float32Array(points.length * 3);
      const colors = new Float32Array(points.length * 3);
      const sizes = new Float32Array(points.length);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        positions[i * 3]     = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;

        const col = densityToThreeColor(p.normDensity);
        colors[i * 3]     = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        // Smaller = denser (inverted so dense regions don't obscure)
        sizes[i] = 0.3 + (1 - p.normDensity) * 0.5;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const mat = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });

      this.particleSystem = new THREE.Points(geo, mat);
      this.scene.add(this.particleSystem);

      // Adjust camera distance for n
      const dist = (n * n + 5) * 4;
      this.camera.position.set(dist * 0.7, dist * 0.5, dist * 0.7);
      this.controls.update();
    },

    setIntensity(val) {
      this.intensityScale = val;
      if (this.particleSystem) {
        this.particleSystem.material.opacity = Math.min(1, 0.5 + val * 0.5);
      }
    },

    showNucleus(show) {
      if (this.nucleusMesh) this.nucleusMesh.visible = show;
    },

    showAxes(show) {
      if (this.axesHelper) this.axesHelper.visible = show;
    },

    resetCamera() {
      const n = this.currentN;
      const dist = (n * n + 5) * 4;
      this.camera.position.set(dist * 0.7, dist * 0.5, dist * 0.7);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    },

    colorFromDensity(t) {
      return densityToThreeColor(t);
    },

    animate() {
      this.animId = requestAnimationFrame(() => this.animate());
      if (this.controls) this.controls.update();
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    stop() {
      if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
      this.active = false;
    }
  };

  // =========================================================================
  // 2D CANVAS RENDERER
  // =========================================================================
  const Renderer2D = {
    canvas: null, ctx: null, offscreen: null, offCtx: null,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
    },

    render(n, l, m) {
      if (!this.canvas || !this.ctx) return;
      const W = this.canvas.width  = this.canvas.clientWidth  || 500;
      const H = this.canvas.height = this.canvas.clientHeight || 400;
      const ctx = this.ctx;
      ctx.fillStyle = '#060B18';
      ctx.fillRect(0, 0, W, H);

      const plotW = W - 60; // leave 60px for color bar
      const plotH = H;
      const res = 200;
      const { grid } = MathEngine.sampleOrbital2D(n, l, m, res);

      // Draw using ImageData
      const imgData = ctx.createImageData(plotW, plotH);
      for (let py = 0; py < plotH; py++) {
        for (let px = 0; px < plotW; px++) {
          const gx = Math.floor((px / plotW) * res);
          const gy = Math.floor((py / plotH) * res);
          const t = grid[gy * res + gx] || 0;
          const [r, g, b] = densityToRGB(t);
          const idx = (py * plotW + px) * 4;
          imgData.data[idx]     = r;
          imgData.data[idx + 1] = g;
          imgData.data[idx + 2] = b;
          imgData.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Color scale bar
      this.drawColorScale(ctx, plotW, 0, 40, plotH);

      // Axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('x', plotW / 2 + 5, H - 5);
      ctx.fillText('z', 5, 15);
    },

    drawColorScale(ctx, x, y, w, h) {
      const grad = ctx.createLinearGradient(x, y + h, x, y);
      grad.addColorStop(0,   '#000000');
      grad.addColorStop(0.33, '#7B2FBE');
      grad.addColorStop(0.66, '#F97316');
      grad.addColorStop(1,   '#FFFFFF');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 10, y + 10, 20, h - 20);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.strokeRect(x + 10, y + 10, 20, h - 20);

      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.fillText('High', x + 32, y + 15);
      ctx.fillText('Low',  x + 32, y + h - 10);
    }
  };

  // =========================================================================
  // BOHR MODEL RENDERER
  // =========================================================================
  const BohrRenderer = {
    canvas: null, ctx: null, animId: null,
    angle: 0, speed: 0.02, n: 1,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
    },

    render(n) {
      this.n = n;
      if (!this.canvas || !this.ctx) return;
      if (!this.animId) this._loop();
    },

    _loop() {
      this.animId = requestAnimationFrame(() => this._loop());
      this._draw();
      this.angle += this.speed;
    },

    _draw() {
      const canvas = this.canvas;
      const ctx = this.ctx;
      const W = canvas.width  = canvas.clientWidth  || 400;
      const H = canvas.height = canvas.clientHeight || 400;
      const cx = W / 2, cy = H / 2;

      ctx.fillStyle = '#060B18';
      ctx.fillRect(0, 0, W, H);

      const maxOrbit = 4;
      const baseR = Math.min(W, H) * 0.1;

      // Energy levels: n=1,2,3,4
      for (let ni = 1; ni <= maxOrbit; ni++) {
        const orbR = baseR * ni * ni * 0.5;
        // Orbit ring
        ctx.beginPath();
        ctx.arc(cx, cy, orbR, 0, 2 * Math.PI);
        ctx.strokeStyle = ni === this.n ? 'rgba(0,240,255,0.7)' : 'rgba(100,120,200,0.25)';
        ctx.lineWidth = ni === this.n ? 1.5 : 0.8;
        ctx.stroke();

        // Energy label
        const E = (-13.6 / (ni * ni)).toFixed(2);
        ctx.fillStyle = ni === this.n ? '#00F0FF' : 'rgba(180,200,255,0.5)';
        ctx.font = `${ni === this.n ? 11 : 10}px JetBrains Mono, monospace`;
        ctx.fillText(`n=${ni}  E=${E} eV`, cx + orbR + 4, cy - 5);
      }

      // Nucleus
      const nucGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
      nucGrad.addColorStop(0, '#FFFFFF');
      nucGrad.addColorStop(0.4, '#00F0FF');
      nucGrad.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
      ctx.fillStyle = nucGrad;
      ctx.fill();

      // Electron on selected orbit
      const orbR = baseR * this.n * this.n * 0.5;
      const ex = cx + orbR * Math.cos(this.angle);
      const ey = cy + orbR * Math.sin(this.angle);

      const eGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 6);
      eGrad.addColorStop(0, '#fff');
      eGrad.addColorStop(0.4, '#F97316');
      eGrad.addColorStop(1, 'rgba(249,115,22,0)');
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, 2 * Math.PI);
      ctx.fillStyle = eGrad;
      ctx.fill();

      // Trail
      ctx.save();
      for (let t = 1; t <= 12; t++) {
        const ta = this.angle - t * 0.1;
        const tx2 = cx + orbR * Math.cos(ta);
        const ty2 = cy + orbR * Math.sin(ta);
        ctx.beginPath();
        ctx.arc(tx2, ty2, 3 * (1 - t / 13), 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(249,115,22,${0.3 * (1 - t / 13)})`;
        ctx.fill();
      }
      ctx.restore();
    },

    setSpeed(val) {
      this.speed = val * 0.04;
    },

    stop() {
      if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
    }
  };

  // =========================================================================
  // GALLERY
  // =========================================================================
  const Gallery = {
    orbitals: [
      { n: 1, l: 0, m: 0,  label: '1s' },
      { n: 2, l: 0, m: 0,  label: '2s' },
      { n: 2, l: 1, m: -1, label: '2p₋₁' },
      { n: 2, l: 1, m: 0,  label: '2p₀' },
      { n: 2, l: 1, m: 1,  label: '2p₁' },
      { n: 3, l: 0, m: 0,  label: '3s' },
      { n: 3, l: 1, m: 0,  label: '3p₀' },
      { n: 3, l: 1, m: 1,  label: '3p₁' },
      { n: 3, l: 2, m: 0,  label: '3d₀' },
      { n: 3, l: 2, m: 1,  label: '3d₁' },
      { n: 3, l: 2, m: 2,  label: '3d₂' },
      { n: 4, l: 0, m: 0,  label: '4s' },
      { n: 4, l: 1, m: 0,  label: '4p₀' },
      { n: 4, l: 2, m: 0,  label: '4d₀' },
      { n: 4, l: 3, m: 0,  label: '4f₀' }
    ],

    renderAll() {
      const cards = document.querySelectorAll('.hae-gallery-card');
      let idx = 0;

      const renderNext = () => {
        if (idx >= cards.length) return;
        const card = cards[idx++];
        const canvas = card.querySelector('.hae-gallery-canvas');
        if (canvas) {
          const n = parseInt(card.dataset.n);
          const l = parseInt(card.dataset.l);
          const m = parseInt(card.dataset.m);
          this._renderMini(canvas, n, l, m);
        }
        setTimeout(renderNext, 20);
      };

      renderNext();
    },

    _renderMini(canvas, n, l, m) {
      const W = canvas.width  = 120;
      const H = canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#060B18';
      ctx.fillRect(0, 0, W, H);

      const res = 60;
      const { grid } = MathEngine.sampleOrbital2D(n, l, m, res);
      const imgData = ctx.createImageData(W, H);

      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const gx = Math.floor((px / W) * res);
          const gy = Math.floor((py / H) * res);
          const t  = grid[gy * res + gx] || 0;
          const [r, g, b] = densityToRGB(t);
          const i = (py * W + px) * 4;
          imgData.data[i]     = r;
          imgData.data[i + 1] = g;
          imgData.data[i + 2] = b;
          imgData.data[i + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    },

    selectOrbital(n, l, m) {
      document.querySelectorAll('.hae-gallery-card').forEach(card => {
        const match = parseInt(card.dataset.n) === n &&
                      parseInt(card.dataset.l) === l &&
                      parseInt(card.dataset.m) === m;
        card.classList.toggle('hae-gallery-card--active', match);
      });
    }
  };

  // =========================================================================
  // ENERGY DIAGRAM
  // =========================================================================
  const EnergyDiagram = {
    canvas: null, ctx: null,
    selectedLevel: 1, fromLevel: 2, toLevel: 1,
    animating: false, animProgress: 0, animDir: 1,

    energy(n) { return -13.6 / (n * n); },

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.render();
    },

    render() {
      if (!this.canvas || !this.ctx) return;
      const W = this.canvas.width  = this.canvas.clientWidth  || 300;
      const H = this.canvas.height = 400;
      const ctx = this.ctx;

      ctx.fillStyle = '#060B18';
      ctx.fillRect(0, 0, W, H);

      const levels = [1, 2, 3, 4];
      const energies = levels.map(n => this.energy(n));
      const minE = energies[energies.length - 1]; // -13.6
      const maxE = energies[0];                    // -0.85
      const margin = { top: 20, bottom: 30, left: 60, right: 20 };
      const plotH = H - margin.top - margin.bottom;

      const yForE = (E) => {
        return margin.top + plotH - ((E - minE) / (maxE - minE)) * plotH;
      };

      // Draw levels
      levels.forEach(n => {
        const E = this.energy(n);
        const y = yForE(E);
        const isSelected = n === this.selectedLevel;

        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(W - margin.right, y);
        ctx.strokeStyle = isSelected ? '#00F0FF' : 'rgba(100,160,255,0.5)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = isSelected ? '#00F0FF' : 'rgba(200,220,255,0.7)';
        ctx.font = `${isSelected ? 'bold ' : ''}11px JetBrains Mono, monospace`;
        ctx.fillText(`n=${n}`, 4, y + 4);
        ctx.fillText(`${E.toFixed(2)}`, margin.left - 55, y + 4);
        ctx.font = '10px sans-serif';
        ctx.fillText('eV', margin.left - 10, y + 4);
      });

      // Transition arrow
      if (this.animating || this.animProgress > 0) {
        const from = this.fromLevel;
        const to   = this.toLevel;
        const yFrom = yForE(this.energy(from));
        const yTo   = yForE(this.energy(to));
        const cx    = margin.left + (W - margin.left - margin.right) * 0.5;
        const prog  = this.animProgress;
        const yNow  = yFrom + (yTo - yFrom) * prog;

        // Arrow line
        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        ctx.moveTo(cx, yFrom);
        ctx.lineTo(cx, yNow);
        ctx.strokeStyle = from > to ? '#F97316' : '#7B2FBE';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrowhead
        const dir = from > to ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx, yNow);
        ctx.lineTo(cx - 6, yNow - dir * 10);
        ctx.lineTo(cx + 6, yNow - dir * 10);
        ctx.closePath();
        ctx.fillStyle = from > to ? '#F97316' : '#7B2FBE';
        ctx.fill();

        // Photon label
        if (prog > 0.4) {
          const dE = Math.abs(this.energy(from) - this.energy(to)).toFixed(2);
          const lam = (1240 / (Math.abs(this.energy(from) - this.energy(to)) * 1)).toFixed(0);
          ctx.fillStyle = '#fff';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(`ΔE=${dE}eV`, cx + 10, (yFrom + yNow) / 2);
          ctx.fillText(`λ=${lam}nm`, cx + 10, (yFrom + yNow) / 2 + 14);
        }
      }

      // eV axis label
      ctx.save();
      ctx.translate(10, H / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = 'rgba(200,220,255,0.5)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Energy (eV)', 0, 0);
      ctx.restore();
    },

    animateTransition(from, to) {
      this.fromLevel = from;
      this.toLevel   = to;
      this.animating = true;
      this.animProgress = 0;

      const duration = 1200; // ms
      const start = performance.now();

      const step = (now) => {
        this.animProgress = Math.min(1, (now - start) / duration);
        this.render();
        if (this.animProgress < 1) {
          requestAnimationFrame(step);
        } else {
          this.animating = false;
          // Update info display
          this._updateTransitionInfo(from, to);
        }
      };
      requestAnimationFrame(step);
    },

    _updateTransitionInfo(from, to) {
      const dE   = Math.abs(this.energy(from) - this.energy(to));
      const lam  = (1240 / dE).toFixed(1);
      const type = from > to ? 'Emission' : 'Absorption';
      const el   = document.getElementById('hae-transition-info');
      if (el) {
        el.innerHTML = `
          <div class="hae-tinfo-row"><span>Type:</span><span>${type}</span></div>
          <div class="hae-tinfo-row"><span>ΔE:</span><span>${dE.toFixed(3)} eV</span></div>
          <div class="hae-tinfo-row"><span>Wavelength:</span><span>${lam} nm</span></div>
          <div class="hae-tinfo-row"><span>Photon:</span><span>${type === 'Emission' ? '→ emitted' : '← absorbed'}</span></div>
        `;
      }
    },

    selectLevel(n) {
      this.selectedLevel = n;
      this.animProgress = 0;
      this.render();
    }
  };

  // =========================================================================
  // CONTROLS CONTROLLER
  // =========================================================================
  const orbitalDescriptions = {
    s: 'Spherically symmetric orbital with no angular nodes. Probability peaks near the nucleus for 1s, with radial shells for higher n.',
    p: 'Dumbbell-shaped orbital with one angular nodal plane. Three orientations align with the x, y, and z axes.',
    d: 'Multi-lobed orbital with two angular nodes. Five distinct shapes fill 3D space.',
    f: 'Complex orbital with three angular nodes. Seven orientations form intricate 3D patterns.'
  };
  const lLabels = ['s', 'p', 'd', 'f'];

  const Controls = {
    n: 1, l: 0, m: 0,
    mode: '3d',

    init() {
      // n selector
      const selN = document.getElementById('hae-select-n');
      const selL = document.getElementById('hae-select-l');
      const selM = document.getElementById('hae-select-m');

      if (selN) {
        selN.addEventListener('change', () => {
          const n = parseInt(selN.value);
          this.n = n;
          const prevL = Math.min(this.l, n - 1);
          this.l = prevL;
          this.updateLOptions(n, prevL);
          const prevM = Math.max(-this.l, Math.min(this.m, this.l));
          this.m = prevM;
          this.updateMOptions(this.l, prevM);
          this.updateAll();
        });
      }

      if (selL) {
        selL.addEventListener('change', () => {
          const l = parseInt(selL.value);
          this.l = l;
          const prevM = Math.max(-l, Math.min(this.m, l));
          this.m = prevM;
          this.updateMOptions(l, prevM);
          this.updateAll();
        });
      }

      if (selM) {
        selM.addEventListener('change', () => {
          this.m = parseInt(selM.value);
          this.updateAll();
        });
      }

      // Mode buttons
      document.querySelectorAll('[data-hae-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.dataset.haeMode;
          this.setMode(mode);
          document.querySelectorAll('[data-hae-mode]').forEach(b =>
            b.classList.toggle('active', b.dataset.haeMode === mode)
          );
        });
      });

      // Intensity slider
      const sliderI = document.getElementById('hae-intensity-slider');
      if (sliderI) {
        sliderI.addEventListener('input', () => {
          Visualizer3D.setIntensity(parseFloat(sliderI.value));
        });
      }

      // Speed slider (for Bohr)
      const sliderS = document.getElementById('hae-speed-slider');
      if (sliderS) {
        sliderS.addEventListener('input', () => {
          BohrRenderer.setSpeed(parseFloat(sliderS.value));
        });
      }

      // Nucleus checkbox
      const chkNuc = document.getElementById('hae-show-nucleus');
      if (chkNuc) {
        chkNuc.addEventListener('change', () => Visualizer3D.showNucleus(chkNuc.checked));
      }

      // Axes checkbox
      const chkAxes = document.getElementById('hae-show-axes');
      if (chkAxes) {
        chkAxes.addEventListener('change', () => Visualizer3D.showAxes(chkAxes.checked));
      }

      // Nodes & Labels (visual only feedback)
      ['hae-show-nodes', 'hae-show-labels'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => this.updateAll());
      });

      // Reset camera
      const btnReset = document.getElementById('hae-btn-reset-cam');
      if (btnReset) btnReset.addEventListener('click', () => Visualizer3D.resetCamera());

      // Fullscreen
      const btnFS = document.getElementById('hae-btn-fullscreen');
      if (btnFS) {
        btnFS.addEventListener('click', () => {
          const panel = document.getElementById('hae-main-panel');
          if (!document.fullscreenElement) {
            (panel || document.documentElement).requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
        });
      }

      // Gallery cards
      document.querySelectorAll('.hae-gallery-card').forEach(card => {
        card.addEventListener('click', () => {
          const n = parseInt(card.dataset.n);
          const l = parseInt(card.dataset.l);
          const m = parseInt(card.dataset.m);
          this.n = n; this.l = l; this.m = m;

          // Sync selectors
          if (selN) selN.value = n;
          this.updateLOptions(n, l);
          if (selL) selL.value = l;
          this.updateMOptions(l, m);
          if (selM) selM.value = m;

          this.updateAll();
        });
      });

      // Energy diagram level click
      const selFrom = document.getElementById('hae-energy-from');
      const selTo   = document.getElementById('hae-energy-to');
      const btnAnim = document.getElementById('hae-btn-animate-transition');

      if (selFrom) {
        selFrom.addEventListener('change', () => {
          EnergyDiagram.fromLevel = parseInt(selFrom.value);
          EnergyDiagram.render();
        });
      }
      if (selTo) {
        selTo.addEventListener('change', () => {
          EnergyDiagram.toLevel = parseInt(selTo.value);
          EnergyDiagram.render();
        });
      }
      if (btnAnim) {
        btnAnim.addEventListener('click', () => {
          const from = selFrom ? parseInt(selFrom.value) : 2;
          const to   = selTo   ? parseInt(selTo.value)   : 1;
          if (from !== to) EnergyDiagram.animateTransition(from, to);
        });
      }

      // Energy canvas click to select level
      if (EnergyDiagram.canvas) {
        EnergyDiagram.canvas.addEventListener('click', (e) => {
          const rect = EnergyDiagram.canvas.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const H = EnergyDiagram.canvas.height;
          // Approximate level from y position
          const levels = [1, 2, 3, 4];
          const minE = -13.6, maxE = -13.6 / 16;
          const margin = { top: 20, bottom: 30 };
          const plotH = H - margin.top - margin.bottom;
          let closest = 1, minDist = Infinity;
          levels.forEach(n => {
            const E = EnergyDiagram.energy(n);
            const ly = margin.top + plotH - ((E - minE) / (maxE - minE)) * plotH;
            const dist = Math.abs(y - ly);
            if (dist < minDist) { minDist = dist; closest = n; }
          });
          if (minDist < 20) {
            EnergyDiagram.selectLevel(closest);
            const infoEl = document.getElementById('hae-energy-level-info');
            if (infoEl) {
              infoEl.innerHTML = `
                <div class="hae-tinfo-row"><span>Level:</span><span>n = ${closest}</span></div>
                <div class="hae-tinfo-row"><span>Energy:</span><span>${EnergyDiagram.energy(closest).toFixed(3)} eV</span></div>
                <div class="hae-tinfo-row"><span>Degeneracy:</span><span>${closest * closest}</span></div>
              `;
            }
          }
        });
      }

      // Initial options population
      this.updateLOptions(this.n, this.l);
      this.updateMOptions(this.l, this.m);
    },

    updateLOptions(n, currentL) {
      const sel = document.getElementById('hae-select-l');
      if (!sel) return;
      sel.innerHTML = '';
      for (let l = 0; l < n; l++) {
        const opt = document.createElement('option');
        opt.value = l;
        opt.textContent = `${l} (${lLabels[l] || '?'})`;
        if (l === currentL) opt.selected = true;
        sel.appendChild(opt);
      }
    },

    updateMOptions(l, currentM) {
      const sel = document.getElementById('hae-select-m');
      if (!sel) return;
      sel.innerHTML = '';
      for (let m = -l; m <= l; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m >= 0 ? `+${m}` : `${m}`;
        if (m === currentM) opt.selected = true;
        sel.appendChild(opt);
      }
    },

    updateStateDisplay() {
      const el = document.getElementById('hae-state-display');
      if (el) el.textContent = `(n, l, m) = (${this.n}, ${this.l}, ${this.m})`;
    },

    updateOrbitalInfo() {
      const { n, l, m } = this;
      const lName    = lLabels[l] || '?';
      const orbName  = `${n}${lName}`;
      const radNodes = n - l - 1;
      const angNodes = l;
      const energy   = (-13.6 / (n * n)).toFixed(3);
      const desc     = orbitalDescriptions[lName] || '';

      const setEl = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      };

      setEl('hae-orbital-name',      orbName);
      setEl('hae-orbital-qnums',     `n=${n}, l=${l}, m=${m}`);
      setEl('hae-orbital-radnodes',  radNodes.toString());
      setEl('hae-orbital-angnodes',  angNodes.toString());
      setEl('hae-orbital-energy',    `${energy} eV`);
      setEl('hae-orbital-desc',      desc);

      // Also update selected level in energy diagram
      EnergyDiagram.selectLevel(n);
    },

    setMode(mode) {
      this.mode = mode;

      const canvas3d = document.getElementById('hae-3d-canvas');
      const canvas2d = document.getElementById('hae-2d-canvas');
      const canvasBohr = document.getElementById('hae-bohr-canvas');

      // Show/hide appropriate canvas
      if (canvas3d)   canvas3d.style.display   = mode === '3d'   ? 'block' : 'none';
      if (canvas2d)   canvas2d.style.display   = mode === '2d'   ? 'block' : 'none';
      if (canvasBohr) canvasBohr.style.display = mode === 'bohr' ? 'block' : 'none';

      if (mode === '3d' && !Visualizer3D.active) {
        Visualizer3D.init('hae-3d-canvas');
        Visualizer3D.updateOrbital(this.n, this.l, this.m);
      } else if (mode === '2d') {
        Renderer2D.init('hae-2d-canvas');
        Renderer2D.render(this.n, this.l, this.m);
      } else if (mode === 'bohr') {
        BohrRenderer.init('hae-bohr-canvas');
        BohrRenderer.render(this.n);
      }
    },

    updateAll() {
      this.updateStateDisplay();
      this.updateOrbitalInfo();
      if (this.mode === '3d') {
        Visualizer3D.updateOrbital(this.n, this.l, this.m);
      } else if (this.mode === '2d') {
        Renderer2D.render(this.n, this.l, this.m);
      } else if (this.mode === 'bohr') {
        BohrRenderer.render(this.n);
      }
      Gallery.selectOrbital(this.n, this.l, this.m);
    }
  };

  // =========================================================================
  // MAIN INIT
  // =========================================================================
  window.HydrogenExplorer = {
    init() {
      // Decide which canvases exist
      const has3D   = !!document.getElementById('hae-3d-canvas');
      const has2D   = !!document.getElementById('hae-2d-canvas');
      const hasBohr = !!document.getElementById('hae-bohr-canvas');

      if (has3D) Visualizer3D.init('hae-3d-canvas');
      if (has2D) Renderer2D.init('hae-2d-canvas');
      if (hasBohr) BohrRenderer.init('hae-bohr-canvas');

      Gallery.renderAll();

      if (document.getElementById('hae-energy-canvas')) {
        EnergyDiagram.init('hae-energy-canvas');
      }

      Controls.init();
      Controls.updateAll();

      // Hide 2D and Bohr canvases initially (3D is default)
      ['hae-2d-canvas', 'hae-bohr-canvas'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

      // Window resize
      window.addEventListener('resize', () => {
        if (Controls.mode === '2d') Renderer2D.render(Controls.n, Controls.l, Controls.m);
        EnergyDiagram.render();
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('hae-3d-canvas') ||
        document.getElementById('hae-2d-canvas')  ||
        document.getElementById('hae-bohr-canvas')) {
      HydrogenExplorer.init();
    }
  });

})();
