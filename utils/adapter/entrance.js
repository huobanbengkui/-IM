const socketAdapter = require('../server/socketwork/socketadapter.js')
/**
 * 直接联系客服
 */
function connectCustomerService(tenantId) {
  if (tenantId.length <= 0) {
    wx.showToast({
      title: '请输入商户ID',
      icon: 'none',
      duration: 2000
    })
    return
  }
  let result = searchListChatArray(tenantId)
  let info = { type: 'normal', data: { tenantId: result}}
  wx.navigateTo({
    url: '../chat/chat',
    success: function (res) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit('acceptDataFromOpenerPage', { data: info })
    }
  })
}

/**
 * 咨询商品
 */
function creatGoods(title, image, price) {
  var obj = new Object()
  obj.title = title
  obj.image = image
  obj.price = price
  return obj
}
function connectGoodsService(tenantId, goods) {
  if (tenantId.length <= 0) {
    wx.showToast({
      title: '请输入商户ID',
      icon: 'none',
      duration: 2000
    })
    return
  }
  if (goods == undefined) {
    connectCustomerService(tenantId)
  }else {
    let result = searchListChatArray(tenantId)
    let info = { type: 'goods', data: { tenantId: result, content: goods } }
    wx.navigateTo({
      url: '../chat/chat',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: info })
      }
    })
  }
}

/**
 * 咨询订单
 */
function creatOrders(title, image, price, orderId, numberGoods) {
  var obj = new Object()
  obj.title = title
  obj.image = image
  obj.price = price
  obj.orderId = orderId
  obj.numberGoods = numberGoods
  return obj
}
function connectOrdersService(tenantId, orders) {
  if (tenantId.length <= 0) {
    wx.showToast({
      title: '请输入商户ID',
      icon: 'none',
      duration: 2000
    })
    return
  }
  if (orders == undefined) {
    connectCustomerService(tenantId)
  } else {
    let result = searchListChatArray(tenantId)
    let info = { type: 'order', data: { tenantId: result, content: orders } }
    wx.navigateTo({
      url: '../chat/chat',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: info })
      }
    })
  }
}

/**
 * 确认订单消息
 */
function creatSureOrder(title, image, price, orderId, numberGoods, name, phone, address) {
  var obj = new Object()
  obj.title = title
  obj.image = image
  obj.price = price
  obj.orderId = orderId
  obj.numberGoods = numberGoods
  obj.name = name
  obj.phone = phone
  obj.address = address
  return obj
}
function connectSureOrderService(tenantId, sureOrder) {
  if (tenantId.length <= 0) {
    wx.showToast({
      title: '请输入商户ID',
      icon: 'none',
      duration: 2000
    })
    return
  }
  if (sureOrder == undefined) {
    connectCustomerService(tenantId)
  } else {
    let result = searchListChatArray(tenantId)
    let info = { type: 'sureOrder', data: { tenantId: result, content: sureOrder } }
    wx.navigateTo({
      url: '../chat/chat',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: info })
      }
    })
  }
}
/**
 * 判断是否存在会话列表中
 */
function searchListChatArray(tenantId) {
  let listArray = socketAdapter.listChatArray;
  var midDic
  for (let index in listArray) {
    let dic = listArray[index]
    if (tenantId == dic.tenantId) {
      midDic = dic
      break;
    }
  }
  var info = tenantId
  if (midDic != undefined) {
    info = midDic
  }
  return info
}

module.exports = {
  // 直接联系客服
  connectCustomerService: connectCustomerService,
  // 咨询商品
  creatGoods: creatGoods,
  connectGoodsService: connectGoodsService,
  // 咨询订单
  creatOrders: creatOrders,
  connectOrdersService: connectOrdersService,
  // 确认订单
  creatSureOrder: creatSureOrder,
  connectSureOrderService: connectSureOrderService,
}