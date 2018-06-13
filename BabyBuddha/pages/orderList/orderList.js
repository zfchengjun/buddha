// pages/orderList/orderList.js
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    toastinfo: {
      showflag: false,
      showaliconflag: false,
      msg: ""
    },
    loadinginfo: {
      showflag: false
    }

  },

  /**
   * 点击查看金身
   */
  showBuddhaGold: function(){
    wx.navigateTo({
      url: '/pages/buddha/buddha?isgold=true',
    });
  },

  /**
   * 获取订单列表
   */
  getOrderList: function () {
    var that = this;
    var url = "/order/list";
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      var orderlist = rst["order_list"];
      if (!orderlist || orderlist.length==0){
        that.setData({
          nodata: true
        });
        return;
      }

      var plist = [];
      for (var k = 0, klen = orderlist.length; k<klen; k++){
        var curitem = orderlist[k];
        if (curitem.status != 0 && curitem.status!=1){
          curitem.date = curitem["create_time"].substr(0,10);
          plist.push(curitem);
        }
      }
      if(plist.length == 0){
        that.setData({
          nodata: true
        });
        return;
      }
      that.setData({
        plist: plist
      });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //停止背景音频播放
    wx.stopBackgroundAudio();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '宝宝佛',
      path: '/pages/index/index'
    };
  }
})