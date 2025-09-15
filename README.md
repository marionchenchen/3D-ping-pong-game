# 3D Ping Pong Game

## 遊戲介紹

這是一個由 **Three.js** 製作的 3D 桌球遊戲，靈感來自於期末作業的 Flappy Bird，目的是模擬物理運動的效果。玩家可透過滑鼠控制球拍，與 AI 對手進行一場桌球比賽，先獲得 11 分者獲勝。

### 主要功能
* **3D 渲染**：使用 Three.js 渲染 3D 桌球桌面與球拍模型。
* **物理模擬**：包含球體物理運動與碰撞反應。
* **玩家控制**：玩家可控制球拍左右前後移動。
* **AI 對手**：AI 對手會根據球的位置自動移動與回擊。
* **遊戲系統**：包含計分系統，達成目標分數即結束比賽，以及遊戲開始、結束畫面切換。

---

## 系統架構與開發工具

本專案使用以下技術與工具開發：

* **HTML + CSS**：建立遊戲外框與樣式。
* **JavaScript (ES6)**：開發遊戲邏輯。
* **Node.js + NPM**：專案管理。
* **Three.js**：建立 3D 場景、模型、燈光與渲染。
* **GLTFLoader**：載入自訂 3D 模型。
* **Webpack**：組建專案、管理模組與依賴。
* **Babel**：編譯器，可將現代 JavaScript 轉換成舊版語法，以支援舊版瀏覽器。

專案程式碼分為多個模組，包含：`scene.js`、`table.js`、`ball.js`、`paddle.js`、`game.js`。

---

## 執行方法

請依照以下步驟在本地端啟動遊戲：

1.  下載專案檔案。
2.  安裝 Node.js (建議版本 22.16.0)。
3.  在終端機中，`cd` 進入專案目錄，並依序執行以下指令來安裝所有依賴套件：
    ```bash
    npm init -y
    npm install three
    npm install webpack webpack-cli webpack-dev-server --save-dev
    npm install babel-loader @babel/core @babel/preset-env --save-dev
    ```
4.  最後，執行以下指令來啟動開發伺服器：
    ```bash
    npm run start
    ```
    遊戲將在瀏覽器中啟動，你可以透過 `http://localhost:8080` 進入。

---

## 專案結構
---

## 遊戲畫面
* **開始畫面**：顯示標題與模式選擇按鈕，提供「簡單」、「中等」、「困難」三種模式。
* **遊戲中畫面**：包含桌球桌、球拍、球與得分顯示。不同模式有不同的主題、背景音樂與遊戲難度。
* **結束畫面**：展示比賽結果與「再玩一次」按鈕。

---

### Demo 影片
你可以透過以下連結觀看遊戲 Demo 影片：
[https://www.youtube.com/watch?v=0vQdoV7L9Js](https://www.youtube.com/watch?v=0vQdoV7L9Js)
