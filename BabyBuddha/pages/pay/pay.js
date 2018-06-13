// pages/pay/pay.js
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

    maxdaycount: 1
  },

  /**
   * 选择当前礼佛方式
   */
  selectWay: function(evt){
    var dt = evt.currentTarget.dataset,
        tablist = this.data.tablist,
        tabid = dt.id,
        title = tabid == 1 ? tablist[0].title : tablist[1].title;
    if(this.data.tabid == tabid){
      return;
    }
      
    wx.setNavigationBarTitle({
      title: title,
    });
    this.setData({
      tabid: tabid
    });
  },

  /**
   * 获取收货地址
   */
  getAddrInfo: function(){
    var that = this;
    wx.chooseAddress({
      success: function (res) {
        console.log("收货地址信息："+JSON.stringify(res));
        var addrinfo = {
          address: (res.provinceName + "-" + res.cityName + "-" + res.detailInfo),
          username: res.userName,
          tel: res.telNumber
        };
        that.setData({
          addrinfo: addrinfo
        });
        // console.log(res.userName)
        // console.log(res.postalCode)
        // console.log(res.provinceName)
        // console.log(res.cityName)
        // console.log(res.countyName)
        // console.log(res.detailInfo)
        // console.log(res.nationalCode)
        // console.log(res.telNumber)
      },
      fail: function(){
        util.showToast(that,"获取收货地址失败");
      }
    })
  },

  /**
   * 礼佛支付
   */
  toPayForWechat: function (e) {
    if (this.data.loading) {
      return;
    }
    var that = this,
        d = this.data,  
        tabid = d.tabid,
        curpayid = "",
        payway = "",
        isendflag = false,    
        orderinfo = d.orderinfo,
        curpartlevel = orderinfo.partlevel,
        productid = orderinfo.productid,
        orderid = orderinfo.orderid;
    if (tabid==1){ //分段礼佛
      var nextpartinfo = this.matchPartInfo(curpartlevel);
          curpayid = nextpartinfo.id;
          payway = nextpartinfo.way;
          isendflag = (nextpartinfo.times == d.partsteplist.length?true:false);
    }else{ //一次礼佛
      var onetotalinfo = d.onetotalinfo;
          curpayid = onetotalinfo.id;
          payway = onetotalinfo.way;
          isendflag = true;
    }

    var url = "/order/submit";
    var paramInfo = {
        "pay_way": payway, //理佛方案，首次理佛必须填写
        // "id": orderid, //订单编号，7次理佛续费时必填(当前礼佛订单号)
        "product_id": productid //产品id
    };

    if (orderid){
      paramInfo.id = orderid;//订单编号，7次理佛续费时必填(当前礼佛订单号)
    }

    //收货地址
    if (isendflag) {
      var addrinfo = d.addrinfo;
      if (!addrinfo){
        util.showToast(that,"请先选择收货地址");
        return;
      }
          paramInfo.name = addrinfo.username;
          paramInfo.mobile = addrinfo.tel;
          paramInfo.address = addrinfo.address;
    }
    this.setData({
      loading: true
    });

    app.postRequest(that, url, paramInfo, "POST", function (rst) {
      that.toWechatPay(rst.payParams, function () {
        var sorderid = rst.order.id; //订单编号
        that.paySuccCb(sorderid, isendflag, curpartlevel);
      });
    });

  },

  /**
   * 微信支付
   */
  toWechatPay: function (rstdata, succcb) {
    var that = this;
    console.log(rstdata);
    wx.requestPayment({
      'timeStamp': rstdata.timeStamp,
      'nonceStr': rstdata.nonceStr,
      'package': rstdata.paypackage,
      'signType': rstdata.signType,
      'paySign': rstdata.paySign,
      'success': function (res) {        
        if (succcb) {
          succcb();
        }
      },
      'fail': function (res) {

      },
      'complete': function (res) {
        console.log("微信支付调用完毕:", res)
        if (res.errMsg == "requestPayment:fail cancel") {
          util.showToast(that, "您已取消支付");
        }
      }
    })
  },

  /**
   * 支付成功后回调
   * orderid 订单id
   * isendflag 是否是最后一次礼佛
   * curpartlevel 当前第几次礼佛
   */
  paySuccCb: function (orderid, isendflag, curpartlevel){
    if (isendflag){  //全部礼佛完成
      var onebuddha = this.data.tabid==0?true:false;
      var href = '/pages/buddhaOver/buddhaOver?orderid=' + orderid;
      href += '&isendflag=' + isendflag;
      if (onebuddha){
        href += '&onebuddha=' + onebuddha;
      }
      wx.redirectTo({
        url: href,
      });
      return;
    }

    //刷新之前打开的页面数据
    var pages = getCurrentPages();
    var pagelen = pages.length;
    if (curpartlevel==0){  //分段礼佛--第1次礼佛完成，重定向到礼佛页
      var selectPage = pages[pagelen - 2];  //页面经过了选择佛像页
          selectPage.setData({
            onreloadflag: true
          });

      wx.redirectTo({
        url: '/pages/buddha/buddha?orderid=' + orderid +'&onreloadflag=true'
      });
      return;
    }

    var prevPage = pages[pagelen - 2]; //礼佛页
    prevPage.setData({
      orderid: orderid,
      onreloadflag: true
    });

    //返回上一页
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 匹配分段礼佛当前id
   * 当前礼佛等级
   */
  matchPartInfo: function(partlevel){
    var nextpartlevel = parseInt(partlevel)+1;
    var partsteplist = this.data.partsteplist;
    var nextinfo = "";
    for (var k = 0, klen = partsteplist.length; k < klen; k++) {
      if (parseInt(partsteplist[k].times) == nextpartlevel) {
        nextinfo = partsteplist[k];
        break;
      }
    }
    return nextinfo;
  },

  /**
   * 获取礼佛列表
   */
  getBuddhaLableList: function(productid){
    var that = this;
    var url = "/product/pay_way_list/" + productid;
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rstdata) {
      var paywaylist = rstdata.payWayList;
      if (!paywaylist || paywaylist.length==0){
        return;
      }
      var tablist = [];
      var onetotalinfo = null; //一次礼佛信息
      var maxdaycount = 1;  //最大天数
      for (var n = 0, nlen = paywaylist.length; n < nlen; n++) {
        var paywaylistlen = paywaylist[n].length;
        if (paywaylistlen > 1) { //分批次
          maxdaycount = paywaylistlen;
          that.setBuddhaState(paywaylist[n]);
          tablist.push({ id: 1, title: util.transToChinese(paywaylistlen)+"次购买" });
        } else { //一次
          tablist.push({id:0,title:"一次购买"});
          paywaylist[n][0].money = parseInt(paywaylist[n][0].money/100);
          onetotalinfo = paywaylist[n][0];
        }
      }
      if (tablist[0].id==0){
        tablist.reverse();
      }
      that.setData({
        tablist: tablist,
        tabid: tablist[0].id,
        maxdaycount: maxdaycount,
        onetotalinfo: onetotalinfo
      });
    });
  },

  /**
   * 设置7次礼佛标签状态
   */
  setBuddhaState: function (partsteplist){
    var d = this.data,
        partlevel = d.partlevel;

    //设置七次礼佛状态
    for (var k = 0, klen = partsteplist.length; k < klen; k++) {
      partsteplist[k].money = parseInt(partsteplist[k].money/100);
      if (parseInt(partsteplist[k].times) <= partlevel) {
        partsteplist[k].checked = true;
      } else {
        partsteplist[k].checked = false;
      }
    }
    this.setData({
      partsteplist: partsteplist
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderid = options.orderid || "", //订单号
        productid = options.productid || null, //产品id
        partlevel = parseInt(options.partlevel) || 0; //七天礼佛分段等级
    this.setData({
      partlevel: partlevel,
      orderinfo: {
        orderid: orderid,
        productid: productid,
        partlevel: partlevel
      }
    });
    this.getBuddhaLableList(productid);

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