var startPoint
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isHidden: {
      type: Number,
      value: 1,
    },
    serviceTitle: {
      type: String,
      value: '人工'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    buttonTop: 0,
    buttonLeft: 0,
    windowHeight: '',
    windowWidth: '',
  },

  ready: function() {
    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        // 高度,宽度 单位为px
        self.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          buttonLeft: res.windowWidth - 70
        })
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 开始触摸
    moveStart: function(e) {
      startPoint = e.touches[0]
    },
    // 开始移动
    moveIng: function (e) {
      var endPoint = e.touches[e.touches.length - 1]
      var translateX = endPoint.clientX - startPoint.clientX
      var translateY = endPoint.clientY - startPoint.clientY

      startPoint = endPoint

      var buttonTop = this.data.buttonTop + translateY
      var buttonLeft = this.data.buttonLeft + translateX
      //判断是移动否超出屏幕
      if (buttonLeft + 50 >= this.data.windowWidth) {
        buttonLeft = this.data.windowWidth - 50;
      }
      if (buttonLeft <= 0) {
        buttonLeft = 0;
      }
      if (buttonTop <= 0) {
        buttonTop = 0
      }
      if (buttonTop + 50 >= this.data.windowHeight) {
        buttonTop = this.data.windowHeight - 50;
      }
      this.setData({
        buttonTop: buttonTop,
        buttonLeft: buttonLeft
      })
    },
    // 移动结束
    moveEnd: function (e) {

    },
    // 请先留言
    clickLevaeMessage: function() {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('clickLevaeMessage', myEventDetail, myEventOption)
    },
    // 取消等待
    clickCancelView: function() {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('clickCancelView', myEventDetail, myEventOption)
    },
    // 点击店铺
    clickShopView: function() {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('clickShopView', myEventDetail, myEventOption)
    },
    // 人工
    clickServiceView: function() {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('clickServiceView', myEventDetail, myEventOption)
    }
  }
})
