let coins = 16000;
let pity5 = 0;
let pity4 = 0;
let pool;

let stats = { 3: 0, 4: 0, 5: 0 };

// ===== 加载卡池 =====
fetch("pool.json")
    .then(res => res.json())
    .then(data => pool = data);

// ===== 抽卡 =====
async function draw(n) {
    let cost = n === 10 ? 1600 : 160;
    if (coins < cost) return alert("没钱了");

    coins -= cost;
    updateCoins();

    let results = [];

    for (let i = 0; i < n; i++) {
        results.push(getResult());
    }

    await playDoor(results[0]); // 看第一张决定颜色
    showCards(results);
    saveHistory(results);
    updateChart();
}

// ===== 开门动画 =====
async function playDoor(firstStar) {
    let door = document.getElementById("door");
    door.classList.remove("hidden");

    if (firstStar === 5) {
        door.style.background = "gold";
    } else if (firstStar === 4) {
        door.style.background = "purple";
    } else {
        door.style.background = "blue";
    }

    await sleep(1000);
    door.classList.add("hidden");
}

// ===== 抽卡逻辑 =====
function getResult() {
    pity5++;
    pity4++;

    if (pity5 >= 90) {
        pity5 = 0;
        return 5;
    }

    if (pity4 >= 10) {
        pity4 = 0;
        return 4;
    }

    let r = Math.random();

    if (r < pool.rates.five) {
        pity5 = 0;
        return 5;
    } else if (r < pool.rates.five + pool.rates.four) {
        pity4 = 0;
        return 4;
    } else {
        return 3;
    }
}

// ===== 显示卡牌 =====
function showCards(results) {
    let container = document.getElementById("cards");
    container.innerHTML = "";

    results.forEach(star => {
        stats[star]++;

        let item = pool[star === 5 ? "five" : star === 4 ? "four" : "three"][0];

        let div = document.createElement("div");
        div.className = "card";

        let img = document.createElement("img");
        img.src = item.img;

        div.appendChild(img);
        container.appendChild(div);
    });
}

// ===== 历史记录 =====
function saveHistory(results) {
    let history = JSON.parse(localStorage.getItem("history") || "[]");
    history.push(...results);

    localStorage.setItem("history", JSON.stringify(history));

    document.getElementById("history").innerText =
        history.slice(-20).join(" ");
}

// ===== 统计图 =====
function updateChart() {
    let c = document.getElementById("chart");
    let ctx = c.getContext("2d");

    ctx.clearRect(0, 0, 300, 200);

    let total = stats[3] + stats[4] + stats[5];

    let heights = [
        stats[3] / total * 150,
        stats[4] / total * 150,
        stats[5] / total * 150
    ];

    ctx.fillRect(50, 200 - heights[0], 30, heights[0]);
    ctx.fillRect(120, 200 - heights[1], 30, heights[1]);
    ctx.fillRect(190, 200 - heights[2], 30, heights[2]);
}

// ===== 工具 =====
function updateCoins() {
    document.getElementById("coins").innerText = "💰" + coins;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}