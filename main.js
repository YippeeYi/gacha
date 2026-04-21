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
// ⭐ 全局锁（修复打断问题）
// ======================
let locked = false;
let queue = [];
let current = null;

function clearCards() {
    scene.children
        .filter(o => o.isMesh)
        .forEach(o => scene.remove(o));
}

// ======================
// ⭐ 动画循环（统一节奏）
// ======================
function loop(time) {

    if (current) {

        let t = (time - current.start) / current.duration;
        t = Math.min(t, 1);

        let c = current.card;

        if (t < 0.5) {
            let p = t / 0.5;
            c.position.z = THREE.MathUtils.lerp(25, 4, p);
            c.scale.setScalar(THREE.MathUtils.lerp(0.1, 0.85, p));
        }

        else if (t < 0.75) {
            c.position.z = 4;
        }

        else {
            let p = (t - 0.75) / 0.25;
            c.rotation.y = THREE.MathUtils.lerp(Math.PI, 0, p);
            c.scale.setScalar(THREE.MathUtils.lerp(0.85, 1, p));
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

    scene.traverse(o => {
        if (o.material?.uniforms?.time) {
            o.material.uniforms.time.value = time * 0.001;
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

    if (locked) return;
    locked = true;

    if (money < cost) {
        alert("金币不足");
        locked = false;
        return;
    }

    money -= cost;
    updateMoney();

    clearCards();

    let star = getResult();
    let card = await createCard(star);

    card.position.set(0, 0, 25);
    card.scale.set(0.1, 0.1, 1);
    card.rotation.y = Math.PI;

    scene.add(card);

    queue.push({ card, duration: 1000 });

    setTimeout(() => locked = false, 1200);
};

// ======================
// ⭐ 十连（节奏均匀 + 不出屏）
// ======================
window.draw10 = async function () {

    if (locked) return;
    locked = true;

    if (money < cost * 10) {
        alert("金币不足");
        locked = false;
        return;
    }

    money -= cost * 10;
    updateMoney();

    clearCards();

    let cards = [];

    for (let i = 0; i < 10; i++) {

        let star = getResult();
        let card = await createCard(star);

        let col = i % 5;
        let row = Math.floor(i / 5);

        card.position.set(
            (col - 2) * 1.9,
            (0.5 - row) * 2.3, // ⭐ 修复：整体下移
            25
        );

        card.scale.set(0.1, 0.1, 1);
        card.rotation.y = Math.PI;

        scene.add(card);

        if (star === 5) card.layers.enable(1);

        cards.push(card);
    }

    // ⭐ 均匀节奏（修复“不均匀”）
    cards.forEach((c, i) => {
        queue.push({
            card: c,
            duration: 700
        });
    });

    setTimeout(() => locked = false, 1800);
};

// UI
document.getElementById("drawBtn").addEventListener("click", draw);

const btn10 = document.createElement("button");
btn10.innerText = "十连抽";
btn10.onclick = draw10;
document.getElementById("ui").appendChild(btn10);

updateMoney();