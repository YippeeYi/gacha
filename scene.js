import * as THREE from "three";
import { createSSRMaterial } from './shaders.js';

export function initScene() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 10;

    return { scene, camera };
}


// ⭐ 绘制星星（优化排布）
function drawStars(ctx, star, cx, cy) {

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const sizeBig = 90;
    const sizeSmall = 70;

    if (star === 3) {
        ctx.font = `bold ${sizeBig}px Arial`;
        ctx.fillText("★ ★ ★", cx, cy);
    }

    else if (star === 4) {
        ctx.font = `bold ${sizeSmall}px Arial`;
        ctx.fillText("★ ★", cx - 60, cy);
        ctx.fillText("★ ★", cx + 60, cy);
    }

    else if (star === 5) {
        ctx.font = `bold ${sizeSmall}px Arial`;
        ctx.fillText("★ ★ ★", cx, cy - 40);
        ctx.fillText("★ ★", cx, cy + 50);
    }
}


// ⭐ 生成卡片纹理
function createCardTexture(star) {

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;

    const ctx = canvas.getContext("2d");

    let colors = {
        3: ["#3aa0ff", "#1c4fd7"],
        4: ["#a86bff", "#5b2bbd"],
        5: ["#ffd700", "#ff8c00"]
    };

    let [c1, c2] = colors[star];

    // 背景
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 边框
    ctx.strokeStyle = "white";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // ⭐ 星星（优化布局）
    drawStars(ctx, star, canvas.width / 2, canvas.height / 2);

    // 文本
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`${star} STAR`, canvas.width / 2, canvas.height * 0.8);

    return new THREE.CanvasTexture(canvas);
}


// ⭐ 创建卡片
export async function createCard(star) {

    let texture = createCardTexture(star);

    let material;

    if (star === 5) {
        material = createSSRMaterial();
        material.uniforms.map = { value: texture };
    } else {
        material = new THREE.MeshBasicMaterial({ map: texture });
    }

    // ✅ 卡片尺寸缩小（关键修改）
    let geo = new THREE.PlaneGeometry(2.2, 3.3);

    let mesh = new THREE.Mesh(geo, material);

    return mesh;
}