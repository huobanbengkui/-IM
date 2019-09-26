module.exports.serverDefine = {
  /**
   * QA环境
   */
  baseUrl: 'https://**.cn',
  socketUrl: 'https://**.cn:8036',
  /**
   * nsp socket连接 命名空间
   */
  nsp: '/im/user',
  /**
   * 接口 获取实时会话列表
   * /context/getContext/{userId}
   * userId  用户的userID
   */
  getContext: '/context/getContext/',
  /**
   * 接口 查询用户的聊天历史内容
   * userId tenantId pageSiz time
   */
  getHistory: '/history/getHistory/user',
  /**
   * 接口 会话结束评分
   * contextId score
   */
  addSatisficing: '/monitor/index/addSatisficing/',
  /**
   * 接口 用户留言
   * 
   */
  leaveMessage: '/leavemsg/user/newAdd',
  /**
   * 接口 上传图片
   * /upload/upload
   * userId uuid token appResource
   */
  uploadImage: '/upload/upload'
}