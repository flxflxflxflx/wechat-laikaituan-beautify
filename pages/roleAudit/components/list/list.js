// pages/roleAudit/components/list/list.js
import tr from "../../../../utils/tokenRequest"
const app = getApp();
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    tips: String,
    footerts: String,
    // 请求那个图片的字段
    mark: String
  },
  lifetimes: {
    created() {
      let that = this;
      this.setData({
        selectFile: this.selectFile.bind(this),
        uplaodFile: this.uplaodFile.bind(this)
      })

    }
  },
  observers: {
    'iishide': function (iishide) {
      this.triggerEvent("ishide", this.data.iishide)
    },
    'mark': function (mark) {
      let that = this
      // 向后台请求申请权限的图片
      tr("/getUserPermissionsImage", {
        // 获取这个的图片
        mark: mark
      }).then(function (res) {
        // 判断是否有权限,没有权限提示跳转到权限申请页面
        // 权限图片
        let permissionsImageArr = res.data.msg;
        permissionsImageArr.forEach(function (v) {
          if (v['qualificationimgslist'] == null) {
            return
          }
          let imageurlarr = JSON.parse(v['qualificationimgslist']);
          for (let index = 0; index < imageurlarr.length; index++) {
            let a = {}
            a.url = app.globalData.apiUrl + imageurlarr[index];
            a.isBackend = true
            imageurlarr[index] = a
          }
          that.setData({
            files: imageurlarr
          })
          console.log(imageurlarr);
          // 传递给父组件让父组件更新
          that.uplaodFile(false);
        });
      }, function (err) {
        wx.showToast({
          title: err,
          icon: "error"
        })
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    files: [],
    // 是否显示
    ishide: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    deleteImg(e) {
      console.log(e);
      let that = this
      let result = that.data.files
      that.setData({
        files: result.splice(e.detail.index + 1, 1)
      })
      that.triggerEvent("updeteFile", that.data.files)
      // wx.showModal({
      //   title: '提示',
      //   content: '是否删除',
      //   success (res) {
      //     if (res.confirm) {
          
      //     } else if (res.cancel) {
      //       console.log("dddddddddddd");
      //       console.log(that.data.files);
      //       // that.triggerEvent("updeteFile", that.data.files)
      //       return
      //     }
      //   }
      // })
    
    },
    chooseImage() {
      console.log("fasfas");
      const that = this
      wx.chooseImage({
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success(res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          that.setData({
            files: that.data.files.concat(res.tempFilePaths)
          })
        }
      })
    },
    previewImage(e) {
      wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: this.data.files // 需要预览的图片http链接列表
      })
    },
    selectFile(files) {
      // 返回false可以阻止某次文件上传
    },
    uplaodFile(files) {
      let urlResult = this.data.files
      if (files != false) {
        let result = files.tempFiles
        for (let index in result) {
          let temp = {}
          temp.url = result[index].path;
          temp.isBackend = false
          urlResult.push(temp)
        }
      }
      this.setData({
        files: urlResult
      })
      this.triggerEvent("updeteFile", this.data.files)
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
    uploadError(e) {
      console.log('upload error', e.detail)
    },
    uploadSuccess(e) {
      console.log('upload success', e.detail)
    },

  }
})