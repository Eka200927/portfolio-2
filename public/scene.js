
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const canvas = document.getElementById("three-canvas");

if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    100
  );

  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.TorusKnotGeometry(
    1.1,
    0.32,
    150,
    20,
    2,
    3
  );

  const material = new THREE.MeshPhysicalMaterial({
    color: "#c8b6ee",
    roughness: 0.22,
    metalness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.1
  });

  const object = new THREE.Mesh(geometry, material);
  group.add(object);

  const smallGeometry = new THREE.SphereGeometry(0.12, 24, 24);

  const colors = ["#f2c7d9", "#c7dff2", "#d4c9f5"];

  for (let i = 0; i < 9; i++) {
    const dot = new THREE.Mesh(
      smallGeometry,
      new THREE.MeshStandardMaterial({
        color: colors[i % colors.length]
      })
    );

    const angle = (i / 9) * Math.PI * 2;
    dot.position.set(
      Math.cos(angle) * 2,
      Math.sin(angle) * 2,
      Math.sin(angle * 2)
    );

    group.add(dot);
  }

  scene.add(new THREE.AmbientLight("#ffffff", 2));

  const light = new THREE.DirectionalLight("#ffffff", 3);
  light.position.set(3, 4, 5);
  scene.add(light);

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("pointermove", (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 0.5;
  });

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
  }

  window.addEventListener("resize", resize);
  resize();

  function animate() {
    requestAnimationFrame(animate);

    group.rotation.y += 0.004;
    group.rotation.x += 0.002;

    group.rotation.y += (mouseX - group.rotation.y) * 0.001;
    group.rotation.x += (mouseY - group.rotation.x) * 0.001;

    renderer.render(scene, camera);
  }

  animate();
}
