import tr from "../../../utils/tokenRequest"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
        text: '我的商品',
        iconPath: "/static/image/icon_tabbar.png",
        selectedIconPath: "/static/image/icon_tabbar.png",
        // badge: '8'
      },
      {
        text: '订单查询',
        iconPath: "/static/image/icon_tabbar.png",
        selectedIconPath: "/static/image/icon_tabbar.png",
      },
      {
        text: '总流水账',
        iconPath: "/static/image/icon_tabbar.png",
        selectedIconPath: "/static/image/icon_tabbar.png",
        // dot: true
      },
      {
        text: '购买查询',
        iconPath: "/static/image/icon_tabbar.png",
        selectedIconPath: "/static/image/icon_tabbar.png",
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
      url: './newAccount/newAccount',
    })
  },

  // 删除账户
  delAcc(e) {
    let that = this
    let id = e.target.dataset.itemid
    tr("/delAccount", {
      id
    }).then(function (res) {
      if (res.data.code == 1) {
        wx.showToast({
          title: '删除成功',
        })
        let bankCars = that.data.bankCards
        for (let index = 0; index < bankCars.length; index++) {
          if (bankCars[index].id == id) {
            console.log(index);
            bankCars.splice(index, 1)
            that.setData({
              bankCards: bankCars
            })
            break;
          }
        }
      }
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