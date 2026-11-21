import * as THREE from 'three';
import {
  createPhantomMaterial,
  createFlatMaterial,
  createTypographyTexture
} from './shaders.js';
import { makeXRayWire } from './worlds_core.js';

/* ============================================================================
 * 17 · 太初隐形浑天仪 (Primordial Armillary — Invisible Jade Core & Celestial Rings)
 * ========================================================================== */
export function buildArmillaryWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #859A8B
  const inkHex = '#231914';
  const creamHex = '#F6ECD7';
  const bronzeHex = '#C8984C';
  const vermHex = '#BA543C';
  const paleHex = '#A2B7A8';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#697E6F', gridScale: 1.7 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const bronzeMat = createFlatMaterial(bronzeHex, { side: THREE.DoubleSide });
  const vermMat = createFlatMaterial(vermHex, { side: THREE.DoubleSide });

  const R = 1.88;
  group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 56, 42), phantomMat));
  const wireSph = makeXRayWire(new THREE.SphereGeometry(R * 1.005, 22, 14), inkHex);
  group.add(wireSph);

  // Anchors: Nested Ancient Chinese Armillary Rings (Meridian, Ecliptic, Equator) with precision degree ticks!
  function buildGraduatedRing(radius, tube, mat, tickCount, tickMat) {
    const rg = new THREE.Group();
    rg.add(new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 108), mat));
    for (let i = 0; i < tickCount; i++) {
      const a = (i / tickCount) * Math.PI * 2;
      const major = i % 4 === 0;
      const tk = new THREE.Mesh(new THREE.BoxGeometry(major ? 0.16 : 0.08, 0.02, 0.025), tickMat);
      tk.position.set(Math.cos(a) * (radius + tube + 0.04), Math.sin(a) * (radius + tube + 0.04), 0);
      tk.rotation.z = a;
      rg.add(tk);
    }
    return rg;
  }

  const meridianRing = buildGraduatedRing(3.15, 0.068, inkMat, 36, creamMat);
  const equatorRing = buildGraduatedRing(2.72, 0.055, bronzeMat, 28, inkMat);
  equatorRing.rotation.x = Math.PI * 0.48;
  const eclipticRing = buildGraduatedRing(2.38, 0.046, creamMat, 24, inkMat);
  eclipticRing.rotation.set(Math.PI * 0.34, 0.45, 0.38);

  // Polar celestial axis piercing cleanly into and out of the invisible jade sphere!
  const polarAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 7.2, 10), inkMat);
  polarAxis.rotation.z = -0.38;
  const axisPinTop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), vermMat);
  axisPinTop.position.set(Math.sin(0.38) * 3.6, Math.cos(0.38) * 3.6, 0);
  const axisPinBot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), bronzeMat);
  axisPinBot.position.set(-Math.sin(0.38) * 3.6, -Math.cos(0.38) * 3.6, 0);

  layers.anchors.add(meridianRing, equatorRing, eclipticRing, polarAxis, axisPinTop, axisPinBot);

  // Scale: Twenty-Eight Mansions (二十八宿) cream constellation pearls orbiting outside
  const stars = [];
  const starGroup = new THREE.Group();
  layers.scale.add(starGroup);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const rad = 3.65 + (i % 3) * 0.28;
    const st = new THREE.Mesh(new THREE.SphereGeometry(i % 7 === 0 ? 0.085 : 0.045, 10, 10), i % 7 === 0 ? vermMat : creamMat);
    st.position.set(Math.cos(a) * rad, Math.sin(a * 2) * 0.72, Math.sin(a) * rad);
    starGroup.add(st);
    stars.push(st);
  }

  // Kinetic Occlusion: Subtle antique celestial compass ring behind
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0, -5.0);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.78 });
  [2.2, 3.8, 5.4].forEach((r) => {
    const pts = [];
    for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); }
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), paleLine));
  });
  const tTex = createTypographyTexture({ text: 'ARMILLARY', colorHex: '#A7BCAE', width: 1500, height: 340, fontSize: 175, letterSpacing: 14 });
  const tMesh = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), new THREE.MeshBasicMaterial({ map: tTex, transparent: true, opacity: 0.84, depthWrite: false, side: THREE.DoubleSide }));
  tMesh.position.set(0, 2.75, 0.05);
  backPlane.add(tMesh);
  layers.kinetic.add(backPlane);

  // Espresso cross-ring ground shadow below
  const shGroup = new THREE.Group();
  shGroup.position.set(0.3, -3.55, -0.2);
  const shRing = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.65, 64), inkMat); shRing.rotation.x = -Math.PI / 2;
  const shBar = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.14), inkMat); shBar.rotation.x = -Math.PI / 2;
  shGroup.add(shRing, shBar);
  layers.shadow.add(shGroup);

  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    equatorRing.rotation.z += dt * 0.26 * m;
    eclipticRing.rotation.y -= dt * 0.21 * m;
    eclipticRing.rotation.z += dt * 0.12 * m;
    starGroup.rotation.y += dt * 0.09 * m;
    shGroup.rotation.y -= dt * 0.15 * m;
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireSph], layers, update };
}

