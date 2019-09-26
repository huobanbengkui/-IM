const socketServer = require('../socketwork/socketserver.js')
const utils = require('../../util.js')
const serverDefine = require('../server.define.js')
const netWorkAdapter = require('../httpnetwork/network.adapter.js')
const tools = require('../../tools/commonTools.js')

var listenerObj   //订阅者模式
var listChatArray = new Array()  //会话列表

function connectSocketServer() {
  let url = serverDefine.serverDefine.socketUrl + serverDefine.serverDefine.nsp
  let resultUrl = url + '?' + 'id=' + utils.userInfo.userId + '&channel=' + utils.userInfo.channel + '&deviceId=' + utils.userInfo.deviceId + '&token=' + utils.userInfo.token + '&ip=' + utils.userInfo.ip + '&appResource=' + utils.userInfo.appResource + '&nickname=' + utils.userInfo.userName + '&os=' + utils.userInfo.os + '&avatar=' + utils.userInfo.avatar
  
  socketServer.startConnect(resultUrl, function(type, data) {
    switch (type) {
      case 'connect':
        console.log("连接成功")
        // 每次连接成功，都获取一次实时会话列表
        getContext()
        break
      case 'disconnect':
        console.log("连接失败")
        break
      case 'response':
        console.log('44444444444')
        // 不在工作时间 - 处理为一条系统类型的消息
        if (data.code == 900001) {
          var resultData = data
          resultData.content = data.workTimeMsg
          resultData.type = 'STATUS'
          resultData.direction = 'OUT'
          console.log(resultData)
          listenerObj.emit('message', resultData)
        }
        //新用户进来
        getNewResponse(data)
        // 监听用户连接状态
        if (listenerObj != undefined) {
          listenerObj.emit('response', data)
        }
        break
      case 'message':
        console.log('33333333333')
        //更新未读消息数
        updateMessageUnReadNumber(data)
        // 接收用户发送的消息
        if (listenerObj != undefined) {
          listenerObj.emit('message', data)
        }
        break
      case 'chat_end':
        console.log('222222222222')
        // 实时会话列表中，置会话ID为空
        let tenantId = data.tenantId
        for(var index in listChatArray) {
          let dic = listChatArray[index]
          if (dic.tenantId == tenantId) {
            dic.contextId = ''
            listChatArray.splice(index, 1)
            listChatArray.unshift(dic)
            if (listenerObj != undefined) {
              listenerObj.emit('listChat', listChatArray)
            }
            break
          }
        }
        // 监听用户结束会话
        if (listenerObj != undefined) {
          listenerObj.emit('chat_end', data)
        }
        break
      case 'queue_data':
        console.log('1111111111111')
        // 正在排队的用户数量
        if (listenerObj != undefined) {
          listenerObj.emit('queue_data', data)
        }
        break
    }
  })
}
/**
 * 发送数据
 */
function socketSendMessage(event, message, callBack) {
  socketServer.socketSendMessage(event, message, function(event, data) {
    console.log('aaaaaaaaaaaaa')
    console.log(data)
    if (data.code == 0 || data.code == 200 || data.code == 2000 || data.code == 2001 || data.code == 2002) {
      callBack(event, data)
    }else {
      wx.showToast({
        title: data.msg,
        icon: 'none',
        duration: 2000
      })
    }
  })
}
/**
 * 断开连接
 */
function endSocketConnect() {
  socketServer.endSocketConnect()
}
/**
 * 生成一条本地消息，然后进行发送给自己
 */
function createLocalMessage(message, chatType, tenantId, type, senderSeq) {
  // chatType: "CHATBOT"
  // content: "我是机器人淘淘，很高兴为您服务！"
  // direction: "OUT"
  // serverSeq: "S190828144924000001"
  // tenantId: "6969_1"
  // time: 1566974964349
  // type: "TEXT"
  // userId: "131435784537590606"
  var localMessage = { 
    chatType: chatType,
    content: message,
    tenantId: tenantId,
    direction: 'IN',
    senderSeq: senderSeq,
    serverSeq: senderSeq,
    time: (new Date()).getTime(),
    type: type}
  if (listenerObj != undefined) {
    listenerObj.emit('message', localMessage)
  }
}
/**
 * 生成一条本地消息，本地消息是关于商品的
 */
