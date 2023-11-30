import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Base
 */

// Debug
const gui = new GUI({
	title: "Control the Poke Sphere",
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

// Add bark to trees
const barkColorTexture = textureLoader.load("/textures/bark/color.jpg");
barkColorTexture.colorSpace = THREE.SRGBColorSpace;
const barkAmbientOcclusionTexture = textureLoader.load(
	"/textures/bark/ambientOcclusion.jpg"
);
const barkNormalTexture = textureLoader.load("/textures/bark/normal.jpg");
const barkRoughnessTexture = textureLoader.load("/textures/bark/roughness.jpg");

// Load bushes for tree leaf texture
const bushColor = textureLoader.load("/textures/bushes/color.jpg");
bushColor.colorSpace = THREE.SRGBColorSpace;
const bushAmbientOcclusion = textureLoader.load(
	"/textures/bushes/ambientOcclusion.jpg"
);
const bushNormal = textureLoader.load("/textures/bushes/normal.jpg");
const bushRoughness = textureLoader.load("/textures/bushes/roughness.jpg");
const bushHeight = textureLoader.load("/textures/bushes/height.png");

// Load grass for floor from haunted house lecture
const grassColor = textureLoader.load("/textures/sphere/color.jpg");
grassColor.colorSpace = THREE.SRGBColorSpace;
const grassAmbientOcclusion = textureLoader.load(
	"/textures/sphere/ambientOcclusion.jpg"
);
const grassNormal = textureLoader.load("/textures/sphere/normal.jpg");
const grassRoughness = textureLoader.load("/textures/sphere/roughness.jpg");
grassColor.repeat.set(8, 8);
grassAmbientOcclusion.repeat.set(8, 8);
grassNormal.repeat.set(8, 8);
grassRoughness.repeat.set(8, 8);

// Wrap grass for floor as per haunted house lecture
grassColor.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusion.wrapS = THREE.RepeatWrapping;
grassNormal.wrapS = THREE.RepeatWrapping;
grassRoughness.wrapS = THREE.RepeatWrapping;

grassColor.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusion.wrapT = THREE.RepeatWrapping;
grassNormal.wrapT = THREE.RepeatWrapping;
grassRoughness.wrapT = THREE.RepeatWrapping;

// Load spheres texture for boulders
const coralColor = textureLoader.load("/textures/coral/color.jpg");
coralColor.colorSpace = THREE.SRGBColorSpace;
const coralAmbientOcclusion = textureLoader.load(
	"/textures/coral/ambientOcclusion.jpg"
);
const coralNormal = textureLoader.load("/textures/coral/normal.jpg");
const coralRoughness = textureLoader.load("/textures/coral/roughness.jpg");
const coralHeight = textureLoader.load("/textures/coral/height.png");

// Load lapis texture for center poke egg
const lapisColor = textureLoader.load("/textures/lapis/color.jpeg");
lapisColor.colorSpace = THREE.SRGBColorSpace;
const lapisAmbientOcclusion = textureLoader.load(
	"/textures/lapis/ambientOcclusion.jpeg"
);
const lapisNormal = textureLoader.load("/textures/lapis/normal.jpeg");
const lapisRoughness = textureLoader.load("/textures/lapis/roughness.jpeg");
const lapisHeight = textureLoader.load("/textures/lapis/height.png");

// Load water texture for pond
const waterColor = textureLoader.load("/textures/pond/basecolor.jpeg");
waterColor.colorSpace = THREE.SRGBColorSpace;
console.log(`Water color: ${waterColor}`);
const waterAmbientOcclusion = textureLoader.load(
	"/textures/pond/ambientOcclusion.jpeg"
);
const waterNormal = textureLoader.load("/textures/pond/normal.jpeg");
const waterRoughness = textureLoader.load("/textures/pond/roughness.jpeg");
const waterHeight = textureLoader.load("/textures/pond/height.png");

// Load sky texture for background
const skyTexture = textureLoader.load("/textures/sky/color.jpeg");
skyTexture.colorSpace = THREE.SRGBColorSpace;
// Trying to reduce blurriness of sky texture
skyTexture.minFilter = THREE.LinearFilter;
skyTexture.magFilter = THREE.LinearFilter;
scene.background = skyTexture;
scene.environment = skyTexture;

/**
 * Model Loader
 */
const loader = new GLTFLoader();
loader.load(
	"models/openpoke.glb",
	(gltf) => {
		// Loading open source poke ball model
		gltf.scene.scale.set(20, 20, 20);
		console.log(gltf);
		gltf.scene.position.y = 2;
		gltf.scene.rotation.y = Math.PI;
		gltf.scene.castShadow = true;
		gltf.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		scene.add(gltf.scene);
	},
	undefined,
	(error) => {
		console.log(error);
	}
);

// Unhatched Pokemon Egg for center of poke ball
const lapisEgg = new THREE.Mesh(
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
lapisEgg.material.roughness = 0.34;
gui
	.add(lapisEgg.material, "metalness")
	.min(0)
	.max(1)
	.step(0.001)
	.name("Egg metalness");
gui
	.add(lapisEgg.material, "roughness")
	.min(0)
	.max(1)
	.step(0.001)
	.name("Egg roughness");
lapisEgg.position.y = 3;
lapisEgg.castShadow = true;
lapisEgg.receiveShadow = true;
scene.add(lapisEgg);

/**
 * Tree
 */
// Array to hold occupied coordinates
const occupiedCoordinates = [];
const trees = new THREE.Group();
// Add tree bark material to trees
const barkGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2, 8);
const barkMaterial = new THREE.MeshStandardMaterial({
	map: barkColorTexture,
	aoMap: barkAmbientOcclusionTexture,
	normalMap: barkNormalTexture,
	roughnessMap: barkRoughnessTexture,
});

const leavesGeometry = new THREE.SphereGeometry(1.5, 10, 42);
const leavesMaterial = new THREE.MeshStandardMaterial({
	map: bushColor,
	alphaMap: bushAmbientOcclusion,
	normalMap: bushNormal,
	roughnessMap: bushRoughness,
	displacementMap: bushHeight,
	displacementScale: 0.1,
});

// Populate scene with trees
const bark1 = new THREE.Mesh(barkGeometry, barkMaterial);
const leaves1 = new THREE.Mesh(leavesGeometry, leavesMaterial);
leaves1.position.set(-5, 1.8, -4);
bark1.position.set(-5, 1, -4);
bark1.castShadow = true;
bark1.receiveShadow = true;

occupiedCoordinates.push(`${-5},${-4}`);
trees.add(bark1, leaves1);

const bark2 = new THREE.Mesh(barkGeometry, barkMaterial);
const leaves2 = new THREE.Mesh(leavesGeometry, leavesMaterial);
bark2.position.set(7, 1, 8);
occupiedCoordinates.push(`${7},${8}`);
leaves2.position.set(7, 1.8, 8);
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

// Try to avoid overlapping objects on the scene
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
	map: waterColor,
	transparent: true,
	aoMap: waterAmbientOcclusion,
	normalMap: waterNormal,
	roughnessMap: waterRoughness,
	displacementMap: waterHeight,
	displacementScale: 0.1,
});
const pond = new THREE.Mesh(pondGeometry, pondMaterial);
pond.position.set(-6, 0.1, 6);
pond.rotation.x = -Math.PI * 0.5;
occupiedCoordinates.push(`${-6},${6}`);
pond.castShadow = true;
pond.receiveShadow = true;
scene.add(pond);

