// history.js - 历史记录页（增强版）
const app = getApp()

const emojiMap = { 'HEALTHY': '😊', 'MILD': '🙂', 'MEDIUM': '😟', 'SEVERE': '😰' }
const statusMap = { 'HEALTHY': '牙齿健康', 'MILD': '轻度问题', 'MEDIUM': '中度问题', 'SEVERE': '需要就医' }
const keyMap = { 'HEALTHY': 'healthy', 'MILD': 'mild', 'MEDIUM': 'medium', 'SEVERE': 'severe' }
const cnNameMap = {
  'Tooth': '牙齿', 'Caries': '龋齿', 'Missing_Tooth': '缺牙',
  'Plaque': '牙菌斑', 'Calculus': '牙结石', 'Gingivitis': '牙龈炎', 'Enamel_Wear': '釉质磨损'
}

Page({
  data: {
    history: [],
    maxScore: 0,
    minScore: 0,
    avgScore: 0,
    batchMode: false,
    allSelected: false,
    selectedCount: 0
  },

  onShow() {
    this.loadHistory()
  },

  loadHistory() {
    const raw = app.globalData.history || []
    const history = raw.map(item => {
      const sev = item.overall_severity || 'HEALTHY'
      const date = item.timestamp ? new Date(item.timestamp) : new Date()
      const classes = (item.detected_classes || []).filter(c => c !== 'Tooth').map(c => cnNameMap[c] || c)
      return {
        ...item,
        emoji: emojiMap[sev],
        statusText: statusMap[sev],
        severityKey: keyMap[sev],
        score: item.severity_score || 0,
        dateStr: this.formatDate(date),
        detectedClasses: classes.length > 0 ? classes.join('、') : '',
        selected: false
      }
    })

    const scores = history.map(h => h.score)
    const max = scores.length ? Math.max(...scores) : 0
    const min = scores.length ? Math.min(...scores) : 0
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    this.setData({ history, maxScore: max, minScore: min, avgScore: avg, batchMode: false })

    if (history.length >= 2) {
      setTimeout(() => this.drawChart(history), 300)
    }
  },

  drawChart(data) {
    const ctx = wx.createCanvasContext('trendChart', this)
    const width = 660
    const height = 300

    const scores = data.slice(0, 10).map(d => d.score).reverse()
    const labels = data.slice(0, 10).map(d => {
      const date = d.timestamp ? new Date(d.timestamp) : new Date()
      return `${date.getMonth()+1}/${date.getDate()}`
    }).reverse()

    const padding = { top: 30, right: 20, bottom: 40, left: 50 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    ctx.clearRect(0, 0, width, height)

    // Grid
    ctx.setStrokeStyle('#F0F0F0')
    ctx.setLineWidth(1)
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    // Y labels
    ctx.setFillStyle('#9CA3AF')
    ctx.setFontSize(16)
    ctx.setTextAlign('right')
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i
      ctx.fillText((100 - i * 25).toString(), padding.left - 8, y + 5)
    }

    if (scores.length >= 2) {
      const step = chartW / (scores.length - 1)

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)')
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.02)')

      // Fill
      ctx.beginPath()
      scores.forEach((score, i) => {
        const x = padding.left + i * step
        const y = padding.top + chartH * (1 - score / 100)
        if (i === 0) ctx.moveTo(x, y) else ctx.lineTo(x, y)
      })
      ctx.lineTo(padding.left + (scores.length - 1) * step, height - padding.bottom)
      ctx.lineTo(padding.left, height - padding.bottom)
      ctx.closePath()
      ctx.setFillStyle(gradient)
      ctx.fill()

      // Line
      ctx.beginPath()
      scores.forEach((score, i) => {
        const x = padding.left + i * step
        const y = padding.top + chartH * (1 - score / 100)
        if (i === 0) ctx.moveTo(x, y) else ctx.lineTo(x, y)
      })
      ctx.setStrokeStyle('#2563EB')
      ctx.setLineWidth(3)
      ctx.stroke()

      // Dots
      scores.forEach((score, i) => {
        const x = padding.left + i * step
        const y = padding.top + chartH * (1 - score / 100)
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.setFillStyle('#2563EB')
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.setFillStyle('#fff')
        ctx.fill()
      })

      // X labels
      ctx.setFillStyle('#9CA3AF')
      ctx.setFontSize(16)
      ctx.setTextAlign('center')
      labels.forEach((label, i) => {
        ctx.fillText(label, padding.left + i * step, height - padding.bottom + 24)
      })
    }

    ctx.draw()
  },

  toggleBatch() {
    const history = this.data.history.map(h => ({ ...h, selected: false }))
    this.setData({ batchMode: !this.data.batchMode, history, allSelected: false, selectedCount: 0 })
  },

  toggleSelect(e) {
    const idx = e.currentTarget.dataset.index
    const history = this.data.history
    history[idx].selected = !history[idx].selected
    const selectedCount = history.filter(h => h.selected).length
    const allSelected = selectedCount === history.length
    this.setData({ history, selectedCount, allSelected })
  },

  selectAll() {
    const allSelected = !this.data.allSelected
    const history = this.data.history.map(h => ({ ...h, selected: allSelected }))
    const selectedCount = allSelected ? history.length : 0
    this.setData({ history, allSelected, selectedCount })
  },

  deleteItem(e) {
    const idx = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: '确定删除这条检测记录吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          app.deleteHistory(idx)
          this.loadHistory()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  batchDelete() {
    const count = this.data.selectedCount
    wx.showModal({
      title: '批量删除',
      content: `确定删除选中的 ${count} 条记录吗？此操作不可恢复。`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          const toDelete = this.data.history
            .map((h, i) => h.selected ? i : -1)
            .filter(i => i >= 0)
            .sort((a, b) => b - a)

          toDelete.forEach(i => app.deleteHistory(i))
          this.loadHistory()
          wx.showToast({ title: `已删除${count}条`, icon: 'success' })
        }
      }
    })
  },

  downloadItem(e) {
    const idx = e.currentTarget.dataset.index
    const record = this.data.history[idx]
    if (record && record.photoPath) {
      wx.saveImageToPhotosAlbum({
        filePath: record.photoPath,
        success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: () => {
          wx.showModal({
            title: '需要授权',
            content: '请授权保存图片到相册',
            success: (res) => { if (res.confirm) wx.openSetting() }
          })
        }
      })
    } else {
      wx.showToast({ title: '该记录无图片可下载', icon: 'none' })
    }
  },

  viewDetail(e) {
    if (this.data.batchMode) return
    const index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(app.globalData.history[index]))
    })
  },

  goDetect() {
    wx.switchTab({ url: '/pages/camera/camera' })
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `${y}-${m}-${d} ${h}:${min} 周${weekdays[date.getDay()]}`
  }
})