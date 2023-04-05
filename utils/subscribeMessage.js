/**
 * 订阅消息
 * @param { Array } [tmplIds]
 * @returns { Promise<Object> }
 */
export default (tmplIds = []) => {
  return new Promise((resolve, reject) => {

    // 这里是获取下发权限地方，根据官方文档，可以根据  wx.getSetting() 的 withSubscriptions   这个参数获取用户是否打开订阅消息总开关。后面我们需要获取用户是否同意总是同意消息推送。所以这里要给它设置为true 。
    wx.getSetting({
      withSubscriptions: true, //  这里设置为true,下面才会返回mainSwitch
      success: function (res) {

        // 调起授权界面弹窗
        if (res.subscriptionsSetting.mainSwitch) { // 用户打开了订阅消息总开关
          console.log(res.subscriptionsSetting.itemSettings, "=====");
          if (res.subscriptionsSetting.itemSettings != null && res.subscriptionsSetting.itemSettings[tmplIds] != null) { // 用户同意总是保持是否推送消息的选择, 这里表示以后不会再拉起推送消息的授权
            let moIdState = res.subscriptionsSetting.itemSettings[tmplIds]; // 用户同意的消息模板id
            if (moIdState === 'accept') {
              console.log('接受了消息推送');
              resolve()

            } else if (moIdState === 'reject') {
              console.log("拒绝消息推送");

            } else if (moIdState === 'ban') {
              console.log("已被后台封禁");

            }
          } else {
            // 当用户没有点击 ’总是保持以上选择，不再询问‘  按钮。那每次执到这都会拉起授权弹窗
            wx.requestSubscribeMessage({ // 调起消息订阅界面
              tmplIds,
              success(res) {
                console.log('订阅消息 成功 ');
                console.log(res);
                resolve()
              },
              fail(er) {
                console.log("订阅消息 失败 ");
                console.log(er);
              }
            })
          }

        } else {
          console.log('订阅消息未开启')
        }
      },
      fail: function (error) {
        console.log(error);
      },
    })
  })
}