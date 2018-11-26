
module.exports = {
    pipeline
}

const { of } = require('rxjs')
const { mergeMap, catchError } = require('rxjs/operators')
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
        mergeMap(msg => processMessage(ch, msg)),
        catchError(e => {
            log.error({ error: e.message, stack: e.stack }, 'fcm pipeline error')
            return of(e)
        })
    )
}

function processMessage (ch, msg) {
    return fcm.messaging()
        .send({
            notification: JSON.parse(msg.content.toString()),
            token: registrar.tokens[0]
        })
        .then(response => {
            ch.ack(msg)
            return response
        })
}

function init () {
    fcm.initializeApp({
        credential: fcm.credential.cert(serviceAccount)
    })
}
