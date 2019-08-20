const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../config')
// 内存数据库
// const db = [{name: '李雷'}]

// 真实数据库
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')

class UsersCtl {
    // 自定义授权中间件
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403, '没有权限 ')
        }
        await next()
    }

    // 自定义检查用户是否存在中间件
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id)
        if (!user) {
            ctx.throw(404, '大哈已存在')
        }
        await next()
    }

    async find(ctx) {
        // 手动模拟 500 错误
        // a.b
        // ctx.body = db

        // 使用数据库操作
        // 特别注意：我们操作数据库的时候，是异步方法
        // 而路由是同步方法，所以当访问数据库的时候，我们需要将路由也改为异步方法
        const { pre_page = 10 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        // 转换 String 为 Number
        const prePage = Math.max(pre_page * 1, 1)
        // limit()：表示限制每一次从数据库中取出数据的条数
        // skip()：表示跳过多少条数
        ctx.body = await User
        .find({name: new RegExp(ctx.query.q)})
        .limit(prePage)
        .skip(page * prePage)
    }

    async findById(ctx) {
        // 手动模拟 412 错误
        //if (ctx.params.id * 1 >= db.length) {
            // ctx.throw(412, '先决条件失败，id 大于等于数组长度')
        //    ctx.throw(412)
        // }
        // ctx.body = db[ctx.params.id * 1]

        // 使用数据库操作
        // 取出请求地址上的参数
        const { fields = '' } = ctx.query; 
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        // .select('+educations+business') 表示在从数据库中获取到的结果中加上请求中的字段
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if (f === 'employments') {
                return 'employments.company employments.job'
            }
            if (f === 'educations') {
                return 'educations.school educations.major'
            }
            return f
        }).join(' ')
        const user = await User.findById(ctx.params.id).select(selectFields)
        .populate(populateStr)
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user
    }

    async create(ctx) {
        // 校验请求参数
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: {type: 'string', required: true}
        })

        // db.push(ctx.request.body);
        // ctx.body = ctx.request.body

        // 判断数据唯一性
        // 查找数据库中是否已经存在此条数据
        const { name } = ctx.request.body
        const repeatedUser = await User.findOne({ name })
        if (repeatedUser) {
            ctx.throw(409, '用户已存在')
        }
        
        // 向数据库插入数据
        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }

    async update(ctx) {
        // 手动模拟 412 错误
        // if (ctx.params.id * 1 >= db.length) {
            // ctx.throw(412, '先决条件失败，id 大于等于数组长度')
        //     ctx.throw(412)
        // }

        // 校验请求参数
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            business: { type: 'string', required: false },
            employments: { type: 'array', itemType: 'object', required: false },
            educations: { type: 'array', itemType: 'object', required: false }
        })

        // db[ctx.params.id * 1] = ctx.request.body
        // ctx.body = ctx.request.body

        // 更新数据库中用户信息
        // new: true 表示返回修改后的信息
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body, {new: true})
        

        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = await user
    }

    async delete(ctx) {
        // 手动模拟 412 错误
        // if (ctx.params.id * 1 >= db.length) {
            // ctx.throw(412, '先决条件失败，id 大于等于数组长度')
        //    ctx.throw(412)
        //}
        
        // db.splice(ctx.params.id * 1, 1)
        // 

        // 删除数据库中的数据
        const user = await User.findByIdAndRemove(ctx.params.id)
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.status = 204
    }

    async login(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const user = await User.findOne(ctx.request.body)
        if (!user) {
            ctx.throw(401, '用户名或密码不正确')
        }
        const { _id, name } = user
        const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
        ctx.body = { token }
    }

    // 获取某人自己所关注的人的列表
    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.following
    }

    // 获取粉丝列表
    async listFollowers(ctx) {
        const users = await User.find({following: ctx.params.id})
        ctx.body = users
    }

    // 关注某个用户
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following')
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }

    // 取消关注某个话题
    async unfollowTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.followingTopics.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    // 获取用户关注话题列表
    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.followingTopics
    } 

    // 关注某个话题
    async followTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }

    // 取消关注某个用户
    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.followingTopics.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    async listQuestions(ctx) {
        const questions = await Question.find({ questioner: ctx.params.id })
        ctx.body = questions
    }

    // 获取用户喜欢的回答
    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.likingAnswers
    } 

    // 喜欢某个回答
    async likeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswers.push(ctx.params.id)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { votecount: 1 }})
        }
        ctx.status = 204
        await next()
    }

    // 取消喜欢某个回答
    async unlikeAnswers(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
        const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.likingAnswers.splice(index, 1)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { votecount: -1 }})
        }
        ctx.status = 204
    }

    // 获取用户喜欢的回答
    async listDislikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.dislikingAnswers
    } 

    // 喜欢某个回答
    async dislikeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikingAnswers.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
        await next()
    }

    // 取消喜欢某个回答
    async undislikeAnswers(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
        const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.dislikingAnswers.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
}

module.exports = new UsersCtl()