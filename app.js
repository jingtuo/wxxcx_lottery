//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    //检测用户登录是否超时
    wx.checkSession({
      success: function () {
        console.debug("用户登录未超时")
      },
      fail: function () {
        wx.login({
          success: function (res) {
            console.debug("微信登录成功")
          }
        })
      }
    })

  },
  globalData: {
    userInfo: null,
    //彩票
    lotteries: null
  },
  getPage: function (pageRoute) {
    var pages = getCurrentPages();
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      if (pageRoute == page.route) {
        return page;
      }
    }
    return pages[0];
  },

  //易源请求数据
  getYYHeader: function () {
    return {
      enctype: "application/x-www-form-urlencoded"
    }
  },
  getYYData: function () {
    return {
      showapi_appid: "58126",
      showapi_sign: "6dd13bd0b3c84871885afd633d28cf67",
      showapi_timestamp: "",
      showapi_sign_method: "md5",
      showapi_res_gzip: "1"
    }
  }
})