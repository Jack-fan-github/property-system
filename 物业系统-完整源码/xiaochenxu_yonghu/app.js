App({
  globalData: {
    // 本地 Docker 后端；真机调试时请替换为可访问的 HTTPS API 域名
    baseUrl: 'http://localhost:8080',
    token: '',
    scanHandled: false
  },

  onLaunch(options) {
    const token = wx.getStorageSync('token')
    if (token) this.globalData.token = token
    this.handleScanEntry(options)
  },

  onShow(options) {
    this.handleScanEntry(options)
  },

  handleScanEntry(options) {
    if (!options || (!options.scene && !(options.query && options.query.scene))) return
    if (this.globalData.scanHandled) return
    this.globalData.scanHandled = true
    const hasToken = !!(this.globalData.token || wx.getStorageSync('token'))
    const target = hasToken ? '/pages/repair/list/list' : '/pages/login/login'
    setTimeout(() => wx.reLaunch({ url: target }), 0)
  },

  setToken(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },

  getToken() {
    const user = wx.getStorageSync('user') || {}
    return this.globalData.token || wx.getStorageSync('token') || user.token || ''
  },

  getBearerToken() {
    const t = this.getToken()
    return t ? (t.startsWith('Bearer ') ? t : 'Bearer ' + t) : ''
  },

  withAuthUrl(url) {
    if (!url || typeof url !== 'string') return url
    if (!url.includes('/files/download/')) return url
    const token = this.getToken()
    if (!token) return url
    const pure = token.startsWith('Bearer ') ? token.slice(7) : token
    if (!pure) return url
    if (url.includes('token=')) return url
    const join = url.includes('?') ? '&' : '?'
    return url + join + 'token=' + encodeURIComponent(pure)
  },

  request(opts) {
    const url = opts.url
    const method = opts.method || 'GET'
    const data = opts.data || {}
    const header = opts.header || {}
    const token = this.getBearerToken()
    const reqHeader = Object.assign({ 'Content-Type': 'application/json' }, header)
    if (token) reqHeader['Authorization'] = token

    // GET请求参数放URL，POST放body
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
      reqData = data
    }

    return new Promise(function(resolve, reject) {
      wx.request({
        url: reqUrl,
        method: method,
        data: reqData,
        header: reqHeader,
        timeout: 30000,
        success: function(res) {
          if (typeof res.data === 'string') {
            try { res.data = JSON.parse(res.data) } catch (e) {}
          }
          resolve(res.data)
        },
        fail: reject
      })
    })
  }
})
