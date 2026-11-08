import * as THREE from "three";

export type FaceSpec = {
  src?: string;
  photo?: string;
  /** 0 is black, 1 is white, 2 is the brand gradient, 3 is a photo. */
  style: 0 | 1 | 2 | 3;
  ink?: string;
  accent?: string;
};

export type FlipState = { x: number; y: number; size: number; p: number; expand: number; tiltX: number; tiltY: number };

const RADIUS = 0.225;
const DEPTH = 0.075;
const TEXTURE_SIZE = 1024;

const vertexShader = /* glsl */ `
  uniform float uTurn;
  varying vec3 vP;
  varying float vCap;
  varying vec3 vView;
  varying mat3 vNM;

  void main() {
    vec3 p = position;
    vP = p;
    vCap = normal.z;
    vNM = normalMatrix;
    // The card bends and its far edges flare while it turns.
    p.z += uTurn * 0.34 * (p.x * p.x * 4.0 - 0.5);
    p.y *= 1.0 + uTurn * 0.6 * abs(p.x);
    p.x *= 1.0 - uTurn * 0.06;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexF;
  uniform sampler2D uTexB;
  uniform float uStyleF;
  uniform float uStyleB;
  uniform vec3 uAccF;
  uniform vec3 uAccB;
  uniform vec3 uInkF;
  uniform vec3 uInkB;
  uniform float uLogo;
  uniform float uExpand;
  uniform float uTurn;
  uniform float uRadius;
  uniform vec2 uLight;
  varying vec3 vP;
  varying float vCap;
  varying vec3 vView;
  varying mat3 vNM;

  float sdBox(vec2 p, float b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  vec2 sdGrad(vec2 p, float b, float r) {
    vec2 w = abs(p) - b + r;
    vec2 q = max(w, 0.0);
    float l = length(q);
    vec2 g = l > 0.0 ? q / l : (w.x > w.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
    return sign(p) * g;
  }

  vec3 env(vec3 r) {
    vec3 sky = mix(vec3(0.05), vec3(0.5), smoothstep(-0.5, 1.0, r.y));
    float key = smoothstep(0.7, 0.98, dot(r, normalize(vec3(-0.35 + uLight.x, 0.55 + uLight.y, 0.75))));
    float fill = smoothstep(0.82, 1.0, dot(r, normalize(vec3(0.85, -0.1, 0.5))));
    float strip = smoothstep(0.08, 0.0, abs(r.x - 0.32 + r.y * 0.45)) * smoothstep(0.0, 0.5, r.z);
    return sky * 0.32 + key * 1.5 + fill * 0.45 + strip * 0.3;
  }

  void main() {
    bool cap = abs(vCap) > 0.5;
    bool front = vCap > 0.0;
    float facing = front ? 1.0 : -1.0;
    float d = sdBox(vP.xy, 0.5, uRadius);
    vec2 g = sdGrad(vP.xy, 0.5, uRadius);
    float rim = cap ? smoothstep(-0.03, 0.0, d) : 1.0;
    vec3 nO = cap
      ? normalize(vec3(g * rim * 0.85 - vec2(uTurn * 1.2 * vP.x * facing, 0.0), facing * (1.0 - rim * 0.5)))
      : normalize(vec3(g, 0.0));
    vec3 N = normalize(vNM * nO);
    vec3 V = normalize(vView);
    vec3 R = reflect(-V, N);
    float ndv = max(dot(N, V), 0.0);
    float fres = pow(1.0 - ndv, 3.0);
    float diffuse = max(dot(N, normalize(vec3(-0.3, 0.5, 0.8))), 0.0);

    float style = front ? uStyleF : uStyleB;
    vec3 accent = front ? uAccF : uAccB;
    vec3 ink = front ? uInkF : uInkB;
    vec2 uv = vec2(front ? vP.x + 0.5 : 0.5 - vP.x, vP.y + 0.5);
    float bias = uTurn * 4.5;
    vec4 tex = vec4(0.0);
    if (cap) {
      tex = front ? texture2D(uTexF, uv, bias) : texture2D(uTexB, uv, bias);
    }

    vec3 col;
    if (style < 0.5) {
      col = vec3(0.035) + env(R) * (0.12 + fres * 0.9) * (1.0 - uExpand * 0.8);
    } else if (style < 1.5) {
      col = vec3(0.96) * (0.74 + diffuse * 0.28) + env(R) * (0.05 + fres * 0.5) * (1.0 - uExpand);
    } else if (style < 2.5) {
      // Navy with teal and blue corners, like the Webacy brand image.
      float teal = smoothstep(0.55, 1.3, uv.x * 0.75 + (1.0 - uv.y) * 0.85);
      float blue = smoothstep(0.75, 1.35, (1.0 - uv.x) * 0.7 + (1.0 - uv.y) * 0.8);
      col = mix(vec3(0.105, 0.11, 0.3), vec3(0.05, 0.78, 0.85), teal);
      col = mix(col, vec3(0.25, 0.32, 0.72), blue * 0.75);
      col += env(R) * (0.1 + fres * 0.9) * (1.0 - uExpand);
    } else {
      col = tex.rgb * (0.94 + diffuse * 0.08) + env(R) * (0.04 + fres * 0.6);
    }

    if (style < 2.5) {
      col = mix(col, ink, tex.r * (1.0 - rim) * uLogo);
      col = mix(col, accent, tex.g * (1.0 - rim) * uLogo);
    }
    if (!cap) col = (style > 0.5 && style < 1.5 ? vec3(0.8) : vec3(0.08)) + env(R) * 0.45;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const shadowFragment = /* glsl */ `
  precision highp float;
  uniform float uAlpha;
  varying vec2 vUv;
  float sdBox(vec2 p, float b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }
  void main() {
    float d = sdBox(vUv - 0.5, 0.34, 0.1);
    gl_FragColor = vec4(vec3(0.0), (1.0 - smoothstep(-0.14, 0.14, d)) * 0.26 * uAlpha);
  }
