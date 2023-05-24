import request from "../../utils/request"
// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    // 是否获取手机号
    isGetPhone: false,
    // 手机号申请code
    userPhoneCode: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // 生命周期函数，页面加载时
  onLoad(options) {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
    console.log("==================");
    var that = this;
    console.log(options.isXFZ, "dddddddddddd");
    if (options.isXFZ) {
      // 从消费者界面来的
      wx.setStorageSync('selectListData', options.selectListData)
    }
    //如果不能处在token，返回登录页面
    if (!wx.getStorageSync('access_token')) {
      console.log("没有token");
      return;
    }
    //获取用户信息 
    wx.request({
      method: "POST",
      url: app.globalData.apiUrl + '/getUserInfo',
      header: { //请求头
        "Content-Type": "application/json",
        "Authorization": wx.getStorageSync('access_token'),
      },
      dataType: 'json',
      success: function (res) {
        if (typeof res.header.Authorization != 'undefined') { //如果有token返回，将最新的token存入缓存。
          wx.setStorageSync('access_token', res.header.Authorization);
        }
        if (res.data.code == '401') {
          // 用户token过期,需要重新登录
          wx.showToast({
            title: '登录过期,请重新登录',
            icon: "none",
            mask: true
          })
          return;
        }

        // 保存用户信息到storage
        try {
          if (res.data.code == 200) {
            wx.setStorageSync('nick_name', res.data.nickname);
            wx.setStorageSync('avatar', app.globalData.apiUrl + res.data.avatar);
            wx.showToast({
              title: '您已经登录',
            })
            setTimeout(() => {
              if (wx.getStorageSync('selectListData')) {
                console.log(wx.getStorageSync('selectListData'));
                wx.redirectTo({
                  url: '/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=' + wx.getStorageSync('selectListData'),
                })
              } else {
                wx.redirectTo({
                  url: "/pages/roleLogin/roleLogin"
                });
              }
            }, 1500);

          } else {
            if (res.statusCode == 401) {
              wx.showToast({
                title: '登录过期,请重新登录',
                icon: "none",
                mask: true
              })
            }
          }
        } catch (e) {
          console.log(e);
          console.log('storage数据写入失败！');
        };
        //一些操作
      },
      fail: function (err) {
        console.log(err);
        wx.showToast({
          title: '请求失败',
        });
        // wx.redirectTo({
        //   url: '/pages/roleLogin/roleLogin'
        // });
        return;
      }, //请求失败
      complete: function () {} //请求完成后执行的函数
    })

  },

  // 判断是否注册
  isRegist(userPhoneCode) {
    let that = this
    // 发送后台进行手机号注册
    wx.login({
      success(res) {
        if (res.code) {
          wx.showLoading({
            title: '加载中...',
            mask: true
          })
          //发起网络请求
          request(
            '/auth/isRegist', {
              code: res.code,
            }
          ).then(function (response) {
            wx.hideLoading()
            // 是否注册
            if (response.code == 405) {
              // 进行注册
              that.setData({
                isGetPhone: true,
                userPhoneCode: userPhoneCode
              })
              return
            }

            wx.showToast({
              title: response.msg,
              mask: true,
              icon: "success",
              duration: 1500
            })
            //将token保存到storage中
            try {
              if (response.access_token != undefined) {
                wx.setStorageSync('access_token', response.access_token);
                wx.setStorageSync('nick_name', response.nickname);
                wx.setStorageSync('avatar', app.globalData.apiUrl + response.avatar);
                if (wx.getStorageSync('selectListData')) {
                  wx.redirectTo({
                    url: '/pages/roleLogin/childView/commodityPurchase/commodityPurchase?selectListData=' + wx.getStorageSync('selectListData'),
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
      },
      fail: function (err) {
        wx.showToast({
          title: '网络失败',
        })
      }
    })
  },

  // 获取手机号
  handleGetPhoneNumber(e) {
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      this.isRegist(e.detail.code);
    } else {
      // 没有获得手机号
      this.setData({
        isGetPhone: false
      })
    }
  },


  getUserProfile(e) {
    console.log(e.detail);
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        var nick_name = res.userInfo.nickName;
        var avator = res.userInfo.avatarUrl;
        //然后授权登录
        wx.login({
          success(res) {
            if (res.code) {
              //发起网络请求
              wx.request({
                url: 'https://www.***.com/api/v1/user/authorizations/login',
                method: 'POST',
                header: { //请求头
                  "Content-Type": "application/json"
                },
                dataType: 'json',
                data: {
                  code: res.code,
                  nickName: nick_name,
                  avator: avator
                },
                success: function (res) {
                  //将token保存到storage中
                  console.log(res.data);
                  try {
                    wx.setStorageSync('access_token', res.data.access_token);
                    wx.setStorageSync('nick_name', nick_name);
                    wx.setStorageSync('avator', res.avator);
                    wx.switchTab({
                      url: '../index/index',
                    });
                  } catch (e) {
                    console.log('storage数据写入失败！');
                  };
                },
                fail: function (err) {
                  console.log('请求失败');
                }, //请求失败
                complete: function () {} //请求完成后执行的函数
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        })


      }
    })

  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    console.log(this.userInfo);
  },

  // 获取用户信息的回调
  handleGetUserInfo(e) {

  },


  handleGetUserPhone() {

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