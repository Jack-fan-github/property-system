const app = getApp()

Page({
  data: {
    user: null,
    defaultAvatar: ''
  },

  onShow() {
    this.refreshUser()
  },

  refreshUser() {
    const user = wx.getStorageSync('user')
    const token = app.globalData.token || wx.getStorageSync('token')
    if (user && token) {
      // Re-fetch latest user data
      app.request({
        url: '/LoginRegister/GetUserData',
        data: { userId: user.userId }
      }).then(res => {
        if (res.code === '200') {
          res.data.avatarUrl = app.withAuthUrl(res.data.avatarUrl)
          this.setData({ user: res.data })
          wx.setStorageSync('user', res.data)
        }
      })
    } else {
      this.setData({ user: null })
    }
    this.setData({
      defaultAvatar: app.withAuthUrl(`${app.globalData.baseUrl}/files/download/img.jpg`)
    })
  },

  goToEdit() {
    if (!this.data.user) {
      this.goToLogin()
      return
    }
    wx.navigateTo({ url: '/pages/profile/edit/edit' })
  },

  goToChangePwd() {
    if (!this.data.user) {
      this.goToLogin()
      return
    }
    wx.navigateTo({ url: '/pages/profile/change-password/change-password' })
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.request({
            url: '/LoginRegister/logout',
            method: 'POST'
          }).finally(() => {
            wx.removeStorageSync('token')
            wx.removeStorageSync('user')
            wx.removeStorageSync('wechatOpenid')
            app.globalData.token = null
            wx.reLaunch({ url: '/pages/login/login' })
          })
        }
      }
    })
  }
})
