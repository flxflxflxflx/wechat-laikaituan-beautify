import tr from "../../../../../../../../utils/tokenRequest"
import sub from "../../../../../../../../utils/subscribeMessage"
const app = getApp()
// pages/roleView/psyView/scanningCode/scanningCode.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanFunctionIsUseable: true,
    // 订单及其子订单集合
    order: [],
    href: app.globalData.apiUrl + "/uploads",
  },

  scancode(e) {

    // let order = JSON.parse(e.detail.result).ordernum
    // let order = JSON.parse(e.detail.result).ordernum
    let order = 4141631191793049600
    // let order = 4083448886276956160
    let that = this
    tr("/confirmOrder", {
      ordernum: order
    }).then(function (res) {
      let status = res.data.status
      if (status == 0) {
        wx.showToast({
          title: '没有订单',
        })
      } else if (status == 1) {
        wx.showToast({
          title: res.data.message,
        })
      }
      console.log(res);
      // 设置商品订单号
      that.setData({
        order: res.data.result,
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.scancode()
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