import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ROOM_W = 5.2;
const ROOM_D = 4.2;
const ROOM_H = 2.72;
const WALL_T = 0.1;

type Disposable = { dispose: () => void };

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createWoodTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.fillStyle = '#c9a67a';
  ctx.fillRect(0, 0, size, size);

  const plankH = 64;
  for (let y = 0; y < size; y += plankH) {
    const shade = 0.86 + ((y * 17) % 13) / 90;
    ctx.fillStyle = `rgb(${Math.floor(186 * shade)}, ${Math.floor(148 * shade)}, ${Math.floor(96 * shade)})`;
    ctx.fillRect(0, y, size, plankH - 2);
    ctx.strokeStyle = 'rgba(70, 45, 25, 0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + plankH - 1);
    ctx.lineTo(size, y + plankH - 1);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(90, 55, 30, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      const gy = y + 10 + ((i * 37 + y) % (plankH - 18));
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(size * 0.3, gy + 3, size * 0.7, gy - 3, size, gy);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addBox(
  parent: THREE.Object3D,
  material: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  yBottom: number,
  z: number,
  options: { cast?: boolean; receive?: boolean; ry?: number } = {},
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, yBottom + h / 2, z);
  if (options.ry) mesh.rotation.y = options.ry;
  mesh.castShadow = options.cast ?? true;
  mesh.receiveShadow = options.receive ?? true;
  parent.add(mesh);
  return mesh;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / Math.max(edge1 - edge0, 1e-6));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// 通用 GLTF 加载辅助：加载模型，自动缩放至 targetSize，底部对齐到 (x, yBottom, z)
// 返回 { model, surfaceY }，其中 surfaceY 是模型加载后的顶面 Y 坐标
function loadGLTF(
  url: string,
  parent: THREE.Object3D,
  disposables: Disposable[],
  options: {
    x: number;
    yBottom: number;
    z: number;
    targetSize: number;
    rotationY?: number;
  },
): Promise<{ model: THREE.Group; surfaceY: number }> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(options.targetSize / maxDim);

        box.setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.set(
          options.x - center.x,
          options.yBottom - box.min.y,
          options.z - center.z,
        );
        if (options.rotationY !== undefined) model.rotation.y = options.rotationY;

        const surfaceY = options.yBottom + (box.max.y - box.min.y);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            disposables.push(child.geometry);
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => disposables.push(mat));
          }
        });

        parent.add(model);
        resolve({ model, surfaceY });
      },
      undefined,
      (err) => {
        console.error(`Failed to load ${url}:`, err);
        reject(err);
      },
    );
  });
}

function addLaptopGLTF(
  parent: THREE.Object3D,
  disposables: Disposable[],
  x: number,
  yBottom: number,
  z: number,
): Promise<void> {
  return loadGLTF('/media/laptop.glb', parent, disposables, {
    x, yBottom, z,
    targetSize: 0.48,
    rotationY: Math.PI / 2,
  }).then(() => {});
}

function addDeskGLTF(
  parent: THREE.Object3D,
  disposables: Disposable[],
  x: number,
  z: number,
): Promise<number> {
  // targetSize 按桌子宽度（~1.2m）缩放；返回桌面 surfaceY
  return loadGLTF('/media/desk.glb', parent, disposables, {
    x, yBottom: 0, z,
    targetSize: 1.2,
    rotationY: Math.PI / 2,
  }).then(({ surfaceY }) => surfaceY);
}

function addMouseGLTF(
  parent: THREE.Object3D,
  disposables: Disposable[],
  x: number,
  yBottom: number,
  z: number,
): Promise<void> {
  return loadGLTF('/media/mouse.glb', parent, disposables, {
    x, yBottom, z,
    targetSize: 0.12,  // 鼠标约 12cm 长
    rotationY: Math.PI / 2,
  }).then(({ model }) => {
    model.rotation.y = -1.1707963267948962;
    model.position.x = 2.2634963568464728;
    model.position.z = -1.1;
  });
}

