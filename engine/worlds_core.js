import * as THREE from 'three';
import {
  createPhantomMaterial,
  createWaterReflectionMaterial,
  createEclipseCrescentMaterial,
  createFlatMaterial,
  createTypographyTexture
} from './shaders.js';

export function makeXRayWire(geometry, inkHex, opacity = 0.0) {
  const edges = new THREE.EdgesGeometry(geometry, 18);
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(inkHex),
    transparent: true,
    opacity
  });
  const line = new THREE.LineSegments(edges, mat);
  line.visible = false;
  return line;
}

export function makeBirdMesh(inkHex, scale = 1.0) {
  const bird = new THREE.Group();
  const mat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });

  const wingShapeL = new THREE.Shape();
  wingShapeL.moveTo(0, 0);
  wingShapeL.quadraticCurveTo(-0.14, 0.09, -0.32, 0.03);
  wingShapeL.quadraticCurveTo(-0.16, -0.02, 0, -0.05);
  wingShapeL.closePath();
  const wingL = new THREE.Mesh(new THREE.ShapeGeometry(wingShapeL), mat);

  const wingShapeR = new THREE.Shape();
  wingShapeR.moveTo(0, 0);
  wingShapeR.quadraticCurveTo(0.14, 0.09, 0.32, 0.03);
  wingShapeR.quadraticCurveTo(0.16, -0.02, 0, -0.05);
  wingShapeR.closePath();
  const wingR = new THREE.Mesh(new THREE.ShapeGeometry(wingShapeR), mat);

  bird.add(wingL, wingR);
  bird.scale.setScalar(scale);
  bird.userData.wingL = wingL;
  bird.userData.wingR = wingR;
  return bird;
}

/* ============================================================================
 * 01 · 虚空巴别塔 (The Unseen Citadel)
 * ========================================================================== */
