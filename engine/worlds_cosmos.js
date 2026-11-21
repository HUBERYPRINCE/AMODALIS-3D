import * as THREE from 'three';
import {
  createPhantomMaterial,
  createEclipseCrescentMaterial,
  createFlatMaterial,
  createTypographyTexture
} from './shaders.js';
import { makeXRayWire } from './worlds_core.js';

/* ============================================================================
 * 09 · 克尔事件视界 (Kerr Horizon — Relativistic Accretion & Einstein Lensing)
 * ========================================================================== */
export function buildKerrHorizonWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #DF8952
  const inkHex = '#2A1713';
  const creamHex = '#F6ECD7';
  const paleHex = '#F0AC7E';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#BD6C3B', gridScale: 1.7 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const wallMat = createFlatMaterial(wallHex, { side: THREE.DoubleSide });

  const R = 2.05;
  // Invisible Event Horizon Sphere (Pure warm-orange void swallows everything!)
  group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), phantomMat));
  const wireSph = makeXRayWire(new THREE.SphereGeometry(R * 1.005, 24, 16), inkHex);
  group.add(wireSph);

  // Anchors: Horizontal Relativistic Accretion Disk + Vertically-Lensed Einstein Halo Arch!
  const diskGroup = new THREE.Group();
  diskGroup.rotation.set(Math.PI * 0.43, 0.08, -0.18);
  [
    { r0: 2.38, r1: 2.68, mat: inkMat },
    { r0: 2.68, r1: 2.78, mat: wallMat },
    { r0: 2.78, r1: 3.32, mat: creamMat },
    { r0: 3.32, r1: 3.68, mat: inkMat },
    { r0: 3.68, r1: 3.80, mat: wallMat },
    { r0: 3.80, r1: 4.10, mat: creamMat }
  ].forEach((b) => diskGroup.add(new THREE.Mesh(new THREE.RingGeometry(b.r0, b.r1, 120), b.mat)));
  layers.anchors.add(diskGroup);

  // Gravitationally Lensed Einstein Arch bending directly over top & bottom of the invisible horizon!
  const lensedGroup = new THREE.Group();
  const topArch = new THREE.Mesh(new THREE.RingGeometry(R + 0.08, R + 0.36, 96, 1, 0.08, Math.PI - 0.16), inkMat);
  const topArchCream = new THREE.Mesh(new THREE.RingGeometry(R + 0.36, R + 0.56, 96, 1, 0.2, Math.PI - 0.4), creamMat);
  const botArch = new THREE.Mesh(new THREE.RingGeometry(R + 0.08, R + 0.28, 96, 1, Math.PI + 0.18, Math.PI - 0.36), inkMat);
  lensedGroup.add(topArch, topArchCream, botArch);
  layers.shadow.add(lensedGroup);

  // Polar relativistic jet dashed axis ticks
  const jetGroup = new THREE.Group();
  jetGroup.rotation.z = -0.18;
  for (let i = 0; i < 8; i++) {
    const y = 2.65 + i * 0.36;
    const w = 0.032 * (1 - i * 0.08);
    const tTop = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, w), i % 2 === 0 ? inkMat : creamMat); tTop.position.y = y;
    const tBot = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, w), i % 2 === 0 ? inkMat : creamMat); tBot.position.y = -y;
    jetGroup.add(tTop, tBot);
  }
  layers.anchors.add(jetGroup);

  // Scale: Spiraling infall photon beads vanishing abruptly into the invisible Schwarzschild radius!
  const photons = [];
  for (let i = 0; i < 24; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), i % 2 === 0 ? creamMat : inkMat);
    p.userData.ang = (i / 24) * Math.PI * 2;
    p.userData.rad = 2.15 + (i % 6) * 0.38;
    p.userData.speed = 0.45 + (1 / p.userData.rad) * 1.4;
    layers.scale.add(p);
    photons.push(p);
  }

  // Kinetic Occlusion: Warped spacetime meridian lines + "HORIZON" lettering behind
  const backGroup = new THREE.Group();
  backGroup.position.set(0, 0, -4.8);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.78 });
  for (let i = -7; i <= 7; i++) {
    const pts = [];
    for (let x = -10; x <= 10; x += 0.4) {
      const y0 = i * 0.95;
      const dist = Math.hypot(x, y0) + 0.6;
      const bend = (y0 >= 0 ? 1 : -1) * (2.6 / (dist * dist + 1.4));
      pts.push(new THREE.Vector3(x, y0 + bend, 0));
    }
    backGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), paleLine));
  }
  const hTex = createTypographyTexture({ text: 'HORIZON', colorHex: '#F3B68B', width: 1500, height: 360, fontSize: 195, letterSpacing: 16 });
  const hMesh = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.8), new THREE.MeshBasicMaterial({ map: hTex, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
  hMesh.position.set(0, 2.45, 0.06);
  backGroup.add(hMesh);
  layers.kinetic.add(backGroup);

  function update(dt, elapsed, params, camera) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    if (camera) lensedGroup.lookAt(camera.position);

    photons.forEach((p) => {
      p.userData.ang += dt * p.userData.speed * m;
      p.userData.rad -= dt * 0.18 * m;
      if (p.userData.rad < R - 0.1) p.userData.rad = 4.35;
      const local = new THREE.Vector3(Math.cos(p.userData.ang) * p.userData.rad, 0, Math.sin(p.userData.ang) * p.userData.rad);
      local.applyEuler(new THREE.Euler(0.18, 0, -0.18));
      p.position.copy(local);
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireSph], layers, update };
}

/* ============================================================================
 * 10 · 戴森环穹阵列 (Dyson Aperture — Nested Megastructure Swarm)
 * ========================================================================== */
export function buildDysonWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #687849
  const inkHex = '#231912';
  const creamHex = '#F6ECD7';
  const goldHex = '#D9AA52';
  const paleHex = '#869765';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#505E36', gridScale: 1.6 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const goldMat = createFlatMaterial(goldHex, { side: THREE.DoubleSide });

  const R = 2.0;
  group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), phantomMat));
  const wireSph = makeXRayWire(new THREE.SphereGeometry(R * 1.005, 24, 16), inkHex);
  group.add(wireSph);

  // Anchors: 3 counter-rotating segmented Dyson collector rings with crisp flat architectural louvers
  const rings = [];
  const ringSpecs = [
    { rad: 2.55, count: 24, tilt: [0.35, 0.2, 0.15], speed: 0.24, mat: inkMat, panelH: 0.42 },
    { rad: 3.12, count: 32, tilt: [-0.72, 0.5, 0.4], speed: -0.19, mat: creamMat, panelH: 0.34 },
    { rad: 3.62, count: 18, tilt: [1.15, -0.35, -0.25], speed: 0.14, mat: goldMat, panelH: 0.28 }
  ];
  ringSpecs.forEach((sp, rIdx) => {
    const rg = new THREE.Group();
    rg.rotation.set(...sp.tilt);
    // Thin structural spine
    rg.add(new THREE.Mesh(new THREE.TorusGeometry(sp.rad, 0.018, 8, 96), inkMat));
    for (let i = 0; i < sp.count; i++) {
      // Leave intentional rhythmic aperture gaps so silhouette reads architecturally
      if ((i + rIdx) % 4 === 0) continue;
      const a = (i / sp.count) * Math.PI * 2;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.32, sp.panelH, 0.035), sp.mat);
      panel.position.set(Math.cos(a) * sp.rad, 0, Math.sin(a) * sp.rad);
      panel.rotation.y = -a + Math.PI / 2;
      rg.add(panel);
    }
    rg.userData.speed = sp.speed;
    layers.anchors.add(rg);
    rings.push(rg);
  });

  // Eclipse crescent shadow rim on invisible central star
  layers.shadow.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.008, 48, 36), createEclipseCrescentMaterial({ inkHex, wallHex })));

  // Scale: 28 free-floating micro solar-sail hexagons orbiting outside
  const sails = [];
  for (let i = 0; i < 28; i++) {
    const sail = new THREE.Mesh(new THREE.CircleGeometry(0.11, 6), i % 3 === 0 ? goldMat : (i % 2 === 0 ? creamMat : inkMat));
    sail.userData.theta = (i / 28) * Math.PI * 2;
    sail.userData.phi = (Math.sin(i * 1.9) * 0.65);
    sail.userData.rad = 2.25 + (i % 4) * 0.45;
    sail.userData.speed = 0.15 + (i % 5) * 0.04;
    layers.scale.add(sail);
    sails.push(sail);
  }

  // Kinetic Occlusion: Radial olive solar blueprint & "DYSON" typography behind
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0, -5.2);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.72 });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 9, Math.sin(a) * 9, 0)]), paleLine));
  }
  const dTex = createTypographyTexture({ text: 'DYSON', colorHex: '#8C9E6B', width: 1400, height: 360, fontSize: 220, letterSpacing: 18 });
  const dMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 2.7), new THREE.MeshBasicMaterial({ map: dTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
  dMesh.position.set(0, 2.65, 0.05);
  backPlane.add(dMesh);
  layers.kinetic.add(backPlane);

  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    rings.forEach((rg) => { rg.rotation.y += dt * rg.userData.speed * m; });
    sails.forEach((s) => {
      s.userData.theta += dt * s.userData.speed * m;
      const r = s.userData.rad, th = s.userData.theta, ph = s.userData.phi;
      s.position.set(Math.cos(th) * Math.cos(ph) * r, Math.sin(ph) * r, Math.sin(th) * Math.cos(ph) * r);
      s.lookAt(0, 0, 0);
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireSph], layers, update };
}

/* ============================================================================
 * 11 · 爱因斯坦-罗森虫洞井 (Spacetime Throat — Hyperboloid Gravity Well)
 * ========================================================================== */
export function buildWormholeWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #7C9EA8
  const inkHex = '#231816';
  const creamHex = '#F6ECD7';
  const terraHex = '#C86446';
  const paleHex = '#9EBCC5';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#60818B', gridScale: 1.6, side: THREE.DoubleSide });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const terraMat = createFlatMaterial(terraHex, { side: THREE.DoubleSide });

  // Double-funnel hyperboloid wormhole throat (LatheGeometry)
  const lathePts = [];
  const throatR = (y) => 0.72 + Math.pow(Math.abs(y), 1.55) * 0.44;
  for (let i = 0; i <= 40; i++) {
    const y = -2.85 + (i / 40) * 5.7;
    lathePts.push(new THREE.Vector2(throatR(y), y));
  }
  const wormGeo = new THREE.LatheGeometry(lathePts, 64);
  const root = new THREE.Group();
  root.rotation.set(0.24, 0, -0.14);
  root.add(new THREE.Mesh(wormGeo, phantomMat));
  const wireWorm = makeXRayWire(wormGeo, inkHex);
  root.add(wireWorm);
  group.add(root);

  const anchorRoot = new THREE.Group();
  anchorRoot.rotation.copy(root.rotation);
  layers.anchors.add(anchorRoot);

  // Concentric latitude curvature rings flaring smoothly into upper/lower universes
  [-2.65, -2.05, -1.35, -0.62, 0.0, 0.62, 1.35, 2.05, 2.65].forEach((y, idx) => {
    const r = throatR(y) + 0.03;
    const isThroat = idx === 4;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, isThroat ? 0.055 : 0.024, 8, 96),
      isThroat ? terraMat : (idx % 2 === 0 ? inkMat : creamMat)
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    anchorRoot.add(ring);
  });

  // 8 twisting geodesic meridian lines diving through the invisible throat
  const twistGroup = new THREE.Group();
  anchorRoot.add(twistGroup);
  for (let k = 0; k < 8; k++) {
    const baseA = (k / 8) * Math.PI * 2;
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const y = -2.75 + (i / 40) * 5.5;
      const r = throatR(y) + 0.025;
      const a = baseA + y * 0.34;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    twistGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.015, 5, false), k % 2 === 0 ? inkMat : creamMat));
  }

  // Scale: 16 cream photon orbs spiraling cleanly down the invisible gravity funnel!
  const photons = [];
  const scaleRoot = new THREE.Group();
  scaleRoot.rotation.copy(root.rotation);
  layers.scale.add(scaleRoot);
  for (let i = 0; i < 16; i++) {
    const ph = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 12), i % 3 === 0 ? terraMat : creamMat);
    ph.userData.y = -2.7 + (i / 16) * 5.4;
    ph.userData.ang = i * 1.1;
    scaleRoot.add(ph);
    photons.push(ph);
  }

  // Kinetic Occlusion: Far twin universe horizontal planes & "THROAT" lettering
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0, -5.2);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.78 });
  for (let i = -6; i <= 6; i++) {
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-11, i * 0.95, 0), new THREE.Vector3(11, i * 0.95, 0)]), paleLine));
  }
  const wTex = createTypographyTexture({ text: 'EINSTEIN-ROSEN', colorHex: '#A6C3CC', width: 1600, height: 320, fontSize: 135, letterSpacing: 12 });
  const wMesh = new THREE.Mesh(new THREE.PlaneGeometry(12.2, 2.4), new THREE.MeshBasicMaterial({ map: wTex, transparent: true, opacity: 0.86, depthWrite: false, side: THREE.DoubleSide }));
  wMesh.position.set(0, 0, 0.05);
  backPlane.add(wMesh);
  layers.kinetic.add(backPlane);

  // Espresso shadow aperture disc below lower mouth
  const shDisc = new THREE.Mesh(new THREE.RingGeometry(0.75, 2.95, 64), inkMat);
  shDisc.rotation.x = -Math.PI / 2;
  shDisc.position.set(0.3, -3.15, -0.2);
  layers.shadow.add(shDisc);

  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    twistGroup.rotation.y += dt * 0.25 * m;

    photons.forEach((ph) => {
      ph.userData.y -= dt * 0.72 * m;
      if (ph.userData.y < -2.75) ph.userData.y = 2.75;
      ph.userData.ang += dt * (1.2 / throatR(ph.userData.y)) * m;
      const r = throatR(ph.userData.y) + 0.06;
      ph.position.set(Math.cos(ph.userData.ang) * r, ph.userData.y, Math.sin(ph.userData.ang) * r);
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireWorm], layers, update };
}

