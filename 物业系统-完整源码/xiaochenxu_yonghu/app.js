App({
  globalData: {
    baseUrl: 'https://ridge-pond-placement-fee.trycloudflare.com',
    token: ''
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    if (token) this.globalData.token = token
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
