/**
 * <判断token是否过期>
 * @param url 请求的地址
 * @param method 请求的类型
 */
const app = getApp();
export default (url, data = {}, method = 'post') => {
  return new Promise((resolve, reject) => {
    //如果不能处在token，返回登录页面
    if (!wx.getStorageSync('access_token')) {
      wx.showToast({
        title: '没有token',
      })
      // 返回登录界面
      wx.redirectTo({
        url: '/pages/index/index',
      });
      console.log("storage没有token");
      reject("没有token");
      return;
    }
    // 发起请求
    wx.request({
      method,
      url: app.globalData.apiUrl + url,
      header: { //请求头
        "Content-Type": "application/json",
        "Authorization": wx.getStorageSync('access_token'),
      },
      dataType: 'json',
      data,
      success: function (res) {
        if (typeof res.header.Authorization != 'undefined') { //如果有token返回，将最新的token存入缓存
          console.log("token刷新了");
          wx.setStorageSync('access_token', res.header.Authorization);
          reject("token刷新了");
          return 'token刷新了';
        }
        if (res.statusCode == 408) {
          console.log(res);
          wx.showToast({
            title: 'toke刷新401',
            icon: "none",
            mask: true
          })
          if (res.data.msg == "token过期，请重新登录") {
            wx.redirectTo({
              url: '/pages/index/index',
            })
          }
          // setTimeout(() => {
          //   wx.redirectTo({
          //     url: '/pages/index/index',
          //   })
          // }, 1000);
          return;
        }
        if (res.statusCode == 401) {
          console.log(res);
          wx.showToast({
            title: '没有这个token',
            icon: "none",
            mask: true
          })
          // if (res.data.msg == "没有这个用户") {

          // }
          wx.clearStorage()

          wx.redirectTo({
            url: '/pages/index/index',
          })
          // setTimeout(() => {
          //   wx.redirectTo({
          //     url: '/pages/index/index',
          //   })
          // }, 1000);
          return;
        }
        if (res.data.code == '401') {
          console.log("token刷新不了");
          wx.showToast({
            title: '请重新登录',
            icon: 'error',
            duration: 1500
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/index/index'
            });
          }, 1500);
          return;
        }
        // 请重新登录token损坏了
        if (res.statusCode == "500") {
          console.error("返回500,可能是网络问题");
          wx.showToast({
            title: '没有响应',
            icon: 'error',
            duration: 1500
          });
          // 清除token,然后重新登录
          reject("没有响应")
          return;
        }
        //一些操作
        if (res.data.code != '401') {
          resolve(res);
          return;
        } else {
          reject("请重新登录")
          return;
        }
      },
      fail: function (err) {
        console.log(err);
        wx.showToast({
          title: '请求失败',
          icon: 'error'
        });
        reject("请求失败");
        // wx.redirectTo({
        //   url: '/pages/roleLogin/roleLogin'
        // });
      }, //请求失败
      complete: function () {} //请求完成后执行的函数
    })
  });

}