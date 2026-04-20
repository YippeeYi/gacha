import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { createSSRMaterial } from './shaders.js';

export function initScene() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    return { scene, camera };
}

export function createCard(scene, star) {

    let texture = new THREE.TextureLoader().load(
        star === 5 ? 'assets/5.png' :
            star === 4 ? 'assets/4.png' :
                'assets/3.png'
    );

    let material = star === 5
        ? createSSRMaterial()
        : new THREE.MeshBasicMaterial({ map: texture });

    let geo = new THREE.PlaneGeometry(4, 6);
    let mesh = new THREE.Mesh(geo, material);

    scene.add(mesh);

    return mesh;
}