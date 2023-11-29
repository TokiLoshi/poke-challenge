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
const bricksColorTexture = textureLoader.load("/textures/bricks/color.jpg");
bricksColorTexture.colorSpace = THREE.SRGBColorSpace;

const bushColor = textureLoader.load("/textures/bushes/color.jpg");
bushColor.colorSpace = THREE.SRGBColorSpace;
const bushAmbientOcclusion = textureLoader.load(
	"/textures/bushes/ambientOcclusion.jpg"
);
const bushNormal = textureLoader.load("/textures/bushes/normal.jpg");
const bushRoughness = textureLoader.load("/textures/bushes/roughness.jpg");
const bushHeight = textureLoader.load("/textures/bushes/height.jpg");

const grassColor = textureLoader.load("/textures/grass/color.jpg");
grassColor.colorSpace = THREE.SRGBColorSpace;
const grassAmbientOcclusion = textureLoader.load(
	"/textures/grass/ambientOcclusion.jpg"
);
const grassNormal = textureLoader.load("/textures/grass/normal.jpg");
const grassRoughness = textureLoader.load("/textures/grass/roughness.jpg");
grassColor.repeat.set(8, 8);
grassAmbientOcclusion.repeat.set(8, 8);
grassNormal.repeat.set(8, 8);
grassRoughness.repeat.set(8, 8);

grassColor.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusion.wrapS = THREE.RepeatWrapping;
grassNormal.wrapS = THREE.RepeatWrapping;
grassRoughness.wrapS = THREE.RepeatWrapping;

grassColor.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusion.wrapT = THREE.RepeatWrapping;
grassNormal.wrapT = THREE.RepeatWrapping;
grassRoughness.wrapT = THREE.RepeatWrapping;

const sphereColor = textureLoader.load("/textures/sphere/color.jpg");
sphereColor.colorSpace = THREE.SRGBColorSpace;
const sphereAmbientOcclusion = textureLoader.load(
	"/textures/sphere/ambientOcclusion.jpg"
);
const sphereNormal = textureLoader.load("/textures/sphere/normal.jpg");
const sphereRoughness = textureLoader.load("/textures/sphere/roughness.jpg");
const sphereHeight = textureLoader.load("/textures/sphere/height.jpg");

const lapisColor = textureLoader.load("/textures/lapis/color.jpeg");
lapisColor.colorSpace = THREE.SRGBColorSpace;
const lapisAmbientOcclusion = textureLoader.load(
	"/textures/lapis/ambientOcclusion.jpeg"
);
const lapisNormal = textureLoader.load("/textures/lapis/normal.jpeg");
const lapisRoughness = textureLoader.load("/textures/lapis/roughness.jpeg");
const lapisHeight = textureLoader.load("/textures/lapis/height.png");

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
		gltf.scene.castShadow = true;
		scene.add(gltf.scene);
	},
	undefined,
	(error) => {
		console.log(error);
	}
);

// Unhatched Pokemon Egg
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(1, 32, 32),
	new THREE.MeshStandardMaterial({
		map: lapisColor,
		transparent: true,
		aoMap: lapisAmbientOcclusion,
		normalMap: lapisNormal,
		roughnessMap: lapisRoughness,
		displacementMap: lapisHeight,
		displacementScale: 0.1,
	})
);
sphere.position.y = 3;
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

/**
 * Tree
 */
const occupiedCoordinates = [];
const trees = new THREE.Group();
const barkGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2, 8);
const barkMaterial = new THREE.MeshStandardMaterial({
	map: bricksColorTexture,
});

const leavesGeometry = new THREE.SphereGeometry(1.5, 10, 20);
const leavesMaterial = new THREE.MeshStandardMaterial({
	map: bushColor,
	transparent: true,
	alphaMap: bushAmbientOcclusion,
	normalMap: bushNormal,
	roughnessMap: bushRoughness,
	displacementMap: bushHeight,
	displacementScale: 0.1,
});
const bark1 = new THREE.Mesh(barkGeometry, barkMaterial);
const leaves1 = new THREE.Mesh(leavesGeometry, leavesMaterial);
leaves1.position.set(-7, 2.5, -4);
bark1.position.set(-7, 1, -4);
occupiedCoordinates.push(`${-7},${-4}`);
bark1.castShadow = true;
bark1.receiveShadow = true;
trees.add(bark1, leaves1);

const bark2 = new THREE.Mesh(barkGeometry, barkMaterial);
const leaves2 = new THREE.Mesh(leavesGeometry, leavesMaterial);
bark2.position.set(7, 1, 8);
occupiedCoordinates.push(`${7},${8}`);
leaves2.position.set(7, 2.5, 8);
trees.add(bark2, leaves2);

const bark3 = new THREE.Mesh(barkGeometry, barkMaterial);
const leaves3 = new THREE.Mesh(leavesGeometry, leavesMaterial);
bark3.position.set(2, 1, -6);
occupiedCoordinates.push(`${2},${-6}`);
leaves3.position.set(2, 2.5, -6);
trees.add(bark3, leaves3);

const bark4 = new THREE.Mesh(barkGeometry, barkMaterial);
const leaves4 = new THREE.Mesh(leavesGeometry, leavesMaterial);
leaves4.position.set(-8, 2.5, -8);
bark4.position.set(-8, 1, -8);
occupiedCoordinates.push(`${-8},${-8}`);
trees.add(bark4, leaves4);

