import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let bounceSound, paddleSound;
bounceSound = new Audio('../sounds/ping.mp3');
paddleSound = new Audio('../sounds/pong.mp3');

export class Ball {
    constructor(table, gameMode) {
        let modelPath;
        switch (gameMode) {
            case 'normal':
                modelPath = '../models/ball.glb';
                break;
            case 'picnic':
                modelPath = '../models/burger.glb';
                break;
            case 'bird':
                modelPath = '../models/bird.glb';
                break;
            default:
                console.error('Invalid mode selected');
                return;
        }
        this.mesh = new THREE.Group();  // 預設為空，稍後載入模型

        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            model.scale.set(2, 2, 2);  // 調整大小

            // 計算半徑
            const bbox = new THREE.Box3().setFromObject(model);
            const size = bbox.getSize(new THREE.Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z);
            this.radius = maxDimension / 2;

            this.mesh.add(model);
        });
        this.bounceFactor = 0.92;
        this.gravity = new THREE.Vector3(0, -0.02, 0);  // 調整重力
        this.table = table;  // 儲存桌子參考

        this.reset();
    }

    reset(side = 'player') {
        if (side == 'player') {
            this.mesh.position.set(5, 14, 26); // player發球位置
        }
        else if (side == 'ai') {
            const randomX = (Math.random() - 0.5) * 4; // 左右偏移 ±2
            const randomZ = -30 + Math.random() * 2;     // Z 軸前進 2~4

            this.mesh.position.set(randomX, 14, randomZ);
        }
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.touchStart = false; // 用於觸控開始位置
        this.bounceCount = 0; // 玩家反彈次數
        this.opponentBounceCount = 0; // AI 反彈次數
        this.lastHitter = null; // 最後觸球者
    }

    update(playerPaddle, aiPaddle, round) {
        // 加重力
        if (this.touchStart) {//控球開始，可以加重力
            this.velocity.add(this.gravity);
        }
        if (!this.touchStart) {
            if (round == 0 || round == 1) { //球根據玩家位置移動
                this.mesh.position.x = THREE.MathUtils.clamp(playerPaddle.mesh.position.x, -10, 10);
            }
            else {
                aiPaddle.mesh.position.z = this.mesh.position.z - 5; // AI球拍跟隨球位置
                aiPaddle.mesh.position.x = this.mesh.position.x; // AI球拍跟隨球位置
            }
        }

        this.mesh.position.add(this.velocity);// 更新球位置

        // 檢查桌面碰撞
        const pos = this.mesh.position;
        const tableBounds = this.table.bounds;
        const isOnTable = (
            pos.x > -tableBounds.width / 2 + this.radius &&
            pos.x < tableBounds.width / 2 - this.radius &&
            pos.z > -tableBounds.depth / 2 + this.radius &&
            pos.z < tableBounds.depth / 2 - this.radius
        );
        if (isOnTable && pos.y - this.radius < tableBounds.height) {
            bounceSound.play(); // 播放反彈音效
            this.bounceSide = this.mesh.position.z > 0 ? 'player' : 'ai';
            if (this.bounceSide == 'player') {
                this.bounceCount++;
            }
            else {
                this.opponentBounceCount++;
            }

            pos.y = tableBounds.height + this.radius;
            this.velocity.y *= -this.bounceFactor;
        }
        // 觸網偵測，網子高度12，網子範圍設定為 z 軸接近 0
        if (isOnTable && Math.abs(pos.z) < 0.5 && pos.y - this.radius < 12) {
            this.velocity.z *= -0.8;  // 反彈速度，保留一定的動能
            this.velocity.x *= 0.8;  // 減少 X 軸速度，模擬網子的摩擦
        }
    }

    checkPaddleCollision(paddle) {
        const ballPos = this.mesh.position;
        const paddlePos = paddle.mesh.position;
        const paddleBox = new THREE.Box3().setFromObject(paddle.mesh);

        // 如果球已進入冷卻期，不再偵測碰撞
        if (this.collisionCooldown && Date.now() - this.collisionCooldown < 1000) return;

        if (
            ballPos.x + this.radius > paddleBox.min.x &&
            ballPos.x - this.radius < paddleBox.max.x &&
            ballPos.y + this.radius > paddleBox.min.y &&
            ballPos.y - this.radius < paddleBox.max.y &&
            ballPos.z + this.radius > paddleBox.min.z &&
            ballPos.z - this.radius < paddleBox.max.z
        ) {
            paddleSound.play(); // 播放球拍碰撞音效
            if (paddle.type == 'player') { // 玩家球拍
                this.lastHitter = 'player'; // 記錄最後觸球者
                this.bounceCount = 0;// 玩家反彈次數歸零
                this.opponentBounceCount = 0;// AI 反彈次數歸零
                if (paddle.currentVelocity.z < 0) {
                    console.log("玩家發球");
                    this.touchStart = true; // 控球開始，可以加重力
                    this.collisionCooldown = Date.now();
                    const paddleVelocity = paddle.getVelocity ? paddle.getVelocity() : new THREE.Vector3(0, 0, 0);
                    // 計算偏移量
                    const offsetX = (ballPos.x - paddlePos.x);
                    const offsetY = Math.abs(ballPos.y - paddlePos.y);
                    // 計算反彈方向
                    const rebound = new THREE.Vector3(
                        offsetX * 0.05 + paddleVelocity.x * 0.3,  // 加入 paddle x 速度
                        -offsetY * 0.1 - paddleVelocity.y * 0.1 + paddleVelocity.z * 0.1,  // 加入 paddle z速度模擬抽球
                        -Math.abs(this.velocity.z) + paddleVelocity.z * 0.33 // z 反向 + 球拍速度
                    );
                    this.velocity.copy(rebound);
                }
            }
            else {// ai球拍
                this.lastHitter = 'ai';

                this.touchStart = true; // 控球開始，可以加重力
                this.opponentBounceCount = 0;
                this.bounceCount = 0;
                const previousDx = this.velocity.x;

                // AI回球根據球與AI的距離增加力度
                const distanceZ = Math.abs(ballPos.z - paddlePos.z);
                const baseZSpeed = 0.3;  // 基礎力度
                const extraPower = distanceZ * 0.1;  // 距離力道
                const finalZSpeed = baseZSpeed + extraPower;
                this.collisionCooldown = Date.now();


                this.velocity.x = 0.13 * previousDx;
                this.velocity.y = -Math.random() * 0.6;
                this.velocity.z = finalZSpeed; // 往玩家方向

            }
        }
    }
}
