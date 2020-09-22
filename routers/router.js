const Router = require('koa-router')
//拿到操作 user 表的逻辑对象
const user = require("../control/user")

const admin = require("../control/admin")

const article = require("../control/article")

const comment = require("../control/comment")

const { render } = require('pug')

const upload = require("../util/upload")

const router = new Router


//主要用于处理  用户登录  用户注册
router.get(/^\/user\/(?=reg|login)/, async (ctx) =>{
  //show 为true显示注册
  const show = /reg$/.test(ctx.path)
  await ctx.render("register", {show})
})


//设计主页
router.get('/', user.keepLog, article.getList)


//处理用户登录的 post 请求 路由
router.post("/user/login", user.login)


//用户注册路由
router.post("/user/reg", user.reg)


//用户推出
router.get("/user/logout",user.logout)


//文章的发表页面
router.get('/article', user.keepLog, article.addPage)


//文章的添加
router.post("/article", user.keepLog, article.add)


//文章列表分页路由
router.get("/page/:id", article.getList)


//文章的详情页路由
router.get("/article/:id", user.keepLog, article.details)


//发表评论的路由
router.post("/comment", user.keepLog, comment.addcomment)


//后台管理页面
router.get('/admin/:id', user.keepLog, admin.index)

//头像上传功能
router.post("/upload", user.keepLog, upload.single("file"), user.upload)

//获取用户的所有评论
router.get("/user/comments", user.keepLog, comment.commentlist)

//删除评论
router.del("/comment/:id", user.keepLog, comment.del)

//获取所有文章
router.get("/user/articles", user.keepLog, article.artList)

//删除用户的文章
router.del("/article/:id", user.keepLog, article.del)

module.exports = router