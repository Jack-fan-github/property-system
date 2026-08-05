App({
  globalData: {
    baseUrl: 'https://ridge-pond-placement-fee.trycloudflare.com',
    token: '',
    employee: null
  },

  onLaunch() {
    const employee = wx.getStorageSync('employee')
    const token = wx.getStorageSync('token') || (employee && employee.token) || ''
    if (employee) this.globalData.employee = employee
    if (token) {
      this.globalData.token = token
      wx.setStorageSync('token', token)
    }
  },

  setToken(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },

  withAuthUrl(url) {
    if (!url || typeof url !== 'string') return url
    const employee = wx.getStorageSync('employee') || {}
    const token = this.globalData.token || wx.getStorageSync('token') || employee.token || ''
    let next = url
    if (!/^https?:\/\//.test(next)) {
      next = this.globalData.baseUrl + (next.startsWith('/') ? next : '/' + next)
    }
    if (!next.includes('/files/download/') || !token || next.includes('token=')) return next
    const pure = token.startsWith('Bearer ') ? token.slice(7) : token
    if (!pure) return next
    const join = next.includes('?') ? '&' : '?'
    return next + join + 'token=' + encodeURIComponent(pure)
  },

  request(opts) {
    const url = opts.url
    const method = opts.method || 'GET'
    const data = opts.data || {}
    const header = opts.header || {}
    const employee = wx.getStorageSync('employee')
    const token = this.globalData.token || wx.getStorageSync('token') || (employee && employee.token) || ''
    const isLogin = url === '/LoginRegister/employeeLogin'
    if (!isLogin && !token) {
      wx.redirectTo({ url: '/pages/login/login' })
      return Promise.resolve({ code: '401', msg: '未登录' })
    }
    const reqHeader = Object.assign({ 'Content-Type': 'application/json' }, header)
    if (!isLogin && token) reqHeader['Authorization'] = 'Bearer ' + token

    var reqUrl = this.globalData.baseUrl + url
    var reqData = undefined
    if (method === 'GET') {
      var parts = []
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
        }
      }
      if (parts.length > 0) reqUrl += '?' + parts.join('&')
    } else {
      reqData = Object.assign({}, data)
    }

    return new Promise(function(resolve, reject) {
      wx.request({
        url: reqUrl,
        method: method,
        data: reqData,
        header: reqHeader,
        timeout: 30000,
        success: function(res) {
          if (res.statusCode === 401) wx.redirectTo({ url: '/pages/login/login' })
          else if (res.statusCode === 403) wx.showToast({ title: '无权限或会话失效', icon: 'none' })
          resolve(res.data)
        },
        fail: reject
      })
    })
  }
})
