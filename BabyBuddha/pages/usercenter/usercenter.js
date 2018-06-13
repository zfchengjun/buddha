// usercenter.js
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
   * 点击tab页
   */
  toTabPage: function (evt) {
    var dt = evt.currentTarget.dataset,
      num = dt.num;
    app.toTabPage(num);
  },

  /**
   * 去向我的宝宝佛记录
   */
  openBuddhaRecord: function() {
    wx.navigateTo({
      url: '/pages/orderList/orderList'
    });
  },

  /**
   * 去向我的点评
   */
  openMyreviews: function(){
    wx.navigateTo({
      url: '/pages/reviews/reviews?isfrommyself=true',
    }) 
  },

  /**
   * 页面初始化
   */
  pageInit: function(){
    var that = this;
    app.getUserInfo(function (userInfo) {
      that.setData({
        nickname: userInfo.nickname,
        headimg: userInfo.headimg
      });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.pageInit();
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