export function buildBabelWorld(cfg) {
  const group = new THREE.Group();
  const layers = {
    kinetic: new THREE.Group(),
    anchors: new THREE.Group(),
    shadow: new THREE.Group(),
    scale: new THREE.Group()
  };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall;
  const inkHex = '#2A1713';
  const creamHex = '#F6ECD7';
  const ochreHex = '#C77A44';
  const reflHex = '#4B7E76';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#5D8A81', gridScale: 1.8 });
  const R = 1.95;
  const H = 3.95;

  const cylMesh = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.02, H, 64, 1, false), phantomMat);
  cylMesh.position.y = H / 2;
  const domeMesh = new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 56, 32, 0, Math.PI * 2, 0, Math.PI * 0.5), phantomMat);
  domeMesh.position.y = H;
  group.add(cylMesh, domeMesh);

  const wireCyl = makeXRayWire(new THREE.CylinderGeometry(R * 1.003, R * 1.023, H, 24, 6), inkHex);
  wireCyl.position.y = H / 2;
  const wireDome = makeXRayWire(new THREE.SphereGeometry(R * 1.002, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), inkHex);
  wireDome.position.y = H;
  group.add(wireCyl, wireDome);

  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const ochreMat = createFlatMaterial(ochreHex, { side: THREE.DoubleSide });

  const winShape = new THREE.Shape();
  const ww = 0.145, wh = 0.25;
  winShape.moveTo(-ww, 0);
  winShape.lineTo(-ww, wh);
  winShape.absarc(0, wh, ww, Math.PI, 0, true);
  winShape.lineTo(ww, 0);
  winShape.closePath();
  const winGeo = new THREE.ShapeGeometry(winShape, 14);
  const sillGeo = new THREE.BoxGeometry(ww * 2.35, 0.045, 0.06);

  [1.45, 2.35, 3.25].forEach((ry) => {
    for (let i = 0; i < 14; i++) {
      const theta = (i / 14) * Math.PI * 2;
      const wHolder = new THREE.Group();
      const rad = R + 0.025;
      wHolder.position.set(Math.sin(theta) * rad, ry, Math.cos(theta) * rad);
      wHolder.rotation.y = theta;
      const arch = new THREE.Mesh(winGeo, inkMat);
      const sill = new THREE.Mesh(sillGeo, ochreMat);
      sill.position.set(0, -0.02, 0.01);
      wHolder.add(arch, sill);
      layers.anchors.add(wHolder);
    }
  });

  const gateOuter = new THREE.Shape();
  gateOuter.moveTo(-0.46, 0); gateOuter.lineTo(-0.46, 0.72);
  gateOuter.absarc(0, 0.72, 0.46, Math.PI, 0, true); gateOuter.lineTo(0.46, 0); gateOuter.closePath();
  const gateInner = new THREE.Shape();
  gateInner.moveTo(-0.34, 0); gateInner.lineTo(-0.34, 0.70);
  gateInner.absarc(0, 0.70, 0.34, Math.PI, 0, true); gateInner.lineTo(0.34, 0); gateInner.closePath();
  const gateGroup = new THREE.Group();
  gateGroup.add(new THREE.Mesh(new THREE.ShapeGeometry(gateOuter, 20), creamMat));
  const gateVoid = new THREE.Mesh(new THREE.ShapeGeometry(gateInner, 20), inkMat);
  gateVoid.position.z = 0.015;
  gateGroup.add(gateVoid);
  gateGroup.position.set(0, 0.01, R + 0.045);
  layers.anchors.add(gateGroup);

  const stairGroup = new THREE.Group();
  const numSteps = 38;
  const stairOuterPts = [], stairTopRailPts = [];
  for (let s = 0; s <= numSteps; s++) {
    const t = s / numSteps;
    const ang = 0.28 + (Math.PI * 0.92 - 0.28) * t;
    const sy = 0.05 + t * 2.15;
    const tread = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.032, 0.14), creamMat);
    tread.position.set(Math.sin(ang) * (R + 0.22), sy, Math.cos(ang) * (R + 0.22));
    tread.rotation.y = ang + Math.PI / 2;
    stairGroup.add(tread);
    const ox = Math.sin(ang) * (R + 0.42), oz = Math.cos(ang) * (R + 0.42);
    stairOuterPts.push(new THREE.Vector3(ox, sy, oz));
    stairTopRailPts.push(new THREE.Vector3(ox, sy + 0.24, oz));
    if (s % 2 === 0) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.24, 6), inkMat);
      post.position.set(ox, sy + 0.12, oz);
      stairGroup.add(post);
    }
  }
  stairGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stairTopRailPts), 48, 0.018, 6, false), inkMat),
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stairOuterPts), 48, 0.015, 6, false), inkMat)
  );
  layers.anchors.add(stairGroup);

  const cupola = new THREE.Group();
  cupola.position.y = H + R * 0.99;
  cupola.add(new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.08, 24), inkMat));
  const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.40, 16), creamMat);
  cupBody.position.y = 0.24;
  const cupRoof = new THREE.Mesh(new THREE.SphereGeometry(0.33, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), inkMat);
  cupRoof.position.y = 0.44;
  const finialPole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 8), inkMat);
  finialPole.position.y = 0.88;
  cupola.add(cupBody, cupRoof, finialPole);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.04), inkMat);
    win.position.set(Math.sin(a) * 0.315, 0.24, Math.cos(a) * 0.315);
    win.rotation.y = a;
    cupola.add(win);
  }

  const bannerGeo = new THREE.PlaneGeometry(1.75, 0.26, 22, 2);
  bannerGeo.translate(0.875, 0, 0);
  const bannerBasePos = bannerGeo.attributes.position.array.slice();
  const bannerMesh = new THREE.Mesh(bannerGeo, inkMat);
  bannerMesh.position.set(0.02, 1.06, 0);
  cupola.add(bannerMesh);
  layers.anchors.add(cupola);

  const reflMat = createWaterReflectionMaterial({ reflectionHex: reflHex, wallHex, waveAmp: 0.12, waveFreq: 4.8, waveSpeed: 1.6 });
  const rCyl = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.02, H, 48, 28), reflMat);
  rCyl.position.y = -H / 2;
  const rDome = new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 42, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), reflMat);
  rDome.scale.y = -1; rDome.position.y = -H;
  const rCupola = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.72, 16, 6), reflMat);
  rCupola.position.y = -(H + R * 0.99 + 0.36);
  const rBanner = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.24, 16, 2), reflMat);
  rBanner.geometry.translate(0.875, 0, 0);
  rBanner.position.set(0.02, -(H + R * 0.99 + 1.04), 0);
  layers.shadow.add(rCyl, rDome, rCupola, rBanner);

  const rippleRings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(R + 0.14 + i * 0.42, R + 0.20 + i * 0.42, 64),
      createFlatMaterial(creamHex, { side: THREE.DoubleSide, transparent: true, opacity: 0.85 - i * 0.2 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.008;
    layers.shadow.add(ring);
    rippleRings.push(ring);
  }

  const birds = [];
  for (let i = 0; i < 9; i++) {
    const b = makeBirdMesh(inkHex, 0.42 + (i % 3) * 0.1);
    b.userData.radius = R + 0.95 + (i % 4) * 0.42;
    b.userData.speed = 0.34 + (i % 3) * 0.08;
    b.userData.phase = (i / 9) * Math.PI * 2;
    b.userData.baseY = 3.8 + (i % 5) * 0.52;
    b.userData.flapPhase = i * 1.3;
    layers.kinetic.add(b);
    birds.push(b);
  }

  const horizonMat = new THREE.LineBasicMaterial({ color: new THREE.Color('#95BEB6'), transparent: true, opacity: 0.55 });
  const horizonLines = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const pts = [];
    for (let a = 0; a <= 72; a++) {
      const ang = (a / 72) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(ang) * 9.5, 0.8 + i * 1.15, Math.sin(ang) * 9.5));
    }
    horizonLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), horizonMat));
  }
  layers.kinetic.add(horizonLines);

  const boats = [];
  [{ x: -3.55, z: 0.9, s: 1.0 }, { x: -2.95, z: -0.4, s: 0.72 }, { x: 3.65, z: 0.45, s: 0.82 }].forEach((sp, idx) => {
    const boat = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.055, 0.12), inkMat);
    hull.position.y = 0.03;
    const sailShape = new THREE.Shape();
    sailShape.moveTo(-0.18, 0.07); sailShape.lineTo(0.05, 0.62); sailShape.lineTo(0.16, 0.07); sailShape.closePath();
    boat.add(hull, new THREE.Mesh(new THREE.ShapeGeometry(sailShape), creamMat));
    boat.position.set(sp.x, 0, sp.z);
    boat.scale.setScalar(sp.s);
    boat.userData.phase = idx * 2.1;
    layers.scale.add(boat);
    boats.push(boat);
  });

  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    reflMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    const pos = bannerGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const bx = bannerBasePos[i * 3], by = bannerBasePos[i * 3 + 1];
      const t = bx / 1.75;
      pos.setXYZ(i, bx, by * (1 - t * 0.35) + Math.sin(bx * 3.4 - elapsed * 3.6) * 0.075 * t, Math.cos(bx * 2.8 - elapsed * 2.9) * 0.14 * t);
    }
    pos.needsUpdate = true;

    birds.forEach((b) => {
      b.userData.phase += dt * b.userData.speed * m;
      const a = b.userData.phase, r = b.userData.radius;
      b.position.set(Math.cos(a) * r, b.userData.baseY + Math.sin(a * 2 + b.userData.flapPhase) * 0.24, Math.sin(a) * r);
      b.rotation.y = -a;
      const flap = Math.sin(elapsed * 7.5 + b.userData.flapPhase) * 0.45;
      b.userData.wingL.rotation.z = flap;
      b.userData.wingR.rotation.z = -flap;
    });

    rippleRings.forEach((ring, idx) => {
      const p = 1.0 + Math.sin(elapsed * 1.1 - idx * 1.1) * 0.028 * Math.max(0.2, m);
      ring.scale.set(p, p, 1);
    });
    boats.forEach((boat) => {
      boat.position.y = Math.sin(elapsed * 1.4 + boat.userData.phase) * 0.025;
      boat.rotation.z = Math.sin(elapsed * 1.1 + boat.userData.phase) * 0.035;
    });
    horizonLines.rotation.y = elapsed * 0.035 * m;
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireCyl, wireDome], layers, update };
}

