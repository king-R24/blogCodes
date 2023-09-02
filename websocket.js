const express = require('express');
const router = express.Router();
const expressWs = require('express-ws')
// 初始化
let WS = null;
// 声明一个通道类
let channels = null;
function initWebSocket(app) {
  WS = expressWs(app) //混入app, wsServer 存储所有已连接实例
  // 创建通道
  channels = new channel(router)
  channels.createChannel('ws')
  channels.createChannel('ws2')
  app.use(router)
}
// 通道类
class channel {
  router;
  clients = {
    allClients: [],//存放通过当前类所创建的通道中所有已连接用户
  };
  constructor(props) {
    this.router = props;
  }
  createChannel(path) {
    this.clients[path] = []; //用于存放当前通道中的用户
    // 建立通道
    this.router.ws('/' + path, (ws, req) => {
      // 保存用户
      this.saveClients(ws, req, path)
      ws.on('message', (msg) => getMsg(msg, path))
      ws.on('close', (code) => close(code, path))
      ws.on('error', (e) => error(e, path))
    })
  }

  // 保存用户
  saveClients(socket, req, path) {
    let client = {
      id: req.query.id,
      socket,
    }
    this.clients.allClients.push(client)
    this.clients[path].push(client)
  }
}
/**
 * 
 * @param {*} msg 消息内容
 * @param {String} from 消息来源
 */
// 监听消息
let getMsg = (msg, from) => {
  switch (from) {
    case 'ws':
      console.log('ws:', msg);
      break;
  }
  SendMsgAll({ data: msg })
}
// 发送消息
let sendMsg = (client, data) => {
  if (!client) return
  client.send(JSON.stringify(data))
}
let close = (code) => {
  console.log('关闭连接', code);
}
let error = (e) => {
  console.log('error: ', e);
}
// 群发
/**
 * 
 * @param {String} path 需要发送的用户来源 路由，默认全部
 * @param {*} data 发送的数据
 */
function SendMsgAll({ path = '/', data = "" }) {
  let allClientsList = Array.from(WS.getWss(path).clients)
  for (let key in allClientsList) {
    let client = allClientsList[key]
    if (client._readyState == 1) {
      sendMsg(client, data)
    }
  }
}
module.exports = {
  initWebSocket,
  SendMsgAll
}