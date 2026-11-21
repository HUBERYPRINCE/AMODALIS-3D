import * as THREE from 'three';

/**
 * AMODALIS 3D — Core Perceptual Shader Suite
 * Axiom I: Phantom Holdout (ΔL = 0 when dissolution = 1.0, full depthWrite = true)
 * Axiom II: Zero Pure Black (#000000) / Zero Pure White (#FFFFFF)
 * Axiom III: Hard Binary Shadows & Flat Graphic Rippling Reflections
 */

export function createPhantomMaterial({
  wallHex,
  inkHex = '#2A1713',
  shadeHex = null,
  gridScale = 2.6,
  side = THREE.FrontSide
}) {
  const wallColor = new THREE.Color(wallHex);
  const inkColor = new THREE.Color(inkHex);
  // Subtle matte gouache darker tone used ONLY when user reduces Dissolution < 1.0 (JND test)
  const revealTone = shadeHex
    ? new THREE.Color(shadeHex)
    : wallColor.clone().multiplyScalar(0.84);

  return new THREE.ShaderMaterial({
    side,
    depthWrite: true,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2,
    uniforms: {
      uWallColor: { value: wallColor },
      uRevealTone: { value: revealTone },
      uInkColor: { value: inkColor },
      uDissolution: { value: 1.0 }, // 1.0 = 100% pure ΔL=0 invisible void
      uXRay: { value: 0.0 },        // 0.0 = off, 1.0 = full blueprint reveal
      uTime: { value: 0.0 },
      uGridScale: { value: gridScale },
      uLightDir: { value: new THREE.Vector3(0.52, 0.72, 0.46).normalize() }
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      varying vec3 vViewDir;

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uWallColor;
      uniform vec3 uRevealTone;
      uniform vec3 uInkColor;
      uniform float uDissolution;
      uniform float uXRay;
      uniform float uTime;
      uniform float uGridScale;
      uniform vec3 uLightDir;

      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      varying vec3 vViewDir;

      void main() {
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vViewDir);
        float ndotl = dot(N, normalize(uLightDir));

        // 2-step flat editorial gouache shading (ONLY visible when uDissolution < 1.0)
        float cel = smoothstep(-0.08, 0.15, ndotl);
        vec3 revealedColor = mix(uRevealTone, mix(uWallColor, vec3(0.97, 0.93, 0.84), 0.18), cel);

        // At uDissolution == 1.0, output is 100.000% identical to uWallColor (ΔL = 0)
        float revealFactor = clamp(1.0 - uDissolution, 0.0, 1.0);
        vec3 col = mix(uWallColor, revealedColor, revealFactor);

        // X-Ray Perceptual Reveal Mode (reveals the hidden depth-buffer colossus!)
        if (uXRay > 0.001) {
          float fresnel = pow(1.0 - abs(dot(N, V)), 2.2);

          // Crisp architectural world-space contour scanlines
          vec3 g = abs(fract(vWorldPos * uGridScale - 0.5) - 0.5) / fwidth(vWorldPos * uGridScale);
          float gridLine = 1.0 - min(min(g.x, g.y), g.z);
          gridLine = clamp(gridLine, 0.0, 1.0);

          // Gentle vertical scan sweep
          float sweep = smoothstep(0.92, 1.0, sin(vWorldPos.y * 1.4 - uTime * 2.2) * 0.5 + 0.5);

          float xrayMask = clamp(fresnel * 0.65 + gridLine * 0.55 + sweep * 0.18, 0.0, 0.88);
          // Slight subtle tint inside shell during X-Ray so volume pops clearly
          vec3 xrayBase = mix(uWallColor, uRevealTone, 0.28);
          vec3 xrayCol = mix(xrayBase, uInkColor, xrayMask);
          col = mix(col, xrayCol, uXRay);
        }

        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `
  });
}

/**
 * Custom GLSL Flat Graphic Rippling Water Reflection Shader
 * Renders an inverted 3D silhouette strictly below y = 0 with painterly
 * Syoyo-style horizontal ripple cutouts and zero glossy 3D water realism.
 */
export function createWaterReflectionMaterial({
  reflectionHex,
  wallHex,
  waveAmp = 0.075,
  waveFreq = 5.2,
  waveSpeed = 1.55
}) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true,
    uniforms: {
      uReflColor: { value: new THREE.Color(reflectionHex) },
      uWallColor: { value: new THREE.Color(wallHex) },
      uTime: { value: 0.0 },
      uWaveAmp: { value: waveAmp },
      uWaveFreq: { value: waveFreq },
      uWaveSpeed: { value: waveSpeed }
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uWaveAmp;
      uniform float uWaveFreq;
      uniform float uWaveSpeed;

      varying vec3 vWorldPos;

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        float depthBelow = max(0.0, -worldPos.y);

        // Horizontal painterly ripple shear increasing gently with water depth
        float w1 = sin(depthBelow * uWaveFreq - uTime * uWaveSpeed);
        float w2 = cos(depthBelow * (uWaveFreq * 1.95) + uTime * (uWaveSpeed * 0.72));
        float spread = smoothstep(0.0, 0.9, depthBelow);
        worldPos.x += (w1 * 0.65 + w2 * 0.35) * uWaveAmp * spread * (1.0 + depthBelow * 0.22);
        worldPos.z += (w2 * 0.45 - w1 * 0.20) * uWaveAmp * 0.35 * spread;

        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uReflColor;
      uniform vec3 uWallColor;
      uniform float uTime;
      uniform float uWaveSpeed;

      varying vec3 vWorldPos;

      void main() {
        // Strictly clip anything above the waterline y = 0
        if (vWorldPos.y > -0.01) discard;

        float d = -vWorldPos.y;
        // Clean horizontal calm-water ripple bands (Syoyo silkscreen aesthetic)
        float band1 = sin(d * 10.5 - uTime * uWaveSpeed * 1.15);
        float band2 = sin(d * 23.0 + uTime * uWaveSpeed * 0.75 + sin(vWorldPos.x * 0.9) * 0.65);
        float rippleSlice = band1 * 0.68 + band2 * 0.32;

        // Crisp horizontal graphic cutouts increasing gently toward deeper tips
        float deepMask = smoothstep(2.4, 5.8, d);
        if (rippleSlice < -0.68 + deepMask * 0.48) discard;

        // Subtle calm horizontal sheen streaks in wall-blended reflection tint
        float streak = step(0.86, sin(d * 14.0 - uTime * 1.1 + vWorldPos.x * 0.35));
        vec3 col = mix(uReflColor, mix(uReflColor, uWallColor, 0.42), streak * 0.52);

        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `
  });
}

/**
 * Custom GLSL Razor-Sharp Binary Eclipse Crescent Shader (World 03 Planet)
 * Renders ONLY a crisp, flat espresso-brown crescent shadow tucked along the
 * lower-right limb of the invisible celestial sphere — zero soft gradient!
 */
export function createEclipseCrescentMaterial({
  inkHex = '#2B1612',
  wallHex = '#C45448'
}) {
  return new THREE.ShaderMaterial({
    side: THREE.FrontSide,
    transparent: false,
    depthWrite: true,
    depthTest: true,
    uniforms: {
      uInkColor: { value: new THREE.Color(inkHex) },
      uWallColor: { value: new THREE.Color(wallHex) },
      uShadowDir: { value: new THREE.Vector3(0.62, -0.56, -0.55).normalize() },
      uLightDir: { value: new THREE.Vector3(-0.62, 0.56, 0.55).normalize() }
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormalView;
      varying vec3 vViewDir;

      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uInkColor;
      varying vec3 vNormalView;
      varying vec3 vViewDir;

      void main() {
        vec3 N = normalize(vNormalView);
        vec3 V = normalize(vViewDir);

        // View-space lower-right rim vector for iconic graphic eclipse crescent
        vec3 limbBias = normalize(vec3(0.64, -0.66, -0.39));
        float facing = dot(N, V);
        float rim = 1.0 - clamp(facing, 0.0, 1.0);
        float sideMask = dot(N, limbBias);

        // Razor-sharp graphic crescent along lower-right limb ONLY
        float crescent = sideMask + rim * 0.58;
        if (crescent < 0.77) discard;

        gl_FragColor = vec4(uInkColor, 1.0);
        #include <colorspace_fragment>
      }
    `
  });
}

/**
 * Flat Unlit Material helper with crisp anti-black/white adherence
 */
export function createFlatMaterial(hex, opts = {}) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(hex),
    side: opts.side ?? THREE.FrontSide,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1.0,
    depthWrite: opts.depthWrite ?? true,
    depthTest: opts.depthTest ?? true,
    wireframe: opts.wireframe ?? false
  });
}

/**
 * Creates a crisp CanvasTexture for editorial background typography
 * (used for Kinetic Occlusion behind invisible monoliths!)
 */
export function createTypographyTexture({
  text,
  colorHex,
  width = 1400,
  height = 420,
  fontSize = 185,
  letterSpacing = 12,
  fontWeight = '700'
}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = colorHex;
  ctx.font = `${fontWeight} ${fontSize}px "Helvetica Neue", "Avenir Next", "PingFang SC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw with manual tracking for crisp editorial poster proportions
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + letterSpacing * Math.max(0, chars.length - 1);
  let x = (width - totalWidth) / 2;
  const y = height / 2;

  chars.forEach((ch, i) => {
    ctx.fillText(ch, x + widths[i] / 2, y);
    x += widths[i] + letterSpacing;
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}
