import * as THREE from "three";
import { initScene, createCard } from './scene.js';
import { createRenderer, render } from './renderer.js';
import { getResult } from './gacha.js';

const { scene, camera } = initScene();
const { renderer, baseComposer, bloomComposer } = createRenderer(scene, camera);

let money = 160000;
const cost = 160;

const moneyEl = document.getElementById("money");

function updateMoney() {
    moneyEl.innerText = money;
}

// ======================
// ⭐ 状态控制（关键）
// ======================
let locked = false;
let queue = [];
let current = null;

// ======================
// ⭐ 清理卡片
// ======================
function clearCards() {
    scene.children
        .filter(obj => obj.isMesh)
        .forEach(obj => scene.remove(obj));
}

// ======================
// ⭐ 动画循环
// ======================
function loop(time) {

    if (current) {

        let t = (time - current.start) / current.duration;
        t = Math.min(t, 1);

        let c = current.card;

        // 飞入
        if (t < 0.5) {
            let p = t / 0.5;
            c.position.z = THREE.MathUtils.lerp(25, 4, p);
            c.scale.setScalar(THREE.MathUtils.lerp(0.1, 0.8, p));
        }

        // 停顿
        else if (t < 0.75) {
            c.position.z = 4;
        }

        // 翻牌
        else {
            let p = (t - 0.75) / 0.25;
            c.rotation.y = THREE.MathUtils.lerp(Math.PI, 0, p);
            c.scale.setScalar(THREE.MathUtils.lerp(0.8, 1, p));
        }

        if (t === 1) {
            c.rotation.set(0, 0, 0);
            current = null;
        }
    }

    else if (queue.length > 0) {
        current = queue.shift();
        current.start = time;
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

// ======================
// ⭐ 单抽
// ======================
window.draw = async function () {

    if (locked) return; // ❗禁止重复抽卡
    locked = true;

    if (money < cost) {
        alert("金币不足！");
        locked = false;
        return;
    }

    money -= cost;
    updateMoney();

    clearCards(); // ⭐ 关键：清除旧卡

    let star = getResult();
    let card = await createCard(star);

    card.position.set(0, 0, 25);
    card.scale.set(0.1, 0.1, 1);
    card.rotation.y = Math.PI;

    scene.add(card);

    queue.push({
        card,
        duration: 1200
    });

    if (star === 5) {
        card.layers.enable(1);
    }

    // 解锁延迟（防止连点）
    setTimeout(() => locked = false, 1300);
};

// ======================
// ⭐ 十连抽（优化布局）
// ======================
window.draw10 = async function () {

    if (locked) return;
    locked = true;

    if (money < cost * 10) {
        alert("金币不足！");
        locked = false;
        return;
    }

    money -= cost * 10;
    updateMoney();

    clearCards(); // ⭐ 清空旧卡

    let cards = [];

    for (let i = 0; i < 10; i++) {

        let star = getResult();
        let card = await createCard(star);

        // ⭐ 居中网格（关键修复）
        let row = Math.floor(i / 5);
        let col = i % 5;

        let spacingX = 1.9;
        let spacingY = 2.6;

        card.position.set(
            (col - 2) * spacingX,
            (0.8 - row) * spacingY, // ⭐ 下移避免出屏
            25
        );

        card.scale.set(0.1, 0.1, 1);
        card.rotation.y = Math.PI;

        scene.add(card);

        if (star === 5) card.layers.enable(1);

        cards.push(card);
    }

    // ⭐ 顺序揭示
    cards.forEach((card, i) => {
        queue.push({
            card,
            duration: 700 + i * 80
        });
    });

    setTimeout(() => locked = false, 2000);
};

// UI
document.getElementById("drawBtn").addEventListener("click", draw);

const btn10 = document.createElement("button");
btn10.innerText = "十连抽（1600）";
btn10.onclick = draw10;
document.getElementById("ui").appendChild(btn10);

updateMoney();