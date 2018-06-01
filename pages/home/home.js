// pages/home/home.js
const app = getApp()
var QQMapWX = require('../../js/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var pageRoute = "pages/home/home";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: null,
    lotteries: null,
    errMsg: null,
    ad_info: null,
    noDataDesc: "无数据"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载...',
    })
    wx.request({
      url: 'https://route.showapi.com/44-6',
      header: app.getYYHeader(),
      data: app.getYYData(),
      complete: function (res) {
        wx.hideLoading()
      },
      success: function (res) {
        var page = app.getPage(pageRoute);
        var errMsg = null;
        if (200 == res.statusCode) {//成功
          if (0 == res.data.showapi_res_code) {
            console.debug(res.data.showapi_res_body.result)
            var result = []
            //筛选热门的彩票
            var length = res.data.showapi_res_body.result.length
            for (var i = 0; i < length; i++) {
              var item = res.data.showapi_res_body.result[i]
              if (item.hots == "true" && item.high == "false") {
                result.push(item)
              }
            }
            console.debug(result)
            app.globalData.lotteries = result
            //获取所有运行页面
            //获取当前页面
            page.setData({
              status: "success",
              lotteries: result,
            });
            return;
          }
          errMsg = res.data.showapi_res_error
        } else {
          errMsg = res.errMsg
        }
        page.setData({
          status: "failure",
          lotteries: errMsg
        })
      },
      fail: function (res) {
        var page = app.getPage(pageRoute);
        page.setData({
          status: "failure",
          lotteries: res.errMsg
        })
      }
    });

    //获取位置
    qqmapsdk = new QQMapWX({
      key: 'JF7BZ-UIRC4-HVVUY-DIRJF-WB4IV-QFBUC'
    });
    wx.getLocation({
      /**
       * wgs84-返回gps坐标
       * gcj02-返回可用于wx.openLoaction的坐标
       */
      type: 'wgs84',
      altitude: false,
      success: function (res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          /**
           * 1 GPS坐标
           * 2 sogou经纬度
           * 3 baidu经纬度
           * 4 mapbar经纬度
           * 5 [默认]腾讯、google、高德坐标
           * 6 sogou墨卡托
           */
          coord_type: 1,
          success: function (res) {
            var page = app.getPage(pageRoute);
            if (0 == res.status) {//成功
              page.setData({
                ad_info: res.result.ad_info
              })
            }
          }
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 彩票详情
   */
  lotteryHistory: function (event) {
    wx.navigateTo({
      url: '/pages/lottery/history/lottery_history?lotteryId=' + event.currentTarget.id
    })
  }
})