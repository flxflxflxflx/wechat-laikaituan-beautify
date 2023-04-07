import sub from "../../../utils/subscribeMessage"
// pages/roleView/tzView/tzView.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 是否显示免责声明
    isdisclaimer: false,
    hidem: 1,
    cb: 0,
  },

  handleMove(e) {
    //不做任何处理
  },
  qx: function (e) {
    this.setData({
      hidem: 1
    });
  },
  qx2: function (e) {
    this.setData({
      hidem: 1
    })
  },
  qr: function (e) {
    let that = this;
    if (that.data.cb == 0) {
      wx.showToast({
        title: '请点击确认框',
        icon: 'none'
      })
      return;
    } else {
      // 跳转
      wx.navigateTo({
        url: './childView/publishProduct/publishProduct',
      });
    }
  },
  cb: function (e) {
    let that = this;
    if (that.data.cb == 0) {
      that.setData({
        cb: 1
      })
    } else {
      that.setData({
        cb: 0
      })
    }
  },
  // 发布商品
  publishProduct() {
    this.setData({
      hidem: 0
    })
  },

  /**
   * 系统工具
   */
  systemTools() {
    wx.navigateTo({
      url: '/pages/roleView/gysView/childView/systemTools/myProduct/myProduct',
    })
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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