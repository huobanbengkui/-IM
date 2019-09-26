const netWorkAdapter = require('../../utils/server/httpnetwork/network.adapter.js')
const tools = require('../../utils/tools/commonTools.js')
const socketAdapter = require('../../utils/server/socketwork/socketadapter.js')
const utils = require('../../utils/util.js')
const createRecycleContext = require('../../miniprogram_npm/miniprogram-recycle-view/index.js')
const entrance = require('../../utils/adapter/entrance.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    array: [],
    tenantId: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var ctx = createRecycleContext({
      id: 'recycleId',
      dataKey: 'recycleList',
      page: this,
      itemSize: function (item, index) {
        let width = wx.getSystemInfoSync().windowWidth
        let height = 140.0 / 750.0 * width
        return {
          width: width,
          height: height
        }
      }
    })
    this.ctx = ctx
    // 获取当前正在会话的用户
    this.ctx.append(socketAdapter.listChatArray, () => {

    })
    this.setData({
      array: socketAdapter.listChatArray
    })
    //监听会话列表的变化
    this.getListChat()
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      tenantId: ''
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    listener.off('listChat', null)
  },
  /**
   * 监听实时会话列表
   */
  getListChat() {
    let listener = socketAdapter.listener()
    var self = this;
    listener.on('listChat', function(data) {
      self.ctx.update(0, data, () => {

      })
      self.setData({
        array: socketAdapter.listChatArray
      })
      socketAdapter.insertListChatArrayToStorage()
    })
  },
  /**
   * 跳转到详情页
   */
  pushToChatView (e) {
    let index = e.currentTarget.id    
    let info = this.data.array[index]
    let tenantId = info.tenantId
    entrance.connectCustomerService(tenantId)
  }
})
