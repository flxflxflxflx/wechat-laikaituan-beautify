import tr from "../../../../../utils/tokenRequest"
// pages/roleView/gysView/childView/jszxView/jszxView.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
        text: '开团记录',
        iconPath: "/static/image/openTuan.png",
        selectedIconPath: "/static/image/openTuan2.png",
        // badge: '8'
      },
      {
        text: '余额提现',
        iconPath: "/static/image/yue2.png",
        selectedIconPath: "/static/image/yue.png",
      },
      {
        text: '订单流水',
        iconPath: "/static/image/orderFlow.png",
        selectedIconPath: "/static/image/orderFlow2.png",
        // dot: true
      },
      {
        text: '总流水账',
        iconPath: "/static/image/caigou.png",
        selectedIconPath: "/static/image/caigou2.png",
        // dot: true
      },
    ],
    href: app.globalData.apiUrl + "/uploads",
    // 开团记录
    openingRecord: [],
    isShow: false
  },
  tabChange(e) {
    switch (e.detail.index) {
      case 0:

        break;
      case 1:
        wx.redirectTo({
          url: '../balanceWithdrawal/balanceWithdrawal',
        })
        break;
      case 2:
        wx.redirectTo({
          url: '../orderFlow/orderFlow',
        })
        break;
      case 3:
        wx.redirectTo({
          url: '../generalJournal/generalJournal',
        })
        break;
      default:
        break;
    }
  },

  formatDate(time, format = 'YY-MM-DD hh:mm:ss') {
    var date = new Date(time);

    var year = date.getFullYear(),
      month = date.getMonth() + 1, //月份是从0开始的
      day = date.getDate(),
      hour = date.getHours(),
      min = date.getMinutes(),
      sec = date.getSeconds();
    var preArr = Array.apply(null, Array(10)).map(function (elem, index) {
      return '0' + index;
    });

    var newTime = format.replace(/YY/g, year)
      .replace(/MM/g, preArr[month] || month)
      .replace(/DD/g, preArr[day] || day)
      .replace(/hh/g, preArr[hour] || hour)
      .replace(/mm/g, preArr[min] || min)
      .replace(/ss/g, preArr[sec] || sec);

    return newTime;
  },

  /* 时间戳转换为时间 */
  timestampToTime(timestamp) {
    timestamp = timestamp ? timestamp : null;
    let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
  },

  timestampToTime2(timestamp) {
    timestamp = timestamp ? timestamp : null;
    let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return h + m + s;
  },


  formatDuring(mss) {
    var days = parseInt(mss / (1000 * 60 * 60 * 24));
    var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = (mss % (1000 * 60)) / 1000;
    return hours + " : " + minutes + " : " + seconds;
  },

  // 倒计时
  countdown() {
    let countdownArr = []
    this.data.openingRecord.forEach((element, index) => {
      let startTime = new Date(Date.parse(element["created_at"]));
      let newdate = startTime.getFullYear() + "-" + (startTime.getMonth() + 1) + "-" + startTime.getDate() + " " + element["statement_time"];
      // 关闭订单时间
      let closedTime = Date.parse(new Date(newdate))
      // 当前时间
      let currentTime = Date.parse(new Date())
      // 倒计时
      let countDownTime = closedTime - currentTime;
      console.log(this.formatDuring(countDownTime));
      if (countDownTime > 0) {
        countdownArr.push(setInterval(() => {
          // 当前时间
          currentTime = Date.parse(new Date())
          // 倒计时
          let aa = closedTime - currentTime;
          if (aa >= 0) {
            // 设置倒计时
            this.setData({
              ['openingRecord[' + index + '].countDownTime']: this.formatDuring(aa)
            })
          } else {
            // 隐藏超时的
            this.setData({
              ['openingRecord[' + index + '].isShow']: 'no',
              ['openingRecord[' + index + '].countDownTime']: this.timestampToTime(closedTime)
            })
          }
        }, 500))
      } else {
        // 删除小于零的
        this.setData({
          ['openingRecord[' + index + '].isShow']: 'no',
          ['openingRecord[' + index + '].countDownTime']: this.timestampToTime(closedTime)
        })
      }
    })

    this.setData({
      countdownArr
    })
  },

  // 用户点击承担配送费
  HandelItemChange(e){
    // 要修改的id
    let id = e.currentTarget.dataset.id
    tr("/bearTheDistributionFee",{
      id
    }).then(function(res){
    })
    console.log();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    // 获取开团记录
    tr("/openingRecord").then(function (res) {
      if (res.data.length == 0) {
        that.setData({
          isShow: true
        })
      } else {
        console.log(res.data);
        that.setData({
          openingRecord: res.data
        })
        that.countdown()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.data.countdownArr.forEach(element => {
      console.log("清空");
      clearInterval(element)
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (!this.data.countdownArr == 0) {
      this.data.countdownArr.forEach(element => {
        console.log("清空");
        clearInterval(element)
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})