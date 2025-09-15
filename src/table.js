import * as THREE from 'three';
// 改成從 node_modules 載入
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Table {
    constructor(gameMode) {
        let modelPath;
        switch (gameMode) {
            case 'normal':
                modelPath = '../models/table2.glb';
                break;
            case 'picnic':
                modelPath = '../models/picnic_table.glb';
                break;
            case 'bird':
                modelPath = '../models/fasion_table.glb';
                break;
            default:
                console.error('Invalid mode selected');
                return;
        }
        this.mesh = new THREE.Group();  //稍後載入模型
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            model.scale.set(10, 10, 10);  // 調整大小
            model.position.y = -5;        // 調整位置
            this.mesh.add(model);
        }, undefined, (error) => {
            console.error('載入桌子模型失敗:', error);
        });
        // 設定桌面範圍
        this.bounds = {
            width: 33,
            depth: 55,
            height: 10
        };
    }
}
