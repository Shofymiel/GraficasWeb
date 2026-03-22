// IMPORTAMOS EL MOTOR PRINCIPAL DE THREE.JS
import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
// IMPORTAMOS EL GLTFLOADER - para que se lea los archivos de modelos 3d
import { GLTFLoader } from 'https://unpkg.com/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

import { RGBELoader } from 'https://unpkg.com/three@0.128.0/examples/jsm/loaders/RGBELoader.js';

// ESCENA - creamos la escena
const scene = new THREE.Scene();

const rgbeLoader = new RGBELoader();
rgbeLoader.load('assets/mud_road_puresky_2k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture; //para reflejar en los objetos
});

// CAMARA - son los ojos del jugador
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // simula la vista humana
// (los parametros de perspectiva son: campo de vision, proporcion de la pantalla, distancia minima, distancia maxima)
camera.position.set(2, 2, 5);  //ubicamos la camara en x,y,z


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

// PISO
//const planeGeometry = new THREE.PlaneGeometry(20, 20);
//const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc71 });
//const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//plane.rotation.x = -Math.PI / 2;
//plane.position.y = 0;
//scene.add(plane);

// 1. Creamos un grupo vacio que sera nuestro jugador y recibira las fisicas
const player = new THREE.Group();
player.position.y = 0.5;
scene.add(player);

// 2. Instanciamos el cargador de modelos en formato glb/gltf
const loader = new GLTFLoader();

// 3. Cargamos el modelo de prueba de la carpeta models
loader.load(
    'models/race-track.glb', 
    function (gltf) {
        const modelo = gltf.scene;

        // modelo.scale.set(0.5, 0.5, 0.5); 
        
        modelo.position.y = -0.5; 

        scene.add(modelo);
    },
    //el tiempo que tarda en descargarse el modelo 3d:
    function (xhr) { // es el evento  de carga que contiene la info descargada
        console.log((xhr.loaded / xhr.total * 100) + '% cargado'); // Barra de progreso en consola, si se cargo al 100% o no, solo para checar problemas en el modelo
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

// sistema del mouse

let movRotacional = 0; //movimiento rotacional horizontal de un vehiculo alrededor de su eje vertical
let lanzamiento = 0;
const sensibilidad = 0.002;

//bloquear mouse al hacer click

renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

//Moviemiento del mouse

document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === renderer.domElement) {
        movRotacional -= event.movementX * sensibilidad;
        lanzamiento -= event.movementY * sensibilidad;
        lanzamiento = Math.max(-Math.PI/3, Math.min(Math.PI/3, lanzamiento)); //limite vertical
    }
});

// FISICAS BASICAS Y ANIMACION

let velocidadY = 0;
const gravedad = -9.8;
const jumpForce = 5;
let enTierra = true;

const clock = new THREE.Clock(); //mide el tiempo entre fotogramas

function animate() {
    const delta = clock.getDelta();

    player.rotation.y = movRotacional; //mover horizontalmente al jugador (yaw)

    //obtener la direccion de la camara

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    //calcular direccion derecha

    const rightDirection = new THREE.Vector3();
    rightDirection.crossVectors(new THREE.Vector3(0,1,0), cameraDirection).normalize();

    const speed = 5 * delta;

    // Multiplicado por delta para que sea fluido independiente de los FPS
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

    // Posicionar cámara en tercera persona
    const distance = 5;
    const height = 2;
    
    // Calcular posición detrás del jugador
    const cameraX = player.position.x + Math.sin(movRotacional) * distance;
    const cameraZ = player.position.z + Math.cos(movRotacional) * distance;
    const cameraY = player.position.y + height + Math.sin(lanzamiento) * 2;
    
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();