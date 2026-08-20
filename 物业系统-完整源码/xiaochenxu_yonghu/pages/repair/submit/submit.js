const app = getApp()

Page({
  data: {
    categories: [],
    categoryIndex: null,
    locations: ['食堂', '教学楼', '宿舍', '体育馆', '其他'],
    locationIndex: null,
    description: '',
    phone: '',
    buildingNo: '',
    unitNo: '',
    roomNo: '',
    files: [],
    videoPreviewVisible: false,
    videoPreviewSrc: '',
    priority: 'normal', // 优先级，默认为普通
    date: '',
    time: '',
    dateText: '',
    startDate: '', // 可选日期开始
    endDate: '' // 可选日期结束
  },

  onLoad(options) {
    const user = wx.getStorageSync('user')
    const token = app.globalData.token || wx.getStorageSync('token') || user?.token
    if (!user || !token) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    const buildingNo = user?.buildingNo || '1'
    const unitNo = user?.unitNo || '1'
    const roomNo = user?.roomNo || '101'
    this.setData({
      phone: user?.phone || '',
      buildingNo,
      unitNo,
      roomNo
    })
    
    const now = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)
    
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    
    const initialDate = formatDate(now)
    const initialTime = formatTime(now)

    this.setData({
      date: initialDate,
      time: initialTime,
      dateText: `${initialDate} ${initialTime}`,
      startDate: formatDate(now),
      endDate: formatDate(endDate)
    })
  },

  onShow() {
    this.loadCategories()
  },

  chooseMedia() {
    if (this.data.files.length >= 6) {
      wx.showToast({ title: '最多上传6个', icon: 'none' })
      return
    }
    wx.showActionSheet({
      itemList: ['选图片', '选视频'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.chooseImages()
        } else if (res.tapIndex === 1) {
          this.chooseVideo()
        }
      }
    })
  },

  chooseImages() {
    wx.chooseImage({
      count: 6 - this.data.files.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const paths = res.tempFilePaths || []
        if (!paths.length) {
          return
        }
        const newFiles = paths.map(path => ({ path, type: 'image' }))
        this.setData({ files: this.data.files.concat(newFiles) })
      }
    })
  },

  chooseVideo() {
    if (this.data.files.length >= 6) {
      wx.showToast({ title: '最多上传6个', icon: 'none' })
      return
    }
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 30,
      success: (res) => {
        if (!res.tempFilePath) {
          return
        }
        wx.showLoading({ title: '转码中' })
        wx.compressVideo({
          src: res.tempFilePath,
          quality: 'medium',
          success: (comp) => {
            const path = comp.tempFilePath || res.tempFilePath
            const newFile = { path, type: 'video' }
            this.setData({ files: this.data.files.concat([newFile]) })
          },
          fail: () => {
            const newFile = { path: res.tempFilePath, type: 'video' }
            this.setData({ files: this.data.files.concat([newFile]) })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      }
    })
  },

  previewFile(e) {
    const { src, type } = e.currentTarget.dataset
    if (type === 'video') {
      this.setData({
        videoPreviewVisible: true,
        videoPreviewSrc: src
      })
      return
    }
    const imageUrls = this.data.files
      .filter(f => f.type !== 'video')
      .map(f => f.path)
    wx.previewImage({
      current: src,
      urls: imageUrls
    })
  },

  closeVideoPreview() {
    this.setData({
      videoPreviewVisible: false,
      videoPreviewSrc: ''
    })
  },

  stopTap() {},

  deleteFile(e) {
    const index = e.currentTarget.dataset.index
    const files = this.data.files
    files.splice(index, 1)
    this.setData({ files })
  },

  uploadSingleFile(file) {
    return new Promise((resolve, reject) => {
      const rawBaseUrl = wx.getStorageSync('baseUrl') || app.globalData.baseUrl || ''
      const baseUrl = rawBaseUrl.replace(/\/$/, '')
      const storedUser = wx.getStorageSync('user') || {}
      const token = app.globalData.token || wx.getStorageSync('token') || storedUser.token || ''
      const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
      const headers = { Authorization: authHeader }
      wx.uploadFile({
        url: `${baseUrl}/files/upload`,
        filePath: file.path,
        name: 'file',
        header: headers,
        formData: { folder: 'repair' },
        timeout: 30000,
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data)
              if (data.code === '200') {
                resolve(data.data)
              } else {
                reject(data.msg || '上传失败')
              }
            } catch (e) {
              reject('响应解析失败')
            }
          } else {
            reject(`上传失败(${res.statusCode})`)
          }
        },
        fail: (err) => {
          reject(err && err.errMsg ? err.errMsg : '上传失败')
        }
      })
    })
  },

  loadCategories() {
    const fallbackCategories = [
      { categoryId: 1, categoryName: '水电' },
      { categoryId: 2, categoryName: '门窗' },
      { categoryId: 3, categoryName: '地面' },
      { categoryId: 4, categoryName: '家具' },
      { categoryId: 5, categoryName: '空调' },
      { categoryId: 6, categoryName: '其他' }
    ]
    app.request({
      url: '/repair/categories',
      method: 'GET'
    }).then(res => {
      const categories = Array.isArray(res) ? res : res && res.data
      this.setData({ categories: Array.isArray(categories) && categories.length ? categories : fallbackCategories })
    }).catch(() => {
      this.setData({ categories: fallbackCategories })
    })
  },

  bindCategoryChange(e) {
    this.setData({ categoryIndex: e.detail.value })
  },

  bindLocationChange(e) {
    this.setData({ locationIndex: e.detail.value })
  },

  bindDescriptionInput(e) {
    this.setData({ description: e.detail.value })
  },

  bindPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  bindBuildingInput(e) {
    this.setData({ buildingNo: e.detail.value })
  },

  bindUnitInput(e) {
    this.setData({ unitNo: e.detail.value })
  },

  bindRoomInput(e) {
    this.setData({ roomNo: e.detail.value })
  },

  // 处理优先级选择
  bindPriorityChange(e) {
    this.setData({ priority: e.detail.value })
  },

  bindDateChange(e) {
    const date = e.detail.value
    const time = this.data.time || '00:00'
    this.setData({
      date,
      dateText: `${date} ${time}`
    })
  },

  bindTimeChange(e) {
    const time = e.detail.value
    const date = this.data.date || ''
    this.setData({
      time,
      dateText: date ? `${date} ${time}` : time
    })
  },

  submit() {
    // 检查表单数据
    if (this.data.categoryIndex === null) {
      wx.showToast({ title: '请选择类别', icon: 'none' })
      return
    }
    if (!this.data.description) {
      wx.showToast({ title: '请填写描述', icon: 'none' })
      return
    }
    if (this.data.locationIndex === null) {
      wx.showToast({ title: '请选择报修位置', icon: 'none' })
      return
    }
    if (!this.data.files.some(file => file.type === 'image')) {
      wx.showToast({ title: '请至少上传1张现场照片', icon: 'none' })
      return
    }
    if (!this.data.date || !this.data.time) {
      wx.showToast({ title: '请选择预约上门时间', icon: 'none' })
      return
    }
    if (!this.data.phone) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' })
      return
    }
    this.validateUploadFiles().then(() => {
      wx.showLoading({ title: '提交中' })
      const uploadPromises = this.data.files.map(file => this.uploadSingleFile(file))

      return Promise.all(uploadPromises).then(urls => this.submitOrder(urls))
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: err || '附件上传失败', icon: 'none' })
      console.error(err)
    })
  },

  validateUploadFiles() {
    const maxSingleSize = 5 * 1024 * 1024
    const maxTotalSize = 35 * 1024 * 1024
    return Promise.all(this.data.files.map(file => new Promise((resolve, reject) => {
      wx.getFileInfo({
        filePath: file.path,
        success: info => resolve(info.size),
        fail: () => reject('无法读取附件大小，请重新选择')
      })
    }))).then(sizes => {
      if (sizes.some(size => size > maxSingleSize)) {
        return Promise.reject('单张图片或视频不能超过5MB')
      }
      const totalSize = sizes.reduce((total, size) => total + size, 0)
      if (totalSize > maxTotalSize) {
        return Promise.reject('全部附件合计不能超过35MB')
      }
    })
  },

  submitOrder(fileUrls) {
    const user = wx.getStorageSync('user') || {}
    
    const data = {
      userId: user.userId || null,
      categoryId: this.data.categories[this.data.categoryIndex].categoryId,
      location: this.data.locations[this.data.locationIndex],
      description: this.data.description,
      phone: this.data.phone,
      buildingNo: parseInt(this.data.buildingNo) || 0,
      unitNo: parseInt(this.data.unitNo) || 0,
      roomNo: parseInt(this.data.roomNo) || 0,
      priority: this.data.priority,
      appointmentTime: `${this.data.date} ${this.data.time}:00`,
      status: '待处理',
      fileUrls: fileUrls // Pass URLs to backend
    }

    app.request({
      url: '/repair/submit',
      method: 'POST',
      data: data
    }).then(res => {
      wx.hideLoading()
      if (res.code === '200') {
        wx.showToast({ title: '提交成功' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({ title: res.msg || '提交失败', icon: 'none' })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '网络异常', icon: 'none' })
      console.error('提交失败:', err)
    })
  }
})
