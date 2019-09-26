const tools = require('../../utils/tools/commonTools.js')
const socketAdapter = require('../../utils/server/socketwork/socketadapter.js')
const utils = require('../../utils/util.js')
const netWorkAdapter = require('../../utils/server/httpnetwork/network.adapter.js')
// 监听事件对象
var listener
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recycleTop: 0, //上部可滚动视图 // 高度,宽度 单位为px
    recycleWidth: 0,
    recycleHeight: 0,
    array: [],
    serverTitle: '人工',
    inputValue: '',  // 输入框的默认值
    tenantId: '',
    contextId: '',    //当前会话的会话ID 空，则为已经结束的会话  机器人不需要
    agentStatus: -1,  // 0 排队中 1 会话中  -1其他情况
    animation: '',
    isShowAddView: false,
    keyBoardViewIsHidden: 1,
    pageSize: 30,      // 默认请求消息的个数
    historyTime: null,  // 获取历史消息的最后一条消息的时间
    scrollToView: '',
    queueArray: [],   // 排队过程中发送的数据
    focus: false,     // 输入框是否自动高亮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //监听获取到的数据
    this.getMessage()
    //获取上一个页面，传递的参数
    const eventChannel = this.getOpenerEventChannel()
    let self = this;
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      let info = data.data
      var tenantIdStr
      if (typeof info.data.tenantId == 'string') { // 代表历史会话列表中没有会话
        // 设置本页面数据状态
        tenantIdStr = info.data.tenantId
        self.setViewData('人工', info.data.tenantId, -1, '')
        // 首先请求机器人
        self.getChatBot()
      } else {    // 代表历史会话列表中有会话
        // status 0 排队中  1 会话中  -1 已经结束的会话
        let dic = info.data.tenantId 
        tenantIdStr = dic.tenantId
        if (dic.status == 0) {
          self.setViewData('结束', dic.tenantId, 0, dic.contextId)
        } else if (dic.status == 1) {
          self.setViewData('结束', dic.tenantId, 1, dic.contextId)
        }else {
          self.setViewData('人工', dic.tenantId, -1, '')
          // 请求机器人
          self.getChatBot()
        }
      }
      // 生成商品信息
      socketAdapter.createLocalMessageWithGoods(info.type, info.data.content, tenantIdStr)
    })
    
    //获取历史聊天数据
    // this.getHistory()
  },
  setViewData: function (title, titleTenantId, status, newContextId) {
    this.setData({
      serverTitle: title,
      tenantId: titleTenantId,
      agentStatus: status,
      contextId: newContextId
    })
    wx.setNavigationBarTitle({
      title: titleTenantId,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    let width = wx.getSystemInfoSync().windowWidth
    let height = wx.getSystemInfoSync().windowHeight
    let heightBottom = height - 140.0 / 750.0 * width
    this.setData({
      recycleTop: 0, //上部可滚动视图
      recycleWidth: width,
      recycleHeight: heightBottom,
    })
    // 更新UI 
    this.updateScrollViewSize()
  },
  /**
   * 出现排队中的UI，滚动视图的 坐标发生相应变化
   */
  updateScrollViewSize: function () {
    let width = wx.getSystemInfoSync().windowWidth
    let top
    let resultHeight
    if (this.data.agentStatus == 0) { //代表出现排队UI 80rpx
      top = 80.0 / 750.0 * width
      resultHeight = this.data.recycleHeight - top
    }else {
      top = 0
      if (this.data.recycleTop > 0) {
        resultHeight = this.data.recycleHeight + this.data.recycleTop
      } else {
        resultHeight = this.data.recycleHeight
      }
    }
    let lastData = (this.data.array)[this.data.array.length - 1]
    if (lastData == undefined) {
      this.setData({
        recycleTop: top,
        recycleHeight: resultHeight,
      })
    } else {
      this.setData({
        recycleTop: top,
        recycleHeight: resultHeight,
        scrollToView: lastData.serverSeq
      })
    }
  },
  /**
   * 生命周期函数--页面首次渲染完毕
   */
  onReady: function () {
    this.animation = wx.createAnimation({
      // 动画持续时间 单位ms 默认 400
      duration: 300,
      timingFunctionL: 'linear',
      // 延迟多长时间开始
      delay: 0,
    })

    // 设置当前会话状态为会话中
    socketAdapter.changeListChatIsSession(this.data.tenantId, 1)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    listener.off('message', null)
    listener.off('response', null)
    listener.off('chat_end', null)

    // 设置当前会话状态为已结束会话
    socketAdapter.changeListChatIsSession(this.data.tenantId, 0)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  /**
   * 获取用户聊天历史内容
   */
  async getHistory() {
    if (this.data.historyTime == null) {
      let time = new Date().getTime() 
      this.setData({
        historyTime: time
      })
    }
    const data = await netWorkAdapter.getUserHistory(this.data.tenantId, this.data.pageSize, this.data.historyTime)
    console.log(data)
    if (data.code) {
      let resultArray = data.data
      if (resultArray.length > 0) {
        // 数据拼接，刷新列表
        var historyArray = this.data.array.concat()
        for (let index in resultArray) {
          historyArray.unshift(resultArray[index])
        }
        let time = historyArray[0].time
        this.setData({
          array: historyArray,
          historyTime: time
        })
      }
    }
  },
  /**
   * 请求机器人
   */
  getChatBot () {
    let requestData = { userId: utils.userInfo.userId, tenantId: this.data.tenantId, channel: 'APP'}
    socketAdapter.socketSendMessage('chatbot', requestData, function (event, data) {
      console.log(data)
    })
  },
  /**
   * 接收到数据
   */
  getMessage () {
    let self = this;
    listener = socketAdapter.listener()
    // message 收到消息
    listener.on('message', function(data) {
      console.log(data)
      if (self.data.tenantId != data.tenantId) {
        return 
      }
      var resultData = data
      // 为了解决id唯一性，且不能以数字开头的问题  用于列表滚动
      resultData.serverSeq = 'S' + data.serverSeq
      if (data.type == 'FAQ' && data.direction == 'OUT') {
        //机器人消息 FAQ数据，进行数据组装
        var resultContent = JSON.parse(data.content)
        let moreDic = {chatbotMessage: '更多帮助请咨询在线客服', faqId: -1}
        resultContent.push(moreDic)
        resultData.content = resultContent
      } else if (data.type == 'TEXT' && data.direction == 'OUT' && data.chatType == 'CHATBOT') {
        // 收到机器人消息 TEXT数据 进行字符串分割
        var textArray = data.content.split('\n')
        if (textArray.length > 1) {
          resultData.content = textArray[1]
        } else {
          resultData.content = data.content
        }
      } else if (data.type == 'MANUAL') {
        // 收到机器人消息
        var textArray = data.content.split('{')
        if (textArray.length > 1) {
          resultData.content = textArray[0]
        } else {
          resultData.content = data.content
        }
      }  else if (data.type == 'SATISFACTION') {
        // 结束会话，评价消息
        var resultContent = JSON.parse(data.content)
        resultData.content = resultContent
      } else if (data.type == 'IMAGE') {
        //图片消息
        var resultContent = JSON.parse(data.content)
        resultData.content = resultContent
      }else {

      }
      // 数据拼接，刷新列表 默认向上滚动，滚动到底部
      // 判断新数据，是否存在排队的时候发送的数据
      var dataQueueArray = self.data.queueArray
      let midSenderSeq = resultData.senderSeq
      let midServerSeq = resultData.serverSeq
      for (let i in dataQueueArray) {
        let dic = dataQueueArray[i] 
        if (midSenderSeq != undefined && ('S' + midSenderSeq) != midServerSeq && midSenderSeq == dic.senderSeq) {
          dataQueueArray.splice(i, 1)
          self.setData({
            queueArray: dataQueueArray
          })
          return
        }
      }
      var historyArray = self.data.array
      historyArray.push(resultData)
      self.setData({
        array: historyArray,
        scrollToView: resultData.serverSeq
      })
    })
    // response 用户的连接状态
    listener.on('response', function(data) {
      if (data.code == 200) {  //坐席分配成功
        self.setData({
          serverTitle: '结束',
          contextId: data.contextId,
          agentStatus: 1
        })
      } else if (data.code == 201) { //排队中
        self.setData({
          serverTitle: '结束',
          contextId: data.contextId,
          agentStatus: 0
        })
      }else {
        self.setData({
          serverTitle: '人工',
          contextId: '',
          agentStatus: -1
        })
        var showText = ''
        if (data.code == 900001) {
          // 在socketAdapter.js 已处理为系统消息类型
        }else {
          showText = data.connectSuccessMsg
          if (showText == undefined || showText.length <= 0) {
            showText = '服务正忙，请稍后再试'
          }
          wx.showToast({
            title: showText,
            icon: 'none',
            duration: 2000
          })
        }
      }
      // 更新UI 
      self.updateScrollViewSize()
    })
    // chat_end 结束会话
    listener.on('chat_end', function (data) {
      self.setData({
        serverTitle: '人工',
        contextId: '',
        agentStatus: -1
      })
    })
  },
  /**
   * 发送文本消息消息
   */
  sendMessage (e) {
    // AGENT 客服、CHATBOT 机器人
    let messageStr = e.detail.value
    if (this.data.agentStatus == -1) {  // 请求机器人服务
      let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
      this.sendTextMessage(1, messageStr, 'TEXT', senderSeq)
      //生成一条本地消息
      socketAdapter.createLocalMessage(messageStr, 'CHATBOT', this.data.tenantId, 'TEXT', senderSeq)
    } else if (this.data.agentStatus == 0) {  // 排队中
      let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
      // 生成排队中消息
      let array = this.data.queueArray
      let dic = { content: messageStr, type: 'TEXT', senderSeq: senderSeq}
      array.push(dic)
      this.setData({
        queueArray: array
      })
      // 发送消息
      this.sendTextMessage(0, messageStr, 'TEXT', senderSeq)
      // 生成一条本地消息
      socketAdapter.createLocalMessage(messageStr, 'AGENT', this.data.tenantId, 'TEXT', senderSeq)
    } else {
      this.sendTextMessage(0, messageStr, 'TEXT', tools.stringToMD5(utils.userInfo.uuid))
    }
    this.setData({
      inputValue: ''
    })
  },
  sendTextMessage: function (isChatBot, messageStr, type, senderSeq) {
    // Yes 机器人   No 人工
    var chatType, contextId
    if (isChatBot) {
      chatType = 'CHATBOT'
      contextId = ''
    }else {
      chatType = 'AGENT'
      contextId = this.data.contextId
    }
    let messageData = { contextId: contextId, type: type, content: messageStr, senderSeq: senderSeq, tenantId: this.data.tenantId, chatType: chatType }
    socketAdapter.socketSendMessage('message', messageData, function (event, data) {
      // console.log(data)
    })
  },
  /**
   * 发送图片消息
   */
  sendImageMessage(messageStr) {
    if (this.data.agentStatus == 0) {  // 排队中
      let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
      // 生成排队中消息
      let array = this.data.queueArray
      let dic = { content: messageStr, type: 'IMAGE', senderSeq: senderSeq }
      array.push(dic)
      this.setData({
        queueArray: array
      })
      // 生成一条本地消息
      socketAdapter.createLocalMessage(messageStr, 'AGENT', this.data.tenantId, 'IMAGE', senderSeq)
      // 发送消息
      this.sendTextMessage(0, messageStr, 'IMAGE', senderSeq)

    } else if (this.data.agentStatus == 1) {  // 会话中

      this.sendTextMessage(0, messageStr, 'IMAGE', tools.stringToMD5(utils.userInfo.uuid))
      
    }else {  //机器人
      let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
      //生成一条本地消息
      socketAdapter.createLocalMessage(messageStr, 'CHATBOT', this.data.tenantId, 'IMAGE', senderSeq)
      // 发送消息
      this.sendTextMessage(1, messageStr, 'IMAGE', senderSeq)
    }
  },
  /**
   * 添加图片
   */
  clickAddImage() {
    let self = this;
    wx.chooseImage({
      count: 5,
      sourceType: ['album', 'camera'],
      success: function(res) {
        self.animation.bottom('-300rpx').step();
        self.setData({
          // 隐藏动画
          animation: self.animation.export(),
          isShowAddView: false,
          keyBoardViewIsHidden: 1
        })
        let arrayPath = res.tempFilePaths
        for (let index in arrayPath) {
          self.uploadImage(arrayPath[index])
        }
      },
    })
  },
  async uploadImage(filPath) {
    const data = await netWorkAdapter.uploadImage(filPath)
    let restult = data.data
    if (restult.length > 0) {
      let imageFile = restult[0]
      let messageStr = JSON.stringify(imageFile)
      this.sendImageMessage(messageStr)
    }else {
      wx.showToast({
        title: '图片内容为空',
        icon: 'none',
        duration: 2000
      })
    }
  },
  /**
   * 键盘相关事件
   */
  clickAddButton(e) {
    if(this.data.isShowAddView) {
      this.animation.bottom('-300rpx').step();
      this.setData({
        // 隐藏动画
        animation: this.animation.export(),
        isShowAddView: false,
        keyBoardViewIsHidden: 1
      })
    }else {
      this.animation.bottom(0).step();
      this.setData({
        // 输出动画
        animation: this.animation.export(),
        isShowAddView: true,
        keyBoardViewIsHidden: 0
      })
    }
  },
  hiddenKeyBoard() {
    this.animation.bottom('-300rpx').step();
    this.setData({
      // 隐藏动画
      animation: this.animation.export(),
      isShowAddView: false,
      keyBoardViewIsHidden: 1
    })
  },
  /**
   * 请先留言
   */
  clickLevaeMessage: function (e) {
   // 让输入框处于高亮状态
   this.setData({
     focus: true
   })
  },
  /**
   * 取消等待
   */
  clickCancelView: function (e) {
    let self = this;
    let requestData = { userId: utils.userInfo.userId, contextId: this.data.contextId, tenantId: this.data.tenantId }
    socketAdapter.socketSendMessage('queue_quit', requestData, function (event, data) {
      if (data.code == 0) {
        self.setData({
          serverTitle: '人工',
          contextId: '',
          agentStatus: -1
        })
        // 生成本地消息
        let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
        socketAdapter.createLocalMessage('您已取消排队。', 'AGENT', self.data.tenantId, 'STATUS', senderSeq)
        // 更新UI 
        self.updateScrollViewSize()
      }
    })
    // 发送留言消息
    self.creatLeaveMessage()
  },
  creatLeaveMessage () {
    if (this.data.queueArray.length > 0) {
      netWorkAdapter.leaveMessage(this.data.tenantId, this.data.queueArray)
    }
  },
  /**
   * 点击店铺
   */ 
  clickShopView: function (e) {
    console.log('点击店铺')
  },
  /**
   * 人工/结束
   */
  clickServiceView: function (e) {
    if (this.data.agentStatus == -1) {  // 请求人工
      this.connectAgentServer()
    } else if (this.data.agentStatus == 0) { // 排队中 取消等待
      this.clickCancelView()
    } else {  // 结束会话
      let requestData = { contextId: this.data.contextId, tenantId: this.data.tenantId }
      socketAdapter.socketSendMessage('chat_end', requestData, function (event, data) {
        // console.log(data)
      })
    }
  },
  /**
   * 点击进行人工服务
   */
  connectAgentServer: function (e) {
    if (this.data.agentStatus == -1) {
      if (e != undefined) {
        let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
        socketAdapter.createLocalMessage('人工服务', 'CHATBOT', this.data.tenantId, 'TEXT', senderSeq)
      }
      let requestData = { userId: utils.userInfo.userId, tenantId: this.data.tenantId, channel: 'APP' }
      socketAdapter.socketSendMessage('request', requestData, function (event, data) {
        // console.log(data)
      })
    }
  },
  /**
   * 机器人常见问题点击
   */
  clickFaqView: function (e) {
    let faqId = e.currentTarget.id
    let chatbotMessage = e.currentTarget.dataset.hi
    let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
    if (faqId == -1 && this.data.agentStatus == -1) {  //请求人工服务
      socketAdapter.createLocalMessage('咨询人工服务', 'CHATBOT', this.data.tenantId, 'TEXT', senderSeq)
      this.connectAgentServer()
    } else {
      this.sendTextMessage(1, faqId, 'FAQ', senderSeq)
      socketAdapter.createLocalMessage(chatbotMessage, 'CHATBOT', this.data.tenantId, 'TEXT', senderSeq)
    }
  },
  /**
   * 结束会话，点击评价 
   */
  clickSatisFaction: function (e) {
    let satisfiedContent = e.currentTarget.dataset.hi
    let contextId = e.currentTarget.dataset.contextid
    let serverSeq = e.currentTarget.id
    let self = this;
    wx.showActionSheet({
      itemList: satisfiedContent,
      success(res) {
        var score
        switch (res.tapIndex) {
          case 0:
            score = 5
            break
          case 1:
            score = 4
            break
          case 2:
            score = 3
            break
          case 3:
            score = 2
            break
          case 4:
            score = 1
            break
          case 5:
            score = 0
            break
          default:
            score = -1
        }
        // 发送评分请求
        let title = '您对我们的服务评价为：' + satisfiedContent[res.tapIndex] + '。非常感谢！'
        self.addSatisficing(contextId, score, serverSeq, title)
      }
    })
  },
  async addSatisficing(contextId, score, serverSeq, title) {
    const data = await netWorkAdapter.addSatisficing(contextId, score)
    // 请求成功，刷新UI
    var dataArray = this.data.array
    for (var i = dataArray.length -1; i >= 0; i--) {
      let dic = dataArray[i]
      console.log(dic)
      if (dic.serverSeq == serverSeq) {
        dataArray.splice(i, 1)
        this.setData({
          array: dataArray
        })
        // 产生一条系统消息
        let senderSeq = tools.stringToMD5(utils.userInfo.uuid)
        socketAdapter.createLocalMessage(title, 'AGENT', this.data.tenantId, 'STATUS', senderSeq)
        break
      }
    }
  }
})