function createLocalMessageWithGoods(type, content, tenantId) {
  console.log(type)
  console.log(content)
  var typeStr
  if (type == 'goods') {  // 咨询商品
    typeStr = 'GOODS'
  } else if (type == 'order') {  // 咨询订单
    typeStr = 'ORDER'
  } else if (type == 'sureOrder') { // 确认订单
    typeStr = 'SUREORDER'
  }else {
    return
  }
  let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
  var localMessage = {
    chatType: 'AGENT',
    content: content,
    tenantId: tenantId,
    direction: 'OUT',
    senderSeq: senderSeq,
    serverSeq: senderSeq,
    time: (new Date()).getTime(),
    type: typeStr
  }
  if (listenerObj != undefined) {
    listenerObj.emit('message', localMessage)
  }
}
/**
* 获取实时会话列表
*/
async function getContext() {
  listChatArray.splice(0, listChatArray.length)
  let data = await netWorkAdapter.getContext()
  if (data.code) {
    let resultArray = data.data
    for (let item in resultArray) {
      let resultDic = resultArray[item]
      var midDic = { 'imageUrl': 'http://img5.imgtn.bdimg.com/it/u=773876083,1055415286&fm=26&gp=0.jpg', 'tenantId': resultDic.tenantId, 'content': '', 'time': tools.timestampToTime(resultDic.time), 'contextId': resultDic.contextId, 'status': resultDic.status}
      // status 0 排队中 1 会话中
      //是否正在会话
      midDic['isSession'] = 0
      //未读消息数
      midDic['unreadMessageNumber'] = 0
      midDic['lastMessage'] = ''
      listChatArray.push(midDic)
    }
  }
  // 不管网络请求成功或者失败，都会走这个接口   
  // 获取历史会话内容
  getHistroyStorage()

  if (listenerObj != undefined) {
    listenerObj.emit('listChat', listChatArray)
  }
}
/**
 * 新用户进来
 */
function getNewResponse(data) {
  // 有新的会话进来，刷新实时会话列表
  var midDic 
  let newTenantId = data.tenantId
  for (var index in listChatArray) {
    let dic = listChatArray[index]
    if (dic.tenantId == newTenantId) {
      midDic = dic
      listChatArray.splice(index, 1)
      break
    }
  }
  var status, isSession
  if (data.code == 200) {
    status = 1    // 会话中
    isSession = 1
  } else if (data.code == 201) {
    status = 0    // 排队中
    isSession = 0
  } else {
    status = -1   // 状态异常
    isSession = 0
  }
  if (status > -1) {
    var dic = { 'imageUrl': 'http://img5.imgtn.bdimg.com/it/u=773876083,1055415286&fm=26&gp=0.jpg', 'tenantId': data.tenantId, 'content': '', 'time': tools.timestampToTime(data.time), 'contextId': data.contextId, 'status': status }
    //是否正在会话
    dic['isSession'] = isSession
    //未读消息数
    if (midDic == undefined) {
      dic['unreadMessageNumber'] = 0
      dic['lastMessage'] = ''
    }else {
      dic['unreadMessageNumber'] = midDic.unreadMessageNumber
      dic['lastMessage'] = midDic.lastMessage
    }
    listChatArray.unshift(dic)
    if (listenerObj != undefined) {
      listenerObj.emit('listChat', listChatArray)
    }
  } 
}
/**
 * 修改实时会话列表中，会话状态
 */
function changeListChatIsSession(tenantId, isSession) {
  for (var index in listChatArray) {
    let dic = listChatArray[index]
    if (dic.tenantId == tenantId) {
      listChatArray.splice(index, 1)
      // 设置会话状态
      dic['isSession'] = isSession
      // 设置未读消息数为 0
      dic['unreadMessageNumber'] = 0
      listChatArray.splice(index, 0, dic)
      break
    }
  }
  if (listenerObj != undefined) {
    listenerObj.emit('listChat', listChatArray)
  }
}
/**
 * 新进消息，添加未读消息数
 */
