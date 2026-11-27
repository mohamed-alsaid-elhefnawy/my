/**
 * QUANTUM ATOM 3D VISUALIZER
 * High-End Scientific Three.js Visualization of Atomic Orbitals, 
 * Probability Clouds (|ψ|²), and Wavefunctions.
 */

(function () {
  'use strict';

  let scene, camera, renderer, controls;
  let nucleusGroup, orbitalGroup, cloudPoints, standingWaveRings = [];
  let animationFrameId;
  let currentOrbitalMode = '1s';
  let isCloudActive = true;
  let particleCount = 2400;
  let simSpeed = 1.0;
  let clock;

  // Quantum orbital configurations and physical parameters
  const ORBITAL_PRESETS = {
    '1s': {
      n: 1, l: 0, m: 0,
      energy: '-13.60 eV',
      angularMomentum: '0.00 ℏ',
      name: 'Ground State (1s Spherical)',
      description: 'Spherically symmetric probability density with zero angular momentum (l = 0). Maximum probability density at nucleus boundary.'
    },
    '2pz': {
      n: 2, l: 1, m: 0,
      energy: '-3.40 eV',
      angularMomentum: '1.41 ℏ (√2)',
      name: '2pz Orbital (Dumbbell Lobe)',
      description: 'Dumbbell-shaped orbital aligned along the z-axis with a distinct nodal plane at xy (z = 0) where ψ = 0.'
    },
    '3d': {
      n: 3, l: 2, m: 0,
      energy: '-1.51 eV',
      angularMomentum: '2.45 ℏ (√6)',
      name: '3dz² Orbital (Toroidal Torus)',
      description: 'High angular momentum state (l = 2) featuring two pronounced z-lobes enveloped by a toroidal probability ring in the xy-plane.'
    },
    '4f': {
      n: 4, l: 3, m: 0,
      energy: '-0.85 eV',
      angularMomentum: '3.46 ℏ (√12)',
      name: '4f Complex State',
      description: 'Octupolar orbital geometry with 3 nodal surfaces and multi-lobed angular probability distribution.'
    },
    'entangled': {
      n: 2, l: 1, m: 1,
      energy: '-3.40 eV',
      angularMomentum: '1.41 ℏ',
      name: 'Entangled Spin Pair (|Ψ⁻⟩)',
      description: 'Two anti-correlated fermions in a singlet state with coupled wavepacket precession and spin entanglement.'
    }
  };

  function init() {
    const container = document.getElementById('atom-viewport');
    const canvas = document.getElementById('quantum-atom-canvas');

    if (!container || !canvas) return;

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not detected. Initializing high-fidelity 2D Canvas fallback.');
      initCanvas2DFallback(canvas);
      return;
    }

    try {
      clock = new THREE.Clock();

      // Scene setup
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x080D1B, 0.015);

      // Camera setup
      const width = container.clientWidth || 500;
      const height = container.clientHeight || 500;
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 18, 42);

      // WebGL Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // OrbitControls (handle both THREE.OrbitControls and global OrbitControls)
      const OrbitControlsConstructor = THREE.OrbitControls || (typeof OrbitControls !== 'undefined' ? OrbitControls : null);
      if (OrbitControlsConstructor) {
        controls = new OrbitControlsConstructor(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 80;
        controls.minDistance = 10;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
      }

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
      scene.add(ambientLight);

      const centerLight = new THREE.PointLight(0x00F0FF, 3, 50);
      centerLight.position.set(0, 0, 0);
      scene.add(centerLight);

      const violetLight = new THREE.PointLight(0x8B5CF6, 2, 60);
      violetLight.position.set(20, 20, 20);
      scene.add(violetLight);

      // Groups
      nucleusGroup = new THREE.Group();
      orbitalGroup = new THREE.Group();
      scene.add(nucleusGroup);
      scene.add(orbitalGroup);

      // Build initial structure
      buildNucleus();
      buildOrbital('1s');

      // Event Listeners
      window.addEventListener('resize', onWindowResize);
      setupControls();

      // Animation Loop
      animate();

    } catch (err) {
      console.error('WebGL initialization error:', err);
      initCanvas2DFallback(canvas);
    }
  }

  // 1. Build Glowing Atomic Nucleus (Protons & Neutrons Cluster)
  function buildNucleus() {
    while (nucleusGroup.children.length > 0) {
      nucleusGroup.remove(nucleusGroup.children[0]);
    }

    // Core glowing sphere
    const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    nucleusGroup.add(coreMesh);

    // Glowing halo
    const haloGeo = new THREE.SphereGeometry(2.8, 24, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      wireframe: true
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    nucleusGroup.add(haloMesh);

    // Subatomic nucleon particles (Protons: Cyan, Neutrons: Violet)
    const nucleonCount = 14;
    const sphereRadius = 1.3;
    const nucleonGeo = new THREE.SphereGeometry(0.42, 16, 16);

    for (let i = 0; i < nucleonCount; i++) {
      const isProton = i % 2 === 0;
      const nucleonMat = new THREE.MeshStandardMaterial({
        color: isProton ? 0x00E5FF : 0xA855F7,
        emissive: isProton ? 0x007799 : 0x4a148c,
        roughness: 0.3,
        metalness: 0.8
      });
      const nucleon = new THREE.Mesh(nucleonGeo, nucleonMat);

      // Distribute randomly in small sphere
      const phi = Math.acos(-1 + (2 * i) / nucleonCount);
      const theta = Math.sqrt(nucleonCount * Math.PI) * phi;
      const r = sphereRadius * (0.6 + Math.random() * 0.4);

      nucleon.position.set(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi)
      );

      nucleon.userData = {
        basePos: nucleon.position.clone(),
        phase: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random()
      };

      nucleusGroup.add(nucleon);
    }
  }

  // 2. Build Specific Quantum Orbital & Probability Cloud (|ψ|²)
  function buildOrbital(mode) {
    currentOrbitalMode = mode;

    // Clear existing orbitals
    while (orbitalGroup.children.length > 0) {
      orbitalGroup.remove(orbitalGroup.children[0]);
    }
    standingWaveRings = [];

    updateHUDMetrics(mode);

    // A. Generate Particle Probability Density Cloud
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorCyan = new THREE.Color(0x00F0FF);
    const colorBlue = new THREE.Color(0x3B82F6);
    const colorViolet = new THREE.Color(0xA855F7);

    for (let i = 0; i < particleCount; i++) {
      let x = 0, y = 0, z = 0;
      let particleColor = colorCyan;

      if (mode === '1s') {
        // Spherical distribution: r ~ exponential decay
        const u = Math.random();
        const r = -Math.log(1 - u) * 7.5 + 2.5;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;

        x = r * Math.sin(theta) * Math.cos(phi);
        y = r * Math.sin(theta) * Math.sin(phi);
        z = r * Math.cos(theta);

        particleColor = colorCyan.clone().lerp(colorBlue, r / 25);

      } else if (mode === '2pz') {
        // Dumbbell distribution: probability proportional to cos²(theta)
        const sign = Math.random() > 0.5 ? 1 : -1;
        const u = Math.random();
        const r = (Math.pow(u, 0.4) * 16 + 2);
        // Biased theta towards poles (0 or PI)
        const cosTheta = sign * Math.pow(Math.random(), 0.35);
        const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
        const phi = Math.random() * Math.PI * 2;
        const radialScale = 1 + Math.abs(cosTheta) * 0.8;

        x = r * Math.sin(theta) * Math.cos(phi) * 0.7;
        y = r * Math.cos(theta) * radialScale * 1.3;
        z = r * Math.sin(theta) * Math.sin(phi) * 0.7;

        particleColor = sign > 0 ? colorCyan : colorViolet;

      } else if (mode === '3d') {
        // 3dz²: Torus ring around equator + lobes on z-axis
        const isTorus = Math.random() > 0.4;
        if (isTorus) {
          // Equator torus
          const ringR = 12 + (Math.random() - 0.5) * 5;
          const phi = Math.random() * Math.PI * 2;
          const tubeR = (Math.random() - 0.5) * 3;
          x = (ringR + tubeR) * Math.cos(phi);
          z = (ringR + tubeR) * Math.sin(phi);
          y = (Math.random() - 0.5) * 3.5;
          particleColor = colorBlue;
        } else {
          // Z-lobes
          const sign = Math.random() > 0.5 ? 1 : -1;
          const r = Math.random() * 18 + 2;
          const theta = sign > 0 ? Math.random() * 0.4 : Math.PI - Math.random() * 0.4;
          const phi = Math.random() * Math.PI * 2;
          x = r * Math.sin(theta) * Math.cos(phi);
          y = r * Math.cos(theta) * 1.2;
          z = r * Math.sin(theta) * Math.sin(phi);
          particleColor = colorCyan;
        }

      } else if (mode === '4f') {
        // Multi-lobed octupole
        const r = Math.pow(Math.random(), 0.5) * 20 + 3;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        // Cubic harmonic weighting
        const fMod = Math.sin(3 * phi) * Math.sin(theta);
        x = r * Math.sin(theta) * Math.cos(phi) * (1 + 0.5 * fMod);
        y = r * Math.cos(theta) * (1 - 0.5 * fMod);
        z = r * Math.sin(theta) * Math.sin(phi);
        particleColor = fMod > 0 ? colorCyan : colorViolet;

      } else if (mode === 'entangled') {
        // Two entangled electron orbits
        const isA = Math.random() > 0.5;
        const r = 14 + (Math.random() - 0.5) * 3;
        const angle = Math.random() * Math.PI * 2;
        const tilt = isA ? 0.6 : -0.6;

        x = r * Math.cos(angle);
        y = r * Math.sin(angle) * Math.cos(tilt);
        z = r * Math.sin(angle) * Math.sin(tilt);

        particleColor = isA ? colorCyan : colorViolet;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;
    }

    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    cloudGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const cloudMat = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    cloudPoints = new THREE.Points(cloudGeo, cloudMat);
    cloudPoints.visible = isCloudActive;
    orbitalGroup.add(cloudPoints);

    // B. Geometric Guides & Standing Wave Quantum Rings
    createOrbitalGuides(mode);
  }

  // Helper to create geometric orbital tracks
  function createOrbitalGuides(mode) {
    if (mode === '1s' || mode === 'entangled') {
      const ringRadii = mode === '1s' ? [8, 14, 20] : [14];
      ringRadii.forEach((rad, idx) => {
        const curve = new THREE.EllipseCurve(0, 0, rad, rad, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(120);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0x00F0FF : 0x8B5CF6,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Line(geo, mat);

        if (mode === 'entangled') {
          ring.rotation.x = Math.PI / 4;
        } else {
          ring.rotation.x = (idx * Math.PI) / 3;
          ring.rotation.y = (idx * Math.PI) / 4;
        }

        orbitalGroup.add(ring);
        standingWaveRings.push(ring);

        // Add traveling electron marker on ring
        const electronGeo = new THREE.SphereGeometry(0.7, 16, 16);
        const electronMat = new THREE.MeshBasicMaterial({
          color: 0x00F0FF,
          blending: THREE.AdditiveBlending
        });
        const electron = new THREE.Mesh(electronGeo, electronMat);
        ring.add(electron);
        ring.userData = { electron: electron, radius: rad, speed: (1.8 / (idx + 1)) };
      });

    } else if (mode === '2pz') {
      // Create double lobe wireframe envelopes
      [1, -1].forEach(sign => {
        const lobeGeo = new THREE.SphereGeometry(5.5, 24, 24);
        lobeGeo.scale(0.8, 1.8, 0.8);
        const lobeMat = new THREE.MeshBasicMaterial({
          color: sign > 0 ? 0x00F0FF : 0xA855F7,
          wireframe: true,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending
        });
        const lobeMesh = new THREE.Mesh(lobeGeo, lobeMat);
        lobeMesh.position.y = sign * 9;
        orbitalGroup.add(lobeMesh);
      });

      // Nodal plane indicator at z = 0
      const planeGeo = new THREE.RingGeometry(2, 18, 32);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x3B82F6,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = Math.PI / 2;
      orbitalGroup.add(plane);

    } else if (mode === '3d') {
      // Central torus wireframe + dual z-lobes
      const torusGeo = new THREE.TorusGeometry(12, 1.8, 16, 64);
      const torusMat = new THREE.MeshBasicMaterial({
        color: 0x3B82F6,
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      orbitalGroup.add(torus);

      [1, -1].forEach(sign => {
        const lobeGeo = new THREE.SphereGeometry(4, 20, 20);
        lobeGeo.scale(0.7, 1.6, 0.7);
        const lobeMat = new THREE.MeshBasicMaterial({
          color: 0x00F0FF,
          wireframe: true,
          transparent: true,
          opacity: 0.2
        });
        const lobe = new THREE.Mesh(lobeGeo, lobeMat);
        lobe.position.y = sign * 10;
        orbitalGroup.add(lobe);
      });
    }
  }

  // 3. Update HUD Display Values
  function updateHUDMetrics(modeKey) {
    const preset = ORBITAL_PRESETS[modeKey] || ORBITAL_PRESETS['1s'];

    const elN = document.getElementById('stat-n');
    const elL = document.getElementById('stat-l');
    const elEnergy = document.getElementById('stat-energy');
    const elMomentum = document.getElementById('stat-momentum');
    const elDesc = document.getElementById('orbital-description');
    const elTitle = document.getElementById('orbital-title');

    if (elN) elN.textContent = preset.n;
    if (elL) elL.textContent = `${preset.l} (${modeKey.toUpperCase()})`;
    if (elEnergy) elEnergy.textContent = preset.energy;
    if (elMomentum) elMomentum.textContent = preset.angularMomentum;
    if (elTitle) elTitle.textContent = preset.name;
    if (elDesc) elDesc.textContent = preset.description;
  }

  // 4. UI Controls Wiring
  function setupControls() {
    const orbitalButtons = document.querySelectorAll('.orbital-btn');
    orbitalButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        orbitalButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const mode = this.dataset.orbital;
        buildOrbital(mode);
      });
    });

    const toggleCloudBtn = document.getElementById('btn-toggle-cloud');
    if (toggleCloudBtn) {
      toggleCloudBtn.addEventListener('click', function () {
        isCloudActive = !isCloudActive;
        if (cloudPoints) cloudPoints.visible = isCloudActive;
        this.classList.toggle('active', isCloudActive);
      });
    }

    const resetCamBtn = document.getElementById('btn-reset-cam');
    if (resetCamBtn && camera && controls) {
      resetCamBtn.addEventListener('click', function () {
        camera.position.set(0, 18, 42);
        controls.target.set(0, 0, 0);
        controls.update();
      });
    }

    const speedSlider = document.getElementById('slider-atom-speed');
    if (speedSlider) {
      speedSlider.addEventListener('input', function (e) {
        simSpeed = parseFloat(e.target.value);
      });
    }
  }

  // 5. Responsive Resize
  function onWindowResize() {
    const container = document.getElementById('atom-viewport');
    if (!container || !renderer || !camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // 6. Animation Loop
  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta() * simSpeed;
    const elapsedTime = clock.getElapsedTime() * simSpeed;

    if (controls) controls.update();

    // Pulse nucleus
    if (nucleusGroup) {
      const pulse = 1 + Math.sin(elapsedTime * 4) * 0.04;
      nucleusGroup.scale.set(pulse, pulse, pulse);

      // Jiggle nucleons
      nucleusGroup.children.forEach(child => {
        if (child.userData && child.userData.basePos) {
          const u = child.userData;
          const offset = Math.sin(elapsedTime * u.speed * 3 + u.phase) * 0.12;
          child.position.copy(u.basePos).multiplyScalar(1 + offset);
        }
      });
    }

    // Rotate probability cloud slowly
    if (cloudPoints && cloudPoints.visible) {
      cloudPoints.rotation.y += delta * 0.25;
      if (currentOrbitalMode === '2pz' || currentOrbitalMode === '3d') {
        cloudPoints.rotation.z = Math.sin(elapsedTime * 0.5) * 0.08;
      }
    }

    // Advance orbital electrons along tracks
    standingWaveRings.forEach(ring => {
      if (ring.userData && ring.userData.electron) {
        const u = ring.userData;
        const angle = elapsedTime * u.speed;
        u.electron.position.x = Math.cos(angle) * u.radius;
        u.electron.position.y = Math.sin(angle) * u.radius;
      }
    });

    // Slow orbital precession
    if (orbitalGroup) {
      orbitalGroup.rotation.y += delta * 0.15;
    }

    renderer.render(scene, camera);
  }

  // High-fidelity 2D Canvas Fallback (if WebGL/Three.js unavailable)
  function initCanvas2DFallback(canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight || 450;

    window.addEventListener('resize', () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 450;
    });

    let angle = 0;
    function render2D() {
      ctx.fillStyle = '#080D1B';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      angle += 0.02 * simSpeed;

      // Glow nucleus
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 35);
      grad.addColorStop(0, '#00F0FF');
      grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.4)');
      grad.addColorStop(1, 'rgba(8, 13, 27, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fill();

      // Nucleus dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // 3 Quantum Elliptical Orbitals
      const orbits = [
        { rx: 140, ry: 50, rot: 0.3, color: '#00F0FF', speed: 1.2 },
        { rx: 130, ry: 55, rot: -0.6, color: '#3B82F6', speed: 1.6 },
        { rx: 120, ry: 60, rot: 1.2, color: '#8B5CF6', speed: 0.9 }
      ];

      orbits.forEach((orb, i) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(orb.rot);

        // Orbit ring
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Electron particle
        const curAngle = angle * orb.speed + i;
        const ex = Math.cos(curAngle) * orb.rx;
        const ey = Math.sin(curAngle) * orb.ry;

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      requestAnimationFrame(render2D);
    }

    render2D();
  }

  // Auto-init on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export to global scope
  window.Quantum3D = {
    setOrbital: buildOrbital,
    toggleCloud: () => {
      isCloudActive = !isCloudActive;
      if (cloudPoints) cloudPoints.visible = isCloudActive;
    }
  };
})();
