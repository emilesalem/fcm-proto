
module.exports = {
    pipeline
}

const { mergeMap } = require('rxjs/operators')
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
        mergeMap(msg => processMessage(ch, msg))
    )
}

function processMessage (ch, msg) {
    const token = registrar.tokens[0]
    log.debug({ token }, 'FCM worker token')
    try {
        const messageContent = JSON.parse(msg.content.toString())
        return fcm.messaging()
            .send({
                notification: messageContent,
                token
            }).then(response => {
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
