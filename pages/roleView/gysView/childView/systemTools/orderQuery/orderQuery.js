import tr from "../../../../../../utils/tokenRequest"
// pages/roleView/gysView/childView/systemTools/orderQuery/orderQuery.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
        text: '我的商品',
        iconPath: "/static/image/myProduct2.png",
        selectedIconPath: "/static/image/myProduct.png",
        // badge: '8'
      },
      {
        text: '订单查询',
        iconPath: "/static/image/orderSearch.png",
        selectedIconPath: "/static/image/orderSearch2.png",
      },
      {
        text: '总流水账',
        iconPath: "/static/image/caigou.png",
        selectedIconPath: "/static/image/caigou2.png",
        // dot: true
      },
      {
        text: '购买查询',
        iconPath: "/static/image/search.png",
        selectedIconPath: "/static/image/search2.png",
        // dot: true
      },
    ],
    tableOption: {
      headOption: {
        row: [
          [{
              value: '日期',
              sticky: true,
            }, {
              value: '项目',
              sticky: true,
            },
            {
              value: '品种',
              sticky: true,
            },
            {
              value: '规格',
              sticky: true,
            },

            {
              value: '份数',
              sticky: true,
            },
            {
              value: '供货价',
              sticky: true,
            },
            {
              value: '金额',
              sticky: true,
            },
            {
              value: '余额',
              sticky: true,
            }
          ]
        ],
        thStickyStyle: 'background-color:#007f80;font-size:10rpx',
        thStyle: 'background-color:#428bca;'
      },
      bodyOption: {
        row: [
          [{
            prop: 'gdate',
          }, {
            prop: "item",
          }, {
            prop: 'variety'
          }, {
            prop: 'specification'
          }, {
            prop: 'quantity'
          }, {
            prop: 'supplyprice'
          }, {
            prop: 'money'
          }, {
            prop: 'accountbalance'
          }],

        ],
        tdStickyStyle: 'background-color:#99ffff;border:1px solid',
        tdStyle: 'background-color:$fff;'
      },
      colOption: [90, 90, 90, 90, 100, 140, 90, 60]
    },
    tableData: [],
    date: '',
    countPrice: 0.00,
    isShow: true,
    bottomLift: app.globalData.bottomLift,
    tableColumns: [{
        title: "日期",
        key: "gdate",
      }, {
        title: "项目",
        key: "item",
      }, {
        title: "品种",
        key: "variety",
      }, {
        title: "规格",
        key: "specification",
      }, {
        title: "份数",
        key: "quantity",
      }, {
        title: "供货价",
        key: "supplyprice",
      }, {
        title: "金额",
        key: "money",
      },
      {
        title: "余额",
        key: "accountbalance",
      }
    ],
    getListLoading: true,
  },

  // 时间改变
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  tabChange(e) {
    switch (e.detail.index) {
      case 0:
        wx.redirectTo({
          url: '../myProduct/myProduct',
        })
        break;
      case 1:

        break;
      case 2:
        wx.redirectTo({
          url: '../generalJournal/generalJoumal',

        })
        break;
      case 3:
        wx.redirectTo({
          url: '../purchaseQuery/purchaseQuery',
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
        break;
      default:
        break;
    }
  },

  // 订单打印
  orderPrinting() {
    let that = this
    tr("/getUserInfo").then(function (res) {
      // 把文件下载到一个临时文件中
      const downloadTask = wx.downloadFile({
        url: app.globalData.apiUrl + '/orderPrinting?date=' + that.data.date + "&id=" + res.data.id,
        success: function (res) {
          console.log("下载完成");
          console.log(res);
          wx.openDocument({
            fileType: "xlsx",
            showMenu: true,
            filePath: res.tempFilePath,
            success: function (res) {
              console.log('打开文档成功')
            },
            fail: function (e) {
              console.log(e);
            }
          })
        }
      })

      // 监控下载过程
      downloadTask.onProgressUpdate(function (res) {
        console.log('下载进度', res.progress)
        console.log('已经下载的数据长度', res.totalBytesWritten)
        console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
      })
    })

  },

  // 查询
  search() {
    let that = this
    this.getGeneralDailyOrder()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    var date = new Date();; //获取完整的年份(4位)
    this.setData({
      date: `${date.getFullYear()}-${date.getMonth()+1}-${ date.getDate()}`,
      endDate: `${date.getFullYear()}-${date.getMonth()+1}-${ date.getDate()}`,
    })
    this.getGeneralDailyOrder()
  },

  // 获取订单信息
  getGeneralDailyOrder() {
    let that = this
    this.setData({
      getListLoading: true
    })
    tr("/getGeneralDailyOrder", {
      date: this.data.date
    }).then(function (res) {
      that.setData({
        getListLoading: false
      })
      if (res.data.data.length == 0) {
        that.setData({
          isShow: true,
          tableData: res.data.data,
          countPrice: res.data.countPrice
        })
      } else {
        that.setData({
          isShow: false
        })
        that.setData({
          tableData: res.data.data,
          countPrice: res.data.countPrice
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    setTimeout(() => {
      let query = wx.createSelectorQuery();
      query.select('.footer').boundingClientRect(rect => {
        let height = rect.height;
        this.setData({
          footerHeight: height
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