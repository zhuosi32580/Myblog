const crypto = require('crypto')

//返回加密成功的数据
module.exports = function(password,key = "fengyu da shuai bi"){
  const hmac = crypto.createHmac("sha256", key)
  hmac.update(password)
  const passwordHmac = hmac.digest("hex")//调用方法输出16进制的加密密码
  return passwordHmac
}