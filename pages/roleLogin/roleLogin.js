// pages/roleLogin/roleLogin.js
import sub from "../../utils/subscribeMessage"
import tr from "../../utils/tokenRequest.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户的权限信息
    isPermissionsNull: true,
    permissions: []
  },
  jumpGYS() {
    sub([app.globalData.TEMPALE_ID]).then(function (res) {
      // 调用订阅消息
      // tr("/sendMessage").then(function(res){
      //   console.log(res);
      // })
      console.log("获取订阅权限成功");
    }, function (e) {
      console.log(e);
    })

    wx.navigateTo({
      url: '../roleView/gysView/gysView',
    })
  },
  jumpTZ() {
    wx.navigateTo({
      url: '../roleView/tzView/tzView',
    })
  },
  jumpPSY() {
    wx.navigateTo({
      url: '../roleView/psyView/psyView',
    })
  },
  jumpTHZ() {
    wx.navigateTo({
      url: '../roleView/thzView/thzView',
    })
  },
  jumpFJY() {
    wx.navigateTo({
      url: '../roleView/fjyView/fjyView',
    })
  },
  // 申请其他权限
  applyPermissions() {
    wx.navigateTo({
      url: '/pages/roleAudit/roleForm/roleForm',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    // 向后台请求角色权限
    let that = this
    tr("/getUserPermissions").then(function (res) {
      wx.hideLoading()
      // 判断是否有权限,没有权限提示跳转到权限申请页面
      that.setData({
        isPermissionsNull: res.data.isPermissionsNull
      })
      let {
        isPermissionsNull,
      } = that.data;
      if (isPermissionsNull) {
        wx.showToast({
          title: '没有权限',
          mask: true
        })
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/roleAudit/roleForm/roleForm',
          })
        }, 1500);
      } else {
        that.setData({
          permissions: res.data.permissions
        })
      }
    }, function (res) {
      if (res == "没有响应") {
        wx.hideLoading({
          success: (res) => {
            wx.showToast({
              title: '没有响应',
            })
          },
        })
      } else if (res == "token刷新了") {
        this.onLoad();
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