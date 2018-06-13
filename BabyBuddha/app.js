//app.js
var util = require('/utils/util.js');

App({
  onLaunch: function () {
    this.getUserInfo();

    var innerAudioContext = wx.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.loop = true;
    this.globalData.innerAudioContext = innerAudioContext;
    this.getDeviceInfo();
  },

  /**
   * 获取设备高度和宽度
   */
  getDeviceInfo: function(){
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log("系统信息："+JSON.stringify(res));
        that.globalData.winw = res.windowWidth;
        that.globalData.winh = res.windowHeight;
      }
    });
  },

  /**
   * 获取用户基本信息
   */
  getUserInfo: function(cb){   
    var that = this;
    var userInfo = this.globalData.userInfo;
    if (userInfo){
      console.log("获取用户基本信息", userInfo);
      typeof cb == "function" && cb(userInfo);
    }else{
      /**获取用户基本信息 */
      wx.getUserInfo({
        success: function (res) {
          console.log("获取用户基本信息", res);
          var userInfo = res.userInfo;
              userInfo.nickname = userInfo.nickName;
              userInfo.headimg = userInfo.avatarUrl;
          that.globalData.userInfo = userInfo;
          typeof cb == "function" && cb(userInfo);
        },
        fail: function () {
          //默认头像昵称
          var userInfo = {
            nickname: "匿名",
            headimg: "/images/buddha.png"
          };
          that.globalData.userInfo = userInfo;
          typeof cb == "function" && cb(userInfo);
        }
      });
    }
  },
  /**
   * 发起服务器请求：
   * 重新封装，加入token参数
   */
  postRequest: function(_that, url, paramInfo, requestType, succCb, failCb, completeCb, extendinfo){
    var that = this;
    this.getToken(_that,function(){
      var token = that.globalData.token;
          extendinfo = extendinfo || {};
          extendinfo.token = token;
      util.postRequest(_that, url, paramInfo, requestType, succCb, failCb, completeCb, extendinfo);
    });
  },
  /**
   * 获取用户token
   */
  getToken: function (_that,cb) {
    var that = this;
    if (this.globalData.token) {
      typeof cb == "function" && cb(that.globalData.token);
    } else {
      //调用登录接口
      wx.login({
        success: function (rst) {
          if (rst.code) {
            /**获取用户基本信息 */
            that.getUserInfo(function (userInfo){
              console.log("用户信息：" + JSON.stringify(userInfo));

              /**获取用户token */
              var code = rst.code;
              var url = "/token/get/" + code + "?nick_name=" + userInfo.nickname + "&head_img=" + userInfo.headimg;
              var paramInfo = "";
              util.postRequest(_that, url, paramInfo, "GET", function (data) {
                var token = data.token;
                that.globalData.token = token;
                typeof cb == "function" && cb(token);
              }, null, null, { notShowLoading: true });
            });
          } else {
            console.log('获取用户登录态失败！'+rst.errMsg);
          }
        }       
      })
    }
  },

  /**
   * 多张图片上传
   * uploadinfo = {  //上传图片信息对象
      * uid 用户id
      * imglist:需要上传的图片数组,
      * index:从索引为index的图片开始上传，默认为0
      * succcount: 上传成功图片个数
      * failcount: 上传失败图片个数
   * };
   * cb: 上传完成后回调事件
   */
  uploadImgList: function (_that,uploadinfo, cb) {
    var token = this.globalData.token; //token
    var imguploadurl = util.imguploadurl + "/imgcdn/upload/" +uploadinfo.uid; //图片上传地址
    var that = this,
        imglist = uploadinfo.imglist,  //上传图片数组
        index = uploadinfo.index || 0,//当前上传的哪张图片
        succcount = uploadinfo.succcount || 0,//上传成功的个数
        failcount = uploadinfo.failcount || 0;//上传失败的个数
    wx.uploadFile({
      url: imguploadurl,  //上传图片接口，需在后台配置https域名
      filePath: imglist[index],  //上传图片路径，只支持单个上传
      name: 'uploadfile',//这里根据自己的实际情况改
      header: {
        "Content-Type": "multipart/form-data",
        'accept': 'application/json',
        'token': token //若有token，此处换上你的token，没有的话省略  
      },
      formData: {
        'user': 'test'  //其他额外的formdata，可不写  
      },
      success: function (res) {
        console.log("当前图片上传完成：" + index + " 接口返回：" + JSON.stringify(res));
        if (res.statusCode == 200){
          var resimgpath = res.data;
          succcount++;//图片上传成功，图片上传成功的变量+1         
          //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的succcount才+1
          console.log("图片上传成功，索引:" + index);
          var imgpatharr = _that.data.imgpatharr || [];  //已上传成功图片数组
          imgpatharr.push(resimgpath);
          _that.setData({
            imgpatharr: imgpatharr
          });          
        }else{
          util.showToast(_that, res.errMsg);
        }
      },
      fail: function (res) {
        failcount++;//图片上传失败，图片上传失败的变量+1
        console.log("图片上传失败，索引:" + index);
      },
      complete: function () {
        index++;//这个图片执行完上传后，开始上传下一张
        if (index == imglist.length) {   //当图片传完时，停止调用   
          console.log('执行完毕：成功=' + succcount + " 失败=" + failcount);
          if (cb) {
            cb();
          }
        } else {//若图片还没有传完，则继续调用函数
          uploadinfo.index = index;
          uploadinfo.succcount = succcount;
          uploadinfo.failcount = failcount;
          that.uploadImgList(_that,uploadinfo,cb);
        }
      }
    });
  },

  /**
   * 点击去向底部Tab页面
   */
  toTabPage: function(num){
    var href = "";
    var desc = "";
    switch(num){
      case "1": href = "/pages/index/index"; desc = "首页"; break;
      case "2": href = "/pages/reviews/reviews"; desc = "点评"; break;
      case "3": href = "/pages/usercenter/usercenter"; desc = "我的"; break;
    }
    if(!href){
      return;
    }
    wx.redirectTo({
      url: href
    });
  },

  /**
   * 全局数据
   */
  globalData:{
    userInfo:null,
    token: null,
    pagesize: 20,  //动态页分页数据条数
    maxuploadimgcount: 9,  //上传图片最大限制
    winw: 320,
    winh: 700
  }
})