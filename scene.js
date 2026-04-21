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


// ⭐ 核心：生成卡片纹理（Canvas）
function createCardTexture(star) {

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;

    const ctx = canvas.getContext("2d");

    // 🎨 颜色配置
    let colors = {
        3: ["#3aa0ff", "#1c4fd7"],   // 蓝
        4: ["#a86bff", "#5b2bbd"],   // 紫
        5: ["#ffd700", "#ff8c00"]    // 金
    };

    let [c1, c2] = colors[star];

    // ⭐ 背景渐变
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ⭐ 边框
    ctx.strokeStyle = "white";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // ⭐ 星级文字
    ctx.fillStyle = "white";
    ctx.font = "bold 120px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("★".repeat(star), canvas.width / 2, canvas.height / 2);

    // ⭐ 标注文字
    ctx.font = "bold 60px Arial";
    ctx.fillText(`${star} STAR`, canvas.width / 2, canvas.height * 0.75);

    // 转为 THREE 纹理
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}


// ⭐ 创建卡片
export async function createCard(star) {

    let texture = createCardTexture(star);

    let material = star === 5
        ? createSSRMaterial() // SSR用shader
        : new THREE.MeshBasicMaterial({ map: texture });

    // ⭐ 如果是SSR，用shader但叠加纹理（关键优化）
    if (star === 5) {
        material.uniforms.map = { value: texture };
    }

    let geo = new THREE.PlaneGeometry(4, 6);
    let mesh = new THREE.Mesh(geo, material);

    return mesh;
}