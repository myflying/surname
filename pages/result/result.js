var resultImgUrl
var resultSavePath
var share_title
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '姓氏头像制作器',
    })
    //console.log(options.result_path)
    resultImgUrl = options.result_path
    resultSavePath = options.save_path
    share_title = options.share_title
    wx.showLoading({
      title: '图片加载中',
    })
    var that = this
    wx.getImageInfo({
      src: options.result_path,
      success:function(res){
        wx.hideLoading()
        that.setData({
          result_path: res.path
        })
      }
    })
  },
  save_btn:function(e){
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '我的姓氏图：'+share_title || '@你快来制作属于你的姓氏头像吧!',
      path: '/pages/result/result?result_path=' + resultImgUrl + '&save_path=' + resultSavePath
        + '&share_title=' + share_title,
      imageUrl: resultImgUrl
    }
  },

  preimage: function (e) {
    wx.previewImage({
      urls: [resultImgUrl],
      current: resultImgUrl
    })
  },

  saveImg: function () {
    var Page$this = this;
    wx.getSetting({
      success(res) {
        console.log(res)
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope:
              'scope.writePhotosAlbum',
            success() {
              Page$this.downimage();
            }
          })
        } else {
          Page$this.downimage();
        }
      },
      fail(err) {
        console.log(err)
        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          console.log("用户一开始拒绝了，我们想再次发起授权")
          console.log('打开设置窗口')
          wx.openSetting({
            success(settingdata) {
              console.log(settingdata)
              if (settingdata.authSetting['scope.writePhotosAlbum']) {
                console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                Page$this.downimage();
              }
              else {
                console.log('获取权限失败，给出不给权限就无法正常使用的提示')
              }
            }
          })
        }
      }
    })
  },
  downimage: function () {

    if (resultSavePath) {
      wx.showLoading({
        title: '文件下载中',
      })
      //文件下载
      wx.downloadFile({
        url: resultSavePath,
        success:
          function (res) {
            console.log(res);
            //图片保存到本地
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (data) {
                wx.hideLoading()
                console.log("save success--->" + data);
                wx.showToast({
                  title: '图片已保存',
                })
              },
              fail: function (err) {
                wx.hideLoading()
                console.log(err);
                if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                  console.log("用户一开始拒绝了，我们想再次发起授权")
                  console.log('打开设置窗口')
                  wx.openSetting({
                    success(settingdata) {
                      console.log(settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                      }
                      else {
                        console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                      }
                    }
                  })
                }
              }
            })
          }
      })
    } else {
      wx.showToast({
        title: '保存失败，请稍后再试',
      })
    }
  },
  create:function(e){
    wx.redirectTo({
      url: '/pages/home/home'
    })
  }
})