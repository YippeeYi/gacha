import * as THREE from "three";

export function createSSRMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            map: { value: null } // ⭐ 加这个
        },
        vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform sampler2D map;
            varying vec2 vUv;

            void main(){

                vec4 tex = texture2D(map, vUv);

                float glow = 0.5 + 0.5*sin(vUv.y*10.0 + time*5.0);
                vec3 gold = vec3(1.0,0.84,0.0);

                // ⭐ 叠加发光
                vec3 finalColor = tex.rgb + gold * glow * 0.5;

                gl_FragColor = vec4(finalColor, tex.a);
            }
        `
    });
}