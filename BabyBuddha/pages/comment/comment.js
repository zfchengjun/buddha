// pages/comment/comment.js
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
    },

    pics: []  //本地选择图片数组
  },

  /**
   * 点击发布评论
   */
  toComment: function(){
    if (this.data.loadinginfo.showflag){
      return;
    }
    var that = this,
        d = this.data, 
        cmcontent = d.cmcontent?util.trim(d.cmcontent):"",
        pics = d.pics||[];
    if (!cmcontent){
      util.showToast(that, "请输入评论");
      return;
    }

    util.showLoadingAuto(that,true);
    if (pics.length>0){
      this.toUploadImg(function (){
        var imgpatharr = that.data.imgpatharr||[];
        console.log("图片上传数组："+JSON.stringify(imgpatharr));
        if (pics.length == imgpatharr.length){
          that.submitComment(cmcontent, imgpatharr.join(","));    
        }else{
          util.showToast(that, "图片上传出现错误，请稍后再试");
          util.showLoadingAuto(that, false);
        }        
      });
    }else{
      that.submitComment(cmcontent, "");
    }
  },

  /**
   * 提交评论
   */
  submitComment: function (content, images){
    var that = this;
    
    var url = "/comment/post";
    var paramInfo = {
      "content": content, //文本内容
      "images": images  //图片路径字符串，逗号隔开
    };

    app.postRequest(that, url, paramInfo, "POST", function (rst) {
      //打开页面数据刷新
      var pages = getCurrentPages();
      var pagelen = pages.length;
      var prevPage = pages[pagelen - 2]; //朋友圈页面
          prevPage.setData({
            onreloadflag: true
          });

      util.showSuccToast(that,"发布评论成功",true,function(){
        wx.navigateBack({
          delta: 1
        });
      });    
    },null,function(){
      util.showLoadingAuto(that, false);
    });
  },

  /**
   * 绑定文本输入事件
   */
  commentInput: function (evt) {
    this.setData({
      cmcontent: evt.detail.value
    });
  },

  /**
   * 本地选择图片
   */
  chooseImage: function () {
    var that = this,
        d = this.data,
      　pics = d.pics||[],
        maximgcount = d.maximgcount;

    wx.chooseImage({
      count: maximgcount - pics.length, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var imgsrc = res.tempFilePaths;
        　　 pics = pics.concat(imgsrc);
        that.setData({
          pics: pics
        });
      },
      fail: function (res) {
        util.showToast(that, "图片选择失败");
        console.log("本地选择图片失败："+JSON.stringify(res));
      },
      complete: function () {
        
      }
    })

  },

  /**
   * 批量或单个上传图片
   */
  toUploadImg: function (cb) {
    var that = this,
        d = this.data,
        pics = d.pics,
        uid = d.uid;
    //批量上传前，重置上传队列
    this.setData({
      imgpatharr: null
    });
    app.uploadImgList(that,{
      uid: uid, //用户id 
      imglist: pics  //这里是选取的图片的地址数组
    }, function (imgpatharr){
      if(cb){
        cb(imgpatharr);
      }
    });
  },

  /**
   * 预览图片
   */
  previewImage: function(evt){
    var dt = evt.currentTarget.dataset,
        curindex = dt.index,
        d = this.data,
        pics = d.pics;
    
    wx.previewImage({
      current: pics[curindex], // 当前显示图片的http链接
      urls: pics // 需要预览的图片http链接列表
    })
  },

  /**
   * 删除图片
   */
  deleteImage: function (evt) {
    var that = this, 
        dt = evt.currentTarget.dataset,
        curindex = dt.index,
        d = this.data,
        pics = d.pics||[];
    wx.showModal({
      title: '温馨提示',
      content: '确定删除该张图片？',
      success: function (res) {
        if (res.confirm) {
          pics.splice(curindex, 1);
          that.setData({
            pics: pics
          });
        } else if (res.cancel) {

        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var uid = options.uid||"";
    var maximgcount = app.globalData.maxuploadimgcount;
    this.setData({
      uid: uid,
      maximgcount: maximgcount
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