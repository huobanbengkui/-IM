const utils = require('../../util.js')
const serverDefine = require('../server.define.js')
const httpServer = require('../httpnetwork/network.server.js')
const commonTools = require('../../tools/commonTools.js')
/**
   * 获取实时会话列表
   */
async function getContext () {
  let url = serverDefine.serverDefine.baseUrl + serverDefine.serverDefine.getContext + utils.userInfo.userId
  let header = { userId: utils.userInfo.userId, uuid: utils.userInfo.uuid, token: utils.userInfo.token, appResource: utils.userInfo.appResource }
  const data = await httpServer.getDataWithUrl(url, null, header)
  return data
}
/**
 * 获取用户聊天历史内容
 */
async function getUserHistory(tenantId, pageSize, time) {
  let url = serverDefine.serverDefine.baseUrl + serverDefine.serverDefine.getHistory
  let parmater = { userId: utils.userInfo.userId, tenantId: tenantId, pageSize: pageSize, time: time}
  let header = {userId: utils.userInfo.userId, uuid: utils.userInfo.uuid, token: utils.userInfo.token, appResource: utils.userInfo.appResource}
  const data = await httpServer.getDataWithUrl(url, parmater, header)
  return data
}
/**
 * 会话结束评分
 */
async function addSatisficing(contextId, score) {
  let url = serverDefine.serverDefine.baseUrl + serverDefine.serverDefine.addSatisficing
  let parmater = { contextId: contextId, score: score}
  let header = { userId: utils.userInfo.userId, uuid: utils.userInfo.uuid, token: utils.userInfo.token, appResource: utils.userInfo.appResource, 'content-type': 'application/x-www-form-urlencoded'}
  const data = await httpServer.postDataWithUrl(url, parmater, header)
  return data
}
/**
 * 用户留言
 */
async function leaveMessage(tenantId, context) {
  let url = serverDefine.serverDefine.baseUrl + serverDefine.serverDefine.leaveMessage
  let parmater = { tenantId: tenantId, context: context, userId: utils.userInfo.userId, nickname: utils.userInfo.userName, avatar: utils.userInfo.avatar }
  let header = { userId: utils.userInfo.userId, uuid: utils.userInfo.uuid, token: utils.userInfo.token, appResource: utils.userInfo.appResource}
  const data = await httpServer.postDataWithUrl(url, parmater, header)
  return data
}
/**
 * 上传图片
 */
async function uploadImage(filPath) {
  let url = serverDefine.serverDefine.baseUrl + serverDefine.serverDefine.uploadImage
  let name = commonTools.stringToMD5(Math.random().toString)
  let parmater = { userId: utils.userInfo.userId, uuid: utils.userInfo.uuid, token: utils.userInfo.token, appResource: utils.userInfo.appResource}
  const data = await httpServer.uploadImage(url, filPath, name, parmater)
  return data
}

module.exports = {
  getContext: getContext,
  getUserHistory: getUserHistory,
  addSatisficing: addSatisficing,
  leaveMessage: leaveMessage,
  uploadImage: uploadImage
}