function updateMessageUnReadNumber(messageData) {
  for (var index in listChatArray) {
    let dic = listChatArray[index]
    if (dic.tenantId == messageData.tenantId) {
      listChatArray.splice(index, 1)
      //判断会话状态 没有正在会话，未读消息数+1
      if (dic['isSession'] == 0) {
        //修改未读消息数
        dic['unreadMessageNumber'] = dic['unreadMessageNumber'] + 1
        if (dic['unreadMessageNumber'] > 99) {
          dic['unreadMessageNumber'] = 99
        }
      }
      //最后一条消息
      var lastMessage = ''
      if (messageData.type == 'IMAGE') {
        lastMessage = '[图片消息]'
      } else if (messageData.type == 'FAQ') {
        lastMessage = '[机器人消息]'
      } else if (messageData.type == 'STATUS') {
        lastMessage = '[状态信息]'
      } else if (messageData.type == 'SATISFACTION') {
        lastMessage = '[评价信息]'
      } else if (messageData.type == 'QA') {
        lastMessage = '[机器人消息]'
      } else {
        lastMessage = messageData.content
      }
      dic['lastMessage'] = lastMessage
      listChatArray.splice(index, 0, dic)
      break
    }
  }
  if (listenerObj != undefined) {
    listenerObj.emit('listChat', listChatArray)
  }
}
/**
 * 会话列表存入本地缓存
 */
function insertListChatArrayToStorage() {
  wx.setStorage({
    key: 'listChat',
    data: listChatArray,
  })
}
//异步获取历史会话内容
function getHistroyStorage() {
  wx.getStorage({
    key: 'listChat',
    success: function (res) {
      let resultData = res.data
      if (resultData instanceof Array && resultData.length > 0) {
        let midArray = listChatArray.concat()
        let resultArray = resultData.concat()
        for (let i in resultData.reverse()) {
          let histroyDic = resultData[i]
          for (let item in midArray) {
            let listDic = midArray[item] 
            if (listDic.tenantId == histroyDic.tenantId) {
              //移除指定的数据
              listChatArray.splice(item, 1)
              //修改数据内容
              listDic.lastMessage = histroyDic.lastMessage
              listDic.unreadMessageNumber = histroyDic.unreadMessageNumber
              //插入指定位置的数据
              listChatArray.splice(item, 0, listDic)
              //删除元数据的内容
              resultArray.splice(resultData.length - 1 - i, 1)
            }
          }
        }
        //剩下的数据，拼接进入数组
        for (let i in resultArray) {
          let dic = resultArray[i]
          // 设置会话状态
          dic.isSession = 0
          dic.status = -1;
          listChatArray.push(dic)
        }
      }
      //通知刷新列表
      if (listenerObj != undefined) {
        listenerObj.emit('listChat', listChatArray)
      }
    },
  })
}
/**
 * 订阅者模式 https://www.cnblogs.com/leaf930814/p/9014200.html
 * https://www.cnblogs.com/suyuanli/p/9655699.html
 */
function publicListener() {
  this.handlers = {}
}
publicListener.prototype = {
  on: function (eventType, handler) {
    var self = this;
    if (!(eventType in self.handlers)) {
      self.handlers[eventType] = [];
    }
    self.handlers[eventType].push(handler);
    return this;
  },
  // 触发事件(发布事件)
  emit: function (eventType) {
    var self = this;
    // 若没有注册该事件则抛出错误
    if (!(eventType in this.handlers)) {
      return new Error('无效事件')
    }
    var handlerArgs = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < self.handlers[eventType].length; i++) {
      self.handlers[eventType][i].apply(self, handlerArgs);
    }
    return self;
  },
  // 删除订阅事件
  off: function (type, handler) {
    if (!(type in this.handlers)) {
      return new Error('无效事件')
    }
    if (!handler) {
      // 直接移除事件
      delete this.handlers[type]
    } else {
      const idx = this.handlers[type].findIndex(ele => ele === handler)
      // 抛出异常事件
      if (idx === undefined) {
        return new Error('无该绑定事件')
      }
      // 移除事件
      this.handlers[type].splice(idx, 1)
      if (this.handlers[type].length === 0) {
        delete this.handlers[type]
      }
    }
    return this;
  }
}
function listener() {
  if (listenerObj == undefined) {
    listenerObj = new publicListener()
  }
  return listenerObj
}
/**
 * 抛出的公有方法或者属性
 */
module.exports = {
  // 方法
  connectSocketServer: connectSocketServer,
  endSocketConnect: endSocketConnect,
  socketSendMessage: socketSendMessage,
  listener: listener,
  changeListChatIsSession: changeListChatIsSession,
  insertListChatArrayToStorage: insertListChatArrayToStorage,
  createLocalMessage: createLocalMessage,
  createLocalMessageWithGoods: createLocalMessageWithGoods,

  // 属性
  listChatArray: listChatArray
}
