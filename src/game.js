// handle game logic and rendering
import * as THREE from 'three';
import { Table } from './table.js';
import { Ball } from './ball.js';
import { Paddle } from './paddle.js';
import { scene, camera, renderer } from './scene.js';

// 全域物件
let table, ball, playerPaddle, aiPaddle;
let playerScore = 0, aiScore = 0, maxScore = 11, round = 0, gameMsg = '';
let gameRunning = false;
let gameMode;
let backgroundMusic, buttonSound, winSound, loseSound;
buttonSound = new Audio('../sounds/button.mp3');
winSound = new Audio('../sounds/win.mp3');
loseSound = new Audio('../sounds/gameover.mp3');
// 初始化文字分數（直接操作 #scoreboard）
const scoreElement = document.getElementById('scoreboard');
const gameInfoElement = document.getElementById('gameState');

function initGame() {
    while (scene.children.length > 0) {    // 清理 scene（可選，防止重新啟動後堆積）
        scene.remove(scene.children[0]);
    }
    renderer.setSize(window.innerWidth, window.innerHeight); //設置渲染器大小
    renderer.domElement.style.position = 'absolute'; // 絕對定位
    document.getElementById('game').appendChild(renderer.domElement);
    // 初始化桌子、球、球拍
    table = new Table(gameMode);
    scene.add(table.mesh);
    ball = new Ball(table, gameMode);
    scene.add(ball.mesh);
    playerPaddle = new Paddle(30, -30, 30, 2, 40, 'player', gameMode);
    scene.add(playerPaddle.mesh);
    aiPaddle = new Paddle(-30, -30, 30, -35, -20, 'ai', gameMode);
    scene.add(aiPaddle.mesh);

    playerScore = 0;
    aiScore = 0;
    gameMsg = '';
    updateScore();
    ball.reset('player'); // 重置球位置
}

function updateScore(gameState) {
    scoreElement.innerText = `玩家: ${playerScore} | AI: ${aiScore}`;
    gameInfoElement.innerText = gameState;
}


window.startGame = function (mode) {
    buttonSound.play(); // 播放按鈕音效
    gameMode = mode;
    console.log("遊戲開始！");
    document.getElementById('gameInfo').style.display = 'none';
    document.getElementById('scoreboard').style.display = 'block';
    document.getElementById('gameState').style.display = 'block';

    initGame();
    gameRunning = true;
    // 創建背景音樂
    switch (mode) {
        case 'normal':
            backgroundMusic = new Audio('../sounds/bgm1.mp3');
            break;
        case 'picnic':
            backgroundMusic = new Audio('../sounds/bgm2.mp3');
            break;
        case 'bird':
            backgroundMusic = new Audio('../sounds/bgm3.mp3');
            break;
    }
    backgroundMusic.loop = true; // 設置音樂循環播放
    backgroundMusic.volume = 0.5; // 設置音量
    backgroundMusic.play(); // 播放音樂
};

window.restartGame = function () {
    buttonSound.play();
    playerScore = 0;
    aiScore = 0;
    console.log("重啟遊戲！");
    document.getElementById('endScreen').style.display = 'none';
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('gameState').style.display = 'none';
    document.getElementById('gameInfo').style.display = 'block';
    // 找到 Three.js 渲染器的 DOM 元素
    const canvas = renderer?.domElement; // 假設 renderer 是全域變數或能存取到
    if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
    // 清空場景
    scene?.clear();
};
function endGame() {
    console.log("playersocre:", playerScore, "aiscore:", aiScore);
    if (playerScore == maxScore) {
        document.getElementById('gameResult').innerHTML = `<h1> You win!</h1>`;
        winSound.play(); // 播放勝利音效
    }
    else {
        document.getElementById('gameResult').innerHTML = `<h1> You lose~</h1>`;
        loseSound.play(); // 播放失敗音效
    }
    document.getElementById('endScreen').style.display = 'block';
    document.getElementById('finalScore').innerHTML = `<p>player ${playerScore} : AI ${aiScore}</p>`;
    gameRunning = false;
    backgroundMusic.pause();
}

// 重置遊戲
function resetRound() {
    round = (playerScore + aiScore) % 4;
    if (round == 2 || round == 3) {
        ball.reset('ai');
        setTimeout(() => {
            aiServeBall();
        }, 2000); // 延遲2秒後AI發球
    }
    else {
        ball.reset('player');
    }
    aiPaddle.mesh.position.set(0, 12, -40); // 重置 AI 球拍位置
}
function aiServeBall() {
    console.log("AI 發球！");
    ball.velocity.set(
        (Math.random() - 0.5) * 0.3,  // 隨機左右偏移
        Math.random() * 0.3 + 0.25,    // 向上輕微拋球
        0.35 + Math.random() * 0.2         // 朝玩家方向的力度
    );

    ball.touchStart = true;  // 允許球受重力影響
    ball.lastHitter = 'ai';  // 記錄發球者
}

