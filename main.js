import * as THREE from "three";
import { initScene, createCard } from './scene.js';
import { createRenderer, render } from './renderer.js';
import { getResult } from './gacha.js';

const { scene, camera } = initScene();
const { renderer, baseComposer, bloomComposer } = createRenderer(scene, camera);

let currentCard = null;

let money = 1600;
const cost = 160;
const moneyEl = document.getElementById("money");

function updateMoney() {
    moneyEl.innerText = money;
}

// ⭐ 动画状态
let anim = null;

function loop(time) {

    if (anim) {
        let t = (time - anim.start) / 600; // 600ms 动画
        t = Math.min(t, 1);

        // ⭐ 平滑插值（核心）
        anim.card.position.z = THREE.MathUtils.lerp(20, 0, t);
        anim.card.rotation.y = THREE.MathUtils.lerp(Math.PI, 0, t);
        let s = THREE.MathUtils.lerp(0.1, 1, t);
        anim.card.scale.set(s, s, 1);

        if (t === 1) {
            // ✅ 完全锁死
            anim.card.position.z = 0;
            anim.card.rotation.set(0, 0, 0);
            anim.card.scale.set(1, 1, 1);

            anim = null;
        }
    }

    // SSR shader
    scene.traverse(obj => {
        if (obj.material?.uniforms?.time) {
            obj.material.uniforms.time.value = time * 0.001;
        }
    });

    render(scene, camera, baseComposer, bloomComposer);
    requestAnimationFrame(loop);
}
loop();

window.draw = async function () {

    if (money < cost) {
        alert("金币不足！");
        return;
    }

    money -= cost;
    updateMoney();

    let star = getResult();

    // 删除旧卡
    if (currentCard) {
        scene.remove(currentCard);
    }

    // ⭐ 等贴图加载完（关键修复闪烁）
    let card = await createCard(star);

    // 初始状态（不会被渲染到错误位置）
    card.position.set(0, 0, 20);
    card.scale.set(0.1, 0.1, 1);
    card.rotation.y = Math.PI;

    scene.add(card);

    currentCard = card;

    anim = {
        card: card,
        start: performance.now()
    };

    if (star === 5) {
        card.layers.enable(1);
    }
};

document.getElementById("drawBtn").addEventListener("click", draw);

updateMoney();