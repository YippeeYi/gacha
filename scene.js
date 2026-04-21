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


// ⭐ 卡片尺寸（统一缩小 + 提高清晰度）
const CARD_W = 1.6;
const CARD_H = 2.4;


// ⭐ 星星绘制（更清晰）
function drawStars(ctx, star, w, h) {

    ctx.fillStyle = "white";
    ctx.font = "bold 64px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("★".repeat(star), w / 2, h * 0.45);

    ctx.font = "bold 32px Arial";
    ctx.fillText(`${star}★ CARD`, w / 2, h * 0.7);
}


// ⭐ 生成卡片
export async function createCard(star) {

    const canvas = document.createElement("canvas");

    // ⭐ 提高清晰度（关键）
    canvas.width = 512;
    canvas.height = 768;

    const ctx = canvas.getContext("2d");

    let colors = {
        3: ["#3aa0ff", "#1c4fd7"],
        4: ["#a86bff", "#5b2bbd"],
        5: ["#ffd700", "#ff8c00"]
    };

    let [c1, c2] = colors[star];

    let g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    drawStars(ctx, star, canvas.width, canvas.height);

    let tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;

    let material = star === 5
        ? createSSRMaterial()
        : new THREE.MeshBasicMaterial({ map: tex });

    if (star === 5) {
        material.uniforms.map = { value: tex };
    }

    let geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
    let mesh = new THREE.Mesh(geo, material);

    return mesh;
}