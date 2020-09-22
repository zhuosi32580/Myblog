const Koa = require('koa')
const static = require('koa-static')
const views = require('koa-views')
const router = require('./routers/router')
const { join } = require('path')
const koaBody = require('koa-body')
const logger = require('koa-logger')
const session = require('koa-session')
const compress = require("koa-compress")


//生成koa 实例
const app = new Koa

app.keys = ["灼思是个大帅逼"]

//session 的配置对象
const CONFIG = {
  key: "Sid",
  maxAge: 36e5,
  overwrite: true,
  httpOnly: true,
  //signed: true,
  rolling: true
}

app
  .use(logger())//注册日志文件
  .use(compress({
    // filter: function(content_type){
    //   return /text/i.test(content_type)
    // },
    threshold:2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }))//注册资源压缩模块
  .use(session(CONFIG, app))
  .use(koaBody())//处理post的数据
  .use(static(join(__dirname, "public")))//配置静态文件
  .use(views(join(__dirname, "views"),{
      extension: "pug"
  }))//配置视图模板

//注册路由
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () =>{
  console.log('项目启动成功  监听在300端口')
}) 

   
// 创建管理员用户 admin admin
{
  const { db } = require("./Schema/config")

  const UserSchema = require("./Schema/user")

  const encrypt = require('./util/encrypt')//加密模块

  //通过 db 对象创建操作集合 user 的模型对象
  const User = db.model("users", UserSchema)

  User
    .find({username: "admin"})
    .then(data => {
      if(data.length === 0){
        //管理员不存在
        new User({
          username: "admin",
          password: encrypt("admin"),
          role: 666,
          commenteNum: 0,
          articleNum: 0
        })
        .save()
        .then(data => {
          console.log("用户名为：admin  密码 --> admin")
        })
        .catch(err =>{
          consele.log("管理员账号检查失败")
        })

      }else{
        // 在控制台输出
        console.log("用户名为：admin  密码 --> admin")
      }
    })

}