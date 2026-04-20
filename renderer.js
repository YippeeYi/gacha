import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/postprocessing/UnrealBloomPass.js';

const BLOOM_LAYER = 1;

export function createRenderer(scene, camera) {

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const baseComposer = new EffectComposer(renderer);
    baseComposer.addPass(new RenderPass(scene, camera));

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(new RenderPass(scene, camera));
    bloomComposer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        2, 0.4, 0.85
    ));

    return { renderer, baseComposer, bloomComposer };
}

export function render(scene, camera, baseComposer, bloomComposer) {

    camera.layers.set(1);
    bloomComposer.render();

    camera.layers.set(0);
    baseComposer.render();
}