function addChairGLTF(
  parent: THREE.Object3D,
  disposables: Disposable[],
  x: number,
  z: number,
): Promise<void> {
  return loadGLTF('/media/chair.glb', parent, disposables, {
    x, yBottom: 0, z,
    targetSize: 0.85,
    rotationY: Math.PI / 2,  // 椅面朝向桌子
  }).then(({ model }) => {
    model.position.x = 1.52;
    model.position.z = -1.4;
  });
}

function addWardrobeGLTF(
  parent: THREE.Object3D,
  disposables: Disposable[],
  x: number,
  z: number,
): Promise<void> {
  return loadGLTF('/media/wardrobe.glb', parent, disposables, {
    x, yBottom: 0, z,
    targetSize: 1.8,  // 衣柜宽约 120cm × 1.5
  }).then(({ model }) => {
    model.rotation.y = -Math.PI;
    model.position.x = -1.5;
    model.position.z = 1.8;
  });
}

function addBedGLTF(
  parent: THREE.Object3D,
  disposables: Disposable[],
  x: number,
  z: number,
): Promise<void> {
  return loadGLTF('/media/bed.glb', parent, disposables, {
    x, yBottom: 0, z,
    targetSize: 1.95,
  }).then(({ model }) => {
    model.rotation.y = -Math.PI / 2;
    model.position.y = -0.005202873560493086;
    // 横向（床长方向）拉长 1.5 倍
    model.scale.z *= 1.5;
    (window as Record<string, unknown>).__bed = model;
  });
}

function addThreshold(scene: THREE.Scene, disposables: Disposable[]) {
  const group = new THREE.Group();
  scene.add(group);

  const doorW = 0.94;
  const doorH = 2.18;
  const zWall = ROOM_D / 2;
  const hw = ROOM_W / 2;
  const hallW = 1.62;
  const hallD = 2.05;
  const hallH = 2.5;

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x12100e, roughness: 0.96 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xc4a07a, roughness: 0.55 });
  const doorWood = new THREE.MeshStandardMaterial({
    color: 0xb07a4a,
    roughness: 0.48,
    emissive: 0x3d2414,
    emissiveIntensity: 0.12,
  });
  const doorPanel = new THREE.MeshStandardMaterial({
    color: 0x8a5a38,
    roughness: 0.58,
    emissive: 0x2a1810,
    emissiveIntensity: 0.08,
  });
  const brass = new THREE.MeshStandardMaterial({
    color: 0xb08d57,
    roughness: 0.32,
    metalness: 0.78,
  });
  [wallMat, frameMat, doorWood, doorPanel, brass].forEach((mat) => disposables.push(mat));

  const leftW = hw - doorW / 2;
  addBox(group, wallMat, leftW, ROOM_H, WALL_T, -(hw + doorW / 2) / 2, 0, zWall + WALL_T / 2, {
    cast: false,
  });
  addBox(group, wallMat, leftW, ROOM_H, WALL_T, (hw + doorW / 2) / 2, 0, zWall + WALL_T / 2, {
    cast: false,
  });
  addBox(group, wallMat, doorW, ROOM_H - doorH, WALL_T, 0, doorH, zWall + WALL_T / 2, { cast: false });

  addBox(group, frameMat, 0.08, doorH + 0.08, 0.08, -doorW / 2 - 0.02, 0, zWall + 0.04, { cast: false });
  addBox(group, frameMat, 0.08, doorH + 0.08, 0.08, doorW / 2 + 0.02, 0, zWall + 0.04, { cast: false });
  addBox(group, frameMat, doorW + 0.16, 0.08, 0.08, 0, doorH, zWall + 0.04, { cast: false });

  addBox(group, wallMat, hallW, 0.05, hallD, 0, -0.05, zWall + hallD / 2, { cast: false });
  addBox(group, wallMat, 0.08, hallH, hallD, -hallW / 2, 0, zWall + hallD / 2, { cast: false });
  addBox(group, wallMat, 0.08, hallH, hallD, hallW / 2, 0, zWall + hallD / 2, { cast: false });
  addBox(group, wallMat, hallW, 0.06, hallD, 0, hallH, zWall + hallD / 2, { cast: false });

  const door = new THREE.Group();
  door.position.set(-doorW / 2, 0, zWall + 0.02);
  group.add(door);

  addBox(door, doorWood, doorW, doorH, 0.046, doorW / 2, 0, 0);
  const panelW = doorW * 0.36;
  const panelH = doorH * 0.36;
  addBox(door, doorPanel, panelW, panelH, 0.018, doorW * 0.3, doorH * 0.12, 0.018, { cast: false });
  addBox(door, doorPanel, panelW, panelH, 0.018, doorW * 0.7, doorH * 0.12, 0.018, { cast: false });
  addBox(door, doorPanel, panelW, panelH, 0.018, doorW * 0.3, doorH * 0.55, 0.018, { cast: false });
  addBox(door, doorPanel, panelW, panelH, 0.018, doorW * 0.7, doorH * 0.55, 0.018, { cast: false });

  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), brass);
  knob.position.set(doorW - 0.09, 1.02, 0.04);
  knob.castShadow = true;
  door.add(knob);
  addBox(door, brass, 0.012, 0.08, 0.012, doorW - 0.09, 0.96, 0.03, { receive: false });

  const doorLight = new THREE.PointLight(0xffe2c2, 14, 6.5, 1.6);
  doorLight.position.set(0.08, 1.55, zWall + 1.05);
  group.add(doorLight);

  const doorFill = new THREE.SpotLight(0xffd7a8, 18, 4.5, Math.PI / 5, 0.45, 1.6);
  doorFill.position.set(0.1, 1.7, zWall + 1.35);
  doorFill.target.position.set(0, 1.15, zWall);
  group.add(doorFill);
  group.add(doorFill.target);

  group.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) disposables.push(child.geometry);
  });

  return { group, door, doorLight, doorFill };
}