/* ============================================================================
 * 02 · 第四维度的折痕 (The Fold of Dimension IV — True 4D Tesseract)
 * ========================================================================== */
export function buildTesseractWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall;
  const inkHex = '#2A1713';
  const creamHex = '#F6ECD7';
  const creamSideHex = '#E9DBBC';
  const terraHex = '#C65A3E';
  const paleGoldHex = '#FCE09E';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#D19328', gridScale: 1.9 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamFrontMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const creamSideMat = createFlatMaterial(creamSideHex, { side: THREE.DoubleSide });
  const terraMat = createFlatMaterial(terraHex, { side: THREE.DoubleSide });

  const CUBE_S = 2.75;
  const monolithRoot = new THREE.Group();
  monolithRoot.position.y = 0.35;
  group.add(monolithRoot);

  monolithRoot.add(new THREE.Mesh(new THREE.BoxGeometry(CUBE_S, CUBE_S, CUBE_S), phantomMat));
  const wireOuter = makeXRayWire(new THREE.BoxGeometry(CUBE_S * 1.006, CUBE_S * 1.006, CUBE_S * 1.006), inkHex);
  const wireInner = makeXRayWire(new THREE.BoxGeometry(CUBE_S * 0.52, CUBE_S * 0.52, CUBE_S * 0.52), inkHex);
  monolithRoot.add(wireOuter, wireInner);

  const anchorOnCube = new THREE.Group();
  anchorOnCube.position.copy(monolithRoot.position);
  layers.anchors.add(anchorOnCube);

  const rH = 0.56, eps = 0.022, half = CUBE_S / 2;
  const sZP = new THREE.Mesh(new THREE.PlaneGeometry(CUBE_S + eps * 2, rH), creamFrontMat); sZP.position.set(0, -0.08, half + eps);
  const sZN = new THREE.Mesh(new THREE.PlaneGeometry(CUBE_S + eps * 2, rH), creamFrontMat); sZN.position.set(0, -0.08, -(half + eps)); sZN.rotation.y = Math.PI;
  const sXP = new THREE.Mesh(new THREE.PlaneGeometry(CUBE_S + eps * 2, rH), creamSideMat); sXP.position.set(half + eps, -0.08, 0); sXP.rotation.y = Math.PI / 2;
  const sXN = new THREE.Mesh(new THREE.PlaneGeometry(CUBE_S + eps * 2, rH), creamSideMat); sXN.position.set(-(half + eps), -0.08, 0); sXN.rotation.y = -Math.PI / 2;
  anchorOnCube.add(sZP, sZN, sXP, sXN);

  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
    for (let k = -9; k <= 9; k++) {
      const ty = k * 0.135;
      if (ty > -0.38 && ty < 0.22) continue;
      const tick = new THREE.Mesh(new THREE.BoxGeometry(k % 3 === 0 ? 0.14 : 0.075, 0.018, 0.018), inkMat);
      tick.position.set(sx * (half + 0.015), ty, sz * (half + 0.015));
      tick.rotation.y = Math.atan2(sx, sz) + Math.PI / 2;
      anchorOnCube.add(tick);
    }
  });

  const bLen = 0.24, bThick = 0.028;
  [-1, 1].forEach((sx) => [-1, 1].forEach((sy) => [-1, 1].forEach((sz) => {
    const cx = sx * (half + 0.02), cy = sy * (half + 0.02), cz = sz * (half + 0.02);
    const bx = new THREE.Mesh(new THREE.BoxGeometry(bLen, bThick, bThick), inkMat); bx.position.set(cx - sx * bLen * 0.5, cy, cz);
    const by = new THREE.Mesh(new THREE.BoxGeometry(bThick, bLen, bThick), inkMat); by.position.set(cx, cy - sy * bLen * 0.5, cz);
    const bz = new THREE.Mesh(new THREE.BoxGeometry(bThick, bThick, bLen), inkMat); bz.position.set(cx, cy, cz - sz * bLen * 0.5);
    anchorOnCube.add(bx, by, bz);
  })));

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.026, 10, 96), inkMat); ring1.rotation.set(0.62, 0.45, 0.18);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.54, 0.022, 10, 96), terraMat); ring2.rotation.set(0.54, 0.52, 0.25);
  anchorOnCube.add(ring1, ring2);

  const orbitNodes = [];
  for (let i = 0; i < 3; i++) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.095 : 0.068, 16, 16), i % 2 === 0 ? creamFrontMat : inkMat);
    node.userData.radius = i === 0 ? 2.38 : 2.54;
    node.userData.speed = 0.52 + i * 0.21;
    node.userData.phase = i * 2.15;
    node.userData.ring = i === 0 ? ring1 : ring2;
    layers.scale.add(node);
    orbitNodes.push(node);
  }

  const paleLineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(paleGoldHex), transparent: true, opacity: 0.72 });
  const backPlane = new THREE.Group();
  backPlane.position.set(-1.1, 0.8, -3.8);
  backPlane.rotation.y = 0.62;
  for (let i = -9; i <= 9; i++) {
    const offset = i * 1.45;
    backPlane.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-14, offset, 0), new THREE.Vector3(14, offset + 9.2, 0)]), paleLineMat),
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(offset, -12, 0), new THREE.Vector3(offset + 8.0, 12, 0)]), paleLineMat)
    );
  }
  const typeTex = createTypographyTexture({ text: 'DIMENSION IV', colorHex: '#FCE09E', width: 1600, height: 360, fontSize: 165, letterSpacing: 14 });
  const typePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(11.6, 2.6),
    new THREE.MeshBasicMaterial({ map: typeTex, transparent: true, opacity: 0.78, depthWrite: false, side: THREE.DoubleSide })
  );
  typePlane.position.set(-0.3, 2.55, 0.05); typePlane.rotation.z = 0.56;
  backPlane.add(typePlane);

  const outerGrid = new THREE.Group();
  for (let i = -3; i <= 3; i++) {
    const pts = [];
    for (let s = 0; s <= 64; s++) {
      const a = (s / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 8.2, i * 1.55, Math.sin(a) * 8.2));
    }
    outerGrid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), paleLineMat));
  }
  layers.kinetic.add(backPlane, outerGrid);

  const verts4D = [];
  for (let i = 0; i < 16; i++) verts4D.push([(i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1, (i & 8) ? 1 : -1]);
  const edges4D = [];
  for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) {
    let d = 0; for (let k = 0; k < 4; k++) if (verts4D[i][k] !== verts4D[j][k]) d++;
    if (d === 1) edges4D.push([i, j]);
  }

  const GROUND_Y = -2.25;
  const sunDir = new THREE.Vector3(-0.46, 0.92, -0.34).normalize();
  const shadowStruts = edges4D.map(() => {
    const strut = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.24), inkMat);
    strut.rotation.x = -Math.PI / 2; strut.position.y = GROUND_Y;
    layers.shadow.add(strut);
    return strut;
  });
  const shadowJoints = verts4D.map(() => {
    const joint = new THREE.Mesh(new THREE.CircleGeometry(0.125, 12), inkMat);
    joint.rotation.x = -Math.PI / 2; joint.position.y = GROUND_Y + 0.002;
    layers.shadow.add(joint);
    return joint;
  });

  const tesseractXRayGeo = new THREE.BufferGeometry();
  tesseractXRayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges4D.length * 6), 3));
  const tesseractXRayLines = new THREE.LineSegments(tesseractXRayGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(inkHex), transparent: true, opacity: 0.0 }));
  tesseractXRayLines.visible = false;
  group.add(tesseractXRayLines);

  const tmpProj3D = verts4D.map(() => new THREE.Vector3());
  const tmpShadow2D = verts4D.map(() => new THREE.Vector3());

  function project4D(thetaXW, thetaZW, cubeRotY) {
    const cXW = Math.cos(thetaXW), sXW = Math.sin(thetaXW);
    const cZW = Math.cos(thetaZW), sZW = Math.sin(thetaZW);
    const cY = Math.cos(cubeRotY), sY = Math.sin(cubeRotY);
    for (let i = 0; i < 16; i++) {
      let [x, y, z, w] = verts4D[i];
      const x1 = x * cXW - w * sXW, w1 = x * sXW + w * cXW;
      const z2 = z * cZW - w1 * sZW, w2 = z * sZW + w1 * cZW;
      const sc = 1.65 / (3.15 - w2);
      const px = x1 * sc, py = y * sc, pz = z2 * sc;
      tmpProj3D[i].set(px * cY - pz * sY, py + 0.35, px * sY + pz * cY);
      const t = (tmpProj3D[i].y - GROUND_Y) / sunDir.y;
      tmpShadow2D[i].set(tmpProj3D[i].x - sunDir.x * t, GROUND_Y, tmpProj3D[i].z - sunDir.z * t);
      shadowJoints[i].position.set(tmpShadow2D[i].x, GROUND_Y + 0.002, tmpShadow2D[i].z);
    }
    const posAttr = tesseractXRayGeo.attributes.position;
    edges4D.forEach(([a, b], idx) => {
      const pa = tmpShadow2D[a], pb = tmpShadow2D[b];
      const dx = pb.x - pa.x, dz = pb.z - pa.z;
      const strut = shadowStruts[idx];
      strut.position.set((pa.x + pb.x) * 0.5, GROUND_Y, (pa.z + pb.z) * 0.5);
      strut.scale.set(Math.max(0.001, Math.hypot(dx, dz)), 1, 1);
      strut.rotation.set(-Math.PI / 2, 0, -Math.atan2(dz, dx));
      posAttr.setXYZ(idx * 2, tmpProj3D[a].x, tmpProj3D[a].y, tmpProj3D[a].z);
      posAttr.setXYZ(idx * 2 + 1, tmpProj3D[b].x, tmpProj3D[b].y, tmpProj3D[b].z);
    });
    posAttr.needsUpdate = true;
  }

  let rotAccum = 0;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    rotAccum += dt * 0.14 * m;
    monolithRoot.rotation.y = rotAccum;
    anchorOnCube.rotation.y = rotAccum;
    const thetaXW = 0.55 + elapsed * 0.44;
    project4D(thetaXW, 0.38 + Math.sin(thetaXW * 0.6) * 0.25, rotAccum);

    orbitNodes.forEach((n) => {
      n.userData.phase += dt * n.userData.speed * m;
      const a = n.userData.phase, r = n.userData.radius;
      const local = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0);
      local.applyEuler(n.userData.ring.rotation);
      local.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotAccum);
      local.add(monolithRoot.position);
      n.position.copy(local);
    });
    outerGrid.rotation.y = -elapsed * 0.04 * m;
  }

  project4D(0.55, 0.38, 0);
  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireOuter, wireInner, tesseractXRayLines], layers, update };
}

