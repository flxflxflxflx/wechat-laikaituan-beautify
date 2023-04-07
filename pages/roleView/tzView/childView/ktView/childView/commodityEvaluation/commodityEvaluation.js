import tr from "../../../../../../../utils/tokenRequest"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 评价数组
    evaluateArr: [],
    href: app.globalData.apiUrl,
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    tr("/getProductEvaluation", {
      id: options.id
    }).then(function (res) {
      if (res.data.length == 0) {
        that.setData({
          evaluateArr: res.data,
          isShow: true
        })
      } else {
        that.setData({
          evaluateArr: res.data
        })
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

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

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