import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Paddle {
    constructor(zPos, xMin, xMax, zMin, zMax, type, gameMode) {
        let modelPath, scale;
        switch (gameMode) {
            case 'normal':
                modelPath = '../models/paddle1.glb';
                scale = 1.4; // 正常模式球拍的大小
                break;
            case 'picnic':
                modelPath = '../models/ice_cream_paddle.glb';
                scale = 1.2; // 休閒模式球拍的大小
                break;
            case 'bird':
                modelPath = '../models/tube.glb';
                scale = 1; // 鳥模式球拍的大小
                break;
            default:
                console.error('Invalid mode selected');
                return;
        }

        this.mesh = new THREE.Group();  // 預設為空，稍後載入模型
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            model.scale.set(1.5 * scale, 1.5 * scale, 1.5 * scale);  // 調整大小
            //將模型移動到mesh的中心，旋轉後才不會偏移
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            model.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

            this.mesh.add(model);
        }, undefined, (error) => {
            console.error('載入桌子模型失敗:', error);
        });
        // 設定初始位置
        this.mesh.position.set(0, 12, zPos);
        this.type = type; // 預設為玩家球拍

        // 設定範圍
        this.bounds = {
            xMin: xMin,
            xMax: xMax,
            zMin: zMin,
            zMax: zMax
        };

        // 計算拍面速度要記錄前一幀位置
        this.previousPosition = this.mesh.position.clone();
        this.currentVelocity = new THREE.Vector3(0, 0, 0);
    }


    update(type, ball = null) {
        if (type === 'ai' && ball) {
            if (ball.mesh.position.z < 0 && ball.touchStart) {//過網才開始追求
                this.aiTraceball(ball);
            }
        }
        //球拍transform,在左半轉左
        if (this.mesh.position.x < -3) {
            this.mesh.rotation.z = -Math.PI / 3; // 120 度
        } else if (this.mesh.position.x > 3) {
            this.mesh.rotation.z = -Math.PI / 1.5; // 60 度
        } else {
            this.mesh.rotation.z = -Math.PI / 2; // 正常
        }
        // 限制球拍在範圍內
        this.setPosition(this.mesh.position.x, this.mesh.position.z);
        const currentPosition = this.mesh.position.clone();
        this.currentVelocity.subVectors(currentPosition, this.previousPosition); // 當前 - 上一幀
        this.previousPosition.copy(currentPosition); // 更新上一幀為現在
    }
    setPosition(x, z) {
        this.mesh.position.x = THREE.MathUtils.clamp(x, this.bounds.xMin, this.bounds.xMax);
        this.mesh.position.z = THREE.MathUtils.clamp(z, this.bounds.zMin, this.bounds.zMax);
    }
    getVelocity() {
        return this.currentVelocity.clone();
    }
    aiTraceball(ball) {
        const ballPos = ball.mesh.position;
        const aiPos = this.mesh.position;

        // 追球
        if (ballPos.x < this.bounds.xMax) {
            const dx = ballPos.x - aiPos.x;
            const dz = ballPos.z - aiPos.z;

            // 反應速度及靈活性（changable）
            const reactionSpeed = 0.07;

            // 限制範圍，防止出界
            const newX = THREE.MathUtils.clamp(aiPos.x + dx * reactionSpeed, this.bounds.xMin, this.bounds.xMax);
            const newZ = THREE.MathUtils.clamp(aiPos.z + dz * reactionSpeed, this.bounds.zMin, this.bounds.zMax);

            this.mesh.position.x = newX;
            this.mesh.position.z = newZ;
        }
    }
}
