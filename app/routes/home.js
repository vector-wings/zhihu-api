const Router = require('koa-router')
const router = new Router()
const { index, upload, captcha } = require('../controllers/home')

router.get('/', index)

// 获取验证码
router.get('/captcha', captcha)

// 上传文件
router.post('/upload', upload)

module.exports = router