function buildRoom(scene: THREE.Scene, disposables: Disposable[]) {
  const woodMap = createWoodTexture();
  disposables.push(woodMap);

  const mats = {
    wall: new THREE.MeshStandardMaterial({ color: 0xf1e6d6, roughness: 0.92 }),
    floor: new THREE.MeshStandardMaterial({ map: woodMap, roughness: 0.72, metalness: 0.02 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xfaf6f0, roughness: 1 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.62 }),
    woodLight: new THREE.MeshStandardMaterial({ color: 0xa67c52, roughness: 0.55 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x8f2d3a, roughness: 0.88 }),
    linen: new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.9 }),
    sage: new THREE.MeshStandardMaterial({ color: 0x6d7a68, roughness: 0.9 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf4eee6, roughness: 0.48 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8a8680, roughness: 0.32, metalness: 0.72 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xc5dceb,
      roughness: 0.08,
      metalness: 0.05,
      emissive: 0x9ec4dd,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.55,
    }),
    shade: new THREE.MeshStandardMaterial({
      color: 0xf3e2c4,
      emissive: 0xffcc88,
      emissiveIntensity: 0.28,
      roughness: 0.82,
    }),
    pot: new THREE.MeshStandardMaterial({ color: 0xc4785a, roughness: 0.7 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x3b2a1f, roughness: 1 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3d6b4f, roughness: 0.78 }),
    cat: new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.92 }),
    catEar: new THREE.MeshStandardMaterial({ color: 0xc48a62, roughness: 0.92 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.55 }),
    art: new THREE.MeshStandardMaterial({ color: 0xc9b8a0, roughness: 0.7 }),
  };

  Object.values(mats).forEach((mat) => disposables.push(mat));

  const room = new THREE.Group();
  scene.add(room);

  const hw = ROOM_W / 2;
  const hd = ROOM_D / 2;

  addBox(room, mats.floor, ROOM_W + WALL_T * 2, 0.06, ROOM_D + WALL_T, 0, -0.06, -WALL_T / 2, {
    cast: false,
  });
  addBox(room, mats.ceiling, ROOM_W + WALL_T * 2, 0.06, ROOM_D + WALL_T, 0, ROOM_H, -WALL_T / 2, {
    cast: false,
  });

  // 后墙（-Z）实墙 —— 窗户在后墙，左侧留实墙给床头板
  const winX0 = -0.2;   // 窗户沿 X 轴范围
  const winX1 = 1.6;
  const winY0 = 1.02;
  const winY1 = 2.18;
  const winW = winX1 - winX0;
  const winH = winY1 - winY0;
  const winX = (winX0 + winX1) / 2;
  const backZ = -hd - WALL_T / 2;

  // 后墙分四块（窗洞两侧 + 上下）
  addBox(room, mats.wall, ROOM_W + WALL_T * 2, winY0, WALL_T, 0, 0, backZ, { cast: false });
  addBox(room, mats.wall, ROOM_W + WALL_T * 2, ROOM_H - winY1, WALL_T, 0, winY1, backZ, { cast: false });
  addBox(room, mats.wall, WALL_T + (winX0 + hw), ROOM_H, WALL_T, (-hw + winX0 - WALL_T) / 2, 0, backZ, { cast: false });
  addBox(room, mats.wall, WALL_T + (hw - winX1), ROOM_H, WALL_T, (winX1 + hw + WALL_T) / 2, 0, backZ, { cast: false });

  // 右墙实墙
  addBox(room, mats.wall, WALL_T, ROOM_H, ROOM_D, hw + WALL_T / 2, 0, 0, { cast: false });

  // 左墙实墙（床靠左墙，无窗）
  addBox(room, mats.wall, WALL_T, ROOM_H, ROOM_D, -hw - WALL_T / 2, 0, 0, { cast: false });

  // 后墙窗框
  addBox(room, mats.woodLight, 0.06, winH + 0.1, 0.06, winX0, winY0 - 0.05, -hd + 0.02, { cast: false });
  addBox(room, mats.woodLight, 0.06, winH + 0.1, 0.06, winX1, winY0 - 0.05, -hd + 0.02, { cast: false });
  addBox(room, mats.woodLight, winW + 0.12, 0.06, 0.06, winX, winY0 - 0.05, -hd + 0.02, { cast: false });
  addBox(room, mats.woodLight, winW + 0.12, 0.06, 0.06, winX, winY1, -hd + 0.02, { cast: false });
  addBox(room, mats.woodLight, winW, 0.04, 0.04, winX, (winY0 + winY1) / 2, -hd + 0.02, { cast: false });
  addBox(room, mats.glass, winW - 0.04, winH - 0.04, 0.02, winX, winY0 + 0.02, -hd + 0.01, {
    cast: false,
    receive: false,
  });

  // 后墙窗帘（窗户两侧）
  addBox(room, mats.linen, 0.22, winH + 0.12, 0.04, winX0 - 0.08, winY0 - 0.04, -hd + 0.08);
  addBox(room, mats.linen, 0.22, winH + 0.12, 0.04, winX1 + 0.08, winY0 - 0.04, -hd + 0.08);

  // ── 床（GLB 模型，靠左墙）──────────────────────────────────────────
  const bedX = -hw + 0.98;   // 床中心 X（距左墙约半张床深）
  const bedZ = 0.1;           // 床中心 Z（房间中部偏前）
  addBedGLTF(room, disposables, bedX, bedZ);


  // ── 衣柜（GLB 模型，门墙右侧）─────────────────────────────
  // 门在 Z=+hd 中央，衣柜放在门右侧（+X 方向）
  addWardrobeGLTF(room, disposables, 0.8, hd - 0.3);

  const deskX = 2.30;
  const deskZ = -1.45;
  // 桌子加载后，用桌面高度 surfaceY 精确放置笔记本
  addDeskGLTF(room, disposables, deskX, deskZ).then((surfaceY) => {
    addLaptopGLTF(room, disposables, 2.3215149321547273, surfaceY, -1.5358443826578598);
    addMouseGLTF(room, disposables, deskX, surfaceY, deskZ);
  });

  // 椅子放在桌子前方，面朝桌子
  addChairGLTF(room, disposables, deskX, deskZ);


  // 装饰画挂左墙（床上方）
  addBox(room, mats.frame, 0.5, 0.72, 0.04, -hw + 0.03, 1.35, bedZ, { cast: false, ry: Math.PI / 2 });
  addBox(room, mats.art, 0.4, 0.62, 0.02, -hw + 0.05, 1.4, bedZ, { cast: false, ry: Math.PI / 2 });

  const pendant = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 20), mats.shade);
  pendant.position.set(0.1, ROOM_H - 0.18, 0.15);
  room.add(pendant);
  addBox(room, mats.metal, 0.015, 0.16, 0.015, 0.1, ROOM_H - 0.16, 0.15, { cast: false });


  room.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      disposables.push(child.geometry);
    }
  });

  return { glass: mats.glass, shade: mats.shade };
}

