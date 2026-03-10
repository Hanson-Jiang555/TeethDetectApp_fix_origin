Page({
  data: {
    overallSeverity: 'healthy',
    severityScore: 0,
    emoji: '🟢',
    severityLabel: '口腔良好',
    detections: [],
    advice: '',
    detail: ''
  },

  onLoad(options) {
    if (options.data) {
      const result = JSON.parse(decodeURIComponent(options.data))
      const severityMap = {
        'healthy': { label: '口腔良好', emoji: '🟢' },
        'mild': { label: '轻度问题', emoji: '🟡' },
        'medium': { label: '中度问题', emoji: '🟠' },
        'severe': { label: '重度问题', emoji: '🔴' }
      }
      const info = severityMap[result.overall_severity] || severityMap['healthy']
      
      const detections = (result.detections || []).map(d => ({
        ...d,
        severityLabel: severityMap[d.severity]?.label || d.severity
      }))

      this.setData({
        overallSeverity: result.overall_severity,
        severityScore: result.severity_score,
        emoji: info.emoji,
        severityLabel: info.label,
        detections: detections,
        advice: result.advice,
        detail: result.detail
      })
    }
  },

  goCamera() {
    wx.redirectTo({ url: '/pages/camera/camera' })
  },
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
