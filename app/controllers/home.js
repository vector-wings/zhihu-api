const svgCaptcha = require('svg-captcha')
const path = require('path')

class HomeCtl {
    index(ctx) {
        ctx.body = '<h1>主页</h1>'
    }

    // 上传文件
    upload(ctx) {
        const file = ctx.request.files.file
        const basename = path.basename(file.path)

        ctx.body = {
            url: `${ctx.origin}/uploads/${basename}` 
        }
    }

    captcha(ctx) {
        // 生成验证码
        const imgCaptcha = svgCaptcha.create({
            inverse: false,
            fontSize: 36,
            noise: 2,
            width: 80,
            height: 30
        })

        let img = imgCaptcha.data // 验证码
        let text = imgCaptcha.text.toLowerCase() // 验证码字符，忽略大小写
        ctx.type = 'html'
        ctx.body = `${img}<br><a href="javascript: window.location.reload();">${'重新获取'}</a>`
    }
}

module.exports = new HomeCtl()