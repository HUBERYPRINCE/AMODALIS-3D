import * as THREE from 'three';
import {
  createPhantomMaterial,
  createFlatMaterial,
  createTypographyTexture
} from './shaders.js';
import { makeXRayWire } from './worlds_core.js';

/**
 * Helper: build a parametric BufferGeometry cleanly (no extra addon import needed)
 */
function buildParametricGeo(fn, uSteps, vSteps) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const p = new THREE.Vector3();

  for (let iv = 0; iv <= vSteps; iv++) {
    const v = iv / vSteps;
    for (let iu = 0; iu <= uSteps; iu++) {
      const u = iu / uSteps;
      fn(u, v, p);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, v);
    }
  }
  const stride = uSteps + 1;
  for (let iv = 0; iv < vSteps; iv++) {
    for (let iu = 0; iu < uSteps; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = (iv + 1) * stride + iu;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ============================================================================
 * 05 · 克莱因之环 (Klein Void — Non-Orientable Figure-8 Klein Manifold)
 * ========================================================================== */
export function buildKleinWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #A47A96
  const inkHex = '#2A1713';
  const creamHex = '#F6ECD7';
  const paleHex = '#BF9AB2';
  const goldHex = '#D9AE68';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#845E78', gridScale: 1.6, side: THREE.DoubleSide });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const goldMat = createFlatMaterial(goldHex, { side: THREE.DoubleSide });

  const kleinPoint = (u, v, target, scale = 1.0) => {
    const U = u * Math.PI * 2;
    const V = v * Math.PI * 2;
    const R = 2.05 * scale;
    const cosU2 = Math.cos(U * 0.5), sinU2 = Math.sin(U * 0.5);
    const sinV = Math.sin(V), sin2V = Math.sin(2 * V);
    const r = R + (cosU2 * sinV - sinU2 * sin2V * 0.52) * 0.92 * scale;
    target.set(
      r * Math.cos(U),
      (sinU2 * sinV + cosU2 * sin2V * 0.52) * 1.35 * scale,
      r * Math.sin(U)
    );
  };

  const root = new THREE.Group();
  root.rotation.set(0.55, 0.2, 0.15);
  group.add(root);

  const kleinGeo = buildParametricGeo((u, v, p) => kleinPoint(u, v, p, 1.0), 72, 36);
  root.add(new THREE.Mesh(kleinGeo, phantomMat));
  const wireKlein = makeXRayWire(kleinGeo, inkHex);
  root.add(wireKlein);

  // Anchors: Two non-orientable geodesic ribbons gliding seamlessly across inside/outside!
  const anchorRoot = new THREE.Group();
  anchorRoot.rotation.copy(root.rotation);
  layers.anchors.add(anchorRoot);

  [0.0, 0.5].forEach((vOff, idx) => {
    const pts = [];
    for (let i = 0; i <= 140; i++) {
      const p = new THREE.Vector3();
      kleinPoint(i / 140, vOff + (i / 140) * 0.5, p, 1.03);
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts, false);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 140, idx === 0 ? 0.055 : 0.036, 8, false), idx === 0 ? creamMat : inkMat);
    anchorRoot.add(tube);
  });

  // Topological cross-section stitch ticks at 16 u-stations
  for (let i = 0; i < 16; i++) {
    const u = i / 16;
    const pts = [];
    for (let j = 0; j <= 16; j++) {
      const p = new THREE.Vector3();
      kleinPoint(u, 0.12 + (j / 16) * 0.28, p, 1.035);
      pts.push(p);
    }
    const seg = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.015, 5, false), i % 2 === 0 ? inkMat : goldMat);
    anchorRoot.add(seg);
  }

  // Scale: 12 orbiting pearls sliding endlessly along the non-orientable surface!
  const beads = [];
  const beadRoot = new THREE.Group();
  beadRoot.rotation.copy(root.rotation);
  layers.scale.add(beadRoot);
  for (let i = 0; i < 12; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(i % 3 === 0 ? 0.09 : 0.058, 14, 14), i % 2 === 0 ? creamMat : inkMat);
    b.userData.u = i / 12;
    b.userData.v = (i % 4) * 0.25;
    beadRoot.add(b);
    beads.push(b);
  }

  // Kinetic Occlusion: Pale-mauve concentric infinity field & "KLEIN ∞" typography
  const backGroup = new THREE.Group();
  backGroup.position.set(0, 0, -4.8);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.72 });
  for (let r = 1.6; r <= 6.8; r += 1.05) {
    const pts = [];
    for (let s = 0; s <= 90; s++) {
      const a = (s / 90) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    backGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), paleLine));
  }
  const tex = createTypographyTexture({ text: 'KLEIN  ∞', colorHex: '#C5A2B9', width: 1400, height: 340, fontSize: 185, letterSpacing: 14 });
  const tMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 2.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
  tMesh.position.set(0, 1.85, 0.06);
  backGroup.add(tMesh);
  layers.kinetic.add(backGroup);

  // Ground flat espresso shadow ellipse ring
  const shadowRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 2.55, 64), inkMat);
  shadowRing.rotation.x = -Math.PI / 2;
  shadowRing.position.set(0.35, -2.55, -0.2);
  shadowRing.scale.set(1.08, 0.88, 1);
  layers.shadow.add(shadowRing);

  let spin = 0;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    spin += dt * 0.22 * m;
    root.rotation.y = 0.2 + spin;
    anchorRoot.rotation.y = 0.2 + spin;
    beadRoot.rotation.y = 0.2 + spin;
    shadowRing.rotation.z = -spin * 0.6;

    beads.forEach((b) => {
      b.userData.u = (b.userData.u + dt * 0.075 * m) % 1.0;
      const p = new THREE.Vector3();
      kleinPoint(b.userData.u, b.userData.v + b.userData.u * 0.5, p, 1.045);
      b.position.copy(p);
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireKlein], layers, update };
}

