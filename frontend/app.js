// app.js
App({
  globalData: {
    baseUrl: 'http://localhost:8000',  // 后端地址，部署时改为实际地址
    history: wx.getStorageSync('detect_history') || []
  },

  onLaunch() {
    // 检查更新
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
    if (history.length > 50) history.pop()  // 最多保留50条
    this.globalData.history = history
    wx.setStorageSync('detect_history', history)
  }
})
