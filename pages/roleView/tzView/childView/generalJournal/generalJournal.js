import tr from "../../../../../utils/tokenRequest"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
        text: '开团记录',
        iconPath: "/static/image/openTuan.png",
        selectedIconPath: "/static/image/openTuan2.png",
        // badge: '8'
      },
      {
        text: '余额提现',
        iconPath: "/static/image/yue2.png",
        selectedIconPath: "/static/image/yue.png",
      },
      {
        text: '订单流水',
        iconPath: "/static/image/orderFlow.png",
        selectedIconPath: "/static/image/orderFlow2.png",
        // dot: true
      },
      {
        text: '总流水账',
        iconPath: "/static/image/caigou.png",
        selectedIconPath: "/static/image/caigou2.png",
        // dot: true
      },
    ],
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
              value: '单位',
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
            },
            {
              value: '账户余额',
              sticky: true,
            },
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
              prop: 'gdate'
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
            {
              prop: 'accountbalance',
              isLastSticky: true
            }
          ],

        ],
        tdStickyStyle: 'background-color:#99ffff;border:1px solid',
        tdStyle: 'background-color:$fff;'
      },
      colOption: [90, 90, 90, 90, 100, 140, 90, 60, 60, 60, 60]
    },
    tableData: [],
    // 总金额
    countPrice: 0,
    isShow: false,
    bottomLift: app.globalData.bottomLift
  },

  tabChange(e) {
    switch (e.detail.index) {
      case 0:
        wx.redirectTo({
          url: '../jszxView/jszxView',
        })
        break;
      case 1:
        wx.redirectTo({
          url: '../balanceWithdrawal/balanceWithdrawal',
        })
        break;
      case 2:
        wx.redirectTo({
          url: '../orderFlow/orderFlow',
        })
        break;
      case 3:

        break;
      default:
        break;
    }
  },

  // 导出账单
  exportExcel() {
    let userid;
    tr("/getUserInfo").then(function (res) {
      userid = res.data.id
      // 把文件下载到一个临时文件中
      const downloadTask = wx.downloadFile({
        url: app.globalData.apiUrl + '/getTzGeneralJournalExcel?userid=' + userid,
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

    // 监控下载过程
    downloadTask.onProgressUpdate(function (res) {
      console.log('下载进度', res.progress)
      console.log('已经下载的数据长度', res.totalBytesWritten)
      console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    // 获取流水信息
    tr("/getTzGeneralJournal").then(function (res) {
      if (res.data.data.length == 0) {
        that.setData({
          isShow: true
        })
      }
      that.setData({
        tableData: res.data.data,
        countPrice: res.data.countPrice
      })
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