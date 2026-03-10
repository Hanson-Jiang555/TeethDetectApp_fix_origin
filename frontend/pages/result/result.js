// result.js - 检测结果页（增强版）
const app = getApp()

const cnNameMap = {
  'Tooth': '牙齿', 'Caries': '龋齿/蛀牙', 'Missing_Tooth': '缺牙',
  'Plaque': '牙菌斑', 'Calculus': '牙结石', 'Gingivitis': '牙龈炎', 'Enamel_Wear': '釉质磨损'
}
const iconMap = {
  'Tooth': '🦷', 'Caries': '🥀', 'Missing_Tooth': '😬',
  'Plaque': '🦠', 'Calculus': '🪨', 'Gingivitis': '🩸', 'Enamel_Wear': '💔'
}
const colorMap = {
  'Tooth': '#10B981', 'Caries': '#EF4444', 'Missing_Tooth': '#F97316',
  'Plaque': '#F59E0B', 'Calculus': '#8B5CF6', 'Gingivitis': '#EC4899', 'Enamel_Wear': '#6366F1'
}
const descMap = {
  'Caries': '牙齿表面出现脱矿或龋洞，建议尽早就医补牙',
  'Missing_Tooth': '检测到牙齿缺失，影响咀嚼功能，建议种植或修复',
  'Plaque': '牙齿表面有菌斑堆积，需加强刷牙和使用牙线',
  'Calculus': '检测到牙结石，建议进行专业洁牙',
  'Gingivitis': '牙龈可能存在炎症，注意观察是否有红肿出血',
  'Enamel_Wear': '牙釉质存在磨损迹象，建议减少酸性食物摄入'
}
const adviceBySeverity = {
  'HEALTHY': ['继续保持每天刷牙2次的习惯', '建议每半年进行一次口腔检查', '使用牙线清洁牙缝', '减少含糖食品和饮料的摄入'],
  'MILD': ['加强日常口腔清洁，使用巴氏刷牙法', '增加使用牙线或冲牙器的频率', '减少甜食摄入，尤其是睡前', '建议3个月内进行一次口腔检查', '使用含氟牙膏增强牙齿保护'],
  'MEDIUM': ['建议尽快预约牙科检查', '暂时避免用患侧咀嚼硬物', '加强口腔清洁，饭后及时漱口', '使用抗敏感牙膏缓解不适', '避免过冷过热刺激牙齿'],
  'SEVERE': ['强烈建议立即就医，不要拖延', '避免咀嚼硬物和粘性食物', '注意口腔卫生，防止问题加重', '如出现疼痛，可服用布洛芬缓解（遵医嘱）', '记录症状变化，就医时告知医生']
}

Page({
  data: {
    emoji: '😊',
    severityScore: 100,
    severityKey: 'healthy',
    scoreLabel: '牙齿健康',
    detections: [],
    advice: '',
    adviceList: [],
    detail: '',
    dateStr: '',
    reportId: '',
    photoPath: '',
    imgLoaded: false,
    imgDisplayWidth: 0,
    imgDisplayHeight: 0,
    imgOrigWidth: 0,
    imgOrigHeight: 0
  },

  onLoad(options) {
    if (options.data) {
      const result = JSON.parse(decodeURIComponent(options.data))
      const severity = result.overall_severity || 'HEALTHY'
      const key = severity.toLowerCase()

      const detections = (result.detections || []).map(d => ({
        ...d,
        cn_name: cnNameMap[d.class_name] || d.class_name,
        icon: iconMap[d.class_name] || '🔍',
        boxColor: colorMap[d.class_name] || '#6B7280',
        description: descMap[d.class_name] || '请关注此问题',
        severityKey: d.severity ? d.severity.toLowerCase() : 'healthy',
        severityLabel: { 'healthy': '健康', 'mild': '轻度', 'medium': '中度', 'severe': '重度' }[d.severity?.toLowerCase()] || '轻度',
        confPercent: Math.round((d.confidence || 0) * 100)
      }))

      // Bounding box positions (placeholder - real positions from backend bbox)
      detections.forEach(d => {
        if (d.bbox && d.bbox.length >= 4) {
          // bbox is relative to original image, will be recalculated on image load
          d._bbox = d.bbox
        }
      })

      const date = result.timestamp ? new Date(result.timestamp) : new Date()
      const adviceList = adviceBySeverity[severity] || adviceBySeverity['HEALTHY']

      this.setData({
        emoji: { 'HEALTHY': '😊', 'MILD': '🙂', 'MEDIUM': '😟', 'SEVERE': '😰' }[severity],
        severityScore: result.severity_score || 100,
        severityKey: key,
        scoreLabel: { 'HEALTHY': '牙齿健康', 'MILD': '轻度问题', 'MEDIUM': '中度问题', 'SEVERE': '需要就医' }[severity],
        detections,
        advice: result.advice || '请保持良好的口腔卫生习惯',
        adviceList,
        detail: result.detail || '',
        dateStr: this.formatDate(date),
        reportId: result.id || ('SG' + Date.now().toString(36).toUpperCase()),
        photoPath: result.photoPath || ''
      })
    }
  },

  onImageLoad(e) {
    const sysInfo = wx.getSystemInfoSync()
    const maxW = sysInfo.windowWidth - 80 // padding
    const maxH = maxW * 0.75

    // For now, set a reasonable display size
    this.setData({
      imgLoaded: true,
      imgDisplayWidth: maxW * 2, // rpx
      imgDisplayHeight: maxH * 2,
      imgOrigWidth: e.detail.width,
      imgOrigHeight: e.detail.height
    })

    // Calculate bounding box positions
    if (this.data.imgOrigWidth > 0) {
      const scaleX = (maxW * 2) / this.data.imgOrigWidth
      const scaleY = (maxH * 2) / this.data.imgOrigHeight
      const detections = this.data.detections.map(d => {
        if (d._bbox) {
          const [x1, y1, x2, y2] = d._bbox
          return {
            ...d,
            boxLeft: x1 * scaleX,
            boxTop: y1 * scaleY,
            boxWidth: (x2 - x1) * scaleX,
            boxHeight: (y2 - y1) * scaleY
          }
        }
        return {
          ...d,
          boxLeft: 100 * Math.random(),
          boxTop: 80 * Math.random(),
          boxWidth: 120 + Math.random() * 60,
          boxHeight: 100 + Math.random() * 40
        }
      })
      this.setData({ detections })
    }
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `${y}年${m}月${d}日 ${h}:${min}:${s} 星期${weekdays[date.getDay()]}`
  },

  downloadReport() {
    wx.showLoading({ title: '生成报告中...' })
    // Use canvas to generate report image
    const query = wx.createSelectorQuery()
    query.select('.report-header').boundingClientRect()
    query.exec((res) => {
      wx.hideLoading()
      // Fallback: save photo if available
      if (this.data.photoPath) {
        wx.saveImageToPhotosAlbum({
          filePath: this.data.photoPath,
          success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: () => {
            wx.showModal({
              title: '需要授权',
              content: '请授权保存图片到相册',
              success: (res) => {
                if (res.confirm) wx.openSetting()
              }
            })
          }
        })
      } else {
        wx.showToast({ title: '暂无可保存的图片', icon: 'none' })
      }
    })
  },

  detectAgain() {
    wx.redirectTo({ url: '/pages/camera/camera' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})