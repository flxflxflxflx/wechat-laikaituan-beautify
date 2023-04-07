// pages/roleView/gysView/childView/publishProduct/productSort/productSort.js
Component({


  /**
   * 组件的属性列表
   */
  properties: {
    customArrayF: Array
  },


  /**
   * 页面的初始数据
   */
  data: {
    // 是否选
    isSelected: false,
    //当前选中数组的下标值
    customIndex: [0, 0, 0],
    //当前选中数组
    onlyArray: [
      [],
      [],
      []
    ],
    //customArray假设为我们从后台获取到的json数据
    customArray: []
  },

  observers: {
    "customArrayF": function (value) {
      if (!value.length == 0) {
        this.setData({
          customArray: value
        })
        this.loadData()
      }
    }
  },


  lifetimes: {

  },


  /** 
   * 组件的方法列表
   */
  methods: {
    loadData() {
      var data = {
        customArray: this.data.customArray,
        customIndex: this.data.customIndex,
        onlyArray: this.data.onlyArray,
      };
      for (var i = 0; i < data.customArray.length; i++) {
        data.onlyArray[0].push(data.customArray[i]);
      }
      for (var j = 0; j < data.customArray[data.customIndex[0]].dept.length; j++) {
        data.onlyArray[1].push(data.customArray[data.customIndex[0]].dept[j]);
      }
      for (var k = 0; k < data.customArray[data.customIndex[0]].dept[data.customIndex[1]].product.length; k++) {
        data.onlyArray[2].push(data.customArray[data.customIndex[0]].dept[data.customIndex[1]].product[k]);
      }
      this.setData(data);
      console.log(data);
    },
    //多列自定义选择器改变value的方法
    bindCustomPickerChange: function (e) {
      this.setData({
        isSelected: true
      })
      var customArray = this.data.customArray,
        customIndex = this.data.customIndex,
        onlyArray = this.data.onlyArray;

      console.log('picker发送选择改变，携带值为', e.detail.value);
      //此处e.detail.value为当前选择的列的下标值数组，如[0,1,0]

      console.log('picker最终选择值为：', onlyArray[0][customIndex[0]], onlyArray[1][customIndex[1]], onlyArray[2][customIndex[2]]);
      this.setData({
        customIndex: e.detail.value
      })
      // 将选择的值传递给父组件
      this.triggerEvent("selectedValue", [
        onlyArray[0][customIndex[0]], onlyArray[1][customIndex[1]], onlyArray[2][customIndex[2]]
      ])
    },

    //多列自创选择器换列方法
    bindCustomPickerColumnChange: function (e) {
      var customArray = this.data.customArray,
        customIndex = this.data.customIndex,
        onlyArray = this.data.onlyArray;
      customIndex[e.detail.column] = e.detail.value;
      // console.log(onlyArray);

      var searchColumn = () => {
        for (var i = 0; i < customArray.length; i++) {
          var arr1 = [];
          var arr2 = [];
          if (i == customIndex[0]) {
            for (var j = 0; j < customArray[i].dept.length; j++) {
              arr1.push(customArray[i].dept[j]);
              if (j == customIndex[1]) {
                for (var k = 0; k < customArray[i].dept[j].product.length; k++) {
                  arr2.push(customArray[i].dept[j].product[k]);
                }
                onlyArray[2] = arr2;
              }
            }
            onlyArray[1] = arr1;
          }
        };
      }

      switch (e.detail.column) {
        case 0:
          customIndex[1] = 0;
          customIndex[2] = 0;
          searchColumn();
          break;
        case 1:
          customIndex[2] = 0;
          searchColumn();
          break;
      }
      this.setData({
        onlyArray: onlyArray,
        customIndex: customIndex
      });
    },
  }
})