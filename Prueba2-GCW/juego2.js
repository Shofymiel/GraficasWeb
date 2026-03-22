// IMPORTAMOS EL MOTOR PRINCIPAL DE THREE.JS
import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

import { GLTFLoader } from 'https://unpkg.com/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

import { RGBELoader } from 'https://unpkg.com/three@0.128.0/examples/jsm/loaders/RGBELoader.js';

// ESCENA 
const scene = new THREE.Scene();

const rgbeLoader = new RGBELoader();
rgbeLoader.load('assets/qwantani_noon_puresky_2k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture; //para reflejar en los objetos
});

// CAMARA 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0);


// RENDERIZADOR 
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LUZ 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 5, 3);
scene.add(light);


const player = new THREE.Group();
player.position.y = 0.5;
scene.add(player);


const loader = new GLTFLoader();


loader.load(
    'models/lake_track.glb',
    function (gltf) {
        const modelo = gltf.scene;

        modelo.scale.set(100, 100, 100);

        modelo.position.y = -1.5;
        modelo.position.z = -3;
        modelo.position.x = -20;

        modelo.rotation.y = Math.PI / 2;

        scene.add(modelo);
    },

    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% cargado');
    },
    function (error) {
        console.error('Error al cargar el modelo:', error);
    }
);

// KEYBOARD

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
};

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': keys.w = true; break;
        case 'KeyA': keys.a = true; break;
        case 'KeyS': keys.s = true; break;
        case 'KeyD': keys.d = true; break;
        case 'Space': keys.space = true; break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': keys.w = false; break;
        case 'KeyA': keys.a = false; break;
        case 'KeyS': keys.s = false; break;
        case 'KeyD': keys.d = false; break;
        case 'Space': keys.space = false; break;
    }
});



let movRotacional = 0;
let lanzamiento = 0;
const sensibilidad = 0.002;



renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});



document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === renderer.domElement) {
        movRotacional -= event.movementX * sensibilidad;
        lanzamiento -= event.movementY * sensibilidad;
        lanzamiento = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, lanzamiento));
    }
});

// FISICAS BASICAS Y ANIMACION

let velocidadY = 0;
const gravedad = -9.8;
const jumpForce = 5;
let enTierra = true;

const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();

    player.rotation.y = movRotacional;



    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();



    const rightDirection = new THREE.Vector3();
    rightDirection.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection).normalize();

    const speed = 5 * delta;


    if (keys.w) {
        player.position.addScaledVector(cameraDirection, speed);
    }
    if (keys.s) {
        player.position.addScaledVector(cameraDirection, -speed);
    }
    if (keys.a) {
        player.position.addScaledVector(rightDirection, speed);
    }
    if (keys.d) {
        player.position.addScaledVector(rightDirection, -speed);
    }

    // SALTO Y GRAVEDAD
    if (keys.space && enTierra) {
        velocidadY = jumpForce;
        enTierra = false;
    }

    velocidadY += gravedad * delta;
    player.position.y += velocidadY * delta;

    if (player.position.y <= 0.5) {
        player.position.y = 0.5;
        velocidadY = 0;
        enTierra = true;
    }


    const distance = 5;
    const height = 2;


    const cameraX = player.position.x + Math.sin(movRotacional) * distance;
    const cameraZ = player.position.z + Math.cos(movRotacional) * distance;
    const cameraY = player.position.y + height + Math.sin(lanzamiento) * 2;

    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();