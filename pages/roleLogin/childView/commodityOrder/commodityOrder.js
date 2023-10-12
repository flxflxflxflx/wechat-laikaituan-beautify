import tr from '../../../../utils/tokenRequest'
import sub from "../../../../utils/subscribeMessage"
const app = getApp()
// 待付款页
var noPaymentPage = 0
// 已完成页
var completedPage = 0
// 已取消页
var cancelPage = 0
// 开团id
var selectListData = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isspecial: false,
    currtab: 0,
    swipertab: [{
      name: '已付款',
      index: 0
    }, {
      name: '待付款',
      index: 1
    }, {
      name: '已取消',
      index: 2
    }],
    list: [{
        text: '商品购买',
        iconPath: "/static/image/productx.png",
        selectedIconPath: "/static/image/productx2.png",
        // badge: '8'
      },
      {
        text: '我的订单',
        iconPath: "/static/image/myOrder2.png",
        selectedIconPath: "/static/image/myOrder.png",
      },
    ],

    noPayment: [], // 待付款
    canceled: [], // 已取消
    complete_order: [], // 已完成
    href: app.globalData.apiUrl + "/uploads/",
    href2: app.globalData.apiUrl,
    // 定时器数组
    countdownArr: [],
    tabbarHeight: 0,
    bottomLift: app.globalData.bottomLift,
    triggered: false,
    isShowNot: true,
    childEvlOrdernum: 0,
    topLift: wx.getSystemInfoSync()['statusBarHeight'],
    isShowNav: false,
    showShare: false,
    options2: [{
        name: '微信',
        icon: 'wechat',
        openType: "share"
      },
      {
        name: '复制链接',
        icon: 'link',
      }
    ],
    groupbuyId: 0,
    // 头像
    avatar: "",
    nickName: '',
    phone: ''
  },

  getUserInfo(event) {
    console.log(event.detail);
  },

  // 点击有售后
  afterSales(e) {
    let that = this;
    let idx = e.currentTarget.dataset.data[0];
    let item = e.currentTarget.dataset.data[1];
    console.log(idx, item)
    tr("/afterSales", {
      ordernum: item.ordernum
    }).then(function (res) {
      item.logistics = 6
      that.setData({
        ["complete_order[" + idx + "]"]: item
      })
      wx.showToast({
        title: '设置成功',
      })
    })
  },

  onUserClose() {
    this.setData({
      showShare: false
    });
  },


  onSheetClick(event) {
    this.setData({
      showShare: true
    });
  },

  onSheetClose() {
    this.setData({
      showShare: false
    });
  },

  onSheetSelect(event) {
    console.log(event, "7777");
    if (event.detail.name == "复制链接") {
      // 获取短链接   
      tr("/getShortLink", {
        url: "/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=" + this.data.openingProductId
      }).then(function (res) {
        console.log(res);
      })
      wx.setClipboardData({
        data: "/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=" + this.data.openingProductId,
        success: function (res) {
          wx.showToast({
            title: '复制成功',
            icon: "success"
          });
        }
      });
    }
    this.onSheetClose();
  },

  backHome() {
    wx.reLaunch({
      url: '/pages/roleLogin/roleLogin',
    })
  },

  // 退款
  refund(e) {
    tr("/refundOrder", {
      out_trade_no: e.target.dataset.data
    }).then(function (res) {
      console.log(res);
    })
  },

  // 评价
  evaluate(e) {
    wx.navigateTo({
      url: '/pages/roleLogin/childView/commodityOrder/evaluate/evaluate?ordernum=' + e.target.dataset.data,
    })
  },

  /**
   * @description 收货
   */
  takeDelivery(e) {
    let data = e.target.dataset.data
    let {
      complete_order
    } = this.data;
    let that = this
    tr("/confirmOrder", {
      ordernum: data
    }).then(function (res) {
      switch (res.data.status) {
        case 0:
          wx.showToast({
            title: '没有订单',
            icon: "error"
          })
          break;
        case 1:
          wx.showToast({
            title: '收货成功',
          })
          // 设置评价
          for (let i in complete_order) {
            if (complete_order[i].ordernum == data) {
              that.setData({
                ["complete_order[" + i + "].logistics"]: 4
              })
            }
          }
          break;
        case 2:
          wx.showToast({
            title: '已经收货成功',
          })
          // 设置评价
          for (let i in complete_order) {
            if (complete_order[i].ordernum == data) {
              that.setData({
                ["complete_order[" + i + "].logistics"]: 4
              })
            }
          }
          break;
        case 3:
          wx.showToast({
            title: '请' + res.data.ttl + '小时后进行收货',
            icon: "none",
            duration: 3000
          })
          break;
        default:
          break;
      }
    })

    console.log(e.target.dataset);
  },

  // 扫码收货
  scanningCode(e) {
    wx.navigateTo({
      url: './scanningCode/scanningCode',
    })
  },

  /**
   * @Explain：选项卡点击切换
   */
  getDeviceInfo: function () {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          deviceW: res.windowWidth,
          deviceH: res.windowHeight
        })
      }
    })
  },


  tabSwitch: function (e) {
    var that = this

    that.setData({
      currtab: e.detail.name
    })

  },

  tabChange1: function (e) {
    this.setData({
      currtab: e.detail.current,
    })
    this.orderShow()
  },

  orderShow: function () {
    let that = this
    console.log(this.data.currtab);
    switch (this.data.currtab) {
      case 0:
        that.alreadyShow()
        break
      case 1:
        that.waitPayShow()
        break
      case 2:
        that.lostShow()
        break
    }
  },

  onYRefresh() {
    this.setData({
      triggered: true,
      complete_order: []
    })
    completedPage = 0
    this.alreadyShow()
  },

  // 已付款
  alreadyShow: function () {
    let that = this
    if (that.data.complete_order.length == 0) {
      // 请求已付款
      tr("/getOrder", {
        status: 1,
        offset: completedPage * 10
      }).then(function (res) {
        console.log("ddd");
        if (res.data.complete_order.length != 0) {
          that.setData({
            complete_order: res.data.complete_order,
          })
          console.log(that.data.complete_order);
        }
        that.setData({
          triggered: false
        })
      })
    }
  },

  // 待付款
  waitPayShow: function () {
    let that = this
    if (that.data.noPayment.length == 0) {
      // 请求待付款
      tr("/getOrder", {
        status: 0,
        offset: noPaymentPage * 10
      }).then(function (res) {
        if (res.data.no_payment.length != 0) {
          that.setData({
            noPayment: res.data.no_payment,
          })
          that.countdown();
        }
      })
    }
  },



  // 倒计时
  countdown() {
    let countdownArr = []
    this.data.noPayment.forEach((element, index) => {
      // 关闭订单时间
      let closedTime = Date.parse(new Date(element.closedtime))
      // 当前时间
      let currentTime = Date.parse(new Date())
      // 倒计时
      let countDownTime = closedTime - currentTime;
      if (countDownTime > 0) {
        countdownArr.push(setInterval(() => {
          // 当前时间
          currentTime = Date.parse(new Date())
          // 倒计时
          let aa = closedTime - currentTime;
          if (aa >= 0) {
            // 设置倒计时
            this.setData({
              ['noPayment[' + index + '].countDownTime']: this.timestampToTime(aa),
              isShowNot: false
            })
          } else {
            // 隐藏超时的
            this.setData({
              ['noPayment[' + index + '].isShow']: 'no'
            })
          }
        }, 500))
      } else {
        // 删除小于零的
        this.setData({
          ['noPayment[' + index + '].isShow']: 'no'
        })
      }
    })

    this.setData({
      countdownArr
    })
  },
  /* 时间戳转换为时间 */
  timestampToTime(timestamp) {
    timestamp = timestamp ? timestamp : null;
    let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return m + s;
  },

  // 待付款滑动到底
  noPaymentScroll() {
    noPaymentPage++
    let that = this
    // 请求待付款
    tr("/getOrder", {
      status: 0,
      offset: noPaymentPage * 10
    }).then(function (res) {
      if (res.data.no_payment.length == 0) {
        wx.showToast({
          title: '没有数据了',
          icon: "none"
        })
      } else {
        // 设置了时间的子元素
        let noLen = that.data.noPayment.length;
        // 连接分页数据
        that.setData({
          noPayment: that.data.noPayment.concat(res.data.no_payment),
        })
        let noPayment = that.data.noPayment
        // 倒计时数组
        let countdownArr = []
        // 遍历添加没有设置时间的子元素
        for (let index = noLen - 1; index < noPayment.length; index++) {
          // 关闭订单时间
          let closedTime = Date.parse(new Date(noPayment[index].closedtime))
          // 当前时间
          let currentTime = Date.parse(new Date())
          // 倒计时
          let countDownTime = closedTime - currentTime;
          if (countDownTime > 0) {
            // 倒计时大于零的可以显示,添加定时器到倒计时数组以便关闭
            countdownArr.push(setInterval(() => {
              // 当前时间
              currentTime = Date.parse(new Date())
              // 倒计时
              let aa = closedTime - currentTime;
              if (aa >= 0) {
                // 设置倒计时
                that.setData({
                  ['noPayment[' + index + '].countDownTime']: that.timestampToTime(aa)
                })
              } else {
                // 隐藏超时的
                that.setData({
                  ['noPayment[' + index + '].isShow']: 'no'
                })
              }
            }, 500))
          } else {
            // 删除小于零的
            that.setData({
              ['noPayment[' + index + '].isShow']: 'no'
            })
          }
        }

        // 连接定时器
        that.setData({
          countdownArr: that.data.countdownArr.concat(countdownArr)
        })
      }
    })
  },

  // 已付款滑动到底
  completeScorll() {
    completedPage++
    let that = this
    // 请求待付款
    tr("/getOrder", {
      status: 1,
      offset: completedPage * 10
    }).then(function (res) {
      if (res.data.complete_order.length == 0) {
        wx.showToast({
          title: '没有数据了',
          icon: "none"
        })
      } else {
        that.setData({
          complete_order: that.data.complete_order.concat(res.data.complete_order),
        })
      }
    })

  },

  // 已取消滑动到底
  cancelScroll() {
    cancelPage++
    let that = this
    // 请求已付款
    tr("/getOrder", {
      status: 2,
      offset: cancelPage * 10
    }).then(function (res) {
      if (res.data.canceled.length != 0) {
        that.setData({
          canceled: that.data.canceled.concat(res.data.canceled),
        })
      } else {
        wx.showToast({
          title: '没有数据了',
          icon: "none"
        })
      }
    })
  },

  // 已取消
  lostShow: function () {
    let that = this
    if (that.data.canceled.length == 0) {
      // 请求已付款
      tr("/getOrder", {
        status: 2,
        offset: cancelPage * 10
      }).then(function (res) {
        if (res.data.canceled.length != 0) {
          that.setData({
            canceled: res.data.canceled,
          })
        }
      })
    }
  },


  tabChange(e) {
    switch (e.detail.index) {
      case 0:
        if (this.data.isspecial) {
          wx.redirectTo({
            url: '../specialCanalSelfMining/specialCanalSelfMining?selectListData=' + JSON.stringify(selectListData),
          })
        } else {
          wx.redirectTo({
            url: '../commodityPurchase/commodityPurchase?selectListData=' + selectListData,
          })
        }
        break;
      case 1:

        break;
      case 2:

        break;
      case 3:

        break;
      default:
        break;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    // 页面渲染完成
    this.getDeviceInfo()
    this.orderShow()
    noPaymentPage = 0
    // 已完成页
    completedPage = 0
    // 已取消页
    cancelPage = 0
    // 开团id
    console.log(options.isspecial, "888")
    if (options.isspecial == 1) {
      selectListData = JSON.parse(options.selectListData)
      this.data.isspecial = true
    } else {
      selectListData = options.selectListData
      this.data.isspecial = false

    }
    // 获取用户信息
    tr("/getUserInfo").then(function (res) {
      let {
        nickname,
        phone,
        avatar
      } = res.data
      that.setData({
        nickName: nickname,
        phone,
        avatar
      })
    })
  },

  // 去付款 
  topay(e) {
    let {
      groupbuyid
    } = e.target.dataset
    let that = this
    // 调用微信付款
    // 进行支付
    tr("/pay", {
      ordernum: e.target.dataset.ordernum
    }).then(function (res) {
      let config = res.data
      if (config.code == 406) {
        wx.showToast({
          title: config.msg,
          icon: 'error'
        })
        return
      }
      wx.requestPayment({
        timeStamp: config['timeStamp'],
        nonceStr: config['nonceStr'],
        package: config['package'],
        signType: config['signType'],
        paySign: config['paySign'],
        success: function (res) {
          // 支付成功后的回调函数
          wx.showToast({
            title: '支付成功',
          })
          // 进行刷新
          let noPayment = that.data.noPayment
          for (let index = 0; index < noPayment.length; index++) {
            if (noPayment[index].ordernum == e.target.dataset.ordernum) {
              that.setData({
                ['noPayment[' + index + '].isShow']: 'no'
              })
            }
          }
          sub([app.globalData.PICKUP_TEMPALE_ID]).then(function (res) {
            // 调用订阅消息
            // tr("/sendMessage").then(function(res){
            //   console.log(res);
            // })
            console.log("获取订阅权限成功");
          }, function (e) {
            console.log(e);
          })
          // 获取商品评价订阅消息权限
          sub([app.globalData.ORDER_EVALUATION_ID]).then(function (res) {
            // 调用订阅消息
            // tr("/sendMessage").then(function(res){
            //   console.log(res);
            // })
            console.log("获取订阅权限成功");
          }, function (e) {
            console.log(e);
          })

          that.setData({
            showShare: true,
            groupbuyId: groupbuyid
          })
        },
        fail() {
          console.log("用户取消支付")
        },
      });
    })

    console.log(e);
  },

  // 取消订单
  cancelOrder(e) {
    let that = this
    let item = e.target.dataset.item
    /**
     * 取消订单
     * @param ordernum 商户订单号
     */
    tr("/cancelOrder", {
      ordernum: item.ordernum
    }).then(function (res) {
      if (res.data.code != 200) {
        wx.showToast({
          title: res.data.msg,
          icon: 'error'
        })
      } else {
        wx.showToast({
          title: res.data.msg,
        })

        let noPayment = that.data.noPayment
        for (let index = 0; index < noPayment.length; index++) {
          if (noPayment[index].ordernum == item.ordernum) {
            that.setData({
              ['noPayment[' + index + '].isShow']: 'no'
            })
          }
        }
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
    let that = this
    // 如果有没有团长权限隐藏回到首页
    tr("/getUserPermissions").then(function (res) {
      if (!res.data.isPermissionsNull) {
        that.setData({
          isShowNav: true
        })
      }
    })
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    console.log(this.data.childEvlOrdernum, "dddddddddddddddddddd") //在这里已经发生改变了
    let {
      complete_order
    } = this.data
    for (let i in complete_order) {
      if (complete_order[i].ordernum == this.data.childEvlOrdernum) {
        this.setData({
          ["complete_order[" + i + "].is_comment"]: 1
        })
      }
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.data.countdownArr.forEach(element => {
      console.log("清空");
      clearInterval(element)
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.data.countdownArr.forEach(element => {
      console.log("清空");
      clearInterval(element)
    })
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
    wx.showShareMenu({
      withShareTicket: true,
      menu: ['shareappmessage', 'shareTimeline']
    })
    let title = ''
    this.data.dataList.forEach(function (item) {
      title += item.product.title + "\n"
    })
    return {
      // title: wx.getStorageSync('nick_name') + "团长的商品组合",
      title: title,
      path: "/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=" + this.data.groupbuyId,
      imageUrl: ""
    }

  }
})