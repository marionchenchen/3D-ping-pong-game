//setup scene
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export { scene, camera, renderer };//ES6 模組語法，讓其他模組可以導入這些變數
const renderer = new THREE.WebGLRenderer({ antialias: true }); //渲染器
const scene = new THREE.Scene();
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
    '../images/pretoria_gardens_4k.hdr',
    (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;//折射、反射使用的環境貼圖
        scene.background = texture;//場景的背景渲染
        console.log('HDR載入成功！');
    },
    undefined,
    (err) => {
        console.error('HDR載入失敗:', err);
    }
);
//相機
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);//(視野範圍, 場景的寬高比, near, far)
camera.position.set(0, 20, 30);      // 提高相機位置，俯視場景
camera.lookAt(0, 0, 0);              // 讓相機看向場景中心
camera.position.z = 40;

// 燈光
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);
// 方向光，模擬太陽光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);


// 視窗縮放響應
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



