const { Schema } = require('./config')

const ObjectId = Schema.Types.ObjectId

const ArticleSchema = new Schema({
  title: String,
  content: String,
  author: {
    type: ObjectId,
    ref: "users"
  },
  tips: String,
  commentNum: Number
}, {
  versionKey: false, timestamps:{
    createdAt: "created"//时间
  }})

ArticleSchema.post("remove",doc =>{
  const Comment = require('../Models/comment')
  const User = require('../Models/user')
  const {_id:artId, arthor: authorId} = doc

  //用户的articleNum -1
  User.findByIdAndUpdate(authorId,{$inc:{articleNum: -1}}).exec()
  //把当前需要删除的文章所关联的多有评论 调用一次  remove
  Comment.find({article:artId})
    .then(data =>{
      data.forEach(v => v.remove)
    })
})
module.exports = ArticleSchema