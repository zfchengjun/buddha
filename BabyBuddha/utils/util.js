
//var serverurl = "https://dev.open.baobaofo.net"; //v2测试环境
// var serverurl = "http://bbf.pmyan.com";  //v1测试环境
var serverurl = "https://open.baobaofo.net"; //正式环境
var imguploadurl = "https://cdn.baobaofo.net"; //图片上传地址

module.exports = {
  serverurl: serverurl,
  imguploadurl: imguploadurl,
  formatTime: formatTime,
  trim: trim, 
  showLoading: showLoading, //加载中
  showLoadingAuto: showLoadingAuto,
  showToast: showToast, //显示提示信息
  showSuccToast: showSuccToast, //显示成功提示信息
  transToChinese: transToChinese, //转换成中文
  cloneObj: cloneObj,
  postRequest: postRequest  
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function transToChinese(num){
  var wt = "";
  switch(num){
    case 1: wt = "一"; break;
    case 2: wt = "二"; break;
    case 3: wt = "三"; break;
    case 4: wt = "四"; break;
    case 5: wt = "五"; break;
    case 6: wt = "六"; break;
    case 7: wt = "七"; break;
    case 8: wt = "八"; break;
    case 9: wt = "九"; break;
    case 10: wt = "十"; break;
    default: wt = num; break;
  }
  return wt;
}


/**
 * 返回刷新设置
 */
function ctrlBack(_that){
  var pages = getCurrentPages();
  var pagelen = pages.length;
  var prevpage = pages[pagelen - 2]; //上一页

      prevpage.setData({
        onreloadflag: true
      });

      //返回上一页
      wx.navigateBack({
        delta: 1
      });
}

/**
 * 去除字符串两边的空格 
 */
function trim(str) {
  return str ? str.replace(/^\s*$/, "") : "";
}

/**
 * clone对象
 */
function cloneObj(obj) {
  var newObj = {};
  for (var prop in obj) {
    newObj[prop] = obj[prop];
  }
  return newObj;
}

/**
 * 显示loading：
 * showFlag 是否显示loading
 */
function showLoading(_that,showFlag) {
  if (showFlag) {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true
    });
  } else {
    wx.hideToast();
  }
}

/**
 * 显示loading：
 * showFlag 是否显示loading
 */
function showLoadingAuto(_that, showFlag) {
  _that.setData({
    loadinginfo: {
      showflag: showFlag
    }
  });
}

/**
 * 提示消息：
 * msg 提示消息字符串
 */
function showToast(_that, msg) {
  msg = msg + "";
  _that.setData({
    toastinfo: {
      showflag: true,
      msg: msg
    }
  });

  setTimeout(function () {
    _that.setData({
      toastinfo: {
        showflag: false,
        msg: ""
      }
    });
  }, 2000);
}

/**
 * 提示消息:
 * msg 提示消息字符串
 * succFlag 是否显示成功图标
 */
function showSuccToast(that, msg, succFlag,cb) {
  msg = msg + "";
  that.setData({
    toastinfo: {
      showaliconflag: succFlag ? true : false,
      showflag: true,
      msg: msg
    }
  });

  setTimeout(function () {
    that.setData({
      toastinfo: {
        showaliconflag: false,
        showflag: false,
        msg: ""
      }
    });
    if(cb){
      cb();
    }
  }, 2000);
}

/**
 * 过滤emoji表情
 */
function filterEmoji(emojireg) {
  var ranges = [
    '\ud83c[\udf00-\udfff]',
    '\ud83d[\udc00-\ude4f]',
    '\ud83d[\ude80-\udeff]',
    ''
  ];
  emojireg = emojireg.replace(new RegExp(ranges.join('|'), 'gm'), '*');
  return emojireg;
}

/**
 * 发起服务器请求：
 * url 接口地址
 * paramInfo 传送数据
 * requestType 请求方式(不传默认为GET)
 * succCb 请求成功回调
 * failCb 请求失败回调
 * completeCb 请求完成回调
 * extendinfo 扩展信息对象，用于其他一些逻辑判断
 * 
 * eg:
 *  var url = "/login/bindWxin";
    var paramInfo = {
      username: username,
      password: password,
      wxinid: openid
    };
    util.postRequest(this,url, paramInfo, "POST", function (data) {
      util.showToast("登录成功");
    });
 */
function postRequest(_that,url, paramInfo, requestType, succCb, failCb, completeCb,extendinfo) {
    url = serverurl + url;
//  url = requestType.toLowercase() == "get" ? url + paramInfo:url;
//  paramInfo = requestType.toLowercase() == "get" ? "" : paramInfo;

  console.log("接口路径", url);
  console.log("接口入参：", paramInfo);
  if (!extendinfo || !extendinfo.notShowLoading){
    showLoading(_that, true);
  }
  //content-type设置
  var contenttype = extendinfo && extendinfo.contenttype ? "application/json" :"application/x-www-form-urlencoded";
  
  var headerinfo = {};
      headerinfo["content-type"] = contenttype;
      // headerinfo["Content-Type"] = contenttype;
  if (extendinfo && extendinfo.token){
    headerinfo["token"] = extendinfo.token;
  }

  requestType = (requestType?requestType:"GET");
  console.log("请求方式："+requestType);
  wx.request({
    url: url, //仅为示例，并非真实的接口地址
    data: paramInfo,
    method: requestType,
    header: headerinfo,
    success: function (res) {
      showLoading(_that, false);
      console.log("接口返回数据：", res.data);
      var rstInfo = res.data;

      if (extendinfo && extendinfo.notdealcode) {
        succCb(rstInfo);
        return;
      }

      var code = rstInfo.code;
      if (code == 0){
        if (succCb) {
            succCb(rstInfo.data);
        }
      } else {
        if (rstInfo.msg){
          showToast(_that, rstInfo.msg);
        }
        
        if (failCb) {
          failCb(res.data);
        }
      }
    },
    fail: function (res) {
      showToast(_that,"网络不给力，请稍后再试");
    },
    complete: function (res) {
        showLoading(_that, false);
        if (_that.data && _that.data.loading){
          _that.setData({
            loading: false
          });
        }
        if (completeCb) {
          completeCb();
        }
    }
  });
}
