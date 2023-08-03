import tr from "../../../utils/tokenRequest"
import Dialog from '@vant/weapp/dialog/dialog';
// pages/roleView/myView/asset.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 银行卡列表
    bankCards: [],
    // 列表信息
    cards: [],
    // 余额
    account: 0,
    withdrawalRecords: [],
    butons: [{
        text: '取消'
      },
      {
        text: '确认'
      }
    ],
    realName: '',
    isShow: false
  },
  onRealNameChange(event) {
    this.setData({
      realName: event.detail
    })
  },

  // 填写真实姓名
  async getRealName(e) {
    switch (e.detail.index) {
      case 0:
        this.setData({
          isShow: false
        })
        break;
      case 1:
        console.log(this.data.realName);
        if (this.data.realName == '') {
          wx.showToast({
            title: '请填写用户名',
            icon: "none"
          })

        } else {
          this.setData({
            isShow: false
          })
          this.wechatCashWithdrawal()
        }
        break;

      default:
        break;
    }
  },

  tixian() {
    this.setData({
      isShow: true
    })
  },

  // 提现到余额
  wechatCashWithdrawal() {
    let that = this
    tr("/TzWechatCashWithdraw", {
      account: that.data.account,
      realName: that.data.realName
    }).then(function (res) {
      if (res.data.code == 100) {
        that.getAccount()
        that.getWithdrawalRecords()
      } else if (res.data.code == 400) {
        that.getAccount()
        that.getWithdrawalRecords()
        Dialog.alert({
          message: res.data.message,
        }).then(() => {
          // on close
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let that = this
    this.getAccount()
    this.getWithdrawalRecords()
  },

  // 获取余额
  getAccount() {
    let that = this
    tr("/getAccount").then(function (res) {
      that.setData({
        account: res.data
      })
    })
  },

  // 获取提现记录
  getWithdrawalRecords() {
    let that = this
    tr("/getWithdrawalRecords").then(function (res) {
      if (res.data.code == 100) {
        that.setData({
          withdrawalRecords: res.data.result
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