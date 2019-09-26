const io = require('../socketwork/weapp.socket.io.dev.js')
/**
 * 建立socket
 */
var socket
function startConnect(url, callBack) {
  //建立连接
  socket = io.connect(url, {
    transports: ['websocket'],
    forceNew: false,
    reconnectionDelay: 5000
  })
  //连接成功
  socket.on('connect', function(){
    callBack('connect', 'success')
  })
  //连接已断开
  socket.on('disconnect', function() {
    callBack('disconnect', 'faile')
  })
  //监听用户连接状态
  socket.on('response', function (data) {
    callBack('response', data)
  })
  //接收用户发送的消息
  socket.on('message', function(data) {
    callBack('message', data)
  })
  //监听用户结束会话
  socket.on('chat_end', function (data) {
    callBack('chat_end', data)
  })
  //正在排队的用户数量
  socket.on('queue_data', function (data) {
    callBack('queue_data', data)
  })
}
/**
 * 发送数据
 */
function socketSendMessage(event, message, callBack) {
  socket.emit(event, message, (data) => {
    callBack(event, data)
  })
}

/**
 * 断开连接
 */
function endSocketConnect() {
  socket.disconnect()
  socket = null
}
module.exports = {
  startConnect: startConnect,
  socketSendMessage: socketSendMessage,
  endSocketConnect: endSocketConnect
}