import * as THREE from "three";
import { createSSRMaterial } from './shaders.js';

// ⭐ 预加载函数（关键）
export function loadTexture(path) {
    return new Promise(resolve => {
        new THREE.TextureLoader().load(path, tex => {
            resolve(tex);
        });
    });
}

export async function createCard(star) {

    let path =
        star === 5 ? '⭐⭐⭐⭐⭐' :
            star === 4 ? '⭐⭐⭐⭐' :
                '⭐⭐⭐';

    let texture = await loadTexture(path);

    let material = star === 5
        ? createSSRMaterial()
        : new THREE.MeshBasicMaterial({ map: texture });

    let geo = new THREE.PlaneGeometry(4, 6);
    let mesh = new THREE.Mesh(geo, material);

    return mesh; // ❗不在这里 add
}

export function initScene() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 10;

    return { scene, camera };
}