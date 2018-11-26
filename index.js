const amqp = require('./amqp')
const log = require('./log')
const fcm = require('./fcm')
const { tap, switchMap } = require('rxjs/operators')
const Koa = require('koa')
const router = require('./router')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const producer = require('./producer')

amqp.channelStream()
    .pipe(
        switchMap(amqp.assert),
        tap(ch => producer.start(ch)),
        switchMap(ch => fcm.pipeline(ch, amqp.messageStream(ch)))
    )
    .subscribe({
        next: id => log.debug({ message_id: id }, ' FCM notifiation pushed'),
        error: err => log.error({ err: err.message, stack: err.stack }, 'error from pipeline'),
        complete: () => log.error('pipeline completed (should never complete)')
    })

const server = new Koa()

server.use(cors())
server.use(bodyParser())
server.use(router.routes())

server.listen(54321)