/**
 * PondBorder
 */
// Trying to add dept to the pond and break up the green textures
const pondBorderGeometry = new THREE.RingGeometry(2.8, 3.1, 32);
const pondBorderMaterial = new THREE.MeshStandardMaterial({
	color: "#161A30",
});
const pondBorder = new THREE.Mesh(pondBorderGeometry, pondBorderMaterial);
pondBorder.position.set(-6, 0.1, 6);
pondBorder.rotation.x = -Math.PI * 0.5;
pondBorder.castShadow = true;
pondBorder.receiveShadow = true;
scene.add(pondBorder);

/**
 * Clouds
 */
const clouds = new THREE.Group();
const cloudMaterial = new THREE.MeshStandardMaterial({
	map: skyTexture,
	transparent: true,
});
const cloud1 = new THREE.Mesh(
	new THREE.SphereGeometry(1, 24, 24),
	cloudMaterial
);
const cloud2 = new THREE.Mesh(
	new THREE.SphereGeometry(1, 20, 20),
	cloudMaterial
);
const cloud3 = new THREE.Mesh(
	new THREE.SphereGeometry(1, 14, 14),
	cloudMaterial
);
cloud1.position.set(-3, 10, 6);
cloud1.scale.set(1.5, 1.5, 1.5);
cloud1.castShadow = true;
cloud1.receiveShadow = true;
cloud2.position.set(-1.5, 10, 6);
cloud2.castShadow = true;
cloud2.receiveShadow = true;
cloud3.position.set(-4.5, 10, 6);
cloud3.castShadow = true;
cloud3.receiveShadow = true;
clouds.add(cloud1, cloud2, cloud3);

