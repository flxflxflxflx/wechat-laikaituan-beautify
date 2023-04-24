// pages/roleView/myView/myView.js
import tr from "../../../utils/tokenRequest"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
        text: '开团',
        iconPath: "/static/image/openeropen1.png",
        selectedIconPath: "/static/image/openeropen.png",
        // badge: '8'
      },
      {
        text: '供应',
        iconPath: "/static/image/gonghuo.png",
        selectedIconPath: "/static/image/gonghuo1.png",
      },
      {
        text: '我的',
        iconPath: "/static/image/myde.png",
        selectedIconPath: "/static/image/myde1.png",
        // dot: true
      },
    ],
    balance: 0.00,
    freeze: 0,
    avatar: wx.getStorageSync('avatar'),
    nick_name: wx.getStorageSync('nick_name')
  },
  tabChange(e) {
    switch (e.detail.index) {
      case 0:
        wx.redirectTo({
          url: '../../roleLogin/roleLogin',
        })
        break;
      case 1:
        wx.redirectTo({
          url: '../gysView/gysView',
        })
        break;
      case 2:

        break;

      default:
        break;
    }
  },
  goAsset: function () {
    wx.navigateTo({
      url: "./asset"
    })
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/roleView/tzView/childView/jszxView/jszxView"
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    // 获取订单成交量
    tr("/getOrderVolume").then(function (res) {
      that.setData({
        freeze: res.data
      })
    })
    // 获取余额
    tr("/getAccount").then(function (res) {
      that.setData({
        balance: res.data
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