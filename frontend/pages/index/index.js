// index.js - 首页
const app = getApp()

Page({
  data: {
    userInfo: {},
    greeting: '',
    latestRecord: null,
    totalChecks: 0,
    avgScore: '--',
    tips: [
      { icon: '🪥', text: '每天刷牙2次，每次至少2分钟，采用巴氏刷牙法' },
      { icon: '🧵', text: '每天使用牙线清洁牙缝，预防牙菌斑堆积' },
      { icon: '🥤', text: '减少含糖饮料摄入，喝完记得漱口' },
      { icon: '🏥', text: '每半年进行一次专业口腔检查和洁牙' },
      { icon: '🌙', text: '夜间刷牙后不再进食，保护牙齿整晚' },
      { icon: '🍎', text: '多吃富含钙质和维C的食物，强健牙齿' },
      { icon: '💧', text: '餐后及时漱口，冲走食物残渣' },
      { icon: '🚭', text: '戒烟限酒，降低牙周病和口腔癌风险' }
    ]
  },

  onLoad() {
    this.updateGreeting()
    this.setData({ userInfo: app.globalData.userInfo || {} })
    this.loadLatestRecord()
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} })
    this.loadLatestRecord()
  },

  updateGreeting() {
    const hour = new Date().getHours()
    let greeting = '晚上好'
    if (hour < 6) greeting = '夜深了'
    else if (hour < 9) greeting = '早上好'
    else if (hour < 12) greeting = '上午好'
    else if (hour < 14) greeting = '中午好'
    else if (hour < 18) greeting = '下午好'
    this.setData({ greeting })
  },

  loadLatestRecord() {
    const history = app.globalData.history
    if (history.length > 0) {
      const latest = history[0]
      const labelMap = { 'HEALTHY': 'healthy', 'MILD': 'mild', 'MEDIUM': 'medium', 'SEVERE': 'severe' }
      const textMap = { 'HEALTHY': '牙齿健康', 'MILD': '轻度问题', 'MEDIUM': '中度问题', 'SEVERE': '需要就医' }
      const summaryMap = {
        'HEALTHY': '未检测到明显口腔问题',
        'MILD': '存在轻微问题，建议加强护理',
        'MEDIUM': '发现一些问题，建议尽快就医',
        'SEVERE': '问题较为严重，请尽快就医'
      }

      const sevLabel = labelMap[latest.overall_severity] || 'healthy'
      const date = latest.timestamp ? new Date(latest.timestamp) : new Date()

      this.setData({
        latestRecord: {
          score: latest.severity_score || 100,
          severityLabel: sevLabel,
          statusText: textMap[latest.overall_severity] || '暂无',
          summary: latest.detail || summaryMap[latest.overall_severity] || '',
          dateStr: this.formatDate(date)
        },
        totalChecks: history.length,
        avgScore: Math.round(history.reduce((sum, r) => sum + (r.severity_score || 0), 0) / history.length)
      })
    } else {
      this.setData({ latestRecord: null, totalChecks: 0, avgScore: '--' })
    }
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `${y}-${m}-${d} ${h}:${min} 周${weekdays[date.getDay()]}`
  },

  startDetect() {
    wx.switchTab({ url: '/pages/camera/camera' })
  }
})