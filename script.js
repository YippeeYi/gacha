let coins = 16000;
let pity5 = 0;
let pity4 = 0;

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

function updateCoins() {
    document.getElementById("coins").innerText = "💰 " + coins;
}

// ===== 抽卡概率 =====
function randomCard() {
    pity5++;
    pity4++;

    if (pity5 >= 90) {
        pity5 = 0;
        pity4 = 0;
        return 5;
    }

    if (pity4 >= 10) {
        pity4 = 0;
        return 4;
    }

    let r = Math.random();

    if (r < 0.006) {
        pity5 = 0;
        pity4 = 0;
        return 5;
    } else if (r < 0.057) {
        pity4 = 0;
        return 4;
    } else {
        return 3;
    }
}

// ===== 抽卡入口 =====
async function draw(n) {
    let cost = n === 10 ? 1600 : 160;

    if (coins < cost) {
        alert("没钱了");
        return;
    }

    coins -= cost;
    updateCoins();

    let results = [];

    for (let i = 0; i < n; i++) {
        results.push(randomCard());
    }

    await playAnimation(results);
}

// ===== 动画主流程 =====
async function playAnimation(results) {
    let container = document.getElementById("cards");
    container.innerHTML = "";

    for (let i = 0; i < results.length; i++) {
        let star = results[i];

        // ⭐ 五星特效
        if (star === 5) {
            flashGold();
            spawnParticles();
            await sleep(600);
        }

        let card = createCard(star);
        container.appendChild(card);

        await sleep(150);

        // 翻牌
        setTimeout(() => {
            card.classList.add("show");
        }, 50);

        await sleep(200);
    }
}

// ===== 创建卡牌 =====
function createCard(star) {
    let card = document.createElement("div");
    card.className = "card";

    let inner = document.createElement("div");
    inner.className = "inner";

    let back = document.createElement("div");
    back.className = "back";
    back.innerText = "?";

    let front = document.createElement("div");
    front.className = "front";

    if (star === 3) {
        front.classList.add("three");
        front.innerText = "⭐⭐⭐";
    } else if (star === 4) {
        front.classList.add("four");
        front.innerText = "⭐⭐⭐⭐";
    } else {
        front.classList.add("five");
        front.innerText = "⭐⭐⭐⭐⭐";
    }

    inner.appendChild(back);
    inner.appendChild(front);
    card.appendChild(inner);

    return card;
}

// ===== 金光闪烁 =====
function flashGold() {
    document.body.classList.add("gold-flash");
    setTimeout(() => {
        document.body.classList.remove("gold-flash");
    }, 600);
}

// ===== 粒子效果 =====
function spawnParticles() {
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 60
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        ctx.fillRect(p.x, p.y, 3, 3);

        if (p.life <= 0) particles.splice(i, 1);
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// ===== 工具 =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}