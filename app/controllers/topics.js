const Topic = require('../models/topics')
const User = require('../models/users')
const Question = require('../models/questions')

class TopicsCtl {
    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id)
        if (!topic) {
            ctx.throw(404, '二哈还未来')
        }
        await next()
    }

    // 获取话题列表
    async find(ctx) {
        const { pre_page = 10 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        // 转换 String 为 Number
        const prePage = Math.max(pre_page * 1, 1)
        // limit()：表示限制每一次从数据库中取出数据的条数
        // skip()：表示跳过多少条数
        ctx.body = await Topic
        .find({name: new RegExp(ctx.query.q)})
        .limit(prePage)
        .skip(page * prePage)
    }

    // 查询特定话题
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const topic = await Topic.findById(ctx.params.id).select(selectFields)
        ctx.body = topic
    }
    
    // 创建一个话题
    async create(ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            avatar_url: {type: 'string', required: false},
            introduction: {type: 'string', required: false},
        })
        const topic = await new Topic(ctx.request.body).save()
        ctx.body = topic
    }

    // 更新话题
    async update(ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: false},
            avatar_url: {type: 'string', required: false},
            introduction: {type: 'string', required: false},
        })
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        ctx.body = topic
    }

    // 话题粉丝列表
    async listTopicFollowers(ctx) {
        console.log(ctx)
        const users = await User.find({ followingTopics: ctx.params.id })
        console.log(users)
        ctx.body = users
    }

    // 列出问题
    async listQuestions(ctx) {
        const questions = await Question.find({topics: ctx.params.id })
        ctx.body = questions
    }
}   

module.exports = new TopicsCtl()