/* ============================================================================
 * 18 · 无形大梵古钟 (Bell of Silence — Invisible Temple Bell & Acoustic Waves)
 * ========================================================================== */
export function buildBellWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #B89C6D
  const inkHex = '#2A1811';
  const creamHex = '#F6ECD7';
  const vermHex = '#BC4E37';
  const paleHex = '#D2BA90';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#9A7F54', gridScale: 1.8 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const vermMat = createFlatMaterial(vermHex, { side: THREE.DoubleSide });

  // Sculpted classical East Asian Temple Bell profile (LatheGeometry)
  const bellProfile = [
    new THREE.Vector2(0.0, 2.55),
    new THREE.Vector2(0.95, 2.48),
    new THREE.Vector2(1.42, 2.15),
    new THREE.Vector2(1.62, 1.35),
    new THREE.Vector2(1.74, 0.25),
    new THREE.Vector2(1.92, -0.95),
    new THREE.Vector2(2.14, -1.85),
    new THREE.Vector2(1.98, -1.85)
  ];
  const bellGeo = new THREE.LatheGeometry(bellProfile, 64);
  const bellRoot = new THREE.Group();
  bellRoot.position.y = 0.25;
  bellRoot.add(new THREE.Mesh(bellGeo, phantomMat));
  const wireBell = makeXRayWire(bellGeo, inkHex);
  bellRoot.add(wireBell);
  group.add(bellRoot);

  // Anchors: Dragon-loop crown (蒲牢钟钮), timber beam, raised bronze boss grids (乳钉), inscription bands & scalloped rim!
  const anchorRoot = new THREE.Group();
  anchorRoot.position.copy(bellRoot.position);
  layers.anchors.add(anchorRoot);

  // Timber suspension beam at top
  const beam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.18, 0.22), inkMat);
  beam.position.y = 3.22;
  const crownLoop = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.11, 10, 32, Math.PI), inkMat);
  crownLoop.position.y = 2.52;
  const crownCore = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.24, 16), creamMat);
  crownCore.position.y = 2.58;
  anchorRoot.add(beam, crownLoop, crownCore);

  // 4-quadrant Bronze Bosses (乳钉阵列 — 3x3 raised studs curving on the invisible upper shoulder -> textbook SfM!)
  for (let q = 0; q < 4; q++) {
    const qBase = (q / 4) * Math.PI * 2 + Math.PI / 4;
    for (let row = 0; row < 3; row++) {
      const y = 1.65 - row * 0.26;
      const rad = 1.54 + row * 0.065;
      for (let col = -1; col <= 1; col++) {
        const a = qBase + col * 0.18;
        const boss = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 10), inkMat);
        boss.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
        anchorRoot.add(boss);
      }
    }
  }

  // Waist inscription bands & lotus strike-medallion (撞钟莲花座)
  const bandTop = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.036, 8, 96), creamMat);
  bandTop.rotation.x = Math.PI / 2; bandTop.position.y = 0.25;
  const bandBot = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.032, 8, 96), inkMat);
  bandBot.rotation.x = Math.PI / 2; bandBot.position.y = -0.68;
  const strikePad = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), vermMat);
  strikePad.position.set(0, -0.32, 1.88);
  const strikePadBack = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), vermMat);
  strikePadBack.position.set(0, -0.32, -1.88); strikePadBack.rotation.y = Math.PI;
  anchorRoot.add(bandTop, bandBot, strikePad, strikePadBack);

  // Bold wavy scalloped espresso bottom bell-lip!
  const lipPts = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const y = -1.85 + Math.sin(a * 8) * 0.085;
    lipPts.push(new THREE.Vector3(Math.cos(a) * 2.14, y, Math.sin(a) * 2.14));
  }
  anchorRoot.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lipPts, true), 96, 0.075, 8, true), inkMat));

  // Scale: Expanding concentric acoustic sound-wave rings pulsing gently from the invisible bell!
  const waves = [];
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Mesh(
      new THREE.RingGeometry(2.25, 2.31, 96),
      createFlatMaterial(creamHex, { side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    w.rotation.x = Math.PI / 2;
    w.position.y = -1.55;
    w.userData.phase = i / 4;
    layers.scale.add(w);
    waves.push(w);
  }

  // Flat espresso shadow ring on temple floor beneath the bell
  const floorShadow = new THREE.Mesh(new THREE.CircleGeometry(2.18, 64), inkMat);
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.set(0.15, -2.55, -0.1);
  layers.shadow.add(floorShadow);

  // Kinetic Occlusion: Subtle vertical classical sutra ruling lines & "SILENCE" behind
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0.4, -5.0);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.76 });
  for (let i = -8; i <= 8; i++) {
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 1.1, -6, 0), new THREE.Vector3(i * 1.1, 6, 0)]), paleLine));
  }
  const bTex = createTypographyTexture({ text: 'SILENCE', colorHex: '#D8C29B', width: 1400, height: 340, fontSize: 195, letterSpacing: 16 });
  const bMesh = new THREE.Mesh(new THREE.PlaneGeometry(11.0, 2.6), new THREE.MeshBasicMaterial({ map: bTex, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
  bMesh.position.set(0, 0.45, 0.05);
  backPlane.add(bMesh);
  layers.kinetic.add(backPlane);

  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    const swing = Math.sin(elapsed * 0.85 * m) * 0.035;
    bellRoot.rotation.z = swing;
    anchorRoot.rotation.z = swing;

    waves.forEach((w) => {
      w.userData.phase = (w.userData.phase + dt * 0.16 * Math.max(0.25, m)) % 1.0;
      const p = w.userData.phase;
      const sc = 0.85 + p * 1.45;
      w.scale.set(sc, sc, 1);
      w.material.opacity = (1 - p) * 0.78;
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireBell], layers, update };
}

/* ============================================================================
 * 19 · 天圆地方 · 玉琮祭坛 (Cong Cosmogram — Square Outer, Circular Inner Bore)
 * ========================================================================== */
export function buildCongWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #EBE2CE
  const inkHex = '#2B1912';
  const jadeHex = '#5B745D';
  const vermHex = '#BF4D38';
  const goldHex = '#C69745';
  const paleHex = '#D7CBB2';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#D4C8B0', gridScale: 1.7 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const jadeMat = createFlatMaterial(jadeHex, { side: THREE.DoubleSide });
  const vermMat = createFlatMaterial(vermHex, { side: THREE.DoubleSide });
  const goldMat = createFlatMaterial(goldHex, { side: THREE.DoubleSide });

  // True Liangzhu Jade Cong: Square Outer Prism with Circular Central Bore! (ExtrudeGeometry with Hole!)
  const S = 1.42;
  const BORE_R = 0.88;
  const H = 3.85;
  const congShape = new THREE.Shape();
  congShape.moveTo(-S, -S); congShape.lineTo(S, -S); congShape.lineTo(S, S); congShape.lineTo(-S, S); congShape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, BORE_R, 0, Math.PI * 2, true);
  congShape.holes.push(hole);

  const congGeo = new THREE.ExtrudeGeometry(congShape, { depth: H, bevelEnabled: false, curveSegments: 48 });
  congGeo.rotateX(-Math.PI / 2);
  congGeo.translate(0, -H / 2, 0);

  const root = new THREE.Group();
  root.position.y = 0.35;
  root.add(new THREE.Mesh(congGeo, phantomMat));
  const wireCong = makeXRayWire(congGeo, inkHex);
  root.add(wireCong);
  group.add(root);

  // Anchors: 5 stacked tiers of Liangzhu corner mask ridges (神人兽面极简刻线) + circular vermilion sky-bore rims!
  const anchorRoot = new THREE.Group();
  anchorRoot.position.copy(root.position);
  layers.anchors.add(anchorRoot);

  // Circular Sky-Bore Rims (天圆) top & bottom
  const topBoreRim = new THREE.Mesh(new THREE.TorusGeometry(BORE_R, 0.068, 10, 64), vermMat);
  topBoreRim.rotation.x = Math.PI / 2; topBoreRim.position.y = H / 2 + 0.06;
  const botBoreRim = new THREE.Mesh(new THREE.TorusGeometry(BORE_R, 0.055, 10, 64), inkMat);
  botBoreRim.rotation.x = Math.PI / 2; botBoreRim.position.y = -H / 2 - 0.04;
  anchorRoot.add(topBoreRim, botBoreRim);

  // 5 horizontal tiers of corner ridges defining the invisible square exterior (地方)!
  const tiers = 5;
  const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (let t = 0; t < tiers; t++) {
    const ty = -H / 2 + 0.44 + t * (H - 0.88) / (tiers - 1);
    corners.forEach(([sx, sz]) => {
      // L-shaped jade & espresso double horizontal motif bars wrapping tightly around each invisible corner
      const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.052, 0.04), t % 2 === 0 ? jadeMat : inkMat);
      bar1.position.set(sx * (S - 0.28), ty + 0.09, sz * (S + 0.02));
      const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.052, 0.62), t % 2 === 0 ? jadeMat : inkMat);
      bar2.position.set(sx * (S + 0.02), ty + 0.09, sz * (S - 0.28));

      const bar3 = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.032, 0.035), goldMat);
      bar3.position.set(sx * (S - 0.21), ty - 0.06, sz * (S + 0.02));
      const bar4 = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.032, 0.46), goldMat);
      bar4.position.set(sx * (S + 0.02), ty - 0.06, sz * (S - 0.21));

      // Iconic Liangzhu circular eye-dot pair flanking the corner edge
      const eye1 = new THREE.Mesh(new THREE.CircleGeometry(0.052, 12), inkMat);
      eye1.position.set(sx * (S - 0.22), ty - 0.16, sz * (S + 0.025));
      if (sz < 0) eye1.rotation.y = Math.PI;
      const eye2 = new THREE.Mesh(new THREE.CircleGeometry(0.052, 12), inkMat);
      eye2.position.set(sx * (S + 0.025), ty - 0.16, sz * (S - 0.22));
      eye2.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;

      anchorRoot.add(bar1, bar2, bar3, bar4, eye1, eye2);
    });
  }

  // Scale: Floating golden celestial axis & orbiting sky pearls rising through the invisible circular bore!
  const axisGroup = new THREE.Group();
  axisGroup.position.copy(root.position);
  const axisLine = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 6.2, 8), goldMat);
  axisGroup.add(axisLine);
  const borePearls = [];
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 12), i % 2 === 0 ? vermMat : goldMat);
    p.userData.phase = (i / 6) * Math.PI * 2;
    p.userData.y = -2.2 + i * 0.88;
    axisGroup.add(p);
    borePearls.push(p);
  }
  layers.scale.add(axisGroup);

  // Shadow: Crisp flat square-with-round-hole cast shadow on the altar floor beneath!
  const shadowGeo = new THREE.ShapeGeometry(congShape);
  const floorShadow = new THREE.Mesh(shadowGeo, inkMat);
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.set(0.32, -2.18, -0.22);
  layers.shadow.add(floorShadow);

  // Kinetic Occlusion: Antique paper grid + "COSMOGRAM" behind
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0.35, -5.2);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.82 });
  for (let i = -6; i <= 6; i++) {
    backPlane.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10, i * 1.15, 0), new THREE.Vector3(10, i * 1.15, 0)]), paleLine),
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 1.15, -7, 0), new THREE.Vector3(i * 1.15, 7, 0)]), paleLine)
    );
  }
  const cTex = createTypographyTexture({ text: 'COSMOGRAM', colorHex: '#D4C7AD', width: 1600, height: 340, fontSize: 168, letterSpacing: 14 });
  const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 2.6), new THREE.MeshBasicMaterial({ map: cTex, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
  cMesh.position.set(0, 2.45, 0.05);
  backPlane.add(cMesh);
  layers.kinetic.add(backPlane);

  let rot = 0.48;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    rot += dt * 0.16 * m;
    root.rotation.y = rot;
    anchorRoot.rotation.y = rot;
    floorShadow.rotation.z = -rot;

    borePearls.forEach((p, idx) => {
      const a = elapsed * 0.65 * m + p.userData.phase;
      const r = 0.24 + (idx % 2) * 0.14;
      p.position.set(Math.cos(a) * r, p.userData.y + Math.sin(elapsed + idx) * 0.18, Math.sin(a) * r);
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireCong], layers, update };
}
