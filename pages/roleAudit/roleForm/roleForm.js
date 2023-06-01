// pages/roleAudit/roleForm/roleForm.js
import tr from "../../../utils/tokenRequest"
const app = getApp()
var timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepList: [{
      name: '申请'
    }, {
      name: '审核中'
    }, {
      name: '审核通过'
    }],
    // 设置审核状态是否成功
    isAuditSuccess: true,
    stepNum: 1, //当前的步数
    // 用户权限
    permissions: [],
    permissionsImages: {
      // 供应商图片
      gysImage: [],
      // 团长图片
      tzImage: [],
      // 配送员图片
      psyImage: [],
      // 提货站图片
      thzImage: [],
      // 分拣员图片
      fjyImage: [],
    },
    // 用户备用电话
    mobile: '',
    // 界面是否可以操作
    isOperation: true
  },
  GYSuploadFile(e) {
    this.setData({
      'permissionsImages.gysImage': e.detail
    })
  },
  TZuploadFile(e) {
    this.setData({
      'permissionsImages.tzImage': e.detail
    })
  },
  PSYuploadFile(e) {
    this.setData({
      'permissionsImages.psyImage': e.detail
    })
  },
  THZuploadFile(e) {
    this.setData({
      'permissionsImages.thzImage': e.detail
    })
  },
  FJYuploadFile(e) {
    this.setData({
      'permissionsImages.fjyImage': e.detail
    })
  },

  // 点击申请
  submitForm() {
    console.log(this.data.permissionsImages);
    this.pictureToDase64();
    let that = this
    //  必须有一个资格申请
    let result = this.data.permissionsImages
    // 是否填写
    let isTX = true;
    for (let index in result) {
      if (result[index] != 0) {
        isTX = false
      }
    }
    if (isTX) {
      wx.showToast({
        title: '必须填写一个',
        icon: 'error'
      })
      return;
    }

    // 判断是否配备电话存在
    if (!this.data.mobileFormat) {
      if (!this.data.mobile) {
        wx.showToast({
          title: '请填写电话',
        })
        return;
      }
      wx.showToast({
        title: '电话格式有误',
      })
      return;
    }
    // 图片转成base64格式
    let resultBase64 = this.pictureToDase64();
    wx.showLoading({
      title: '申请中...',
      mask: true
    })

    this.debounce(function () {
      // 发送申请权限材料
      tr("/applyPermission", {
        mobile: that.data.mobile,
        resultBase64
      }).then(function (res) {
        wx.hideLoading()
        wx.showToast({
          title: res.data.msg,
          mask: true,
          success() {
            setTimeout(function () {
              // 跳转到首页
              wx.redirectTo({
                url: '../../roleLogin/roleLogin',
              })
            }, 2500)
          }
        })
        // 申请成功 刷新页面
        that.onLoad()

      }, function (err) {});
    }, 2000)();
  },

  // 防抖
  debounce: function (func, wait) {
    return () => {
      timer && clearTimeout(timer);
      timer = setTimeout(func.bind(this), wait);
    };
  },

  // 图片转换格式
  pictureToDase64() {
    var fs = wx.getFileSystemManager()
    let result = this.data.permissionsImages
    // 转换完成的数组
    let resultBase64 = []
    for (let item in result) {
      let temp = {};
      temp["permissionImage"] = item
      // 如果图片有的话
      if (result[item].length != 0) {
        // 定义base64数组
        let appalyImage = []
        for (let i = 0; i < result[item].length; i++) {
          let avatar = null
          // 照片属性
          let img = {}
          // 如果不是后台图片
          if (!result[item][i].isBackend) {
            // 转码
            try {
              avatar = fs.readFileSync(result[item][i].url, "base64")
            } catch (e) {
              avatar = null
            }
            // 如果base64转换成功放进数组
            if (avatar != null && avatar != '') {
              img["url"] = result[item][i].url
              img["isBackend"] = result[item][i].isBackend
              img["base64"] = avatar
              appalyImage.push(img);
            } else {
              wx.showLoading({
                title: '图片上传错误',
                icon: "none"
              })
            }
          } else {
            // 是后台图片 把后台路径截掉
            img["url"] = result[item][i].url.replace(/^http:\/\/127.0.0.1:8000/g, "")
            img["isBackend"] = result[item][i].isBackend
            appalyImage.push(img);
          }
        }
        temp["appalyImage"] = appalyImage
        resultBase64.push(temp);
      }
    }
    return resultBase64
  },

  //mobileFormat表示输入是都符号电话号码规则
  mobileInput(e) {
    let value = e.detail.value.replace(/\D/g, '')
    this.setData({
      mobile: value,
    })
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (this.data.mobile.length == 0) {
      wx.showToast({
        title: '输入的手机号为空，请重新输入！',
        icon: 'none',
        duration: 1500
      })
      this.setData({
        mobileFormat: false,
      })

    } else if (this.data.mobile.length < 11) {
      wx.showToast({
        title: '手机号长度有误，请重新输入！',
        icon: 'none',
        duration: 1500
      })
      this.setData({
        mobileFormat: false,
      })

    } else if (!myreg.test(this.data.mobile)) {
      wx.showToast({
        title: '手机号有误，请重新输入！',
        icon: 'none',
        duration: 1500
      })
      this.setData({
        mobileFormat: false,
      })

    } else {
      this.setData({
        mobileFormat: true,
      })
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 向后台请求角色没有申请的权限
    let that = this
    tr("/getUserNotPermissions").then(function (res) {
      // 判断是否有权限,没有权限提示跳转到权限申请页面
      that.setData({
        permissions: res.data.permissions
      })
    }, function (err) {
      wx.showToast({
        title: err,
        icon: "error"
      })
    })

    // 请求备用电话
    tr("/getUserPermissionsImage", {
      // 获取这个的图片
      mark: "mobile"
    }).then(function (res) {
      that.setData({
        mobile: res.data.msg[0]["mobile"]
      })
      let e = {};
      e.detail = {}
      e.detail.value = res.data.msg[0]["mobile"]
      that.mobileInput(e);

    }, function (err) {
      wx.showToast({
        title: err,
        icon: "error"
      })
    })

    // 请求有没有审核状态
    tr("/getAuditStatus").then(function (res) {

      // 审核中界面不能操作
      if (res.data.status == 2 || res.data.status == 3) {
        that.setData({
          stepNum: res.data.status
        })
        that.setData({
          isOperation: false,
          // 设置审核变审核成功
          isAuditSuccess: true
        })
      } else if (res.data.status == 4) {
        // 审核没有通过
        that.setData({
          stepNum: 2,
          // 设置审核变审核失败
          isAuditSuccess: false
        })
      } else {
        that.setData({
          stepNum: res.data.status,
          // 设置审核变审核成功
          isAuditSuccess: true
        })
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