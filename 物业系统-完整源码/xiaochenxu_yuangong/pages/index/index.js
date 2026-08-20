const app = getApp()

Page({
  data: {
    employee: {},
    initials: '员',
    menuList: [
      { id: 'repair', name: '工单大厅', iconText: '单', color: '#2563eb' },
      { id: 'mine', name: '我的工单', iconText: '我', color: '#0f9f78' },
    ]
  },

  onShow() {
    const employee = wx.getStorageSync('employee')
    if (!employee) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    const displayName = employee.nickname || employee.name || employee.username || '员工'
    this.setData({ employee, initials: displayName.slice(0, 1) })
  },

  handleMenuClick(e) {
    const id = e.currentTarget.dataset.id
    switch (id) {
      case 'repair':
        wx.navigateTo({ url: '/pages/repair/list/list' })
        break
      case 'mine':
        wx.navigateTo({ url: '/pages/repair/list/list?mine=1' })
        break
    }
  },

  // 跳转到个人信息页面
  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('employee')
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