/* ============================================================================
 * 03 · 无形星体与引力潮汐 (Gravity of the Void)
 * ========================================================================== */
export function buildOrbitWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall;
  const inkHex = '#2B1612';
  const creamHex = '#F6ECD7';
  const salmonHex = '#DC786E';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#A64136', gridScale: 1.5 });
  const R = 2.38;
  const planetGroup = new THREE.Group();
  planetGroup.position.y = 0.08;
  group.add(planetGroup);

  planetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), phantomMat));
  const wireSphere = makeXRayWire(new THREE.SphereGeometry(R * 1.004, 24, 16), inkHex);
  planetGroup.add(wireSphere);

  const crescentMesh = new THREE.Mesh(new THREE.SphereGeometry(R * 1.009, 64, 48), createEclipseCrescentMaterial({ inkHex, wallHex }));
  crescentMesh.position.copy(planetGroup.position);
  layers.shadow.add(crescentMesh);

  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const wallMat = createFlatMaterial(wallHex, { side: THREE.DoubleSide });

  const ringSystem = new THREE.Group();
  ringSystem.position.copy(planetGroup.position);
  ringSystem.rotation.set(Math.PI * 0.41, 0.22, -0.68);
  [
    { r0: 2.95, r1: 3.16, mat: inkMat }, { r0: 3.16, r1: 3.24, mat: wallMat },
    { r0: 3.24, r1: 3.68, mat: creamMat }, { r0: 3.68, r1: 3.92, mat: inkMat },
    { r0: 3.92, r1: 4.00, mat: wallMat }, { r0: 4.00, r1: 4.18, mat: inkMat }
  ].forEach((b) => ringSystem.add(new THREE.Mesh(new THREE.RingGeometry(b.r0, b.r1, 110), b.mat)));
  layers.anchors.add(ringSystem);

  const dotGroup = new THREE.Group();
  dotGroup.position.copy(planetGroup.position);
  dotGroup.rotation.z = -0.32;
  const dotCoords = [];
  [-0.95, -0.58, -0.22, 0.16, 0.54, 0.90].forEach((lat, li) => {
    const ringR = Math.cos(lat) * (R + 0.022), y = Math.sin(lat) * (R + 0.022);
    const count = Math.max(14, Math.round(34 * Math.cos(lat)));
    for (let j = 0; j < count; j++) {
      const lon = (j / count) * Math.PI * 2 + li * 0.28;
      dotCoords.push(new THREE.Vector3(Math.cos(lon) * ringR, y, Math.sin(lon) * ringR));
    }
  });
  const dotInst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.036, 8, 8), creamMat, dotCoords.length);
  const dummy = new THREE.Object3D();
  dotCoords.forEach((p, idx) => { dummy.position.copy(p); dummy.updateMatrix(); dotInst.setMatrixAt(idx, dummy.matrix); });
  dotGroup.add(dotInst);
  layers.anchors.add(dotGroup);

  const chartLineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(salmonHex), transparent: true, opacity: 0.78 });
  const backChart = new THREE.Group();
  backChart.position.set(0, 0.1, -4.6);
  [2.6, 3.9, 5.2, 6.6].forEach((rad) => {
    const pts = [];
    for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, 0)); }
    backChart.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), chartLineMat));
  });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    backChart.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 8.4, Math.sin(a) * 8.4, 0)]), chartLineMat));
  }
  const gravTex = createTypographyTexture({ text: 'GRAVITY', colorHex: '#DF8176', width: 1500, height: 400, fontSize: 225, letterSpacing: 16 });
  const gravPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(11.4, 3.0),
    new THREE.MeshBasicMaterial({ map: gravTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide })
  );
  gravPlane.position.set(0.0, 2.75, 0.08); gravPlane.rotation.z = 0.08;
  backChart.add(gravPlane);

  const skyCage = new THREE.Mesh(
    new THREE.SphereGeometry(9.8, 18, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(salmonHex), wireframe: true, transparent: true, opacity: 0.30 })
  );
  layers.kinetic.add(backChart, skyCage);

  const moonOrbitGroup = new THREE.Group();
  moonOrbitGroup.position.copy(planetGroup.position);
  moonOrbitGroup.rotation.set(0.18, 0.0, 0.06);
  const rx = 4.45, rz = 2.65;
  const orbitPts = [];
  for (let i = 0; i <= 120; i++) { const a = (i / 120) * Math.PI * 2; orbitPts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz)); }
  moonOrbitGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineBasicMaterial({ color: new THREE.Color(inkHex) })));
  const createMoon = (r) => {
    const m = new THREE.Group();
    m.add(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 18), creamMat));
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 1.02, 18, 18, 0, Math.PI), inkMat);
    cap.rotation.y = 0.6; m.add(cap);
    return m;
  };
  const moonA = createMoon(0.16), moonB = createMoon(0.12);
  moonOrbitGroup.add(moonA, moonB);
  layers.scale.add(moonOrbitGroup);

  let spinAccum = 0, moonPhaseA = 1.9, moonPhaseB = 5.4;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    spinAccum += dt * 0.24 * m;
    dotGroup.rotation.y = spinAccum;
    ringSystem.rotation.z = -0.68 + Math.sin(elapsed * 0.35) * 0.03 * m;
    moonPhaseA += dt * 0.42 * m; moonPhaseB += dt * 0.27 * m;
    moonA.position.set(Math.cos(moonPhaseA) * rx, 0, Math.sin(moonPhaseA) * rz);
    moonB.position.set(Math.cos(moonPhaseB) * rx, 0, Math.sin(moonPhaseB) * rz);
    skyCage.rotation.y = elapsed * 0.025 * m;
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireSphere], layers, update };
}

