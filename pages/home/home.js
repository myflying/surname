// pages/home/home.js
var user_head_url
var user_input_surname
var share_img
var share_title
var float_img
var new_app_id
var new_pre_img
Page({

  /**
   * 页面的初始数据
   */
  data: {
    floatImg:'../../images/head_style.png',
    isUse: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '姓氏头像制作器',
    })
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log('version--->' + res.SDKVersion)
        var result = that.compareVersion(res.SDKVersion, '2.0.7')
        that.setData({
          isUse: result >= 0 ? true : false
        })
      },
    })

    this.getShareInfo();
  },

  onShow: function(e) {
    
  },

  getShareInfo:function(e){
    var that = this
    wx.request({
      url: 'https://cj.198254.com/api/v1.game/getAppInfo',
      method: 'POST',
      data: {
        'app_id': 35
      },
      success: function (res) {
        console.log(res.data.data.more_app_info)
        //console.log(res.data)
        //var index = Math.floor(Math.random() * 2);
        var index = 0;
        if (res.data.data && res.data.data.share_ico) {
          var simgs = res.data.data.share_ico;
          var stitles = res.data.data.share_title;
          if (simgs && simgs.length > 0 && stitles && stitles.length > 0) {
            share_img = simgs[index]
            share_title = stitles[index]
          }
        }

        if (res.data.data.more_app_info[0]) {
          float_img = res.data.data.more_app_info[0].img
          new_app_id = res.data.data.more_app_info[0].url;
          new_pre_img = res.data.data.more_app_info[0].xcx_img
          if (new_app_id) {
            that.setData({
              is_nav: true,
              app_id: new_app_id
            })
          } else {
            that.setData({
              is_nav: false
            })
          }

          if (float_img) {
            that.setData({
              floatImg: float_img
            })
          }
        }

      }
    })
  },
  inputSurname: function(e) {
    user_input_surname = e.detail.value
    console.log(e.detail.value)
  },
  newApp: function (e) {
    if (!new_app_id) {
      wx.previewImage({
        urls: [new_pre_img],
        current: new_pre_img
      })
    } else {
      wx.navigateToMiniProgram({
        appId: new_app_id
      })
    }
  },
  create: function() {

    wx.request({
      url: 'https://cj.198254.com/api/water/init',
      method: 'POST',
      data: {
        'app_id': 35,
        'xing': user_input_surname,
        'headimg': user_head_url,
      },
      success: function(res) {
        console.log(res.data)
        wx.hideLoading()
        if (res.data.code == 1) {
          console.log(res.data.filename)
          wx.navigateTo({
            url: '/pages/result/result?result_path=' + res.data.filename_copy + '&save_path=' + res.data.filename
              + '&share_title=' + res.data.content
          })
        } else if (res.data.code == -1) {
          wx.showToast({
            title: '含有敏感词，请重新输入',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '制作失败，请重试',
            icon: 'none'
          })
        }
      }
    })
  },

  onGotUserInfo: function(e) {
    var that = this
    if (!user_input_surname) {
      wx.showToast({
        title: '请输入你的姓氏',
        icon: 'none'
      })
      return
    }

    wx.getStorage({
      key: 'user_info',
      success: function(res) {
        var userInfo = res.data
        user_head_url = userInfo.avatarUrl
        wx.showLoading({
          title: '正在制作中',
        })
        that.create()
      },
      fail: function(res) {

        wx.login({
          success: function(res) {
            wx.getUserInfo({
              lang: "zh_CN",
              success: function(userRes) {
                console.log("用户已授权")
                console.log(userRes.userInfo)
                if (null != userRes && null != userRes.userInfo) {
                  user_head_url = userRes.userInfo.avatarUrl
                  wx.setStorage({
                    key: 'user_info',
                    data: userRes.userInfo
                  })
                  wx.showLoading({
                    title: '正在制作中',
                  })
                  that.create()
                }
              }
            })
          }
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: share_title || '@你快来制作属于你的姓氏头像吧!',
      path: '/pages/home/home',
      imageUrl: share_img
    }
  },
  compareVersion: function (v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (var i = 0; i < len; i++) {
      var num1 = parseInt(v1[i])
      var num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0
  }
})