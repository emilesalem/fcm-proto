const Router = require('koa-router')
const log = require('../log').child({ module: 'routes/registration' })
const registrar = require('../registration')

const router = new Router()

router.post('/register', ctx => {
    const token = ctx.request.body.token
    log.info({ fcmToken: token }, 'registering')
    registrar.register(token)
    ctx.body = 'ok'
})

module.exports = router
