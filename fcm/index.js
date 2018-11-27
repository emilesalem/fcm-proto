
module.exports = {
    pipeline
}
const {interval} = require('rxjs')
const { mergeMap, groupBy, reduce, window, map } = require('rxjs/operators')
const fcm = require('firebase-admin')
const serviceAccount = require('../fcm-service-account.json')
const registrar = require('../registration')
const log = require('../log').child({ module: 'fcm_pipeline' })
/*
    processor receives an AMQP channel and a stream of AMQP messages,
    it processes the messages to send them in batch to FCM and returns a stream of results.
    There are 3 types of messages mapped to 3 FCM topics
    each type of messages must be batched by 10 and sent at most every 10 seconds.
    messages go like this:
    {
        "type": 1,
        "userID": 1,
        "msg": 'hello there'
    }
*/
function pipeline (ch, msg$) {
    init()
    return msg$.pipe(
        window(interval(1000)),
        mergeMap(win$ => win$.pipe(
            map(wrap),
            groupBy(msg => msg.type),
            mergeMap(g => batchProcess(g, ch))
        ))
    )
}

function wrap(msg){
    try {
        const content = JSON.parse(msg.content.toString())
        return {
            type: content.type,
            source: msg
        }
    } catch (err) {
        log.error({ err }, 'message process error')
        ch.nack(msg, false, false)
        return Promise.resolve(err)
    }
}

function batchProcess(group$, ch){
    return group$.pipe(
        reduce((acc, curr, i) => {
            return {
                count: i
            } 
        }),
        mergeMap(batch => processBatch(ch, batch))
    )
}

function processBatch (ch, batch) {
    const token = registrar.tokens[0]
    log.debug({ token }, 'FCM worker token')
    try {
        const fcmPayload = {
            notification: {
                body:`${batch.count}`,
                title: 'TEST'
            },
            // comment token or topic to test individual or topic delivery
            token
        //    topic: 'test'
        }
        return fcm.messaging()
            .send(fcmPayload)
            .then(response => {
                ch.ack(msg)
                return response
            })
    } catch (err) {
        log.error({ err }, 'message process error')
        ch.nack(msg, false, false)
        return Promise.resolve(err)
    }
}

function processMessage (ch, msg) {
    const token = registrar.tokens[0]
    log.debug({ token }, 'FCM worker token')
    try {
        const fcmPayload = {
            notification: JSON.parse(msg.content.toString()),
            // comment token or topic to test individual or topic delivery
            // token
            topic: 'test'
        }
        return fcm.messaging()
            .send(fcmPayload)
            .then(response => {
                ch.ack(msg)
                return response
            })
    } catch (err) {
        log.error({ err }, 'message process error')
        ch.nack(msg, false, false)
        return Promise.resolve(err)
    }
}

function init () {
    fcm.initializeApp({
        credential: fcm.credential.cert(serviceAccount)
    })
}
