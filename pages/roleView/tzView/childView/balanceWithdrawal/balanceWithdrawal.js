import tr from "../../../../../utils/tokenRequest"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
      text: '开团记录',
      iconPath: "/static/image/openTuan.png",
      selectedIconPath: "/static/image/openTuan2.png",
      // badge: '8'
    },
    {
      text: '余额提现',
      iconPath: "/static/image/yue2.png",
      selectedIconPath: "/static/image/yue.png",
    },
    {
      text: '订单流水',
      iconPath: "/static/image/orderFlow.png",
      selectedIconPath: "/static/image/orderFlow2.png",
      // dot: true
    },
    {
      text: '总流水账',
      iconPath: "/static/image/caigou.png",
      selectedIconPath: "/static/image/caigou2.png",
      // dot: true
    },
  ],
    // 银行卡列表
    bankCards: [],
    // 列表信息
    cards: [],
    // 余额
    account: 0
  },
  // 新建账户
  newAccount() {
    wx.navigateTo({
      url: './childView/newAccount/newAccount',
    })
  },



  onredio(e) {
    let that = this
    this.data.bankCards.forEach(function (item) {
      if (item.id == e.detail.value) {
        that.setData({
          cards: item
        })
      }
    })
  },

  tabChange(e) {
    switch (e.detail.index) {
      case 0:
      wx.redirectTo({
        url: '../jszxView/jszxView',
      })
        break;
      case 1:
        wx.redirectTo({
          url: '../balanceWithdrawal/balanceWithdrawal',
        })
        break;
      case 2:
       wx.redirectTo({
         url: '../orderFlow/orderFlow',
       })
        break;
      case 3:
        wx.redirectTo({
          url: '../generalJournal/generalJournal',
        })
        break;
      default:
        break;
    }
  },

  // 提现
  cashWithdrawal() {
    tr("/TzCashWithdrawal", 
      this.data.cards
    ).then(function (res) {
      console.log(res);
    })
  },

  // 提现到余额
  wechatCashWithdrawal() {
    tr("/TzWechatCashWithdraw").then(function (res) {
      console.log(res);
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    // 获取银行卡
    tr("/getBankCard").then(function (res) {
      that.setData({
        bankCards: res.data
      })
    })
    // 获取余额
    tr("/getAccount").then(function (res) {
      that.setData({
        account: res.data
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