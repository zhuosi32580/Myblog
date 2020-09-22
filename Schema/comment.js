const { Schema } = require('./config')

const ObjectId = Schema.Types.ObjectId

const CommentSchema = new Schema({
 
  content: String,
  //关联到用户的集合
  from: {//作者
    type: ObjectId,
    ref: "users"
  },
  //关联到文章的集合
  article:{
    type: ObjectId,
    ref: "articles"
  }

}, {
  versionKey: false, timestamps:{
    createdAt: "created"//时间
  }})

  //设置comment的remove 钩子
  CommentSchema.post("remove",(doc) =>{
    
    const Article = require("../Models/article")
    const User = require("../Models/user")
    const {from:userId, article} = doc
    //对应文章的评论数减一
    Article.updateOne({_id: article},{$inc:{commentNum: -1}}).exec()
    //当前被删除评论的文章的commentNum -1
    User.updateOne({_id: userId},{$inc:{commentNum: -1}}).error()
  })



module.exports = CommentSchema