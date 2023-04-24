// pages/roleView/tzView/childView/ktView/childView/productDetails/productDetails.js
import tr from "../../../../utils/tokenRequest"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productInfo: [],
    imghref: app.globalData.apiUrl + "/uploads",
    href: app.globalData.apiUrl + "/uploads",
    currentTab: 0,
    toView: "default",
    isnavShow: false,
    screenHeight: 0

  },
  /**
   * 商品详情--选项卡
   */
  scrollViewScroll(e) {
    if (e.detail.scrollTop > 30) {
      this.setData({
        isnavShow: true
      })
    } else {
      this.setData({
        isnavShow: false
      })
    }
  },
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
        toView: 'toView' + e.target.dataset.current
      })
    }
  },

  // 查看全部
  viewCount() {
    console.log("ddd");
    wx.navigateTo({
      url: '../../childView/commodityEvaluation/commodityEvaluation?id=' + this.data.productInfo.id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      //获取屏幕可用高度
      screenHeight: wx.getSystemInfoSync().windowHeight
    })
    let that = this
    // 请求商品信息
    tr("/getProductInfoId", {
      id: options.productid
    }).then(function (res) {
      let productInfo = res.data
      that.setData({
        productInfo,
      })
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