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

    // ⭐ 动画更新
    if (animatingCard) {
        animatingCard.position.z -= 0.2;
        animatingCard.rotation.y += 0.05;

        let s = animatingCard.scale.x;
        if (s < 1) {
            animatingCard.scale.set(s + 0.05, s + 0.05, 1);
        }

        // 到位停止
        if (animatingCard.position.z <= 0) {
            animatingCard.position.z = 0;
            animatingCard.scale.set(1, 1, 1);
            animatingCard = null;
        }
    }

    // ⭐ SSR shader 动起来
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

    // 初始动画状态
    card.position.z = 20;
    card.scale.set(0.1, 0.1, 1);

    animatingCard = card;
    currentCard = card;

    if (star === 5) {
        card.layers.enable(1);
    }
};

document.getElementById("drawBtn").addEventListener("click", draw);

updateMoney();