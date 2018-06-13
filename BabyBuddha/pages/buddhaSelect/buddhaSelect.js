// buddhaSelect.js
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
   * 去向礼佛
   */
  toBuddha: function(evt){
    var dt = evt.currentTarget.dataset,
        productid = dt.id;    
    wx.navigateTo({
      url: '/pages/pay/pay?productid=' + productid,
    })
    // wx.navigateTo({
    //   url: '/pages/buddha/buddha?productid=' + productid,
    // })
  },

  /**
   * 获取产品列表
   */
  getProductList: function(){
    var that = this;
    var url = "/product/list";
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      that.setData({
        plist: rst.productList
      });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProductList();
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
    if (this.data.onreloadflag){
      wx.navigateBack({
        delta: 1
      });
    } 
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