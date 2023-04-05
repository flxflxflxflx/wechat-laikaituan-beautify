// pages/components/dialog.js
import request from "../../../../utils/request"
const app = getApp();
Component({
  /** 
   * 组件的属性列表
   */
  properties: {
    userPhoneCode: String
  },

  // 监听
  observers: {
    'userPhoneCode': function (val) {
      this.setData({
        phoneCode: val
      })
    }
  },


  /**
   * 组件的初始数据
   */
  data: {
    showIndex: null, //打开弹窗的对应下标
    height: '', //屏幕高度
    // 用户头像
    avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
    // 用户昵称
    nickname: "",
    // 用户名和头像是否填写完成
    istxwc: false,
    // 错误提示消息
    error: "",
    // 是否显示提示信息
    isError: false,
    // 用户手机号申请code
    phoneCode: ''
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      var that = this;
      // 动态获取屏幕高度
      wx.getSystemInfo({
        success: (result) => {
          that.setData({
            height: result.windowHeight
          });
        },
      })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 获取头像方法
    getChooseAvatar(e) {
      console.log(e);
      this.setData({
        avatarUrl: e.detail.avatarUrl
      })

      if (this.data.avatarUrl != '' && this.data.nickname != '') {
        // 获取完
        this.setData({
          istxwc: true
        })
      } else {
        this.setData({
          istxwc: false
        })
      }
    },
    getNickName() {
      if (this.data.avatarUrl != '' && this.data.nickname != '') {
        // 获取完
        this.setData({
          istxwc: true
        })
      } else {
        this.setData({
          istxwc: false
        })
      }
    },
    // 点击完成
    done() {
      var fs = wx.getFileSystemManager()
      console.log(this.data.nickname, this.data.avatarUrl, this.data.phoneCode);
      let avatar;
      try {
        avatar = fs.readFileSync(this.data.avatarUrl, "base64")
      } catch (e) {
        avatar = null
      }
      if (this.data.istxwc == true) {
        let that = this
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        // 发送后台进行手机号注册
        wx.login({
          success(res) {
            if (res.code) {
              //发起网络请求
              request(
                '/auth/login', {
                  code: res.code,
                  // 获取手机号凭证,5min只能获取一次
                  phoneCode: that.data.phoneCode,
                  avatarImage: {
                    avatarUrl: that.data.avatarUrl,
                    avatardb64: avatar
                  },
                  nickname: that.data.nickname
                }
              ).then(function (response) {
                wx.hideLoading()
                if (response.code == "406") {
                  wx.showToast({
                    title: response.msg,
                    mask: true,
                    icon: "error",
                    duration: 1500
                  })
                  return;
                }
                wx.showToast({
                  title: response.msg,
                  mask: true,
                  icon: "success",
                  duration: 1500
                })
                //将token保存到storage中
                console.log(response);
                try {
                  if (response.access_token != undefined) {
                    wx.setStorageSync('access_token', response.access_token);
                    wx.setStorageSync('nick_name', response.nickname);
                    wx.setStorageSync('avatar', app.globalData.apiUrl + response.avatar);
                    if (wx.getStorageSync('selectListData')) {
                      wx.redirectTo({
                        url: '/pages/roleView/tzView/childView/ktView/childView/commodityPurchase/commodityPurchase?selectListData=' + wx.getStorageSync('selectListData'),
                      })
                    } else {
                      wx.redirectTo({
                        url: "/pages/roleLogin/roleLogin"
                      });
                    }
                  } else {
                    wx.showToast({
                      title: '登录错误',
                      icon: "error"
                    })
                  }

                } catch (e) {
                  console.log(e);
                  console.log('storage数据写入失败！');
                };
                // 接收返回的open_id,存到缓存
                // wx.setStorageSync('open_id', response)
                console.log(that.data.userPhoneCode);
                // console.log(response);
              }, function (err) {
                wx.showToast({
                  title: '请检查网络',
                  icon: 'error',
                  duration: 1500
                })
                console.error("请求失败" + err);
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        })

      } else {
        // 请填写完成
        if (this.data.avatarUrl == '') {
          this.setData({
            error: "请上传头像",
            isError: true
          })
        } else if (this.data.nickname == '') {
          this.setData({
            error: "请输入昵称",
            isError: true
          })
        }
      }
    },
    // 打开弹窗
    openPopup(e) {
      var index = e.currentTarget.dataset.index;
      this.setData({
        showIndex: index
      })
    },
    //关闭弹窗
    closePopup() {
      this.setData({
        showIndex: null
      })
    },
  },

})