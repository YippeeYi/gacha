import * as THREE from "three";
import { initScene, createCard } from './scene.js';
import { createRenderer, render } from './renderer.js';
import { getResult } from './gacha.js';

const { scene, camera } = initScene();
const { renderer, baseComposer, bloomComposer } = createRenderer(scene, camera);

let currentCard = null;
let animatingCard = null;

let money = 1600;
const cost = 160;
const moneyEl = document.getElementById("money");

function updateMoney() {
    moneyEl.innerText = money;
}

function loop(time) {

    if (animatingCard) {

        // ⭐ 位移
        animatingCard.position.z -= 0.6;

        // ⭐ 旋转（缓慢减速）
        animatingCard.rotation.y *= 0.9;

        // ⭐ 缩放
        let s = animatingCard.scale.x;
        if (s < 1) {
            let ns = Math.min(1, s + 0.06);
            animatingCard.scale.set(ns, ns, 1);
        }

        // ⭐ 到位
        if (animatingCard.position.z <= 0) {
            animatingCard.position.z = 0;

            // ✅ 强制归正（关键修复）
            animatingCard.rotation.set(0, 0, 0);
            animatingCard.scale.set(1, 1, 1);

            animatingCard = null;
        }
    }

    // ⭐ SSR 动态 shader
    scene.traverse(obj => {
        if (obj.material && obj.material.uniforms?.time) {
            obj.material.uniforms.time.value = time * 0.001;
        }
    });

    render(scene, camera, baseComposer, bloomComposer);
    requestAnimationFrame(loop);
}
loop();

window.draw = function () {

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

    let card = createCard(scene, star);

    // ✅ 关键：先设置好“最终不会闪”的初始状态
    card.position.set(0, 0, 20);   // 远处
    card.scale.set(0.1, 0.1, 1);

    // ⭐ 给一个初始旋转（但会被动画拉回0）
    card.rotation.y = Math.PI * 1.2;

    currentCard = card;
    animatingCard = card;

    if (star === 5) {
        card.layers.enable(1);
    }
};

document.getElementById("drawBtn").addEventListener("click", draw);

updateMoney();