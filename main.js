import * as THREE from "three";
import { initScene, createCard } from './scene.js';
import { createRenderer, render } from './renderer.js';
import { getResult } from './gacha.js';

const { scene, camera } = initScene();
const { renderer, baseComposer, bloomComposer } = createRenderer(scene, camera);

let money = 160000;
const cost = 160;

const moneyEl = document.getElementById("money");

// ⭐ UI更新
function updateMoney() {
    moneyEl.innerText = money;
}

// ⭐ 动画队列（核心）
let queue = [];
let current = null;

function loop(time) {

    // 当前动画
    if (current) {
        let t = (time - current.start) / current.duration;
        t = Math.min(t, 1);

        let card = current.card;

        // ⭐ 三阶段动画
        if (t < 0.4) {
            // 阶段1：远 → 近
            let p = t / 0.4;
            card.position.z = THREE.MathUtils.lerp(30, 5, p);
            card.scale.setScalar(THREE.MathUtils.lerp(0.1, 0.8, p));
        } else if (t < 0.7) {
            // 阶段2：停顿（制造仪式感）
            card.position.z = 5;
        } else {
            // 阶段3：翻牌
            let p = (t - 0.7) / 0.3;
            card.rotation.y = THREE.MathUtils.lerp(Math.PI, 0, p);
            card.scale.setScalar(THREE.MathUtils.lerp(0.8, 1, p));
        }

        // 结束
        if (t === 1) {
            card.rotation.set(0, 0, 0);
            current = null;
        }
    }
    // 队列调度（关键）
    else if (queue.length > 0) {
        current = queue.shift();
        current.start = time;
    }

    // SSR shader 动画
    scene.traverse(obj => {
        if (obj.material?.uniforms?.time) {
            obj.material.uniforms.time.value = time * 0.001;
        }
    });

    render(scene, camera, baseComposer, bloomComposer);
    requestAnimationFrame(loop);
}
loop();


// =====================
// ⭐ 单抽（优化版）
// =====================
window.draw = async function () {

    if (money < cost) {
        alert("金币不足！");
        return;
    }

    money -= cost;
    updateMoney();

    let star = getResult();

    let card = await createCard(star);

    // 初始状态（背面）
    card.position.set(0, 0, 30);
    card.scale.set(0.1, 0.1, 1);
    card.rotation.y = Math.PI;

    scene.add(card);

    queue.push({
        card: card,
        duration: 1200
    });

    // SSR发光
    if (star === 5) {
        card.layers.enable(1);
    }
};


// =====================
// 💥 十连抽（核心功能）
// =====================
window.draw10 = async function () {

    if (money < cost * 10) {
        alert("金币不足！");
        return;
    }

    money -= cost * 10;
    updateMoney();

    let cards = [];

    for (let i = 0; i < 10; i++) {

        let star = getResult();
        let card = await createCard(star);

        // ✅ 网格布局（不重叠）
        let row = Math.floor(i / 5);
        let col = i % 5;

        let spacingX = 2.6;
        let spacingY = 3.6;

        card.position.set(
            (col - 2) * spacingX,
            (1 - row) * spacingY,
            30
        );

        card.scale.set(0.1, 0.1, 1);
        card.rotation.y = Math.PI;

        scene.add(card);

        if (star === 5) {
            card.layers.enable(1);
        }

        cards.push(card);
    }

    cards.forEach((card, i) => {
        queue.push({
            card: card,
            duration: 800
        });
    });
};

// 绑定按钮
document.getElementById("drawBtn").addEventListener("click", draw);

// ⭐ 你需要在 HTML 里加这个按钮
const btn10 = document.createElement("button");
btn10.innerText = "十连抽（1600）";
btn10.onclick = draw10;
document.getElementById("ui").appendChild(btn10);

updateMoney();