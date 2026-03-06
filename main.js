import * as THREE from "https://esm.sh/three@0.163.0";
import { GLTFLoader } from "https://esm.sh/three@0.163.0/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "https://esm.sh/three@0.163.0/examples/jsm/loaders/OBJLoader.js";
import { RoomEnvironment } from "https://esm.sh/three@0.163.0/examples/jsm/environments/RoomEnvironment.js";

const hero = document.getElementById("hero");
const canvas = document.getElementById("webgl");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
sceneSetup();

function sceneSetup() {
  const envRT = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.04);
  scene.environment = envRT.texture;
}

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.5, 7);
scene.add(camera);

const glassGroup = new THREE.Group();
scene.add(glassGroup);
glassGroup.position.y = 0.35; // Increase to move up more
// To hide the glass add the line below:
// glassGroup.visible = false;
const glassMaterials = [];

const titleCanvas = document.createElement("canvas");
const titleContext = titleCanvas.getContext("2d");
const titleTexture = new THREE.CanvasTexture(titleCanvas);
titleTexture.colorSpace = THREE.SRGBColorSpace;
titleTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
titleTexture.minFilter = THREE.LinearFilter;
titleTexture.magFilter = THREE.LinearFilter;

const titlePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    map: titleTexture,
    transparent: false,
    toneMapped: false,
  })
);
titlePlane.position.z = -1.95; // Moves it forward/backward
titlePlane.position.y = 0.15;   // Move it UP or DOWN
titlePlane.position.x = 0.0;   // Move it LEFT or RIGHT
// titlePlane.scale.set(5, 2, 1); // Width, Height, Depth
scene.add(titlePlane);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111111, 1.25);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(5.5, 5.8, 6);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.45);
rimLight.position.set(-5.5, 2.5, -5.4);
scene.add(rimLight);

function createGlassMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,             // Glass is not metallic
    roughness: 0.03,          // Slight roughness for a smooth surface
    transmission: 1,          // Full transparency (for glass effect)
    thickness: 0.2,          // Controls how thick the glass is
    ior: 1.5,                 // Index of refraction (glass has a value of ~1.5)
    transparent: true,        // Make the material transparent
    opacity: 0.6,               // Full opacity (for solid glass)
    reflectivity: 1,          // High reflectivity for a more glass-like surface
    envMapIntensity: 1.05,    // Environmental map intensity (reflection)
    clearcoat: 0.9,           // Clearcoat adds a shiny surface on top
    clearcoatRoughness: 0.03, // Clearcoat roughness (low value makes it shinier)
    attenuationColor: new THREE.Color("#ffffff"),
     attenuationDistance: 6,   // How much the light fades as it passes through the material
    side: THREE.DoubleSide,   // For glass, use both sides of the material
    depthWrite: false,        // Prevent writing to depth buffer for transparency
    // reflectivity: 1,          // Glass has high reflectivity
    refractionRatio: 0.98,    // Refraction for glass (important for realism)
    emissive: new THREE.Color(0x111111), // Darker edges around the glass
    emissiveIntensity: 0.5,  // Increase emissive to darken edges
  });
}

function applyGlassLook(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) {
      return;
    }

    obj.geometry.computeVertexNormals();

    const glass = createGlassMaterial();
    obj.material = glass;
    obj.material.needsUpdate = true;
    glassMaterials.push(glass);
    obj.castShadow = false;
    obj.receiveShadow = false;
  });
}

function normalizeModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const desiredHeight = 2.35;
  const scale = desiredHeight / maxAxis;

  root.scale.setScalar(scale);
  root.position.sub(center.multiplyScalar(scale));
  root.position.y += 0.1;
}

function loadGLB(url) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      reject
    );
  });
}

function loadOBJ(url) {
  const loader = new OBJLoader();
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

function createFallbackCup() {
  const cup = new THREE.Group();
  const bodyGeometry = new THREE.CylinderGeometry(0.95, 1.35, 3.4, 24, 1, true);
  const bodyMat = createGlassMaterial();
  glassMaterials.push(bodyMat);
  const body = new THREE.Mesh(bodyGeometry, bodyMat);
  cup.add(body);

  const baseMat = createGlassMaterial();
  glassMaterials.push(baseMat);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.98, 0.2, 24), baseMat);
  base.position.y = -1.8;
  cup.add(base);

  const rimMat = createGlassMaterial();
  glassMaterials.push(rimMat);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.045, 18, 36), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.71;
  cup.add(rim);

  cup.scale.setScalar(1.28);
  return cup;
}

async function loadCupModel() {
  const candidates = [
    { type: "glb", path: "./copo-americano.glb" },
    { type: "glb", path: "./copo.glb" },
    { type: "glb", path: "./model.glb" },
    { type: "glb", path: "./assets/copo-americano.glb" },
    { type: "glb", path: "./assets/models/copo-americano.glb" },
    { type: "obj", path: "./copo-americano.obj" },
    { type: "obj", path: "./copo.obj" },
    { type: "obj", path: "./model.obj" },
    { type: "obj", path: "./assets/copo-americano.obj" },
    { type: "obj", path: "./assets/models/copo-americano.obj" },
  ];

  for (const candidate of candidates) {
    try {
      const model = candidate.type === "glb" ? await loadGLB(candidate.path) : await loadOBJ(candidate.path);
      applyGlassLook(model);
      normalizeModel(model);
      glassGroup.add(model);
      console.info(`Loaded cup model from ${candidate.path}`);
      return;
    } catch (_err) {
      // Try next candidate.
    }
  }

  const fallback = createFallbackCup();
  glassGroup.add(fallback);
  console.warn("No .glb/.obj model found. Using fallback cup geometry.");
}

