import sub from "../../utils/subscribeMessage"
import tr from "../../utils/tokenRequest.js"
import Big from "../../utils/bignumber"
const app = getApp()
// 请求数据
var pageNum = 0; //页码 
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
    // 用户的权限信息
    isPermissionsNull: true,
    permissions: [],

    // ---------- 这个是开团相关的 --------------------------------
    // 商品列表
    dataList: [],
    // 选择的列表
    selectList: [],
    // 是否显示分享按钮
    isShare: false,
    imghref: app.globalData.apiUrl + "/uploads/",
    // 团长开团商品数量限制
    tz_share_num: 4,
    show: false,
    buttons: [{
      type: 'default',
      className: '',
      text: '关闭',
      value: 0
    }],
    // 商品信息
    productInfo: [],
    href: app.globalData.apiUrl + "/uploads",
    // 开团价格
    openingPrice: '',
    // 搜索内容
    searchMsg: '',
    /**
     * 分享表单
     */
    isShareFormShow: false,
    /**
     * 分享
     */
    date: "21:00",
    pickUpPoint: false,
    // 交货地址
    deliveryaddress: '',
    // 选择列表
    selectListData: [],
    currentTab: 0,
    toView: "default",
    isnavShow: false,
    bottomLift: app.globalData.bottomLift
  },

  tabChange(e) {
    switch (e.detail.index) {
      case 0:

        break;
      case 1:
        wx.redirectTo({
          url: '../roleView/gysView/gysView',
        })
        break;
      case 2:
        wx.redirectTo({
          url: '../roleView/myView/myView',
        })
        break;
      default:
        break;
    }
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

  // -------------- 这是开团的方法 ----------------------

  // 查看全部
  viewCount() {
    wx.navigateTo({
      url: './childView/commodityEvaluation/commodityEvaluation?id=' + this.data.productInfo.id,
    })
  },
  falseShare() {
    wx.showToast({
      title: '请填写收货地址',
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
    console.log(that.data.toView);
  },


  /**
   * 表单
   */
  // 自备提货点
  onpickUpPoint(e) {
    this.setData({
      pickUpPoint: e.detail.value
    })
  },
  // 截单时间
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  // 关闭
  onShareClose() {
    this.setData({
      isShareFormShow: false
    })
  },


  /**
   * 搜索
   */
  async search(msg) {
    msg = msg.detail
    this.checkboxChange()
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      searchMsg: msg.trim()
    });
    pageNum = 0
    let that = this
    if (msg.trim() == '') {
      await tr("/getApprovedProducts").then(function (res) {
        that.setData({
          dataList: res.data.data
        });
      })
      let dataList = that.data.dataList
      let item = that.data.selectListData
      for (let index = 0; index < dataList.length; index++) {
        for (let y = 0; y < item.length; y++) {
          if (dataList[index].id == item[y]) {
            console.log(dataList[index]);
            dataList[index]["isCheckShow"] = !dataList[index]["isCheckShow"]
          }
        }
      }
      that.setData({
        dataList
      })
      wx.hideLoading()
      return new Promise((resolve, reject) => {
        resolve([])
      })
    }
    // 搜索结果
    let searchResult;
    console.log(msg);
    await tr("/searchProducts", {
      query: msg,
      pageNum
    }).then(function (res) {
      searchResult = res.data.data
    })

    let dataList = searchResult
    let item = that.data.selectListData
    for (let index = 0; index < dataList.length; index++) {
      for (let y = 0; y < item.length; y++) {
        if (dataList[index].id == item[y]) {
          console.log(dataList[index]);
          dataList[index]["isCheckShow"] = !dataList[index]["isCheckShow"]
        }
      }
    }
    that.setData({
      dataList
    })

    // TODO:这是消息返回
    // let result = searchResult.map((item) => {
    //   return {
    //     text: item.title,
    //     item
    //   }
    // })
    // result = result.slice(0, 5)
    wx.hideLoading()
    // 发送请求查询
    return new Promise((resolve, reject) => {
      // resolve(result)
    })
  },
  selectResult: function (e) {
    console.log('select result', e.detail)
    let that = this
    // 请求商品信息
    tr("/getProductInfoId", {
      id: e.detail.item.item.id
    }).then(function (res) {
      that.setData({
        productInfo: res.data,
        show: true
      })
    })
  },
  // 清除按钮点击
  clear() {
    // this.setData({
    //   selectListData: []
    // })
    this.checkboxChange()
    wx.showLoading({
      title: '加载中...',
    })
    let that = this
    pageNum = 0
    // 获取审核通过的商品列表
    tr("/getApprovedProducts", {
      pageNum
    }).then(function (res) {
      let dataList = res.data.data
      let item = that.data.selectListData
      for (let index = 0; index < dataList.length; index++) {
        for (let y = 0; y < item.length; y++) {
          if (dataList[index].id == item[y]) {
            console.log(dataList[index]);
            dataList[index]["isCheckShow"] = !dataList[index]["isCheckShow"]
          }
        }
      }
      that.setData({
        dataList
      })
      wx.hideLoading()
    })
  },

  /**
   * 下拉触底
   */
  searchScrollLower() {
    wx.showLoading({
      title: '加载中...',
    })
    let that = this
    pageNum++
    if (!this.data.searchMsg == '') {
      tr("/searchProducts", {
        query: that.data.searchMsg,
        pageNum: pageNum * 10
      }).then(function (res) {
        if (res.data.data.length > 0) {
          that.setData({
            dataList: that.data.dataList.concat(res.data.data) //合并数据
          })
        } else {
          wx.showToast({
            title: '没有数据了',
            icon: 'none'
          })
        }
        wx.hideLoading()

      })
    } else {
      tr("/getApprovedProducts", {
        pageNum: pageNum * 10
      }).then(function (res) {
        if (res.data.data.length > 0) {
          that.setData({
            dataList: that.data.dataList.concat(res.data.data) //合并数据
          })
        } else {
          wx.showToast({
            title: '没有数据了',
            icon: "none"
          })
        }
        wx.hideLoading()
      })
    }
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
      wx.showModal({
        title: '开团价格',
        editable: true,
        placeholderText: "请输入开团价格",
        success(res) {
          if (res.confirm) {
            if (isNaN(res.content) == true) {
              wx.showToast({
                title: '请输入数字',
                icon: 'error',
                mask: true
              })
              return
            }
            let productInfo = that.data.productInfo
            // 商品开团价格下限
            let priceXiaxian = ((productInfo.supplyprice + productInfo.supplyprice * productInfo.charges_fee / 100) * (110 / 100))
            if (res.content < priceXiaxian) {
              wx.showToast({
                title: '开团价格不得低于供应价110%',
                icon: "none"
              })
            } else {
              let result = that.data.productInfo
              let dataList = that.data.dataList
              for (let index = 0; index < dataList.length; index++) {
                if (dataList[index].id == result.id) {
                  dataList[index]["openingPrice"] = Big(res.content).toFixed(2, 1)
                  // 设置赚的价格
                  let arg = Big(dataList[index]["supplyprice"]).times(Big(dataList[index]["charges_fee"])).div(100)
                  let arg1 = Big(dataList[index]["supplyprice"]).plus(arg)
                  dataList[index]["incomePrice"] = Big(Big(res.content).toFixed(2, 1)).minus(arg1).toNumber()
                  // 设置供应价
                  break
                }
              }
              result['openingPrice'] = Big(res.content).toFixed(2, 1)
              // 设置开团价格
              that.setData({
                productInfo: result,
                dataList
              })
            }
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  /**
   * 点击详情页
   */
  onListbtn(e) {
    wx.navigateTo({
      url: './childView/productDetails/productDetails?productid=' + e.currentTarget.dataset.item.id,
    })
    // let that = this
    // // 请求商品信息
    // tr("/getProductInfoId", {
    //   id: e.currentTarget.dataset.item.id
    // }).then(function (res) {
    //   let productInfo = res.data
    //   that.setData({
    //     productInfo,
    //     show: true
    //   })
    // })
  },

  /**
   * 阻止复选框事件冒泡
   */
  stop() {},
  /**
   * 多选列表
   */
  checkboxChange() {
    let selectListData = this.data.selectListData
    if (selectListData.length > this.data.tz_share_num) {
      wx.showToast({
        title: '最多只能选择' + this.data.tz_share_num + "个",
        icon: "none"
      })
      this.setData({
        isShare: false
      })
    } else if (selectListData.length > 0) {
      this.setData({
        isShare: true
      })
    } else {
      this.setData({
        isShare: false
      })
    }
  },
  selectList(e) {
    let item = e.currentTarget.dataset.data
    let dataList = this.data.dataList

    for (let index = 0; index < dataList.length; index++) {
      if (dataList[index].id == item.id) {
        dataList[index]["isCheckShow"] = !dataList[index]["isCheckShow"]
        console.log(dataList[index]);
        if (dataList[index]["isCheckShow"]) {
          let selectListData = this.data.selectListData;
          selectListData.push(item.id);
          this.setData({
            selectListData
          })
        } else {
          let selectListData = this.data.selectListData;
          for (let index = 0; index < selectListData.length; index++) {
            if (selectListData[index] == item.id) {
              selectListData.splice(index, 1)
            }
          }
          this.setData({
            selectListData:[...new Set(this.selectListData)]
          })
        }
        break
      }
    }
    this.setData({
      dataList
    })
    console.log(this.data.selectListData);

    this.checkboxChange()
  },

  // 分享
  shareButtontap() {},
  onShare() {
    // 跳转到商品选择完的列表
    wx.navigateTo({
      url: './childView/commoditySharing/commoditySharing?selectListData=' + JSON.stringify(this.data.selectListData),
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


    pageNum = 0
    this.setData({
      search: this.search.bind(this)
    })
    // 获取审核通过的商品列表
    tr("/getApprovedProducts", {
      pageNum
    }).then(function (res) {
      that.setData({
        dataList: res.data.data,
        tz_share_num: res.data.tz_share_num
      });
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