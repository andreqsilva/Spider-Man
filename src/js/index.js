import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-10, 7, -12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

// Helpers

const axesHelper = new THREE.AxesHelper( 50 );
//scene.add( axesHelper );

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// Lights

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.7 );
scene.add( ambientLight );

const spotLight = new THREE.SpotLight( 0xffffff, 0.7 );
spotLight.position.set( 2, 12, 2 );
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 1;
spotLight.distance = 0;

spotLight.castShadow = true;
spotLight.shadow.bias = -0.001;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 60;
spotLight.shadow.focus = 1;

scene.add( spotLight );
scene.add( spotLight.target );

const spotLightHelper = new THREE.SpotLightHelper( spotLight );
//scene.add( spotLightHelper );

const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc });

// Plane

const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add( plane );

// Importing the spider model

let spider;
let mixer;
let updateAnimation = 0;
let speed = 0;
let animationIndex = 2; // parado

const loader = new GLTFLoader();
loader.load('../../assets/spider/scene.gltf', function (gltf) {
  spider = gltf.scene;
  spider.scale.set(1, 1, 1);
  scene.add(spider);

  spider.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  mixer = new THREE.AnimationMixer(spider);

  const action = mixer.clipAction(gltf.animations[animationIndex]);
  action.play();
});

// Animation

function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  
  if (mixer) mixer.update(updateAnimation);

  if (spider) {

    spider.position.x += speed * Math.sin(spider.rotation.y);
    spider.position.z += speed * Math.cos(spider.rotation.y);

    if (Math.abs(spider.position.x) > 15 || Math.abs(spider.position.z) > 15) {
      spider.position.x = 0;
      spider.position.z = 0;
    }
    
    spotLight.target = spider;
    spotLightHelper.update();
  }
}
animate();
// Keyboard controls

let keysState = {}
window.addEventListener('keydown', (event) => {
    keysState[event.key] = true;

    switch (event.key) {
        case 'ArrowRight':
            spider.rotation.y -= 0.05;
            break;
        case 'ArrowLeft':
            spider.rotation.y += 0.05;
            break;
        case 'r':
            spider.position.set(0, 0, 0);
            spider.rotation.set(0, 0, 0);
            break;
        case 'h':
            spotLightHelper.visible = !spotLightHelper.visible;
            axesHelper.visible = !axesHelper.visible;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    keysState[event.key] = false;

    if (event.key === 'ArrowUp') {
        updateAnimation = 0;
        speed = 0;
    }
});

function isKeyPressed(key) {
    return keysState[key] === true;
}

function update() {
    if (isKeyPressed('ArrowUp')) {
        updateAnimation = 0.005;
        speed = 0.03;
    } else {
        updateAnimation = 0;
        speed = 0;
    }
    requestAnimationFrame(update);
}
update();

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}, false);