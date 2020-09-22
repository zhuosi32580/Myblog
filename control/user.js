const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')
const encrypt = require("../util/encrypt")


//用户注册
exports.reg = async (ctx) =>{

  //用户注册是发过来的数据
  const user = ctx.request.body
  const username = user.username
  const password = user.password

  //到数据库查询 用户名是否存在
  await new Promise((resolve,reject) =>{
    User.find({username}, (err,data) =>{
      if(err)return reject(err)
      //查询没出错   还有可能没有数据
      if(data.length !== 0){
        //用户名已存在
        return resolve("")
      }

      //用户名不存在   存到数据库  密码加密
      const _user = new User({
        username,
        password: encrypt(password),
        commentNum: 0,
        articleNum: 0
      })

      _user.save((err,data) =>{
        if(err){
          reject(err)
        }else{
          resolve(data)
        }
      })
    })
  })
  .then(async data =>{
    if(data){
      //注册成功
      await ctx.render("isOk",{
        status: '注册成功'
      })
    }else{
      //用户名已存在
      await ctx.render("isOk",{
        status: '用户名已存在'
      })
    }
  })
  .catch(async err =>{
    await ctx.render("isOk",{
      status: '注册失败，请重试'
    })
  })
}

//用户登录
exports.login = async (ctx) =>{
  //登录用户发过来的post数据
  const user = ctx.request.body
  //提出用户名的密码
  const username = user.username
  const password = user.password

  //到数据库查询用户名和密码是否正确
  await new Promise((resolve,reject) =>{
    User.find({username},(err,data) =>{
      //查询出错
      if(err)return reject(err)
      if(data.length === 0)return reject("用户名不存在")
      //把用户传过来的密码  加密后跟数据库的对比
      if(data[0].password === encrypt(password)){
        return resolve(data)
      }
      resolve("")
    })
  })
  .then(async data =>{
    if(!data){
      return ctx.render('isOk',{
        status: "密码不正确，登录失败"
      })
    }

    //让用户在他的 cookie 里面设置 username password 加密后的密码、权限
    ctx.cookies.set("username",username,{
      domain: "localhost",
      path: "/",
      maxAge: 36e5,
      httpOnly: true,//不让客户访问这个cookie
      overwrite: false//是否覆盖
    })
    //用户在数据库的id值
    ctx.cookies.set("uid",data[0]._id,{
      domain: "localhost",
      path: "/",
      maxAge: 36e5,
      httpOnly: true,//不让客户访问这个cookie
      overwrite: false//是否覆盖
    })

    ctx.session = {
      username,
      uid: data[0]._id,
      avatar: data[0].avatar,
      role: data[0].role
    }
    //登录成功
    await ctx.render("isOk",{
      status: "登录成功"
    })
  })
  .catch(async err =>{
    await ctx.render("isOk",{
      status: "登录失败"
    })
  })
}

//确定用户的状态  保持用户的状态
exports.keepLog = async(ctx,next) =>{
  if(ctx.session.isNew){//session没有
    if(ctx.cookies.get("username")){
      let uid = ctx.cookies.get("uid")
      const avatar = await User.findById("uid")
        .then(data => data.avatar)
      
      ctx.session = {
        username: ctx.cookies.get("username"),
        uid,
        avatar
      }
    }
  }
  await next()
}


//用户退出
exports.logout = async (ctx) =>{
  ctx.session = null
  ctx.cookies.set("username",null,{
    maxAge: 0
  })

  ctx.cookies.set("uid",null,{
    maxAge: 0
  })
  //在后台重定向到跟目录
  ctx.redirect("/")
}


//用户的头像上传
exports.upload = async (ctx) =>{
  const filename = ctx.req.file.filename
  let data = {}
  await User.update({_id: ctx.session.uid},{$set: {avatar: "/avatar/"+ filename}},(err,res) =>{
    if(err){
      data = {
        status: 0,
        message: "上传失败"
      }
    }else{
      data = {
        status: 1,
        message: "上传成功"
      }
    }
  })
  ctx.body = data
}