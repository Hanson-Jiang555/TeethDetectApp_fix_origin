const { uploadImage } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    photoPath: '',
    analyzing: false,
    step: 1,
    errorMsg: ''
  },

  onLoad() {
    this.setData({ step: 1 })
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      sizeType: ['compressed'],
      camera: 'front',
      success: (res) => {
        this.setData({ photoPath: res.tempFiles[0].tempFilePath, step: 2, errorMsg: '' })
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
        this.setData({ photoPath: res.tempFiles[0].tempFilePath, step: 2, errorMsg: '' })
      }
    })
  },

  retakePhoto() {
    this.setData({ photoPath: '', step: 1, errorMsg: '' })
  },

  retryPhoto() {
    this.setData({ photoPath: '', step: 1, errorMsg: '' })
  },

  async startAnalyze() {
    if (!this.data.photoPath) return
    this.setData({ analyzing: true, step: 3 })

    try {
      const result = await uploadImage(this.data.photoPath)

      if (result.status === 'invalid_photo') {
        this.setData({
          analyzing: false,
          photoPath: '',
          errorMsg: result.advice || result.photo_check.message,
          step: 1
        })
        return
      }

      // 保存到历史
      app.saveHistory({
        ...result,
        photoPath: this.data.photoPath,
        timestamp: new Date().toISOString()
      })

      // 跳转结果页
      wx.navigateTo({
        url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(result))
      })

      this.setData({ analyzing: false })
    } catch (err) {
      console.error('检测失败:', err)
      this.setData({
        analyzing: false,
        errorMsg: '检测失败，请检查网络后重试'
      })
    }
  }
})