/* ============================================================================
 * 06 · 莫比乌斯悬梯圣殿 (Möbius Ascent — One-Sided Infinite Stairway)
 * ========================================================================== */
export function buildMobiusWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #87AC92
  const inkHex = '#2A1713';
  const creamHex = '#F6ECD7';
  const terraHex = '#C86446';
  const paleHex = '#A5C6AF';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#6A8F76', gridScale: 1.8, side: THREE.DoubleSide });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const terraMat = createFlatMaterial(terraHex, { side: THREE.DoubleSide });

  const R = 2.65;
  const W = 0.92;
  const mobiusPos = (u, v, target) => {
    const t = u * Math.PI * 2;
    const s = (v - 0.5) * 2.0 * W;
    const half = t * 0.5;
    const rad = R + s * Math.cos(half);
    target.set(rad * Math.cos(t), s * Math.sin(half), rad * Math.sin(t));
  };

  const root = new THREE.Group();
  root.rotation.set(0.68, 0.3, 0.25);
  group.add(root);

  const mobGeo = buildParametricGeo(mobiusPos, 96, 16);
  root.add(new THREE.Mesh(mobGeo, phantomMat));
  const wireMob = makeXRayWire(mobGeo, inkHex);
  root.add(wireMob);

  const anchorRoot = new THREE.Group();
  anchorRoot.rotation.copy(root.rotation);
  layers.anchors.add(anchorRoot);

  // 64 Architectural Stair Treads marching seamlessly around the 180°-twisted invisible band!
  const steps = 64;
  const railPtsA = [];
  const p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), pSide = new THREE.Vector3();
  for (let i = 0; i < steps; i++) {
    const u = i / steps;
    const uNext = (i + 0.35) / steps;
    mobiusPos(u, 0.5, p0);
    mobiusPos(uNext, 0.5, p1);
    mobiusPos(u, 0.92, pSide);

    const tangent = p1.clone().sub(p0).normalize();
    const across = pSide.clone().sub(p0).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, across).normalize();

    const tread = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.042, W * 1.48), i % 8 === 0 ? terraMat : creamMat);
    const basis = new THREE.Matrix4().makeBasis(tangent, normal, across);
    tread.quaternion.setFromRotationMatrix(basis);
    tread.position.copy(p0).addScaledVector(normal, 0.045);
    anchorRoot.add(tread);

    // Subtle dark handrail along one continuous Möbius edge (wraps 4π!)
    const railP = p0.clone().addScaledVector(across, W * 0.72).addScaledVector(normal, 0.24);
    railPtsA.push(railP);
    if (i % 4 === 0) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 5), inkMat);
      post.quaternion.setFromRotationMatrix(basis);
      post.position.copy(p0).addScaledVector(across, W * 0.72).addScaledVector(normal, 0.12);
      anchorRoot.add(post);
    }
  }
  const railCurve = new THREE.CatmullRomCurve3(railPtsA, false);
  anchorRoot.add(new THREE.Mesh(new THREE.TubeGeometry(railCurve, 128, 0.02, 6, false), inkMat));

  // Scale: tiny floating glowing cream/espresso architectural lanterns gliding along the inverted stairs
  const lanterns = [];
  const scaleRoot = new THREE.Group();
  scaleRoot.rotation.copy(root.rotation);
  layers.scale.add(scaleRoot);
  for (let i = 0; i < 6; i++) {
    const lan = new THREE.Mesh(new THREE.OctahedronGeometry(0.095, 0), i % 2 === 0 ? terraMat : inkMat);
    lan.userData.u = i / 6;
    scaleRoot.add(lan);
    lanterns.push(lan);
  }

  // Kinetic Occlusion: Diagonal architectural drafting lines & "MÖBIUS"
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0.2, -5.0);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.75 });
  for (let i = -8; i <= 8; i++) {
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, i * 1.1, 0), new THREE.Vector3(12, i * 1.1 + 4.5, 0)]), paleLine));
  }
  const mTex = createTypographyTexture({ text: 'MÖBIUS', colorHex: '#ACD0B7', width: 1400, height: 340, fontSize: 195, letterSpacing: 16 });
  const mPlane = new THREE.Mesh(new THREE.PlaneGeometry(11.0, 2.6), new THREE.MeshBasicMaterial({ map: mTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
  mPlane.position.set(0, 2.0, 0.05);
  backPlane.add(mPlane);
  layers.kinetic.add(backPlane);

  // Hard espresso cast loop shadow below
  const shadowLoop = new THREE.Mesh(new THREE.RingGeometry(1.75, 2.68, 64), inkMat);
  shadowLoop.rotation.x = -Math.PI / 2;
  shadowLoop.position.set(0.3, -2.85, -0.2);
  shadowLoop.scale.set(1.12, 0.72, 1);
  layers.shadow.add(shadowLoop);

  let rot = 0;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    rot += dt * 0.2 * m;
    root.rotation.y = 0.3 + rot;
    anchorRoot.rotation.y = 0.3 + rot;
    scaleRoot.rotation.y = 0.3 + rot;
    shadowLoop.rotation.z = -rot;

    lanterns.forEach((lan) => {
      lan.userData.u = (lan.userData.u + dt * 0.055 * m) % 1.0;
      const u = lan.userData.u;
      mobiusPos(u, 0.5, p0);
      mobiusPos((u + 0.01) % 1, 0.5, p1);
      mobiusPos(u, 0.9, pSide);
      const t = p1.clone().sub(p0).normalize();
      const ac = pSide.clone().sub(p0).normalize();
      const n = new THREE.Vector3().crossVectors(t, ac).normalize();
      lan.position.copy(p0).addScaledVector(n, 0.24);
      lan.rotation.y = elapsed * 1.4;
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireMob], layers, update };
}

/* ============================================================================
 * 07 · 二十四胞体星笼 (24-Cell Hypercage — True 4D Regular Polychoron!)
 * ========================================================================== */
export function buildCell24World(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #6F90A8
  const inkHex = '#231917';
  const creamHex = '#F6ECD7';
  const ochreHex = '#D99E52';
  const paleHex = '#90AFC5';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#56758C', gridScale: 1.7 });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const ochreMat = createFlatMaterial(ochreHex, { side: THREE.DoubleSide });

  // Invisible central regular octahedron core (ΔL = 0)
  const coreGeo = new THREE.OctahedronGeometry(2.15, 0);
  const coreMesh = new THREE.Mesh(coreGeo, phantomMat);
  coreMesh.position.y = 0.4;
  group.add(coreMesh);
  const wireCore = makeXRayWire(new THREE.OctahedronGeometry(2.16, 0), inkHex);
  wireCore.position.y = 0.4;
  group.add(wireCore);

  // Build exact 24 vertices of the 4D 24-Cell: all permutations of (±1, ±1, 0, 0)
  const verts4D = [];
  const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  pairs.forEach(([a, b]) => {
    [-1, 1].forEach((sa) => [-1, 1].forEach((sb) => {
      const v = [0, 0, 0, 0];
      v[a] = sa; v[b] = sb;
      verts4D.push(v);
    }));
  });
  // Edges connect vertices at Euclidean distance sqrt(2) -> squared distance == 2
  const edges4D = [];
  for (let i = 0; i < verts4D.length; i++) {
    for (let j = i + 1; j < verts4D.length; j++) {
      let d2 = 0;
      for (let k = 0; k < 4; k++) d2 += (verts4D[i][k] - verts4D[j][k]) ** 2;
      if (Math.abs(d2 - 2) < 0.01) edges4D.push([i, j]);
    }
  }

  // 24 cream & ochre vertex pearls in 3D space (partially occluded by invisible octahedron core!)
  const vertexSpheres = verts4D.map((_, i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(i % 3 === 0 ? 0.11 : 0.075, 14, 14), i % 3 === 0 ? ochreMat : creamMat);
    layers.anchors.add(s);
    return s;
  });

  // 96 razor-crisp projected 4D edge lines (occluded cleanly whenever passing behind hidden core!)
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges4D.length * 6), 3));
  const edgeLines = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(inkHex) }));
  layers.anchors.add(edgeLines);

  // Ground projected flat espresso 24-Cell shadow!
  const GROUND_Y = -2.35;
  const sunDir = new THREE.Vector3(-0.35, 0.92, -0.25).normalize();
  const shadowGeo = new THREE.BufferGeometry();
  shadowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges4D.length * 6), 3));
  const shadowLines = new THREE.LineSegments(shadowGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(inkHex) }));
  layers.shadow.add(shadowLines);

  const shadowDots = verts4D.map(() => {
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.085, 10), inkMat);
    dot.rotation.x = -Math.PI / 2;
    dot.position.y = GROUND_Y;
    layers.shadow.add(dot);
    return dot;
  });

  // Kinetic Occlusion: Celestial square astrolabe grid + "CELL 24" behind
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0.35, -5.2);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.72 });
  for (let i = -6; i <= 6; i++) {
    backPlane.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-9, i * 1.25, 0), new THREE.Vector3(9, i * 1.25, 0)]), paleLine),
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 1.25, -8, 0), new THREE.Vector3(i * 1.25, 8, 0)]), paleLine)
    );
  }
  const cTex = createTypographyTexture({ text: 'CELL 24', colorHex: '#93B3C9', width: 1400, height: 340, fontSize: 195, letterSpacing: 16 });
  const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 2.5), new THREE.MeshBasicMaterial({ map: cTex, transparent: true, opacity: 0.86, depthWrite: false, side: THREE.DoubleSide }));
  cMesh.position.set(0, 2.35, 0.05);
  backPlane.add(cMesh);
  layers.kinetic.add(backPlane);

  // Scale: subtle outer measuring ring
  const outerHalo = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.016, 8, 96), creamMat);
  outerHalo.position.y = 0.4;
  outerHalo.rotation.x = Math.PI * 0.44;
  layers.scale.add(outerHalo);

  const proj3D = verts4D.map(() => new THREE.Vector3());
  const projSh = verts4D.map(() => new THREE.Vector3());

  function project24(tXW, tYZ) {
    const c1 = Math.cos(tXW), s1 = Math.sin(tXW);
    const c2 = Math.cos(tYZ), s2 = Math.sin(tYZ);
    for (let i = 0; i < verts4D.length; i++) {
      let [x, y, z, w] = verts4D[i];
      const x1 = x * c1 - w * s1, w1 = x * s1 + w * c1;
      const y2 = y * c2 - z * s2, z2 = y * s2 + z * c2;
      const sc = 3.55 / (3.1 - w1);
      proj3D[i].set(x1 * sc, y2 * sc + 0.4, z2 * sc);
      vertexSpheres[i].position.copy(proj3D[i]);

      const t = (proj3D[i].y - GROUND_Y) / sunDir.y;
      projSh[i].set(proj3D[i].x - sunDir.x * t, GROUND_Y, proj3D[i].z - sunDir.z * t);
      shadowDots[i].position.set(projSh[i].x, GROUND_Y, projSh[i].z);
    }
    const ePos = edgeGeo.attributes.position;
    const sPos = shadowGeo.attributes.position;
    edges4D.forEach(([a, b], idx) => {
      ePos.setXYZ(idx * 2, proj3D[a].x, proj3D[a].y, proj3D[a].z);
      ePos.setXYZ(idx * 2 + 1, proj3D[b].x, proj3D[b].y, proj3D[b].z);
      sPos.setXYZ(idx * 2, projSh[a].x, GROUND_Y, projSh[a].z);
      sPos.setXYZ(idx * 2 + 1, projSh[b].x, GROUND_Y, projSh[b].z);
    });
    ePos.needsUpdate = true;
    sPos.needsUpdate = true;
  }

  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    coreMesh.rotation.y = elapsed * 0.16 * m;
    wireCore.rotation.y = coreMesh.rotation.y;
    outerHalo.rotation.z = elapsed * 0.12 * m;
    project24(0.45 + elapsed * 0.34, 0.35 + elapsed * 0.21);
  }

  project24(0.45, 0.35);
  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireCore], layers, update };
}

