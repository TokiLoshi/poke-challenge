import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Base
 */

// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Model Loader
 */
const loader = new GLTFLoader();
loader.load(
	"models/openpoke.glb",
	(gltf) => {
		gltf.scene.scale.set(20, 20, 20);
		console.log(gltf);
		gltf.scene.position.y = 2;
		gltf.scene.rotation.y = Math.PI;
		scene.add(gltf.scene);
	},
	undefined,
	(error) => {
		console.log(error);
	}
);

// Temporary sphere
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(1, 32, 32),
	new THREE.MeshStandardMaterial({ color: "#00feff", roughness: 0.7 })
);
sphere.position.y = 3;
scene.add(sphere);

/**
 * Tree
 */
const trees = new THREE.Group();
const barkGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2, 8);
const barkMaterial = new THREE.MeshStandardMaterial({
	color: "#E8D2A6",
});
const bark1 = new THREE.Mesh(barkGeometry, barkMaterial);
bark1.position.set(-5, 1, 2);
trees.add(bark1);
const leavesGeometry = new THREE.SphereGeometry(1, 1, 20);
const leavesMaterial = new THREE.MeshStandardMaterial({
	color: 0xffff00,
});
const leaves1 = new THREE.Mesh(leavesGeometry, leavesMaterial);
leaves1.position.set(-5, 2.5, 2);
trees.add(leaves1);

scene.add(trees);

// Floor
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 20),
	new THREE.MeshStandardMaterial({ color: "#a9c388" })
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

/**
 * Fog
 */
// scene.fog = new THREE.Fog(0xcccccc, 10, 15);

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
