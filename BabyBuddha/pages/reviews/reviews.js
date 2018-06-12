// pages/reviews/reviews.js
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

    //右上角操作列表信息(动态&回复)
    oprmenuinfo:{
      "oprdync0": {
        "desc": "动态--管理员未审核",
        "menulist": ["置顶", "取消置顶", "审核通过", "审核不通过", "删除"],
        "menuidlist": ["1", "2", "3", "4", "5"]
      },      
      "oprdync1": {
        "desc": "动态--管理员审核通过",
        "menulist": ["置顶", "取消置顶", "审核不通过", "删除"],
        "menuidlist": ["1", "2", "4", "5"]
      },
      "oprdync2": {
        "desc": "动态--管理员审核未通过",
        "menulist": ["置顶", "取消置顶", "审核通过", "删除"],
        "menuidlist": ["1", "2", "3", "5"]
      },
      "oprdync3": {
        "desc": "动态--用户自己发表",
        "menulist": ["删除"],
        "menuidlist": ["5"]
      },
      "oprreply0": {
        "desc": "回复--管理员未审核",
        "menulist": ["审核通过", "审核不通过", "删除"],
        "menuidlist": ["6", "7", "8"]
      },
      "oprreply1": {
        "desc": "回复--管理员审核通过",
        "menulist": ["审核不通过", "删除"],
        "menuidlist": ["7", "8"]
      },
      "oprreply2": {
        "desc": "回复--管理员审核未通过",
        "menulist": ["审核通过", "删除"],
        "menuidlist": ["6", "8"]
      },      
      "oprreply3": {
        "desc": "回复--用户自己发表",
        "menulist": ["删除"],
        "menuidlist": ["8"]
      }
    },

    //操作功能回调信息
    oprcbinfo:{
      "oprcb1": { "desc": "动态--置顶", "callback": "toDyncTop", "flag": true},
      "oprcb2": { "desc": "动态--取消置顶", "callback": "toDyncTop", "flag": false},
      "oprcb3": { "desc": "动态--审核通过", "callback": "toDyncReview", "flag": true},
      "oprcb4": { "desc": "动态--审核不通过", "callback": "toDyncReview", "flag": false},
      "oprcb5": { "desc": "动态--删除", "callback":"toDyncDelete"},
      "oprcb6": { "desc": "回复--审核通过", "callback":"toReplyReview","flag":true},
      "oprcb7": { "desc": "回复--审核不通过", "callback": "toReplyReview", "flag": false},
      "oprcb8": { "desc": "回复--删除", "callback":"toReplyDelete"},
    },

    //审核状态信息
    auditinfo:{
      "audit0": "待审核",
      "audit1": "审核通过",
      "audit2": "审核不通过"
    },

    defaultheadimg: "/images/buddha.png", //默认头像图
    pretime: 0, //刷新时间戳
    hideinputtxt: true //隐藏底部回复文本输入框
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
   * 动态--打开操作列表
   */
  showPitemOprMenu: function (evt) {
    this.hideInputtxt();
    var that = this,
        d = this.data,
        dt = evt.currentTarget.dataset,
        pindex = dt.pindex,
        dyncinfo = d.dyncinfo || {},
        plist = dyncinfo.plist || [],
        curpitem = plist[pindex],
        curdyncid = curpitem.id,
        oprmenuinfo = d.oprmenuinfo,
        isadmin = d.isadmin || false,
        ismyself = d.uid==curpitem.uid?true:false,
        isfrommyself = d.isfrommyself || false;
    
    //不是管理员身份，不是本人动态，不予操作
    if (!isadmin && !ismyself && !isfrommyself){
        return;
      }
      var curoprmenuinfo = isfrommyself ? oprmenuinfo["oprdync3"]:(isadmin ? oprmenuinfo["oprdync" + curpitem.audit] : oprmenuinfo["oprdync3"]); //从“我的个人主页”进入，只能进行删除操作

    this.resetFavioPanel(pindex,true,function(){
      wx.showActionSheet({
        itemList: curoprmenuinfo.menulist,
        success: function (res) {
          var menuidlist = curoprmenuinfo.menuidlist,
            oprcbid = menuidlist[res.tapIndex],
            oprcbinfo = d.oprcbinfo,
            curoprcbinfo = oprcbinfo["oprcb" + oprcbid],
            oprcbname = curoprcbinfo.callback;

          that[oprcbname](pindex,curdyncid, curoprcbinfo.flag);
        },
        fail: function (res) {
          console.log(res.errMsg);
        }
      });
    });    
  },

  /**
   * 动态--置顶||取消置顶
   * pindex 动态索引
   * curdyncid 当前动态id
   * flag 是否审核通标志
   */
  toDyncTop: function (pindex,curdyncid, flag) {
    var that = this,
      d = this.data,
      dyncinfo = d.dyncinfo || {},
      plist = dyncinfo.plist || [];

    var url = (flag ? "/comment/set_top/" : "/comment/cancel_top/") + curdyncid;
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      var msg = (flag ? "置顶" : "取消置顶") +"成功，查看效果请手动刷新页面";
      util.showSuccToast(that, msg, true);
    });
  },

  /**
   * 动态--审核通过||审核不通过
   * pindex 动态索引
   * curdyncid 当前动态id
   * flag 是否审核通标志
   */
  toDyncReview: function (pindex,curdyncid,flag){
    var that = this,
        d = this.data,
        dyncinfo = d.dyncinfo||{},
        plist = dyncinfo.plist||[],
        curpitem = plist[pindex];

    var url = (flag ? "/comment/audit/" : "/comment/refuse/") + curdyncid;
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      curpitem.audit = flag ? 1 : 2;  //审核状态 0未审核，1审核通过 2审核未通过
      that.setData({
        dyncinfo: dyncinfo
      });
      util.showSuccToast(that, "设置成功", true);
    });
  },

  /**
   * 动态--删除
   * pindex 动态索引
   * curdyncid 当前动态id
   */
  toDyncDelete: function (pindex,curdyncid) {
    var that = this,
      d = this.data,
      hasdeletecount = d.hasdeletecount||0, //已删除动态条数
      dyncinfo = d.dyncinfo || {},
      plist = dyncinfo.plist || [],
      curpitem = plist[pindex];
    
    wx.showModal({
      title: '温馨提示',
      content: '确定删除该动态，删除后不可恢复？',
      success: function (res) {
        if (res.confirm) {
          var url = "/comment/del/" + curdyncid;
          var paramInfo = "";
          app.postRequest(that, url, paramInfo, "GET", function (rst) {
            curpitem.status = 0;  //0删除 1正常
            hasdeletecount++;
            if (hasdeletecount >= plist.length){
              dyncinfo.nodataflag = true;
              dyncinfo.theendflag = false;
            }
            that.setData({
              hasdeletecount: hasdeletecount,
              dyncinfo: dyncinfo
            });
            util.showSuccToast(that, "删除成功", true);
          });
        } else if (res.cancel) {

        }
      }
    });    
  },

  /**
   * 回复--打开操作列表
   */
  showCitemOprMenu: function (evt) {
    this.hideInputtxt();
    var that = this,
      d = this.data,
      dt = evt.currentTarget.dataset,
      pindex = dt.pindex,
      cindex = dt.cindex,
      dyncinfo = d.dyncinfo || {},
      plist = dyncinfo.plist || [],
      curpitem = plist[pindex],
      replylist = curpitem.replyList,
      curcitem = replylist[cindex],
      curdyncid = curpitem.id,
      curreplyid = curcitem.id,
      oprmenuinfo = d.oprmenuinfo,
      isfrommyself = d.isfrommyself,
      isadmin = d.isadmin || false,
      ismyself = d.uid==curcitem.uid?true:false;

    //不是管理员身份，不是本人回复，不予操作
    if (!isadmin && !ismyself && !isfrommyself){ 
      return;
    }
    var curoprmenuinfo = isfrommyself ? oprmenuinfo["oprreply3"]:(isadmin ? oprmenuinfo["oprreply" + curcitem.audit] : oprmenuinfo["oprreply3"]);

    this.resetFavioPanel(pindex, true, function () {
      wx.showActionSheet({
        itemList: curoprmenuinfo.menulist,
        success: function (res) {
          var menuidlist = curoprmenuinfo.menuidlist,
            oprcbid = menuidlist[res.tapIndex],
            oprcbinfo = d.oprcbinfo,
            curoprcbinfo = oprcbinfo["oprcb" + oprcbid],
            oprcbname = curoprcbinfo.callback;

          that[oprcbname](pindex,cindex,curdyncid, curreplyid, curoprcbinfo.flag);
        },
        fail: function (res) {
          console.log(res.errMsg);
        }
      });
    });
  },

  /**
   * 回复--审核通过||审核不通过
   * pindex 动态索引
   * cindex 回复索引
   * curdyncid 当前动态id
   * curreplyid 当前回复id
   * flag 是否审核通过标志
   */
  toReplyReview: function (pindex, cindex,curdyncid, curreplyid, flag) {
    var that = this,
      d = this.data,
      dyncinfo = d.dyncinfo || {},
      plist = dyncinfo.plist || [],
      curpitem = plist[pindex],
      replylist = curpitem.replyList,
      curcitem = replylist[cindex];

    var url = (flag ? "/comment/audit/" : "/comment/refuse/") + curreplyid;
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      curcitem.audit = flag ? 1 : 2;  //审核状态 0未审核，1审核通过 2审核未通过
      that.setData({
        dyncinfo: dyncinfo
      });
      util.showSuccToast(that, "修改成功", true);
    });
  },

  /**
   * 回复--删除
   * pindex 动态索引
   * cindex 回复索引
   * curdyncid 当前动态id
   * curreplyid 当前回复id
   */
  toReplyDelete: function (pindex, cindex,curdyncid, curreplyid) {
    var that = this,
      d = this.data,
      dyncinfo = d.dyncinfo || {},
      plist = dyncinfo.plist || [],
      curpitem = plist[pindex],
      replylist = curpitem.replyList,
      curcitem = replylist[cindex];

    wx.showModal({
      title: '温馨提示',
      content: '确定删除该动态，删除后不可恢复？',
      success: function (res) {
        if (res.confirm) {
          var url = "/comment/del/" + curdyncid + "/" + curreplyid;
          var paramInfo = "";
          app.postRequest(that, url, paramInfo, "GET", function (rst) {
            curcitem.status = 0;  //0删除 1正常
            that.setData({
              dyncinfo: dyncinfo
            });
            util.showSuccToast(that, "删除成功", true);
          });
        } else if (res.cancel) {

        }
      }
    });      
  },

  /**
   * 点赞||取消点赞
   */
  toggleLikeed: function(evt){
    var that = this,
      d = this.data,
      dt = evt.currentTarget.dataset,
      pindex = dt.pindex,      
      dyncinfo = d.dyncinfo || {},
      plist = dyncinfo.plist || [],
      curpitem = plist[pindex],
      isliked = !curpitem.isliked,
      curdyncid = curpitem.id,
      isfrommyself = d.isfrommyself||false,
      uid = isfrommyself ?curpitem.uid:d.uid;

    var url = (isliked ? "/comment/like/" :"/comment/unlike/") + curdyncid;
    var paramInfo = "";
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      var likelist = curpitem.likeList||[];
      if (isliked){ //点赞
        var nickname = app.globalData.userInfo.nickname;
        likelist.push({uid:uid,nick_name:nickname});
      }else{ //取消点赞
        for (var k = 0, klen = likelist.length; k < klen; k++) {
          if (likelist[k].uid == uid){
            likelist.splice(k,1);
            break;
          }
        }
      }
      
      curpitem.likeList = likelist;
      curpitem.isliked = isliked;
      curpitem.showmsgoprflag = false;
      curpitem.closemsgoprflag = true;

      dyncinfo.plist = plist;
      that.setData({
        dyncinfo: dyncinfo
      });
    });
  },

  /**
   * 显示评论回复输入区域
   */
  showInputTxt: function(evt){
    var d = this.data,
        dt = evt.currentTarget.dataset,
        pindex = dt.pindex,
        dyncinfo = d.dyncinfo || {},
        plist = dyncinfo.plist || [],
        curpitem = plist[pindex];
    curpitem.showmsgoprflag = false;
    curpitem.closemsgoprflag = false;
        
    this.setData({
      hideinputtxt: false,
      curpindex: pindex,
      dyncinfo: dyncinfo
    });
  },

  /**
   * 隐藏评论回复输入区域
   */
  hideInputtxt: function (evt) {  
    if (!this.data.hideinputtxt){
      this.setData({
        hideinputtxt: true,
        inputtxt: ""
      });
    }    
  },

  /**
   * 评论回复
   */
  toReply: function (evt) {
    var that = this,
        d = this.data,
        content = evt.detail.value,
        pindex = d.curpindex,
        dyncinfo = d.dyncinfo || {},
        plist = dyncinfo.plist || [],
        curpitem = plist[pindex],
        curdyncid = curpitem.id,
        replylist = curpitem.replyList || [];

    content = content ? util.trim(content):"";
    if (!content){
      util.showToast(that,"请输入回复内容");
      return;
    }

    var url = "/comment/post";
    var paramInfo = {
      content: content,
      images: "",
      cid: curdyncid  //如果为留言回复需要传此字段
    };
    app.postRequest(that, url, paramInfo, "POST", function (rst) {
      var curreply = rst.comment;
      curreply.status = 1;
      replylist.push(curreply);
      dyncinfo.plist[pindex].replyList = replylist;
      that.setData({
        hideinputtxt: true,
        inputtxt: "",
        dyncinfo: dyncinfo
      });
      util.showSuccToast(that, "回复成功", true);
    });
  },

  /**
   * 预览图片
   */
  previewImage: function (evt) {
    this.hideInputtxt();
    var that = this,
      d = this.data,
      dt = evt.currentTarget.dataset,
      pindex = dt.pindex,
      cindex = dt.cindex,
      dyncinfo = d.dyncinfo || {},
      plist = dyncinfo.plist || [],
      curpitem = plist[pindex],
      imglist = curpitem.imgs || [];

    wx.previewImage({
      current: imglist[cindex], // 当前显示图片的http链接
      urls: imglist // 需要预览的图片http链接列表
    })
  },

  /**
   * 显示||收起点赞与评论操作列表
   */
  toggleMsgoprcon: function(evt){
    this.hideInputtxt();
    var that = this,
        d = this.data,
        dt = evt.currentTarget.dataset,
        pindex = dt.pindex,
        curmsgoprpindex = d.curmsgoprpindex;
    if (curmsgoprpindex != pindex) { //点击其他选项
      this.resetFavioPanel(pindex);
    } else {  //点击当前选项
      var dyncinfo = d.dyncinfo || {},
          plist = dyncinfo.plist || [],
          curpitem = plist[pindex],
          curmsgoprflag = curpitem.showmsgoprflag;
      curpitem.showmsgoprflag = !curmsgoprflag;
      curpitem.closemsgoprflag = curmsgoprflag;
      this.setData({
        dyncinfo: dyncinfo
      });
    }
  },

  /**
   * 重置点赞与评论操作面板
   * curpindex 当前动态索引
   * allresetflag 所有选项重置标志
   * cb 回调函数
   */
  resetFavioPanel: function (curpindex,allresetflag,cb){
    var that = this,
      d = this.data,
      dyncinfo = d.dyncinfo || {},
      plist = dyncinfo.plist || [];
    for(var k=0,klen=plist.length; k<klen; k++){
      if (k == curpindex && !allresetflag){
        plist[k].showmsgoprflag = true;
        plist[k].closemsgoprflag = false;
      }else{
        plist[k].showmsgoprflag = false;
        plist[k].closemsgoprflag = false;
      } 
    }
    this.setData({
      curmsgoprpindex: curpindex,
      dyncinfo: dyncinfo
    });

    if(cb){
      cb();
    }
  },

  /**
   * 我要说
   */
  toComment: function () {
    var that = this;
    this.hideInputtxt();
    var uid = this.data.uid||"";
    if(!uid){
      util.showToast(that,"未获取到用户id");
      return;
    }
    this.setData({
      onreloadflag: null
    });
    wx.navigateTo({
      url: '/pages/comment/comment?uid=' + uid
    });
  },

  /**
   * 获取动态列表
   * curpagenum 当前页码
   * isfrommyself 是否从“我的个人主页”进入
   * refreshflag 是否刷新页面标识
   * cb 完成后回调
   */
  getCommentList: function (curpagenum, isfrommyself, refreshflag,cb){
    var that = this,
        d = this.data,
        dyncinfo = d.dyncinfo||{},
        isfrommyself = d.isfrommyself || (isfrommyself||false),
        curpagenum = curpagenum||1,
        pagesize = app.globalData.pagesize;
    console.log("当前页码：" + curpagenum);

    if (refreshflag){
      curpagenum = 1;
      dyncinfo.theendflag = false;
      dyncinfo.nodataflag = false;
      dyncinfo.plist = [];
    }
    if (dyncinfo.theendflag || dyncinfo.nodataflag) {
      return;
    }

    var url = (isfrommyself ? "/comment/list_self" : "/comment/list") + "?pageNum=" + curpagenum;
    var paramInfo = ""; //当前页码
    app.postRequest(that, url, paramInfo, "GET", function (rst) {
      var plist = rst.comment_list||[],
          plen = plist.length,
          uid = rst.uid||"",
          isadmin = rst.isAdmin||"",
          commentcount = rst.commentCount||0,
          usercount = rst.userCount||0;
      if (plen == 0) {
        if (curpagenum==1){
          dyncinfo.nodataflag = true;
        }else{
          dyncinfo.theendflag = true;
        }        
        that.setData({
          uid: uid,
          commentcount: commentcount,
          usercount: usercount,
          isadmin: isadmin,
          dyncinfo: dyncinfo
        });
        return;
      }

      if (d.isfrommyself){ //从个人主页进入，需要获取到用户的uid
        uid = plist[0].uid;
      }

      if (plen < pagesize){
        dyncinfo.theendflag = true;
      }
      for (var k = 0; k < plen; k++) {
        var curitem = plist[k],
            likelist = curitem.likeList||[];
        if(likelist.length>0){
          for(var t=0,tlen=likelist.length; t<tlen; t++){
            if(likelist[t].uid == uid){
              curitem.isliked = true;
              break;
            }
          }
        }
      }
      dyncinfo.curpagenum = curpagenum;
      dyncinfo.plist = dyncinfo.plist || [];
      dyncinfo.plist = dyncinfo.plist.concat(plist);

      that.setData({
        uid: uid,
        commentcount: commentcount,
        usercount: usercount,
        isadmin: isadmin,
        dyncinfo: dyncinfo
      });
    },null,function(){
      if(cb){
        cb();
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    var that = this,
      isfrommyself = options.isfrommyself||false;
    if (isfrommyself){
      that.setData({
        isfrommyself: true
      });
      wx.setNavigationBarTitle({
        title: '我的点评'
      });
      that.getCommentList(null, true);
    }else{
      that.getCommentList();
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
    var that = this,
        d = this.data;
    //从发表评论页返回进入刷新本页面
    if(d.onreloadflag){
      this.getCommentList(1,false,true);
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
    var that = this,
        d = this.data,
        curtime = new Date().getTime(),
        pretime = d.pretime;
    if (curtime - pretime < 1000 || d.refreshflag) {
      return;
    }
    this.setData({
      pretime: curtime,
      refreshflag: true
    });
    wx.stopPullDownRefresh(); 
    this.getCommentList(1, false,true,function(){         
      that.setData({
        refreshflag: false
      });
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var timestamp = new Date().getTime();
    if (timestamp - this.data.prevtimestamp < 1000) {
      return;
    }
    this.setData({
      prevtimestamp: timestamp
    });

    var curpagenum = this.data.curpagenum++;
    this.getCommentList(curpagenum);
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