import tr from "../../../../../../../../utils/tokenRequest"
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 商品标题--输入的值
    productTitle: '',
    // 商品标题--最大的字数限制
    maxTextNum: 90,
    // 商品标题--输入的字数
    inputNumber: 0,
    // 商品标题--商品属性描述
    commodityAttribute: '',
    // 商品标题--图片列表
    Titlefiles: [],
    // 商品类目--选中的值
    commodityCategorySelectedValue: [],
    // 商品类目--选中的值
    customIndex: [],
    // 商品规格--展示的数组
    productSpecificationsOnlyArray: [],
    // 商品规格--选中第几个
    productSpecificationsCustomIndex: 0,
    // 商品详情--商品细节
    productDetails: '',
    // 商品详情--上传列表
    imgList: [],
    // 商品详情--上传视频
    src: "",
    // 商品规格--重量
    weightNum: "",
    // 商品库存--输入的值
    commodityInventory: '',
    // 供货价--输入的值
    supplyPrice: '',
    // 供应商--建议价格
    recommendedprice: '',
    // 服务器url
    href: app.globalData.apiUrl + "/uploads",
    // 错误提示信息
    error: "",
    bottomLift:app.globalData.bottomLift
  },

  // 删除商品
  onDetele() {
    let that = this
    tr("/delProduct", {
      id: that.data.productId
    }).then(function (res) {
      if (res.data.status == 1) {
        wx.showToast({
          title: '删除成功',
        })
      }
    })
  },

  /**
   * 商品详情--上传视频,图片
   */
  // 点击添加选择
  chooseSource: function () {
    var _this = this;
    wx.showActionSheet({
      itemList: ["拍照", "从相册中选择"],
      itemColor: "#000000",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            _this.imgWShow("camera") //拍照
          } else if (res.tapIndex == 1) {
            _this.imgWShow("album") //相册
          }
        }
      }
    })
  },
  // 点击调用手机相册/拍照
  imgWShow: function (type) {
    var _this = this;
    let len = 0;
    if (_this.data.imgList != null) {
      len = _this.data.imgList.length
    } //获取当前已有的图片
    wx.chooseMedia({
      count: 4 - len, //最多还能上传的图片数,这里最多可以上传5张
      mediaType: ['image'],
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图,默认二者都有
      sourceType: [type], //可以指定来源是相册还是相机, 默认二者都有
      success: function (res) {
        wx.showToast({
          title: '正在上传...',
          icon: "loading",
          mask: true,
          duration: 1000
        })
        // 返回选定照片的本地文件路径列表,tempFilePaths可以作为img标签的scr属性显示图片
        var imgList = []
        for (let index = 0; index < res.tempFiles.length; index++) {
          imgList.push(res.tempFiles[index].tempFilePath)
        }
        console.log(res.tempFiles[0].tempFilePath);
        let tempFilePathsImg = _this.data.imgList
        // 获取当前已上传的图片的数组
        var tempFilePathsImgs = tempFilePathsImg.concat(imgList)
        _this.setData({
          imgList: tempFilePathsImgs
        })
      },
      fail: function () {
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
        return;
      }
    })
  },
  // 预览图片
  previewImg: function (e) {
    let index = e.target.dataset.index;
    let _this = this;
    wx.previewImage({
      current: _this.data.imgList[index],
      urls: _this.data.imgList
    })
  },
  // 点击删除图片
  deleteImg: function (e) {
    var _this = this;
    var imgList = _this.data.imgList;
    var index = e.currentTarget.dataset.index; //获取当前点击图片下标
    wx.showModal({
      title: '提示',
      content: '确认要删除该图片吗?',
      success: function (res) {
        if (res.confirm) {
          console.log("点击确定了")
          imgList.splice(index, 1);
        } else if (res.cancel) {
          console.log("点击取消了");
          return false
        }
        _this.setData({
          imgList
        })
      }
    })
  },
  // 点击删除视频
  deleteVideo: function (e) {
    var _this = this;
    var src = _this.data.src;
    var index = e.currentTarget.dataset.index; //获取当前点击图片下标
    wx.showModal({
      title: '提示',
      content: '确认要删除该视频吗?',
      success: function (res) {
        if (res.confirm) {
          console.log("点击确定了")
          var unsrc = '';
          _this.setData({
            src: unsrc
          })
        } else if (res.cancel) {
          console.log("点击取消了");
          return false
        }
      }
    })
  },
  // 图片  视频 选择框
  actioncnt: function () {
    var _this = this;
    wx.showActionSheet({
      itemList: ['图片', '视频'],
      success: function (res) {
        if (res.tapIndex == 0) {
          _this.chooseSource()
        }
        if (res.tapIndex == 1) {
          _this.chooseVideo()
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  // 选择视频
  chooseVideo: function () {
    var _this = this;
    wx.chooseMedia({
      mediaType: "video",
      count: 1,
      success: function (res) {
        // 判断是否是否在30M
        // 图片大小
        let size = (res.tempFiles[0].size);
        console.log(size);
        if (size > 31457280) {
          // 大于30MB
          wx.showToast({
            title: '视频大于30M',
            icon: "error"
          })
        } else {
          _this.setData({
            src: res.tempFiles[0].tempFilePath
          })
        }
      }
    })
  },
  // 上传视频 目前后台限制最大100M, 以后如果视频太大可以选择视频的时候进行压缩
  uploadvideo: function () {
    var src = this.data.src;
    wx.uploadFile({
      url: '',
      methid: 'POST', // 可用可不用
      filePath: src,
      name: 'files', // 服务器定义key字段名称
      header: app.globalData.header,
      success: function () {
        console.log('视频上传成功')
      },
      fail: function () {
        console.log('接口调用失败')
      }
    })
  },



  /**
   * 商品标题
   */
  // 商品标题发生改变
  productTitleChange(e) {
    console.log("商品标题发生改变");
    this.setData({
      inputNumber: e.detail.cursor
    })
  },

  /**
   * 商品规格
   * */
  // 商品规格选中值发生改变
  bindProductSpecificationsPickerChange(e) {
    this.setData({
      productSpecificationsCustomIndex: e.detail.value
    })
  },

  /**
   * 商品主图
   */
  // 商品主图:删除图片
  TitledeleteImg(e) {
    console.log(e.detail);
    this.setData({
      Titlefiles: this.data.Titlefiles.splice(1, 1)
    })
  },
  // 商品主图:过滤图片
  TitleselectFile(files) {
    // 返回false可以阻止某次文件上传
  },
  // 商品主图:上传图片
  TitleuploadFile(files) {
    let result = this.data.Titlefiles
    result.push({
      url: files.tempFilePaths[0]
    })
    this.setData({
      Titlefiles: result
    })
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      // setTimeout(() => {
      // resolve({
      //   urls: this.data.files
      // })
      // reject(new Error('some error'))
      // }, 1000)
    })
  },
  // 商品主图:图片上传错误
  TitleuploadError(e) {
    console.log('upload error', e.detail)
  },
  // 商品主图:图片上传成功
  TitleuploadSuccess(e) {
    console.log('upload success', e.detail)
  },


  // 商品重量
  weightChange(e) {
    this.setData({
      weightNum: e.detail.value
    })
  },

  /**
   * 商品类目选中的值
   */
  commodityCategorySelectedValue(e) {
    this.setData({
      commodityCategorySelectedValue: e.detail
    })
  },

  /**
   * 提交表单
   */
  onSubmit() {
    let that = this;
    let {
      // 商品标题 
      productTitle,
      // 商品属性描述
      commodityAttribute,
      // 商品主图
      Titlefiles,
      // 商品类目
      commodityCategorySelectedValue,
      // 商品细节
      productDetails,
      // 商品详情视频
      src,
      // 商品详情图片列表
      imgList,
      // 商品规格--重量
      weightNum,
      // 商品规格--展示的数组
      productSpecificationsOnlyArray,
      // 商品规格--选中第几个
      productSpecificationsCustomIndex,
      // 商品库存--输入的值
      commodityInventory,
      // 供货价--输入的值
      supplyPrice,
      // 供应商--建议价格
      recommendedprice,
    } = this.data;

    if (productTitle.length == 0) {
      that.setData({
        error: "请输入商品标题"
      })
    } else if (Titlefiles.length == 0) {
      that.setData({
        error: "请添加商品主图"
      })
    } else if (commodityCategorySelectedValue.length == 0) {

      that.setData({
        error: "请选择商品类目"
      })
    } else if (productDetails == "") {

      that.setData({
        error: "请输入商品细节,购买通知等"
      })
    } else if (imgList.length == 0 && src == '') {
      that.setData({
        error: "请添加商品图片视频"
      })
    }else if(weightNum == ""){
      that.setData({
        error: "请输入商品重量"
      })
    } else if (commodityInventory == "") {

      that.setData({
        error: "请输入库存"
      })
    } else if (supplyPrice == "") {

      that.setData({
        error: "请输入供货价"
      })
    } else if (recommendedprice == "") {
      that.setData({
        error: "请输入建议价格"
      })
    } else {
      wx.showLoading({
        title: '更新中...',
      })
      var fs = wx.getFileSystemManager()
      // 转码
      if (Titlefiles.length) {
        Titlefiles = Titlefiles.map((item) => {
          let base64 = '';
          let url = item.url.replace(that.data.href, '')
          // 转码
          try {
            base64 = fs.readFileSync(url, "base64")
          } catch (e) {
            base64 = null
          }
          return {
            url: url,
            base64
          }
        })
      }

      // 详情图片数组转码
      let imgListTemp = [];
      imgList.map((item) => {
        let base64 = '';
        // 转码
        try {
          base64 = fs.readFileSync(item, "base64")
        } catch (e) {
          base64 = null
        }
        imgListTemp.push({
          url: item.replace(that.data.href, ""),
          base64
        });
      });

      // 更新商品信息
      tr("/updeteProductInfo", {
        // 商品id
        productId: that.data.productId,
        // 商品标题 
        productTitle,
        // 商品属性描述
        commodityAttribute,
        // 商品主图
        Titlefiles,
        // 商品类目
        commodityCategorySelectedValue,
        // 商品细节
        productDetails,
        // 商品规格--重量
        weightNum,
        // 商品详情视频
        // src,
        // 商品详情图片列表
        imgList: imgListTemp,
        // 商品规格--展示的数组
        productSpecificationsOnlyArray: productSpecificationsOnlyArray ? productSpecificationsOnlyArray[productSpecificationsCustomIndex] : [],
        // 商品规格--选中第几个
        // 商品库存--输入的值
        commodityInventory,
        // 供货价--输入的值
        supplyPrice,
        // 供应商--建议价格
        recommendedprice,
      }).then(function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.data.msg,
        })
        if (src != '') {
          if (new RegExp(that.data.href).test(src)) {
            console.log("没有视频需要更新");
          } else {
            if (!that.submitDvideo(src, res.data.id)) {
              wx.showToast({
                title: '视频发布失败',
                icon: 'error'
              })
              return;
            }
          }

        } else {
          tr("/updeteFile", {
            id: res.data.id,
            dvideo: ''
          })
        }
        wx.showToast({
          title: res.data.msg,
        })
      }, function (err) {
        wx.hideLoading();
        wx.showToast({
          title: '发布失败',
          icon: "error"
        })
      });
    }


  },


  /**
   * 提交商品视频
   */
  async submitDvideo(src, id) {
    console.log(src, "=======");
    let that = this
    await wx.uploadFile({
      //请求后台的路径
      url: that.data.href.replace(/\/uploads/, '') + '/updeteFile',
      header: { //请求头
        "Content-Type": "application/json",
        "Authorization": wx.getStorageSync('access_token'),
      },
      formData: {
        id
      },
      //小程序本地的路径
      filePath: src,
      //后台获取我们图片的key
      name: 'dvideo',
      success: function (res) {
        //上传成功
        return true;
      },
      fail: function (res) {
        return false;
      },
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options.id);
    let that = this
    this.setData({
      TitleselectFile: this.TitleselectFile.bind(this),
      TitleuploadFile: this.TitleuploadFile.bind(this),
      productId: options.id
    })
    // 获取商品分类
    tr("/getProductClass").then(function (res) {
      let custm = [];
      let data = res.data
      data.map((item) => {
        // 添加第一项
        if (item.parent_id == 0) {
          // 添加子项
          data.map((item2) => {
            if (item.id == item2.parent_id) {
              // 提那家子项
              data.map((item3) => {
                if (item2.id == item3.parent_id) {
                  let t1 = item2.product || []
                  t1.push(item3)
                  item2.product = t1
                }
              })
              let t = item.dept || []
              t.push(item2)
              item.dept = t
            }
          })
          custm.push(item);
        }
      })
      // 将解析好的数据传递给组件
      that.setData({
        customArray: custm
      })
    }, function (err) {
      console.log(err);
    })

    // 获取商品规格
    tr("/getProductSpecifications").then(function (res) {
      let temp = res.data;
      that.setData({
        productSpecificationsOnlyArray: temp
      })
    }, function (err) {})
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    // 获取商品信息
    tr("/getProductInfoId", {
      id: options.id
    }).then(function (res) {
      wx.hideLoading()
      // 遍历商品分类 
      let productClass = that.mapProductClass(res.data.category_id);
      let dimgslist = res.data.dimgslist.map((item) => {
        return that.data.href + item
      })
      // 设置商品信息
      that.setData({
        // 商品标题--输入的值
        productTitle: res.data.title,
        // 商品标题--输入的字数
        inputNumber: res.data.title.length,
        // 商品标题--商品属性描述
        commodityAttribute: '',
        // 商品标题--图片列表
        Titlefiles: [{
          url: that.data.href + res.data.simg
        }],
        // 商品类目--选中的值
        commodityCategorySelectedValue: productClass.commodityCategorySelectedValue,
        // 选中的值
        customIndex: productClass.customIndex,
        // 商品规格--选中第几个
        productSpecificationsCustomIndex: res.data.specification_id - 1,
        // 商品详情--商品细节
        productDetails: res.data.details,
        // 商品详情--上传列表
        imgList: dimgslist,
        // 商品详情--上传视频
        src: res.data.dvideo ? that.data.href + res.data.dvideo : '',
        // 商品规格--重量
        weightNum: res.data.weight,
        // 商品库存--输入的值
        commodityInventory: res.data.stock,
        // 供货价--输入的值
        supplyPrice: res.data.supplyprice,
        // 供应商--建议价格
        recommendedprice: res.data.recommendedprice
      })
    })
  },

  /**
   * 遍历商品分类
   */
  mapProductClass(id) {
    let a
    this.data.customArray.forEach(function (item, index) {
      item.dept.forEach(function (item2, index2) {
        item2.product.forEach(function (item3, index3) {
          if (item3.id == id) {
            a = {
              commodityCategorySelectedValue: [item, item2, item3],
              customIndex: [index, index2, index3]
            }
          }
        })
      })
    });
    return a
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