/* ============================================================================
 * 08 · 卡拉比-丘弦论折面 (Calabi-Yau Fold — 6-Fold Pinched Manifold)
 * ========================================================================== */
export function buildCalabiYauWorld(cfg) {
  const group = new THREE.Group();
  const layers = { kinetic: new THREE.Group(), anchors: new THREE.Group(), shadow: new THREE.Group(), scale: new THREE.Group() };
  group.add(layers.kinetic, layers.anchors, layers.shadow, layers.scale);

  const wallHex = cfg.wall; // #E58D8C
  const inkHex = '#2B1614';
  const creamHex = '#F6ECD7';
  const goldHex = '#E8BE6E';
  const paleHex = '#F1ADAC';

  const phantomMat = createPhantomMaterial({ wallHex, inkHex, shadeHex: '#C6706F', gridScale: 1.9, side: THREE.DoubleSide });
  const inkMat = createFlatMaterial(inkHex, { side: THREE.DoubleSide });
  const creamMat = createFlatMaterial(creamHex, { side: THREE.DoubleSide });
  const goldMat = createFlatMaterial(goldHex, { side: THREE.DoubleSide });

  // Sculptural 6-fold Calabi-Yau quintic inspired harmonic manifold
  const cyPoint = (u, v, target, scale = 1.0) => {
    const phi = u * Math.PI * 2;
    const theta = v * Math.PI;
    const lobe = 1.0 + 0.34 * Math.cos(5 * phi) * Math.sin(theta) + 0.22 * Math.sin(3 * theta) * Math.cos(2 * phi);
    const r = 1.92 * lobe * scale;
    target.set(
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.cos(theta) * (1.0 + 0.18 * Math.cos(5 * phi)),
      r * Math.sin(theta) * Math.sin(phi)
    );
  };

  const root = new THREE.Group();
  group.add(root);
  const cyGeo = buildParametricGeo((u, v, p) => cyPoint(u, v, p, 1.0), 80, 44);
  root.add(new THREE.Mesh(cyGeo, phantomMat));
  const wireCY = makeXRayWire(cyGeo, inkHex);
  root.add(wireCY);

  const anchorRoot = new THREE.Group();
  layers.anchors.add(anchorRoot);

  // 5 Crisp vibrating golden-cream & espresso string-theory geodesic seams hugging the invisible lobes
  for (let k = 0; k < 5; k++) {
    const phiBase = k / 5;
    const pts = [];
    for (let s = 2; s <= 46; s++) {
      const p = new THREE.Vector3();
      cyPoint(phiBase + Math.sin((s / 48) * Math.PI) * 0.04, s / 48, p, 1.028);
      pts.push(p);
    }
    anchorRoot.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.026, 6, false), k % 2 === 0 ? inkMat : creamMat));
  }
  // 2 equatorial pinched latitude loops
  [0.34, 0.66].forEach((vLat, idx) => {
    const pts = [];
    for (let s = 0; s <= 90; s++) {
      const p = new THREE.Vector3();
      cyPoint(s / 90, vLat, p, 1.026);
      pts.push(p);
    }
    anchorRoot.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, 0.022, 6, true), idx === 0 ? goldMat : inkMat));
  });

  // Standing-wave resonance pearls along the hidden folds
  const nodes = [];
  const scaleRoot = new THREE.Group();
  layers.scale.add(scaleRoot);
  for (let i = 0; i < 15; i++) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 12), i % 3 === 0 ? inkMat : creamMat);
    n.userData.u = i / 15;
    n.userData.v = 0.25 + (i % 5) * 0.125;
    scaleRoot.add(n);
    nodes.push(n);
  }

  // Kinetic Occlusion: Diagonal pale-coral "STRING VI" & harmonic wave ruling lines
  const backPlane = new THREE.Group();
  backPlane.position.set(0, 0.1, -5.0);
  const paleLine = new THREE.LineBasicMaterial({ color: new THREE.Color(paleHex), transparent: true, opacity: 0.78 });
  for (let i = -5; i <= 5; i++) {
    const pts = [];
    for (let x = -10; x <= 10; x += 0.5) pts.push(new THREE.Vector3(x, i * 1.15 + Math.sin(x * 0.7 + i) * 0.28, 0));
    backPlane.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), paleLine));
  }
  const sTex = createTypographyTexture({ text: 'STRING VI', colorHex: '#F3B4B3', width: 1500, height: 340, fontSize: 188, letterSpacing: 15 });
  const sMesh = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 2.5), new THREE.MeshBasicMaterial({ map: sTex, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
  sMesh.position.set(0, 1.95, 0.06); sMesh.rotation.z = -0.14;
  backPlane.add(sMesh);
  layers.kinetic.add(backPlane);

  // Petal-like crisp espresso cast shadow below
  const petalShape = new THREE.Shape();
  for (let i = 0; i <= 80; i++) {
    const a = (i / 80) * Math.PI * 2;
    const r = 1.95 * (1 + 0.26 * Math.cos(5 * a));
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    if (i === 0) petalShape.moveTo(px, py); else petalShape.lineTo(px, py);
  }
  const shadowPetal = new THREE.Mesh(new THREE.ShapeGeometry(petalShape), inkMat);
  shadowPetal.rotation.x = -Math.PI / 2;
  shadowPetal.position.set(0.3, -2.75, -0.2);
  layers.shadow.add(shadowPetal);

  let rot = 0;
  function update(dt, elapsed, params) {
    phantomMat.uniforms.uTime.value = elapsed;
    const m = params.motionScale;
    rot += dt * 0.22 * m;
    root.rotation.set(Math.sin(elapsed * 0.35) * 0.22, rot, Math.cos(elapsed * 0.28) * 0.14);
    anchorRoot.rotation.copy(root.rotation);
    scaleRoot.rotation.copy(root.rotation);
    shadowPetal.rotation.z = -rot;

    nodes.forEach((n, idx) => {
      const p = new THREE.Vector3();
      const vib = 1.04 + Math.sin(elapsed * 2.8 + idx) * 0.035;
      cyPoint((n.userData.u + elapsed * 0.03 * m) % 1, n.userData.v, p, vib);
      n.position.copy(p);
    });
  }

  return { group, phantomMaterials: [phantomMat], xrayHelpers: [wireCY], layers, update };
}
