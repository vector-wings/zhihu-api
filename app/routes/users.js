const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/users'})
const { 
    find, 
    findById, 
    create, 
    update, 
    delete: del, 
    login,
    checkOwner
} = require('../controllers/users')

const { secret } = require('../config')

// 添加自定义验证中间件(jwt)
// const auth = async (ctx, next) => {
//     const { authorization = '' } = ctx.request.header
//     const token = authorization.replace('Bearer ', '')
//     try {
//         const user = jsonwebtoken.verify(token, secret)
//         ctx.state.user = user
//     } catch (err) {
//         ctx.throw(401, err.message)
//     }
//     await next()
// }

// 使用社区中间件 koa-jwt
// koa-jwt 集成了 jsonwebtoken，可以实现 token 的提取和校验
const auth = jwt({ secret })

// 获取用户列表 
router.get('/', async (ctx) => {
    // 设置响应头
    // ctx.set('Allow', 'GET, POST')
    // ctx.body = db

    await find(ctx)
})

// 新增用户
router.post('/', async (ctx) => {
    // 从请求体中获取用户
    // db.push(ctx.request.body);
    // ctx.body = ctx.request.body
    
    await create(ctx)
})

// 获取特定用户
router.get('/:id', async (ctx) => {
    // ctx.body = db[ctx.params.id * 1]

    await findById(ctx)
})

// 修改用户，倾向于整体替换
// put：整体替换
// patch：部分替换
// checkOwner 放在 auth 后面
// 因为验证是授权的基础
router.patch('/:id', auth, checkOwner, async (ctx) => {
    // db[ctx.params.id * 1] = ctx.request.body
    // ctx.body = ctx.request.body

    await update(ctx)
})

// 删除用户
router.delete('/:id', auth, checkOwner, async (ctx) => {
    // db.splice(ctx.params.id * 1, 1)
    // ctx.status = 204

    await del(ctx)
})

// 登录
router.post('/login', async (ctx) => {
    await login(ctx)
})


module.exports = router
