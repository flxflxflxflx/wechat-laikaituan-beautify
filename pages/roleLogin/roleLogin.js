import sub from "../../utils/subscribeMessage"
import tr from "../../utils/tokenRequest.js"
import Big from "../../utils/bignumber"
import Dialog from '@vant/weapp/dialog/dialog';
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
    bottomLift: app.globalData.bottomLift,
    // 是否显示遮罩层
    isShowZZC: true,
    // 分组展示的数据
    items: [{ // 导航名称
      text: '全部商品',
    }, ],
    selectItemsId: '',
    // 我的商品按钮颜色
    MyProductListColor: "#F7F8FA"
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

  // 自采
  selfHarvesting() {
    console.log(this.data.selectListData)
    // 跳转到商品选择完的列表
    wx.navigateTo({
      url: "/pages/roleLogin/childView/specialCanalSelfMining/specialCanalSelfMining?selectListData=" + JSON.stringify(this.data.selectListData),
    })
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
      await tr("/getApprovedProducts", {
        categoryId: that.data.selectItemsId
      }).then(function (res) {
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
      categoryId: that.data.selectItemsId,
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
      pageNum,
      categoryId: that.data.selectItemsId
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
        categoryId: that.data.selectItemsId,
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
        pageNum: pageNum * 10,
        categoryId: that.data.selectItemsId
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
            selectListData: [...new Set(this.data.selectListData)]
          })
        }
        break
      }
    }
    this.setData({
      dataList
    })
    console.log(this.data.selectListData);


    // 检查是否全部都是平台商品，如果全部都是平台商品或者全部都是团长商品才能通过
    if (this.data.selectListData.length != 0) {
      // 选中的is_pulic的值
      let isPulic = this.data.dataList.filter(e => e.id == this.data.selectListData[0])[0].is_public
      // 当前是否展示
      let curIsCheckShow = this.data.dataList.filter(e => e.id == item.id)[0].isCheckShow
      console.log(isPulic, "ddd")
      let isExec = false;
      for (let index = 0; index < this.data.selectListData.length; index++) {
        // 当前是否公共
        let curIsPulic = this.data.dataList.filter(e => e.id == this.data.selectListData[index])[0].is_public

        console.log(curIsCheckShow, "dfjajsflas")
        if (this.data.selectListData[index] == item.id) {
          console.log("dkjflasjflj")
          if (curIsCheckShow !== true) {
            continue;
          }
        }
        if (isPulic !== curIsPulic) {
          isExec = true;
        }
      }

      if (isExec == true) {
        wx.showToast({
          title: '只能选择同一种类型的商品',
          icon: "none"
        })
        this.setData({
          isShare: false
        })
        return;
      }
      this.setData({
        isShare: true
      })
    }

    this.checkboxChange()
  },

  // 分享
  shareButtontap() {},
  onShare() {
    // 判断商品是否都是平台商品
    let isPT = true;
    this.data.selectListData.forEach(e => {
      this.data.dataList.forEach(b => {
        if (b.id == e) {
          if (b.is_public == 0 || b.is_my_product == 1) {
            isPT = false;
          }
        }
      })
    })
    console.log(isPT, "ddfjsljf");
    // 跳转到商品选择完的列表
    wx.navigateTo({
      url: './childView/commoditySharing/commoditySharing?selectListData=' + JSON.stringify(this.data.selectListData) + "&isPT=" + isPT,
    })
  },

  // 侧边导航点击
  onClickNav(e) {
    if (this.data.items[e.detail.index].id === -2) {
      this.setData({
        selectItemsId: this.data.items[e.detail.index].id,
      })
      this.getMyProductLists();
      return;
    }
    let that = this
    pageNum = 0
    // 获取审核通过的商品列表
    that.setData({
      selectItemsId: this.data.items[e.detail.index].id,
    })
    tr("/getApprovedProducts", {
      pageNum,
      categoryId: this.data.items[e.detail.index].id
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
        dataList,
        tz_share_num: res.data.tz_share_num
      });
    })
  },

  // 获取我的商品
  getMyProductLists() {

    console.log("dd")
    let that = this
    pageNum = 0
    // 获取审核通过的商品列表
    that.setData({
      selectItemsId: -1,
      mainActiveIndex: that.data.mainActiveIndex == -1 ? -2 : -1
    })
    tr("/getApprovedProducts", {
      pageNum,
      categoryId: -1
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
        dataList,
        tz_share_num: res.data.tz_share_num
      });
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    // 判断是否是第一次登录，如果是第一次登录，弹出登录须知
    if (wx.getStorageSync('isFirstLogin') == true) {
      // 请求弹窗内容
      tr("/getDialogContent").then(function (res) {
        Dialog.alert({
          title: '登录须知',
          message: res.data.content,
          theme: 'round-button',
        }).then(() => {
          // on close
        });
        wx.setStorageSync('isFirstLogin', false)
      })
    } else {
      console.log("不是第一次登录")
    }


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
          isShowZZC: false
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


    pageNum = 0
    this.setData({
      search: this.search.bind(this)
    })

    // 获取商品分类
    tr("/getProductCategory").then(function (res) {
      let result = [];
      for (let item of res.data) {
        let i = {}
        i["text"] = item.title
        i["id"] = item.id
        result.push(i)
      }
      that.setData({
        items: that.data.items.concat(result)
      })
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