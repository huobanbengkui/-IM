const entrance = require('../../utils/adapter/entrance.js')
Page({
  data: {
    tenantId: '',
  },
  /**
   * 输入测试商户ID
   */
  testInput(e) {
    this.setData({
      tenantId: e.detail.value
    })
  },
  /**
  * 开始聊天
  */
  startChat(e) {
    let tenantId = this.data.tenantId
    entrance.connectCustomerService(tenantId)
  },
  /**
  * 咨询商品
  */
  goodsChat() {
    let tenantId = '6969_1'
    let goods = entrance.creatGoods('测试标题测试标题测', 'http://img5.imgtn.bdimg.com/it/u=773876083,1055415286&fm=26&gp=0.jpg', '800')
    entrance.connectGoodsService(tenantId, goods)
  },
  /**
  * 咨询订单
  */
  orderChat() {
    let tenantId = '6969_1'
    let orders = entrance.creatOrders('测试标题测试标题测', 'http://img5.imgtn.bdimg.com/it/u=773876083,1055415286&fm=26&gp=0.jpg', '800', '12345678909876', '19')
    entrance.connectOrdersService(tenantId, orders)
  },
  /**
  * 确认订单
  */
  sureOrderChat() {
    let tenantId = '6969_1'
    let sureOrder = entrance.creatSureOrder('测试标题测试标题测', 'http://img5.imgtn.bdimg.com/it/u=773876083,1055415286&fm=26&gp=0.jpg', '800', '12345678909876', '19', '张三', '***', '***')
    entrance.connectSureOrderService(tenantId, sureOrder)
  }
})
