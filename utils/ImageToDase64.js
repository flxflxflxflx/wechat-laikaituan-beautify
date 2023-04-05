var fs = wx.getFileSystemManager()
   // 转码
   try {
    avatar = fs.readFileSync(result[item][i].url, "base64")
  } catch (e) {
    avatar = null
  }