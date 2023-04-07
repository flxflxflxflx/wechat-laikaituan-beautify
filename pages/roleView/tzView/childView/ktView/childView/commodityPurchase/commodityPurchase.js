import Big from "../../../../../../../utils/bignumber"
import tr from "../../../../../../../utils/tokenRequest"
import sub from "../../../../../../../utils/subscribeMessage"
const app = getApp()
// 请求数据
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    href: app.globalData.apiUrl + "/uploads",
    // 开团的商品id
    openingProductId: [],
    productInfo: [],
    buttons: [{
        type: 'default',
        className: '',
        text: '关闭',
        value: 0
      },
      {
        type: 'primary',
        className: '',
        text: '购买',
        value: 1
      },
    ],
    show: false,
    isBuyDialogShow: false,
    // 商品数量加减
    minusStatus: 'disable',
    // 价格设置
    productPriceSetting: [],
    // 合计金额
    totalAmount: 0,
    // 开团信息
    groupbuyInfo: [],
    // 基础配送信息
    basesInfo: [],
    // 选着的总数
    totalQuantity: 0,
    // 选择的总重量
    totalWeigth: 0,
    // 用户多付手续费
    extraCosts: 0,
    list: [{
        text: '商品购买',
        iconPath: "/static/image/mall.png",
        selectedIconPath: "/static/image/mall2.png",
        // badge: '8'
      },
      {
        text: '我的订单',
        iconPath: "/static/image/myorder.png",
        selectedIconPath: "/static/image/myProduct2.png",
      },
    ],
    // 多列选择器(二级联动)列表设置,及初始化
    rawData: [],
    multiObjArray: [
      [],
      []
    ],
    multiIndex: [0, 0],
    isPickerSelect: false,
    // 判断是否截单
    isCutOrder: false
  },

  viewCount() {
    wx.navigateTo({
      url: '../commodityEvaluation/commodityEvaluation?id=' + this.data.productInfo.id,
    })
  },

  bindMultiPickerChange: function (e) {
    console.log('picker改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value,
      isPickerSelect: true
    })
  },

  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 0) {
      this.setData({
        'multiObjArray[1]': this.data.rawData[e.detail.value].station,
      });
    }
  },

  tabChange(e) {
    switch (e.detail.index) {
      case 0:

        break;
      case 1:
        wx.redirectTo({
          url: '../commodityOrder/commodityOrder?selectListData=' + this.data.openingProductId,
        })
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
   * 监听购买总数改变
   */
  watch: {
    totalWeigth: {
      handler(newValue) {
        if (newValue > 0) {
          // console.log(this.data.productInfo);
          console.log(newValue);
          if (newValue > this.data.basesInfo.base_delivery_weight) {
            this.setData({
              extraCosts: this.data.basesInfo.base_delivery_fee * 2
            })
          } else {
            this.setData({
              extraCosts: this.data.basesInfo.base_delivery_fee
            })
          }
        } else {
          this.setData({
            extraCosts: 0
          })
        }
      },
      // deep: true
    },
  },
  stop() {},
  /**
   * 商品购买
   */
  //事件处理函数
  /*点击减号*/
  bindMinus: function (e) {
    // 设置金额
    let id = e.currentTarget.dataset.value;
    let dataList = this.data.dataList
    let totalAmount = 0
    let totalWeigth = 0
    let productPriceSetting = []
    // 总数
    let totalQuantity = 0
    for (let index = 0; index < dataList.length; index++) {
      if (dataList[index].id == id) {
        if (dataList[index].num > 0) {
          dataList[index].num--
          dataList[index].minusStatus = dataList[index].num > 0 ? 'normal' : 'disable';
        }
        productPriceSetting = dataList[index]
      }
      if (dataList[index].num >= 0 && !isNaN(dataList[index].num) && dataList[index].num !== '') {
        // 设置总数
        totalQuantity += dataList[index].num
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].product.specification_id;
        let weight = dataList[index].product.weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].product.weight
            break;
          case 2:
            weight = Big(dataList[index].product.weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].product.weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].product.weight).times(Big(10000)).toNumber()
            break;

          default:
            break;
        }
        totalWeigth = Big(totalWeigth).plus(Big(dataList[index].num).times(Big(weight))).toNumber();
      }
    }


    this.setData({
      dataList,
      totalAmount,
      productPriceSetting,
      totalQuantity,
      totalWeigth
    })
  },
  /*点击加号*/
  bindPlus: function (e) {
    let id = e.currentTarget.dataset.value;
    let dataList = this.data.dataList
    let totalAmount = 0
    let productPriceSetting = []
    let totalQuantity = 0
    let totalWeigth = 0
    for (let index = 0; index < dataList.length; index++) {
      if (dataList[index].id == id) {
        dataList[index].num++
        dataList[index].minusStatus = dataList[index].num > 0 ? 'normal' : 'disable';
        productPriceSetting = dataList[index]
      }
      if (dataList[index].num >= 0 && !isNaN(dataList[index].num) && dataList[index].num !== '' && dataList[index].num <= dataList[index].product.stock) {
        // 设置总数
        totalQuantity += dataList[index].num
        // 设置总金额
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].product.specification_id;
        let weight = dataList[index].product.weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].product.weight
            break;
          case 2:
            console.log(dataList[index].product);
            weight = Big(dataList[index].product.weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].product.weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].product.weight).times(Big(10000)).toNumber()
            break;

          default:
            break;
        }
        totalWeigth = Big(totalWeigth).plus(Big(dataList[index].num).times(Big(weight))).toNumber();
      } else {
        // 判断增加有没有超过库存
        dataList[index].num = dataList[index].product.stock
        productPriceSetting = dataList[index]
        wx.showToast({
          title: '库存仅有' + dataList[index].product.stock,
          icon: 'none'
        })
        totalQuantity += dataList[index].num
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].product.specification_id;
        let weight = dataList[index].product.weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].product.weight
            break;
          case 2:
            weight = Big(dataList[index].product.weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].product.weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].product.weight).times(Big(10000)).toNumber()
            break;

          default:
            break;
        }
        totalWeigth = Big(totalWeigth).plus(Big(dataList[index].num).times(Big(weight))).toNumber();
      }
    }
    // 设置配送费

    this.setData({
      dataList,
      totalAmount,
      productPriceSetting,
      totalQuantity,
      totalWeigth
    })
  },
  /*输入框事件*/
  bindManual: function (e) {
    let id = e.currentTarget.dataset.value;
    let dataList = this.data.dataList
    let totalAmount = 0
    let productPriceSetting = []
    let totalQuantity = 0
    let totalWeigth = 0
    for (let index = 0; index < dataList.length; index++) {
      if (dataList[index].id == id) {
        dataList[index].num = parseInt(e.detail.value)
        dataList[index].minusStatus = dataList[index].num > 0 ? 'normal' : 'disable';
        productPriceSetting = dataList[index]
      }
      if (dataList[index].num >= 0 && !isNaN(dataList[index].num) && dataList[index].num !== '' && dataList[index].num <= dataList[index].product.stock) {
        // 设置总数
        totalQuantity += dataList[index].num
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].product.specification_id;
        let weight = dataList[index].product.weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].product.weight
            break;
          case 2:
            weight = Big(dataList[index].product.weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].product.weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].product.weight).times(Big(10000)).toNumber()
            break;

          default:
            break;
        }
        totalWeigth = Big(totalWeigth).plus(Big(dataList[index].num).times(Big(weight))).toNumber();
      } else if (isNaN(dataList[index].num)) {
        dataList[index].num = 0
        dataList[index].minusStatus = dataList[index].num > 0 ? 'normal' : 'disable';
        productPriceSetting = dataList[index]
      } else {
        // 判断增加有没有超过库存
        dataList[index].num = dataList[index].product.stock
        productPriceSetting = dataList[index]
        wx.showToast({
          title: '库存仅有' + dataList[index].product.stock,
          icon: 'none'
        })
        // 设置总数
        totalQuantity += dataList[index].num
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].product.specification_id;
        let weight = dataList[index].product.weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].product.weight
            break;
          case 2:
            weight = Big(dataList[index].product.weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].product.weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].product.weight).times(Big(10000)).toNumber()
            break;

          default:
            break;
        }
        totalWeigth = Big(totalWeigth).plus(Big(dataList[index].num).times(Big(weight))).toNumber();
      }
    }
    this.setData({
      dataList,
      totalAmount,
      productPriceSetting,
      totalQuantity,
      totalWeigth
    })
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

  /**
   * 点击详情页
   */
  onListbtn(e) {

    let that = this
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '../../childView/productDetails/productDetails?productid=' + item.product.id,
    })
    // that.setData({
    //   productInfo: item.product,
    //   productPriceSetting: item,
    //   show: true
    // })

  },

  /**
   * 半屏弹窗按钮点击
   */
  buttontap(e) {
    let that = this
    if (e.detail.index == 0) {
      // 点击关闭
      this.setData({
        show: false
      })
    } else if (e.detail.index == 1) {
      this.setData({
        isBuyDialogShow: true
      })
    }
  },

  /**
   * 付款接龙
   */
  paymentCollection() {
    console.log(this.data.groupbuyInfo);
    // 判断自备提货点是否填写
    if (this.data.isPickerSelect == false && this.data.groupbuyInfo.own_isstation == 0) {
      wx.showToast({
        title: '请选择自配提货点',
        icon: "error"
      })
      return;
    }
    if (this.data.totalQuantity == 0) {
      return
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    // 购买商品列表
    let payProducts = []
    // 商品列表
    let dataList = this.data.dataList

    for (let index = 0; index < dataList.length; index++) {
      if (dataList[index].num > 0) {
        dataList[index]["extraCosts"] = this.data.extraCosts // 设置手续费
        if (dataList[index]["product"]["stock"] - dataList[index]["num"] >= 0) {
          dataList[index].product.stock = dataList[index]["product"]["stock"] - dataList[index]["num"]
        } else {
          wx.showToast({
            title: '库存不足',
            icon: 'none'
          })
          return
        }
        payProducts.push(dataList[index]);
      }
    }
    this.setData({
      dataList: dataList
    })

    if (payProducts.length > 0) {
      // 判断是否添加自配提货点
      if (that.data.groupbuyInfo.own_isstation == 0) {
        // 请求后台生成订单号
        this.generateOrderNumber(payProducts, this.data.rawData[this.data.multiIndex[0]].station[this.data.multiIndex[1]].id)
      } else {
        // 请求后台生成订单号
        this.generateOrderNumber(payProducts, null)
      }

    }

    // 完善商品购买信息
    // tr("/improveCommodityPurchaseInfo", {
    //   payProducts,
    //   openingId: that.data.openingProductId
    // }).then(function (res) {
    //   console.log(res);
    // })

  },

  /**
   * 生成订单号
   * @param  {Object} payProducts 购买商品对象  
   * @param  {number} pickPoint 提货点
   */
  async generateOrderNumber(payProducts, pickPoint) {
    // openid 
    let that = this
    // 生成订单号
    tr("/generateOrderNumber", {
      payProducts,
      price: that.data.totalAmount,
      nums: that.data.totalQuantity,
      extraCosts: that.data.extraCosts,
      openingProductId: that.data.openingProductId,
      pickPoint: pickPoint
    }).then(function (res) {
      // 进行支付
      tr("/pay", {
        ordernum: res.data.ordersn
      }).then(function (res) {
        let config = res.data
        wx.hideLoading()
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
          },
          fail() {
            console.log("用户取消支付")
          },
        });
      })
    })


  },
  // 支付商品

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options) {
    app.setWatcher(this);

    // 向后台请求角色权限
    let that = this
    this.isLogin('/getUserPermissions', options).then(function (res) {
      let isPermissionsNull = res.data.isPermissionsNull
      if (isPermissionsNull) {
        wx.showToast({
          title: '没有权限',
          mask: true
        })
        // setTimeout(() => {
        //   wx.redirectTo({
        //     url: '/pages/roleAudit/roleForm/roleForm',
        //   })
        // }, 1500);
      }
    })

    this.setData({
      openingProductId: options.selectListData
    });

    wx.showLoading({
      title: '加载中...',
    })
    // 获取商品
    tr("/getOpeningProducts", {
      groupbuy_id: that.data.openingProductId
    }).then(function (res) {
      wx.hideLoading()
      if (res.data.code == 409) {
        // 订单已经截单
        that.setData({
          isCutOrder: true
        })
      } else {
        res.data.data.map((item) => {
          item["num"] = 0
          item["minusStatus"] = "disable"
        });
        that.setData({
          dataList: res.data.data,
          isCutOrder: false
        });
      }
    })

    // 获取开团信息和基础配送费和基础配送数量
     tr("/getOpeingInfo", {
      groupbuy_id: that.data.openingProductId
    }).then(function (res) {
      that.setData({
        groupbuyInfo: res.data.openingInfo,
        basesInfo: res.data.basesInfo
      })
    })

    if (this.data.groupbuyInfo.own_isstation != 0) {
      // 获取自提点
      tr("/getPickupPoint",{openingId:that.data.openingProductId}).then(function (res) {
        console.log(res.data);
        that.setData({
          rawData: res.data,
          'multiObjArray[0]': res.data,
          'multiObjArray[1]': res.data[0].station,
        })
      })
    }
  },

  // 判断是否有支付权限，是否注册
  isLogin(url, options, data = {}, method = 'post') {
    return new Promise((resolve, reject) => {
      //如果不能处在token，返回登录页面
      if (!wx.getStorageSync('access_token')) {
        wx.showToast({
          title: '没有token',
        })
        // 返回登录界面
        wx.redirectTo({
          url: '/pages/index/index?isXFZ=true&selectListData=' + options.selectListData,
        });
        console.log("storage没有token");
        reject("没有token");
        return;
      }
      // 发起请求
      wx.request({
        method,
        url: app.globalData.apiUrl + url,
        header: { //请求头
          "Content-Type": "application/json",
          "Authorization": wx.getStorageSync('access_token'),
        },
        dataType: 'json',
        data,
        success: function (res) {
          if (typeof res.header.Authorization != 'undefined') { //如果有token返回，将最新的token存入缓存
            console.log("token刷新了");
            wx.setStorageSync('access_token', res.header.Authorization);
            return;
          }
          if (res.statusCode == 401) {
            wx.showToast({
              title: 'toke刷新401',
              icon: "none",
              mask: true
            })
            if (res.data.msg == "token过期，请重新登录") {
              wx.redirectTo({
                url: '/pages/index/index?isXFZ=true&selectListData=' + options.selectListData,
              })
            }
            // setTimeout(() => {
            //   wx.redirectTo({
            //     url: '/pages/index/index',
            //   })
            // }, 1000);
            return;
          }
          if (res.data.code === '401') {
            console.log("token刷新不了");
            wx.showToast({
              title: '请重新登录',
              icon: 'error',
              duration: 1500
            });
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/index/index?isXFZ=true&selectListData=' + options.selectListData,
              });
            }, 1500);
            return;
          }
          // 请重新登录token损坏了
          if (res.statusCode == "500") {
            console.error("返回500,可能是网络问题");
            wx.showToast({
              title: '没有响应',
              icon: 'error',
              duration: 1500
            });
            reject("没有响应")
            return;
          }
          //一些操作
          if (res.data.code != '401') {
            resolve(res);
            return;
          } else {
            reject("请重新登录")
            return;
          }
        },
        fail: function (err) {
          console.log(err);
          wx.showToast({
            title: '请求失败',
            icon: 'error'
          });
          reject("请求失败");
          // wx.redirectTo({
          //   url: '/pages/roleLogin/roleLogin'
          // });
        }, //请求失败
        complete: function () {} //请求完成后执行的函数
      })
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    setTimeout(() => {
      let query = wx.createSelectorQuery();
      query.select('.tabbar').boundingClientRect(rect => {
        let height = rect.height;
        this.setData({
          tabbarHeight: height
        })
      }).exec();
    }, 300)
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