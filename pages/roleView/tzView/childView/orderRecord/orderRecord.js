import tr from "../../../../../utils/tokenRequest"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: wx.getStorageSync('avatar'),
    nickName: wx.getStorageSync('nick_name'),
    isBaoyou: false,
    result: [],
    href: app.globalData.apiUrl + "/uploads"
  },

  onChange(e) {
    let that = this
    tr("/bearShippingCosts", {
      id: that.data.result[e.currentTarget.dataset.item].id,
      value: e.detail
    }).then(function (res) {

      if (res.data.code == 200) {
        that.setData({
          ['result[' + e.currentTarget.dataset.item + '].distributionfee']: e.detail ? 1 : 0
        })
      } else {
        wx.showToast({
          title: '修改失败',
          icon: "error"
        })
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    tr("/getOpeningOrder", {
      groupId: options.groupId
    }).then(function (res) {
      if (res.data.code == 0) {
        wx.showToast({
          title: res.data.message,
        })
      } else {
        that.setData({
          result: res.data.array
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