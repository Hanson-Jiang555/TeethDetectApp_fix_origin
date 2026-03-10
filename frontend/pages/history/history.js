const app = getApp()
Page({
  data: { history: [] },

  onLoad() {
    this.setData({ history: app.globalData.history })
  },

  onShow() {
    this.setData({ history: app.globalData.history })
  },

  severityLabel(s) {
    return { healthy:'口腔良好', mild:'轻度问题', medium:'中度问题', severe:'重度问题' }[s] || '未知'
  },

  severityEmoji(s) {
    return { healthy:'🟢', mild:'🟡', medium:'🟠', severe:'🔴' }[s] || '❓'
  },

  viewDetail(e) {
    const idx = e.currentTarget.dataset.index
    const item = this.data.history[idx]
    wx.navigateTo({
      url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify({
        status: 'success',
        overall_severity: item.overall_severity,
        severity_score: item.severity_score,
        emoji: item.emoji || this.severityEmoji(item.overall_severity),
        advice: item.advice,
        detail: item.detail,
        detections: item.detections || []
      }))
    })
  },

  clearHistory() {
    wx.showModal({
      title: '确认',
      content: '确定要清除全部检测记录吗？',
      success(res) {
        if (res.confirm) {
          app.globalData.history = []
          wx.setStorageSync('detect_history', [])
          wx.showToast({ title: '已清除' })
        }
      }
    })
  },

  goCamera() {
    wx.navigateTo({ url: '/pages/camera/camera' })
  }
})
