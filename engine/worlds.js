import {
  buildBabelWorld,
  buildTesseractWorld,
  buildOrbitWorld,
  buildPeakWorld
} from './worlds_core.js';
import {
  buildKleinWorld,
  buildMobiusWorld,
  buildCell24World,
  buildCalabiYauWorld
} from './worlds_topology.js';
import {
  buildKerrHorizonWorld,
  buildDysonWorld,
  buildWormholeWorld,
  buildRocheBinaryWorld
} from './worlds_cosmos.js';
import {
  buildPantheonWorld,
  buildEscherWorld,
  buildObeliskWorld,
  buildAbyssalArchWorld
} from './worlds_architecture.js';
import {
  buildArmillaryWorld,
  buildBellWorld,
  buildCongWorld
} from './worlds_east.js';

/**
 * AMODALIS 3D — 19 Curated Higher-Dimensional Worlds Registry
 * 19 distinct vintage mineral pigments, strictly zero #000000 and zero #FFFFFF.
 */
export const WORLD_CONFIGS = [
  // --- 经典四境 (01-04) ---
  {
    id: 'babel', num: '01', realm: '神圣巨构', title: '虚空巴别塔', en: 'The Unseen Citadel',
    wall: '#79A69D', theme: 'light-wall',
    cameraPos: [0.0, 2.75, 17.6], target: [0.0, 1.15, 0.0],
    minPolar: 0.32, maxPolar: Math.PI * 0.488, minDist: 9.0, maxDist: 25.0,
    builder: buildBabelWorld
  },
  {
    id: 'tesseract', num: '02', realm: '高维拓扑', title: '第四维度的折痕', en: 'The Fold of Dimension IV',
    wall: '#EEB241', theme: 'light-wall',
    cameraPos: [7.1, 4.9, 8.6], target: [0.15, -0.35, 0.0],
    minPolar: 0.18, maxPolar: Math.PI * 0.85, minDist: 6.5, maxDist: 20.0,
    builder: buildTesseractWorld
  },
  {
    id: 'orbit', num: '03', realm: '相对论宇宙', title: '无形星体与引力潮汐', en: 'Gravity of the Void',
    wall: '#C45448', theme: 'dark-wall',
    cameraPos: [0.35, 1.35, 13.8], target: [0.0, 0.12, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 7.5, maxDist: 21.0,
    builder: buildOrbitWorld
  },
  {
    id: 'peak', num: '04', realm: '东方宇宙观', title: '大象无形 · 孤峰', en: 'The Formless Peak',
    wall: '#F8E9C9', theme: 'light-wall',
    cameraPos: [0.0, 2.35, 16.2], target: [0.0, 0.85, 0.0],
    minPolar: 0.32, maxPolar: Math.PI * 0.488, minDist: 8.5, maxDist: 24.0,
    builder: buildPeakWorld
  },

  // --- 高维拓扑与非欧流形 (+4 境 · 05-08) ---
  {
    id: 'klein', num: '05', realm: '高维拓扑', title: '克莱因之环', en: 'Klein Void Manifold',
    wall: '#A47A96', theme: 'dark-wall',
    cameraPos: [0.6, 2.4, 12.6], target: [0.0, -0.1, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 6.5, maxDist: 20.0,
    builder: buildKleinWorld
  },
  {
    id: 'mobius', num: '06', realm: '高维拓扑', title: '莫比乌斯悬梯圣殿', en: 'Möbius Ascent',
    wall: '#87AC92', theme: 'light-wall',
    cameraPos: [0.8, 2.6, 13.2], target: [0.0, -0.15, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 6.5, maxDist: 21.0,
    builder: buildMobiusWorld
  },
  {
    id: 'cell24', num: '07', realm: '高维拓扑', title: '二十四胞体星笼', en: '24-Cell Hypercage',
    wall: '#6F90A8', theme: 'dark-wall',
    cameraPos: [1.2, 2.8, 13.8], target: [0.0, 0.0, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 7.0, maxDist: 22.0,
    builder: buildCell24World
  },
  {
    id: 'calabiyau', num: '08', realm: '高维拓扑', title: '卡拉比-丘弦论折面', en: 'Calabi-Yau Fold',
    wall: '#E58D8C', theme: 'light-wall',
    cameraPos: [0.4, 2.1, 12.2], target: [0.0, -0.1, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 6.5, maxDist: 20.0,
    builder: buildCalabiYauWorld
  },

  // --- 相对论宇宙与天体伟力 (+4 境 · 09-12) ---
  {
    id: 'kerr', num: '09', realm: '相对论宇宙', title: '克尔事件视界', en: 'Kerr Horizon',
    wall: '#DF8952', theme: 'light-wall',
    cameraPos: [0.2, 1.35, 13.4], target: [0.0, 0.05, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 7.0, maxDist: 21.0,
    builder: buildKerrHorizonWorld
  },
  {
    id: 'dyson', num: '10', realm: '相对论宇宙', title: '戴森环穹阵列', en: 'Dyson Aperture',
    wall: '#687849', theme: 'dark-wall',
    cameraPos: [0.6, 1.85, 13.6], target: [0.0, 0.05, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 7.0, maxDist: 22.0,
    builder: buildDysonWorld
  },
  {
    id: 'wormhole', num: '11', realm: '相对论宇宙', title: '爱因斯坦-罗森虫洞井', en: 'Spacetime Throat',
    wall: '#7C9EA8', theme: 'light-wall',
    cameraPos: [0.8, 1.45, 14.2], target: [0.0, -0.1, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 7.5, maxDist: 22.0,
    builder: buildWormholeWorld
  },
  {
    id: 'roche', num: '12', realm: '相对论宇宙', title: '双星洛希潮汐锁', en: 'Roche Binary Lock',
    wall: '#9A6B84', theme: 'dark-wall',
    cameraPos: [0.3, 2.35, 14.4], target: [0.0, 0.0, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 7.5, maxDist: 22.0,
    builder: buildRocheBinaryWorld
  },

  // --- 神圣巨构与阈限建筑 (+4 境 · 13-16) ---
  {
    id: 'pantheon', num: '13', realm: '神圣巨构', title: '虚空万神殿', en: 'Unseen Pantheon',
    wall: '#C6A882', theme: 'light-wall',
    cameraPos: [0.0, 3.85, 16.4], target: [0.0, 2.05, 0.0],
    minPolar: 0.25, maxPolar: Math.PI * 0.488, minDist: 8.5, maxDist: 24.0,
    builder: buildPantheonWorld
  },
  {
    id: 'escher', num: '14', realm: '神圣巨构', title: '逆重力无尽回廊', en: 'Escher Cloister',
    wall: '#CE8C7E', theme: 'light-wall',
    cameraPos: [2.2, 2.6, 13.2], target: [0.0, 0.0, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 6.5, maxDist: 21.0,
    builder: buildEscherWorld
  },
  {
    id: 'obelisk', num: '15', realm: '神圣巨构', title: '荒漠日晷方尖碑', en: 'Meridian Obelisk',
    wall: '#C87653', theme: 'dark-wall',
    cameraPos: [3.2, 4.8, 15.8], target: [0.0, 2.1, 0.0],
    minPolar: 0.22, maxPolar: Math.PI * 0.485, minDist: 8.5, maxDist: 25.0,
    builder: buildObeliskWorld
  },
  {
    id: 'abyssal', num: '16', realm: '神圣巨构', title: '沉没凯旋门与深海巨鲸', en: 'Abyssal Arch',
    wall: '#5F8E94', theme: 'dark-wall',
    cameraPos: [0.0, 2.8, 19.6], target: [0.0, 0.75, 0.0],
    minPolar: 0.30, maxPolar: Math.PI * 0.488, minDist: 9.0, maxDist: 27.0,
    builder: buildAbyssalArchWorld
  },

  // --- 东方高维宇宙观与意识器物 (+3 境 · 17-19) ---
  {
    id: 'armillary', num: '17', realm: '东方宇宙观', title: '太初隐形浑天仪', en: 'Primordial Armillary',
    wall: '#859A8B', theme: 'light-wall',
    cameraPos: [0.8, 1.85, 16.0], target: [0.0, -0.25, 0.0],
    minPolar: 0.15, maxPolar: Math.PI * 0.88, minDist: 8.0, maxDist: 24.0,
    builder: buildArmillaryWorld
  },
  {
    id: 'bell', num: '18', realm: '东方宇宙观', title: '无形大梵古钟', en: 'Bell of Silence',
    wall: '#B89C6D', theme: 'light-wall',
    cameraPos: [0.4, 1.75, 14.4], target: [0.0, 0.25, 0.0],
    minPolar: 0.20, maxPolar: Math.PI * 0.65, minDist: 7.5, maxDist: 22.0,
    builder: buildBellWorld
  },
  {
    id: 'cong', num: '19', realm: '东方宇宙观', title: '天圆地方 · 玉琮祭坛', en: 'Cong Cosmogram',
    wall: '#EBE2CE', theme: 'light-wall',
    cameraPos: [4.6, 4.1, 11.4], target: [0.0, 0.1, 0.0],
    minPolar: 0.18, maxPolar: Math.PI * 0.68, minDist: 6.5, maxDist: 20.0,
    builder: buildCongWorld
  }
];

export function createWorldById(id) {
  const cfg = WORLD_CONFIGS.find((w) => w.id === id) || WORLD_CONFIGS[0];
  return { config: cfg, ...cfg.builder(cfg) };
}