/* ============================================================================
 * 04 · 大象无形 · 孤峰 (The Formless Peak)
 * ========================================================================== */
export function buildPeakWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall;
  const inkHex = '#2B1811';
  const mossHex = '#5C6B3F';
  const vermilionHex = '#C6543A';
  const goldHex = '#C99746';
  const reflHex = '#979E68';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#E5D3AD', gridScale: 1.5 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const mossMat = createFlatMaterial(mossHex, { side: THREE.DoubleSide });
  const vermMat = createFlatMaterial(vermilionHex, { side: THREE.DoubleSide });
  const goldMat = createFlatMaterial(goldHex, { side: THREE.DoubleSide });

  const PEAK_R = 3.25, PEAK_H = 5.15;
  const peakGeo = new THREE.ConeGeometry(PEAK_R, PEAK_H, 5, 1, false);
  const pPos = peakGeo.attributes.position;
  for (let i = 0; i < pPos.count; i++) {
    if (pPos.getY(i) < 0) {
      const px = pPos.getX(i), pz = pPos.getZ(i);
      const j = 1.0 + Math.sin(px * 2.1 + pz * 1.7) * 0.08;
      pPos.setXYZ(i, px * j, pPos.getY(i), pz * j);
    }
  }
  peakGeo.computeVertexNormals();
  const peakMesh = new THREE.Mesh(peakGeo, phantomMat); peakMesh.position.y = PEAK_H / 2;
  group.add(peakMesh);

  const wirePeak = makeXRayWire(peakGeo, inkHex);
  wirePeak.position.y = PEAK_H / 2; wirePeak.scale.setScalar(1.004);
  group.add(wirePeak);

  const slopePos = (hNorm, theta, out = 0.06) => {
    const r = (1 - hNorm) * PEAK_R * 0.88 + out;
    return new THREE.Vector3(Math.sin(theta) * r, hNorm * PEAK_H, Math.cos(theta) * r);
  };

  const makePine = (scale, useMoss) => {
    const t = new THREE.Group();
    const m = useMoss ? mossMat : inkMat;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.042, 0.42, 6), inkMat); trunk.position.y = 0.21;
    t.add(trunk);
    [{ y: 0.36, r: 0.34, h: 0.14 }, { y: 0.52, r: 0.26, h: 0.13 }, { y: 0.66, r: 0.17, h: 0.11 }].forEach((lv) => {
      const f = new THREE.Mesh(new THREE.ConeGeometry(lv.r, lv.h, 7), m); f.position.y = lv.y; t.add(f);
    });
    t.scale.setScalar(scale); return t;
  };
  const makePav = (scale) => {
    const p = new THREE.Group();
    const rf = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.16, 4), vermMat); rf.position.y = 0.24; rf.rotation.y = Math.PI / 4;
    const ev = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.035, 4), vermMat); ev.position.y = 0.17; ev.rotation.y = Math.PI / 4;
    p.add(rf, ev);
    [-0.12, 0.12].forEach((px) => [-0.12, 0.12].forEach((pz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.17, 5), vermMat); col.position.set(px, 0.085, pz); p.add(col);
    }));
    p.scale.setScalar(scale); return p;
  };

  [
    { h: 0.06, a: -0.95, s: 1.05, m: false }, { h: 0.08, a: -0.68, s: 0.82, m: true },
    { h: 0.11, a: -1.18, s: 0.90, m: false }, { h: 0.56, a: -0.45, s: 0.85, m: false },
    { h: 0.54, a: -0.25, s: 0.72, m: true }, { h: 0.20, a: 0.76, s: 0.95, m: false },
    { h: 0.24, a: 0.56, s: 0.76, m: true }, { h: 0.10, a: 1.08, s: 0.88, m: false },
    { h: 0.38, a: 2.35, s: 0.92, m: false }, { h: 0.28, a: -2.45, s: 0.85, m: true }
  ].forEach((p) => { const tr = makePine(p.s, p.m); tr.position.copy(slopePos(p.h, p.a, 0.05)); layers.anchors.add(tr); });

  [{ h: 0.32, a: -0.58, s: 1.05 }, { h: 0.55, a: -0.18, s: 0.76 }, { h: 0.22, a: 0.85, s: 0.84 }].forEach((pv) => {
    const m = makePav(pv.s); m.position.copy(slopePos(pv.h, pv.a, 0.08)); layers.anchors.add(m);
  });

  const addFissure = (pts) => layers.anchors.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.022, 5, false), goldMat));
  addFissure([slopePos(0.06, -1.05, 0.04), slopePos(0.22, -0.78, 0.04), slopePos(0.32, -0.56, 0.04), slopePos(0.41, -0.25, 0.04)]);
  addFissure([slopePos(0.32, -0.56, 0.04), slopePos(0.23, -0.20, 0.04), slopePos(0.14, -0.02, 0.04)]);
  addFissure([slopePos(0.72, 0.36, 0.04), slopePos(0.58, 0.28, 0.04), slopePos(0.45, 0.14, 0.04)]);
  addFissure([slopePos(0.58, 0.28, 0.04), slopePos(0.46, 0.42, 0.04)]);

  const buttress = new THREE.Mesh(new THREE.ConeGeometry(1.75, 2.75, 4), mossMat); buttress.position.set(1.95, 1.35, 0.38); buttress.rotation.y = 0.55;
  const buttressDark = new THREE.Mesh(new THREE.ConeGeometry(1.38, 2.15, 4), createFlatMaterial('#46522F')); buttressDark.position.set(1.42, 1.05, 0.65); buttressDark.rotation.y = 0.85;
  const leftFoot = new THREE.Mesh(new THREE.ConeGeometry(1.08, 0.52, 5), inkMat); leftFoot.position.set(-2.15, 0.24, 0.55);
  const shoreline = new THREE.Mesh(new THREE.BoxGeometry(20.0, 0.085, 0.12), inkMat); shoreline.position.set(0, 0.02, PEAK_R + 0.12);

  const reflMat = createWaterReflectionMaterial({ reflectionHex: reflHex, wallHex, waveAmp: 0.14, waveFreq: 5.0, waveSpeed: 1.45 });
  const reflPeak = new THREE.Mesh(new THREE.ConeGeometry(PEAK_R * 1.02, PEAK_H * 0.84, 24, 24), reflMat);
  reflPeak.scale.y = -1; reflPeak.position.y = -(PEAK_H * 0.84) / 2;
  layers.shadow.add(buttress, buttressDark, leftFoot, shoreline, reflPeak);

  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1.62, 64), vermMat);
  sunDisc.position.set(1.55, 3.65, -3.45);
  const scrollLineMat = new THREE.LineBasicMaterial({ color: new THREE.Color('#E3D0AA'), transparent: true, opacity: 0.72 });
  const scrollGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    scrollGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, 0.85 + i * 0.95, -5.2), new THREE.Vector3(12, 0.85 + i * 0.95, -5.2)]), scrollLineMat));
  }
  layers.kinetic.add(sunDisc, scrollGroup);

  const cranes = [];
  for (let i = 0; i < 7; i++) {
    const c = makeBirdMesh(inkHex, 0.56);
    c.userData.phase = -0.75 + i * 0.28;
    c.userData.radius = 2.15 + (i % 3) * 0.32;
    c.userData.baseY = 4.55 + Math.sin((i / 6) * Math.PI) * 0.75;
    c.userData.flapPhase = i * 0.85;
    layers.scale.add(c); cranes.push(c);
  }

  function update(dt, elapsed, params, camera) {
    phantomMat.uniforms.uTime.value = elapsed;
    reflMat.uniforms.uTime.value = elapsed;
    if (camera) sunDisc.lookAt(camera.position.x, sunDisc.position.y, camera.position.z);
    const m = params.motionScale;
    cranes.forEach((c) => {
      c.userData.phase += dt * 0.28 * m;
      const a = c.userData.phase, r = c.userData.radius;
      c.position.set(Math.sin(a) * r, c.userData.baseY + Math.sin(a * 2) * 0.14, Math.cos(a) * r);
      c.rotation.y = a + Math.PI * 0.5;
      const flap = Math.sin(elapsed * 5.8 + c.userData.flapPhase) * 0.36;
      c.userData.wingL.rotation.z = flap; c.userData.wingR.rotation.z = -flap;
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wirePeak], layers, update };
}
