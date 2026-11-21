import * as THREE from 'three';
import {
  createPhantomMaterial,
  createWaterReflectionMaterial,
  createFlatMaterial,
  createTypographyTexture
} from './shaders.js';
import { makeXRayWire, makeBirdMesh } from './worlds_core.js';

/* ============================================================================
 * 13 · 虚空万神殿 (Unseen Pantheon — Floating Oculus, Coffer Rings & Sunbeam)
 * ========================================================================== */
export function buildPantheonWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #C6A882
  const inkHex = '#2A1912';
  const creamHex = '#F6ECD7';
  const terraHex = '#BA583E';
  const paleHex = '#DEC3A1';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#A68965', gridScale: 1.5 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const terraMat = createFlatMaterial(terraHex, { side: THREE.DoubleSide });

  const R = 3.05;
  const DRUM_H = 1.9;
  const domeMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 56, 28, 0, Math.PI * 2, 0.24, Math.PI * 0.5 - 0.24), phantomMat);
  domeMesh.position.y = DRUM_H;
  const drumMesh = new THREE.Mesh(new THREE.CylinderGeometry(R, R, DRUM_H, 56, 1, false), phantomMat);
  drumMesh.position.y = DRUM_H / 2;
  group.add(domeMesh, drumMesh);

  const wireDome = makeXRayWire(new THREE.SphereGeometry(R * 1.004, 24, 12, 0, Math.PI * 2, 0.24, Math.PI * 0.5 - 0.24), inkHex);
  wireDome.position.y = DRUM_H;
  const wireDrum = makeXRayWire(new THREE.CylinderGeometry(R * 1.004, R * 1.004, DRUM_H, 24, 4), inkHex);
  wireDrum.position.y = DRUM_H / 2;
  group.add(wireDome, wireDrum);

  // Anchors: Floating Oculus Ring + 4 tiers of floating coffer squares + circular pediment portico
  const oculusY = DRUM_H + Math.cos(0.24) * R;
  const oculusR = Math.sin(0.24) * R;
  const oculusRing = new THREE.Mesh(new THREE.TorusGeometry(oculusR, 0.085, 10, 64), inkMat);
  oculusRing.rotation.x = Math.PI / 2;
  oculusRing.position.y = oculusY;
  const oculusRimCream = new THREE.Mesh(new THREE.TorusGeometry(oculusR * 1.15, 0.04, 8, 64), creamMat);
  oculusRimCream.rotation.x = Math.PI / 2;
  oculusRimCream.position.y = oculusY;
  layers.anchors.add(oculusRing, oculusRimCream);

  // Coffer square rings floating strictly on the invisible dome curvature!
  [0.52, 0.80, 1.08, 1.32].forEach((phi, ti) => {
    const count = 16;
    const y = DRUM_H + Math.cos(phi) * (R + 0.03);
    const rad = Math.sin(phi) * (R + 0.03);
    const sqSize = 0.22 + ti * 0.055;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const coffer = new THREE.Mesh(new THREE.PlaneGeometry(sqSize, sqSize * 0.78), i % 4 === 0 ? terraMat : inkMat);
      coffer.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
      coffer.lookAt(Math.sin(a) * (rad + 2), y + Math.cos(phi) * 2, Math.cos(a) * (rad + 2));
      layers.anchors.add(coffer);
    }
  });

  // Minimalist front portico cornice triangle + 6 crisp espresso column bases
  const portico = new THREE.Group();
  portico.position.set(0, 0, R + 0.35);
  const pedimentShape = new THREE.Shape();
  pedimentShape.moveTo(-1.45, 0); pedimentShape.lineTo(0, 0.62); pedimentShape.lineTo(1.45, 0); pedimentShape.closePath();
  const ped = new THREE.Mesh(new THREE.ShapeGeometry(pedimentShape), creamMat);
  ped.position.y = 1.92;
  const pedEdge = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.075, 0.14), inkMat);
  pedEdge.position.y = 1.90;
  portico.add(ped, pedEdge);
  for (let c = 0; c < 6; c++) {
    const cx = -1.2 + c * 0.48;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.16), inkMat); cap.position.set(cx, 1.82, 0);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.18), inkMat); base.position.set(cx, 0.06, 0);
    portico.add(cap, base);
  }
  layers.anchors.add(portico);

  // Diagonal flat warm-ivory sunbeam shaft slicing cleanly down INSIDE the invisible dome from the Oculus!
  const beamGeo = new THREE.CylinderGeometry(oculusR * 0.86, oculusR * 1.28, 4.85, 32, 1, true);
  const beamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide, transparent: true, opacity: 0.42, depthWrite: false });
  const sunbeam = new THREE.Mesh(beamGeo, beamMat);
  sunbeam.position.set(0.55, 2.38, 0.22);
  sunbeam.rotation.z = -0.24;
  layers.scale.add(sunbeam);

  // Crisp colonnade radial espresso cast shadows on the floor (y = 0)
  const floorGroup = new THREE.Group();
  const baseRing = new THREE.Mesh(new THREE.RingGeometry(R - 0.04, R + 0.06, 72), inkMat);
  baseRing.rotation.x = -Math.PI / 2;
  floorGroup.add(baseRing);
  const sunPool = new THREE.Mesh(new THREE.CircleGeometry(1.12, 48), creamMat);
  sunPool.rotation.x = -Math.PI / 2;
  sunPool.position.set(1.75, 0.015, 0.48);
  floorGroup.add(sunPool);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 1.55), inkMat);
    sh.rotation.x = -Math.PI / 2;
    sh.rotation.z = -a + 0.35;
    sh.position.set(Math.cos(a) * (R + 0.82), 0.005, Math.sin(a) * (R + 0.82));
    floorGroup.add(sh);
  }
  layers.shadow.add(floorGroup);

  // Kinetic Occlusion: Classical architectural elevation lines + "PANTHEON" behind
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 2.4, -5.8);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.78 });
  for (let i = 0; i < 7; i++) {
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, -2 + i * 1.15, 0), new THREE.Vector3(12, -2 + i * 1.15, 0)]), paleLine));
  }
  const pTex = createTypographyTexture({ text: 'PANTHEON', colorHex: '#E3CAA8', width: 1500, height: 340, fontSize: 185, letterSpacing: 16 });
  const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 2.7), new THREE.MeshBasicMaterial({ map: pTex, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
  pMesh.position.set(0, 2.1, 0.05);
  backPlane.add(pMesh);
  layers.kinetic.add(backPlane);

  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    const sway = Math.sin(elapsed * 0.45 * m) * 0.10;
    sunbeam.rotation.z = -0.24 + sway;
    sunbeam.position.x = 0.55 - sway * 1.6;
    sunPool.position.x = 1.25 - sway * 3.4;
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireDome, wireDrum], layers, update };
}

