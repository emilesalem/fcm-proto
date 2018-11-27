module.exports = {
    start
}

const {of} = require('rxjs')

function start (ch) {
    of('').pipe(
        mergeMap(() => {
            of('').pipe(
                delay(randomDelay()),
                tap(() => ch.publish('FCM.exchange', 'fcm', Buffer.from(JSON.parse(randomType()))))
            )
        }),
        repeat()
    )
}

function randomType(){
    return {
        type: `TYPE${Math.ceil(Math.random() * 3)}`
    }
}

function randomDelay(){
    return Math.floor(Math.random() * 1000)
}