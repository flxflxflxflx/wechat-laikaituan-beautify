
import {
  useCascaderAreaData,
  areaList
} from '../../utils/area-data/dist/index.cjs';
// pages/aa/aa.js
Page({

  data: {
    options: [{
      text: '浙江省',
      value: '330000',
      children: [],
    }, {
      "children": [],
      "text": "北京市",
      "value": "110000"
    },
    {
      "children": [],
      "text": "天津市",
      "value": "120000"
    },
    {
      "children": [],
      "text": "河北省",
      "value": "130000"
    },
    {
      "children": [],
      "text": "山西省",
      "value": "140000"
    },
    {
      "children": [],
      "text": "内蒙古自治区",
      "value": "150000"
    },
    {
      "children": [],
      "text": "辽宁省",
      "value": "210000"
    },
    {
      "children": [],
      "text": "吉林省",
      "value": "220000"
    },
    {
      "children": [],
      "text": "黑龙江省",
      "value": "230000"
    },
    {
      "children": [],
      "text": "上海市",
      "value": "310000"
    },

 ]
  },
  onChange(e) {
    const {
      value
    } = e.detail;
    if (value === this.data.options[0].value) {
      setTimeout(() => {
        const children = [{
            text: '杭州市',
            value: '330100'
          },
          {
            text: '宁波市',
            value: '330200'
          },
        ];
        this.setData({
          'options[1].children': children,
        })
      }, 1000);
    }
  },


  onClick() {
    // this.addressDataHandle(areaList.province_list, 0);
    this.setData({
      show: true,
    });
  },

  onClose() {
    this.setData({
      show: false,
    });
  },


  onFinish(e) {
    const {
      selectedOptions,
      value
    } = e.detail;
    const fieldValue = selectedOptions
      .map((option) => option.text || option.name)
      .join('/');
    this.setData({
      fieldValue,
      cascaderValue: value,
      area_show: false
    })
  },

  onChange(e) {
    const {
      value
    } = e.detail;
    console.log(e);
    if (e.detail.tabIndex == 0) {
      console.log(areaList);
      this.addressDataHandle(areaList.city_list, 1, e.detail.value)
    }
  },

  // 地址数据处理  
  addressDataHandle(area, index, code = null) {
    // 地址数据
    let addressData = function () {
      let list = Object.entries(area).map(item => {
        return {
          ['text']: item[1],
          ['value']: item[0],
          ['children']: []
        }
      })
      return list
    }

    if (index == 0) {
      let list = addressData()
      this.setData({
        options: list
      })
    } else if (index == 1) {
      let list = addressData()
      // 进行过滤
      let ll = list.filter(function (current, index, arr) {
        if (current.value.substr(0, 2) == code.substr(0, 2)) {
          return current;
        }
      })
      let options = this.data.options
      for (let i = 0; i < options.length; i++) {
        if (options[i].value == code) {
          this.setData({
            ['options[' + i + '].children']: ll,
          })
          break;
        }
      }
      console.log(this.data.options);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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