/* ============================================================================
 * 14 · 逆重力无尽回廊 (Escher Cloister — Multi-Gravity Impossible Monolith)
 * ========================================================================== */
export function buildEscherWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #CE8C7E
  const inkHex = '#2B1614';
  const creamHex = '#F6ECD7';
  const sageHex = '#627E72';
  const paleHex = '#E4ACA0';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#AE6F62', gridScale: 1.7 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const sageMat = createFlatMaterial(sageHex, { side: THREE.DoubleSide });

  // Invisible 3D architectural cross-monolith (3 orthogonal intersecting bars -> Penrose silhouette!)
  const root = new THREE.Group();
  root.position.y = 0.25;
  const barA = new THREE.BoxGeometry(4.4, 1.35, 1.35);
  const barB = new THREE.BoxGeometry(1.35, 4.4, 1.35);
  const barC = new THREE.BoxGeometry(1.35, 1.35, 4.4);
  root.add(new THREE.Mesh(barA, phantomMat), new THREE.Mesh(barB, phantomMat), new THREE.Mesh(barC, phantomMat));
  const wA = makeXRayWire(barA, inkHex), wB = makeXRayWire(barB, inkHex), wC = makeXRayWire(barC, inkHex);
  root.add(wA, wB, wC);
  group.add(root);

  const anchorRoot = new THREE.Group();
  anchorRoot.position.copy(root.position);
  layers.anchors.add(anchorRoot);

  // Reusable arched doorway + mini staircase module oriented in DIFFERENT gravity directions!
  const archShape = new THREE.Shape();
  archShape.moveTo(-0.18, 0); archShape.lineTo(-0.18, 0.34);
  archShape.absarc(0, 0.34, 0.18, Math.PI, 0, true); archShape.lineTo(0.18, 0); archShape.closePath();
  const archGeo = new THREE.ShapeGeometry(archShape, 14);

  function addGravityColonnade(pos, euler, count = 4, useSage = false) {
    const col = new THREE.Group();
    col.position.copy(pos);
    col.rotation.copy(euler);
    // Stairway flight along colonnade base
    for (let s = 0; s < 10; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.045, 0.36), creamMat);
      step.position.set(-1.1 + s * 0.24, -0.45 + (s % 5) * 0.06, 0.06);
      col.add(step);
    }
    for (let i = 0; i < count; i++) {
      const x = -0.95 + i * 0.63;
      const frame = new THREE.Mesh(archGeo, useSage && i === 1 ? sageMat : inkMat);
      frame.position.set(x, -0.32, 0.02);
      col.add(frame);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.045, 0.05), creamMat);
      lintel.position.set(x, 0.25, 0.03);
      col.add(lintel);
    }
    anchorRoot.add(col);
  }

  // Gravity +Y (upright front), Gravity +X (sideways vertical!), Gravity -Y (upside down!), Gravity -Z (back!)
  addGravityColonnade(new THREE.Vector3(0, 0, 0.70), new THREE.Euler(0, 0, 0), 4, false);
  addGravityColonnade(new THREE.Vector3(0.70, 0, 0), new THREE.Euler(0, Math.PI / 2, Math.PI / 2), 4, true);
  addGravityColonnade(new THREE.Vector3(0, 0, -0.70), new THREE.Euler(0, Math.PI, Math.PI), 4, false);
  addGravityColonnade(new THREE.Vector3(-0.70, 0, 0), new THREE.Euler(0, -Math.PI / 2, -Math.PI / 2), 4, true);
  addGravityColonnade(new THREE.Vector3(0, 0.70, 0), new THREE.Euler(-Math.PI / 2, 0, 0), 4, false);
  addGravityColonnade(new THREE.Vector3(0, -0.70, 0), new THREE.Euler(Math.PI / 2, 0, Math.PI), 4, true);

  // Scale: 6 tiny floating cream spheres rolling infinitely across orthogonal gravity planes!
  const rollers = [];
  const scaleRoot = new THREE.Group();
  scaleRoot.position.copy(root.position);
  layers.scale.add(scaleRoot);
  for (let i = 0; i < 6; i++) {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), i % 2 === 0 ? creamMat : inkMat);
    r.userData.axis = i % 3;
    r.userData.phase = i * 1.1;
    scaleRoot.add(r);
    rollers.push(r);
  }

  // Kinetic Occlusion: Diagonal isometric blueprint grid & "CLOISTER"
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0.25, -5.2);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.78 });
  for (let i = -8; i <= 8; i++) {
    backPlane.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, i * 1.1, 0), new THREE.Vector3(12, i * 1.1 + 7, 0)]), paleLine),
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, i * 1.1, 0), new THREE.Vector3(12, i * 1.1 - 7, 0)]), paleLine)
    );
  }
  const eTex = createTypographyTexture({ text: 'CLOISTER', colorHex: '#E9B7AC', width: 1500, height: 340, fontSize: 185, letterSpacing: 16 });
  const eMesh = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), new THREE.MeshBasicMaterial({ map: eTex, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
  eMesh.position.set(0, 2.35, 0.06);
  backPlane.add(eMesh);
  layers.kinetic.add(backPlane);

  // Crisp flat cross-shaped espresso shadow below
  const shGroup = new THREE.Group();
  shGroup.position.set(0.3, -2.75, -0.2);
  const sh1 = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.25), inkMat); sh1.rotation.x = -Math.PI / 2;
  const sh2 = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 4.2), inkMat); sh2.rotation.x = -Math.PI / 2;
  shGroup.add(sh1, sh2);
  layers.shadow.add(shGroup);

  let rot = 0;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    rot += dt * 0.16 * m;
    root.rotation.set(0.45 + Math.sin(elapsed * 0.25) * 0.15, rot, 0.28);
    anchorRoot.rotation.copy(root.rotation);
    scaleRoot.rotation.copy(root.rotation);
    shGroup.rotation.y = -rot;

    rollers.forEach((r) => {
      const t = Math.sin(elapsed * 0.75 * m + r.userData.phase) * 2.05;
      if (r.userData.axis === 0) r.position.set(t, 0.78, 0.78);
      else if (r.userData.axis === 1) r.position.set(0.78, t, -0.78);
      else r.position.set(-0.78, -0.78, t);
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wA, wB, wC], layers, update };
}

