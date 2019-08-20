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
    checkOwner,
    listFollowing,
    follow,
    unfollow,
    listFollowers,
    checkUserExist,
    listFollowingTopics,
    followTopic,
    unfollowTopic,
    listQuestions,
    listLikingAnswers, likeAnswer, unlikeAnswers,
    listDislikingAnswers, dislikeAnswer, undislikeAnswers
} = require('../controllers/users')

const { checkTopicExist } = require('../controllers/topics')
const { checkAnswerExist } = require('../controllers/answers')
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

// 获取某人自己所关注的人的列表
router.get('/:id/following', async (ctx) => {
    await listFollowing(ctx)
})

// 关注某个用户
router.put('/following/:id', auth, checkUserExist, async (ctx) => {
    await follow(ctx)
})

// 取消关注某个用户
router.delete('/following/:id', auth, checkUserExist, async (ctx) => {
    await unfollow(ctx)
})

// 获取某个用户自己的粉丝列表
router.get('/:id/followers', async (ctx) => {
    await listFollowers(ctx)
})

// 获取某人关注的话题列表
router.get('/:id/followingTopics', async (ctx) => {
    await listFollowingTopics(ctx)
})

// 关注某个话题
router.put('/followingTopics/:id', auth, checkTopicExist, async (ctx) => {
    await followTopic(ctx)
})

// 取消关注某个话题
router.delete('/followingTopics/:id', auth, checkTopicExist, async (ctx) => {
    await unfollowTopic(ctx)
})

// 获取某个用户自己的问题列表
router.get('/:id/followers', async (ctx) => {
    await listQuestions(ctx)
})

router.get('/:id/likingAnswers', async (ctx) => {
    await listLikingAnswers(ctx)
})

router.put('/likingAnswers/:id', auth, checkAnswerExist, async (ctx, next) => {
    await likeAnswer(ctx, next)
}, undislikeAnswers)

router.delete('/likingAnswers/:id', auth, checkAnswerExist, async (ctx) => {
    await unlikeAnswers(ctx)
})

router.get('/:id/dislikingAnswers', async (ctx) => {
    await listDislikingAnswers(ctx)
})

router.put('/dislikingAnswers/:id', auth, checkAnswerExist, async (ctx, next) => {
    await dislikeAnswer(ctx, next)
}, unlikeAnswers)

router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, async (ctx) => {
    await undislikeAnswers(ctx)
})

module.exports = router