const cloud4 = new THREE.Mesh(
	new THREE.SphereGeometry(1, 24, 22),
	cloudMaterial
);
const cloud5 = new THREE.Mesh(
	new THREE.SphereGeometry(1, 20, 18),
	cloudMaterial
);
const cloud6 = new THREE.Mesh(
	new THREE.SphereGeometry(1, 14, 10),
	cloudMaterial
);

cloud4.position.set(3, 10, 6);
cloud4.scale.set(1.5, 1.5, 1.5);
cloud4.castShadow = true;
cloud4.receiveShadow = true;
cloud5.position.set(1.5, 10, 6);
cloud5.castShadow = true;
cloud5.receiveShadow = true;
cloud6.position.set(4.5, 10, 6);
cloud6.castShadow = true;
cloud6.receiveShadow = true;
clouds.add(cloud1, cloud2, cloud3, cloud4, cloud5, cloud6);

scene.add(clouds);

/**
 * Reeds
 */
const pondX = -6;
const pondZ = 6;
const pondRadius = 3;

const reedMaterial = new THREE.MeshStandardMaterial({
	color: "#F4D160",
});
function addReedsAroundPond(centerX, centerZ, numReeds, clusterRadius) {
	for (let i = 0; i < numReeds; i++) {
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

// Calling the function to add reeds around the pond in batches
addReedsAroundPond(pondX, pondZ, 10, 0.3);
addReedsAroundPond(pondX, pondZ, 10, 0.6);

/** Bushes */
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({
	map: coralColor,
	transparent: true,
	aoMap: coralAmbientOcclusion,
	normalMap: coralNormal,
	roughnessMap: coralRoughness,
	displacementMap: coralHeight,
	displacementScale: 0.1,
});

for (let i = 0; i < 7; i++) {
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
floor.receiveShadow = true;
floor.castShadow = true;
scene.add(floor);

// Adding blue fog to try and reduce the harshness of the sky
// scene.fog = new THREE.Fog("#96EFFF", 0.5, 35);
// gui.add(scene.fog, "near").min(0).max(15).step(0.001).name("fogNear").on;
// gui.add(scene.fog, "far").min(0).max(15).step(0.001).name("fogFar");

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
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
// Adating from the haunted house lecture
const sunLight = new THREE.DirectionalLight("#b9d5ff", 2);
sunLight.position.set(-6, 4, 4);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
// sunLight.shadow.camera.top = 2;
// sunLight.shadow.camera.right = 2;
// sunLight.shadow.camera.bottom = -2;
// sunLight.shadow.camera.left = -2;
// sunLight.shadow.camera.near = 1;
// sunLight.shadow.camera.far = 6;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.right = 10;
sunLight.shadow.camera.top = 10;

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
camera.position.x = 3;
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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sunLight.castShadow = true;
trees.castShadow = true;
pond.castShadow = true;
bark1.castShadow = true;
leaves1.castShadow = true;
bark2.castShadow = true;
leaves2.castShadow = true;
bark3.castShadow = true;
leaves3.castShadow = true;
bark4.castShadow = true;
leaves4.castShadow = true;
lapisEgg.castShadow = true;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	// Animate the sphere
	lapisEgg.position.y = Math.sin(elapsedTime) * 0.2 + 3;
	lapisEgg.rotation.z = Math.cos(elapsedTime) * 0.2;
	// Animate the leaves
	leaves1.rotation.z = Math.sin(elapsedTime) * 0.05 + 1.5;
	leaves2.rotation.z = Math.sin(elapsedTime) * 0.05 + 1.5;
	leaves3.rotation.z = Math.sin(elapsedTime) * 0.05 + 1.5;
	leaves4.rotation.z = Math.sin(elapsedTime) * 0.05 + 1.5;

	pondBorder.scale.y = Math.sin(elapsedTime) * 0.05 + 1;
	pondBorder.scale.z = Math.sin(elapsedTime) * 0.05 + 1;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
