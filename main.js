import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { initScene, createCard } from './scene.js';
import { createRenderer, render } from './renderer.js';
import { getResult } from './gacha.js';

const { scene, camera } = initScene();
const { renderer, baseComposer, bloomComposer } = createRenderer(scene, camera);

function loop() {
    render(scene, camera, baseComposer, bloomComposer);
    requestAnimationFrame(loop);
}
loop();

window.draw = async function () {
    let star = getResult();

    let card = createCard(scene, star);

    if (star === 5) {
        card.layers.enable(1); // ⭐ 只有SSR发光
    }
};

document.getElementById("drawBtn").addEventListener("click", draw);