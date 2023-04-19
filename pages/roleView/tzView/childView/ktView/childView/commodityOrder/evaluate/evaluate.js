import tr from "../../../../../../../../utils/tokenRequest"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    href: app.globalData.apiUrl + "/uploads",
    value: 5,
  },

  setMessage(e) {
    let orderList = this.data.orderList.orderList
    for (let index = 0; index < orderList.length; index++) {
      if (orderList[index].id == e.target.dataset.data) {
        this.setData({
          ['orderList.orderList[' + index + '].message']: e.detail.value
        })
      }
    }
  },

  setValue(e) {
    let orderList = this.data.orderList.orderList
    for (let index = 0; index < orderList.length; index++) {
      if (orderList[index].id == e.target.dataset.data) {
        this.setData({
          ['orderList.orderList[' + index + '].order_rate']: e.detail.value
        })
      }
    }

  },

  publish(e) {
    let that = this
    let item = e.target.dataset.item
    if (item.message == undefined || item.message.length < 1) {
      wx.showToast({
        title: '至少输入一个字符',
        icon: "error"
      })
      return
    }
    let {
      order_id,
    } = this.data.orderList;


    tr("/productEvaluation", {
      order_id,
      message: item.message,
      item
    }).then(function (res) {
      if (res.data.code == 0) {
        wx.showToast({
          title: res.data.message,
          icon: "error"
        })
      } else if (res.data.code == 1) {
        console.log(item.id);
        // 评价成功
        that.delProduct(item.id)
        wx.showToast({
          title: res.data.message,
        })
      }
    })
  },

  // 删除商品
  delProduct(id) {
    let orderList = this.data.orderList.orderList
    for (let index = 0; index < orderList.length; index++) {
      if (orderList[index].id == id) {
        orderList.splice(index, 1)
        this.setData({
          ["orderList.orderList"]: orderList
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    console.log(options);
    // 获取评价商品信息
    tr("/getProductList", {
      ordernum: options.ordernum
    }).then(function (res) {
      if(res.data.code == 444){
        wx.showToast({
          title: res.data.mes,
          icon:"error"
        })
      }else{
      that.setData({
        orderList: res.data
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