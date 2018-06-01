//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      console.debug('已经授权')
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      return;
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        /**
         * 支持的scope:
         * scope.userInfo 用户信息;
         * scope.userLocation 地理位置;
         * scope.address  通讯地址;
         * scope.invoiceTitle 发票抬头;
         * scope.werun  微信运动步数;
         * scope.record 录音功能
         * scope.writePhotosAlbum 保存到相册
         * scope.camera 摄像头
         */
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          console.debug("已经授权")
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          })
          return;
        }
        wx.authorize({
          scope: 'scode.userInfo',
          success() {
            console.debug("授权成功")
            wx.getUserInfo({
              success: res => {
                this.globalData.userInfo = res.userInfo
                this.setData({
                  userInfo: res.userInfo,
                  hasUserInfo: true
                })
              }
            })
          }
        })
      }
    })
  }
})
