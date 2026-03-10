const app = getApp()

const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '加载中...' })
    wx.request({
      url: app.globalData.baseUrl + url,
      method: method,
      data: data,
      header: { 'content-type': 'application/json' },
      success(res) {
        wx.hideLoading()
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail(err) {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: 'AI分析中，请稍候...' })
    wx.uploadFile({
      url: app.globalData.baseUrl + '/api/detect',
      filePath: filePath,
      name: 'file',
      success(res) {
        wx.hideLoading()
        const data = JSON.parse(res.data)
        resolve(data)
      },
      fail(err) {
        wx.hideLoading()
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = { request, uploadImage }
