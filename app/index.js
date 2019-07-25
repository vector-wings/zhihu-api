const Koa = require('koa')
const Router = require('koa-router')
// 只支持 json 和 form 两种请求体，后期需要使用 koa-body 替换
// const bodyparser = require('koa-bodyparser') 
const koaBody = require('koa-body')
// 使用 koa-static 生成静态文件地址
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const path = require('path')
const app = new Koa()
const routing = require('./routes')
const { connectionStr } = require('./config')

// 链接数据库
mongoose.connect(connectionStr, { useNewUrlParser: true }, () => {
    console.log('MongoDB 连接成功')
})
// 处理连接错误
mongoose.connection.on('error', () => {
    console.error
})
// 使用请求处理中间件
app.use(error({
    postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : {stack, ...rest}
}))

// 手动编写请求处理中间件
// app.use(async (ctx, next) => {
//     try {
//         await next();
//     } catch (err) {
//         ctx.status = err.status || err.statusCode || 500
//         ctx.body = {
//             message: err.message
//         }
//     }
// })

// 路由分层
// app.use(bodyparser()) 
// 使用 koaBody 替换 bodyparser，可以支持请求更多格式
app.use(koaBody({
    multipart: true, // 表示支持文件格式
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'), // 设置文件上传目录
        keepExtensions: true // 保持文件拓展名
    }
}))
// 使用 koaStatic 生成静态链接
app.use(koaStatic(path.join(__dirname, 'public')))
app.use(parameter(app)) 
routing(app)

// const router = new Router()
// const usersRouter = new Router({prefix: '/users'}) // 指定路由前缀

// RESTful API 最佳实践
// app.use(bodyparser()) // koa-router 不支持 body 解析，需要使用 koa-bodyparser 进行解析
// app.use(router.routes())
// app.use(usersRouter.routes())
// app.use(usersRouter.allowedMethods())

// const db = [{name: '李雷'}]

// router.get('/', (ctx) => {
//     ctx.body = '<h1>主页</h1>'
// })

// // 获取用户列表
// usersRouter.get('/', (ctx) => {
//     // 设置响应头
//     ctx.set('Allow', 'GET, POST')
//     ctx.body = db
// })

// // 新增用户
// usersRouter.post('/', (ctx) => {
//     // 从请求体中获取用户
//     db.push(ctx.request.body);
//     ctx.body = ctx.request.body
// })

// // 获取特定用户
// usersRouter.get('/:id', (ctx) => {
//     ctx.body = db[ctx.params.id * 1]
// })

// // 修改用户，倾向于整体替换
// usersRouter.put('/:id', (ctx) => {
//     db[ctx.params.id * 1] = ctx.request.body
//     ctx.body = ctx.request.body
// })

// // 删除用户
// usersRouter.delete('/:id', (ctx) => {
//     db.splice(ctx.params.id * 1, 1)
//     ctx.status = 204
// })

// 自定义鉴权中间价
// const auth = async (ctx, next) => {
//     if (ctx.url !== '/users') {
//         ctx.throw(401)
//     }
//     await next()
// }

// 使用 koa-router
// app.use(router.routes())
// app.use(usersRouter.routes())
// app.use(usersRouter.allowedMethods()) // 响应客户端 options 请求，告诉客户端服务端所支持的请求方法

// router.get('/', (ctx) => {
//     ctx.body = '主页'
// })

// // 多中间件用法，auth 在此处作为一个中间件，可加可不加
// usersRouter.get('/', auth, (ctx) => {
//     ctx.body = '用户列表'
// })

// usersRouter.post('/', auth, (ctx) => {
//     ctx.body = '创建用户'
// })

// usersRouter.get('/:id', auth, (ctx) => {
//     ctx.body = `用户id：${ctx.params.id}`
// })

// 自定义路由中间件
// app.use(async (ctx) => {
//     if (ctx.url === '/') {
//         ctx.body = '主页'
//     } else if (ctx.url === '/users') {
//         if (ctx.method === 'GET') {
//             ctx.body = '用户列表'
//         } else if (ctx.method === 'POST') {
//             ctx.body = '创建用户'
//         } else {
//             ctx.status = 405
//         }
//     } else if (ctx.url.match(/\/users\/\w+/)) {
//         // 解析 URL 上的参数
//         const userId = ctx.url.match(/\/users\/(\w+)/)[1]
//         ctx.body = `这是用户id: ${userId}`
//     } else {
//         ctx.status = 404
//     }
// })


// 洋葱模型示例
// app.use(async (ctx, next) => {
//     console.log(1)
//     await next()
//     console.log(2)
//     ctx.body = 'Hello World Zhihu API' 
// })

// app.use(async (ctx, next) => {
//     console.log(3)
//     await next()
//     console.log(4)
// })

// app.use(async (ctx) => {
//     console.log(5)
// })

app.listen(3000, () => {
    console.log('start on port 3000')
})