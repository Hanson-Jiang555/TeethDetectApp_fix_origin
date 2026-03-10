// camera.js - 拍照检测页
const { uploadImage } = require('../../utils/api')
const app = getApp()

const tips = [
  '确保光线充足，避免逆光拍摄',
  '正对镜头，张大嘴巴露出牙齿',
  '尽量让牙齿占据画面中央',
  '保持手机稳定，对焦清晰后再拍'
]

Page({
  data: {
    photoPath: '',
    analyzing: false,
    errorMsg: '',
    errorTitle: '照片不符合要求',
    tipText: '',
    progress: 0,
    loadingStep: '准备中...'
  },

  onLoad() {
    this.setData({ tipText: tips[Math.floor(Math.random() * tips.length)] })
    this.startTipRotation()
  },

  onUnload() {
    if (this.tipTimer) clearInterval(this.tipTimer)
    if (this.progressTimer) clearInterval(this.progressTimer)
  },

  startTipRotation() {
    let idx = 0
    this.tipTimer = setInterval(() => {
      idx = (idx + 1) % tips.length
      this.setData({ tipText: tips[idx] })
    }, 4000)
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      sizeType: ['compressed'],
      camera: 'front',
      success: (res) => {
        this.setData({ photoPath: res.tempFiles[0].tempFilePath, errorMsg: '' })
      }
    })
  },

  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ photoPath: res.tempFiles[0].tempFilePath, errorMsg: '' })
      }
    })
  },

  retakePhoto() {
    this.setData({ photoPath: '', errorMsg: '', progress: 0 })
  },

  retryPhoto() {
    this.setData({ photoPath: '', errorMsg: '', progress: 0 })
  },

  async startAnalyze() {
    if (!this.data.photoPath) return
    this.setData({ analyzing: true, progress: 0, loadingStep: '正在上传图片...' })

    // Simulated progress
    let prog = 0
    const steps = [
      { at: 20, text: '正在检测人脸...' },
      { at: 45, text: '正在识别牙齿区域...' },
      { at: 65, text: 'AI模型分析中...' },
      { at: 85, text: '正在生成检测报告...' },
    ]

    this.progressTimer = setInterval(() => {
      if (prog < 95) {
        prog += Math.random() * 8 + 2
        if (prog > 95) prog = 95
        this.setData({ progress: Math.round(prog) })
        const step = steps.filter(s => prog >= s.at).pop()
        if (step) this.setData({ loadingStep: step.text })
      }
    }, 300)

    try {
      const result = await uploadImage(this.data.photoPath)

      clearInterval(this.progressTimer)
      this.setData({ progress: 100, loadingStep: '分析完成！' })

      if (result.status === 'invalid_photo') {
        setTimeout(() => {
          this.setData({
            analyzing: false,
            photoPath: '',
            errorMsg: result.advice || result.photo_check?.message || '请重新拍照',
            progress: 0
          })
        }, 500)
        return
      }

      // Save with timestamp
      const record = {
        ...result,
        photoPath: this.data.photoPath,
        timestamp: new Date().toISOString(),
        dateStr: this.formatDate(new Date())
      }

      app.saveHistory(record)

      setTimeout(() => {
        this.setData({ analyzing: false })
        wx.navigateTo({
          url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(record))
        })
      }, 600)

    } catch (err) {
      clearInterval(this.progressTimer)
      console.error('检测失败:', err)
      this.setData({
        analyzing: false,
        errorMsg: '检测失败，请检查网络后重试',
        progress: 0
      })
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
    return `${y}年${m}月${d}日 ${h}:${min}:${s} 周${weekdays[date.getDay()]}`
  }
})