scene.add(trees);

// Check distance between two points
function calculateDistance(x1, z1, x2, z2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
}

function isOccupied(x, z, radius) {
	console.log(`Checking if is occupied: ${x}, ${z}`);
	// Check if the coordinates are already occupied
	for (let i = 0; i < occupiedCoordinates.length; i++) {
		const [occupiedX, occupiedZ] = occupiedCoordinates[i]
			.split(",")
			.map(Number);
		if (calculateDistance(x, z, occupiedX, occupiedZ) < radius) {
			console.log("Occupied");
			return true;
		}
	}
	return false;
}

/** Pond */
const pondGeometry = new THREE.CircleGeometry(3, 32);
const pondMaterial = new THREE.MeshStandardMaterial({
	color: "#6f9db8",
});
const pond = new THREE.Mesh(pondGeometry, pondMaterial);
pond.position.set(-6, 0.1, 6);
pond.rotation.x = -Math.PI * 0.5;
occupiedCoordinates.push(`${-6},${6}`);
pond.castShadow = true;
pond.receiveShadow = true;
scene.add(pond);

/**
 * Reeds
 */
const pondX = -6;
const pondZ = 6;
const pondRadius = 3;

const reedMaterial = new THREE.MeshStandardMaterial({
	color: "#A2C579",
});
function addReedsAroundPond(centerX, centerZ, numReeds, clusterRadius) {
	for (let i = 0; i < numReeds; i++) {
		// Generate a random height for reed to make it look more realistic
		const reedHeight = Math.random() * 0.5 + 0.5;
		const reedGeometry = new THREE.CylinderGeometry(0.02, 0.05, reedHeight, 8);
		const angle = Math.random() * Math.PI * 2;
		const distanceFromCenter =
			pondRadius + clusterRadius + Math.random() * clusterRadius;
		const reedX = centerX + Math.cos(angle) * distanceFromCenter;
		const reedZ = centerZ + Math.sin(angle) * distanceFromCenter;

		if (!isOccupied(reedX, reedZ, 0.1)) {
			const reed = new THREE.Mesh(reedGeometry, reedMaterial);
			reed.position.set(reedX, 0.5, reedZ);
			reed.rotation.y = Math.random() * Math.PI * 2;
			occupiedCoordinates.push(`${reedX},${reedZ}`);
			reed.castShadow = true;
			reed.receiveShadow = true;
			scene.add(reed);
		}
	}
}

addReedsAroundPond(pondX, pondZ, 3, 0.3);

/** Bushes */
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({
	map: sphereColor,
	transparent: true,
	aoMap: sphereAmbientOcclusion,
	normalMap: sphereNormal,
	roughnessMap: sphereRoughness,
	displacementMap: sphereHeight,
	displacementScale: 0.1,
});

for (let i = 0; i < 2; i++) {
	let x, z, angle, radius;

	let collision = false;
	do {
		angle = Math.random() * Math.PI * 2;
		radius = 3 + Math.random() * 6;
		x = Math.cos(angle) * radius;
		z = Math.sin(angle) * radius;
		collision = isOccupied(x, z, 3.5);
	} while (collision);
	occupiedCoordinates.push(`${x},${z}`);
	// Create the mesh
	const bush = new THREE.Mesh(bushGeometry, bushMaterial);
	bush.castShadow = true;
	bush.receiveShadow = true;

	// Position
	bush.position.set(x, 0.3, z);
	const bushScaleX = Math.random() * 0.5 + 0.5;
	const bushScaleY = Math.random() * 0.5 + 0.5;
	const bushScaleZ = Math.random() * 0.5 + 0.5;
	bush.scale.set(bushScaleX, bushScaleY, bushScaleZ);

	// Rotation
	bush.rotation.z = (Math.random() - 0.5) * 0.4;
	bush.rotation.y = (Math.random() - 0.5) * 4;

	scene.add(bush);
}

// Floor
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 20),
	new THREE.MeshStandardMaterial({
		map: grassColor,
		aoMap: grassAmbientOcclusion,
		normalMap: grassNormal,
		roughnessMap: grassRoughness,
	})
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
gui
	.add(ambientLight, "intensity")
	.min(0)
	.max(1)
	.step(0.001)
	.name("ambientLight");
scene.add(ambientLight);

/**
 * Sunlight
 */
const sunLight = new THREE.DirectionalLight("#b9d5ff", 2);
sunLight.position.set(2, 7, -1);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.top = 2;
sunLight.shadow.camera.right = 2;
sunLight.shadow.camera.bottom = -2;
sunLight.shadow.camera.left = -2;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 6;

floor.receiveShadow = true;

gui.add(sunLight, "intensity").min(0).max(3).step(0.001).name("sunlight");
scene.add(sunLight);

const sunLightCameraHelper = new THREE.DirectionalLightHelper(sunLight, 1);
sunLightCameraHelper.visible = false;
scene.add(sunLightCameraHelper);
gui.add(sunLightCameraHelper, "visible").name("sunlightHelper");

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
 * Shadows
 */
renderer.shadowMap.enabled = true;
sunLight.castShadow = true;
trees.castShadow = true;
pond.castShadow = true;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	sphere.position.y = Math.sin(elapsedTime) * 0.2 + 3;
	sphere.rotation.z = Math.cos(elapsedTime) * 0.2;
	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
