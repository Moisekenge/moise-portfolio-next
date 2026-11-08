import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type PhoneDraw = {
  x: number;
  y: number;
  /** Height of the phone in CSS pixels. */
  height: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  /** Screen on top so far, screen rising over it, and how far it has risen. */
  from: number;
  to: number;
  mix: number;
  shadow: number;
};

const SCREEN_ASPECT = 1080 / 2400;
const WIDTH = 1;
const SCREEN_W = 0.93;
const SCREEN_H = SCREEN_W / SCREEN_ASPECT;
const HEIGHT = SCREEN_H + (WIDTH - SCREEN_W);
const DEPTH = 0.098;
const RADIUS = 0.155;
const SCREEN_RADIUS = 0.12;
const BEVEL = 0.018;

const objectVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vO;
  varying vec3 vView;
  void main() {
    vN = normalize(normalMatrix * normal);
    vO = normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

// Same studio light as the cards, tuned for polished black metal.
const environment = /* glsl */ `
  uniform vec2 uLight;
  vec3 env(vec3 r) {
    vec3 sky = mix(vec3(0.03), vec3(0.42), smoothstep(-0.6, 1.0, r.y));
    float key = smoothstep(0.62, 0.97, dot(r, normalize(vec3(-0.45 + uLight.x, 0.55 + uLight.y, 0.7))));
    float fill = smoothstep(0.72, 1.0, dot(r, normalize(vec3(0.9, -0.05, 0.42))));
    float strip = smoothstep(0.06, 0.0, abs(r.y - 0.18 + r.x * 0.3));
    return sky * 0.4 + key * 1.7 + fill * 0.7 + strip * 0.32;
  }
`;

const bodyFragment = /* glsl */ `
  precision highp float;
  varying vec3 vN;
  varying vec3 vO;
  varying vec3 vView;
  ${environment}
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vView);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    float face = smoothstep(0.92, 0.99, abs(vO.z));
    float gloss = mix(0.46 + fres * 1.1, 0.1 + fres * 0.5, face);
    gl_FragColor = vec4(vec3(0.012) + env(reflect(-V, N)) * gloss, 1.0);
  }
`;

const screenVertex = /* glsl */ `
  varying vec2 vP;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vP = position.xy;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const screenFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform float uMix;
  uniform vec2 uSize;
  varying vec2 vP;
  varying vec3 vN;
  varying vec3 vView;
  ${environment}

  float box(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 uv = vP / uSize + 0.5;

    // The next screen rises like an app sheet, and the current one sinks back.
    vec3 col;
    if (uv.y < uMix) {
      col = texture2D(uTo, vec2(uv.x, uv.y + 1.0 - uMix)).rgb;
    } else {
      float zoom = 1.0 - uMix * 0.06;
      col = texture2D(uFrom, (uv - 0.5) * zoom + 0.5).rgb * (1.0 - uMix * 0.45);
      if (uMix > 0.0) col *= 1.0 - smoothstep(0.06, 0.0, uv.y - uMix) * 0.32;
    }

    // Notch with a speaker slit and a camera lens right of center.
    float top = uSize.y * 0.5;
    vec2 c = vP - vec2(0.0, top - 0.036);
    if (box(c, vec2(0.2, 0.052), 0.04) < 0.0) {
      col = vec3(0.008);
      if (box(c - vec2(-0.03, 0.006), vec2(0.06, 0.006), 0.006) < 0.0) col = vec3(0.07);
      float lens = length(c - vec2(0.11, 0.006));
      if (lens < 0.018) {
        col = mix(vec3(0.02, 0.04, 0.14), vec3(0.09, 0.2, 0.55), smoothstep(0.018, 0.0, length(c - vec2(0.104, 0.012))));
      }
    }

    vec3 N = normalize(vN);
    vec3 V = normalize(vView);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
    gl_FragColor = vec4(col + env(reflect(-V, N)) * (0.018 + fres * 0.34), 1.0);
  }
`;

const shadowFragment = /* glsl */ `
  precision highp float;
  uniform float uAlpha;
  varying vec2 vUv;
  float box(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }
  void main() {
    float d = box(vUv - 0.5, vec2(0.15, 0.32), 0.06);
    gl_FragColor = vec4(vec3(0.05, 0.08, 0.16), (1.0 - smoothstep(-0.09, 0.11, d)) * 0.26 * uAlpha);
  }
`;

function roundedRect(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - radius);
  shape.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(x + radius, y + height);
  shape.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + radius);
  shape.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);
  return shape;
}

function bodyGeometry() {
  const raw = new THREE.ExtrudeGeometry(roundedRect(WIDTH - BEVEL * 2, HEIGHT - BEVEL * 2, RADIUS - BEVEL), {
    depth: DEPTH - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 6,
    curveSegments: 28,
  });
  raw.translate(0, 0, -(DEPTH - BEVEL * 2) / 2);
  const smooth = toCreasedNormals(raw, 0.7);
  raw.dispose();
  return smooth;
}

function loadScreen(src: string, anisotropy: number) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  return image.decode().then(() => {
    const texture = new THREE.Texture(image);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.anisotropy = anisotropy;
    texture.needsUpdate = true;
    return texture;
  });
}

