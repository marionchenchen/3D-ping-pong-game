const path = require('path');

module.exports = {
    entry: './src/game.js',     // 進入點指定入口檔案
    output: {
        filename: 'bundle.js',    // 輸出檔案
        path: path.resolve(__dirname, 'dist'),  // 輸出目錄
    },
    mode: 'development',        // 或 'production'
    module: {
        rules: [
            {
                test: /\.js$/,        // 處理 JS
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',  // 如果需要 Babel 可安裝
                },
            },
            {
                test: /\.css$/,       // 處理 CSS
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|glb|gltf)$/,  // 處理圖片與模型
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'assets',
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        static: './',
        port: 8080,
        open: true,
        hot: true,
    },
    resolve: {
        extensions: ['.js'],
    },
};