// 判定得分
function checkScore() {
    const pos = ball.mesh.position;
    if (ball.touchStart) {
        if (ball.opponentBounceCount >= 2) {    // 如果連續反彈超過兩次
            playerScore++;
            gameMsg = "AI連續反彈超過兩次，玩家得分";
            resetRound();
        }
        else if (ball.bounceCount >= 2) { // 玩家連續反彈超過兩次
            aiScore++;
            gameMsg = "玩家連續反彈超過兩次，AI得分";
            resetRound();
        }
        else if (ball.lastHitter == "player" && ball.bounceCount == 1 && ball.opponentBounceCount == 1 && pos.y < table.bounds.height) { // ai沒接到
            playerScore++;
            gameMsg = "AI沒接到球，玩家得分";
            resetRound();
        }
        else if (ball.lastHitter == "ai" && ball.opponentBounceCount == 1 && ball.bounceCount == 1 && pos.y < table.bounds.height) { // 玩家沒接到
            aiScore++;
            gameMsg = "玩家沒接到球，AI得分";
            resetRound();
        }
        else if (ball.lastHitter == "player" && ball.bounceCount == 0 && pos.z < -1) { // 玩家未反彈犯規
            aiScore++;
            gameMsg = "玩家未反彈犯規，AI得分";
            resetRound();
        }
        else if (ball.lastHitter == "ai" && ball.opponentBounceCount == 0 && pos.z > 1) { // AI未反彈犯規
            playerScore++;
            gameMsg = "AI未反彈犯規，玩家得分";
            resetRound();
        }
        else if (ball.lastHitter == "ai" && ball.bounceCount == 0 && pos.y < table.bounds.height) { // AI出界
            playerScore++;
            gameMsg = "AI出界，玩家得分";
            resetRound();
        }
        else if (ball.lastHitter == "player" && ball.opponentBounceCount == 0 && pos.y < table.bounds.height) { // 玩家出界
            aiScore++;
            gameMsg = "玩家出界，AI得分";
            resetRound();
        }
        else if (ball.lastHitter == "ai" && pos.y < table.bounds.height && pos.z < 0) { // AI出自己的界
            playerScore++;
            gameMsg = "AI出自己的界，玩家得分";
            resetRound();
        }
        else if (ball.lastHitter == "player" && pos.y < table.bounds.height && pos.z > 0) { // 玩家出自己的界
            aiScore++;
            gameMsg = "玩家出自己的界，AI得分";
            resetRound();
        }
    }
    // 顯示分數
    updateScore(gameMsg)
    // 判定勝負
    if (playerScore >= maxScore) {
        endGame();
    }
    if (aiScore >= maxScore) {
        endGame();
    }
}

// 遊戲主循環
function animate() {
    requestAnimationFrame(animate);
    if (gameRunning) {
        playerPaddle.update('player', ball);//指示ai是否要追球
        aiPaddle.update('ai', ball);//指示ai是否要追球
        ball.update(playerPaddle, aiPaddle, round);
        ball.checkPaddleCollision(playerPaddle);
        ball.checkPaddleCollision(aiPaddle);
        checkScore();
        renderer.render(scene, camera);
    }
}
animate();

// 初始化 Raycaster 和 Vector2
const raycaster = new THREE.Raycaster();//映射用raycaster而不是偏移
const mouse = new THREE.Vector2();

// 滑鼠移動監聽
document.addEventListener('mousemove', (event) => {
    //滑鼠射線投射到這個平面
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // 設定 Raycaster
    raycaster.setFromCamera(mouse, camera);

    // 滑鼠射線投射到桌面
    const planeY = 12; // 桌面高度
    const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), planeY);

    // 計算交點
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    // 設定球拍位置（限制邊界）
    if (gameRunning) {
        playerPaddle.mesh.position.x = THREE.MathUtils.clamp(intersection.x, playerPaddle.bounds.xMin, playerPaddle.bounds.xMax);
        playerPaddle.mesh.position.z = THREE.MathUtils.clamp(intersection.z, playerPaddle.bounds.zMin, playerPaddle.bounds.zMax);
    }
});

