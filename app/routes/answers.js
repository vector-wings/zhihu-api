const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/questions/:questionId/answers'})
const { 
    find, 
    findById, 
    create, 
    update,
    delete: del,
    checkAnswerExist,
    checkAnswerer,
} = require('../controllers/answers')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', async (ctx) => {
    await find(ctx)
})

router.post('/', auth, async (ctx) => {
    await create(ctx)
})

router.get('/:id', checkAnswerExist, async (ctx) => {
    await findById(ctx)
})

router.patch('/:id', auth, checkAnswerExist, checkAnswerer, async (ctx) => {
    await update(ctx)
})

router.delete('/:id', auth, checkAnswerExist, checkAnswerer, async (ctx) => {
    await del(ctx)
})

module.exports = router