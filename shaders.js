import * as THREE from "three";

export function createSSRMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;

            void main(){
                float glow = 0.5 + 0.5*sin(vUv.y*10.0 + time*5.0);
                vec3 gold = vec3(1.0,0.84,0.0);
                gl_FragColor = vec4(gold * glow,1.0);
            }
        `
    });
}