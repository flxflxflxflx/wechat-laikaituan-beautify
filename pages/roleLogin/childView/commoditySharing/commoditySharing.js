// pages/roleView/gysView/childView/ktView/ktView.js
import sub from "../../../../utils/subscribeMessage"
import Big from "../../../../utils/bignumber"
import tr from "../../../../utils/tokenRequest"
import Toast from '@vant/weapp/toast/toast';
import {
  useCascaderAreaData,
  areaList
} from '../../../../utils/area-data/dist/index.cjs';
const app = getApp()
// 请求数据
var pageNum = 0; //页码

Page({
  /**
   * 页面的初始数据
   */
  data: {
    HisAddressColumns: [],
    hisAddressShow: false,
    isAddressFill: false,
    dataShow: false,
    isFillAddress: false,
    areaList: [],
    area_show: false,
    fieldValue: '',
    cascaderValue: '',
    address: '',
    options: [{
      text: '浙江省',
      value: '330000',
      children: [],
    }],
    currentDate: new Date().getTime(),
    // 商品列表
    dataList: [],
    // 选择的列表
    selectList: [],
    // 是否显示分享按钮
    isShare: false,
    imghref: app.globalData.apiUrl + "/uploads/",
    // 团长开团商品数量限制
    tz_share_num: 4,
    // 地址列表
    addressList: [],
    show: false,
    buttons: [{
        type: 'default',
        className: '',
        text: '关闭',
        value: 0
      },
      {
        type: 'primary',
        className: '',
        text: '设置价格',
        value: 1
      }
    ],
    // 商品信息
    productInfo: [],
    href: app.globalData.apiUrl + "/uploads/",
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
    pickUpPoint: false,
    // 交货地址
    deliveryaddress: '',
    // 历史提货地址
    hisAddr: "",
    // 选择列表
    selectListData: [],
    currentTab: 0,
    toView: "default",
    isnavShow: false,
    bottomLift: app.globalData.bottomLift,
    // 是否包邮
    isFreeShipping: false,
    screenHeight: 0,
    // 运费金额
    freightAmount: 0,
    // 是否自行配送
    isSelfDelivery: false,
    AddressColumns: ['杭州', '宁波', '温州', '嘉兴', '湖州'],
    addressShow: false,
    // 评论
    CommentInformation: [],
    toPriceRetioh: '',
    // 分享隐藏
    isfenxiang: true,
    // 最小时间
    minDate: "",
    // 最大时间
    maxDate: "",
    // 当前时间
    date: "",
    maxHour: "",
    showPopup: false,
    // 接货时间
    receivingTime: "",
    // 是否都是平台的商品
    isAllPT: true,
    // a(type, options) {
    //   if (type === 'hour') {
    //     let date = wx.getStorageSync("tz_statement_time").split(":");
    //     return options.filter((option) => option <= date[0]-1);
    //   }

    //   return options;
    // },
  },

  onClick() {
    this.addressDataHandle(areaList.province_list, 0);
    this.setData({
      area_show: true,
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
    // 判断地区与详细地址是否有值
    this.isAddressFill()
  },
  onAddressChange(e) {
    this.setData({
      address: e.detail
    })
    // 判断地区与详细地址是否有值
    this.isAddressFill()
  },
  isAddressFill() {
    let {
      fieldValue,
      address
    } = this.data
    console.log(fieldValue, address, "4444444444444")
    if (fieldValue.trim() != '' && fieldValue != null && address.trim() != '' && address != null) {
      this.setData({
        isAddressFill: true
      })
      console.log(this.data.isAddressFill)
      console.log(this.data.isAllPT, "isAllPT", fieldValue, address)
    } else {
      this.setData({
        isAddressFill: false
      })
    }
  },
  onClose() {
    this.setData({
      area_show: false,
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
  onDateInput(event) {
    this.setData({
      currentDate: event.detail,
    });
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
  dateCancel() {
    this.setData({
      dataShow: false
    });
  },
  // 判断时间是否小于截止时间
  formatTime(string) {
    var publishTime = parseInt(string), //必须对传入的字符串做格式化，否则getDate将无法转换数据
      date = new Date(publishTime), //转化为标准时间格式：Thu Sep 06 2018 18:47:00 GMT+0800 (中国标准时间）
      Y = date.getFullYear(),
      M = date.getMonth() + 1,
      D = date.getDate(),
      H = date.getHours(),
      m = date.getMinutes(),
      s = date.getSeconds();
    // 获取date 中的 年 月 日 时 分 秒
    // 对 月 日 时 分 秒 小于10时, 加0显示 例如: 09-09 09:01
    if (M < 10) {
      M = '0' + M;
    }
    if (D < 10) {
      D = '0' + D;
    }
    if (H < 10) {
      H = '0' + H;
    }
    if (m < 10) {
      m = '0' + m;
    }
    if (s < 10) {
      s = '0' + s;
    }
    let tz_statement_time = wx.getStorageSync("tz_statement_time").split(":");
    if (H > parseInt(tz_statement_time[0])) {
      return false
    } else if (H == tz_statement_time[0]) {
      if (m != '00') {
        return false
      }
    }
    return true
  },
  timeClick() {
    this.setData({
      showPopup: true
    })
  },
  a() {
    console.log("ddd")
  },
  cancel(e) {
    this.setData({
      date: e.detail
    })
    let isTime = this.formatTime(this.data.date)
    if (isTime == true) {
      this.setData({
        showPopup: false
      })
    } else {
      wx.showToast({
        title: '截单时间需要小于' + wx.getStorageSync("tz_statement_time"),
        icon: "none"
      })
    }
  },
  addressShow() {
    this.setData({
      addressShow: true
    })
  },
  hisAddressShow() {
    this.setData({
      hisAddressShow: true
    })
  },
  onAddressClose() {
    this.setData({
      addressShow: false
    })
  },
  onHisAddressClose() {
    this.setData({
      hisAddressShow: false
    })
  },
  showPopup() {
    this.setData({
      dataShow: true
    });
  },
  onAddressConfirm(e) {
    let selectItem = this.data.addressList.filter(a => {
      return a.address == e.detail.value
    });
    this.setData({
      deliveryaddress: e.detail.value,
      addressShow: false,
      receivingTime: selectItem.length != 0 ? selectItem[0].time_interval : ""
    })
  },
  onHisAddressConfirm(e) {
    this.setData({
      hisAddr: e.detail.value,
      hisAddressShow: false,
    })
    console.log(this.data.hisAddr,"历史")
  },
  onAddressCancel() {
    this.setData({
      addressShow: false
    })
  },

  onHisAddressCancel() {
    this.setData({
      hisAddressShow: false
    })
  },

  // 是否包邮
  isFreeShipping({
    detail
  }) {
    this.setData({
      isFreeShipping: detail
    })
  },

  // 是否自行配送
  isSelfDelivery({
    detail
  }) {
    this.setData({
      isSelfDelivery: detail
    })
  },


  // 是否填写提货地址
  isFillAddress({
    detail
  }) {
    this.setData({
      isFillAddress: detail
    })
  },
  viewCount() {
    wx.navigateTo({
      url: '../../childView/commodityEvaluation/commodityEvaluation?id=' + this.data.productInfo.id,
    })
  },

  falseShare(e) {
    console.log(this.data.dataList, this.data.selectListData);
    let id = e.currentTarget.dataset.id;
    if (id == 1) {
      wx.showToast({
        title: '请填写提货地址',
        icon: "error"
      })
    } else if (id == 2) {
      wx.showToast({
        title: '请填写运费金额',
        icon: "error"
      })
    } else if (id == 3) {
      wx.showToast({
        title: '请填写地区地址',
        icon: "error"
      })
    } else if (id == 4) {
      wx.showToast({
        title: '请填写截单时间',
        icon: "error"
      })
    } else if (id == 5) {
      wx.showToast({
        title: '请添加提货地址',
        icon: "error"
      })
    }
  },
  /**
   * 商品详情--选项卡
   */
  scrollViewScroll(e) {
    console.log("dddddddddddddddddddddd");
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


  /**
   * 搜索
   */
  async search(msg) {
    this.setData({
      selectListData: []
    })
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
      tr("/getApprovedProducts").then(function (res) {
        that.setData({
          dataList: res.data.data
        });
      })
      wx.hideLoading()
      return new Promise((resolve, reject) => {
        resolve([])
      })
    }
    // 搜索结果
    let searchResult;
    await tr("/searchProducts", {
      query: msg,
      pageNum
    }).then(function (res) {
      searchResult = res.data.data
    })
    this.setData({
      dataList: searchResult
    })

    let result = searchResult.map((item) => {
      return {
        text: item.title,
        item
      }
    })
    result = result.slice(0, 5)
    wx.hideLoading()
    // 发送请求查询
    return new Promise((resolve, reject) => {
      resolve(result)
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
        productInfo: res.data.result,
        show: true,
        CommentInformation: res.data.CommentInformation
      })
    })
  },
  // 清除按钮点击
  clear() {
    this.setData({
      selectListData: []
    })
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
      that.setData({
        dataList: res.data.data
      });
      wx.hideLoading()
    })
  },

  /**
   * 下拉触底
   */
  // searchScrollLower() {
  //   wx.showLoading({
  //     title: '加载中...',
  //   })
  //   let that = this
  //   pageNum++
  //   if (!this.data.searchMsg == '') {
  //     tr("/searchProducts", {
  //       query: that.data.searchMsg,
  //       pageNum: pageNum * 10
  //     }).then(function (res) {
  //       if (res.data.data.length > 0) {
  //         that.setData({
  //           dataList: that.data.dataList.concat(res.data.data) //合并数据
  //         })
  //       } else {
  //         wx.showToast({
  //           title: '没有数据了',
  //           icon: 'none'
  //         })
  //       }
  //       wx.hideLoading()

  //     })
  //   } else {
  //     tr("/getApprovedProducts", {
  //       pageNum: pageNum * 10
  //     }).then(function (res) {
  //       if (res.data.data.length > 0) {
  //         that.setData({
  //           dataList: that.data.dataList.concat(res.data.data) //合并数据
  //         })
  //       } else {
  //         wx.showToast({
  //           title: '没有数据了',
  //           icon: "none"
  //         })
  //       }
  //       wx.hideLoading()
  //     })
  //   }
  // },

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
          that.goumai(res)
        }
      })
    }
  },

  /**
   * 设置价格按钮
   */
  setPrice(e) {
    let that = this

    // 请求商品信息
    tr("/getProductInfoId", {
      id: e.currentTarget.dataset.item.id
    }).then(function (res) {
      let productInfo = res.data.result
      if (e.currentTarget.dataset.item.openingPrice) {
        productInfo["openingPrice"] = e.currentTarget.dataset.item.openingPrice
      }
      that.setData({
        productInfo,
      })
    })


    wx.showModal({
      title: '开团价格',
      editable: true,
      placeholderText: "请输入开团价格",
      success(res) {
        that.goumai(res)
      }
    })
  },

  goumai(res) {
    let that = this
    if (res.confirm) {
      if (res.content.trim() == '') {
        return;
      }
      if (isNaN(res.content) == true) {
        wx.showToast({
          title: '请输入数字',
          icon: 'error',
          mask: true
        })
        return
      }
      let productInfo = that.data.productInfo
      if (productInfo.supplyprice != null) {
        // 商品开团价格下限
        let priceXiaxian = Big((Big(productInfo.supplyprice).times(Big(that.data.toPriceRetioh).div(100))).toFixed(2, 1)).toNumber()
        if (res.content <= priceXiaxian) {
          wx.showToast({
            title: '开团价格不得低于' + Big(priceXiaxian).toFixed(2, 1),
            icon: "none"
          })
        } else {
          let result = that.data.productInfo
          let dataList = that.data.dataList
          for (let index = 0; index < dataList.length; index++) {
            if (dataList[index].id == result.id) {
              dataList[index]["openingPrice"] = Big(res.content).toFixed(2, 1)
              // 设置赚的价格
              let arg1 = Big(dataList[index]["supplyprice"])
              dataList[index]["incomePrice"] = Big(Big(res.content).toFixed(2, 1)).minus(arg1).toFixed(2, 1)
              // 设置供应价
              break
            }
          }
          result['openingPrice'] = Big(res.content).toFixed(2, 1)
          that.data.selectListData.push(result.id)
          // 设置开团价格
          that.setData({
            productInfo: result,
            dataList,
            isShare: true,
            selectListData: Array.from(new Set(that.data.selectListData))
          })
        }
      } else {
        let result = that.data.productInfo
        let dataList = that.data.dataList
        for (let index = 0; index < dataList.length; index++) {
          if (dataList[index].id == result.id) {
            dataList[index]["openingPrice"] = Big(res.content).toFixed(2, 1)
            dataList[index]["incomePrice"] = Big(res.content).toFixed(2, 1)
            // 设置供应价
            break
          }
        }
        result['openingPrice'] = Big(res.content).toFixed(2, 1)
        that.data.selectListData.push(result.id)
        // 设置开团价格
        that.setData({
          productInfo: result,
          dataList,
          isShare: true,
          selectListData: Array.from(new Set(that.data.selectListData))
        })
      }
    } else if (res.cancel) {
      console.log('用户点击取消')
    }
  },



  /**
   * 点击详情页
   */
  onListbtn(e) {
    // wx.navigateTo({
    //   url: './childView/productDetails/productDetails?productid=' + e.currentTarget.dataset.productid,
    // })
    let that = this
    if (e.currentTarget.dataset.item.openingPrice) {

    }
    // 请求商品信息
    tr("/getProductInfoId", {
      id: e.currentTarget.dataset.item.id
    }).then(function (res) {
      let productInfo = res.data.result
      if (e.currentTarget.dataset.item.openingPrice) {
        productInfo["openingPrice"] = e.currentTarget.dataset.item.openingPrice
      }
      that.setData({
        productInfo,
        show: true,
        CommentInformation: res.data.CommentInformation
      })
    })
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
    if (item.openingPrice == undefined) {
      for (let index = 0; index < dataList.length; index++) {
        if (dataList[index].id == item.id) {
          dataList[index]["isCheckShow"] = false
          break
        }
      }
      this.setData({
        dataList
      })
      wx.showToast({
        title: '没有设置价格',
        icon: 'error'
      })
    } else {
      for (let index = 0; index < dataList.length; index++) {
        if (dataList[index].id == item.id) {
          dataList[index]["isCheckShow"] = !dataList[index]["isCheckShow"]
          if (dataList[index]["isCheckShow"]) {
            let selectListData = this.data.selectListData;
            selectListData.push(item.id);
            this.setData({
              selectListData: Array.from(new Set(that.data.selectListData))
            })
            console.log(this.data.selectListData, "选择了");
          } else {
            let selectListData = this.data.selectListData;
            for (let index = 0; index < selectListData.length; index++) {
              if (selectListData[index] == item.id) {
                selectListData.splice(index, 1)
              }
            }
            this.setData({
              selectListData: Array.from(new Set(that.data.selectListData))
            })
          }
          break
        }
      }
      this.setData({
        dataList
      })
      console.log(this.data.selectListData, "选择了");
    }
    this.checkboxChange()
  },

  // 分享
  shareButtontap() {},
  async onShare() {
    console.log("djflksjdfjs")
    await sub([app.globalData.OPENING_DEAD]).then(function (res) {
      // 调用订阅消息
      // tr("/sendMessage").then(function(res){
      //   console.log(res);
      // })
      console.log("获取订阅权限成功");
    }, function (e) {
      console.log(e);
    })
    this.setData({
      isShareFormShow: true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(typeof options.isPT, "fdlsfjsal")
    this.setData({
      //获取屏幕可用高度
      screenHeight: wx.getSystemInfoSync().windowHeight - 330,
      // 是否都是平台的商品
      isAllPT: options.isPT == 'true' ? true : false
    })
    // 选择的商品
    let selectListData = JSON.parse(options.selectListData);


    let that = this
    pageNum = 0

    // 获取选着的商品列表
    tr("/getSelectOpeningProducts", {
      selectListData
    }).then(function (res) {
      that.setData({
        dataList: res.data.data
      });
    })

    // 获取地址和截单时间
    tr("/getAddressColumns").then(function (res) {
      wx.setStorageSync('tz_statement_time', res.data.tz_statement_time);
      let address = res.data.address.map(e => e.address)
      that.setData({
        AddressColumns: address,
        addressList: res.data.address,
        minDate: new Date().getTime(),
      })
      console.log(that.data.AddressColumns[0].address)
    })

    // 获取历史地址列表
    tr("/getHisAddressLists").then(function (res) {
      let address = res.data.map(e => e.address)
      that.setData({
        HisAddressColumns: address,
      })
    })


    // 获取开团比例
    tr("/getLoPriceRetio").then(function (res) {
      that.setData({
        toPriceRetioh: res.data
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

  //用户点击右上角分享给好友，要现在分享到好友这个设置menu的两个参数，才可以实现分享到朋友圈
  onShareAppMessage: async function () {
    let that = this
    this.setData({
      isfenxiang: false
    })

    wx.showShareMenu({
      withShareTicket: true,
      menu: ['shareappmessage', 'shareTimeline']
    })

    // 商品列表
    let productList = []
    let dataList = this.data.dataList
    let selectListData = [...new Set(this.data.selectListData)]
    for (let index = 0; index < dataList.length; index++) {
      for (let index2 = 0; index2 < selectListData.length; index2++) {
        if (dataList[index].id == selectListData[index2]) {
          productList.push(dataList[index])
        }
      }
    }


    let openingId = '';
    // 是否包邮
    let {
      freightAmount,
      isFreeShipping,
      isSelfDelivery,
      deliveryaddress,
      isAllPT,
      isAddressFill,
      fieldValue,
      address,
      isFillAddress,
      hisAddr
    } = this.data;
    // 如果不包邮设置邮费为零
    if (isFreeShipping) {
      freightAmount = 0
    }
    if (isSelfDelivery) {
      deliveryaddress = ''
    }

    // 是否是新填写的地址
    let isNewAddr = false;
    if (!isAllPT) {
      if (isFillAddress) {
        if (isAddressFill) {
          deliveryaddress = fieldValue + '/' + address
          isNewAddr = true;
        }
      } else {
        if (hisAddr != '') {
          deliveryaddress = hisAddr
        }
      }
    }

    // 填写开团信息
    await tr("/commodityOpening", {
      // 商品组合名称
      pronames: wx.getStorageSync('nick_name') + "团长的商品组合",
      // 开团的链接地址
      url: "/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=" + JSON.stringify(this.data.selectListData),
      // 截单时间
      statement_time: this.data.date,
      // 是否为提货站
      own_isstation: this.data.pickUpPoint ? '1' : '0',
      // 提货地址
      own_addr: deliveryaddress,
      // 配送费
      freightAmount,
      // 开团的商品列表
      productList,
      // 是否是新的地址
      isNewAddr
    }).then(function (res) {
      openingId = res.data.data
    })

    let title = ''
    productList.forEach(function (item) {
      title += item.title + "\n"
    })
    setTimeout(() => {
      that.setData({
        isfenxiang: true
      })
    }, 1000);

    return {
      // title: wx.getStorageSync('nick_name') + "团长的商品组合",
      title: title,
      path: "/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=" + openingId+"&isAllPT="+isAllPT,
      imageUrl: ""
    }
  },
})