/* ============================================================================
 * 12 · 双星洛希潮汐锁 (Roche Binary — Twin Moving Invisible Stars!)
 * ========================================================================== */
export function buildRocheBinaryWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #9A6B84
  const inkHex = '#28161E';
  const creamHex = '#F6ECD7';
  const goldHex = '#E5B869';
  const paleHex = '#B88AA3';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#7B5268', gridScale: 1.8 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const goldMat = createFlatMaterial(goldHex, { side: THREE.DoubleSide });

  const binaryRoot = new THREE.Group();
  binaryRoot.rotation.set(0.28, 0, 0.16);
  group.add(binaryRoot);

  const R1 = 1.62, R2 = 1.18, SEP = 2.15;
  const star1 = new THREE.Mesh(new THREE.SphereGeometry(R1, 48, 36), phantomMat); star1.position.x = -SEP * 0.75;
  const star2 = new THREE.Mesh(new THREE.SphereGeometry(R2, 48, 36), phantomMat); star2.position.x = SEP * 1.05;
  binaryRoot.add(star1, star2);

  const wire1 = makeXRayWire(new THREE.SphereGeometry(R1 * 1.005, 18, 12), inkHex); wire1.position.copy(star1.position);
  const wire2 = makeXRayWire(new THREE.SphereGeometry(R2 * 1.005, 18, 12), inkHex); wire2.position.copy(star2.position);
  binaryRoot.add(wire1, wire2);

  // Opposing razor eclipse crescents on BOTH invisible stars
  const shadowRoot = new THREE.Group();
  shadowRoot.rotation.copy(binaryRoot.rotation);
  const cr1 = new THREE.Mesh(new THREE.SphereGeometry(R1 * 1.009, 48, 36), createEclipseCrescentMaterial({ inkHex, wallHex })); cr1.position.copy(star1.position);
  const cr2 = new THREE.Mesh(new THREE.SphereGeometry(R2 * 1.009, 48, 36), createEclipseCrescentMaterial({ inkHex, wallHex })); cr2.position.copy(star2.position);
  shadowRoot.add(cr1, cr2);
  layers.shadow.add(shadowRoot);

  // Anchors: Figure-8 Roche Lobe contour + S-shaped tidal matter bridge + twin inclined rings!
  const anchorRoot = new THREE.Group();
  anchorRoot.rotation.copy(binaryRoot.rotation);
  layers.anchors.add(anchorRoot);

  // Lemniscate figure-8 Roche potential contour wrapping around BOTH invisible stars!
  const fig8Pts = [];
  for (let i = 0; i <= 140; i++) {
    const t = (i / 140) * Math.PI * 2;
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const lx = 4.05 * Math.cos(t) / denom;
    const lz = 3.15 * Math.sin(t) * Math.cos(t) / denom;
    fig8Pts.push(new THREE.Vector3(lx + 0.15, 0, lz));
  }
  anchorRoot.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fig8Pts, true), 140, 0.025, 6, true), inkMat));

  // Individual tilted rings around each invisible star
  const ring1 = new THREE.Mesh(new THREE.RingGeometry(R1 + 0.25, R1 + 0.50, 72), creamMat);
  ring1.position.copy(star1.position); ring1.rotation.set(Math.PI * 0.45, 0.3, 0.2);
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(R2 + 0.22, R2 + 0.44, 72), goldMat);
  ring2.position.copy(star2.position); ring2.rotation.set(Math.PI * 0.45, -0.35, -0.2);
  anchorRoot.add(ring1, ring2);

  // Flowing S-curve tidal stream beads transferring from Star 1 to Star 2
  const streamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(star1.position.x + R1 * 0.9, 0.05, 0.1),
    new THREE.Vector3(0.0, 0.22, 0.55),
    new THREE.Vector3(star2.position.x - R2 * 0.7, 0.05, -0.3),
    new THREE.Vector3(star2.position.x + R2 * 0.95, 0.0, 0.45)
  ]);
  const streamBeads = [];
  const scaleRoot = new THREE.Group();
  scaleRoot.rotation.copy(binaryRoot.rotation);
  layers.scale.add(scaleRoot);
  for (let i = 0; i < 24; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), i % 2 === 0 ? creamMat : goldMat);
    b.userData.t = i / 24;
    scaleRoot.add(b);
    streamBeads.push(b);
  }

  // Kinetic Occlusion: Far pale-plum astronomical chart eclipsed simultaneously by TWO moving invisible circles!
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0, -5.2);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.78 });
  for (let i = -7; i <= 7; i++) {
    backPlane.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-11, i * 1.0, 0), new THREE.Vector3(11, i * 1.0, 0)]), paleLine),
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 1.15, -8, 0), new THREE.Vector3(i * 1.15, 8, 0)]), paleLine)
    );
  }
  const bTex = createTypographyTexture({ text: 'ROCHE BINARY', colorHex: '#BE91A9', width: 1600, height: 320, fontSize: 155, letterSpacing: 14 });
  const bMesh = new THREE.Mesh(new THREE.PlaneGeometry(12.2, 2.5), new THREE.MeshBasicMaterial({ map: bTex, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
  bMesh.position.set(0, 2.15, 0.06);
  backPlane.add(bMesh);
  layers.kinetic.add(backPlane);

  let orb = 0;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    orb += dt * 0.28 * m;
    binaryRoot.rotation.y = orb;
    anchorRoot.rotation.y = orb;
    shadowRoot.rotation.y = orb;
    scaleRoot.rotation.y = orb;

    streamBeads.forEach((b) => {
      b.userData.t = (b.userData.t + dt * 0.22 * m) % 1.0;
      streamCurve.getPoint(b.userData.t, b.position);
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wire1, wire2], layers, update };
}