`;

function roundedSlab() {
  const geometry = new THREE.BoxGeometry(1, 1, DEPTH, 96, 96, 1);
  const position = geometry.attributes.position;
  const inner = 0.5 - RADIUS;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const cx = THREE.MathUtils.clamp(x, -inner, inner);
    const cy = THREE.MathUtils.clamp(y, -inner, inner);
    const dx = x - cx;
    const dy = y - cy;
    if (dx !== 0 && dy !== 0) {
      // Pulls each corner square onto a quarter circle.
      const k = Math.max(Math.abs(dx), Math.abs(dy)) / Math.hypot(dx, dy);
      position.setXY(i, cx + dx * k, cy + dy * k);
    }
  }
  return geometry;
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement, anisotropy: number) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = anisotropy;
  return texture;
}

// The red channel holds the main logo shape, and the green channel holds the brand accent.
async function logoCanvas(src: string) {
  const { canvas, ctx } = makeCanvas();
  const raw = await (await fetch(src)).text();
  const svg = raw
    .replace(/\sfill="[^"]*"/g, "")
    .replace(/data-l="m"/g, 'fill="#f00"')
    .replace(/data-l="a"/g, 'fill="#0f0"');
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const image = new Image();
  image.src = url;
  await image.decode();
  URL.revokeObjectURL(url);
  const aspect = image.naturalWidth / image.naturalHeight;
  const maxW = TEXTURE_SIZE * 0.74;
  const maxH = TEXTURE_SIZE * 0.5;
  const w = Math.min(maxW, maxH * aspect);
  const h = w / aspect;
  ctx.drawImage(image, (TEXTURE_SIZE - w) / 2, (TEXTURE_SIZE - h) / 2, w, h);
  return canvas;
}

async function photoCanvas(src: string) {
  const { canvas, ctx } = makeCanvas();
  const image = new Image();
  image.src = src;
  await image.decode();
  ctx.drawImage(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  return canvas;
}

export function createFlipScene(canvas: HTMLCanvasElement, specs: FaceSpec[]) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);

  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
  const scene = new THREE.Scene();
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;

  const uniforms = {
    uTexF: { value: blank as THREE.Texture },
    uTexB: { value: blank as THREE.Texture },
    uStyleF: { value: 0 },
    uStyleB: { value: 0 },
    uAccF: { value: new THREE.Color(1, 1, 1) },
    uAccB: { value: new THREE.Color(1, 1, 1) },
    uInkF: { value: new THREE.Color(1, 1, 1) },
    uInkB: { value: new THREE.Color(1, 1, 1) },
    uLogo: { value: 1 },
    uExpand: { value: 0 },
    uTurn: { value: 0 },
    uRadius: { value: RADIUS },
    uLight: { value: new THREE.Vector2() },
  };

  const geometry = roundedSlab();
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
  const card = new THREE.Mesh(geometry, material);

  const shadowGeometry = new THREE.PlaneGeometry(1, 1);
  const shadowMaterial = new THREE.ShaderMaterial({
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: shadowFragment,
    uniforms: { uAlpha: { value: 1 } },
    transparent: true,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  scene.add(shadow, card);

  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures: (THREE.Texture | null)[] = specs.map(() => null);
  // The shader works in display colors, so brand hex values stay exact.
  const color = (hex: string) => new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
  const accents = specs.map((spec) => color(spec.accent ?? "#ffffff"));
  const inks = specs.map((spec) => color(spec.ink ?? "#ffffff"));

  const ready = Promise.all(
    specs.map(async (spec, index) => {
      const source = spec.photo ? await photoCanvas(spec.photo) : await logoCanvas(spec.src as string);
      const texture = toTexture(source, anisotropy);
      renderer.initTexture(texture);
      textures[index] = texture;
    }),
  );

  let width = 0;
  let height = 0;

  function resize() {
    width = window.innerWidth;
    height = canvas.getBoundingClientRect().height;
    const cap = width < 900 ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(width, height, false);
    const distance = Math.max(1000, height * 1.25);
    camera.position.z = distance;
    camera.aspect = width / height;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / 2 / distance));
    camera.updateProjectionMatrix();
  }

  /** Draws the card, then `overlay` on top of it with a fresh depth buffer. */
  function draw({ x, y, size, p, expand, tiltX, tiltY }: FlipState, overlay?: THREE.Scene) {
    const last = specs.length - 1;
    const frontIndex = Math.min(2 * Math.round(p / 2), last);
    const backIndex = Math.min(2 * Math.floor(p / 2) + 1, last);
    const fraction = p - Math.floor(p);
    const turn = Math.sin(Math.PI * fraction);

    uniforms.uTurn.value = turn;
    uniforms.uTexF.value = textures[frontIndex] ?? blank;
    uniforms.uTexB.value = textures[backIndex] ?? blank;
    uniforms.uStyleF.value = specs[frontIndex].style;
    uniforms.uStyleB.value = specs[backIndex].style;
    uniforms.uAccF.value = accents[frontIndex];
    uniforms.uAccB.value = accents[backIndex];
    uniforms.uInkF.value = inks[frontIndex];
    uniforms.uInkB.value = inks[backIndex];
    uniforms.uLogo.value = Math.max(0, 1 - expand * 3);
    uniforms.uExpand.value = expand;
    uniforms.uLight.value.set(tiltY * 0.8, -tiltX * 0.8);
    shadowMaterial.uniforms.uAlpha.value = Math.max(0, 1 - expand * 4);

    const px = x - width / 2;
    const py = height / 2 - y;
    card.position.set(px, py, 0);
    card.scale.setScalar(size);
    card.rotation.set(tiltX, Math.PI * p + tiltY, 0);

    const spread = Math.max(0.12, Math.abs(Math.cos(Math.PI * p)));
    shadow.position.set(px, py - size * 0.09, -size * 0.55);
    shadow.scale.set(size * 1.75 * spread, size * 1.75, 1);

    renderer.render(scene, camera);
    if (overlay) {
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(overlay, camera);
      renderer.autoClear = true;
    }
  }

  function destroy() {
    textures.forEach((texture) => texture?.dispose());
    blank.dispose();
    geometry.dispose();
    material.dispose();
    shadowGeometry.dispose();
    shadowMaterial.dispose();
    renderer.dispose();
  }

  resize();
  return { renderer, ready, resize, draw, destroy };
}
