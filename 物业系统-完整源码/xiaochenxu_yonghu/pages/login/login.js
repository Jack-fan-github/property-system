const app = getApp()

Page({
  data: {
    loginMode: 'password', // password | sms
    username: '',
    password: '',
    phone: '',
    smsCode: '',
    smsCountdown: 0,
    smsTimer: null
  },

  onUnload() {
    if (this.data.smsTimer) clearInterval(this.data.smsTimer)
  },

  switchMode() {
    const mode = this.data.loginMode === 'password' ? 'sms' : 'password'
    this.setData({ loginMode: mode })
  },

  // 发送短信验证码
  sendSmsCode() {
    const phone = this.data.phone
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    wx.showLoading({ title: '发送中...' })
    app.request({
      url: '/LoginRegister/sendSmsCode',
      method: 'POST',
      data: { phone }
    }).then(res => {
      wx.hideLoading()
      if (res.code === '200') {
        // 演示模式：验证码直接返回，弹窗显示方便测试
        wx.showModal({
          title: '验证码已发送',
          content: '演示环境验证码为：' + res.data,
          showCancel: false
        })
        this.startSmsCountdown()
      } else {
        wx.showToast({ title: res.msg || '发送失败', icon: 'none' })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '请求失败', icon: 'none' })
    })
  },

  startSmsCountdown() {
    this.setData({ smsCountdown: 60 })
    const timer = setInterval(() => {
      const c = this.data.smsCountdown - 1
      if (c <= 0) {
        clearInterval(timer)
        this.setData({ smsCountdown: 0, smsTimer: null })
      } else {
        this.setData({ smsCountdown: c })
      }
    }, 1000)
    this.setData({ smsTimer: timer })
  },

  handleLogin() {
    if (this.data.loginMode === 'password') {
      this.handlePasswordLogin()
    } else {
      this.handleSmsLogin()
    }
  },

  // 密码登录
  handlePasswordLogin() {
    if (!this.data.username || !this.data.password) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' })
      return
    }
    wx.showLoading({ title: '登录中...' })
    app.request({
      url: '/LoginRegister/userLogin',
      method: 'GET',
      data: {
        username: this.data.username,
        password: this.data.password
      }
    }).then(res => {
      wx.hideLoading()
      this.afterLogin(res)
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '请求失败', icon: 'none' })
    })
  },

  // 短信验证码登录
  handleSmsLogin() {
    if (!/^1\d{10}$/.test(this.data.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (!this.data.smsCode) {
      wx.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    wx.showLoading({ title: '登录中...' })
    app.request({
      url: '/LoginRegister/smsLogin',
      method: 'POST',
      data: {
        phone: this.data.phone,
        code: this.data.smsCode
      }
    }).then(res => {
      wx.hideLoading()
      this.afterLogin(res)
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '请求失败', icon: 'none' })
    })
  },

  afterLogin(res) {
    if (res.code === '200') {
      app.setToken(res.data.token)
      wx.setStorageSync('user', res.data)
      wx.showToast({ title: '登录成功' })
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/index/index' })
      }, 1500)
    } else {
      wx.showToast({ title: res.msg || '登录失败', icon: 'none' })
    }
  },

  handleWeChatLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          const cachedOpenid = wx.getStorageSync('wechatOpenid')
          wx.showLoading({ title: '一键登录中' })
          app.request({
            url: '/LoginRegister/wechatLogin',
            method: 'POST',
            data: {
              code: res.code,
              openid: cachedOpenid || ''
            }
          }).then(loginRes => {
            wx.hideLoading()
            if (loginRes.code === '200') {
              const data = loginRes.data
              if (data.needRegister) {
                if (data.openid) {
                  wx.setStorageSync('wechatOpenid', data.openid)
                }
                wx.showModal({
                  title: '提示',
                  content: '您是首次登录，请完善注册信息',
                  showCancel: false,
                  success: () => {
                    wx.navigateTo({
                      url: `/pages/register/register?openid=${data.openid}`
                    })
                  }
                })
              } else {
                app.setToken(data.token)
                wx.setStorageSync('user', data)
                if (cachedOpenid) {
                  wx.setStorageSync('wechatOpenid', cachedOpenid)
                }
                wx.showToast({ title: '登录成功' })
                setTimeout(() => {
                  wx.reLaunch({ url: '/pages/index/index' })
                }, 1500)
              }
            } else if (loginRes.code === '403') {
              wx.showModal({
                title: '提示',
                content: loginRes.msg || '账号状态异常',
                showCancel: false
              })
            } else {
              wx.showToast({ title: loginRes.msg || '登录失败', icon: 'none' })
            }
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({ title: '服务异常', icon: 'none' })
          })
        } else {
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
        }
      }
    })
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  },

  goToGuestRepair() {
    wx.navigateTo({ url: '/pages/repair/submit/submit?guest=1' })
  }
})
