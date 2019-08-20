const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/topics'})
const { 
    find, 
    findById, 
    create, 
    update,
    listTopicFollowers,
    checkTopicExist,
    listQuestions,
} = require('../controllers/topics')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', async (ctx) => {
    await find(ctx)
})

router.post('/', auth, async (ctx) => {
    await create(ctx)
})

router.get('/:id', checkTopicExist, async (ctx) => {
    await findById(ctx)
})

router.patch('/:id', auth, checkTopicExist, async (ctx) => {
    await update(ctx)
})

router.get('/:id/followers', checkTopicExist, async (ctx) => {
    await listTopicFollowers(ctx)
})

router.get('/:id/questions', checkTopicExist, async (ctx) => {
    await listQuestions(ctx)
})

module.exports = router
