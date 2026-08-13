import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import keyboardOverlayUrl from '../assets/room/keyboard-overlay.png?url';
import macbookScreenUrl from '../assets/room/macbook-screen.png?url';

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

function addMacBook(
  parent: THREE.Object3D,
  disposables: Disposable[],
  x: number,
  y: number,
  z: number,
) {
  const screenW = 0.294;
  const screenH = 0.2;
  const loader = new THREE.TextureLoader();

  const screenImageTexture = loader.load(macbookScreenUrl, (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.y = (tex.image.width / tex.image.height / screenW) * screenH;
  });
  screenImageTexture.colorSpace = THREE.SRGBColorSpace;
  disposables.push(screenImageTexture);

  const keyboardTexture = loader.load(keyboardOverlayUrl);
  keyboardTexture.colorSpace = THREE.NoColorSpace;
  disposables.push(keyboardTexture);

  const darkPlasticMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.9,
    metalness: 0.9,
  });
  const cameraMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    toneMapped: false,
  });
  const baseMetalMaterial = new THREE.MeshStandardMaterial({
    color: 0xcecfd3,
  });
  const logoMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
  });
  const screenMaterial = new THREE.MeshBasicMaterial({
    map: screenImageTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.96,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const keyboardMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    alphaMap: keyboardTexture,
    transparent: true,
    toneMapped: false,
  });

  [
    darkPlasticMaterial,
    cameraMaterial,
    baseMetalMaterial,
    logoMaterial,
    screenMaterial,
    keyboardMaterial,
  ].forEach((mat) => disposables.push(mat));

  const laptop = new THREE.Group();
  laptop.position.set(x, y, z);
  laptop.rotation.y = -0.42;
  laptop.scale.setScalar(1.55);
  parent.add(laptop);

  const bottom = new THREE.Group();
  laptop.add(bottom);

  const baseW = 0.312;
  const baseD = 0.221;
  const baseH = 0.01;
  addBox(bottom, baseMetalMaterial, baseW, baseH, baseD, 0, 0, 0);
  addBox(bottom, darkPlasticMaterial, baseW - 0.012, 0.002, baseD - 0.018, 0, baseH, 0.004, {
    cast: false,
  });

  const legW = 0.018;
  const legH = 0.004;
  const legX = baseW / 2 - 0.03;
  const legZ = baseD / 2 - 0.028;
  addBox(bottom, darkPlasticMaterial, legW, legH, 0.028, -legX, -legH, -legZ, { receive: false });
  addBox(bottom, darkPlasticMaterial, legW, legH, 0.028, legX, -legH, -legZ, { receive: false });
  addBox(bottom, darkPlasticMaterial, legW, legH, 0.028, -legX, -legH, legZ, { receive: false });
  addBox(bottom, darkPlasticMaterial, legW, legH, 0.028, legX, -legH, legZ, { receive: false });

  const keyboardKeys = new THREE.Mesh(new THREE.PlaneGeometry(0.277, 0.116), keyboardMaterial);
  keyboardKeys.rotation.x = -Math.PI / 2;
  keyboardKeys.position.set(0, baseH + 0.0026, 0.028);
  bottom.add(keyboardKeys);

  addBox(bottom, darkPlasticMaterial, 0.08, 0.001, 0.048, 0, baseH + 0.0018, 0.082, { cast: false });

  const lid = new THREE.Group();
  lid.position.set(0, baseH, -baseD / 2);
  lid.rotation.x = -0.18 * Math.PI;
  laptop.add(lid);

  const lidH = 0.221;
  const lidW = 0.312;
  addBox(lid, baseMetalMaterial, lidW, lidH, 0.006, 0, 0, -0.004);

  const bezel = 0.012;
  addBox(lid, darkPlasticMaterial, lidW - 0.004, bezel, 0.002, 0, lidH - bezel, 0.001, {
    cast: false,
  });
  addBox(lid, darkPlasticMaterial, lidW - 0.004, bezel, 0.002, 0, 0.002, 0.001, { cast: false });
  addBox(lid, darkPlasticMaterial, bezel, lidH - bezel * 2, 0.002, -lidW / 2 + bezel / 2 + 0.002, bezel, 0.001, {
    cast: false,
  });
  addBox(lid, darkPlasticMaterial, bezel, lidH - bezel * 2, 0.002, lidW / 2 - bezel / 2 - 0.002, bezel, 0.001, {
    cast: false,
  });

  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMaterial);
  screenMesh.position.set(0, lidH / 2, 0.004);
  lid.add(screenMesh);

  const darkScreen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), darkPlasticMaterial);
  darkScreen.position.set(0, lidH / 2, -0.0005);
  lid.add(darkScreen);

  const screenLight = new THREE.RectAreaLight(0xffffff, 2.2, screenW, screenH);
  screenLight.position.set(0, lidH / 2, 0.01);
  screenLight.lookAt(0, lidH / 2, 1);
  lid.add(screenLight);

  const webcam = new THREE.Mesh(new THREE.CircleGeometry(0.0032, 12), cameraMaterial);
  webcam.position.set(0, lidH - 0.01, 0.0026);
  lid.add(webcam);

  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), logoMaterial);
  logo.position.set(0, lidH / 2, -0.0072);
  logo.rotation.y = Math.PI;
  lid.add(logo);
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

  addBox(room, mats.wall, ROOM_W + WALL_T * 2, ROOM_H, WALL_T, 0, 0, -hd - WALL_T / 2, { cast: false });
  addBox(room, mats.wall, WALL_T, ROOM_H, ROOM_D, hw + WALL_T / 2, 0, 0, { cast: false });

  const winZ0 = -0.5;
  const winZ1 = 0.95;
  const winY0 = 1.02;
  const winY1 = 2.18;
  const leftX = -hw - WALL_T / 2;

  addBox(room, mats.wall, WALL_T, winY0, ROOM_D, leftX, 0, 0, { cast: false });
  addBox(room, mats.wall, WALL_T, ROOM_H - winY1, ROOM_D, leftX, winY1, 0, { cast: false });
  addBox(room, mats.wall, WALL_T, winY1 - winY0, winZ0 - -hd, leftX, winY0, (-hd + winZ0) / 2, {
    cast: false,
  });
  addBox(room, mats.wall, WALL_T, winY1 - winY0, hd - winZ1, leftX, winY0, (hd + winZ1) / 2, {
    cast: false,
  });

  const winW = winZ1 - winZ0;
  const winH = winY1 - winY0;
  const winZ = (winZ0 + winZ1) / 2;
  addBox(room, mats.woodLight, 0.06, winH + 0.1, 0.06, -hw + 0.02, winY0 - 0.05, winZ0, { cast: false });
  addBox(room, mats.woodLight, 0.06, winH + 0.1, 0.06, -hw + 0.02, winY0 - 0.05, winZ1, { cast: false });
  addBox(room, mats.woodLight, 0.06, 0.06, winW + 0.12, -hw + 0.02, winY0 - 0.05, winZ, { cast: false });
  addBox(room, mats.woodLight, 0.06, 0.06, winW + 0.12, -hw + 0.02, winY1, winZ, { cast: false });
  addBox(room, mats.woodLight, 0.04, winH, 0.04, -hw + 0.02, winY0, winZ, { cast: false });
  addBox(room, mats.glass, 0.02, winH - 0.04, winW - 0.04, -hw + 0.01, winY0 + 0.02, winZ, {
    cast: false,
    receive: false,
  });

  addBox(room, mats.linen, 0.04, winH + 0.12, 0.22, -hw + 0.08, winY0 - 0.04, winZ0 - 0.08);
  addBox(room, mats.linen, 0.04, winH + 0.12, 0.22, -hw + 0.08, winY0 - 0.04, winZ1 + 0.08);

  addBox(room, mats.fabric, 1.9, 0.02, 1.5, -0.25, 0.001, 0.35, { cast: false });

  const bedX = -1.15;
  const bedZ = -1.22;
  addBox(room, mats.wood, 1.95, 0.26, 1.28, bedX, 0, bedZ);
  addBox(room, mats.wood, 1.95, 0.72, 0.07, bedX, 0.26, bedZ - 0.6);
  addBox(room, mats.linen, 1.86, 0.14, 1.2, bedX, 0.26, bedZ + 0.02);
  addBox(room, mats.white, 0.52, 0.11, 0.36, bedX - 0.5, 0.4, bedZ - 0.32);
  addBox(room, mats.sage, 1.86, 0.05, 0.82, bedX, 0.4, bedZ + 0.16);

  addBox(room, mats.wood, 0.42, 0.4, 0.4, -0.02, 0, -1.72);
  addBox(room, mats.white, 0.18, 0.22, 0.18, -0.02, 0.4, -1.72);
  const nightShade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.14, 16, 1, true), mats.shade);
  nightShade.position.set(-0.02, 0.7, -1.72);
  nightShade.castShadow = true;
  room.add(nightShade);

  const shelfX = 1.52;
  const shelfZ = -hd + 0.18;
  addBox(room, mats.wood, 1.18, 2.02, 0.04, shelfX, 0, shelfZ - 0.15);
  addBox(room, mats.wood, 0.04, 2.02, 0.34, shelfX - 0.57, 0, shelfZ);
  addBox(room, mats.wood, 0.04, 2.02, 0.34, shelfX + 0.57, 0, shelfZ);
  addBox(room, mats.wood, 1.18, 0.04, 0.34, shelfX, 0, shelfZ);
  addBox(room, mats.wood, 1.18, 0.04, 0.34, shelfX, 1.98, shelfZ);
  for (let i = 0; i < 4; i += 1) {
    addBox(room, mats.wood, 1.1, 0.03, 0.3, shelfX, 0.42 + i * 0.42, shelfZ + 0.02, { cast: false });
  }

  const rand = mulberry32(42);
  const bookColors = [0x8f2d3a, 0x3d4f5f, 0xc4a35a, 0x5b6b4a, 0x6b4a32, 0xd9c4a8, 0x4a6274];
  for (let row = 0; row < 4; row += 1) {
    let xCursor = shelfX - 0.48;
    const y = 0.45 + row * 0.42;
    while (xCursor < shelfX + 0.48) {
      const bw = 0.06 + rand() * 0.07;
      if (xCursor + bw > shelfX + 0.5) break;
      const bh = 0.22 + rand() * 0.12;
      const color = bookColors[Math.floor(rand() * bookColors.length)];
      const bookMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
      disposables.push(bookMat);
      addBox(room, bookMat, bw, bh, 0.2, xCursor + bw / 2, y, shelfZ + 0.04);
      xCursor += bw + 0.012;
    }
  }

  const deskX = hw - 0.38;
  const deskZ = 0.55;
  addBox(room, mats.woodLight, 0.7, 0.05, 1.36, deskX, 0.72, deskZ);
  addBox(room, mats.wood, 0.06, 0.72, 0.06, deskX - 0.3, 0, deskZ - 0.6);
  addBox(room, mats.wood, 0.06, 0.72, 0.06, deskX + 0.3, 0, deskZ - 0.6);
  addBox(room, mats.wood, 0.06, 0.72, 0.06, deskX - 0.3, 0, deskZ + 0.6);
  addBox(room, mats.wood, 0.06, 0.72, 0.06, deskX + 0.3, 0, deskZ + 0.6);

  addMacBook(room, disposables, deskX - 0.02, 0.77, deskZ);
  addBox(room, mats.fabric, 0.07, 0.09, 0.07, deskX + 0.22, 0.77, deskZ + 0.38);

  addBox(room, mats.wood, 0.4, 0.06, 0.4, deskX - 0.72, 0.42, deskZ);
  addBox(room, mats.wood, 0.05, 0.42, 0.05, deskX - 0.88, 0, deskZ - 0.16);
  addBox(room, mats.wood, 0.05, 0.42, 0.05, deskX - 0.56, 0, deskZ - 0.16);
  addBox(room, mats.wood, 0.05, 0.42, 0.05, deskX - 0.88, 0, deskZ + 0.16);
  addBox(room, mats.wood, 0.05, 0.42, 0.05, deskX - 0.56, 0, deskZ + 0.16);
  addBox(room, mats.wood, 0.4, 0.42, 0.05, deskX - 0.72, 0.48, deskZ - 0.18);

  const plant = new THREE.Group();
  plant.position.set(-hw + 0.38, 0, 1.52);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.18, 16), mats.pot);
  pot.position.y = 0.09;
  pot.castShadow = true;
  pot.receiveShadow = true;
  plant.add(pot);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), mats.soil);
  soil.position.y = 0.18;
  plant.add(soil);
  const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), mats.leaf);
  foliage.position.y = 0.42;
  foliage.scale.set(1, 1.15, 1);
  foliage.castShadow = true;
  plant.add(foliage);
  const foliage2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 1), mats.leaf);
  foliage2.position.set(0.1, 0.5, 0.04);
  foliage2.castShadow = true;
  plant.add(foliage2);
  room.add(plant);

  const lamp = new THREE.Group();
  lamp.position.set(-hw + 0.32, 0, 0.18);
  addBox(lamp, mats.metal, 0.16, 0.03, 0.16, 0, 0, 0);
  addBox(lamp, mats.metal, 0.03, 1.35, 0.03, 0, 0.03, 0, { cast: false });
  const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.22, 20, 1, true), mats.shade);
  lampShade.position.y = 1.48;
  lamp.add(lampShade);
  room.add(lamp);

  addBox(room, mats.frame, 0.72, 0.5, 0.04, 0.22, 1.35, -hd + 0.03, { cast: false });
  addBox(room, mats.art, 0.62, 0.4, 0.02, 0.22, 1.4, -hd + 0.05, { cast: false });

  const pendant = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 20), mats.shade);
  pendant.position.set(0.1, ROOM_H - 0.18, 0.15);
  room.add(pendant);
  addBox(room, mats.metal, 0.015, 0.16, 0.015, 0.1, ROOM_H - 0.16, 0.15, { cast: false });

  const cat = new THREE.Group();
  cat.position.set(bedX + 0.35, 0.52, bedZ + 0.12);
  cat.rotation.y = -0.6;
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), mats.cat);
  body.scale.set(1.45, 0.85, 1);
  body.position.set(0, 0.08, 0);
  body.castShadow = true;
  cat.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), mats.cat);
  head.position.set(0.14, 0.13, 0.02);
  head.castShadow = true;
  cat.add(head);
  const earGeo = new THREE.ConeGeometry(0.035, 0.07, 8);
  disposables.push(earGeo);
  const earL = new THREE.Mesh(earGeo, mats.catEar);
  earL.position.set(0.12, 0.21, -0.04);
  earL.rotation.z = -0.25;
  cat.add(earL);
  const earR = new THREE.Mesh(earGeo, mats.catEar);
  earR.position.set(0.17, 0.21, 0.05);
  earR.rotation.z = 0.2;
  cat.add(earR);
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.2, 4, 8), mats.cat);
  tail.position.set(-0.18, 0.12, 0.02);
  tail.rotation.z = 0.95;
  tail.castShadow = true;
  cat.add(tail);
  room.add(cat);

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
  sun.position.set(-6.5, 4.2, 0.8);
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

  const lampLight = new THREE.PointLight(0xffcc88, 8, 4.5, 2);
  lampLight.position.set(-ROOM_W / 2 + 0.32, 1.42, 0.18);
  scene.add(lampLight);

  const windowFill = new THREE.RectAreaLight(0xcfe6f5, 6, 1.35, 1.1);
  windowFill.position.set(-ROOM_W / 2 + 0.04, 1.6, 0.22);
  windowFill.lookAt(0, 1.4, 0.22);
  scene.add(windowFill);

  return { hemi, sun, ceiling, lampLight, windowFill };
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
    lights.lampLight.intensity = 8 * k;
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
