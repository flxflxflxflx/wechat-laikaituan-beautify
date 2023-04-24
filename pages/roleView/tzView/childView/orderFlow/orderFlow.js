import tr from "../../../../../utils/tokenRequest"
import Big from "../../../../../utils/bignumber"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imghref: app.globalData.apiUrl,
    tableOption: {
      headOption: {
        row: [
          [{
              value: '序号',
              sticky: true,
            }, {
              value: '编号',
              sticky: true,
            },
            {
              value: '日期',
              sticky: true,
            },
            {
              value: '客户',
              sticky: true,
            },

            {
              value: '项目',
              sticky: true,
            },
            {
              value: '品种',
              sticky: true,
            },
            {
              value: '重量',
              sticky: true,
            },
            {
              value: '数量',
              sticky: true,
            },
            {
              value: '团购价格',
              sticky: true,
            },
            {
              value: '订单金额',
              sticky: true,
            }
          ]
        ],
        thStickyStyle: 'background-color:#007f80;font-size:10rpx;',
        thStyle: 'background-color:#428bca;'
      },
      bodyOption: {
        row: [
          [{
              prop: 'codeId',
            }, {
              prop: "ordernum",
            }, {
              prop: 'paytime'
            }, {
              prop: 'nickname'
            }, {
              prop: 'productTitle'
            }, {
              prop: 'pinZhong'
            }, {
              prop: 'guiGe'
            }, {
              prop: 'num',
            },
            {
              prop: 'price',
            },
            {
              prop: 'countPrice',
            },
          ],

        ],
        tdStickyStyle: 'background-color:#99ffff;border:1px solid',
        tdStyle: 'background-color:$fff;'
      },
      colOption: [90, 90, 90, 90, 100, 140, 90, 60, 60, 60]
    },
    tableData: [],
    date: '',
    // 总金额
    countPrice: 0,
    bottomLift: app.globalData.bottomLift,
    isShow: false,
  },


  // 时间改变
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },

  // 导出账单
  exportExcel() {
    let userid;
    let that = this
    tr("/getUserInfo").then(function (res) {
      userid = res.data.id
      // 把文件下载到一个临时文件中
      const downloadTask = wx.downloadFile({
        url: app.globalData.apiUrl + '/geTztOrderFlow?userid=' + userid + "&date=" + that.data.date,
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
    })
  },

  // 查询
  search() {
    this.getOrderFlow();
  },

  getOrderFlow() {
    let that = this
    wx.showLoading({
      title: '加载中...',
    })
    tr("/getOrderFlow", {
      date: this.data.date
    }).then(function (res) {
      wx.hideLoading()
      if (res.data.length == 0) {
        that.setData({
          isShow: true,
          tableData: res.data
        })
      } else {
        that.setData({
          isShow: false
        })
        let countPrice = 0;
        res.data.forEach(function (item) {
          countPrice = Big(item.countPrice).plus(Big(countPrice)).toFixed(2);
        })
        that.setData({
          tableData: res.data,
          countPrice
        })
      }
    })

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
    // 获取流水信息
    this.getOrderFlow()
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
      query.select('.header').boundingClientRect(rect => {
        let height = rect.height;
        this.setData({
          footerHeight: this.data.footerHeight + height
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