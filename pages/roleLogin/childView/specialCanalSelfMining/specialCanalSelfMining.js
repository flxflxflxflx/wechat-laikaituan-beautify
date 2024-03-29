import Big from "../../../../utils/bignumber"
import tr from "../../../../utils/tokenRequest"
import sub from "../../../../utils/subscribeMessage"
import {
  useCascaderAreaData,
  areaList
} from '../../../../utils/area-data/dist/index.cjs';
const app = getApp()
// 请求数据
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    areaList,
    area_show: false,
    fieldValue: '',
    cascaderValue: '',
    options: [{
      text: '浙江省',
      value: '330000',
      children: [],
    }],
    href: app.globalData.apiUrl + "/uploads/",
    href2: app.globalData.apiUrl,
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
    // 多列选择器(二级联动)列表设置,及初始化
    rawData: [],
    multiObjArray: [
      [],
      []
    ],
    multiIndex: [0, 0],
    isPickerSelect: false,
    // 判断是否截单
    isCutOrder: false,
    // 详细地址
    address: "",
    // 提交订单加载
    submitOrderIsLoading: false,
    topLift: wx.getSystemInfoSync()['statusBarHeight'],
    isShowNav: false,
    showShare: false,
    // 保存二级标题信息
    twoTitleInfomation: [],
    // 头像
    avatar: "",
    nickName: '',
    phone: ''
  },

  getUserInfo(event) {
    console.log(event.detail);
  },

  onUserClose() {
    this.setData({
      showShare: false
    });
  },


  backHome() {
    wx.reLaunch({
      url: '/pages/roleLogin/roleLogin',
    })
  },



  onAddressChange(e) {
    this.setData({
      address: e.detail
    })
  },

  onClose() {
    this.setData({
      area_show: false,
    });
  },

  onFinish(e) {
    const {
      selectedOptions,
      value
    } = e.detail;
    const fieldValue = selectedOptions
      .map((option) => option.text || option.name)
      .join('/');
    this.setData({
      fieldValue,
      cascaderValue: value,
      area_show: false
    })
  },

  selfProvidedPickupPoint(e) {
    this.setData({
      selfProvidedPickupPoint: e.detail.value
    })
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
          url: '../commodityOrder/commodityOrder?selectListData=' + this.data.openingProductId + "&isspecial=1",
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
  // watch: {
  //   totalWeigth: {
  //     handler(newValue) {
  //       if (newValue > 0) {
  //         // console.log(this.data.productInfo);
  //         console.log(newValue);
  //         if (newValue > this.data.basesInfo.counterweight) {
  //           this.setData({
  //             extraCosts: this.data.basesInfo.delivery_fee * 2
  //           })
  //         } else {
  //           this.setData({
  //             extraCosts: this.data.basesInfo.delivery_fee
  //           })
  //         }
  //       } else {
  //         this.setData({
  //           extraCosts: 0
  //         })
  //       }
  //     },
  //     // deep: true
  //   },
  // },
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
          // dataList[index].num--
          dataList[index].minusStatus = dataList[index].num > 0 ? 'normal' : 'disable';
        }
        productPriceSetting = dataList[index]
      }
      if (dataList[index].num >= 0 && !isNaN(dataList[index].num) && dataList[index].num !== '') {
        // 设置总数
        totalQuantity += dataList[index].num
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].specification_id;
        let weight = dataList[index].weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].weight
            break;
          case 2:
            weight = Big(dataList[index].weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].weight).times(Big(10000)).toNumber()
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
        // dataList[index].num++
        dataList[index].minusStatus = dataList[index].num > 0 ? 'normal' : 'disable';
        productPriceSetting = dataList[index]
      }
      if (dataList[index].num >= 0 && !isNaN(dataList[index].num) && dataList[index].num !== '' && dataList[index].num <= dataList[index].stock) {
        // 设置总数
        totalQuantity += dataList[index].num
        // 设置总金额
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].specification_id;
        let weight = dataList[index].weight
        // TODO: 按照数据库的重量计算
        switch (specification_id) {
          case 1:
            weight = dataList[index].weight
            break;
          case 2:
            console.log(dataList[index]);
            weight = Big(dataList[index].weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].weight).times(Big(10000)).toNumber()
            break;

          default:
            weight = 0
            break;
        }
        totalWeigth = Big(totalWeigth).plus(Big(dataList[index].num).times(Big(weight))).toNumber();
      } else {
        // 判断增加有没有超过库存
        dataList[index].num = dataList[index].stock
        productPriceSetting = dataList[index]
        wx.showToast({
          title: '库存仅有' + dataList[index].stock,
          icon: 'none'
        })
        totalQuantity += dataList[index].num
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].specification_id;
        let weight = dataList[index].weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].weight
            break;
          case 2:
            weight = Big(dataList[index].weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].weight).times(Big(10000)).toNumber()
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
        dataList[index].num = parseInt(e.detail)
        dataList[index].minusStatus = dataList[index].num > 0 ? 'normal' : 'disable';
        productPriceSetting = dataList[index]
      }
      if (dataList[index].num >= 0 && !isNaN(dataList[index].num) && dataList[index].num !== '' && dataList[index].num <= dataList[index].stock) {
        // 设置总数
        totalQuantity += dataList[index].num
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].specification_id;
        let weight = dataList[index].weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].weight
            break;
          case 2:
            weight = Big(dataList[index].weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].weight).times(Big(10000)).toNumber()
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
        dataList[index].num = dataList[index].stock
        productPriceSetting = dataList[index]
        wx.showToast({
          title: '库存仅有' + dataList[index].stock,
          icon: 'none'
        })
        // 设置总数
        totalQuantity += dataList[index].num
        totalAmount = Big(totalAmount).plus(Big(dataList[index].num).times(Big(dataList[index].selling_price))).toNumber();
        // 设置总重量
        let specification_id = dataList[index].specification_id;
        let weight = dataList[index].weight
        switch (specification_id) {
          case 1:
            weight = dataList[index].weight
            break;
          case 2:
            weight = Big(dataList[index].weight).times(Big(500)).toNumber()
            break;
          case 3:
            weight = Big(dataList[index].weight).times(Big(1000)).toNumber()
            break;
          case 4:
            weight = Big(dataList[index].weight).times(Big(10000)).toNumber()
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

    tr("/visualizzaVolume", {
      productId: item.id
    })

    if (item.is_help_sell == 1) {
      wx.navigateTo({
        url: '../../childView/productDetails/productDetails?productid=' + item.id + "&selling_price=" + item.selling_price + "&page=productBuy&ispt=1",
      })
    } else {
      wx.navigateTo({
        url: '../../childView/productDetails/productDetails?productid=' + item.id + "&selling_price=" + item.selling_price + "&page=productBuy",
      })
    }
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
    if (this.data.totalQuantity == 0) {
      wx.showToast({
        title: '请添加商品',
        icon: "error"
      })
      return
    }

    // if (this.data.groupbuyInfo.own_addr == null && this.data.fieldValue.trim() == "") {
    //   wx.showToast({
    //     title: '请选择地区',
    //     icon: "error"
    //   })
    //   return
    // } else if (this.data.groupbuyInfo.own_addr == null && this.data.address.trim() == "") {
    //   wx.showToast({
    //     title: '请输入详细地址',
    //     icon: "error"
    //   })
    //   return
    // }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.setData({
      submitOrderIsLoading: true
    })
    let that = this
    // 购买商品列表
    let payProducts = []
    // 商品列表
    let dataList = this.data.dataList

    for (let index = 0; index < dataList.length; index++) {
      if (dataList[index].num > 0) {
        dataList[index]["extraCosts"] = this.data.extraCosts // 设置手续费
        if (dataList[index]["stock"] - dataList[index]["num"] >= 0) {
          dataList[index].stock = dataList[index]["stock"] - dataList[index]["num"]
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
    console.log(dataList);
    this.setData({
      dataList: dataList
    })

    if (payProducts.length > 0) {

      // 请求后台生成订单号
      this.generateOrderNumber(payProducts, null)
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
    tr("/generatePurchaseOrderNumber", {
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
        that.setData({
          submitOrderIsLoading: false
        })
        if (res.data.code && res.data.code == 406) {
          wx.showToast({
            title: '订单支付失败',
            icon: "error"
          })
        }
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
            // 进行分享
            that.setData({
              showShare: true
            })
          },
          fail() {
            that.setData({
              submitOrderIsLoading: false
            })
            console.log("用户取消支付")
          }
        });
      })
    })


  },
  onClick() {
    this.addressDataHandle(areaList.province_list, 0);
    this.setData({
      area_show: true,
    });
  },
  onChange(e) {
    const {
      value
    } = e.detail;
    if (e.detail.tabIndex == 0) {
      this.addressDataHandle(areaList.city_list, 1, e.detail.value)
    } else if (e.detail.tabIndex = 1) {
      this.setData({
        twoTitleInfomation: e.detail.value
      })
      this.addressDataHandle(areaList.county_list, 2, e.detail.value)
    }
  },

  // 地址数据处理  
  addressDataHandle(area, index, code = null) {
    // 地址数据
    let addressData = function (isEnd = false) {
      let list = Object.entries(area).map(item => {
        if (isEnd) {
          return {
            ['text']: item[1],
            ['value']: item[0]
          }
        } else {
          return {
            ['text']: item[1],
            ['value']: item[0],
            ['children']: []
          }
        }
      })
      return list
    }

    if (index == 0) {
      let list = addressData()
      this.setData({
        options: list
      })
    } else if (index == 1) {
      let list = addressData()

      // 进行过滤
      let ll = list.filter(function (current, index, arr) {
        if (current.value.substr(0, 2) == code.substr(0, 2)) {
          return current;
        }
      })

      let options = this.data.options

      for (let i = 0; i < options.length; i++) {
        if (options[i].value == code) {
          options[i].children = ll;
          let ooo = [options[i]]
          // this.setData({
          //   ['options[' + i + '].children']: ll,
          // })
          this.setData({
            options: ooo
          })
          break;
        }
      }
    } else if (index == 2) {
      let list = addressData(true)
      // 进行过滤
      let ll = list.filter(function (current, index, arr) {
        if (current.value.substr(0, 4) == code.substr(0, 4)) {
          return current;
        }
      })
      let options = this.data.options[0].children
      for (let i = 0; i < options.length; i++) {
        if (options[i].value == code) {
          let ooo = [options[i]];
          ooo[0].children = ll;
          let ccc = this.data.options[0].children = ooo
          this.setData({
            options: ccc
          })
          break;
        }
      }
    }
  },
  clicktab(e) {
    let {
      tabIndex
    } = e.detail
    if (tabIndex == 0) {
      this.addressDataHandle(areaList.province_list, 0);
    } else if (tabIndex == 1) {
      this.addressDataHandle(areaList.city_list, 1, this.data.twoTitleInfomation)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options, "ddddd")
    let selectListData = JSON.parse(options.selectListData)

    app.setWatcher(this);

    // 向后台请求角色权限
    let that = this
    this.isLogin('/getUserPermissions').then(function (res) {
      let isPermissionsNull = res.data.isPermissionsNull
      if (isPermissionsNull) {
        console.log("没有团长权限");
        // setTimeout(() => {
        //   wx.redirectTo({
        //     url: '/pages/roleAudit/roleForm/roleForm',
        //   })
        // }, 1500);
      }

      that.setData({
        openingProductId: options.selectListData
      });

      wx.showLoading({
        title: '加载中...',
      })
      // 获取商品
      tr("/procurementOfGoods", {
        selectListData
      }).then(function (res) {
        wx.hideLoading()
        if (res.data.code == 409) {
          // 订单已经截单
          that.setData({
            isCutOrder: false
          })
        } else {
          res.data.data.map((item) => {
            console.log(item);
            item["num"] = 0
            // item["selling_price"] =  Big(item["selling_price"]).plus(Big(item.product["help_sell_price"])).toNumber()
            item["selling_price"] = item.supplyprice
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
        console.log(res.data);
        that.setData({
          // groupbuyInfo: res.data.openingInfo,
          // extraCosts: res.data.openingInfo.delivery_fee,
          basesInfo: res.data.basesInfo
        })
      })

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
    })


  },

  // 判断是否有支付权限，是否注册
  isLogin(url, options, data = {}, method = 'post') {
    let that = this
    return new Promise((resolve, reject) => {
      //如果不能处在token，返回登录页面
      if (!wx.getStorageSync('access_token')) {
        // wx.showToast({
        //   title: '没有token',
        // })
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
            console.log(res.header.Authorization);
            wx.setStorageSync('access_token', res.header.Authorization);
            wx.redirectTo({
              url: '/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=' + options.selectListData,
            })
            return;
          }
          if (res.statusCode == 401) {
            wx.showToast({
              title: 'toke刷新401',
              icon: "none",
              mask: true
            })
            if (res.data.msg == "token过期，请重新登录") {
              console.log("token过期,请重新登录");
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
    let that = this
    // 如果有没有团长权限隐藏回到首页
    // tr("/getUserPermissions").then(function (res) {
    //   if (!res.data.isPermissionsNull) {
    //     that.setData({
    //       isShowNav: true
    //     })
    //   }
    // })
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
      path: "/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=" + openingProductId,
      imageUrl: ""
    }
  }
})