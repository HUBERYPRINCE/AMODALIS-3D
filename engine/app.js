import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WORLD_CONFIGS, createWorldById } from './worlds.js';

/**
 * AMODALIS 3D v2.0 — 19-World Minimalist Liquid-Glass Perceptual Engine
 * - Single-finger drag: 360° OrbitControls
 * - Two-finger horizontal swipe / horizontal wheel / bottom-bar swipe / ArrowLeft & ArrowRight:
 *   Smooth 0.45s Ganzfeld pigment crossfade + directional room glide across all 19 worlds.
 */

const canvasMount = document.getElementById('canvas-mount');
const btnXray = document.getElementById('btnXray');
const btnEpiphany = document.getElementById('btnEpiphany');
const btnTempo = document.getElementById('btnTempo');
const btnExport = document.getElementById('btnExport');
const tempoTooltip = document.getElementById('tempoTooltip');

const bottomBar = document.getElementById('bottomBar');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const sceneTrigger = document.getElementById('sceneTrigger');
const sceneIndexEl = document.getElementById('sceneIndex');
const sceneNameEl = document.getElementById('sceneName');
const pigmentDotBtn = document.getElementById('pigmentDotBtn');
const pigmentChip = document.getElementById('pigmentChip');

const v2El = document.getElementById('mV2');
const amodEl = document.getElementById('mAmod');
const mtEl = document.getElementById('mMT');
const sfmEl = document.getElementById('mSfM');

const indexPopover = document.getElementById('indexPopover');
const indexGrid = document.getElementById('indexGrid');
const epiphanyToast = document.getElementById('epiphanyToast');
const epiphanyPhaseEl = document.getElementById('epiphanyPhase');
const epiphanySubEl = document.getElementById('epiphanySub');
const toastEl = document.getElementById('toast');

// --- Renderer (CRITICAL: NoToneMapping + sRGB guarantees exact ΔL = 0 Phantom Holdout) ---
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
canvasMount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 120);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.058;
controls.enablePan = false;
controls.rotateSpeed = 0.68;
controls.zoomSpeed = 0.72;

// --- State ---
const TEMPO_ORDER = ['breathe', 'orbit', 'still'];
const TEMPO_META = {
  breathe: { label: '呼吸微动', icon: 'breathe' },
  orbit: { label: '环绕巡礼', icon: 'orbit' },
  still: { label: '绝对静止', icon: 'still' }
};

const state = {
  activeIdx: 0,
  xrayTarget: 0.0,
  xrayCurrent: 0.0,
  tempo: 'breathe',
  indexOpen: false,
  epiphany: {
    active: false,
    t: 0,
    baseCam: new THREE.Vector3(),
    baseTarget: new THREE.Vector3()
  },
  transition: {
    active: false,
    t: 1,
    duration: 0.45,
    dir: 1,
    fromColor: new THREE.Color('#79A69D'),
    toColor: new THREE.Color('#79A69D'),
    currentColor: new THREE.Color('#79A69D')
  }
};

let activeWorld = null;
const worldsCache = new Map();
const prevCamPos = new THREE.Vector3();
let smoothCamSpeed = 0;

// --- Toast ---
let toastTimer = null;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1900);
}

async function copyHex(hex) {
  try {
    await navigator.clipboard.writeText(hex);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = hex;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  showToast(`已复制复古底色 ${hex}`);
}

// --- Build 19-World Micro-Index Glass Popover ---
function renderWorldIndex() {
  indexGrid.innerHTML = '';
  WORLD_CONFIGS.forEach((w, idx) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'idx-item';
    item.dataset.idx = String(idx);
    item.setAttribute('aria-current', idx === state.activeIdx ? 'true' : 'false');
    item.innerHTML = `
      <span class="idx-dot" style="background:${w.wall}"></span>
      <span class="idx-meta">
        <span class="idx-num">${w.num} · ${w.realm}</span>
        <span class="idx-title">${w.title}</span>
      </span>
    `;
    item.addEventListener('click', () => {
      const dir = idx >= state.activeIdx ? 1 : -1;
      switchWorldByIndex(idx, dir);
      setIndexOpen(false);
    });
    indexGrid.appendChild(item);
  });
}

