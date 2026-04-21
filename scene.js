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

// ⭐ 卡片尺寸（稍微调大一点但更清晰）
const CARD_W = 1.8;
const CARD_H = 2.7;

// ⭐ 高清Canvas（关键）
function createCanvas(star) {

    const canvas = document.createElement("canvas");

    // ⭐ 2倍高清（核心修复清晰度）
    canvas.width = 1024;
    canvas.height = 1536;

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
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    // ⭐ 更大字体（修复模糊）
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 140px Arial";
    ctx.fillText("★".repeat(star), canvas.width / 2, canvas.height * 0.45);

    ctx.font = "bold 80px Arial";
    ctx.fillText(`${star}★ CARD`, canvas.width / 2, canvas.height * 0.7);

    return canvas;
}

export async function createCard(star) {

    const canvas = createCanvas(star);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;

    let material = star === 5
        ? createSSRMaterial()
        : new THREE.MeshBasicMaterial({ map: tex });

    if (star === 5) {
        material.uniforms.map = { value: tex };
    }

    let geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
    return new THREE.Mesh(geo, material);
}