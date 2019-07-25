const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../config')
// 内存数据库
// const db = [{name: '李雷'}]

// 真实数据库
const User = require('../models/users')

class UsersCtl {
    // 自定义授权中间件
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403, '没有权限 ')
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
        const users = await User.find()
        ctx.body = users
    }

    async findById(ctx) {
        // 手动模拟 412 错误
        //if (ctx.params.id * 1 >= db.length) {
            // ctx.throw(412, '先决条件失败，id 大于等于数组长度')
        //    ctx.throw(412)
        // }
        // ctx.body = db[ctx.params.id * 1]

        // 使用数据库操作
        const user = await User.findById(ctx.params.id)
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
            name: {type: 'string', required: false},
            password: {type: 'string', required: false}
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
}

module.exports = new UsersCtl()