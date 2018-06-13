// pages/buddhaOver/buddhaOver.js
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
   * 点击返回首页
   */
  backToHome: function(){
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },

  /**
   * 点击查看金身
   */
  backToBuddha: function(){
    var d = this.data;
    if (d.onebuddha){
      wx.navigateTo({
        url: '/pages/buddha/buddha?orderid=' + d.orderid + '&onreloadflag=true'
      });
    }else{
      wx.navigateBack({
        delta: 1
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var isendflag = options.isendflag || false; //是否显示金身
    var onebuddha = options.onebuddha || false; //是否一次性礼佛
    var orderid = options.orderid; //订单号 
    this.setData({
      orderid: orderid,
      onebuddha: onebuddha,
      isendflag: isendflag
    });
    
    if (!onebuddha){
      //打开页面数据刷新
      var pages = getCurrentPages();
      var pagelen = pages.length;
      var prevPage = pages[pagelen - 2]; //礼佛页
          prevPage.setData({
            orderid: orderid,
            onreloadflag: true
          });

      if (pagelen == 4) { //页面经过了选择佛像页(确保以后礼佛方案调整为分段礼佛为1次或者误设置)
        var selectPage = pages[pagelen - 3]; //选择佛像页
            selectPage.setData({
              onreloadflag: true
            });
      }
    }

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