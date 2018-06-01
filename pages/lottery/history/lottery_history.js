// pages/lottery/history/lottery_history.js
const app = getApp()
var pageRoute = "pages/lottery/history/lottery_history";
var lotteryId;
var count = 15;
var enableLoadMore = false;

Date.prototype.format = function (fmt) {
  var o = {
    "y+": this.getFullYear(), //年份
    "M+": this.getMonth() + 1,//月份
    "d+": this.getDate(),//日
    "H+": this.getHours(),//小时
    "m+": this.getMinutes(),//分钟
    "s+": this.getSeconds(),//秒
    "S+": this.getMilliseconds()//毫秒
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      var value = ("00" + o[k]);
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : value.substr(value.length - RegExp.$1.length))
    }
  }
  return fmt;
}

Number.prototype.formatWithZero = function (length) {
  var str = this.valueOf() + "";
  var currentLength = str.length;
  var result = "";
  var needLength = length - currentLength;
  if (needLength <= 0) {
    return str;
  }
  for (var i = 0; i < needLength; i++) {
    result += "0";
  }
  return result + str;
}

var calculateProbability = function (item, list) {
  var count = list.length;
  var result = 0;
  for (var i = 0; i < count; i++) {
    if (item == list[i]) {
      result++;
    }
  }
  return result * 100 / count;
}

var createBalls = function (count) {
  var result = new Array();
  for (var i = 0; i < count; i++) {
    result.push((i + 1).formatWithZero(2));
  }
  return result;
}
//计算蓝色球概率
var createBlueBallChartData = function (lotteries) {
  //横轴数据
  var bbcCategories = createBalls(16);
  //纵轴数据
  var bbcData = new Array();
  var blueBalls = new Array();
  var length = lotteries.length;
  for (var i = 0; i < length; i++) {
    blueBalls.push(lotteries[i].blueBall);
  }
  for (var i = 0; i < 16; i++) {
    bbcData.push(calculateProbability(bbcCategories[i], blueBalls));
  }
  return {
    categories: bbcCategories,
    data: bbcData
  }
}

var loadLotteries = function (lotteryId, endTime, callback) {
  var yyData = app.getYYData()
  yyData.code = lotteryId
  yyData.endTime = endTime;
  yyData.count = count
  wx.request({
    url: 'https://route.showapi.com/44-2',
    header: app.getYYHeader(),
    data: yyData,
    success: function (res) {
      var page = app.getPage(pageRoute);
      var errMsg = null;
      if (200 == res.statusCode) {//成功
        if (0 == res.data.showapi_res_code) {
          console.debug(res.data.showapi_res_body.result)
          var length = res.data.showapi_res_body.result.length
          for (var i = 0; i < length; i++) {
            var item = res.data.showapi_res_body.result[i]
            var mDate = item.time.substr(0, 10)
            var mTime = item.time.substr(11)
            item.mDate = mDate;
            item.mTime = mTime;
            var array = item.openCode.split("+")
            var redBallsStr = array[0];
            var blueBall = array[1];
            var redBalls = redBallsStr.split(",")
            item.redBallsStr = redBallsStr
            item.redBalls = redBalls
            item.blueBall = blueBall
          }
          callback.setData(page, {
            status: "success",
            lotteries: res.data.showapi_res_body.result
          })
          return;
        }
        errMsg = res.data.showapi_res_error
      } else {
        errMsg = res.errMsg
      }
      callback.setData(page, {
        status: "failure",
        lotteries: errMsg
      })
    },
    fail: function (res) {
      var page = app.getPage(pageRoute);
      callback.setData(page, {
        status: "failure",
        lotteries: res.errMsg
      })
    }
  });
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    noDataDesc: "无数据",
    status: null,
    lotteries: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    lotteryId = options.lotteryId
    wx.showLoading({
      title: '正在加载...',
    })
    loadLotteries(lotteryId, "", {
      setData: function (page, data) {
        enableLoadMore = data.lotteries != null && data.lotteries.length == count
        page.setData(data)
        wx.hideLoading()
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
    loadLotteries(lotteryId, "", {
      setData: function (page, data) {
        enableLoadMore = data.lotteries != null && data.lotteries.length == count
        page.setData(data)
        wx.stopPullDownRefresh()
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!enableLoadMore) {
      wx.showToast({
        title: '无更多数据',
        icon: 'none'
      })
      return;
    }
    var oldLotteries = app.getPage(pageRoute).data.lotteries;
    var timestamp = oldLotteries[oldLotteries.length - 1].timestamp;
    //易源数据返回的时间戳到秒
    timestamp = timestamp * 1000 - 36000000;//目前暂定取一个小时之前的数据
    var endTime = new Date();
    endTime.setTime(timestamp);
    endTime.setMinutes(endTime.getMinutes() - 1);
    var endTimeStr = endTime.format("yyyy-MM-dd HH:mm:ss");
    loadLotteries(lotteryId, endTimeStr, {
      setData: function (page, data) {
        enableLoadMore = data.lotteries != null && data.lotteries.length == count
        var oldLotteries = page.data.lotteries;
        if ("success" == data.status) {
          var newLotteries = data.lotteries;
          for (var i = 0; i < newLotteries.length; i++) {
            oldLotteries.push(newLotteries[i]);
          }
          page.setData({
            lotteries: oldLotteries
          })
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})