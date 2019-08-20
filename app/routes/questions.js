const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/questions'})
const { 
    find, 
    findById, 
    create, 
    update,
    delete: del,
    checkQuestionExist,
    checkQuestioner,
} = require('../controllers/questions')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', async (ctx) => {
    await find(ctx)
})

router.post('/', auth, async (ctx) => {
    await create(ctx)
})

router.get('/:id', checkQuestionExist, async (ctx) => {
    await findById(ctx)
})

router.patch('/:id', auth, checkQuestionExist, checkQuestioner, async (ctx) => {
    await update(ctx)
})

router.delete('/:id', auth, checkQuestionExist, checkQuestioner, async (ctx) => {
    await del(ctx)
})

module.exports = router