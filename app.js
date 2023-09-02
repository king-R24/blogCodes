// 引入express插件包并生成一个实例app
const express = require('express')

const app = express()

// 使用body-parser中间件解析post请求主体
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// WebSocket
const webSocket = require('./websocket')
webSocket.initWebSocket(app)

// 3000
app.listen(3000)