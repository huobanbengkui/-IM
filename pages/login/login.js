const socketAdapter = require('../../utils/server/socketwork/socketadapter.js')
//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    phoneText: '1111111111',
    passwordText: 'test123',
    webUrl: 'https://***.cn/ taojiji5 boss_1 admin123',
  },
  onShow: function () {
    this.setData({
      testStr: app.globalData.userInfo
    })
  },
  textBindInput(e) {
    if (e.currentTarget.id == 'phoneText') {
      this.phoneText = e.detail.value
    } else {
      this.passwordText = e.detail.value
    }
  },
  clickLoginButton(e) {
    //建立socket连接
    socketAdapter.connectSocketServer()
    // 登录成功，跳转到会话历史
    wx.switchTab({
      url: '../index/index'
    })
  },
})

