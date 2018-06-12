// pages/buddha/buddha.js
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

    foodslist:{
      offstatelist: [
        { id: 1, desc: "左边莲花", imgsrc: "floweroff.png", classname: "levelimg leveloff1" },
        { id: 2, desc: "右边莲花", imgsrc: "floweroff.png", classname: "levelimg leveloff2" },
        { id: 5, desc: "左边水果", imgsrc: "fruitoff.png", classname: "levelimg leveloff5" },
        { id: 6, desc: "右边水果", imgsrc: "fruitoff.png", classname: "levelimg leveloff6" }
      ],

      onstatelist: [
        { id: 1, desc: "左边莲花", imgsrc: "floweron.png", classname: "levelimg levelon1" },
        { id: 2, desc: "右边莲花", imgsrc: "floweron.png", classname: "levelimg levelon2" },
        { id: 5, desc: "左边水果", imgsrc: "fruiton.png", classname: "levelimg levelon5" },
        { id: 6, desc: "右边水果", imgsrc: "fruiton.png", classname: "levelimg levelon6" }
      ]
    },    

    statelist:{
      /**1.置灰状态 */
      offstate: {
        buddhaimg: { imgsrc: "buddhaoff.png", classname: "imgbuddhaoff"},
        showleft: true,  //是否显示剩余次数区域
        showfoods: true,
        showfoodsstate: "onstatelist", //显示供果区域内容(正常状态供果)
        showfoodsanim: true, //显示供品动画
        showbuddhabtn: true  //是否显示礼佛按钮
      },

      /**2.结网拂尘状态 */
      offnetstate: {
        buddhaimg: { imgsrc: "buddhaoff.png", classname: "imgbuddhaoff" },
        showleft: true,
        showfoods: true,
        showfoodsstate: "offstatelist", //showfoods伪true时，显示供果区域内容(结网状态供果)
        shownetimg: true,
        showbuddhabtn: false        
      },

      /**3.礼佛完成状态 */
      buddhasucc: {
        buddhaimg: { imgsrc: "buddhaon.png", classname: "imgbuddhaon" },
        showleft: true,
        showfoods: true,
        showfoodsstate: "onstatelist", //显示供果区域内容(正常状态供果)
        showbuddhabtn: false,
        showtiptxt: true,  //礼佛完成标志
        showfoodsanim: true //显示供品动画
      },

      /**4.佛像金身状态 */
      buddhagold: {
        buddhaimg: { imgsrc: "buddhagold1.png", classname: "imgbuddhagold" },
        showleft: false,
        showfoods: true,
        showfoodsstate: "onstatelist",
        showbuddhabtn: false,
        showfoodsanim: true, //显示供品动画
        showgoldanim: true //显示佛像金身动画
      }
    },
    currentstate: null,

    audiolist: [ //音频播放列表:目前支持的格式有 m4a, aac, mp3, wav
      { url:"1.mp3",title:"音乐1"},
      { url:"2.mp3",title:"音乐2"},
      { url:"3.mp3",title:"音乐3"},
      { url:"4.mp3",title:"音乐4"},
      { url:"5.mp3",title:"音乐5"},
      { url:"6.mp3",title:"音乐6"},
      { url:"7.mp3",title:"音乐7"}
    ],

    imgpath: "/images/buddha/",

    bgoldimglist: [ //佛像金身图像逐帧动画图
      "buddhagold1.png", 
      "buddhagold2.png", 
      "buddhagold3.png"
    ],    
    bfireaniminfo:{ //火苗逐帧动画图
      pows: {
        w: 16,
        h: 28,
        y: 332,
        leftx: 175,
        rightx: 548
      },
      imglist: [
        "f1.png",
        "f2.png",
        "f3.png",
        "f4.png"
      ]      
    },
    candleinfo: {  //中间香
      src: "candleon.png",
      pows: {
        w: 78,
        h: 181,
        x: 338,
        y: 68
      }
    },
    byananiminfo: { //中间香-烟逐帧动画图
      pows: {
        w: 83,
        h: 84,
        x: 334,
        y: 0
      },
      imglist: [
        "y1.png",
        "y2.png",
        "y3.png"
      ]
    },
    interval: null
  },

  /**
   * 点击去向支付
   */
  toPay: function(){
    var d = this.data,
        orderinfo = d.orderinfo;

    this.setData({
      onreloadflag: null,
      orderid: null
    });
    
    //背景音频暂停
    app.globalData.innerAudioContext.pause();

    wx.navigateTo({
      url: '/pages/pay/pay?partlevel=' + orderinfo.partlevel + '&productid=' + orderinfo.productid + '&orderid=' + orderinfo.orderid,
    });
  },

  /**
   * 点击拂尘
   */
  toClear: function () {
    var d = this.data,
      currentstate = d.statelist.offstate;
    this.setData({
      currentstate: currentstate
    });
    if (currentstate.showfoodsanim) {
      this.setIntervalCb();
    }
  },

  /**
   * 长按显示佛像金身状态
   */
  showGoldBuddha: function(){
    var that = this,
        d = this.data,
        statelist = d.statelist,
        prevtimestamp = d.prevtimestamp||0,
        curtimestamp = (new Date()).getTime(),
        titaltime = 3000;

    var prevstate = util.cloneObj(d.currentstate);
    if (prevstate.buddhaimg.classname == "imgbuddhagold" || curtimestamp - prevtimestamp <= titaltime){
      return;
    }
    
    this.setData({
      currentstate: statelist.buddhagold,
      prevtimestamp: curtimestamp
    });
    this.setIntervalCb(true);

    setTimeout(function(){   
      that.setData({
        currentstate: prevstate
      });
      if (prevstate.showfoodsanim){
        that.setIntervalCb();
      }else{
        that.clearIntervalCb(); //清空定时器
      }
    }, titaltime);
  },

  /**
   * 操作音频点击事件
   */
  toggleAudio: function(){
    var audioplay = !this.data.audioplay;
    this.setData({
      audioplay: audioplay
    });
    if (audioplay) {
      app.globalData.innerAudioContext.play();
    } else {
      app.globalData.innerAudioContext.pause();
    }
  },
  /**
   * 获取随机数
   */
  RandomNum: function(Min, Max){
    var Range = Max - Min;
    var Rand = Math.random();  
    var num = Min + Math.round(Rand * Range);
    return num;
  },

  /**
   * 获取供品区域画布宽度和高度
   */
  setFoodsCanvas: function(){
    var that = this,
        d = this.data,
        imgsw = 750,
        imgsh = 496,        
        showcw = app.globalData.winw,
        showch = parseInt(showcw * imgsh / imgsw),
        rate = showcw/imgsw,
        
        bfireaniminfo = d.bfireaniminfo,
        candleinfo = d.candleinfo,
        byananiminfo = d.byananiminfo;

    bfireaniminfo.pows = this.getnewpowsinfo(rate,bfireaniminfo.pows);
    candleinfo.pows = this.getnewpowsinfo(rate,candleinfo.pows);
    byananiminfo.pows = this.getnewpowsinfo(rate,byananiminfo.pows);

    that.setData({
      bfoodscanvasw: showcw,
      bfoodscanvash: showch,
      rate: rate,
      bfireaniminfo: bfireaniminfo,
      candleinfo: candleinfo,
      byananiminfo: byananiminfo
    }); 
  },

  /**
   * 佛像金身图片加载完成回调
   */
  setBuddhaCanvas: function(e){
    var that = this,
        imgsw = 750,
        imgsh = 858,
        showcw = app.globalData.winw,
        showch = parseInt(showcw * imgsh / imgsw);
        that.setData({
          bgoldcanvasw: showcw,
          bgoldcanvash: showch
        });        
  },

  /**
   * 设置定时器
   */
  setIntervalCb: function(drawbuddhaflag){
    this.clearIntervalCb(); //清空定时器

    var that = this;
    var index = 0;
    if (drawbuddhaflag) {
      that.drawBuddhaAnim(index,function(){
        that.drawFoodsAnim(index);
      });
    }else{
      that.drawFoodsAnim(index);
    }    

    this.data.interval = setInterval(function(){
      index++;
      if (drawbuddhaflag) {
        that.drawBuddhaAnim(index, function () {
          that.drawFoodsAnim(index);
        });
      } else {
        that.drawFoodsAnim(index);
      }   
    },400);
  },

  /**
   * 清空定时器
   */
  clearIntervalCb: function(){
    var that = this;
    if(this.data.interval){
      clearInterval(that.data.interval);
      this.setData({
        interval: null
      });
    }    
  },

  /**
   * 绘制佛像金身动画
   */
  drawBuddhaAnim: function (curcount,cb){    
    var d = this.data,
        bgoldimglist = d.bgoldimglist,
        imggoldindex = curcount % bgoldimglist.length,
        imgsrc = d.imgpath+bgoldimglist[imggoldindex],
        bgoldcanvasw = d.bgoldcanvasw,
        bgoldcanvash = d.bgoldcanvash;
   
    this.buddhactx.clearRect(0, 0, bgoldcanvasw, bgoldcanvash); //清空画布
  //  this.buddhactx.setFillStyle("#fff");  //设置填充色
        //drawImage(dx, dy, dWidth, dHeight)
    this.buddhactx.drawImage(imgsrc, 0, 0, bgoldcanvasw, bgoldcanvash);
    this.buddhactx.draw();

    if(cb){
      cb();
    }
  },

  /**
   * 绘制供品动画
   */
  drawFoodsAnim: function (curcount) {
    var d = this.data,

        bfireaniminfo = d.bfireaniminfo, 
        flist = bfireaniminfo.imglist,
        findex = curcount % flist.length,
        fsrc = d.imgpath + flist[findex],
        fpows = bfireaniminfo.pows,

        candleinfo = d.candleinfo,
        csrc = d.imgpath + candleinfo.src,
        cpows = candleinfo.pows,

        byananiminfo = d.byananiminfo,
        ylist = byananiminfo.imglist,
        yindex = curcount % ylist.length,
        ysrc = d.imgpath + ylist[yindex],
        ypows = byananiminfo.pows,

        bfoodscanvasw = d.bfoodscanvasw,
        bfoodscanvash = d.bfoodscanvash;

    this.foodsctx.clearRect(0, 0, bfoodscanvasw, bfoodscanvash); //清空画布

    this.foodsctx.drawImage(fsrc, fpows.leftx, fpows.y, fpows.w, fpows.h); //绘制左侧火苗
    this.foodsctx.drawImage(fsrc, fpows.rightx, fpows.y, fpows.w, fpows.h); //绘制右侧火苗
    this.foodsctx.drawImage(csrc, cpows.x, cpows.y, cpows.w, cpows.h); //绘制香烛
    this.foodsctx.drawImage(ysrc, ypows.x, ypows.y, ypows.w, ypows.h); //绘制烟
    this.foodsctx.draw();
  },

  /**
   * 遍历设置
   */
  getnewpowsinfo: function(rate,powsinfo){
    var newpowsinfo = {};
    for (var i in powsinfo){
      newpowsinfo[i] = parseInt(powsinfo[i]*rate);
    }
    return newpowsinfo;
  },

  /**
   * 背景音频播放初始化
   * levelid 当前分段级id
   */
  audioInit: function(){
    var that = this,
        d = this.data,
        audiolist = d.audiolist,
        levelid = this.RandomNum(0, audiolist.length - 1),
        curaudioinfo = audiolist[levelid];
    app.globalData.innerAudioContext.src = d.audiopath+curaudioinfo.url;

    that.setData({
      audioplay: true
    });    

    //监听音频播放
    app.globalData.innerAudioContext.onPlay = function(){
      console.log('开始播放')
      that.setData({
        audioplay: true
      });
    };

    //监听音乐下载失败
    app.globalData.innerAudioContext.onError= function(res){
      console.log("音乐加载失败："+res.errMsg)
      console.log(res.errCode);
      that.setData({
        audioplay: false
      });
    };

    //监听音乐暂停
    app.globalData.innerAudioContext.onPause = function () {
      that.setData({
        audioplay: false
      });
    };

    //监听音乐停止
    app.globalData.innerAudioContext.onStop = function (res) {
      that.setData({
        audioplay: false
      });
    };

    // //音频因外界原因中断完成后回调
    // wx.onAudioInterruptionEnd(function () {
    //   app.globalData.innerAudioContext.play();
    // });
  },

  /**
   * 获取订单详情
   * orderid 订单号
   * cb 回调事件
   */
  getOrderDetail: function (orderid,cb) {
    var that = this;
    var url = "/order/status/"+orderid;
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      if(cb){
        var orderinfo = rst.order||{};
        var infoobj = {
          orderid: orderinfo["id"], //订单号
          productid: orderinfo["product_id"], //产品id
          partlevel: orderinfo["cur_count"], //七天礼佛分段等级
          totalcount: orderinfo["total_count"], //当前礼佛方式总礼佛次数
          status: orderinfo["status"], //礼佛状态
          haspay: rst.haspay, //当天是否已支付
          dirty: rst.dirty //是否已结网
        };
        cb(infoobj);
      }
    });
  },

  /**
   * 页面初始化
   * options 初始化配置信息
   * refreshflag 当天礼佛成功标志
   */
  pageInit: function (options,refreshflag){
    var that = this,      
      productid = options.productid || "", //产品id
      orderid = options.orderid || "", //订单号
      totalcount = options.totalcount||0, //当前礼佛方式总礼佛次数
      partlevel = options.partlevel || 0, //七天礼佛分段等级
      haspay = options.haspay || false, //当天是否已支付
      dirty = options.dirty || false, //是否已结网
      status = options.status || 1, //理佛状态 0=待支付，1=支付中，2=支付成功，3=快递中，4=完成

      isgold = options.isgold || false; //是否已金身状态
  
    var d = this.data,
      statelist = d.statelist,
      currentstate = statelist.offstate;  //1.置灰状态
    if (dirty) {  //2.结网状态
      currentstate = statelist.offnetstate;
    } else if (isgold || (status != 0 && status != 1)) {  //4.金身状态
      currentstate = statelist.buddhagold;
    } else if (haspay) {  //3.礼佛完成状态--当日已支付
      util.showToast(that,"今日已支付，请明日继续");
      currentstate = statelist.buddhasucc;
      //当天已支付，
      if (refreshflag) {
        currentstate.showbuddhabtn = false;
      }
    }   

    this.setData({
      leftlevel: totalcount-partlevel,
      currentstate: currentstate,
      orderinfo: {
        orderid: orderid,
        productid: productid,
        partlevel: partlevel,
        totalcount: totalcount
      }
    });

    if (currentstate.showfoodsanim) {
      this.setIntervalCb();
    } else if (currentstate.buddhaimg.classname == 'imgbuddhagold'){
      this.setIntervalCb(true);
    }
    
   this.audioInit(partlevel);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    var audiopath = util.serverurl+"/resources/";

    this.setData({
      audiopath: audiopath
    });

    this.buddhactx = wx.createCanvasContext("buddhacanvas", this);
    this.foodsctx = wx.createCanvasContext("foodscanvas", this);
    this.setFoodsCanvas();
    this.setBuddhaCanvas();

    var onreloadflag = options.onreloadflag || "";  //是否根据接口获取实时数据：分段支付第一次支付完成||一次性支付完成
    if (onreloadflag){
      var that = this;
      var orderid = options.orderid || "";
      this.getOrderDetail(orderid, function (options) {
        that.pageInit(options, true);
      });   
    }else{
      this.pageInit(options);   
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
    if (this.data.onreloadflag){
      var that = this;
      var orderid = this.data.orderid;
      this.getOrderDetail(orderid,function(options){
        that.pageInit(options, true);
      });      
    }else{
      //播放音频
      app.globalData.innerAudioContext.play();
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
    //停止背景音频播放
    if (app.globalData.innerAudioContext) {
      app.globalData.innerAudioContext.stop();
    }
    if(this.data.interval){
      this.clearIntervalCb();
    }
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