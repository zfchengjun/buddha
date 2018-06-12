// index.js
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    toastinfo:{
      showflag: false,
      showaliconflag: false,
      msg: ""
    },
    loadinginfo:{
      showflag: false
    },
    
    defaultbannerlist: [
      { id: 1, name: "默认图片", url: "/images/banner1.png", linkurl: ""}
    ],
    showvedioflag: false, //显示视频标志
    showslideimg: true //显示向下箭头标志
  },

  /**
   * 点击tab页
   */
  toTabPage: function(evt){
    var dt = evt.currentTarget.dataset,
        num = dt.num;
    app.toTabPage(num);
  },

  /**
   * 打开debug
   */
  openDebug: function(){
    wx.setEnableDebug({
      enableDebug: true
    })
  },
  /**
   * 关闭debug
   */
  closeDebug: function () {
    wx.setEnableDebug({
      enableDebug: false
    })
  },

  /**
   * 获取banner图列表
   */
  getBannerList: function(completecb){
    var that = this;
    var url = "/banner/list";
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      var bannerlist = rst.banners;
      //没有则设置默认图片
      if (!bannerlist || bannerlist.length==0){
        bannerlist = that.data.defaultbannerlist;
      }
      that.setData({
        bannerlist: bannerlist
      });
    },function(){
      var bannerlist = that.data.defaultbannerlist;
      that.setData({
        bannerlist: bannerlist
      });
    },function(){
      if (completecb){
        completecb();
      }
    });
  },

  /**
   * 视频开始播放
   */
  vedioPlayStart: function(){
    this.setData({
      showvedioflag: true
    });
    if (!this.videoContext){
      this.videoContext = wx.createVideoContext('myVideo');
    }
    this.videoContext.play();
  },

  /**
   * 视频加载失败回调
   */
  vedioOnloadFail: function(){
    var _that = this;
    util.showToast(_that,"视频加载失败");
  },

  /**
   * 视频播放完毕回调
   */
  vedioPlayEnd: function(){
    this.setData({
      showvedioflag: false
    });
  },

  /**
   * 去向我的宝宝佛购买记录
   */
  toOrderList: function(){
    wx.navigateTo({
      url: '/pages/orderList/orderList',
    })
  },

  /**
   * 去向请佛页面
   */
  toBuddhaSelect: function () {
    //校验是否已有请佛记录，如果没有则进入选择佛像页面
    this.checkHasRecord(function(){
      wx.navigateTo({
        url: '/pages/buddhaSelect/buddhaSelect',
      });
    });    
  },

  /**
   * 点击banner
   */
  bindBannerClick: function (evt) {
    var dt = evt.currentTarget.dataset,
        linkhref = dt.href || "";
    if (linkhref) {
      wx.navigateTo({
        url: linkhref
      });
    }
  },

  /**
   * 校验是否有分段礼佛记录--拉取用户理佛状态
   * indexcb 停留在首页的回调事件
   */
  checkHasRecord: function(indexcb){
    var that = this;
    var url = "/user/status";
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      if(!rst.index){ //如果已有七天分段礼佛记录
        var dirty = rst.dirty; //是否已结网
        var haspay = rst.haspay; //当天是否已支付
        var orderinfo = rst.order||{},
            orderid = orderinfo.id,  //已有订单号
            partlevel = orderinfo.cur_count, //已完成七天分段等级数
            totalcount = orderinfo.total_count, //当前礼佛方式礼佛总次数
            productid = orderinfo.product_id; //产品id

        var href = '/pages/buddha/buddha?partlevel=' + partlevel + '&totalcount=' + totalcount + '&productid=' + productid + '&orderid=' + orderid;
            href += dirty ?"&dirty=true":"";
            href += haspay ?"&haspay=true":"";

            if (!haspay){
              wx.navigateTo({
                url: href,
              });
            }else{
              if (indexcb){
                wx.navigateTo({
                  url: href,
                });
              }
            }
            
      }else{
        if (indexcb){
          indexcb();
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var vediopath = util.serverurl +"/resources/1.mp4";
    this.setData({
      vediopath: vediopath
    });

    var that = this;
    this.getBannerList(function(){
      that.checkHasRecord();
    });    
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
    this.setData({
      showslideimg: false
    });
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