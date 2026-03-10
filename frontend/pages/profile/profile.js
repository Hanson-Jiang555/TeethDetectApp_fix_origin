// profile.js - 个人中心
const app = getApp()

Page({
  data: {
    userInfo: {},
    totalChecks: 0,
    avgScore: '--',
    latestDate: '--'
  },

  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo || {} })
    this.loadStats()
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} })
    this.loadStats()
  },

  loadStats() {
    const history = app.globalData.history || []
    const scores = history.map(h => h.severity_score || 0)
    let latestDate = '--'
    if (history.length > 0) {
      const d = new Date(history[0].timestamp || Date.now())
      latestDate = `${d.getMonth()+1}/${d.getDate()}`
    }
    this.setData({
      totalChecks: history.length,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '--',
      latestDate
    })
  },

  login() {
    const that = this
    wx.getUserProfile({
      desc: '用于显示您的个人信息',
      success(res) {
        const info = res.userInfo
        app.setUserInfo({
          nickName: info.nickName,
          avatarUrl: info.avatarUrl,
          gender: info.gender
        })
        that.setData({ userInfo: info })
        wx.showToast({ title: '登录成功', icon: 'success' })
      },
      fail() {
        wx.showToast({ title: '未授权', icon: 'none' })
      }
    })
  },

  editProfile() {
    wx.showModal({
      title: '编辑资料',
      content: '当前版本暂不支持直接编辑，请在登录时更新信息。',
      showCancel: false
    })
  },

  chooseAvatar() {
    // Could implement avatar picker in future
  },

  goHistory() {
    wx.switchTab({ url: '/pages/history/history' })
  },

  showAbout() {
    wx.showModal({
      title: '关于 SmileGuard 护齿管家',
      content: 'SmileGuard 护齿管家是一款面向普通用户的居家口腔健康AI初筛工具。通过拍照即可检测龋齿等口腔问题，让每个人都能轻松关注自己的口腔健康。\n\n版本：v1.0.0\n技术：YOLO + 微信小程序',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  showDisclaimer() {
    wx.showModal({
      title: '免责声明',
      content: '本工具仅供口腔健康初筛参考，不能替代专业牙科医生的临床诊断。检测结果受拍照角度、光线等因素影响，可能存在误差。如发现口腔问题，请及时前往正规医疗机构就诊。',
      showCancel: false,
      confirmText: '我已了解'
    })
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '退出登录后将清除本地用户信息',
      confirmColor: '#EF4444',
      success(res) {
        if (res.confirm) {
          app.logout()
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      }
    })
  }
})