loadCupModel();

const clock = new THREE.Clock();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getVisibleSizeAtZ(worldZ) {
  const distance = Math.abs(camera.position.z - worldZ);
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(fovRad / 2) * distance;
  const width = height * camera.aspect;
  return { width, height };
}

// function redrawTitleTexture() {
//   if (!titleContext) {
//     return;
//   }

//   const dpr = Math.min(window.devicePixelRatio || 1, 2);
//   const texWidth = Math.max(2048, Math.floor(window.innerWidth * dpr * 2));
//   const texHeight = 1600;
//   titleCanvas.width = texWidth;
//   titleCanvas.height = texHeight;

//   titleContext.fillStyle = "#fff204";
//   titleContext.fillRect(0, 0, texWidth, texHeight);
//   titleContext.fillStyle = "rgba(0,0,0,1)";
//   titleContext.textAlign = "center";
//   titleContext.textBaseline = "middle";
//   titleContext.font = `900 ${Math.floor(texHeight * 0.7)}px "Lion and Hare", "Arial Black", sans-serif`;
//   titleContext.fillText("SAIDEIRA", texWidth * 0.5, texHeight * 0.5);

//   titleTexture.needsUpdate = true;
// }

function redrawTitleTexture() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Calculate width based on the screen minus 160px (80 per side)
  const texWidth = (window.innerWidth * dpr) - (160 * dpr);

  // Increase the height ratio slightly (from 0.25 to 0.3)
  // to give the letters more vertical room to grow
  const texHeight = texWidth * 0.3;

  titleCanvas.width = texWidth;
  titleCanvas.height = texHeight;

  // Background
  titleContext.fillStyle = "#fff204";
  titleContext.fillRect(0, 0, texWidth, texHeight);

  // Text
  titleContext.fillStyle = "black";
  titleContext.textAlign = "center";
  titleContext.textBaseline = "middle";

  // CRITICAL: Push font size to 95% of the height to make it "Huge"
  const fontSize = Math.floor(texHeight * 0.8);
  titleContext.font = `500 ${fontSize}px "Lion and Hare", "Arial Black", sans-serif`;

  titleContext.fillText("SAIDEIRA", texWidth * 0.5, texHeight * 0.5);
  titleTexture.needsUpdate = true;
}

function updateTitleScale() {
  // 1. Get the exact width of the 3D view at the title's depth
  const visible = getVisibleSizeAtZ(titlePlane.position.z);

  // 2. Convert 80px CSS margins into 3D World Units
  // Formula: (Margin / WindowWidth) * Visible3DWidth
  const margin3D = (80 / window.innerWidth) * visible.width;

  // 3. Final Width is Total Visible Width minus both margins
  const finalWidth = visible.width - (margin3D * 2);

  // 4. Match the height based on the Canvas aspect ratio
  const canvasAspect = titleCanvas.height / titleCanvas.width;
  const finalHeight = finalWidth * canvasAspect;

  titlePlane.scale.set(finalWidth, finalHeight, 1);
}

function layoutTitlePlane() {
  const visible = getVisibleSizeAtZ(titlePlane.position.z);
  const width = visible.width * 1.8;
  const height = Math.min(visible.height * 0.9, width / 3.6);
  titlePlane.scale.set(width, height, 1);
}

function updateScrollFade() {
  const heroFadeDistance = window.innerHeight * 0.95;
  const glassFadeDistance = window.innerHeight * 0.45;

  const heroT = Math.min(window.scrollY / heroFadeDistance, 1);
  const glassT = Math.min(window.scrollY / glassFadeDistance, 1);

  const glassOpacity = 0.6 - glassT;
  for (const material of glassMaterials) {
    material.opacity = glassOpacity;
    material.needsUpdate = true;
  }
  glassGroup.visible = glassOpacity > 0.01;

  hero.style.opacity = String(1 - heroT);
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // 1. Update Camera and Renderer
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Update Canvas Text (The "Drawing")
  redrawTitleTexture();

  // 3. Update 3D Plane (The "Sizing")
  updateTitleScale();
}

window.addEventListener("resize", onResize);
window.addEventListener("scroll", updateScrollFade, { passive: true });
updateScrollFade();
layoutTitlePlane();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    redrawTitleTexture();
  });
}
redrawTitleTexture();

function tick() {
  const elapsed = clock.getElapsedTime();

  if (!prefersReducedMotion) {
    // To stop the rotation just comment out the two lines below:
    glassGroup.rotation.y = elapsed * 0.75;
    glassGroup.rotation.x = Math.sin(elapsed * 0.55) * 0.05;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();
