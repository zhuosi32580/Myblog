const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')





//保存评论
exports.addcomment = async (ctx) =>{
  let message = {
    status: 0,
    msg: '登录才能发表评论'
  }
  //验证用户是否登录
  if(ctx.session.isNew) return ctx.body = message

  const data = ctx.request.body
  data.from = ctx.session.uid
  const _comment = new Comment(data)
  await _comment
    .save()
    .then(data =>{
      message = {
        status: 1,
        msg: '评论成功'
      }

      //更新当前文章的评论计数器
      Article
        .update({_id: data.article},{$inc: {commentNum: 1}},err =>{
          if(err)return  console.log(err)
          console.log("评论计数器保存成功")
        })
        
        User.update({_id: data.from},{$inc:{commentNum: 1}},err =>{
          if(err)return console.log(err)
        })
    })
    .catch(err =>{
      message ={
        status: 0,
        msg: err
      }
    })
  ctx.body = message  
}

//查询用户所有评论
exports.commentlist = async (ctx) =>{
  const uid = ctx.session.uid

  const data = await Comment.find({from: uid}).populate("article","title")
  ctx.body = {
    code:0,
    count: data.length,
    data
  }
}

//删除对应ID的评论
exports.del = async (ctx) =>{

  //取到评论ID 删除comment
  const commentId = ctx.params.id

  let res ={
    state:1,
    message:"成功"
  }
  
  await Comment.findById(commentId)
    .then(data =>{data.remove()})
    .catch(err =>{
      res ={
        state:0,
        message:err
      }
    })

  ctx.body = res
  
}