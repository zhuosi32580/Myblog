const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')




//导出文章发表页
exports.addPage = async (ctx) =>{
  await ctx.render("add-article.pug",{
    title: "文章发表页",
    session: ctx.session
  })
}


//文章的发表   保存到数据库
exports.add = async (ctx) =>{
  if(ctx.session.isNew){
    return ctx.body = {
      msg: "用户未登录",
      status: 0
    }
  }

  //用户登录的情况
  const data = ctx.request.body//用户在登录情况下post发过来的数据
  //添加文章作者
  data.author = ctx.session.uid
  data.commentNum = 0
  //更新用户文章计数
  User.update({_id: data.author},{$inc: {articleNum: 1}},err =>{
    if(err)return console.log(err)
  })//递增1


  //存到数据库
  await new Promise((resolve, reject) => {
    new Article(data).save((err, data) =>{
      if(err)return reject(err)
      resolve(data)
    })
  })
  .then(data =>{
    ctx.body = {
      msg: "发表成功",
      status: 1
    }
  })
  .catch(err =>{
    ctx.body = {
      msg: "发表失败",
      status: 0
    }
  })
}


//获取文章列表(首页)
exports.getList = async ctx =>{
//查询文章并把每一篇文章的头像返回到前端
  let page = ctx.params.id || 1
  page--
  
  //获取数据库中所有数据的数量（一共有多少条数据）
  const maxNum = await Article.estimatedDocumentCount((err,num) =>err? console.log(err) : num)

  //查找数据
  const data = await Article
    .find()
    .sort('-created')//排序
    .skip(3 * page)//跳过
    .limit(3)//筛选  拿到 5 条数据
    .populate({
      path:"author",
      select: "username _id avatar"
    })//mongose用于连表查询
    .then(data => data)
    .catch(err =>console.log(err))


    //渲染页面
  await ctx.render("index", {
    session: ctx.session,
    title: '实战博客首页',
    artList: data,
    maxNum
  })
}

//文章的详情页
exports.details = async ctx =>{
  //取动态路由里的id值
  const _id = ctx.params.id

  const article = await Article
    .findById(_id)
    .populate({
      path: "author",
      select: "username"
    })//连表查询
    .then(data =>data)

    const comment = await Comment
      .find({article: _id})
      .sort("-created")
      .populate("from","username avatar")
      .then(data => data)
      .catch(err => console.log(err))
  
  await ctx.render("article",{
    title: article.title,
    article,
    session: ctx.session,
    comment
  })
}

//返回用户所有的文章
exports.artList = async ctx =>{
  const uid = ctx.session.uid

  const data = await Article.find({author: uid})

  ctx.body ={
    code: 0,
    count: data.length,
    data
  }
}


//删除对应 id  的文章
exports.del = async ctx =>{
  const _id = ctx.params.id
  let res ={
    state:1,
    message:"成功"
  }
  
  await Article.findById(_id)
    .then(data =>data.remove())
    .catch(err =>{
      res ={
        state:0,
        message:err
      }
    })

  ctx.body = res
}
