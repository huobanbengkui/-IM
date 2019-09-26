const md5 = require('../tools/MD5.js')
/**
 * 时间格式转换
 * 如：1564663015522 转 PM 20:05
 */
function timestampToTime(timestamp) {
  const dateObj = new Date(+timestamp)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const date = dateObj.getDate()
  var hours = dateObj.getHours()
  hours = hours >= 10 ? hours : '0' + hours
  var minutes = dateObj.getMinutes()
  minutes = minutes >= 10 ? minutes : '0' + minutes
  var seconds = dateObj.getSeconds()
  seconds = seconds >= 10 ? seconds : '0' + seconds

  //今日的日期
  let nowTimeStamp = new Date().setHours(0, 0, 0, 0)
  if (+timestamp > nowTimeStamp && (+timestamp - nowTimeStamp) < 24 * 60 * 60 * 1000) {
    if (hours >= 12) {
      return 'PM' + ' ' + hours + ':' + minutes + ':' + seconds
    }else {
      return 'AM' + ' ' + hours + ':' + minutes + ':' + seconds
    }
  }else {
    return year + '-' + month + '-' + date
  }
}

/**
 * 字符串 + 时间戳 进行MD5
 */
function stringToMD5(str) {
  let timestamp = (new Date()).getTime()
  let resultStr = str + timestamp
  return md5.hexMD5(resultStr)
}

module.exports = {
  timestampToTime: timestampToTime,
  stringToMD5: stringToMD5
}