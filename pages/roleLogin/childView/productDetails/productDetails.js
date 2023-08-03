// pages/roleView/tzView/childView/ktView/childView/productDetails/productDetails.js
import tr from "../../../../utils/tokenRequest"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productInfo: [],
    imghref: app.globalData.apiUrl + "/uploads/",
    href: app.globalData.apiUrl + "/uploads/",
    currentTab: 0,
    toView: "default",
    isnavShow: false,
    screenHeight: 0,
    // 评论
    CommentInformation: [],
    selling_price: 0,
    page: '',
    toView0Hei: 0,
    toView1Hei: 0,
    toView2Hei: 0
  },
  /**
   * 商品详情--选项卡
   */
  scrollViewScroll(e) {
    let scrollto = e.detail.scrollTop
    console.log(scrollto);
    if (scrollto > 30) {
      this.setData({
        isnavShow: true
      })
    } else {
      this.setData({
        isnavShow: false
      })
    }

    let {
      toView0Hei,
      toView1Hei,
      toView2Hei
    } = this.data
    if (scrollto > toView2Hei) {
      console.log("toView2", toView2Hei);
      this.setData({
        currtabTab: 2
      })
    } else if (scrollto > toView1Hei) {
      console.log("toView1", toView1Hei);
      this.setData({
        currtabTab: 1
      })
    } else if (scrollto > toView0Hei) {
      this.setData({
        currtabTab: 0
      })
    }
  },
  swichNav: function (e) {
    console.log(e);
    var that = this;
    let index = e.detail.index
    if (this.data.currentTab === index) {
      return false;
    } else {
      that.setData({
        currentTab: index,
        toView: 'toView' + index
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
    console.log(options.page);

    this.setData({
      //获取屏幕可用高度
      screenHeight: wx.getSystemInfoSync().windowHeight,
      // 设置从那个页面过来的
      selling_price: options.selling_price,
      page: options.page
    })
    let that = this
    // 请求商品信息
    tr("/getProductInfoId", {
      id: options.productid
    }).then(function (res) {
      console.log("zhefsjflsaf",res);
      let productInfo = res.data.result
      that.setData({
        productInfo,
        CommentInformation: res.data.CommentInformation
      })
    })

    // 请求评论信息

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  // 计算右侧每个item到顶部的距离，存放到数组
  getItemDistence() {
    let that = this
    var query = wx.createSelectorQuery();
    query.selectAll('.toview').boundingClientRect();
    query.exec(function (res) {
      //res就是 所有标签为v1的元素的信息 的数组
      //取高度
      that.setData({
        toView0Hei: res[0][0].top,
        toView1Hei: res[0][1].top,
        toView2Hei: res[0][2].top
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this
    setTimeout(function () {
      that.getItemDistence()
    }, 600)
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