function setIndexOpen(open) {
  state.indexOpen = open;
  indexPopover.classList.toggle('open', open);
  sceneTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function getOrBuildWorld(id) {
  if (!worldsCache.has(id)) {
    worldsCache.set(id, createWorldById(id));
  }
  return worldsCache.get(id);
}

function syncXRayOnActiveWorld() {
  if (!activeWorld) return;
  activeWorld.phantomMaterials.forEach((mat) => {
    mat.uniforms.uDissolution.value = 1.0;
    mat.uniforms.uXRay.value = state.xrayCurrent;
  });
  activeWorld.xrayHelpers.forEach((helper) => {
    helper.visible = state.xrayCurrent > 0.02;
    if (helper.material) helper.material.opacity = state.xrayCurrent * 0.72;
  });
}

function switchWorldByIndex(targetIdx, dir = 1, instant = false) {
  const count = WORLD_CONFIGS.length;
  const nextIdx = ((targetIdx % count) + count) % count;
  if (!instant && nextIdx === state.activeIdx && activeWorld) return;

  stopEpiphany(true);

  if (activeWorld) {
    activeWorld.group.position.set(0, 0, 0);
    activeWorld.group.scale.setScalar(1);
    scene.remove(activeWorld.group);
  }

  state.activeIdx = nextIdx;
  const cfg = WORLD_CONFIGS[nextIdx];
  activeWorld = getOrBuildWorld(cfg.id);
  scene.add(activeWorld.group);

  // Smooth Ganzfeld room color crossfade
  const tr = state.transition;
  if (instant) {
    tr.active = false;
    tr.t = 1;
    tr.currentColor.set(cfg.wall);
    tr.fromColor.set(cfg.wall);
    tr.toColor.set(cfg.wall);
    scene.background = tr.currentColor.clone();
    renderer.setClearColor(tr.currentColor, 1);
  } else {
    tr.active = true;
    tr.t = 0;
    tr.dir = dir;
    tr.fromColor.copy(tr.currentColor);
    tr.toColor.set(cfg.wall);
  }

  // Sync CSS ambient color & glass intensity
  document.documentElement.style.setProperty('--wall', cfg.wall);
  document.body.setAttribute('data-theme', cfg.theme);

  // Set camera framing
  camera.position.set(...cfg.cameraPos);
  controls.target.set(...cfg.target);
  controls.minPolarAngle = cfg.minPolar;
  controls.maxPolarAngle = cfg.maxPolar;
  controls.minDistance = cfg.minDist;
  controls.maxDistance = cfg.maxDist;
  controls.update();
  prevCamPos.copy(camera.position);

  // Update ultra-slim bottom translucent strip
  sceneIndexEl.textContent = `${cfg.num}/${WORLD_CONFIGS.length}`;
  sceneNameEl.textContent = cfg.title;
  pigmentChip.style.background = cfg.wall;
  pigmentDotBtn.title = `当前底色 ${cfg.wall}（点击复制）`;

  // Highlight active item inside 19-world popover
  Array.from(indexGrid.children).forEach((el, i) => {
    el.setAttribute('aria-current', i === nextIdx ? 'true' : 'false');
  });

  syncXRayOnActiveWorld();
}

function stepWorld(delta) {
  switchWorldByIndex(state.activeIdx + delta, delta >= 0 ? 1 : -1);
}

// --- Left Vertical Liquid Glass Pill Actions ---
function setXRay(enabled) {
  state.xrayTarget = enabled ? 1.0 : 0.0;
  btnXray.setAttribute('aria-pressed', enabled ? 'true' : 'false');
}

function updateTempoButton() {
  const meta = TEMPO_META[state.tempo];
  tempoTooltip.textContent = `节律 · ${meta.label}`;
  btnTempo.dataset.tempo = state.tempo;
  btnTempo.setAttribute('aria-pressed', state.tempo === 'orbit' ? 'true' : 'false');
}

function cycleTempo() {
  stopEpiphany(true);
  const next = TEMPO_ORDER[(TEMPO_ORDER.indexOf(state.tempo) + 1) % TEMPO_ORDER.length];
  state.tempo = next;
  updateTempoButton();
  showToast(`动态节律：${TEMPO_META[next].label}`);
}

function startEpiphany() {
  if (!activeWorld) return;
  const cfg = activeWorld.config;
  setXRay(false);
  camera.position.set(...cfg.cameraPos);
  controls.target.set(...cfg.target);
  controls.update();

  state.epiphany.active = true;
  state.epiphany.t = 0;
  state.epiphany.baseCam.set(...cfg.cameraPos);
  state.epiphany.baseTarget.set(...cfg.target);

  epiphanyToast.classList.add('visible');
  btnEpiphany.setAttribute('aria-pressed', 'true');
}

function stopEpiphany(silent = false) {
  if (!state.epiphany.active) return;
  state.epiphany.active = false;
  epiphanyToast.classList.remove('visible');
  btnEpiphany.setAttribute('aria-pressed', 'false');
  if (!silent) showToast('已回到自由交互视角');
}

btnXray.addEventListener('click', () => setXRay(state.xrayTarget < 0.5));
btnEpiphany.addEventListener('click', () => (state.epiphany.active ? stopEpiphany() : startEpiphany()));
btnTempo.addEventListener('click', cycleTempo);
btnExport.addEventListener('click', () => {
  renderer.render(scene, camera);
  const cfg = WORLD_CONFIGS[state.activeIdx];
  const link = document.createElement('a');
  link.download = `AMODALIS_${cfg.num}_${cfg.id}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
  showToast(`已导出 ${cfg.num} ${cfg.title} 静帧 PNG`);
});

// Bottom bar interactions
btnPrev.addEventListener('click', (e) => { e.stopPropagation(); stepWorld(-1); });
btnNext.addEventListener('click', (e) => { e.stopPropagation(); stepWorld(1); });
sceneTrigger.addEventListener('click', (e) => { e.stopPropagation(); setIndexOpen(!state.indexOpen); });
pigmentDotBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  copyHex(WORLD_CONFIGS[state.activeIdx].wall);
});

// Close 19-world popover when clicking canvas outside
window.addEventListener('pointerdown', (e) => {
  if (state.indexOpen && !indexPopover.contains(e.target) && !bottomBar.contains(e.target)) {
    setIndexOpen(false);
  }
});

controls.addEventListener('start', () => {
  if (state.epiphany.active) stopEpiphany(true);
});

// --- Multi-Modal Horizontal Swipe Gestures (Zero Conflict with Single-Finger 3D Orbit!) ---

// 1) Trackpad two-finger horizontal swipe / horizontal mouse wheel
let wheelAccumX = 0;
let lastWheelSwitch = 0;
let wheelResetTimer = null;

window.addEventListener('wheel', (e) => {
  // Ignore when scrolling inside 19-world popover
  if (state.indexOpen && indexPopover.contains(e.target)) return;

  const absX = Math.abs(e.deltaX);
  const absY = Math.abs(e.deltaY);
  if (absX > absY * 1.25 && absX > 4) {
    e.preventDefault();
    const now = performance.now();
    if (now - lastWheelSwitch < 460) return;

    wheelAccumX += e.deltaX;
    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => { wheelAccumX = 0; }, 220);

    if (Math.abs(wheelAccumX) >= 52) {
      stepWorld(wheelAccumX > 0 ? 1 : -1);
      wheelAccumX = 0;
      lastWheelSwitch = now;
    }
  }
}, { passive: false });

// 2) Horizontal drag/swipe directly on the bottom translucent glass bar
let barDragStartX = null;
let barSwiped = false;
bottomBar.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button')) return;
  barDragStartX = e.clientX;
  barSwiped = false;
});
window.addEventListener('pointermove', (e) => {
  if (barDragStartX === null || barSwiped) return;
  const dx = e.clientX - barDragStartX;
  if (Math.abs(dx) >= 44) {
    stepWorld(dx < 0 ? 1 : -1);
    barSwiped = true;
    barDragStartX = null;
  }
});
window.addEventListener('pointerup', () => { barDragStartX = null; });

// 3) Two-finger touch horizontal swipe on touchscreens
let twoFingerStartX = null;
let twoFingerSwiped = false;
canvasMount.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    twoFingerStartX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5;
    twoFingerSwiped = false;
  }
}, { passive: true });
canvasMount.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && twoFingerStartX !== null && !twoFingerSwiped) {
    const midX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5;
    const dx = midX - twoFingerStartX;
    if (Math.abs(dx) >= 60) {
      stepWorld(dx < 0 ? 1 : -1);
      twoFingerSwiped = true;
    }
  }
}, { passive: true });
canvasMount.addEventListener('touchend', () => { twoFingerStartX = null; });

// 4) Keyboard Left / Right / X / E / Space / Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); stepWorld(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); stepWorld(-1); }
  else if (e.key === 'Escape') { setIndexOpen(false); stopEpiphany(true); }
  else if (e.key.toLowerCase() === 'x') setXRay(state.xrayTarget < 0.5);
  else if (e.key.toLowerCase() === 'e') (state.epiphany.active ? stopEpiphany() : startEpiphany());
  else if (e.code === 'Space') { e.preventDefault(); cycleTempo(); }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Minimalist HVS Telemetry Update ---
function updateTelemetry(camAngularVel, effectiveMotion) {
  const xrayPenalty = 1.0 - state.xrayCurrent * 0.55;
  const v2 = Math.min(100, Math.round((88 + Math.min(12, camAngularVel * 20)) * xrayPenalty));
  const amod = Math.min(100, Math.round((96 + Math.min(4, effectiveMotion * 4)) * (0.65 + 0.35 * xrayPenalty)));
  const mt = Math.min(100, Math.round(Math.min(1, effectiveMotion * 0.62 + camAngularVel * 2.5) * 98));
  const sfm = Math.min(100, Math.round(Math.min(1, 0.24 + effectiveMotion * 0.52 + camAngularVel * 2.4) * 96));

  v2El.textContent = String(v2);
  amodEl.textContent = String(amod);
  mtEl.textContent = String(mt);
  sfmEl.textContent = String(sfm);
}

// --- Main Loop ---
const clock = new THREE.Clock();
let elapsedAnim = 0;
let telemetryTick = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  // Smooth X-Ray interpolation
  if (Math.abs(state.xrayCurrent - state.xrayTarget) > 0.002) {
    state.xrayCurrent += (state.xrayTarget - state.xrayCurrent) * Math.min(1, dt * 7.5);
    syncXRayOnActiveWorld();
  } else if (state.xrayCurrent !== state.xrayTarget) {
    state.xrayCurrent = state.xrayTarget;
    syncXRayOnActiveWorld();
  }

  // Smooth 0.45s Ganzfeld Pigment Crossfade & Entrance Glide
  const tr = state.transition;
  if (tr.active) {
    tr.t = Math.min(1, tr.t + dt / tr.duration);
    const ease = 1 - Math.pow(1 - tr.t, 3);
    tr.currentColor.copy(tr.fromColor).lerp(tr.toColor, ease);
    scene.background = tr.currentColor;
    renderer.setClearColor(tr.currentColor, 1);

    if (activeWorld) {
      // Keep Phantom Holdout matched 100% to transitioning wall color at every frame!
      activeWorld.phantomMaterials.forEach((mat) => {
        mat.uniforms.uWallColor.value.copy(tr.currentColor);
      });
      const slide = (1 - ease) * 1.35 * tr.dir;
      activeWorld.group.position.x = slide;
      activeWorld.group.scale.setScalar(0.93 + 0.07 * ease);
    }
    if (tr.t >= 1) {
      tr.active = false;
      if (activeWorld) {
        activeWorld.group.position.x = 0;
        activeWorld.group.scale.setScalar(1);
        activeWorld.phantomMaterials.forEach((mat) => {
          mat.uniforms.uWallColor.value.copy(tr.toColor);
        });
      }
    }
  }

  let effectiveMotion = 0;

  if (state.epiphany.active) {
    state.epiphany.t += dt;
    const t = state.epiphany.t;
    const base = state.epiphany.baseCam;
    const tgt = state.epiphany.baseTarget;
    const offset = base.clone().sub(tgt);
    const radius = Math.hypot(offset.x, offset.z);
    const baseAng = Math.atan2(offset.x, offset.z);

    if (t < 1.3) {
      effectiveMotion = 0.0;
      epiphanyPhaseEl.textContent = '01 · 绝对静止';
      epiphanySubEl.textContent = 'V1 边缘检测静默，大脑开始检索格式塔锚点';
    } else if (t < 3.1) {
      const p = (t - 1.3) / 1.8;
      const ease = p * p * (3 - 2 * p);
      effectiveMotion = 0.95;
      const sway = Math.sin(ease * Math.PI) * 0.42;
      camera.position.set(tgt.x + Math.sin(baseAng + sway) * radius, base.y + Math.sin(ease * Math.PI) * 0.32, tgt.z + Math.cos(baseAng + sway) * radius);
      camera.lookAt(tgt);
      epiphanyPhaseEl.textContent = '02 · 运动遮挡唤醒';
      epiphanySubEl.textContent = 'MT/V5 纹理吞吐反馈至 V2，无形边界瞬间闭合';
    } else if (t < 6.2) {
      const p = (t - 3.1) / 3.1;
      const ease = 0.5 - 0.5 * Math.cos(p * Math.PI);
      effectiveMotion = 1.15;
      const sweep = ease * Math.PI * 0.85;
      camera.position.set(tgt.x + Math.sin(baseAng + sweep) * radius, base.y + Math.sin(ease * Math.PI) * 0.55, tgt.z + Math.cos(baseAng + sweep) * radius);
      camera.lookAt(tgt);
      epiphanyPhaseEl.textContent = '03 · 高维空间顿悟';
      epiphanySubEl.textContent = '非模态补全与投影互证完成，虚空化为实体巨构';
    } else {
      stopEpiphany(true);
    }
  } else {
    if (state.tempo === 'still') {
      effectiveMotion = 0.0;
      controls.autoRotate = false;
    } else if (state.tempo === 'breathe') {
      effectiveMotion = 0.85;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.36;
    } else {
      effectiveMotion = 1.25;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.3;
    }
    controls.update();
  }

  elapsedAnim += dt * Math.max(0, effectiveMotion);
  if (activeWorld) {
    activeWorld.update(dt, elapsedAnim, { motionScale: effectiveMotion }, camera);
  }

  const distMoved = camera.position.distanceTo(prevCamPos);
  const instSpeed = dt > 0 ? distMoved / dt : 0;
  smoothCamSpeed += (instSpeed - smoothCamSpeed) * Math.min(1, dt * 6);
  prevCamPos.copy(camera.position);

  telemetryTick += dt;
  if (telemetryTick > 0.14) {
    telemetryTick = 0;
    updateTelemetry(smoothCamSpeed, effectiveMotion);
  }

  renderer.render(scene, camera);
}

// --- Boot ---
renderWorldIndex();
updateTempoButton();
switchWorldByIndex(0, 1, true);
animate();
