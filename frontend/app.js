// app.js - SmileGuard 护齿管家
App({
  globalData: {
    baseUrl: 'http://localhost:8000',
    userInfo: wx.getStorageSync('userInfo') || null,
    history: wx.getStorageSync('detect_history') || []
  },

  onLaunch() {
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success(res) {
          if (res.confirm) updateManager.applyUpdate()
        }
      })
    })
  },

  saveHistory(record) {
    const history = this.globalData.history
    history.unshift(record)
    if (history.length > 100) history.pop()
    this.globalData.history = history
    wx.setStorageSync('detect_history', history)
  },

  deleteHistory(index) {
    this.globalData.history.splice(index, 1)
    wx.setStorageSync('detect_history', this.globalData.history)
  },

  clearHistory() {
    this.globalData.history = []
    wx.setStorageSync('detect_history', [])
  },

  getUserInfo() {
    return this.globalData.userInfo
  },

  setUserInfo(info) {
    this.globalData.userInfo = info
    wx.setStorageSync('userInfo', info)
  },

  logout() {
    this.globalData.userInfo = null
    wx.removeStorageSync('userInfo')
  }
})