export function createPhones(renderer: THREE.WebGLRenderer, sets: string[][]) {
  const scene = new THREE.Scene();
  const blank = new THREE.DataTexture(new Uint8Array([245, 245, 242, 255]), 1, 1);
  blank.needsUpdate = true;

  const light = { value: new THREE.Vector2() };
  const body = bodyGeometry();
  const bodyMaterial = new THREE.ShaderMaterial({ vertexShader: objectVertex, fragmentShader: bodyFragment, uniforms: { uLight: light } });

  const screenShape = new THREE.ShapeGeometry(roundedRect(SCREEN_W, SCREEN_H, SCREEN_RADIUS), 24);
  const shadowPlane = new THREE.PlaneGeometry(1, 1);
  const shadowVertex = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";

  // Left edge: mute switch and two volume keys. Right edge: one long side key.
  const keys = [
    { side: -1, y: 0.66, length: 0.05 },
    { side: -1, y: 0.44, length: 0.13 },
    { side: -1, y: 0.22, length: 0.13 },
    { side: 1, y: 0.34, length: 0.24 },
  ].map(({ side, y, length }) => {
    const geometry = new THREE.CapsuleGeometry(0.012, length, 4, 12);
    geometry.scale(1, 1, 1.7);
    return { geometry, side, y };
  });

  const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x030303 });
  const hole = new THREE.CircleGeometry(0.0105, 14);
  const screw = new THREE.CircleGeometry(0.0085, 12);
  const port = new THREE.ShapeGeometry(roundedRect(0.15, 0.03, 0.015), 10);
  const holeXs = Array.from({ length: 6 }, (_, index) => 0.2 + index * 0.034).flatMap((x) => [x, -x]);

  const phones = sets.map(() => {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(body, bodyMaterial));

    const uniforms = {
      uFrom: { value: blank as THREE.Texture },
      uTo: { value: blank as THREE.Texture },
      uMix: { value: 0 },
      uSize: { value: new THREE.Vector2(SCREEN_W, SCREEN_H) },
      uLight: light,
    };
    const material = new THREE.ShaderMaterial({ vertexShader: screenVertex, fragmentShader: screenFragment, uniforms });
    const screen = new THREE.Mesh(screenShape, material);
    screen.position.z = DEPTH / 2 + 0.0008;
    group.add(screen);

    keys.forEach(({ geometry, side, y }) => {
      const key = new THREE.Mesh(geometry, bodyMaterial);
      key.position.set((side * WIDTH) / 2, y, 0);
      group.add(key);
    });

    const bottom = new THREE.Group();
    bottom.position.y = -HEIGHT / 2 - 0.0006;
    bottom.rotation.x = Math.PI / 2;
    holeXs.forEach((x) => {
      const mesh = new THREE.Mesh(hole, holeMaterial);
      mesh.position.x = x;
      bottom.add(mesh);
    });
    [-0.12, 0.12].forEach((x) => {
      const mesh = new THREE.Mesh(screw, holeMaterial);
      mesh.position.x = x;
      bottom.add(mesh);
    });
    bottom.add(new THREE.Mesh(port, holeMaterial));
    group.add(bottom);

    const shadowMaterial = new THREE.ShaderMaterial({
      vertexShader: shadowVertex,
      fragmentShader: shadowFragment,
      uniforms: { uAlpha: { value: 1 } },
      transparent: true,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowPlane, shadowMaterial);
    shadow.renderOrder = -1;
    scene.add(shadow, group);
    return { group, shadow, shadowMaterial, material, uniforms };
  });

  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures: (THREE.Texture | null)[][] = sets.map((set) => set.map(() => null));

  // Uploads one image at a time, so a frame never pays for all of them at once.
  const ready = (async () => {
    for (let phone = 0; phone < sets.length; phone++) {
      for (let index = 0; index < sets[phone].length; index++) {
        const texture = await loadScreen(sets[phone][index], anisotropy);
        renderer.initTexture(texture);
        textures[phone][index] = texture;
      }
    }
  })();

  let width = 0;
  let height = 0;

  function resize(nextWidth: number, nextHeight: number) {
    width = nextWidth;
    height = nextHeight;
  }

  function draw(states: PhoneDraw[], tiltX: number, tiltY: number) {
    light.value.set(tiltY * 0.8, -tiltX * 0.8);
    states.forEach((state, index) => {
      const phone = phones[index];
      const scale = state.height / HEIGHT;
      const px = state.x - width / 2;
      const py = height / 2 - state.y;
      phone.group.position.set(px, py, 0);
      phone.group.scale.setScalar(scale);
      phone.group.rotation.set(state.rotX + tiltX, state.rotY + tiltY, state.rotZ);
      phone.uniforms.uFrom.value = textures[index][state.from] ?? blank;
      phone.uniforms.uTo.value = textures[index][state.to] ?? blank;
      phone.uniforms.uMix.value = state.mix;
      phone.shadow.position.set(px + state.height * 0.05, py - state.height * 0.04, -state.height * 0.2);
      phone.shadow.scale.setScalar(state.height * 1.55);
      phone.shadowMaterial.uniforms.uAlpha.value = state.shadow;
    });
  }

  function destroy() {
    textures.flat().forEach((texture) => texture?.dispose());
    blank.dispose();
    body.dispose();
    bodyMaterial.dispose();
    screenShape.dispose();
    shadowPlane.dispose();
    keys.forEach((key) => key.geometry.dispose());
    holeMaterial.dispose();
    hole.dispose();
    screw.dispose();
    port.dispose();
    phones.forEach((phone) => {
      phone.material.dispose();
      phone.shadowMaterial.dispose();
    });
  }

  return { scene, ready, resize, draw, destroy };
}
