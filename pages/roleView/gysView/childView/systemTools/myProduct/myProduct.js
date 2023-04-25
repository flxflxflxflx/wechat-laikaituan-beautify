import tr from "../../../../../../utils/tokenRequest"
// pages/roleView/gysView/childView/systemTools/systemTools.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [{
        text: '我的商品',
        iconPath: "/static/image/myProduct2.png",
        selectedIconPath: "/static/image/myProduct.png",
        // badge: '8'
      },
      {
        text: '订单查询',
        iconPath: "/static/image/orderSearch.png",
        selectedIconPath: "/static/image/orderSearch2.png",
      },
      {
        text: '总流水账',
        iconPath: "/static/image/caigou.png",
        selectedIconPath: "/static/image/caigou2.png",
        // dot: true
      },
      {
        text: '购买查询',
        iconPath: "/static/image/search.png",
        selectedIconPath: "/static/image/search2.png",
        // dot: true
      },
    ],
    dataList: [],
    // 选择的列表
    selectList: [],
    // 是否显示分享按钮 
    isShare: false,
    imghref: app.globalData.apiUrl + "/uploads",
    isShow: false,
    bottomLift:app.globalData.bottomLift
  },

  onRoute(e) {
    wx.navigateTo({
      url: '/pages/roleLogin/childView/productDetails/productDetails?productid=' + e.currentTarget.dataset.id,
    })
  },

  tabChange(e) {
    switch (e.detail.index) {
      case 0:

        break;
      case 1:
        wx.redirectTo({
          url: '../orderQuery/orderQuery',
        })
        break;
      case 2:
        wx.redirectTo({
          url: '../generalJournal/generalJoumal',
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
        break;
      case 3:
        wx.redirectTo({
          url: '../purchaseQuery/purchaseQuery',
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
        break;
      default:
        break;
    }
  },

  /**
   * 编辑商品
   */
  editProduct(e) {
    wx.navigateTo({
      url: '/pages/roleView/gysView/childView/systemTools/myProduct/childView/productInformationEditing/productInformationEditing?id=' + e.currentTarget.dataset.id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    tr("/getProductInfo").then(function (res) {
      if (res.data.length == 0) {
        that.setData({
          isShow: true
        })
      } else {
        that.setData({
          dataList: res.data
        })
        console.log(res.data);
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