function addLights(scene: THREE.Scene) {
  RectAreaLightUniformsLib.init();

  const hemi = new THREE.HemisphereLight(0xfff1dc, 0x6b5344, 0.45);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffe0b8, 2.1);
  // 阳光从后方（-Z）窗户射入
  sun.position.set(0.8, 4.2, -6.5);
  sun.target.position.set(0, 1, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 18;
  sun.shadow.camera.left = -6;
  sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6;
  sun.shadow.camera.bottom = -6;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  const ceiling = new THREE.PointLight(0xfff2dd, 18, 8, 2);
  ceiling.position.set(0.1, 2.45, 0.15);
  scene.add(ceiling);

  // 窗光从后墙窗户射入（朝 +Z 方向）
  const windowFill = new THREE.RectAreaLight(0xcfe6f5, 6, 1.8, 1.1);
  windowFill.position.set(0.7, 1.6, -ROOM_D / 2 + 0.04);
  windowFill.lookAt(0.7, 1.4, 0);
  scene.add(windowFill);

  return { hemi, sun, ceiling, windowFill };
}

export function initRoom(
  canvas: HTMLCanvasElement,
  ui?: { hintEl?: HTMLElement },
): () => void {
  const container = canvas.parentElement;
  if (!container) throw new Error('Room canvas needs a parent element');

  const disposables: Disposable[] = [];
  const scene = new THREE.Scene();
  const bgDark = new THREE.Color(0x000000);
  const bgLit = new THREE.Color(0x1a1612);
  const bgNow = new THREE.Color(0x000000);
  scene.background = bgNow;
  scene.fog = new THREE.FogExp2(0x000000, 0.18);

  const camera = new THREE.PerspectiveCamera(54, 1, 0.08, 80);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  disposables.push(renderer);

  const { glass, shade } = buildRoom(scene, disposables);
  const lights = addLights(scene);
  const { group: threshold, door, doorLight, doorFill } = addThreshold(scene, disposables);

  const look = new THREE.Vector3();
  const camDoor = new THREE.Vector3(0.06, 1.56, ROOM_D / 2 + 1.42);
  const lookDoor = new THREE.Vector3(0, 1.28, ROOM_D / 2);
  const camInside = new THREE.Vector3(0.12, 1.5, 0.72);
  const lookInside = new THREE.Vector3(0.15, 1.18, -0.55);
  const camFinal = new THREE.Vector3(2.45, 1.85, 3.85);
  const lookFinal = new THREE.Vector3(0, 1.12, 0);

  const T_HOLD = 0.85;
  const T_OPEN = 4.7;
  const T_ENTER = 7.6;
  const T_LIGHTS = 9.3;
  const T_END = 12.1;
  const DOOR_OPEN = -2.02;

  const setLightLevel = (k: number) => {
    lights.hemi.intensity = 0.45 * k;
    lights.sun.intensity = 2.1 * k;
    lights.ceiling.intensity = 18 * k;
    lights.windowFill.intensity = 6 * k;
    glass.emissiveIntensity = 0.35 * k;
    shade.emissiveIntensity = 0.28 * k;
    renderer.toneMappingExposure = lerp(0.1, 1.15, k);
    bgNow.copy(bgDark).lerp(bgLit, k);
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = lerp(0.2, 0, k);
    }
    doorLight.intensity = lerp(14, 0, clamp01(k * 1.4));
    doorFill.intensity = lerp(18, 0, clamp01(k * 1.4));
  };

  const applyIntro = (time: number) => {
    const open = smoothstep(T_HOLD, T_OPEN, time);
    door.rotation.y = DOOR_OPEN * open;

    const enter = smoothstep(T_OPEN, T_ENTER, time);
    const reveal = smoothstep(T_LIGHTS, T_END, time);
    const light = smoothstep(T_ENTER + 0.12, T_LIGHTS, time);

    camera.position.lerpVectors(camDoor, camInside, enter);
    camera.position.lerp(camFinal, reveal);
    look.lerpVectors(lookDoor, lookInside, enter);
    look.lerp(lookFinal, reveal);
    camera.lookAt(look);
    camera.fov = lerp(54, 48, Math.max(enter * 0.35, reveal));
    camera.updateProjectionMatrix();

    setLightLevel(light);
    threshold.visible = reveal < 0.08;
  };

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.copy(lookFinal);
  controls.minDistance = 2.2;
  controls.maxDistance = 9;
  controls.maxPolarAngle = Math.PI / 2 - 0.08;
  controls.minPolarAngle = 0.18;
  controls.enabled = false;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introTime = reducedMotion ? T_END : 0;
  let introDone = false;
  let last = performance.now();
  let frame = 0;

  const finishIntro = (fromSkip = false) => {
    if (introDone) return;
    introDone = true;
    introTime = T_END;
    applyIntro(T_END);
    threshold.visible = false;
    scene.fog = null;
    camera.position.copy(camFinal);
    camera.lookAt(lookFinal);
    camera.fov = 48;
    camera.updateProjectionMatrix();
    controls.target.copy(lookFinal);
    if (fromSkip) {
      requestAnimationFrame(() => {
        controls.enabled = true;
      });
    } else {
      controls.enabled = true;
    }
    controls.update();
    const hintEl = ui?.hintEl;
    if (hintEl) {
      hintEl.textContent = hintEl.dataset.hint ?? '';
      hintEl.classList.remove('is-intro');
    }
  };

  const skipIntro = () => finishIntro(true);

  if (reducedMotion) finishIntro();
  else applyIntro(0);

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const animate = () => {
    frame = requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!introDone) {
      introTime += dt;
      if (introTime >= T_END) finishIntro();
      else applyIntro(introTime);
    } else {
      controls.update();
    }

    renderer.render(scene, camera);
  };

  const onPointer = () => skipIntro();
  const onKey = (event: KeyboardEvent) => {
    if (event.code === 'Space' || event.code === 'Enter' || event.code === 'Escape') {
      skipIntro();
    }
  };

  resize();
  animate();
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onPointer);
  window.addEventListener('keydown', onKey);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('pointerdown', onPointer);
    window.removeEventListener('keydown', onKey);
    controls.dispose();
    disposables.forEach((item) => item.dispose());
    scene.clear();
  };
}
