/**
 * GET请求
 */

function getDataWithUrl(url, parameter, header) {
  wx.showLoading({
    title: '加载中...',
  })
  return new Promise((success, faile) => {
    wx.request({
      url: url,
      header:header,
      data: parameter,
      method: 'GET',
      success(result) {
        wx.hideLoading()
        let data = result.data;
        if (data.code == 200) {
          success({ 'code': 1, 'data': data.object})
        }else {
          wx.showToast({
            title: data.msg,
            icon: 'none',
            duration: 1500
          })
          faile({ 'code': 0, 'data': 'failure'})
        }
      },
      fail(result) {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，稍后再试',
          icon: 'none',
          duration: 1500
        })
        faile({ 'code': 0, 'data': 'failure' })
      }
    })
  })
}

/**
 * POST请求
 */
function postDataWithUrl(url, parameter, header) {
  wx.showLoading({
    title: '加载中...',
  })
  return new Promise((success, faile) => {
    wx.request({
      url: url,
      header: header,
      data: parameter,
      method: 'POST',
      success(result) {
        wx.hideLoading()
        let data = result.data;
        if (data.code == 200) {
          success({ 'code': 1, 'data': data.object })
        } else {
          wx.showToast({
            title: data.msg,
            icon: 'none',
            duration: 1500
          })
          faile({ 'code': 0, 'data': 'failure' })
        }
      },
      fail(result) {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，稍后再试',
          icon: 'none',
          duration: 1500
        })
        faile({ 'code': 0, 'data': 'failure' })
      }
    })
  })
}

/**
 * 图片上传
 */
function uploadImage(url, filePath, name, parameter) {
  wx.showLoading({
    title: '上传中...',
  })
  return new Promise((success, faile) => {
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: name,
      formData: parameter,
      header: parameter,
      success(res) {
        wx.hideLoading()
        let data = JSON.parse(res.data)
        if (data.code == 200) {
          success({code: 1, data: data.object })
        }else {
          wx.showToast({
            title: '上传失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        })
        // console.log(res)
      }
    })
  })
}

module.exports = {
  getDataWithUrl: getDataWithUrl,
  postDataWithUrl: postDataWithUrl,
  uploadImage: uploadImage
}