/* ============================================================================
 * 15 · 荒漠日晷方尖碑 (Meridian Obelisk — Sweeping Sundial Shadow Colossus)
 * ========================================================================== */
export function buildObeliskWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #C87653
  const inkHex = '#291611';
  const creamHex = '#F6ECD7';
  const goldHex = '#E6BD6A';
  const paleHex = '#DF9879';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#A65B3C', gridScale: 1.8 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const goldMat = createFlatMaterial(goldHex, { side: THREE.DoubleSide });

  // Towering Invisible Obelisk Shaft (4-sided tapered prism, y = 0..5.2)
  const SHAFT_H = 5.2;
  const shaftGeo = new THREE.CylinderGeometry(0.44, 0.78, SHAFT_H, 4, 1);
  shaftGeo.rotateY(Math.PI / 4);
  const shaftMesh = new THREE.Mesh(shaftGeo, phantomMat);
  shaftMesh.position.y = SHAFT_H / 2;
  group.add(shaftMesh);

  const wireShaft = makeXRayWire(shaftGeo, inkHex);
  wireShaft.position.y = SHAFT_H / 2;
  wireShaft.scale.setScalar(1.005);
  group.add(wireShaft);

  // Anchors: Gleaming Antique-Gold Pyramidion Capstone floating high in terracotta air + vertical hieroglyphic ticks + square pedestal rim
  const capGeo = new THREE.ConeGeometry(0.445, 0.92, 4);
  capGeo.rotateY(Math.PI / 4);
  const capstone = new THREE.Mesh(capGeo, goldMat);
  capstone.position.y = SHAFT_H + 0.46;
  const capCollar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.68), inkMat);
  capCollar.position.y = SHAFT_H;
  layers.anchors.add(capstone, capCollar);

  // Vertical geometric cartouche & astronomical glyph notches along all 4 faces
  for (let face = 0; face < 4; face++) {
    const fg = new THREE.Group();
    fg.rotation.y = (face * Math.PI) / 2;
    for (let i = 0; i < 12; i++) {
      const y = 0.65 + i * 0.36;
      const t = y / SHAFT_H;
      const halfW = (0.55 * (1 - t) + 0.31 * t) + 0.015;
      const glyphW = i % 3 === 0 ? 0.28 : 0.14;
      const glyph = new THREE.Mesh(new THREE.PlaneGeometry(glyphW, i % 4 === 0 ? 0.085 : 0.032), i % 3 === 0 ? creamMat : inkMat);
      glyph.position.set(0, y, halfW);
      fg.add(glyph);
    }
    layers.anchors.add(fg);
  }

  // Stepped dark espresso plinth at y = 0
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.22, 1.42), inkMat);
  plinth.position.y = 0.11;
  layers.anchors.add(plinth);

  // Shadow & Sundial Plaza: Giant flat cream-and-espresso circular sundial compass + sweeping colossal obelisk shadow!
  const dialGroup = new THREE.Group();
  dialGroup.position.y = 0.01;
  dialGroup.add(
    new THREE.Mesh(new THREE.RingGeometry(2.85, 2.94, 96), creamMat),
    new THREE.Mesh(new THREE.RingGeometry(4.15, 4.24, 96), inkMat),
    new THREE.Mesh(new THREE.RingGeometry(4.45, 4.50, 96), creamMat)
  );
  dialGroup.children.forEach((r) => { r.rotation.x = -Math.PI / 2; });

  // 24 Hour radial dial ticks
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const isMajor = i % 3 === 0;
    const tick = new THREE.Mesh(new THREE.PlaneGeometry(isMajor ? 0.06 : 0.025, isMajor ? 0.65 : 0.32), isMajor ? inkMat : creamMat);
    tick.rotation.x = -Math.PI / 2;
    tick.rotation.z = -a;
    tick.position.set(Math.sin(a) * 3.55, 0.005, Math.cos(a) * 3.55);
    dialGroup.add(tick);
  }

  // Sweeping Colossal Espresso Obelisk Cast Shadow (tapered shaft + pointed tip!)
  const shadowPivot = new THREE.Group();
  shadowPivot.position.y = 0.02;
  const obShShape = new THREE.Shape();
  obShShape.moveTo(-0.46, 0);
  obShShape.lineTo(-0.26, 4.15);
  obShShape.lineTo(0, 4.85);
  obShShape.lineTo(0.26, 4.15);
  obShShape.lineTo(0.46, 0);
  obShShape.closePath();
  const obShadow = new THREE.Mesh(new THREE.ShapeGeometry(obShShape), inkMat);
  obShadow.rotation.x = -Math.PI / 2;
  shadowPivot.add(obShadow);
  dialGroup.add(shadowPivot);
  layers.shadow.add(dialGroup);

  // Kinetic Occlusion: Warm pale-terracotta solar arcs & "MERIDIAN" lettering cleanly sliced by invisible shaft!
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 2.6, -5.2);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.78 });
  [2.5, 4.0, 5.5].forEach((rad) => {
    const pts = [];
    for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI; pts.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad - 2.2, 0)); }
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), paleLine));
  });
  const mTex = createTypographyTexture({ text: 'MERIDIAN', colorHex: '#E5A487', width: 1500, height: 340, fontSize: 185, letterSpacing: 16 });
  const mMesh = new THREE.Mesh(new THREE.PlaneGeometry(11.8, 2.6), new THREE.MeshBasicMaterial({ map: mTex, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
  mMesh.position.set(0, 1.35, 0.05);
  backPlane.add(mMesh);
  layers.kinetic.add(backPlane);

  // Scale: 5 tiny desert birds circling near the golden capstone
  const birds = [];
  for (let i = 0; i < 5; i++) {
    const b = makeBirdMesh(inkHex, 0.38);
    b.userData.phase = (i / 5) * Math.PI * 2;
    b.userData.rad = 1.65 + (i % 3) * 0.45;
    b.userData.y = 4.65 + (i % 3) * 0.42;
    layers.scale.add(b);
    birds.push(b);
  }

  let sunAng = -0.75;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    sunAng += dt * 0.24 * m;
    shadowPivot.rotation.y = sunAng;

    birds.forEach((b, idx) => {
      b.userData.phase += dt * 0.42 * m;
      const a = b.userData.phase;
      b.position.set(Math.cos(a) * b.userData.rad, b.userData.y, Math.sin(a) * b.userData.rad);
      b.rotation.y = -a;
      const f = Math.sin(elapsed * 7.2 + idx) * 0.4;
      b.userData.wingL.rotation.z = f; b.userData.wingR.rotation.z = -f;
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireShaft], layers, update };
}

/* ============================================================================
 * 16 · 沉没凯旋门与深海巨鲸 (Abyssal Arch — Triumphal Sea-Arch & Hidden Whale)
 * ========================================================================== */
export function buildAbyssalArchWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #5F8E94
  const inkHex = '#1F1818';
  const creamHex = '#F6ECD7';
  const reflHex = '#3D656B';
  const paleHex = '#82AEB3';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#467076', gridScale: 1.5 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });

  // Build true ExtrudeGeometry Triumphal Arch with a grand central arched void!
  const archShape = new THREE.Shape();
  archShape.moveTo(-2.85, 0);
  archShape.lineTo(-2.85, 4.95);
  archShape.lineTo(2.85, 4.95);
  archShape.lineTo(2.85, 0);
  archShape.lineTo(1.25, 0);
  archShape.lineTo(1.25, 2.25);
  archShape.absarc(0, 2.25, 1.25, 0, Math.PI, false);
  archShape.lineTo(-1.25, 0);
  archShape.closePath();

  const extrudeSettings = { depth: 1.55, bevelEnabled: false, curveSegments: 36 };
  const archGeo = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
  archGeo.translate(0, 0, -0.775);

  group.add(new THREE.Mesh(archGeo, phantomMat));
  const wireArch = makeXRayWire(archGeo, inkHex);
  wireArch.scale.setScalar(1.004);
  group.add(wireArch);

  // Anchors: Crisp top espresso cornice molding, attic tablet, keystone, inner coffered soffit arch ribs & plinth bases!
  const corniceTop = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.16, 1.85), inkMat); corniceTop.position.y = 4.95;
  const corniceMid = new THREE.Mesh(new THREE.BoxGeometry(5.95, 0.12, 1.78), creamMat); corniceMid.position.y = 4.05;
  const atticBand = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.42, 1.62), inkMat); atticBand.position.y = 4.50;
  layers.anchors.add(corniceTop, corniceMid, atticBand);

  // Inner arch coffered ribs curving along the vaulted opening (pure 3D SfM!)
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.58), i === 6 ? creamMat : inkMat);
    rib.position.set(Math.cos(a) * 1.24, 2.25 + Math.sin(a) * 1.24, 0);
    rib.rotation.z = a - Math.PI / 2;
    layers.anchors.add(rib);
  }
  // Pier base collars at waterline
  [-2.05, 2.05].forEach((px) => {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.18, 1.72), inkMat);
    base.position.set(px, 0.09, 0);
    layers.anchors.add(base);
  });

  // Shadow / Water Reflection: Full inverted rippling triumphal arch reflection + calm cream waterline foam!
  const reflMat = createWaterReflectionMaterial({ reflectionHex: reflHex, wallHex, waveAmp: 0.12, waveFreq: 5.0, waveSpeed: 1.5 });
  const reflArch = new THREE.Mesh(archGeo, reflMat);
  reflArch.scale.y = -0.88;
  layers.shadow.add(reflArch);

  [-2.05, 2.05].forEach((px) => {
    for (let r = 0; r < 2; r++) {
      const foam = new THREE.Mesh(new THREE.RingGeometry(1.05 + r * 0.34, 1.11 + r * 0.34, 48), createFlatMaterial(creamHex, { side: THREE.DoubleSide, transparent: true, opacity: 0.82 - r * 0.25 }));
      foam.rotation.x = -Math.PI / 2;
      foam.position.set(px, 0.012, 0);
      layers.shadow.add(foam);
    }
  });

  // Scale: Graceful unseen leviathan whale dorsal fin & curved fluke passing slowly right THROUGH the invisible archway!
  const whaleGroup = new THREE.Group();
  const finShape = new THREE.Shape();
  finShape.moveTo(-0.45, 0); finShape.quadraticCurveTo(-0.08, 0.42, 0.32, 0.56);
  finShape.quadraticCurveTo(0.18, 0.18, 0.42, 0); finShape.closePath();
  const fin = new THREE.Mesh(new THREE.ShapeGeometry(finShape), inkMat);
  fin.rotation.y = Math.PI / 2;
  const wakeRing = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.52, 40), creamMat);
  wakeRing.rotation.x = -Math.PI / 2; wakeRing.position.y = 0.015;
  whaleGroup.add(fin, wakeRing);
  layers.scale.add(whaleGroup);

  // Kinetic Occlusion: Distant pale-celadon sea horizon lines visible RIGHT THROUGH the invisible arch opening!
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 2.4, -5.6);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.72 });
  for (let i = 0; i < 6; i++) {
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, -1.8 + i * 1.1, 0), new THREE.Vector3(12, -1.8 + i * 1.1, 0)]), paleLine));
  }
  const aTex = createTypographyTexture({ text: 'ABYSSAL', colorHex: '#84B0B5', width: 1500, height: 340, fontSize: 195, letterSpacing: 16 });
  const aMesh = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), new THREE.MeshBasicMaterial({ map: aTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
  aMesh.position.set(0, 2.95, 0.05);
  backPlane.add(aMesh);
  layers.kinetic.add(backPlane);

  let whaleZ = -4.5;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    reflMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    whaleZ += dt * 0.75 * m;
    if (whaleZ > 4.8) whaleZ = -4.8;
    whaleGroup.position.set(Math.sin(whaleZ * 0.45) * 0.25, Math.sin(elapsed * 2.2) * 0.04, whaleZ);
    wakeRing.scale.setScalar(1.0 + Math.sin(elapsed * 3.0) * 0.14);
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireArch], layers, update };
}
